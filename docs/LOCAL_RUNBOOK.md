## Local Runbook (Ollama-First)

1. Open terminal A: `cd ~/zero-barriers-growth-accelerator-2.0/zero-barriers-growth-accelerator-2.0`
2. Start Ollama: `ollama serve`
3. In terminal B, verify model: `ollama list` and confirm `llama3.1:8b` exists (or run `ollama pull llama3.1:8b`)
4. Set `.env.local` minimum values: `AI_PROVIDER=ollama`, `OLLAMA_BASE_URL=http://127.0.0.1:11434`, `OLLAMA_MODEL=llama3.1:8b`
5. Optional stability values: `OLLAMA_KEEP_ALIVE=6h` and `OLLAMA_NUM_PREDICT=1200`
6. Start app from project root: `npm run dev`
7. If port collision occurs, run: `npx next dev --hostname 127.0.0.1 --port 3010`
8. Open `http://localhost:3000/dashboard` (or your active port) and run one framework assessment
9. If you see "Ollama unreachable", re-check step 2 and confirm `OLLAMA_BASE_URL` points to `http://127.0.0.1:11434`
10. Keep Ollama and Next.js running during assessments; stop both only after report generation is complete
