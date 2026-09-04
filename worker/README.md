# Court paper analysis Worker

This Worker keeps the OpenAI API key away from the GitHub Pages frontend.

1. Run `npm install` inside `worker/`.
2. Authenticate with Cloudflare using `npx wrangler login`.
3. Add the secret using `npx wrangler secret put OPENAI_API_KEY`.
4. Review `ALLOWED_ORIGINS` in `wrangler.toml`.
5. Deploy using `npm run deploy`.
6. Put the resulting `/` Worker URL in `assets/runtime-config.js` as `analysisEndpoint`.

The endpoint accepts one multipart field named `paper` plus `language` (`en`, `as`, or `hi`). Files are limited to PDF, JPG, or PNG and 10 MB. The Worker requests a strict structured result and sets `store: false`.
