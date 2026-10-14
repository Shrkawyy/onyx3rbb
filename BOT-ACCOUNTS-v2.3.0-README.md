# ONYX Bot Accounts v2.3.0 — login separation + diagnostics

## Exactly what is separate

- The existing `SENPA AUTH` login is the **main gameplay account**, unchanged.
- The `BOT ACCOUNTS` tab in the Onyx `GAME BOTS` panel contains **nine bot-only login slots**, totaling ten slots including the main gameplay login.
- Each bot-only login opens the official Facebook/Discord Senpa OAuth endpoint and is accepted **only after `/account/` returns HTTP 200** for that token.
- Bot-only OAuth responses are routed to the chosen bot slot (rather than the primary `senpaio:session` token). Tokens for bot accounts live in **page memory only**: reload requires logging them in again. They are not saved to Vercel, GitHub, localStorage or the exported JSON logs.
- A single manual `Connect` for a bot slot requests **one connection for up to two player slots**. This is a request only, not a guarantee the game server allows it. Auto-reconnect on rejected sessions is intentionally disabled.

## Logs (inside bot panel)

Open `GAME BOTS > CONSOLE` for bot logs. Use `Export JSON` to capture `AUTH_STARTED`, `AUTH_VERIFIED`, `AUTH_REJECTED`, `PRIMARY_SESSION_WARNING`, `CONNECT_REQUEST`, `CODEC_START`, `WS_OPEN`, `READY`, `SPAWN_REQUEST`, `SPAWN_TIMEOUT`, `CLOSE`, `ERROR`, and `TIMEOUT`. Raw JWTs, bearer headers, passwords, and WebSocket packet bodies are not exported.

**Interpretations are diagnostic, not proof:**
- `401`: missing, expired or invalid session is a common cause.
- `403`: server forbids the request; this does NOT by itself prove a ban.
- `4406`: rejected game connection/session, possibly policy conflict, stale token, or other server rule.
- `4101`: possible server restriction; only official support can establish an account ban.
- A message about `PRIMARY_SESSION_WARNING` after logging in a bot indicates the gameplay account failed its own server-side verification.

## Installation

1. Upload the contents of `senpabots-main` to the **root** of the GitHub repository used by your Vercel project (with `index.html`, `vercel.json`, `onyx-bot-accounts.js`, and `onyx-bots.js` alongside each other).
2. Redeploy the Vercel project; set Framework Preset to **Other** and root directory to the repository root.
3. If you launch ONYX from Vercel directly, open your project URL and use the panel.
4. If you use Tampermonkey, replace the previous `kateronyx.user.js` with the new version **2.3.0**. It fetches the account manager and bot-panel JS from its `DEFAULT_BASE_URL` (`https://senpabots.vercel.app/` unless you edited it or set `kateronyx:base-url`). **Make this match your actual Vercel deployment.**
5. Disable duplicate ONYX/EON Tampermonkey userscripts while testing, and perform one bot-account login and one connection first. Open `GAME BOTS > CONSOLE` if it fails.

## Server restrictions

This patch **does not and cannot override** Senpa's concurrent-account, server-side authentication or bot-count rules. OAuth popups in one browser profile still share provider cookies; a new official login can invalidate a previous server-side session. Bot logins are separated in the ONYX client but **not guaranteed simultaneous on the Senpa server**.

All live protocol/server behavior requires a test inside the game; the local tests confirm code syntax and mocked OAuth message routing plus HTTP 200/403 verification behavior only.
