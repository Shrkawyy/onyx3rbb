# JaxxV6

JaxxV6 is a GitHub Pages-hosted Tampermonkey build of the custom Senpa client. The userscript runs at `https://senpa.io/web/`, loads the static client from GitHub Pages, and connects directly to the current Senpa WebSocket endpoints. Release `6.1.11` includes the name-display compatibility fix for the current Senpa `v4.0.0` client: player names are no longer truncated by the old repeated-character sanitizer, while CR/LF control characters are removed before rendering.

## Release 6.1.11

The current official tracker reports the FFA server as `eu1.senpa.io:7101` (`Nemesis`) with protocol/client version `4.0.0`. This release keeps the existing direct-connection design and updates only name normalization and cache-busting metadata.

## Publish

1. Use the `t3st` repository under the `Shrkawyy` account.
2. Upload every file and folder in this directory to the repository root.
3. In GitHub, open **Settings → Pages**.
4. Choose **Deploy from a branch**, then select **main** and **/(root)**.
5. Wait for `https://shrkawyy.github.io/t3st/` to become available.

If the GitHub username or repository name changes, update `DEFAULT_BASE_URL`, `@updateURL`, `@downloadURL`, `@connect`, and `@namespace` in `jaxxv6.user.js`.

## Install

Open `https://shrkawyy.github.io/t3st/` and click **Install Tampermonkey script**. Then visit `https://senpa.io/web/`.

## Important

- Do not deploy the old `server.js`, `api/game-socket.js`, or `vercel.json` files. This build does not proxy the game WebSocket.
- Do not open `client.html` directly; it is loaded by the userscript.
- Browser data, including the client device ID and `senpaio:session`, belongs to the `senpa.io` origin in this version. A key previously bound on another origin may not be reusable. Do not publish private keys or session tokens in the repository.
- The authentication fix loads Cloudflare Turnstile from its official origin and asks the user to complete the challenge. It does not fabricate tokens or use third-party CAPTCHA-solving services.
- The account panel opens Senpa's current OAuth endpoints for Discord and Facebook. Complete login in the popup and return to the game tab.
- Only use this client in ways allowed by Senpa's rules.

## Files to upload

Upload the full contents of this directory, including the `assets` folder, `bundle.wasm`, `client.html`, `auth-session-bridge.js`, `auth-bridge.js`, `index.html`, and `jaxxv6.user.js`. The patched `bundle.js` must be uploaded as well.
