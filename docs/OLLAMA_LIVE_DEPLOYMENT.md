# Ollama Live Deployment (Vercel + Remote Host)

This app can run Ollama in production only when `OLLAMA_BASE_URL` points to a
network-reachable host (not `localhost` / `127.0.0.1`).

## 1) Provision remote Ollama host

- Use a VM with enough RAM for your model (`llama3.1:8b` typically 16 GB+).
- Install Ollama and pull your model:

```bash
ollama serve
ollama pull llama3.1:8b
```

Run Ollama as a system service in production.

## 2) Put Ollama behind HTTPS + auth

Recommended: reverse proxy (Nginx/Caddy) with TLS and token auth.

Minimum requirements:
- HTTPS only
- Firewall allowlist (Vercel egress strategy or controlled public access)
- Auth token/header validation
- No raw public access to port `11434`

## 3) Configure Vercel environment variables

Set these in Vercel Project Settings (Production):

- `AI_PROVIDER=ollama`
- `AI_ALLOW_FALLBACKS=false` (or `true` if you want fallback providers)
- `OLLAMA_BASE_URL=https://<your-ollama-domain>`
- `OLLAMA_MODEL=llama3.1:8b`
- `OLLAMA_API_KEY=<strong-random-token>`
- `OLLAMA_AUTH_SCHEME=Bearer` (or your proxy scheme)

Never commit any of these values to git.

## 4) Verify deployment health

Check:

`/api/health`

Expected:
- `services.ollama.available: true`
- `services.ollama.configurationIssue: null`

If `configurationIssue` mentions localhost, your Vercel env is still pointing
to a local URL.

## 5) Secret handling checklist

- Store secrets only in Vercel environment variables and server host secrets.
- Rotate `OLLAMA_API_KEY` periodically.
- Do not print secrets in logs.
- Keep `.env.local` out of git.
- Use separate tokens for dev and production.
