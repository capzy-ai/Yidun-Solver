# Parameters reference — NetEase Yidun

Every field you can pass to `POST /createTask` for this task type. The
shape mirrors the industry standard (CapMonster/2Captcha/Capsolver) so
existing client libraries work with minimal changes.

## Envelope

```json
{
  "clientKey": "capzy_xxxxxxxxxxxxxxxxxxxxxxxx",
  "task": { ... }
}
```

| Field        | Required | Notes                                                       |
|--------------|:--------:|-------------------------------------------------------------|
| `clientKey`  | yes      | Your Capzy API key. Starts with `capzy_`. Find it at [capzy.ai/dashboard/api-keys](https://capzy.ai/dashboard/api-keys). |
| `task`       | yes      | The task object — see below.                                |

## Task object

### Required fields

| Field | Type | Required | Notes |
|-------|------|:--------:|-------|
| `type` | `string` | yes | `YidunSliderTaskProxyLess` (we route through our infra) or `YidunSliderTask` (your proxy). |
| `websiteURL` | `string` | yes | Full URL of the page where the Yidun widget loads. |
| `websiteKey` | `string` | yes | The Yidun `captchaId` — the 32-char hex string passed to `initNECaptcha({captchaId: …})` on the target page. Extract per-render; don't cache. |
| `userAgent` | `string` | yes | Recent desktop Chrome User-Agent. The solver pins outbound requests to this UA, and the token Yidun issues is bound to it — replay the SAME UA from your client when you submit. |

### Optional fields (enterprise / non-standard deployments)

You only need these if the target site is on Yidun's Enterprise / Business
plan, or hosts the captcha JS on a custom domain. For the public
`dun.163.com` deployment and most customer integrations they're not required.

| Field | Type | Required | Notes |
|-------|------|:--------:|-------|
| `yidunGetLib` | `string` | no | Full HTTPS URL of the captcha loader script (e.g. `https://your-cdn.example.com/captcha/b/v3/static/load.min.js`). Override when the page loads from somewhere other than `cstaticdun.126.net`. |
| `yidunApiServerSubdomain` | `string` | no | Custom Yidun API host (domain only, no scheme). Override when the page talks to something other than `c.dun.163.com` / `c-v6.dun.163.com`. |
| `challenge` | `string` | no | The `challenge` value Yidun's enterprise tier sends in its initial network calls. Capture from the target page's network tab. |
| `hcg` | `string` | no | The `hcg` value Yidun's enterprise tier sends. Capture alongside `challenge`. |
| `hct` | `integer` | no | The `hct` timestamp Yidun's enterprise tier sends (milliseconds). Capture alongside `challenge`. |

### Proxy fields (only for `YidunSliderTask`)

| Field | Type | Required | Notes |
|-------|------|:--------:|-------|
| `proxyType` | `string` | yes | `http`, `https`, `socks4`, `socks5`. |
| `proxyAddress` | `string` | yes | IP or hostname of your proxy. |
| `proxyPort` | `integer` | yes | Port number of your proxy. |
| `proxyLogin` | `string` | no | Omit if your proxy doesn't require auth. |
| `proxyPassword` | `string` | no | Omit if your proxy doesn't require auth. |

Yidun pins traffic by ASN/geography — a residential or static-ISP proxy
in China or a nearby region succeeds far more than a US datacenter IP.

## Response

### `POST /createTask` success

```json
{
  "errorId": 0,
  "taskId":  "12345"
}
```

### `POST /getTaskResult` while processing

```json
{
  "errorId": 0,
  "status":  "processing"
}
```

### `POST /getTaskResult` when ready

```json
{
  "errorId":  0,
  "status":   "ready",
  "solution": {
    "token":    "<long Yidun validate token, single-use>",
    "validate": "<same value as token — legacy alias>",
    "userAgent": "Mozilla/5.0 ..."
  }
}
```

The `solution` object contains:

| Field | Type | Notes |
|-------|------|-------|
| `token` | `string` | The Yidun validation token. Submit to the target site's backend for server-side verification. This is the industry-standard field name. |
| `validate` | `string` | Same value as `token`. Provided as an alias for clients that integrated against our legacy response shape — both fields always hold the same string. |
| `userAgent` | `string` | The exact User-Agent the solver used. Replay this when submitting the token, otherwise Yidun's server-side check rejects on UA mismatch. |

### How to use the solution

Submit `token` to the target site's backend in whatever field its API
expects — commonly `NECaptchaValidate` in a form post or JSON body. Pair
it with the `userAgent` we returned (set as the `User-Agent` header on
your submission).

### Error

```json
{
  "errorId":          1,
  "errorCode":        "ERROR_KEY_DOES_NOT_EXIST",
  "errorDescription": "Invalid API key"
}
```

`errorId` is `0` on success, `1` on any error. The `errorCode` is the
stable machine-readable identifier. Common codes:

- `ERROR_KEY_DOES_NOT_EXIST` — bad API key
- `ERROR_NO_BALANCE` — account balance below the cost of this task
- `ERROR_INVALID_PARAMS` — missing required field or malformed value
- `ERROR_MAX_TASKS_REACHED` — concurrent in-flight cap reached (default 30)
- `ERROR_RATE_LIMITED` — too many createTask calls per second
- `ERROR_TIMEOUT` — solve took longer than the cap (auto-refunded)
- `ERROR_CAPTCHA_UNSOLVABLE` — solver gave up (auto-refunded)

## Naming conventions

Field names are camelCase on the wire (`websiteURL`, `websiteKey`,
`proxyAddress`, `yidunGetLib`). Stick to that exactly when you build the
JSON.
