/*
  Client-side storage wrapper that prefers localforage (IndexedDB) and
  falls back to localStorage in browsers. Safe no-op on server.
*/

export interface ScrapedMetadata {
  url: string;
  title?: string;
  metaDescription?: string;
  wordCount?: number;
  extractedKeywords?: string[];
  headings?: string[];
  timestampIso: string;
}

export interface ScrapedContent {
  cleanText: string;
}

export interface ScrapeBundle {
  id: string; // e.g., `${url}::${timestampIso}`
  url: string;
  metadata: {
    existing: ScrapedMetadata;
    proposed?: ScrapedMetadata | null;
  };
  content: {
    existing: ScrapedContent;
    proposed?: ScrapedContent | null;
  };
}

export interface FrameworkResultEntry<T = unknown> {
  assessmentType: string; // e.g., 'b2c' | 'b2b' | 'golden_circle' | 'clifton_strengths' | 'unified'
  createdAtIso: string;
  data: T;
}

type LocalforageModule = {
  default: {
    getItem: (key: string) => Promise<unknown>;
    setItem: (key: string, value: unknown) => Promise<unknown>;
    removeItem: (key: string) => Promise<void>;
  };
};

const isBrowser = typeof window !== 'undefined';

async function getLocalforage(): Promise<LocalforageModule['default'] | null> {
  if (!isBrowser) return null;
  try {
    const mod = (await import('localforage')) as LocalforageModule;
    return mod.default;
  } catch (_) {
    return null;
  }
}

function localStorageGet<T>(key: string): T | null {
  if (!isBrowser) return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function localStorageSet<T>(key: string, value: T): void {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

const KEYS = {
  scrapeBundle: (id: string) => `zbg:scrape:${id}`,
  frameworkResults: (id: string) => `zbg:framework:${id}`,
  comprehensiveReport: (id: string) => `zbg:report:${id}`,
  index: 'zbg:index',
};

export const ClientStorage = {
  async listIds(): Promise<string[]> {
    if (!isBrowser) return [];
    const lf = await getLocalforage();
    if (lf) {
      const list = (await lf.getItem(KEYS.index)) as string[] | null;
      return Array.isArray(list) ? list : [];
    }
    const list = localStorageGet<string[]>(KEYS.index) || [];
    return list;
  },

  async addToIndex(id: string): Promise<void> {
    if (!isBrowser) return;
    const lf = await getLocalforage();
    if (lf) {
      const list = ((await lf.getItem(KEYS.index)) as string[] | null) || [];
      if (!list.includes(id)) {
        list.push(id);
        await lf.setItem(KEYS.index, list);
      }
      return;
    }
    const list = localStorageGet<string[]>(KEYS.index) || [];
    if (!list.includes(id)) {
      list.push(id);
      localStorageSet(KEYS.index, list);
    }
  },

  async saveScrapeBundle(bundle: ScrapeBundle): Promise<void> {
    if (!isBrowser) return;
    const key = KEYS.scrapeBundle(bundle.id);
    const lf = await getLocalforage();
    if (lf) {
      await lf.setItem(key, bundle);
      await this.addToIndex(bundle.id);
      return;
    }
    localStorageSet(key, bundle);
    await this.addToIndex(bundle.id);
  },

  async getScrapeBundle(id: string): Promise<ScrapeBundle | null> {
    if (!isBrowser) return null;
    const key = KEYS.scrapeBundle(id);
    const lf = await getLocalforage();
    if (lf) {
      const v = (await lf.getItem(key)) as ScrapeBundle | null;
      return v || null;
    }
    return localStorageGet<ScrapeBundle>(key);
  },

  async addFrameworkResult<T = unknown>(id: string, entry: FrameworkResultEntry<T>): Promise<void> {
    if (!isBrowser) return;
    const key = KEYS.frameworkResults(id);
    const lf = await getLocalforage();
    if (lf) {
      const existing = ((await lf.getItem(key)) as FrameworkResultEntry<T>[] | null) || [];
      existing.push(entry);
      await lf.setItem(key, existing);
      return;
    }
    const existing = localStorageGet<FrameworkResultEntry<T>[]>(key) || [];
    existing.push(entry);
    localStorageSet(key, existing);
  },

  async getFrameworkResults<T = unknown>(id: string): Promise<FrameworkResultEntry<T>[] | null> {
    if (!isBrowser) return null;
    const key = KEYS.frameworkResults(id);
    const lf = await getLocalforage();
    if (lf) {
      const v = (await lf.getItem(key)) as FrameworkResultEntry<T>[] | null;
      return v || null;
    }
    return localStorageGet<FrameworkResultEntry<T>[]>(key);
  },

  async saveComprehensiveReport<T = unknown>(id: string, report: T): Promise<void> {
    if (!isBrowser) return;
    const key = KEYS.comprehensiveReport(id);
    const lf = await getLocalforage();
    if (lf) {
      await lf.setItem(key, report);
      await this.addToIndex(id);
      return;
    }
    localStorageSet(key, report);
    await this.addToIndex(id);
  },

  async getComprehensiveReport<T = unknown>(id: string): Promise<T | null> {
    if (!isBrowser) return null;
    const key = KEYS.comprehensiveReport(id);
    const lf = await getLocalforage();
    if (lf) {
      const v = (await lf.getItem(key)) as T | null;
      return v || null;
    }
    return localStorageGet<T>(key);
  },
};


