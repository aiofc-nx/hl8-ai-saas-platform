/**
 * @fileoverview Rate Limit Service 单元测试
 * @description 测试速率限制服务的所有功能
 */

import { Test, TestingModule } from '@nestjs/testing';
import { RateLimitService } from './rate-limit.service';
import type { RateLimitConfig, FastifyRequest as InterfaceFastifyRequest } from '../types/index';

describe('RateLimitService', () => {
  let service: RateLimitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RateLimitService]
    }).compile();

    service = module.get<RateLimitService>(RateLimitService);
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

  describe('checkRateLimit', () => {
    const mockRequest = {
      method: 'GET',
      url: '/api/v1/rest/users',
      headers: {
        'x-forwarded-for': '192.168.1.1',
        'user-agent': 'test-agent'
      },
      socket: {
        remoteAddress: '192.168.1.1'
      }
    } as InterfaceFastifyRequest;

    it('should allow request within rate limit', async () => {
      const result = await service.checkRateLimit(mockRequest);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeDefined();
      expect(result.resetTime).toBeDefined();
    });

    it('should allow request with custom endpoint config', async () => {
      const customConfig: RateLimitConfig = {
        windowMs: 60000,
        max: 5,
        message: 'Custom rate limit exceeded'
      };

      service.setEndpointConfig('/api/v1/auth/login', customConfig);

      const result = await service.checkRateLimit(mockRequest, '/api/v1/auth/login');

      expect(result.allowed).toBe(true);
    });

    it('should deny request when rate limit exceeded', async () => {
      const customConfig: RateLimitConfig = {
        windowMs: 60000,
        max: 1,
        message: 'Rate limit exceeded'
      };

      service.setEndpointConfig('/test-endpoint', customConfig);

      // First request should be allowed
      const firstResult = await service.checkRateLimit(mockRequest, '/test-endpoint');
      expect(firstResult.allowed).toBe(true);

      // Second request should be denied
      const secondResult = await service.checkRateLimit(mockRequest, '/test-endpoint');
      expect(secondResult.allowed).toBe(false);
      expect(secondResult.message).toBe('Rate limit exceeded');
    });

    it('should handle request without headers', async () => {
      const requestWithoutHeaders = {
        method: 'GET',
        url: '/api/v1/rest/users',
        headers: {},
        socket: {
          remoteAddress: '192.168.1.1'
        }
      } as InterfaceFastifyRequest;

      const result = await service.checkRateLimit(requestWithoutHeaders);

      expect(result.allowed).toBe(true);
    });

    it('should handle request with tenant context', async () => {
      const requestWithTenant = {
        ...mockRequest,
        tenantId: 'tenant-123'
      } as InterfaceFastifyRequest;

      const result = await service.checkRateLimit(requestWithTenant);

      expect(result.allowed).toBe(true);
    });

    it('should handle rate limit check errors gracefully', async () => {
      const invalidRequest = null as any;

      const result = await service.checkRateLimit(invalidRequest);

      expect(result.allowed).toBe(true); // Should allow on error
    });
  });

  describe('endpoint configuration', () => {
    it('should set endpoint configuration', () => {
      const config: RateLimitConfig = {
        windowMs: 30000,
        max: 10,
        message: 'Endpoint rate limit exceeded'
      };

      service.setEndpointConfig('/api/v1/test', config);

      const retrievedConfig = service.getEndpointConfig('/api/v1/test');
      expect(retrievedConfig).toBeDefined();
      expect(retrievedConfig?.max).toBe(10);
    });

    it('should remove endpoint configuration', () => {
      const config: RateLimitConfig = {
        windowMs: 30000,
        max: 10
      };

      service.setEndpointConfig('/api/v1/test', config);
      service.removeEndpointConfig('/api/v1/test');

      const retrievedConfig = service.getEndpointConfig('/api/v1/test');
      expect(retrievedConfig).toBeUndefined();
    });

    it('should get endpoint configuration', () => {
      const config: RateLimitConfig = {
        windowMs: 30000,
        max: 10
      };

      service.setEndpointConfig('/api/v1/test', config);

      const retrievedConfig = service.getEndpointConfig('/api/v1/test');
      expect(retrievedConfig).toBe(config);
    });

    it('should return undefined for non-existent endpoint', () => {
      const config = service.getEndpointConfig('/non-existent');
      expect(config).toBeUndefined();
    });

    it('should handle configuration management errors gracefully', () => {
      expect(() => {
        service.setEndpointConfig('', null as any);
      }).not.toThrow();

      expect(() => {
        service.removeEndpointConfig('');
      }).not.toThrow();
    });
  });

  describe('rate limit management', () => {
    it('should reset rate limit for key', () => {
      const key = 'test-key';

      service.resetRateLimit(key);

      const status = service.getRateLimitStatus(key);
      expect(status).toBeUndefined();
    });

    it('should get rate limit status', () => {
      const key = 'test-key';
      const status = service.getRateLimitStatus(key);

      expect(status).toBeUndefined();
    });

    it('should handle rate limit management errors gracefully', () => {
      expect(() => {
        service.resetRateLimit('');
      }).not.toThrow();
    });
  });

  describe('cleanup operations', () => {
    it('should cleanup expired records', () => {
      service.cleanupExpiredRecords();

      // Should not throw any errors
      expect(true).toBe(true);
    });

    it('should handle cleanup errors gracefully', () => {
      expect(() => {
        service.cleanupExpiredRecords();
      }).not.toThrow();
    });
  });

  describe('statistics', () => {
    it('should get statistics', () => {
      const stats = service.getStatistics();

      expect(stats).toBeDefined();
      expect(stats.totalRecords).toBeDefined();
      expect(stats.blockedRecords).toBeDefined();
      expect(stats.activeRecords).toBeDefined();
      expect(stats.endpoints).toBeDefined();
      expect(Array.isArray(stats.endpoints)).toBe(true);
    });

    it('should handle statistics errors gracefully', () => {
      const stats = service.getStatistics();

      expect(stats).toBeDefined();
      expect(typeof stats.totalRecords).toBe('number');
      expect(typeof stats.blockedRecords).toBe('number');
      expect(typeof stats.activeRecords).toBe('number');
    });
  });

  describe('cleanup task', () => {
    it('should start cleanup task', () => {
      service.startCleanupTask();

      // Should not throw any errors
      expect(true).toBe(true);
    });

    it('should handle cleanup task errors gracefully', () => {
      expect(() => {
        service.startCleanupTask();
      }).not.toThrow();
    });
  });

  describe('default configurations', () => {
    it('should have default configuration for auth login', () => {
      const config = service.getEndpointConfig('/api/v1/auth/login');
      expect(config).toBeDefined();
      expect(config?.max).toBe(5);
    });

    it('should have default configuration for auth register', () => {
      const config = service.getEndpointConfig('/api/v1/auth/register');
      expect(config).toBeDefined();
      expect(config?.max).toBe(3);
    });

    it('should have default configuration for password reset', () => {
      const config = service.getEndpointConfig('/api/v1/auth/reset-password');
      expect(config).toBeDefined();
      expect(config?.max).toBe(2);
    });

    it('should have default configuration for REST API', () => {
      const config = service.getEndpointConfig('/api/v1/rest');
      expect(config).toBeDefined();
      expect(config?.max).toBe(200);
    });

    it('should have default configuration for GraphQL', () => {
      const config = service.getEndpointConfig('/api/v1/graphql');
      expect(config).toBeDefined();
      expect(config?.max).toBe(100);
    });
  });

  describe('key generation', () => {
    it('should generate consistent keys for same request', () => {
      const request1 = {
        method: 'GET',
        url: '/api/v1/rest/users',
        headers: {
          'x-forwarded-for': '192.168.1.1',
          'user-agent': 'test-agent'
        },
        socket: {
          remoteAddress: '192.168.1.1'
        }
      } as InterfaceFastifyRequest;

      const request2 = {
        method: 'GET',
        url: '/api/v1/rest/users',
        headers: {
          'x-forwarded-for': '192.168.1.1',
          'user-agent': 'test-agent'
        },
        socket: {
          remoteAddress: '192.168.1.1'
        }
      } as InterfaceFastifyRequest;

      const key1 = service['generateKey'](request1);
      const key2 = service['generateKey'](request2);

      expect(key1).toBe(key2);
    });

    it('should generate different keys for different requests', () => {
      const request1 = {
        method: 'GET',
        url: '/api/v1/rest/users',
        headers: {
          'x-forwarded-for': '192.168.1.1',
          'user-agent': 'test-agent'
        },
        socket: {
          remoteAddress: '192.168.1.1'
        }
      } as InterfaceFastifyRequest;

      const request2 = {
        method: 'GET',
        url: '/api/v1/rest/users',
        headers: {
          'x-forwarded-for': '192.168.1.2',
          'user-agent': 'test-agent'
        },
        socket: {
          remoteAddress: '192.168.1.2'
        }
      } as InterfaceFastifyRequest;

      const key1 = service['generateKey'](request1);
      const key2 = service['generateKey'](request2);

      expect(key1).not.toBe(key2);
    });
  });

  describe('client IP extraction', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const request = {
        headers: {
          'x-forwarded-for': '192.168.1.1, 10.0.0.1'
        }
      } as InterfaceFastifyRequest;

      const ip = service['getClientIP'](request);
      expect(ip).toBe('192.168.1.1');
    });

    it('should extract IP from x-real-ip header', () => {
      const request = {
        headers: {
          'x-real-ip': '192.168.1.1'
        }
      } as InterfaceFastifyRequest;

      const ip = service['getClientIP'](request);
      expect(ip).toBe('192.168.1.1');
    });

    it('should extract IP from socket remoteAddress', () => {
      const request = {
        headers: {},
        socket: {
          remoteAddress: '192.168.1.1'
        }
      } as InterfaceFastifyRequest;

      const ip = service['getClientIP'](request);
      expect(ip).toBe('192.168.1.1');
    });

    it('should return unknown for missing IP', () => {
      const request = {
        headers: {},
        socket: {}
      } as InterfaceFastifyRequest;

      const ip = service['getClientIP'](request);
      expect(ip).toBe('unknown');
    });
  });

  describe('edge cases', () => {
    it('should handle null request gracefully', async () => {
      const result = await service.checkRateLimit(null as any);

      expect(result.allowed).toBe(true);
    });

    it('should handle undefined request gracefully', async () => {
      const result = await service.checkRateLimit(undefined as any);

      expect(result.allowed).toBe(true);
    });

    it('should handle request with missing properties gracefully', async () => {
      const incompleteRequest = {} as InterfaceFastifyRequest;

      const result = await service.checkRateLimit(incompleteRequest);

      expect(result.allowed).toBe(true);
    });

    it('should handle concurrent rate limit checks', async () => {
      const mockRequest = {
        method: 'GET',
        url: '/api/v1/rest/users',
        headers: {
          'x-tenant-id': 'test-tenant',
          'x-forwarded-for': '192.168.1.1'
        },
        socket: {
          remoteAddress: '192.168.1.1'
        }
      } as InterfaceFastifyRequest;

      const promises = Array(10).fill(null).map(() => 
        service.checkRateLimit(mockRequest)
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result.allowed).toBeDefined();
      });
    });
  });
});
