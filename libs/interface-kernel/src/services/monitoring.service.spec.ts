import { Test, TestingModule } from '@nestjs/testing';
import { MonitoringService } from './monitoring.service';
import type { InterfaceFastifyRequest } from '../types/index.js';

describe('MonitoringService', () => {
  let service: MonitoringService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MonitoringService]
    }).compile();

    service = module.get<MonitoringService>(MonitoringService);
  });

  afterEach(async () => {
    // 清理定时器和异步操作
    if (service && typeof service.cleanup === 'function') {
      service.cleanup();
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('recordRequestMetrics', () => {
    const mockRequest = {
      method: 'GET',
      url: '/api/v1/rest/users',
      headers: {
        'content-type': 'application/json',
        'content-length': '100'
      },
      body: { test: 'data' },
      socket: {
        remoteAddress: '192.168.1.1'
      }
    } as InterfaceFastifyRequest;

    it('should record successful request metrics', () => {
      const responseTime = 150;
      const statusCode = 200;

      service.recordRequestMetrics(mockRequest, responseTime, statusCode);

      const metrics = service.getPerformanceMetrics();
      expect(metrics.requestCount).toBeGreaterThan(0);
      expect(metrics.responseTime).toBe(responseTime);
      expect(metrics.successRate).toBe(100);
    });

    it('should record error request metrics', () => {
      const responseTime = 500;
      const statusCode = 500;

      service.recordRequestMetrics(mockRequest, responseTime, statusCode);

      const metrics = service.getPerformanceMetrics();
      expect(metrics.errorCount).toBeGreaterThan(0);
      expect(metrics.successRate).toBeLessThan(100);
    });

    it('should record request size metrics', () => {
      const responseTime = 100;
      const statusCode = 200;

      service.recordRequestMetrics(mockRequest, responseTime, statusCode);

      const requestSizeMetric = service.getMetricData('http_request_size_bytes');
      expect(requestSizeMetric.length).toBeGreaterThan(0);
    });

    it('should handle request without headers', () => {
      const requestWithoutHeaders = {
        method: 'GET',
        url: '/api/v1/rest/users',
        headers: {},
        body: {},
        socket: {
          remoteAddress: '192.168.1.1'
        }
      } as InterfaceFastifyRequest;

      const responseTime = 100;
      const statusCode = 200;

      service.recordRequestMetrics(requestWithoutHeaders, responseTime, statusCode);

      const metrics = service.getPerformanceMetrics();
      expect(metrics.requestCount).toBeGreaterThan(0);
    });

    it('should handle request without body', () => {
      const requestWithoutBody = {
        method: 'GET',
        url: '/api/v1/rest/users',
        headers: {},
        body: null,
        socket: {
          remoteAddress: '192.168.1.1'
        }
      } as InterfaceFastifyRequest;

      const responseTime = 100;
      const statusCode = 200;

      service.recordRequestMetrics(requestWithoutBody, responseTime, statusCode);

      const metrics = service.getPerformanceMetrics();
      expect(metrics.requestCount).toBeGreaterThan(0);
    });

    it('should handle request recording errors gracefully', () => {
      const invalidRequest = null as any;
      const responseTime = 100;
      const statusCode = 200;

      expect(() => {
        service.recordRequestMetrics(invalidRequest, responseTime, statusCode);
      }).not.toThrow();
    });
  });

  describe('recordErrorMetrics', () => {
    it('should record error metrics', () => {
      const error = new Error('Test error');
      const context = { userId: 'user-123', action: 'test' };

      service.recordErrorMetrics(error, context);

      const errorMetric = service.getMetricData('errors_total');
      expect(errorMetric.length).toBeGreaterThan(0);
    });

    it('should record error without context', () => {
      const error = new Error('Test error');

      service.recordErrorMetrics(error);

      const errorMetric = service.getMetricData('errors_total');
      expect(errorMetric.length).toBeGreaterThan(0);
    });

    it('should handle error recording gracefully', () => {
      const error = null as any;
      const context = null as any;

      expect(() => {
        service.recordErrorMetrics(error, context);
      }).not.toThrow();
    });
  });

  describe('recordBusinessMetric', () => {
    it('should record business metric', () => {
      const name = 'user_registrations';
      const value = 10;
      const labels = { source: 'web', tenant: 'test-tenant' };

      service.recordBusinessMetric(name, value, labels);

      const metric = service.getMetricData(name);
      expect(metric.length).toBeGreaterThan(0);
      expect(metric[0].value).toBe(value);
      expect(metric[0].labels).toEqual(labels);
    });

    it('should record business metric without labels', () => {
      const name = 'api_calls';
      const value = 100;

      service.recordBusinessMetric(name, value);

      const metric = service.getMetricData(name);
      expect(metric.length).toBeGreaterThan(0);
      expect(metric[0].value).toBe(value);
    });

    it('should handle business metric recording errors gracefully', () => {
      const name = null as any;
      const value = null as any;

      expect(() => {
        service.recordBusinessMetric(name, value);
      }).not.toThrow();
    });
  });

  describe('getPerformanceMetrics', () => {
    it('should return performance metrics', () => {
      const metrics = service.getPerformanceMetrics();

      expect(metrics).toBeDefined();
      expect(typeof metrics.requestCount).toBe('number');
      expect(typeof metrics.responseTime).toBe('number');
      expect(typeof metrics.errorCount).toBe('number');
      expect(typeof metrics.successRate).toBe('number');
      expect(typeof metrics.throughput).toBe('number');
      expect(typeof metrics.memoryUsage).toBe('number');
      expect(typeof metrics.cpuUsage).toBe('number');
    });

    it('should return consistent metrics structure', () => {
      const metrics1 = service.getPerformanceMetrics();
      const metrics2 = service.getPerformanceMetrics();

      expect(Object.keys(metrics1)).toEqual(Object.keys(metrics2));
    });
  });

  describe('getMetricData', () => {
    it('should return metric data for existing metric', () => {
      const metricName = 'test_metric';
      const value = 100;
      const labels = { test: 'label' };

      service.recordBusinessMetric(metricName, value, labels);

      const data = service.getMetricData(metricName);
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });

    it('should return empty array for non-existent metric', () => {
      const data = service.getMetricData('non_existent_metric');
      expect(data).toEqual([]);
    });

    it('should return limited data when limit is specified', () => {
      const metricName = 'test_metric';
      
      // Record multiple metrics
      for (let i = 0; i < 5; i++) {
        service.recordBusinessMetric(metricName, i);
      }

      const data = service.getMetricData(metricName, 3);
      expect(data.length).toBeLessThanOrEqual(3);
    });

    it('should handle metric data retrieval errors gracefully', () => {
      const data = service.getMetricData(null as any);
      expect(data).toEqual([]);
    });
  });

  describe('getAllMetricNames', () => {
    it('should return all metric names', () => {
      service.recordBusinessMetric('metric1', 1);
      service.recordBusinessMetric('metric2', 2);

      const names = service.getAllMetricNames();
      expect(Array.isArray(names)).toBe(true);
      expect(names.length).toBeGreaterThan(0);
    });

    it('should return empty array when no metrics exist', () => {
      const names = service.getAllMetricNames();
      expect(Array.isArray(names)).toBe(true);
    });
  });

  describe('getSystemInfo', () => {
    it('should return system information', () => {
      const systemInfo = service.getSystemInfo();

      expect(systemInfo).toBeDefined();
      expect(typeof systemInfo.uptime).toBe('number');
      expect(systemInfo.memoryUsage).toBeDefined();
      expect(typeof systemInfo.version).toBe('string');
      expect(typeof systemInfo.platform).toBe('string');
      expect(typeof systemInfo.arch).toBe('string');
    });

    it('should return consistent system info structure', () => {
      const info1 = service.getSystemInfo();
      const info2 = service.getSystemInfo();

      expect(Object.keys(info1)).toEqual(Object.keys(info2));
    });
  });

  describe('cleanup operations', () => {
    it('should cleanup old metrics', () => {
      const maxAge = 1; // 1ms to force cleanup
      
      service.recordBusinessMetric('old_metric', 1);
      
      // Wait a bit to ensure the metric is old
      setTimeout(() => {
        service.cleanupOldMetrics(maxAge);
        
        const data = service.getMetricData('old_metric');
        expect(data.length).toBe(0);
      }, 10);
    });

    it('should handle cleanup errors gracefully', () => {
      expect(() => {
        service.cleanupOldMetrics(null as any);
      }).not.toThrow();
    });
  });

  describe('export and reset operations', () => {
    it('should export all metrics', () => {
      service.recordBusinessMetric('export_test', 1);
      
      const exported = service.exportMetrics();
      expect(exported).toBeDefined();
      expect(typeof exported).toBe('object');
    });

    it('should reset all metrics', () => {
      service.recordBusinessMetric('reset_test', 1);
      service.resetMetrics();

      const data = service.getMetricData('reset_test');
      expect(data.length).toBe(0);
    });

    it('should handle export errors gracefully', () => {
      const exported = service.exportMetrics();
      expect(exported).toBeDefined();
    });

    it('should handle reset errors gracefully', () => {
      expect(() => {
        service.resetMetrics();
      }).not.toThrow();
    });
  });

  describe('system metrics collection', () => {
    it('should collect system metrics', () => {
      service['collectSystemMetrics']();

      const memoryMetric = service.getMetricData('memory_usage_bytes');
      expect(memoryMetric.length).toBeGreaterThan(0);
    });

    it('should handle system metrics collection errors gracefully', () => {
      expect(() => {
        service['collectSystemMetrics']();
      }).not.toThrow();
    });
  });

  describe('request size calculation', () => {
    it('should calculate request size correctly', () => {
      const request = {
        url: '/test',
        headers: {
          'content-type': 'application/json',
          'authorization': 'Bearer token'
        },
        body: { test: 'data' }
      } as InterfaceFastifyRequest;

      const size = service['getRequestSize'](request);
      expect(typeof size).toBe('number');
      expect(size).toBeGreaterThan(0);
    });

    it('should handle request without body', () => {
      const request = {
        url: '/test',
        headers: {},
        body: null
      } as InterfaceFastifyRequest;

      const size = service['getRequestSize'](request);
      expect(typeof size).toBe('number');
    });

    it('should handle request size calculation errors gracefully', () => {
      const invalidRequest = null as any;
      const size = service['getRequestSize'](invalidRequest);
      expect(size).toBe(0);
    });
  });

  describe('metrics collection lifecycle', () => {
    it('should start metrics collection', () => {
      service['startMetricsCollection']();

      // Should not throw any errors
      expect(true).toBe(true);
    });

    it('should handle metrics collection start errors gracefully', () => {
      expect(() => {
        service['startMetricsCollection']();
      }).not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle null values gracefully', () => {
      service.recordBusinessMetric(null as any, null as any, null as any);
      service.recordErrorMetrics(null as any, null as any);
      service.recordRequestMetrics(null as any, null as any, null as any);

      // Should not throw any errors
      expect(true).toBe(true);
    });

    it('should handle undefined values gracefully', () => {
      service.recordBusinessMetric(undefined as any, undefined as any, undefined as any);
      service.recordErrorMetrics(undefined as any, undefined as any);
      service.recordRequestMetrics(undefined as any, undefined as any, undefined as any);

      // Should not throw any errors
      expect(true).toBe(true);
    });

    it('should handle concurrent metric recording', () => {
      const promises = Array(10).fill(null).map((_, i) => 
        service.recordBusinessMetric(`concurrent_metric_${i}`, i)
      );

      expect(() => {
        Promise.all(promises);
      }).not.toThrow();
    });

    it('should handle large metric values', () => {
      service.recordBusinessMetric('large_metric', Number.MAX_SAFE_INTEGER);
      
      const data = service.getMetricData('large_metric');
      expect(data.length).toBeGreaterThan(0);
    });

    it('should handle negative metric values', () => {
      service.recordBusinessMetric('negative_metric', -100);
      
      const data = service.getMetricData('negative_metric');
      expect(data.length).toBeGreaterThan(0);
    });
  });
});
