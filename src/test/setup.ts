import 'fake-indexeddb/auto';
import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';

// Some modules touch window at import time. Provide safe no-ops.
if (typeof window !== 'undefined') {
  if (!window.matchMedia) {
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })) as unknown as typeof window.matchMedia;
  }
}

// Reset modules between tests so Dexie re-creates a clean fake DB.
afterEach(async () => {
  vi.clearAllMocks();
});
