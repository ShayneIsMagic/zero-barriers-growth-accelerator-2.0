function getBearerToken(value) {
  if (!value || typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed.toLowerCase().startsWith('bearer ')) return '';
  return trimmed.slice(7).trim();
}

function isAuthorized(req) {
  const proxyApiKey = process.env.PROXY_API_KEY || '';
  if (!proxyApiKey) return true;
  const authHeader = req.headers.authorization || '';
  const token = getBearerToken(authHeader);
  return token === proxyApiKey;
}

function getUpstreamAuthHeader() {
  const upstreamApiKey = process.env.UPSTREAM_OLLAMA_API_KEY || '';
  const scheme = process.env.UPSTREAM_OLLAMA_AUTH_SCHEME || 'Bearer';
  if (!upstreamApiKey) return {};
  return { Authorization: `${scheme} ${upstreamApiKey}` };
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const upstreamUrl = process.env.UPSTREAM_OLLAMA_URL || '';
  if (!upstreamUrl) {
    return res.status(500).json({ error: 'UPSTREAM_OLLAMA_URL is not configured' });
  }

  try {
    const response = await fetch(`${upstreamUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getUpstreamAuthHeader(),
      },
      body: JSON.stringify(req.body || {}),
    });
    const text = await response.text();
    res.status(response.status);
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
    return res.send(text);
  } catch (error) {
    return res.status(502).json({
      error: 'Upstream Ollama unreachable',
      details: error instanceof Error ? error.message : 'unknown error',
    });
  }
};
