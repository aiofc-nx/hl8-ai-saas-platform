/**
 * @fileoverview Validation Service 单元测试
 * @description 测试数据验证服务的所有功能
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ValidationService } from './validation.service';
import { z } from 'zod';
import type { ValidationRule, FastifyRequest as InterfaceFastifyRequest } from '../types/index';

describe('ValidationService', () => {
  let service: ValidationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ValidationService]
    }).compile();

    service = module.get<ValidationService>(ValidationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateRequestData', () => {
    it('should validate request data with valid schema', async () => {
      const mockRequest = {
        body: {
          email: 'test@example.com',
          name: 'Test User',
          password: 'password123',
          tenantId: '550e8400-e29b-41d4-a716-446655440000'
        },
        query: {},
        params: {},
        headers: {}
      } as InterfaceFastifyRequest;

      const result = await service.validateRequestData(mockRequest, 'userCreate');

      expect(result.isValid).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should reject request data with invalid schema', async () => {
      const mockRequest = {
        body: {
          email: 'invalid-email',
          name: '',
          password: '123',
          tenantId: 'invalid-uuid'
        },
        query: {},
        params: {},
        headers: {}
      } as InterfaceFastifyRequest;

      const result = await service.validateRequestData(mockRequest, 'userCreate');

      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.length).toBeGreaterThan(0);
    });

    it('should handle missing schema gracefully', async () => {
      const mockRequest = {
        body: {},
        query: {},
        params: {},
        headers: {}
      } as InterfaceFastifyRequest;

      const result = await service.validateRequestData(mockRequest, 'nonExistentSchema');

      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should handle validation errors gracefully', async () => {
      const invalidRequest = null as any;

      const result = await service.validateRequestData(invalidRequest, 'userCreate');

      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('validateQueryParams', () => {
    const mockRequest = {
      query: {
        page: '1',
        limit: '10',
        sort: 'name',
        order: 'asc'
      },
      body: {},
      params: {},
      headers: {}
    } as InterfaceFastifyRequest;

    const rules: ValidationRule[] = [
      { field: 'page', type: 'number', required: false, min: 1 },
      { field: 'limit', type: 'number', required: false, min: 1, max: 100 },
      { field: 'sort', type: 'string', required: false },
      { field: 'order', type: 'string', required: false, pattern: /^(asc|desc)$/i }
    ];

    it('should validate query parameters successfully', async () => {
      const result = await service.validateQueryParams(mockRequest, rules);

      expect(result.isValid).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should validate required query parameters', async () => {
      const requiredRules: ValidationRule[] = [
        { field: 'page', type: 'number', required: true, min: 1 }
      ];

      const requestWithoutRequired = {
        query: {},
        body: {},
        params: {},
        headers: {}
      } as InterfaceFastifyRequest;

      const result = await service.validateQueryParams(requestWithoutRequired, requiredRules);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('page is required');
    });

    it('should validate query parameter types', async () => {
      const invalidRequest = {
        query: {
          page: 'invalid',
          limit: 'not-a-number'
        },
        body: {},
        params: {},
        headers: {}
      } as InterfaceFastifyRequest;

      const result = await service.validateQueryParams(invalidRequest, rules);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('page must be a number');
      expect(result.errors).toContain('limit must be a number');
    });

    it('should validate query parameter ranges', async () => {
      const invalidRequest = {
        query: {
          page: '0',
          limit: '101'
        },
        body: {},
        params: {},
        headers: {}
      } as InterfaceFastifyRequest;

      const result = await service.validateQueryParams(invalidRequest, rules);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('page must be at least 1');
      expect(result.errors).toContain('limit must be no more than 100');
    });

    it('should validate query parameter patterns', async () => {
      const invalidRequest = {
        query: {
          order: 'invalid'
        },
        body: {},
        params: {},
        headers: {}
      } as InterfaceFastifyRequest;

      const result = await service.validateQueryParams(invalidRequest, rules);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('order format is invalid');
    });

    it('should handle validation errors gracefully', async () => {
      const invalidRequest = null as any;

      const result = await service.validateQueryParams(invalidRequest, rules);

      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('validatePathParams', () => {
    const mockRequest = {
      params: {
        id: 'user-123',
        tenantId: 'tenant-123'
      },
      body: {},
      query: {},
      headers: {}
    } as InterfaceFastifyRequest;

    const rules: ValidationRule[] = [
      { field: 'id', type: 'string', required: true },
      { field: 'tenantId', type: 'string', required: true }
    ];

    it('should validate path parameters successfully', async () => {
      const result = await service.validatePathParams(mockRequest, rules);

      expect(result.isValid).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should validate required path parameters', async () => {
      const requestWithoutRequired = {
        params: {},
        body: {},
        query: {},
        headers: {}
      } as InterfaceFastifyRequest;

      const result = await service.validatePathParams(requestWithoutRequired, rules);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('id is required');
      expect(result.errors).toContain('tenantId is required');
    });

    it('should handle validation errors gracefully', async () => {
      const invalidRequest = null as any;

      const result = await service.validatePathParams(invalidRequest, rules);

      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('validateRequestBody', () => {
    const mockRequest = {
      body: {
        name: 'Test User',
        email: 'test@example.com',
        age: 25
      },
      query: {},
      params: {},
      headers: {}
    } as InterfaceFastifyRequest;

    const rules: ValidationRule[] = [
      { field: 'name', type: 'string', required: true, min: 1, max: 100 },
      { field: 'email', type: 'email', required: true },
      { field: 'age', type: 'number', required: false, min: 0, max: 120 }
    ];

    it('should validate request body successfully', async () => {
      const result = await service.validateRequestBody(mockRequest, rules);

      expect(result.isValid).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should validate required fields', async () => {
      const requestWithoutRequired = {
        body: {
          age: 25
        },
        query: {},
        params: {},
        headers: {}
      } as InterfaceFastifyRequest;

      const result = await service.validateRequestBody(requestWithoutRequired, rules);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('name is required');
      expect(result.errors).toContain('email is required');
    });

    it('should validate field types', async () => {
      const invalidRequest = {
        body: {
          name: 123,
          email: 'invalid-email',
          age: 'not-a-number'
        },
        query: {},
        params: {},
        headers: {}
      } as InterfaceFastifyRequest;

      const result = await service.validateRequestBody(invalidRequest, rules);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('name must be a string');
      expect(result.errors).toContain('email must be a valid email address');
      expect(result.errors).toContain('age must be a number');
    });

    it('should validate field ranges', async () => {
      const invalidRequest = {
        body: {
          name: '',
          email: 'test@example.com',
          age: 150
        },
        query: {},
        params: {},
        headers: {}
      } as InterfaceFastifyRequest;

      const result = await service.validateRequestBody(invalidRequest, rules);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('name must be at least 1 characters long');
      expect(result.errors).toContain('age must be no more than 120');
    });

    it('should handle validation errors gracefully', async () => {
      const invalidRequest = null as any;

      const result = await service.validateRequestBody(invalidRequest, rules);

      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('field type validation', () => {
    it('should validate string type', () => {
      const rule: ValidationRule = { field: 'test', type: 'string' };
      expect(service['validateFieldType']('test', rule)).toBeNull();
      expect(service['validateFieldType'](123, rule)).toContain('must be a string');
    });

    it('should validate number type', () => {
      const rule: ValidationRule = { field: 'test', type: 'number' };
      expect(service['validateFieldType'](123, rule)).toBeNull();
      expect(service['validateFieldType']('123', rule)).toBeNull();
      expect(service['validateFieldType']('abc', rule)).toContain('must be a number');
    });

    it('should validate boolean type', () => {
      const rule: ValidationRule = { field: 'test', type: 'boolean' };
      expect(service['validateFieldType'](true, rule)).toBeNull();
      expect(service['validateFieldType'](false, rule)).toBeNull();
      expect(service['validateFieldType']('true', rule)).toBeNull();
      expect(service['validateFieldType']('false', rule)).toBeNull();
      expect(service['validateFieldType']('yes', rule)).toContain('must be a boolean');
    });

    it('should validate email type', () => {
      const rule: ValidationRule = { field: 'test', type: 'email' };
      expect(service['validateFieldType']('test@example.com', rule)).toBeNull();
      expect(service['validateFieldType']('invalid-email', rule)).toContain('must be a valid email address');
    });

    it('should validate uuid type', () => {
      const rule: ValidationRule = { field: 'test', type: 'uuid' };
      expect(service['validateFieldType']('123e4567-e89b-12d3-a456-426614174000', rule)).toBeNull();
      expect(service['validateFieldType']('invalid-uuid', rule)).toContain('must be a valid UUID');
    });

    it('should validate date type', () => {
      const rule: ValidationRule = { field: 'test', type: 'date' };
      expect(service['validateFieldType']('2023-01-01', rule)).toBeNull();
      expect(service['validateFieldType']('invalid-date', rule)).toContain('must be a valid date');
    });

    it('should validate array type', () => {
      const rule: ValidationRule = { field: 'test', type: 'array' };
      expect(service['validateFieldType']([1, 2, 3], rule)).toBeNull();
      expect(service['validateFieldType']('not-array', rule)).toContain('must be an array');
    });

    it('should validate object type', () => {
      const rule: ValidationRule = { field: 'test', type: 'object' };
      expect(service['validateFieldType']({ key: 'value' }, rule)).toBeNull();
      expect(service['validateFieldType']([], rule)).toContain('must be an object');
    });
  });

  describe('field value validation', () => {
    it('should validate minimum values', () => {
      const rule: ValidationRule = { field: 'test', type: 'string', min: 5 };
      expect(service['validateFieldValue']('hello', rule)).toBeNull();
      expect(service['validateFieldValue']('hi', rule)).toContain('must be at least 5 characters long');
    });

    it('should validate maximum values', () => {
      const rule: ValidationRule = { field: 'test', type: 'string', max: 5 };
      expect(service['validateFieldValue']('hello', rule)).toBeNull();
      expect(service['validateFieldValue']('hello world', rule)).toContain('must be no more than 5 characters long');
    });

    it('should validate patterns', () => {
      const rule: ValidationRule = { field: 'test', type: 'string', pattern: /^[a-z]+$/ };
      expect(service['validateFieldValue']('hello', rule)).toBeNull();
      expect(service['validateFieldValue']('Hello123', rule)).toContain('format is invalid');
    });

    it('should validate custom rules', () => {
      const rule: ValidationRule = {
        field: 'test',
        type: 'string',
        custom: (value: any) => value === 'valid',
        message: 'Custom validation failed'
      };
      expect(service['validateFieldValue']('valid', rule)).toBeNull();
      expect(service['validateFieldValue']('invalid', rule)).toContain('Custom validation failed');
    });
  });

  describe('schema management', () => {
    it('should add validation schema', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number()
      });

      service.addValidationSchema('testSchema', schema);

      const retrievedSchema = service.getValidationSchema('testSchema');
      expect(retrievedSchema).toBeDefined();
    });

    it('should remove validation schema', () => {
      const schema = z.object({
        name: z.string()
      });

      service.addValidationSchema('testSchema', schema);
      service.removeValidationSchema('testSchema');

      const retrievedSchema = service.getValidationSchema('testSchema');
      expect(retrievedSchema).toBeUndefined();
    });

    it('should get validation schema', () => {
      const schema = z.object({
        name: z.string()
      });

      service.addValidationSchema('testSchema', schema);

      const retrievedSchema = service.getValidationSchema('testSchema');
      expect(retrievedSchema).toBe(schema);
    });

    it('should return undefined for non-existent schema', () => {
      const schema = service.getValidationSchema('nonExistentSchema');
      expect(schema).toBeUndefined();
    });

    it('should handle schema management errors gracefully', () => {
      expect(() => {
        service.addValidationSchema('', null as any);
      }).not.toThrow();

      expect(() => {
        service.removeValidationSchema('');
      }).not.toThrow();
    });
  });

  describe('default schemas', () => {
    it('should have userCreate schema', () => {
      const schema = service.getValidationSchema('userCreate');
      expect(schema).toBeDefined();
    });

    it('should have userUpdate schema', () => {
      const schema = service.getValidationSchema('userUpdate');
      expect(schema).toBeDefined();
    });

    it('should have tenantCreate schema', () => {
      const schema = service.getValidationSchema('tenantCreate');
      expect(schema).toBeDefined();
    });

    it('should have organizationCreate schema', () => {
      const schema = service.getValidationSchema('organizationCreate');
      expect(schema).toBeDefined();
    });

    it('should have departmentCreate schema', () => {
      const schema = service.getValidationSchema('departmentCreate');
      expect(schema).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle null values gracefully', async () => {
      const mockRequest = {
        body: null,
        query: null,
        params: null,
        headers: null
      } as any;

      const result = await service.validateRequestData(mockRequest, 'userCreate');

      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should handle undefined values gracefully', async () => {
      const mockRequest = {
        body: undefined,
        query: undefined,
        params: undefined,
        headers: undefined
      } as any;

      const result = await service.validateRequestData(mockRequest, 'userCreate');

      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should handle empty objects gracefully', async () => {
      const mockRequest = {
        body: {},
        query: {},
        params: {},
        headers: {}
      } as InterfaceFastifyRequest;

      const result = await service.validateRequestData(mockRequest, 'userCreate');

      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });
});
