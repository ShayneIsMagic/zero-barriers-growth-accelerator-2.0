# Zero Barriers Ollama Proxy

This sub-project is deployed as a separate Vercel project:

- Project name: `zero-barriers-growth-accelerator-ollama`
- Purpose: secure proxy for Ollama API (`/api/tags`, `/api/generate`)

## Required environment variables

- `UPSTREAM_OLLAMA_URL` (required) — remote reachable Ollama host URL
- `PROXY_API_KEY` (optional but recommended) — token required from callers
- `UPSTREAM_OLLAMA_API_KEY` (optional) — token sent from proxy to upstream
- `UPSTREAM_OLLAMA_AUTH_SCHEME` (optional, default `Bearer`)

## App integration

Set main app env:

- `OLLAMA_BASE_URL=https://zero-barriers-growth-accelerator-ollama.vercel.app`
- `OLLAMA_API_KEY=<same as PROXY_API_KEY>`
