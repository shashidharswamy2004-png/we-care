<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/d0782000-1aec-46cf-b54d-087c4122f4ff

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Start the API server in one terminal:
   `npm run server`
4. Start the frontend in another terminal:
   `npm run dev`

The frontend uses the same-origin `/api` path by default. Vite proxies API requests to `http://localhost:4000` during development. When hosting the frontend and API on separate origins, set `VITE_API_BASE_URL` to the API's `/api` URL before building.
