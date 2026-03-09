/**
 * Puppeteer Framework Evidence Protocol
 *
 * Normalizes scraped page language into evidence streams used by framework
 * assessment prompts. This keeps analysis focused on brand messaging signals
 * (CTAs, headlines, testimonials, promises, mission language, etc.).
 */

export interface EvidenceSelectors {
  cta: string[];
  headline: string[];
  testimonial: string[];
  promise: string[];
  purpose: string[];
  feature: string[];
  image: string[];
  navigation: string[];
  stats: string[];
}

export const PUPPETEER_EVIDENCE_SELECTORS: EvidenceSelectors = {
  cta: [
    'button',
    'a[class*="btn"]',
    'a[class*="cta"]',
    'a[class*="button"]',
    '[class*="cta"]',
    '[class*="call-to-action"]',
    'a[href*="signup"]',
    'a[href*="get-started"]',
    'a[href*="start"]',
    'a[href*="join"]',
    'a[href*="try"]',
    'a[href*="demo"]',
    'a[href*="contact"]',
    'form button[type="submit"]',
    '[data-cta]',
    'input[type="submit"]',
  ],
  headline: ['h1', 'h2', 'h3', 'h4'],
  testimonial: [
    '[class*="testimonial"]',
    '[class*="review"]',
    '[class*="quote"]',
    '[class*="case-study"]',
    '[class*="social-proof"]',
    'blockquote',
    '[class*="customer"]',
  ],
  promise: [
    '[class*="guarantee"]',
    '[class*="promise"]',
    '[class*="commitment"]',
    '[class*="pledge"]',
    '[class*="trust"]',
  ],
  purpose: [
    '[class*="mission"]',
    '[class*="vision"]',
    '[class*="values"]',
    '[class*="purpose"]',
    '[class*="manifesto"]',
  ],
  feature: [
    '[class*="feature"]',
    '[class*="benefit"]',
    '[class*="value-prop"]',
    '[class*="highlight"]',
    'ul > li',
    '[class*="capability"]',
  ],
  image: ['img[alt]'],
  navigation: ['nav a', 'header a', '[class*="nav"] a', '[class*="menu"] a'],
  stats: [
    '[class*="stat"]',
    '[class*="metric"]',
    '[class*="number"]',
    '[class*="counter"]',
  ],
};

interface HeadingMap {
  h1?: string[];
  h2?: string[];
  h3?: string[];
}

interface ExistingDataShape {
  cleanText?: string;
  headings?: HeadingMap;
  content?: {
    links?: Array<{ text?: string }>;
    buttons?: Array<{ text?: string; ariaLabel?: string }>;
    images?: Array<{ alt?: string }>;
  };
  seo?: {
    imageAltTexts?: string[];
  };
}

export interface PuppeteerEvidencePackage {
  streams: {
    ctas: string[];
    headlines: string[];
    testimonials: string[];
    promises: string[];
    purposeLanguage: string[];
    functionalClaims: string[];
    imageAltSignals: string[];
    navigationLabels: string[];
  };
  protocolVersion: '1.0';
  source: 'puppeteer-language-protocol';
}

function toSentences(text: string): string[] {
  return text
    .split(/[\n\r]+|(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function uniqueNonEmpty(values: string[], limit: number): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const normalized = value.replace(/\s+/g, ' ').trim();
    if (!normalized) continue;
    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(normalized);
    if (result.length >= limit) break;
  }
  return result;
}

function pickMatchingSentences(
  sentences: string[],
  patterns: RegExp[],
  limit: number
): string[] {
  return uniqueNonEmpty(
    sentences.filter((line) => patterns.some((pattern) => pattern.test(line))),
    limit
  );
}

export function buildPuppeteerEvidencePackage(
  existingData: ExistingDataShape
): PuppeteerEvidencePackage {
  const text = existingData.cleanText || '';
  const sentences = toSentences(text);

  const rawHeadlines = [
    ...(existingData.headings?.h1 || []),
    ...(existingData.headings?.h2 || []),
    ...(existingData.headings?.h3 || []),
  ];

  const linkTexts = (existingData.content?.links || [])
    .map((item) => item.text || '')
    .filter(Boolean);

  const buttonTexts = (existingData.content?.buttons || [])
    .flatMap((item) => [item.text || '', item.ariaLabel || ''])
    .filter(Boolean);

  const ctaFromText = pickMatchingSentences(
    sentences,
    [
      /\b(get|start|join|book|claim|schedule|try|download|contact|learn|discover|explore|apply|buy|subscribe)\b/i,
      /\b(click here|see how|learn more|get started|start now)\b/i,
    ],
    40
  );

  const testimonialSignals = pickMatchingSentences(
    sentences,
    [
      /\b(testimonial|review|customer|client|case study|success story)\b/i,
      /["'].{10,}["']/,
      /\b(they helped|we achieved|we saw|our team|our business)\b/i,
    ],
    25
  );

  const promiseSignals = pickMatchingSentences(
    sentences,
    [
      /\b(guarantee|promise|we will|you will|risk[- ]free|money[- ]back|no[- ]risk|secure|safe)\b/i,
    ],
    25
  );

  const purposeSignals = pickMatchingSentences(
    sentences,
    [/\b(our mission|our purpose|we believe|why we|vision|values|manifesto)\b/i],
    20
  );

  const functionalSignals = pickMatchingSentences(
    sentences,
    [
      /\b(save(s)? time|faster|simple|easy|reduce(s|d)? cost|reduce(s|d)? risk|integrate(s|d)?|connect(s|ed)?|quality|scalable|innovation)\b/i,
    ],
    35
  );

  const imageAltSignals = uniqueNonEmpty(
    [
      ...((existingData.content?.images || []).map((img) => img.alt || '') || []),
      ...((existingData.seo?.imageAltTexts || []).map((alt) => alt || '') || []),
    ],
    30
  );

  return {
    streams: {
      ctas: uniqueNonEmpty([...buttonTexts, ...linkTexts, ...ctaFromText], 50),
      headlines: uniqueNonEmpty(rawHeadlines, 40),
      testimonials: testimonialSignals,
      promises: promiseSignals,
      purposeLanguage: purposeSignals,
      functionalClaims: functionalSignals,
      imageAltSignals,
      navigationLabels: uniqueNonEmpty(linkTexts, 40),
    },
    protocolVersion: '1.0',
    source: 'puppeteer-language-protocol',
  };
}

export function formatEvidenceForPrompt(
  evidence: PuppeteerEvidencePackage
): string {
  const section = (title: string, items: string[]): string =>
    `${title}:\n${items.length > 0 ? items.map((item) => `- ${item}`).join('\n') : '- Not found'}`;

  return [
    '=== PUPPETEER EVIDENCE STREAMS (PROTOCOL v1.0) ===',
    section('CTA Inventory', evidence.streams.ctas.slice(0, 15)),
    section('Headline Sequence (H1-H3)', evidence.streams.headlines.slice(0, 15)),
    section('Testimonial/Review Signals', evidence.streams.testimonials.slice(0, 10)),
    section('Promise/Guarantee Signals', evidence.streams.promises.slice(0, 10)),
    section('Mission/Purpose Language', evidence.streams.purposeLanguage.slice(0, 10)),
    section('Functional Claims', evidence.streams.functionalClaims.slice(0, 15)),
    section('Image Alt Signals', evidence.streams.imageAltSignals.slice(0, 10)),
    section('Navigation Labels', evidence.streams.navigationLabels.slice(0, 10)),
    '=== END PUPPETEER EVIDENCE STREAMS ===',
  ].join('\n\n');
}
