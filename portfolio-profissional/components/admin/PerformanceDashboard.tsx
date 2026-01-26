'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { usePerformance, useApiPerformance } from '@/hooks/use-performance';
import { 
  Activity, 
  Database, 
  Zap, 
  Clock, 
  MemoryStick, 
  RefreshCw,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface PerformanceData {
  averageLoadTime: number;
  averageRenderTime: number;
  averageInteractionTime: number;
  cacheHitRate: number;
  totalRequests: number;
  errorRate: number;
  cacheStatus: string;
  components: Record<string, {
    loadTime: number;
    renderTime: number;
    interactions: number;
  }>;
}

interface CacheStats {
  isAvailable: boolean;
  status: string;
  portfolioDataCached: boolean;
  modalsCached: boolean;
  mediaFilesCached: boolean;
  adminSettingsCached: boolean;
  performanceDataCached: boolean;
}

export function PerformanceDashboard() {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { metrics } = usePerformance('PerformanceDashboard');
  const { measureApiCall } = useApiPerformance();

  const fetchPerformanceData = async () => {
    try {
      const response = await measureApiCall(
        () => fetch('/api/admin/performance').then(res => res.json()),
        '/api/admin/performance'
      );

      if (response.success) {
        setPerformanceData(response.data);
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
    }
  };

  const fetchCacheStats = async () => {
    try {
      const [statusResponse, statsResponse] = await Promise.all([
        fetch('/api/admin/cache?action=status').then(res => res.json()),
        fetch('/api/admin/cache?action=stats').then(res => res.json())
      ]);

      if (statusResponse.success && statsResponse.success) {
        setCacheStats({
          ...statusResponse.data,
          ...statsResponse.data
        });
      }
    } catch (error) {
      console.error('Error fetching cache stats:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchPerformanceData(),
      fetchCacheStats()
    ]);
    setRefreshing(false);
  };

  const handleCacheAction = async (action: string) => {
    try {
      const response = await fetch('/api/admin/cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      if (response.ok) {
        await fetchCacheStats();
      }
    } catch (error) {
      console.error('Error performing cache action:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchPerformanceData(),
        fetchCacheStats()
      ]);
      setLoading(false);
    };

    loadData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(handleRefresh, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <LoadingSkeleton type="dashboard" />;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'disconnected': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const getPerformanceColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Performance Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor system performance and cache efficiency
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={refreshing}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Load Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPerformanceColor(performanceData?.averageLoadTime || 0, { good: 200, warning: 500 })}`}>
              {performanceData?.averageLoadTime || 0}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Component load time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Render Time</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPerformanceColor(performanceData?.averageRenderTime || 0, { good: 100, warning: 300 })}`}>
              {performanceData?.averageRenderTime || 0}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Average render time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPerformanceColor(100 - (performanceData?.cacheHitRate || 0), { good: 15, warning: 30 })}`}>
              {performanceData?.cacheHitRate || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Cache efficiency
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPerformanceColor(performanceData?.errorRate || 0, { good: 1, warning: 5 })}`}>
              {performanceData?.errorRate || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Request error rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cache Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Cache Status
            <Badge 
              variant="outline" 
              className={`ml-2 ${getStatusColor(cacheStats?.status || 'disconnected')}`}
            >
              {cacheStats?.status || 'Unknown'}
            </Badge>
          </CardTitle>
          <CardDescription>
            Redis cache connection and data status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-sm font-medium">Portfolio Data</div>
              <Badge variant={cacheStats?.portfolioDataCached ? "default" : "secondary"}>
                {cacheStats?.portfolioDataCached ? "Cached" : "Not Cached"}
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium">Modals</div>
              <Badge variant={cacheStats?.modalsCached ? "default" : "secondary"}>
                {cacheStats?.modalsCached ? "Cached" : "Not Cached"}
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium">Media Files</div>
              <Badge variant={cacheStats?.mediaFilesCached ? "default" : "secondary"}>
                {cacheStats?.mediaFilesCached ? "Cached" : "Not Cached"}
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium">Settings</div>
              <Badge variant={cacheStats?.adminSettingsCached ? "default" : "secondary"}>
                {cacheStats?.adminSettingsCached ? "Cached" : "Not Cached"}
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium">Performance</div>
              <Badge variant={cacheStats?.performanceDataCached ? "default" : "secondary"}>
                {cacheStats?.performanceDataCached ? "Cached" : "Not Cached"}
              </Badge>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleCacheAction('warm')}
            >
              <Zap className="h-4 w-4 mr-2" />
              Warm Cache
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleCacheAction('clear')}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Component Performance */}
      {performanceData?.components && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Component Performance
            </CardTitle>
            <CardDescription>
              Individual component performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(performanceData.components).map(([component, data]) => (
                <div key={component} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="font-medium">{component}</div>
                  <div className="flex gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-muted-foreground">Load</div>
                      <div className={getPerformanceColor(data.loadTime, { good: 200, warning: 500 })}>
                        {data.loadTime}ms
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-muted-foreground">Render</div>
                      <div className={getPerformanceColor(data.renderTime, { good: 100, warning: 300 })}>
                        {data.renderTime}ms
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-muted-foreground">Interactions</div>
                      <div>{data.interactions}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}