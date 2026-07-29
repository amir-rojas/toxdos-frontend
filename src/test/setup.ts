import '@testing-library/jest-dom/vitest'

// Node 20+ ships an experimental global `localStorage` that is undefined unless the
// process is started with `--localstorage-file`, and it shadows jsdom's real
// implementation for bare `localStorage` references (e.g. shared/store/auth.store.ts
// reads `localStorage.getItem(...)` at module scope). Polyfill with a deterministic
// in-memory Storage so component tests that touch the auth store don't crash.
class MemoryStorage implements Storage {
  private store = new Map<string, string>()

  get length(): number {
    return this.store.size
  }

  clear(): void {
    this.store.clear()
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null
  }

  removeItem(key: string): void {
    this.store.delete(key)
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value))
  }
}

Object.defineProperty(globalThis, 'localStorage', {
  value: new MemoryStorage(),
  writable: true,
  configurable: true,
})

// jsdom does not implement window.matchMedia — polyfill a no-op version so hooks
// like src/hooks/use-mobile.ts (used by the sidebar) don't throw when mounted.
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }) as unknown as MediaQueryList
}
