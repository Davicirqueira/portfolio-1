import { cache, CacheKeys, CacheTTL } from './redis';

export class CacheService {
  // Portfolio data caching
  static async getPortfolioData(version?: number) {
    const key = CacheKeys.portfolioData(version);
    return await cache.get(key);
  }

  static async setPortfolioData(data: any, version?: number) {
    const key = CacheKeys.portfolioData(version);
    return await cache.set(key, data, CacheTTL.MEDIUM);
  }

  static async invalidatePortfolioData() {
    return await cache.invalidatePattern('portfolio:data:*');
  }

  // Dynamic modals caching
  static async getDynamicModals(type?: string) {
    const key = CacheKeys.dynamicModals(type);
    return await cache.get(key);
  }

  static async setDynamicModals(data: any, type?: string) {
    const key = CacheKeys.dynamicModals(type);
    return await cache.set(key, data, CacheTTL.LONG);
  }

  static async invalidateDynamicModals(type?: string) {
    if (type) {
      return await cache.del(CacheKeys.dynamicModals(type));
    }
    return await cache.invalidatePattern('modals:*');
  }

  // Media files caching
  static async getMediaFiles(category?: string) {
    const key = CacheKeys.mediaFiles(category);
    return await cache.get(key);
  }

  static async setMediaFiles(data: any, category?: string) {
    const key = CacheKeys.mediaFiles(category);
    return await cache.set(key, data, CacheTTL.LONG);
  }

  static async invalidateMediaFiles(category?: string) {
    if (category) {
      return await cache.del(CacheKeys.mediaFiles(category));
    }
    return await cache.invalidatePattern('media:*');
  }

  // Audit logs caching
  static async getAuditLogs(userId?: string, page = 1) {
    const key = CacheKeys.auditLogs(userId, page);
    return await cache.get(key);
  }

  static async setAuditLogs(data: any, userId?: string, page = 1) {
    const key = CacheKeys.auditLogs(userId, page);
    return await cache.set(key, data, CacheTTL.SHORT);
  }

  static async invalidateAuditLogs(userId?: string) {
    if (userId) {
      return await cache.invalidatePattern(`audit:${userId}:*`);
    }
    return await cache.invalidatePattern('audit:*');
  }

  // Admin settings caching
  static async getAdminSettings() {
    const key = CacheKeys.adminSettings();
    return await cache.get(key);
  }

  static async setAdminSettings(data: any) {
    const key = CacheKeys.adminSettings();
    return await cache.set(key, data, CacheTTL.VERY_LONG);
  }

  static async invalidateAdminSettings() {
    return await cache.del(CacheKeys.adminSettings());
  }

  // User session caching
  static async getUserSession(userId: string) {
    const key = CacheKeys.userSession(userId);
    return await cache.get(key);
  }

  static async setUserSession(userId: string, data: any) {
    const key = CacheKeys.userSession(userId);
    return await cache.set(key, data, CacheTTL.MEDIUM);
  }

  static async invalidateUserSession(userId: string) {
    return await cache.del(CacheKeys.userSession(userId));
  }

  // Security alerts caching
  static async getSecurityAlerts() {
    const key = CacheKeys.securityAlerts();
    return await cache.get(key);
  }

  static async setSecurityAlerts(data: any) {
    const key = CacheKeys.securityAlerts();
    return await cache.set(key, data, CacheTTL.SHORT);
  }

  static async invalidateSecurityAlerts() {
    return await cache.del(CacheKeys.securityAlerts());
  }

  // Statistics caching
  static async getStatistics(type: string) {
    const key = CacheKeys.statistics(type);
    return await cache.get(key);
  }

  static async setStatistics(type: string, data: any) {
    const key = CacheKeys.statistics(type);
    return await cache.set(key, data, CacheTTL.MEDIUM);
  }

  static async invalidateStatistics(type?: string) {
    if (type) {
      return await cache.del(CacheKeys.statistics(type));
    }
    return await cache.invalidatePattern('stats:*');
  }

  // Generic cache operations
  static async get<T>(key: string): Promise<T | null> {
    return await cache.get<T>(key);
  }

  static async set(key: string, value: any, ttl = CacheTTL.MEDIUM): Promise<boolean> {
    return await cache.set(key, value, ttl);
  }

  static async del(key: string): Promise<boolean> {
    return await cache.del(key);
  }

  static async invalidatePattern(pattern: string): Promise<boolean> {
    return await cache.invalidatePattern(pattern);
  }

  static isAvailable(): boolean {
    return cache.isAvailable();
  }

  // Cache warming functions
  static async warmCache() {
    console.log('Starting cache warming...');
    
    try {
      // Warm portfolio data cache
      const { prisma } = await import('../prisma');
      
      const portfolioData = await prisma.portfolioData.findFirst({
        where: { isPublished: true },
        orderBy: { version: 'desc' }
      });
      
      if (portfolioData) {
        await this.setPortfolioData(portfolioData);
      }

      // Warm dynamic modals cache
      const modals = await prisma.dynamicModal.findMany({
        where: { isActive: true }
      });
      
      await this.setDynamicModals(modals);

      // Warm media files cache
      const mediaFiles = await prisma.mediaFile.findMany({
        where: { isArchived: false }
      });
      
      await this.setMediaFiles(mediaFiles);

      // Warm admin settings cache
      const adminSettings = await prisma.adminSettings.findFirst();
      if (adminSettings) {
        await this.setAdminSettings(adminSettings);
      }

      console.log('Cache warming completed successfully');
    } catch (error) {
      console.error('Cache warming failed:', error);
    }
  }
}