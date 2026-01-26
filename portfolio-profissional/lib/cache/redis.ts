import Redis from 'ioredis';

class RedisCache {
  private redis: Redis | null = null;
  private isConnected = false;

  constructor() {
    this.connect();
  }

  private connect() {
    try {
      // Only connect if Redis URL is provided
      if (process.env.REDIS_URL) {
        this.redis = new Redis(process.env.REDIS_URL, {
          retryDelayOnFailover: 100,
          maxRetriesPerRequest: 3,
          lazyConnect: true,
        });

        this.redis.on('connect', () => {
          this.isConnected = true;
          console.log('Redis connected successfully');
        });

        this.redis.on('error', (error) => {
          this.isConnected = false;
          console.warn('Redis connection error:', error.message);
        });
      } else {
        console.log('Redis URL not provided, caching disabled');
      }
    } catch (error) {
      console.warn('Failed to initialize Redis:', error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.redis || !this.isConnected) {
      return null;
    }

    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.warn('Redis get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds = 3600): Promise<boolean> {
    if (!this.redis || !this.isConnected) {
      return false;
    }

    try {
      await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn('Redis set error:', error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.redis || !this.isConnected) {
      return false;
    }

    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      console.warn('Redis del error:', error);
      return false;
    }
  }

  async invalidatePattern(pattern: string): Promise<boolean> {
    if (!this.redis || !this.isConnected) {
      return false;
    }

    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      return true;
    } catch (error) {
      console.warn('Redis invalidatePattern error:', error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.redis || !this.isConnected) {
      return false;
    }

    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.warn('Redis exists error:', error);
      return false;
    }
  }

  isAvailable(): boolean {
    return this.redis !== null && this.isConnected;
  }

  async disconnect(): Promise<void> {
    if (this.redis) {
      await this.redis.disconnect();
      this.isConnected = false;
    }
  }
}

// Singleton instance
export const cache = new RedisCache();

// Cache key generators
export const CacheKeys = {
  portfolioData: (version?: number) => 
    version ? `portfolio:data:${version}` : 'portfolio:data:latest',
  
  dynamicModals: (type?: string) => 
    type ? `modals:${type}` : 'modals:all',
  
  mediaFiles: (category?: string) => 
    category ? `media:${category}` : 'media:all',
  
  auditLogs: (userId?: string, page = 1) => 
    userId ? `audit:${userId}:${page}` : `audit:all:${page}`,
  
  adminSettings: () => 'admin:settings',
  
  userSession: (userId: string) => `session:${userId}`,
  
  securityAlerts: () => 'security:alerts',
  
  backupList: () => 'backup:list',
  
  statistics: (type: string) => `stats:${type}`,
};

// Cache TTL constants (in seconds)
export const CacheTTL = {
  SHORT: 300,      // 5 minutes
  MEDIUM: 1800,    // 30 minutes
  LONG: 3600,      // 1 hour
  VERY_LONG: 86400, // 24 hours
};