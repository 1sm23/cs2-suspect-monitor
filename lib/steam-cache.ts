type CacheEntry = {
  data: any;
  timestamp: number;
  ttl: number;
};

class SteamCache {
  private cache = new Map<string, CacheEntry>();

  set(key: string, data: any, ttlSeconds: number = 300) {
    // 默认5分钟
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000,
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear() {
    this.cache.clear();
  }

  // 清理过期缓存
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // 获取缓存统计信息
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const steamCache = new SteamCache();

// 每5分钟清理一次过期缓存
if (typeof setInterval !== 'undefined') {
  setInterval(
    () => {
      steamCache.cleanup();
    },
    5 * 60 * 1000
  );
}
