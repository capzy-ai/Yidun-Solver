<div align="center">

<img src="https://capzy.ai/capzy-logo.svg" alt="Capzy" width="220" />

# NetEase Yidun Solver

**Solve NetEase Yidun slider captchas. Few solvers support this.**

[![Solve cost](https://img.shields.io/badge/from-%240.001%20%2F%20solve-%23ff5d2a)](https://capzy.ai/pricing)
[![Speed](https://img.shields.io/badge/avg%20solve-~8%20seconds-%2322c55e)](https://capzy.ai/products/yidun)
[![Uptime](https://img.shields.io/badge/uptime-99.9%25-%2322c55e)](https://capzy.ai/status)
[![License: MIT](https://img.shields.io/badge/license-MIT-%23ff5d2a)](LICENSE)

[Live Demo](https://capzy.ai/products/yidun/demo) ·
[Get Free $0.10 Credit](https://capzy.ai/auth/register) ·
[Dashboard](https://capzy.ai/dashboard) ·
[Full Docs](https://capzy.ai/docs) ·
[Pricing](https://capzy.ai/pricing)

</div>

---

## What this repo is

Copy-pasteable examples for solving **NetEase Yidun** through the
[Capzy](https://capzy.ai) HTTP API — no SDK required. Pure curl, Python,
and Node.js using the raw API. Easy to read, easy to port, easy to audit.

## What is NetEase Yidun?

NetEase Yidun (网易易盾) is China's #2 captcha service after Tencent. Offers slider puzzles, click-in-order challenges, and icon selection. Most commercial captcha-solving services don't support Yidun — Capzy is one of the few that does.

## Why Capzy

- **From $0.001 per solve.** Flat pricing — no tiers, no retainer, no monthly minimum.
- **~8 seconds average solve.** Production-grade speed.
- **Drop-in compatible.** `createTask` / `getTaskResult` protocol. If your code already speaks the standard solver shape, swap the host to `https://api.capzy.ai`.
- **$0.10 in real credits on sign-up.** No card. 100 free test solves.

## Pricing

| Task type | When to use | Cost / solve |
|-----------|-------------|-------------:|
| `YidunSliderTaskProxyLess`             | Proxyless (Capzy supplies the IP) | **$0.001**   |
| `YidunSliderTask`                       | You supply the proxy              | **$0.001**   |

For consistency across the target site, use the proxy variant with the
**same proxy your session is already running through** — the solver
mints the token from that IP, so when you submit it back through the
same proxy everything looks consistent.

## 60-second quickstart

```bash
# 1. Sign up — gets you $0.10 in free credits (100 solves)
open https://capzy.ai/auth/register

# 2. Copy your API key from the dashboard
#    https://capzy.ai/dashboard/api-keys

# 3. Run any example
export CAPZY_KEY="capzy_..."
bash examples/curl/basic.sh
```

Minimal Python:

```python
import requests, time

KEY = "capzy_xxxxxxxxxxxxxxxxxxxxxxxx"

# 1) Create the task
created = requests.post("https://api.capzy.ai/createTask", json={
    "clientKey": KEY,
    "task": {
        "type": "YidunSliderTaskProxyLess",
        "websiteURL": "https://dun.163.com/trial/sense"
    },
}).json()
task_id = created["taskId"]

# 2) Poll until ready
while True:
    result = requests.post("https://api.capzy.ai/getTaskResult", json={
        "clientKey": KEY, "taskId": task_id,
    }).json()
    if result["status"] == "ready":
        break
    time.sleep(2)

print(result["solution"])
```

That's the whole protocol. The rest of this repo is just that, in every
language we could think of.

## Pick your language

| Language        | Example                                       |
|-----------------|-----------------------------------------------|
| **curl / bash** | [`examples/curl/basic.sh`](examples/curl/basic.sh)    |
| **Python**      | [`examples/python/basic.py`](examples/python/basic.py) |
| **Node.js**     | [`examples/nodejs/basic.js`](examples/nodejs/basic.js) |

See [`examples/README.md`](examples/README.md) for setup details.

## Request envelope

```json
{
  "clientKey": "capzy_xxxxxxxxxxxxxxxxxxxxxxxx",
  "task": {
    "type": "YidunSliderTaskProxyLess",
    "websiteURL": "https://dun.163.com/trial/sense"
  }
}
```

| Field | Type | Required | Notes |
|-------|------|:--------:|-------|
| `type` | `string` | yes | YidunSliderTaskProxyLess or YidunSliderTask |
| `websiteURL` | `string` | yes | Full URL of the page where Yidun loads |
| `websiteKey` | `string` | no | Optional — the captchaId from the Yidun dashboard (if you have it) |
| `proxyType` | `string` | no  | http | https | socks4 | socks5 (only for `YidunSliderTask`) |
| `proxyAddress` | `string` | no  | IP or hostname of your proxy (only for `YidunSliderTask`) |
| `proxyPort` | `integer` | no  | Port number of your proxy (only for `YidunSliderTask`) |
| `proxyLogin` | `string` | no  | Optional — omit if your proxy doesn't require auth (only for `YidunSliderTask`) |
| `proxyPassword` | `string` | no  | Optional — omit if your proxy doesn't require auth (only for `YidunSliderTask`) |

Full reference in [`docs/parameters.md`](docs/parameters.md).

## Response shape

When the task is ready (`status: "ready"`), `solution` contains:

| Field | Type | Notes |
|-------|------|-------|
| `validate` | `string` | The Yidun validation token. Submit to the site's backend for server-side verification. |

### How to use the result

Submit the `validate` token to the target site's backend in whatever field its API expects.

## Features

- Rare coverage — few competitors support Yidun
- OpenCV slider gap detection + human-like drag
- Captures the validate token directly from network responses

## FAQ

**Why don't other services support Yidun?** Yidun is primarily used in the Chinese market and Western captcha services usually focus on reCAPTCHA / hCaptcha / Turnstile. Capzy supports it as a competitive differentiator.

## What you'll need

- A Capzy API key — [sign up](https://capzy.ai/auth/register) (free, $0.10 credit).
- Network access to `https://api.capzy.ai`.

## Other captcha types

Capzy solves 25+ captcha types. Full catalog at
[capzy.ai/pricing](https://capzy.ai/pricing). Each type has its own
solver repo on [github.com/capzy-ai](https://github.com/capzy-ai).

## License

[MIT](LICENSE).

---

<div align="center">

**[Sign up for free credits →](https://capzy.ai/auth/register)**

Built by [Capzy](https://capzy.ai). Issues + PRs welcome.

</div>
