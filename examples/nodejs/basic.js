/**
 * Solve NetEase Yidun with Capzy — minimal Node.js example.
 *
 * Cost:   from $0.001 per solve (flat)
 * Speed:  ~8 seconds median
 *
 * Run with (Node 18+):
 *   export CAPZY_KEY="capzy_xxxxxxxxxxxxxxxxxxxxxxxx"
 *   node basic.js
 *
 * Uses the built-in global `fetch` — no dependencies, no npm install.
 */

const API_BASE = "https://api.capzy.ai";
const CAPZY_KEY = process.env.CAPZY_KEY;

async function postJson(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function solve() {
  // 1) Create the task.
  const created = await postJson("/createTask", {
    clientKey: CAPZY_KEY,
    task: {
      type:       "YidunSliderTaskProxyLess",
      websiteURL: "https://dun.163.com/trial/jigsaw",
      // The Yidun captchaId passed to initNECaptcha({captchaId: ...}) on the
      // target page. Extract per-render — don't cache.
      websiteKey: "5a0e2d04ffa44caba3f740e6a8b0fa84",
      // Recent desktop Chrome UA. The token Yidun issues is bound to this
      // UA, so replay the SAME UA when you submit the token.
      userAgent:  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
                  "AppleWebKit/537.36 (KHTML, like Gecko) " +
                  "Chrome/131.0.0.0 Safari/537.36",
    },
  });
  if (created.errorId) {
    throw new Error(`createTask: ${created.errorCode} — ${created.errorDescription}`);
  }
  const taskId = created.taskId;
  console.log("created task", taskId);

  // 2) Poll until ready.
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    const result = await postJson("/getTaskResult", {
      clientKey: CAPZY_KEY,
      taskId,
    });
    if (result.errorId) {
      throw new Error(`getTaskResult: ${result.errorCode} — ${result.errorDescription}`);
    }
    if (result.status === "ready") return result.solution;
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error("solve took longer than 120s");
}

(async () => {
  const solution = await solve();
  console.log("solution:", solution);
  // ─── How to use the result ──────────────────────────────────
  // Submit `solution.token` to the target site's backend (usually in the
  // field named `NECaptchaValidate`). Pair it with the exact
  // `solution.userAgent` value as the User-Agent header — Yidun's
  // server-side check rejects on UA mismatch.
  // `solution.validate` is a legacy alias for `solution.token` (same
  // string) for clients integrated against the older shape.
})();
