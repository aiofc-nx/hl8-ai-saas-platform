/**
 * @fileoverview Authorization Service 单元测试
 * @description 测试授权服务的所有功能
 */

import { Test, TestingModule } from "@nestjs/testing";
import { AuthorizationService } from "./authorization.service";
import type {
  UserContext,
  AuthorizationRule,
  IsolationContext,
} from "../types/index";

describe("AuthorizationService", () => {
  let service: AuthorizationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthorizationService],
    }).compile();

    service = module.get<AuthorizationService>(AuthorizationService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("checkPermission", () => {
    const mockUser: UserContext = {
      id: "user-123",
      email: "test@example.com",
      name: "Test User",
      roles: ["user"],
      permissions: ["users:read"],
      tenantId: "test-tenant",
      isolationLevel: "user",
    };

    const mockContext: IsolationContext = {
      tenantId: "test-tenant",
      organizationId: "org-123",
      departmentId: "dept-123",
      userId: "user-123",
      isolationLevel: "user",
      sharingLevel: "private",
    };

    it("should grant permission to super admin", async () => {
      const superAdmin: UserContext = {
        ...mockUser,
        roles: ["super-admin"],
        permissions: ["*"],
        isolationLevel: "platform",
      };

      const result = await service.checkPermission(
        superAdmin,
        "users",
        "delete",
        mockContext,
      );

      expect(result).toBe(true);
    });

    it("should grant permission based on role", async () => {
      const adminUser: UserContext = {
        ...mockUser,
        roles: ["admin"],
        permissions: ["read", "write"],
      };

      const result = await service.checkPermission(
        adminUser,
        "users",
        "read",
        mockContext,
      );

      expect(result).toBe(true);
    });

    it("should grant permission based on direct permissions", async () => {
      const userWithPermissions: UserContext = {
        ...mockUser,
        permissions: ["users:read", "users:write"],
      };

      const result = await service.checkPermission(
        userWithPermissions,
        "users",
        "read",
        mockContext,
      );

      expect(result).toBe(true);
    });

    it("should grant permission with wildcard permissions", async () => {
      const userWithWildcard: UserContext = {
        ...mockUser,
        permissions: ["users:*"],
      };

      const result = await service.checkPermission(
        userWithWildcard,
        "users",
        "delete",
        mockContext,
      );

      expect(result).toBe(true);
    });

    it("should grant permission with global wildcard", async () => {
      const userWithGlobalWildcard: UserContext = {
        ...mockUser,
        permissions: ["*:*"],
      };

      const result = await service.checkPermission(
        userWithGlobalWildcard,
        "users",
        "delete",
        mockContext,
      );

      expect(result).toBe(true);
    });

    it("should deny permission for insufficient roles", async () => {
      const regularUser: UserContext = {
        ...mockUser,
        roles: ["user"],
        permissions: ["read"],
      };

      const result = await service.checkPermission(
        regularUser,
        "users",
        "delete",
        mockContext,
      );

      expect(result).toBe(false);
    });

    it("should deny permission for insufficient direct permissions", async () => {
      const userWithoutPermissions: UserContext = {
        ...mockUser,
        permissions: ["users:read"],
      };

      const result = await service.checkPermission(
        userWithoutPermissions,
        "users",
        "delete",
        mockContext,
      );

      expect(result).toBe(false);
    });

    it("should grant permission based on context", async () => {
      const result = await service.checkPermission(
        mockUser,
        "users",
        "read",
        mockContext,
      );

      expect(result).toBe(true);
    });

    it("should deny permission for wrong tenant context", async () => {
      const userWithoutDirectPermissions: UserContext = {
        ...mockUser,
        permissions: [], // 移除直接权限，只依赖角色权限
      };

      const wrongContext: IsolationContext = {
        ...mockContext,
        tenantId: "different-tenant",
      };

      const result = await service.checkPermission(
        userWithoutDirectPermissions,
        "users",
        "read",
        wrongContext,
      );

      expect(result).toBe(false);
    });

    it("should deny permission for wrong organization context", async () => {
      const userWithoutDirectPermissions: UserContext = {
        ...mockUser,
        permissions: [], // 移除直接权限，只依赖角色权限
      };

      const wrongContext: IsolationContext = {
        ...mockContext,
        organizationId: "different-org",
      };

      const result = await service.checkPermission(
        userWithoutDirectPermissions,
        "users",
        "read",
        wrongContext,
      );

      expect(result).toBe(false);
    });

    it("should handle permission check errors gracefully", async () => {
      const invalidUser = null as any;

      const result = await service.checkPermission(
        invalidUser,
        "users",
        "read",
        mockContext,
      );

      expect(result).toBe(false);
    });
  });

  describe("validateResourceAccess", () => {
    const mockUser: UserContext = {
      id: "user-123",
      email: "test@example.com",
      name: "Test User",
      roles: ["user"],
      permissions: ["users:read"],
      tenantId: "test-tenant",
      isolationLevel: "user",
    };

    it("should validate access to owned resource", async () => {
      const result = await service.validateResourceAccess(
        mockUser,
        "user-123-resource",
        "users",
        "read",
      );

      expect(result).toBe(true);
    });

    it("should deny access to non-owned resource", async () => {
      const result = await service.validateResourceAccess(
        mockUser,
        "other-user-resource",
        "users",
        "read",
      );

      expect(result).toBe(false);
    });

    it("should handle resource access validation errors", async () => {
      const invalidUser = null as any;

      const result = await service.validateResourceAccess(
        invalidUser,
        "resource-123",
        "users",
        "read",
      );

      expect(result).toBe(false);
    });
  });

  describe("authorization rules management", () => {
    it("should add authorization rule", () => {
      const rule: AuthorizationRule = {
        resource: "test-resource",
        action: "read",
        roles: ["user"],
        permissions: ["read"],
      };

      service.addAuthorizationRule("test-resource", rule);

      const rules = service.getAuthorizationRules("test-resource");
      expect(rules).toContain(rule);
    });

    it("should remove authorization rule", () => {
      const rule: AuthorizationRule = {
        resource: "test-resource",
        action: "read",
        roles: ["user"],
      };

      service.addAuthorizationRule("test-resource", rule);
      service.removeAuthorizationRule("test-resource", 0);

      const rules = service.getAuthorizationRules("test-resource");
      expect(rules).not.toContain(rule);
    });

    it("should get authorization rules", () => {
      const rule: AuthorizationRule = {
        resource: "test-resource",
        action: "read",
        roles: ["user"],
      };

      service.addAuthorizationRule("test-resource", rule);

      const rules = service.getAuthorizationRules("test-resource");
      expect(rules).toBeDefined();
      expect(Array.isArray(rules)).toBe(true);
    });

    it("should return empty array for non-existent resource", () => {
      const rules = service.getAuthorizationRules("non-existent-resource");
      expect(rules).toEqual([]);
    });

    it("should handle rule management errors gracefully", () => {
      expect(() => {
        service.addAuthorizationRule("", null as any);
      }).not.toThrow();

      expect(() => {
        service.removeAuthorizationRule("", -1);
      }).not.toThrow();
    });
  });

  describe("checkRequestPermission", () => {
    it("should check request permission with user context", async () => {
      const mockUser: UserContext = {
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
        roles: ["user"],
        permissions: ["users:read"],
        tenantId: "test-tenant",
        isolationLevel: "user",
      };

      const mockRequest = {
        user: mockUser,
        isolationContext: {
          tenantId: "test-tenant",
          organizationId: "org-123",
          departmentId: "dept-123",
          userId: "user-123",
          isolationLevel: "user",
          sharingLevel: "private",
        },
      } as any;

      const result = await service.checkRequestPermission(
        mockRequest,
        "users",
        "read",
      );

      expect(result).toBe(true);
    });

    it("should deny request permission without user context", async () => {
      const mockRequest = {
        user: null,
        isolationContext: null,
      } as any;

      const result = await service.checkRequestPermission(
        mockRequest,
        "users",
        "read",
      );

      expect(result).toBe(false);
    });

    it("should handle request permission check errors", async () => {
      const invalidRequest = null as any;

      const result = await service.checkRequestPermission(
        invalidRequest,
        "users",
        "read",
      );

      expect(result).toBe(false);
    });
  });

  describe("default rules initialization", () => {
    it("should have default rules for users", () => {
      const rules = service.getAuthorizationRules("users");
      expect(rules.length).toBeGreaterThan(0);
    });

    it("should have default rules for tenants", () => {
      const rules = service.getAuthorizationRules("tenants");
      expect(rules.length).toBeGreaterThan(0);
    });

    it("should have default rules for organizations", () => {
      const rules = service.getAuthorizationRules("organizations");
      expect(rules.length).toBeGreaterThan(0);
    });
  });

  describe("edge cases", () => {
    it("should handle null user gracefully", async () => {
      const result = await service.checkPermission(
        null as any,
        "users",
        "read",
        null,
      );

      expect(result).toBe(false);
    });

    it("should handle null context gracefully", async () => {
      const mockUser: UserContext = {
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
        roles: ["user"],
        permissions: ["users:read"],
        tenantId: "test-tenant",
        isolationLevel: "user",
      };

      const result = await service.checkPermission(
        mockUser,
        "users",
        "read",
        null,
      );

      expect(result).toBe(true);
    });

    it("should handle empty roles and permissions", async () => {
      const userWithEmptyPermissions: UserContext = {
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
        roles: [],
        permissions: [],
        tenantId: "test-tenant",
        isolationLevel: "user",
      };

      const result = await service.checkPermission(
        userWithEmptyPermissions,
        "users",
        "read",
        null,
      );

      expect(result).toBe(false);
    });

    it("should handle undefined roles and permissions", async () => {
      const userWithUndefinedPermissions: UserContext = {
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
        roles: undefined as any,
        permissions: undefined as any,
        tenantId: "test-tenant",
        isolationLevel: "user",
      };

      const result = await service.checkPermission(
        userWithUndefinedPermissions,
        "users",
        "read",
        null,
      );

      expect(result).toBe(false);
    });
  });
});
