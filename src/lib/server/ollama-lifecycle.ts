import 'server-only';

import { spawn } from 'node:child_process';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.1:8b';
const OLLAMA_IDLE_TIMEOUT_MS = Number(
  process.env.OLLAMA_IDLE_TIMEOUT_MS || 6 * 60 * 60 * 1000
);
const OLLAMA_AUTO_STOP_ON_IDLE = process.env.OLLAMA_AUTO_STOP_ON_IDLE !== 'false';

let idleTimer: NodeJS.Timeout | null = null;
let lastActivityAt = Date.now();

function isLocalOllama(): boolean {
  return (
    OLLAMA_BASE_URL.includes('127.0.0.1') || OLLAMA_BASE_URL.includes('localhost')
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function runCommand(
  command: string,
  args: string[],
  options: { detached?: boolean; stdio?: 'inherit' | 'ignore' } = {}
): Promise<boolean> {
  return new Promise((resolve) => {
    let resolved = false;
    const child = spawn(command, args, {
      detached: options.detached,
      stdio: options.stdio || 'ignore',
      env: process.env,
    });

    child.on('error', () => {
      if (!resolved) {
        resolved = true;
        resolve(false);
      }
    });

    child.on('spawn', () => {
      if (options.detached) {
        child.unref();
        if (!resolved) {
          resolved = true;
          resolve(true);
        }
      }
    });

    child.on('exit', (code) => {
      if (!resolved) {
        resolved = true;
        resolve(code === 0);
      }
    });
  });
}

async function isModelReady(): Promise<boolean> {
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { models?: Array<{ name?: string }> };
    const models = Array.isArray(data.models) ? data.models : [];
    const prefix = OLLAMA_MODEL.split(':')[0];
    return models.some(
      (item) =>
        typeof item?.name === 'string' &&
        (item.name === OLLAMA_MODEL || item.name.startsWith(prefix))
    );
  } catch {
    return false;
  }
}

async function ensureStarted(): Promise<void> {
  if (process.env.VERCEL === '1' || !isLocalOllama()) {
    return;
  }

  if (await isModelReady()) {
    return;
  }

  await runCommand('ollama', ['serve'], { detached: true });
  for (let i = 0; i < 12; i += 1) {
    await sleep(2000);
    if (await isModelReady()) {
      return;
    }
  }

  await runCommand('ollama', ['pull', OLLAMA_MODEL], { stdio: 'inherit' });
}

async function stopOnIdle(): Promise<void> {
  if (
    process.env.VERCEL === '1' ||
    !isLocalOllama() ||
    !OLLAMA_AUTO_STOP_ON_IDLE
  ) {
    return;
  }

  const idleMs = Date.now() - lastActivityAt;
  if (idleMs < OLLAMA_IDLE_TIMEOUT_MS) {
    return;
  }

  await runCommand('ollama', ['stop', OLLAMA_MODEL]);
  await runCommand('pkill', ['-f', 'ollama serve']);
}

export async function touchOllamaActivity(): Promise<void> {
  await ensureStarted();
  lastActivityAt = Date.now();

  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    void stopOnIdle();
  }, OLLAMA_IDLE_TIMEOUT_MS);
}

