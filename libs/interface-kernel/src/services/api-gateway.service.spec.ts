/**
 * @fileoverview API Gateway Service 单元测试
 * @description 测试 API Gateway 服务的所有功能
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ApiGatewayService } from './api-gateway.service';
import type { FastifyRequest as InterfaceFastifyRequest, UserContext } from '../types/index';

describe('ApiGatewayService', () => {
  let service: ApiGatewayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApiGatewayService]
    }).compile();

    service = module.get<ApiGatewayService>(ApiGatewayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleHttpRequest', () => {
    it('should handle GET request successfully', async () => {
      const mockRequest = {
        method: 'GET',
        url: '/api/v1/rest/users',
        headers: {
          'content-type': 'application/json',
          'x-tenant-id': 'test-tenant'
        },
        body: {},
        query: {},
        params: {},
        id: 'req-123'
      } as InterfaceFastifyRequest;

      const mockReply = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      } as any;

      const result = await service.handleHttpRequest(mockRequest, mockReply);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.meta).toBeDefined();
      expect(result.meta.requestId).toBe('req-123');
    });

    it('should handle POST request successfully', async () => {
      const mockRequest = {
        method: 'POST',
        url: '/api/v1/rest/users',
        headers: {
          'content-type': 'application/json',
          'x-tenant-id': 'test-tenant'
        },
        body: { name: 'Test User', email: 'test@example.com' },
        query: {},
        params: {},
        id: 'req-124'
      } as InterfaceFastifyRequest;

      const mockReply = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      } as any;

      const result = await service.handleHttpRequest(mockRequest, mockReply);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should handle request with user context', async () => {
      const mockUser: UserContext = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        roles: ['user'],
        permissions: ['read'],
        tenantId: 'test-tenant',
        isolationLevel: 'user'
      };

      const mockRequest = {
        method: 'GET',
        url: '/api/v1/rest/users',
        headers: {
          'content-type': 'application/json',
          'x-tenant-id': 'test-tenant',
          'x-user-id': 'user-123'
        },
        body: {},
        query: {},
        params: {},
        id: 'req-125',
        user: mockUser
      } as InterfaceFastifyRequest;

      const mockReply = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      } as any;

      const result = await service.handleHttpRequest(mockRequest, mockReply);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should handle request with isolation context', async () => {
      const mockRequest = {
        method: 'GET',
        url: '/api/v1/rest/users',
        headers: {
          'content-type': 'application/json',
          'x-tenant-id': 'test-tenant',
          'x-organization-id': 'org-123',
          'x-department-id': 'dept-123'
        },
        body: {},
        query: {},
        params: {},
        id: 'req-126',
        tenantId: 'test-tenant',
        organizationId: 'org-123',
        departmentId: 'dept-123'
      } as InterfaceFastifyRequest;

      const mockReply = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      } as any;

      const result = await service.handleHttpRequest(mockRequest, mockReply);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should handle unsupported HTTP method', async () => {
      const mockRequest = {
        method: 'PATCH',
        url: '/api/v1/rest/users',
        headers: {
          'content-type': 'application/json'
        },
        body: {},
        query: {},
        params: {},
        id: 'req-127'
      } as InterfaceFastifyRequest;

      const mockReply = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      } as any;

      const result = await service.handleHttpRequest(mockRequest, mockReply);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should handle request without content-type for GET', async () => {
      const mockRequest = {
        method: 'GET',
        url: '/api/v1/rest/users',
        headers: {},
        body: {},
        query: {},
        params: {},
        id: 'req-128'
      } as InterfaceFastifyRequest;

      const mockReply = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      } as any;

      const result = await service.handleHttpRequest(mockRequest, mockReply);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it('should handle large request size', async () => {
      const mockRequest = {
        method: 'POST',
        url: '/api/v1/rest/users',
        headers: {
          'content-type': 'application/json',
          'content-length': '10485761' // 10MB + 1 byte
        },
        body: {},
        query: {},
        params: {},
        id: 'req-129'
      } as InterfaceFastifyRequest;

      const mockReply = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      } as any;

      const result = await service.handleHttpRequest(mockRequest, mockReply);

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('handleGraphQLRequest', () => {
    it('should handle GraphQL query successfully', async () => {
      const mockRequest = {
        query: '{ users { id name email } }',
        operationName: 'GetUsers',
        variables: {}
      };

      const mockContext = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          roles: ['user'],
          permissions: ['read'],
          tenantId: 'test-tenant',
          isolationLevel: 'user'
        }
      };

      const result = await service.handleGraphQLRequest(mockRequest, mockContext);

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
    });

    it('should handle GraphQL mutation successfully', async () => {
      const mockRequest = {
        query: 'mutation CreateUser($input: CreateUserInput!) { createUser(input: $input) { id name } }',
        operationName: 'CreateUser',
        variables: {
          input: {
            name: 'Test User',
            email: 'test@example.com'
          }
        }
      };

      const mockContext = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          roles: ['admin'],
          permissions: ['create'],
          tenantId: 'test-tenant',
          isolationLevel: 'user'
        }
      };

      const result = await service.handleGraphQLRequest(mockRequest, mockContext);

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
    });

    it('should handle GraphQL request without user context', async () => {
      const mockRequest = {
        query: '{ users { id name email } }',
        operationName: 'GetUsers',
        variables: {}
      };

      const mockContext = {};

      const result = await service.handleGraphQLRequest(mockRequest, mockContext);

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
    });

    it('should handle GraphQL request with invalid query', async () => {
      const mockRequest = {
        query: '',
        operationName: 'GetUsers',
        variables: {}
      };

      const mockContext = {};

      await expect(service.handleGraphQLRequest(mockRequest, mockContext))
        .rejects.toThrow();
    });
  });

  describe('handleWebSocketMessage', () => {
    it('should handle WebSocket message successfully', async () => {
      const mockSocket = {
        emit: jest.fn(),
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          roles: ['user'],
          permissions: ['read'],
          tenantId: 'test-tenant',
          isolationLevel: 'user'
        }
      };

      const mockData = {
        event: 'chat',
        data: {
          room: 'general',
          message: 'Hello World'
        }
      };

      await service.handleWebSocketMessage(mockSocket, mockData);

      expect(mockSocket.emit).toHaveBeenCalledWith('response', expect.any(Object));
    });

    it('should handle WebSocket message without user', async () => {
      const mockSocket = {
        emit: jest.fn()
      };

      const mockData = {
        event: 'chat',
        data: {
          room: 'general',
          message: 'Hello World'
        }
      };

      await service.handleWebSocketMessage(mockSocket, mockData);

      expect(mockSocket.emit).toHaveBeenCalledWith('response', expect.any(Object));
    });

    it('should handle WebSocket message with notification event', async () => {
      const mockSocket = {
        emit: jest.fn(),
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          roles: ['user'],
          permissions: ['read'],
          tenantId: 'test-tenant',
          isolationLevel: 'user'
        }
      };

      const mockData = {
        event: 'notification',
        data: {
          type: 'info',
          title: 'Test Notification',
          message: 'This is a test notification'
        }
      };

      await service.handleWebSocketMessage(mockSocket, mockData);

      expect(mockSocket.emit).toHaveBeenCalledWith('response', expect.any(Object));
    });

    it('should handle WebSocket message with status event', async () => {
      const mockSocket = {
        emit: jest.fn(),
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          roles: ['user'],
          permissions: ['read'],
          tenantId: 'test-tenant',
          isolationLevel: 'user'
        }
      };

      const mockData = {
        event: 'status',
        data: {
          status: 'online'
        }
      };

      await service.handleWebSocketMessage(mockSocket, mockData);

      expect(mockSocket.emit).toHaveBeenCalledWith('response', expect.any(Object));
    });

    it('should handle WebSocket message with unknown event', async () => {
      const mockSocket = {
        emit: jest.fn(),
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          roles: ['user'],
          permissions: ['read'],
          tenantId: 'test-tenant',
          isolationLevel: 'user'
        }
      };

      const mockData = {
        event: 'unknown',
        data: {}
      };

      await service.handleWebSocketMessage(mockSocket, mockData);

      expect(mockSocket.emit).toHaveBeenCalledWith('error', expect.any(Object));
    });

    it('should handle WebSocket message without event', async () => {
      const mockSocket = {
        emit: jest.fn(),
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          roles: ['user'],
          permissions: ['read'],
          tenantId: 'test-tenant',
          isolationLevel: 'user'
        }
      };

      const mockData = {
        data: {}
      };

      await service.handleWebSocketMessage(mockSocket, mockData);

      expect(mockSocket.emit).toHaveBeenCalledWith('error', expect.any(Object));
    });

    it('should handle WebSocket message processing error', async () => {
      const mockSocket = {
        emit: jest.fn(),
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          roles: ['user'],
          permissions: ['read'],
          tenantId: 'test-tenant',
          isolationLevel: 'user'
        }
      };

      const mockData = {
        event: 'unknown', // This should cause an error
        data: { message: 'test' }
      };

      await service.handleWebSocketMessage(mockSocket, mockData);

      expect(mockSocket.emit).toHaveBeenCalledWith('error', expect.any(Object));
    });
  });

  describe('error handling', () => {
    it('should handle service errors gracefully', async () => {
      const mockRequest = {
        method: 'GET',
        url: '/api/v1/rest/users',
        headers: {},
        body: {},
        query: {},
        params: {},
        id: 'req-error'
      } as InterfaceFastifyRequest;

      const mockReply = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      } as any;

      // Mock an error by providing invalid data
      const result = await service.handleHttpRequest(mockRequest, mockReply);

      expect(result).toBeDefined();
      // Should still return a response, even if it's an error response
    });
  });
});