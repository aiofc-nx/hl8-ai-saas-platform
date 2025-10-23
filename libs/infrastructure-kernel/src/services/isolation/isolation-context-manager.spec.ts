/**
 * 隔离上下文管理器单元测试
 *
 * @description 测试 IsolationContextManager 的上下文管理功能
 * @since 1.0.0
 */

import { Test, TestingModule } from "@nestjs/testing";
import { IsolationContextManager } from "../../src/services/isolation/isolation-context-manager.js";
import { IsolationLevel } from "@hl8/domain-kernel";
import type { IsolationContext } from "../../src/types/isolation.types.js";

describe("IsolationContextManager", () => {
  let service: IsolationContextManager;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IsolationContextManager],
    }).compile();

    service = module.get<IsolationContextManager>(IsolationContextManager);
  });

  afterEach(async () => {
    await module.close();
  });

  describe("createContext", () => {
    it("should create context with tenant ID only", () => {
      // Arrange
      const tenantId = "tenant-1";

      // Act
      const context = service.createContext(tenantId);

      // Assert
      expect(context.tenantId).toBe(tenantId);
      expect(context.organizationId).toBeUndefined();
      expect(context.departmentId).toBeUndefined();
      expect(context.userId).toBeUndefined();
      expect(context.sharingLevel).toBe("TENANT");
      expect(context.isShared).toBe(false);
      expect(context.accessRules).toEqual([]);
      expect(context.createdAt).toBeInstanceOf(Date);
      expect(context.updatedAt).toBeInstanceOf(Date);
    });

    it("should create context with tenant and organization ID", () => {
      // Arrange
      const tenantId = "tenant-1";
      const organizationId = "org-1";

      // Act
      const context = service.createContext(tenantId, organizationId);

      // Assert
      expect(context.tenantId).toBe(tenantId);
      expect(context.organizationId).toBe(organizationId);
      expect(context.departmentId).toBeUndefined();
      expect(context.userId).toBeUndefined();
      expect(context.sharingLevel).toBe("ORGANIZATION");
    });

    it("should create context with tenant, organization and department ID", () => {
      // Arrange
      const tenantId = "tenant-1";
      const organizationId = "org-1";
      const departmentId = "dept-1";

      // Act
      const context = service.createContext(
        tenantId,
        organizationId,
        departmentId,
      );

      // Assert
      expect(context.tenantId).toBe(tenantId);
      expect(context.organizationId).toBe(organizationId);
      expect(context.departmentId).toBe(departmentId);
      expect(context.userId).toBeUndefined();
      expect(context.sharingLevel).toBe("DEPARTMENT");
    });

    it("should create context with all IDs", () => {
      // Arrange
      const tenantId = "tenant-1";
      const organizationId = "org-1";
      const departmentId = "dept-1";
      const userId = "user-1";

      // Act
      const context = service.createContext(
        tenantId,
        organizationId,
        departmentId,
        userId,
      );

      // Assert
      expect(context.tenantId).toBe(tenantId);
      expect(context.organizationId).toBe(organizationId);
      expect(context.departmentId).toBe(departmentId);
      expect(context.userId).toBe(userId);
      expect(context.sharingLevel).toBe("USER");
    });

    it("should create context with platform level when no tenant ID", () => {
      // Arrange
      const tenantId = "";

      // Act
      const context = service.createContext(tenantId);

      // Assert
      expect(context.tenantId).toBe(tenantId);
      expect(context.sharingLevel).toBe("PLATFORM");
    });
  });

  describe("getCurrentContext", () => {
    it("should return null when no context is set", () => {
      // Act
      const context = service.getCurrentContext();

      // Assert
      expect(context).toBeNull();
    });

    it("should return current context when set", () => {
      // Arrange
      const context = service.createContext("tenant-1", "org-1");
      service.setContext(context);

      // Act
      const currentContext = service.getCurrentContext();

      // Assert
      expect(currentContext).toBe(context);
    });
  });

  describe("setContext", () => {
    it("should set current context", () => {
      // Arrange
      const context = service.createContext("tenant-1", "org-1");

      // Act
      service.setContext(context);

      // Assert
      expect(service.getCurrentContext()).toBe(context);
    });

    it("should add context to history", () => {
      // Arrange
      const context = service.createContext("tenant-1", "org-1");

      // Act
      service.setContext(context);

      // Assert
      expect(service.getContextStack().length).toBe(1);
      expect(service.getContextStack()[0]).toBe(context);
    });

    it("should limit context history size", () => {
      // Arrange
      const maxHistorySize = 3;
      (service as any).maxHistorySize = maxHistorySize;

      // Act
      for (let i = 0; i < maxHistorySize + 2; i++) {
        const context = service.createContext(`tenant-${i}`);
        service.setContext(context);
      }

      // Assert
      expect(service.getContextStack().length).toBe(maxHistorySize);
    });
  });

  describe("clearContext", () => {
    it("should clear current context", () => {
      // Arrange
      const context = service.createContext("tenant-1", "org-1");
      service.setContext(context);

      // Act
      service.clearContext();

      // Assert
      expect(service.getCurrentContext()).toBeNull();
    });

    it("should clear context history", () => {
      // Arrange
      const context = service.createContext("tenant-1", "org-1");
      service.setContext(context);

      // Act
      service.clearContext();

      // Assert
      expect(service.getContextStack().length).toBe(0);
    });
  });

  describe("withContext", () => {
    it("should execute function with context", async () => {
      // Arrange
      const context = service.createContext("tenant-1", "org-1");
      const testFunction = jest.fn().mockResolvedValue("result");

      // Act
      const result = await service.withContext(context, testFunction);

      // Assert
      expect(result).toBe("result");
      expect(testFunction).toHaveBeenCalled();
    });

    it("should restore previous context after execution", async () => {
      // Arrange
      const originalContext = service.createContext("tenant-1", "org-1");
      const newContext = service.createContext("tenant-2", "org-2");

      service.setContext(originalContext);
      const testFunction = jest.fn().mockResolvedValue("result");

      // Act
      await service.withContext(newContext, testFunction);

      // Assert
      expect(service.getCurrentContext()).toBe(originalContext);
    });

    it("should handle function errors and restore context", async () => {
      // Arrange
      const originalContext = service.createContext("tenant-1", "org-1");
      const newContext = service.createContext("tenant-2", "org-2");

      service.setContext(originalContext);
      const testFunction = jest
        .fn()
        .mockRejectedValue(new Error("Test _error"));

      // Act & Assert
      await expect(
        service.withContext(newContext, testFunction),
      ).rejects.toThrow("Test _error");
      expect(service.getCurrentContext()).toBe(originalContext);
    });
  });

  describe("isContextActive", () => {
    it("should return false when no context is set", () => {
      // Act
      const isActive = service.isContextActive();

      // Assert
      expect(isActive).toBe(false);
    });

    it("should return true when context is set", () => {
      // Arrange
      const context = service.createContext("tenant-1", "org-1");
      service.setContext(context);

      // Act
      const isActive = service.isContextActive();

      // Assert
      expect(isActive).toBe(true);
    });
  });

  describe("getContextStack", () => {
    it("should return empty array when no contexts", () => {
      // Act
      const stack = service.getContextStack();

      // Assert
      expect(stack).toEqual([]);
    });

    it("should return context stack", () => {
      // Arrange
      const context1 = service.createContext("tenant-1", "org-1");
      const context2 = service.createContext("tenant-2", "org-2");

      service.setContext(context1);
      service.setContext(context2);

      // Act
      const stack = service.getContextStack();

      // Assert
      expect(stack.length).toBe(2);
      expect(stack[0]).toBe(context1);
      expect(stack[1]).toBe(context2);
    });
  });

  describe("validateContext", () => {
    it("should return true for valid context", () => {
      // Arrange
      const context = service.createContext("tenant-1", "org-1");

      // Act
      const isValid = service.validateContext(context);

      // Assert
      expect(isValid).toBe(true);
    });

    it("should return false for context without tenant ID", () => {
      // Arrange
      const context = service.createContext("");

      // Act
      const isValid = service.validateContext(context);

      // Assert
      expect(isValid).toBe(false);
    });

    it("should return false for null context", () => {
      // Act
      const isValid = service.validateContext(null);

      // Assert
      expect(isValid).toBe(false);
    });

    it("should return false for context without required properties", () => {
      // Arrange
      const context = {};

      // Act
      const isValid = service.validateContext(context);

      // Assert
      expect(isValid).toBe(false);
    });
  });

  describe("getContextInfo", () => {
    it("should return context information", () => {
      // Arrange
      const context = service.createContext(
        "tenant-1",
        "org-1",
        "dept-1",
        "user-1",
      );
      service.setContext(context);

      // Act
      const info = service.getContextInfo();

      // Assert
      expect(info).toEqual({
        isActive: true,
        stackSize: 1,
        currentSharingLevel: "USER",
        currentTenantId: "tenant-1",
        currentOrganizationId: "org-1",
        currentDepartmentId: "dept-1",
        currentUserId: "user-1",
      });
    });

    it("should return inactive info when no context", () => {
      // Act
      const info = service.getContextInfo();

      // Assert
      expect(info).toEqual({
        isActive: false,
        stackSize: 0,
        currentSharingLevel: null,
        currentTenantId: null,
        currentOrganizationId: null,
        currentDepartmentId: null,
        currentUserId: null,
      });
    });
  });

  describe("cloneContext", () => {
    it("should clone context with new properties", () => {
      // Arrange
      const originalContext = service.createContext("tenant-1", "org-1");
      const newProperties = {
        departmentId: "dept-1",
        userId: "user-1",
      };

      // Act
      const clonedContext = service.cloneContext(
        originalContext,
        newProperties,
      );

      // Assert
      expect(clonedContext.tenantId).toBe("tenant-1");
      expect(clonedContext.organizationId).toBe("org-1");
      expect(clonedContext.departmentId).toBe("dept-1");
      expect(clonedContext.userId).toBe("user-1");
      expect(clonedContext.sharingLevel).toBe("USER");
      expect(clonedContext.isShared).toBe(false);
      expect(clonedContext.accessRules).toEqual([]);
      expect(clonedContext.createdAt).toBeInstanceOf(Date);
      expect(clonedContext.updatedAt).toBeInstanceOf(Date);
    });

    it("should override existing properties", () => {
      // Arrange
      const originalContext = service.createContext("tenant-1", "org-1");
      const newProperties = {
        organizationId: "org-2",
        departmentId: "dept-1",
      };

      // Act
      const clonedContext = service.cloneContext(
        originalContext,
        newProperties,
      );

      // Assert
      expect(clonedContext.tenantId).toBe("tenant-1");
      expect(clonedContext.organizationId).toBe("org-2");
      expect(clonedContext.departmentId).toBe("dept-1");
      expect(clonedContext.sharingLevel).toBe("DEPARTMENT");
    });
  });

  describe("mergeContexts", () => {
    it("should merge two contexts", () => {
      // Arrange
      const context1 = service.createContext("tenant-1", "org-1");
      const context2 = service.createContext("tenant-2", "org-2", "dept-2");

      // Act
      const mergedContext = service.mergeContexts(context1, context2);

      // Assert
      expect(mergedContext.tenantId).toBe("tenant-2");
      expect(mergedContext.organizationId).toBe("org-2");
      expect(mergedContext.departmentId).toBe("dept-2");
      expect(mergedContext.sharingLevel).toBe("DEPARTMENT");
    });

    it("should prefer non-null values from second context", () => {
      // Arrange
      const context1 = service.createContext("tenant-1", "org-1", "dept-1");
      const context2 = service.createContext("tenant-2");

      // Act
      const mergedContext = service.mergeContexts(context1, context2);

      // Assert
      expect(mergedContext.tenantId).toBe("tenant-2");
      expect(mergedContext.organizationId).toBe("org-1");
      expect(mergedContext.departmentId).toBe("dept-1");
      expect(mergedContext.sharingLevel).toBe("DEPARTMENT");
    });
  });
});
