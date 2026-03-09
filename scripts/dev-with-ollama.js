#!/usr/bin/env node

/**
 * Local dev bootstrap:
 * - loads .env.local
 * - verifies local Ollama availability
 * - attempts to start Ollama service if unreachable
 * - starts Next.js dev server
 */

const { spawn } = require('node:child_process');
const path = require('node:path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

const DEFAULT_OLLAMA_BASE_URL = 'http://127.0.0.1:11434';
const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || DEFAULT_OLLAMA_BASE_URL;
const ollamaModel = process.env.OLLAMA_MODEL || 'llama3.1:8b';
const skipOllamaCheck = process.env.SKIP_OLLAMA_CHECK === 'true';
const preflightOnly = process.env.DEV_PREFLIGHT_ONLY === 'true';
const autoPullModel = process.env.AUTO_PULL_OLLAMA_MODEL !== 'false';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isLocalOllamaUrl() {
  return (
    ollamaBaseUrl.includes('127.0.0.1') || ollamaBaseUrl.includes('localhost')
  );
}

function commandExists(command, args = ['--version']) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { stdio: 'ignore' });
    child.on('error', () => resolve(false));
    child.on('exit', () => resolve(true));
  });
}

async function checkOllama() {
  try {
    const response = await fetch(`${ollamaBaseUrl}/api/tags`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      return { ok: false, reason: `HTTP ${response.status}` };
    }
    const data = await response.json();
    const models = Array.isArray(data.models) ? data.models : [];
    const hasModel = models.some(
      (item) =>
        item &&
        typeof item.name === 'string' &&
        (item.name === ollamaModel || item.name.startsWith(ollamaModel.split(':')[0]))
    );
    return {
      ok: hasModel,
      reason: hasModel
        ? 'ready'
        : `model "${ollamaModel}" not found in Ollama`,
      availableModels: models
        .map((m) => (m && typeof m.name === 'string' ? m.name : ''))
        .filter(Boolean),
    };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : 'unknown error',
    };
  }
}

function tryStartLocalOllama() {
  if (!isLocalOllamaUrl()) {
    console.log(`ℹ️ OLLAMA_BASE_URL is remote (${ollamaBaseUrl}); skipping local auto-start.`);
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    const child = spawn('ollama', ['serve'], {
      detached: true,
      stdio: 'ignore',
    });
    child.on('error', (error) => {
      console.log(
        `⚠️ Could not start Ollama automatically: ${
          error instanceof Error ? error.message : 'unknown error'
        }`
      );
      resolve(false);
    });
    child.on('spawn', () => {
      child.unref();
      console.log('🚀 Attempted to start local Ollama service (`ollama serve`).');
      resolve(true);
    });
  });
}

function pullModelIfMissing(status) {
  if (
    !autoPullModel ||
    !isLocalOllamaUrl() ||
    !status ||
    typeof status.reason !== 'string' ||
    !status.reason.includes('not found in Ollama')
  ) {
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    console.log(`📥 Model "${ollamaModel}" not found. Pulling now...`);
    const pull = spawn('ollama', ['pull', ollamaModel], {
      stdio: 'inherit',
      env: process.env,
    });
    pull.on('error', () => resolve(false));
    pull.on('exit', (code) => resolve(code === 0));
  });
}

async function ensureOllamaReady() {
  if (skipOllamaCheck) {
    console.log('⏭️ SKIP_OLLAMA_CHECK=true, skipping Ollama preflight.');
    return;
  }

  console.log(`🔎 Checking Ollama at ${ollamaBaseUrl} (model: ${ollamaModel})...`);
  let status = await checkOllama();
  if (status.ok) {
    console.log('✅ Ollama is up and model is available.');
    return;
  }

  console.log(`⚠️ Ollama not ready: ${status.reason}`);
  const ollamaCommandAvailable = await commandExists('ollama');
  if (!ollamaCommandAvailable) {
    throw new Error(
      'Ollama CLI is not installed or not in PATH. Install from https://ollama.com/download'
    );
  }

  await tryStartLocalOllama();

  const maxAttempts = 30;
  let modelPullAttempted = false;
  for (let i = 0; i < maxAttempts; i += 1) {
    await sleep(2000);
    status = await checkOllama();
    if (status.ok) {
      console.log('✅ Ollama became ready.');
      return;
    }

    if (!modelPullAttempted && i >= 4) {
      modelPullAttempted = true;
      await pullModelIfMissing(status);
    }
  }

  const modelHint = status.availableModels?.length
    ? `Available models: ${status.availableModels.join(', ')}`
    : 'No model list available.';
  throw new Error(
    `Ollama is not ready at ${ollamaBaseUrl}. Reason: ${status.reason}. ${modelHint}`
  );
}

function startNextDev() {
  const child = spawn('next', ['dev'], {
    stdio: 'inherit',
    shell: true,
    env: process.env,
  });
  child.on('exit', (code) => {
    process.exit(code === null ? 1 : code);
  });
}

async function main() {
  try {
    await ensureOllamaReady();
    if (preflightOnly) {
      console.log(`✅ Preflight complete: Ollama ready at ${ollamaBaseUrl}`);
      process.exit(0);
    }
    startNextDev();
  } catch (error) {
    console.error(
      `❌ Dev bootstrap failed: ${
        error instanceof Error ? error.message : 'unknown error'
      }`
    );
    console.error(
      'If you want to bypass this check temporarily, run with SKIP_OLLAMA_CHECK=true.'
    );
    process.exit(1);
  }
}

main();
