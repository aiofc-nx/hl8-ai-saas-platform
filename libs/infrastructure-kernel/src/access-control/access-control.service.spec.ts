/**
 * 访问控制服务单元测试
 *
 * @description 测试 AccessControlService 的访问控制功能
 * @since 1.0.0
 */

import { AccessControlService } from "../../src/access-control/access-control.service.js";
import { IsolationLevel } from "@hl8/domain-kernel";
import type { IsolationContext } from "../../src/types/isolation.types.js";

describe("AccessControlService", () => {
  let service: AccessControlService;

  beforeEach(() => {
    service = new AccessControlService();
  });

  describe("canAccess", () => {
    it("should allow access when user has sufficient isolation level", () => {
      // Arrange
      const userContext: IsolationContext = {
        tenantId: "tenant-1",
        organizationId: "org-1",
        departmentId: "dept-1",
        userId: "user-1",
        isolationLevel: IsolationLevel.USER,
      };

      const resourceContext: IsolationContext = {
        tenantId: "tenant-1",
        organizationId: "org-1",
        departmentId: "dept-1",
        userId: "user-1",
        isolationLevel: IsolationLevel.USER,
      };

      // Act
      const result = service.canAccess(
        userContext,
        resourceContext,
        IsolationLevel.USER,
      );

      // Assert
      expect(result).toBe(true);
    });

    it("should deny access when user lacks required isolation level", () => {
      // Arrange
      const userContext: IsolationContext = {
        tenantId: "tenant-1",
        organizationId: "org-1",
        departmentId: "dept-1",
        userId: "user-1",
        isolationLevel: IsolationLevel.USER,
      };

      const resourceContext: IsolationContext = {
        tenantId: "tenant-1",
        organizationId: "org-1",
        departmentId: "dept-1",
        userId: "user-1",
        isolationLevel: IsolationLevel.USER,
      };

      // Act
      const result = service.canAccess(
        userContext,
        resourceContext,
        IsolationLevel.SUPER_ADMIN,
      );

      // Assert
      expect(result).toBe(false);
    });

    it("should allow tenant-level access for tenant-level user", () => {
      // Arrange
      const userContext: IsolationContext = {
        tenantId: "tenant-1",
        organizationId: "org-1",
        departmentId: "dept-1",
        userId: "user-1",
        isolationLevel: IsolationLevel.TENANT,
      };

      const resourceContext: IsolationContext = {
        tenantId: "tenant-1",
        organizationId: "org-2",
        departmentId: "dept-2",
        userId: "user-2",
        isolationLevel: IsolationLevel.USER,
      };

      // Act
      const result = service.canAccess(
        userContext,
        resourceContext,
        IsolationLevel.TENANT,
      );

      // Assert
      expect(result).toBe(true);
    });

    it("should deny cross-tenant access", () => {
      // Arrange
      const userContext: IsolationContext = {
        tenantId: "tenant-1",
        organizationId: "org-1",
        departmentId: "dept-1",
        userId: "user-1",
        isolationLevel: IsolationLevel.USER,
      };

      const resourceContext: IsolationContext = {
        tenantId: "tenant-2", // Different tenant
        organizationId: "org-1",
        departmentId: "dept-1",
        userId: "user-1",
        isolationLevel: IsolationLevel.USER,
      };

      // Act
      const result = service.canAccess(
        userContext,
        resourceContext,
        IsolationLevel.USER,
      );

      // Assert
      expect(result).toBe(false);
    });

    it("should allow organization-level access for organization-level user", () => {
      // Arrange
      const userContext: IsolationContext = {
        tenantId: "tenant-1",
        organizationId: "org-1",
        departmentId: "dept-1",
        userId: "user-1",
        isolationLevel: IsolationLevel.ORGANIZATION,
      };

      const resourceContext: IsolationContext = {
        tenantId: "tenant-1",
        organizationId: "org-1",
        departmentId: "dept-2",
        userId: "user-2",
        isolationLevel: IsolationLevel.USER,
      };

      // Act
      const result = service.canAccess(
        userContext,
        resourceContext,
        IsolationLevel.ORGANIZATION,
      );

      // Assert
      expect(result).toBe(true);
    });

    it("should deny cross-organization access", () => {
      // Arrange
      const userContext: IsolationContext = {
        tenantId: "tenant-1",
        organizationId: "org-1",
        departmentId: "dept-1",
        userId: "user-1",
        isolationLevel: IsolationLevel.ORGANIZATION,
      };

      const resourceContext: IsolationContext = {
        tenantId: "tenant-1",
        organizationId: "org-2", // Different organization
        departmentId: "dept-1",
        userId: "user-1",
        isolationLevel: IsolationLevel.USER,
      };

      // Act
      const result = service.canAccess(
        userContext,
        resourceContext,
        IsolationLevel.ORGANIZATION,
      );

      // Assert
      expect(result).toBe(false);
    });

    it("should allow department-level access for department-level user", () => {
      // Arrange
      const userContext: IsolationContext = {
        tenantId: "tenant-1",
        organizationId: "org-1",
        departmentId: "dept-1",
        userId: "user-1",
        isolationLevel: IsolationLevel.DEPARTMENT,
      };

      const resourceContext: IsolationContext = {
        tenantId: "tenant-1",
        organizationId: "org-1",
        departmentId: "dept-1",
        userId: "user-2",
        isolationLevel: IsolationLevel.USER,
      };

      // Act
      const result = service.canAccess(
        userContext,
        resourceContext,
        IsolationLevel.DEPARTMENT,
      );

      // Assert
      expect(result).toBe(true);
    });

    it("should deny cross-department access", () => {
      // Arrange
      const userContext: IsolationContext = {
        tenantId: "tenant-1",
        organizationId: "org-1",
        departmentId: "dept-1",
        userId: "user-1",
        isolationLevel: IsolationLevel.DEPARTMENT,
      };

      const resourceContext: IsolationContext = {
        tenantId: "tenant-1",
        organizationId: "org-1",
        departmentId: "dept-2", // Different department
        userId: "user-1",
        isolationLevel: IsolationLevel.USER,
      };

      // Act
      const result = service.canAccess(
        userContext,
        resourceContext,
        IsolationLevel.DEPARTMENT,
      );

      // Assert
      expect(result).toBe(false);
    });

    it("should allow super admin access to any resource", () => {
      // Arrange
      const userContext: IsolationContext = {
        tenantId: "tenant-1",
        organizationId: "org-1",
        departmentId: "dept-1",
        userId: "user-1",
        isolationLevel: IsolationLevel.SUPER_ADMIN,
      };

      const resourceContext: IsolationContext = {
        tenantId: "tenant-2",
        organizationId: "org-2",
        departmentId: "dept-2",
        userId: "user-2",
        isolationLevel: IsolationLevel.USER,
      };

      // Act
      const result = service.canAccess(
        userContext,
        resourceContext,
        IsolationLevel.SUPER_ADMIN,
      );

      // Assert
      expect(result).toBe(true);
    });
  });

  describe("hasRequiredLevel", () => {
    it("should return true when user level is higher than required", () => {
      // Arrange
      const userContext: IsolationContext = {
        tenantId: "tenant-1",
        organizationId: "org-1",
        departmentId: "dept-1",
        userId: "user-1",
        isolationLevel: IsolationLevel.TENANT,
      };

      // Act
      const result = (service as any).hasRequiredLevel(
        userContext,
        IsolationLevel.USER,
      );

      // Assert
      expect(result).toBe(true);
    });

    it("should return false when user level is lower than required", () => {
      // Arrange
      const userContext: IsolationContext = {
        tenantId: "tenant-1",
        organizationId: "org-1",
        departmentId: "dept-1",
        userId: "user-1",
        isolationLevel: IsolationLevel.USER,
      };

      // Act
      const result = (service as any).hasRequiredLevel(
        userContext,
        IsolationLevel.TENANT,
      );

      // Assert
      expect(result).toBe(false);
    });

    it("should return true when user level equals required level", () => {
      // Arrange
      const userContext: IsolationContext = {
        tenantId: "tenant-1",
        organizationId: "org-1",
        departmentId: "dept-1",
        userId: "user-1",
        isolationLevel: IsolationLevel.USER,
      };

      // Act
      const result = (service as any).hasRequiredLevel(
        userContext,
        IsolationLevel.USER,
      );

      // Assert
      expect(result).toBe(true);
    });
  });

  describe("checkResourceAccess", () => {
    it("should allow access when contexts match", () => {
      // Arrange
      const userContext: IsolationContext = {
        tenantId: "tenant-1",
        organizationId: "org-1",
        departmentId: "dept-1",
        userId: "user-1",
        isolationLevel: IsolationLevel.USER,
      };

      const resourceContext: IsolationContext = {
        tenantId: "tenant-1",
        organizationId: "org-1",
        departmentId: "dept-1",
        userId: "user-1",
        isolationLevel: IsolationLevel.USER,
      };

      // Act
      const result = (service as any).checkResourceAccess(
        userContext,
        resourceContext,
      );

      // Assert
      expect(result).toBe(true);
    });

    it("should deny access when tenant IDs don't match", () => {
      // Arrange
      const userContext: IsolationContext = {
        tenantId: "tenant-1",
        organizationId: "org-1",
        departmentId: "dept-1",
        userId: "user-1",
        isolationLevel: IsolationLevel.USER,
      };

      const resourceContext: IsolationContext = {
        tenantId: "tenant-2",
        organizationId: "org-1",
        departmentId: "dept-1",
        userId: "user-1",
        isolationLevel: IsolationLevel.USER,
      };

      // Act
      const result = (service as any).checkResourceAccess(
        userContext,
        resourceContext,
      );

      // Assert
      expect(result).toBe(false);
    });

    it("should deny access when organization IDs don't match", () => {
      // Arrange
      const userContext: IsolationContext = {
        tenantId: "tenant-1",
        organizationId: "org-1",
        departmentId: "dept-1",
        userId: "user-1",
        isolationLevel: IsolationLevel.USER,
      };

      const resourceContext: IsolationContext = {
        tenantId: "tenant-1",
        organizationId: "org-2",
        departmentId: "dept-1",
        userId: "user-1",
        isolationLevel: IsolationLevel.USER,
      };

      // Act
      const result = (service as any).checkResourceAccess(
        userContext,
        resourceContext,
      );

      // Assert
      expect(result).toBe(false);
    });

    it("should deny access when department IDs don't match", () => {
      // Arrange
      const userContext: IsolationContext = {
        tenantId: "tenant-1",
        organizationId: "org-1",
        departmentId: "dept-1",
        userId: "user-1",
        isolationLevel: IsolationLevel.USER,
      };

      const resourceContext: IsolationContext = {
        tenantId: "tenant-1",
        organizationId: "org-1",
        departmentId: "dept-2",
        userId: "user-1",
        isolationLevel: IsolationLevel.USER,
      };

      // Act
      const result = (service as any).checkResourceAccess(
        userContext,
        resourceContext,
      );

      // Assert
      expect(result).toBe(false);
    });

    it("should deny access when user IDs don't match", () => {
      // Arrange
      const userContext: IsolationContext = {
        tenantId: "tenant-1",
        organizationId: "org-1",
        departmentId: "dept-1",
        userId: "user-1",
        isolationLevel: IsolationLevel.USER,
      };

      const resourceContext: IsolationContext = {
        tenantId: "tenant-1",
        organizationId: "org-1",
        departmentId: "dept-1",
        userId: "user-2",
        isolationLevel: IsolationLevel.USER,
      };

      // Act
      const result = (service as any).checkResourceAccess(
        userContext,
        resourceContext,
      );

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("compareIsolationLevels", () => {
    it("should return 1 when first level is higher than second", () => {
      // Act
      const result = (service as any).compareIsolationLevels(
        IsolationLevel.SUPER_ADMIN,
        IsolationLevel.USER,
      );

      // Assert
      expect(result).toBe(1);
    });

    it("should return -1 when first level is lower than second", () => {
      // Act
      const result = (service as any).compareIsolationLevels(
        IsolationLevel.USER,
        IsolationLevel.SUPER_ADMIN,
      );

      // Assert
      expect(result).toBe(-1);
    });

    it("should return 0 when levels are equal", () => {
      // Act
      const result = (service as any).compareIsolationLevels(
        IsolationLevel.USER,
        IsolationLevel.USER,
      );

      // Assert
      expect(result).toBe(0);
    });

    it("should correctly compare all isolation levels", () => {
      // Arrange
      const levels = [
        IsolationLevel.USER,
        IsolationLevel.DEPARTMENT,
        IsolationLevel.ORGANIZATION,
        IsolationLevel.TENANT,
        IsolationLevel.SUPER_ADMIN,
      ];

      // Act & Assert
      for (let i = 0; i < levels.length; i++) {
        for (let j = 0; j < levels.length; j++) {
          const result = (service as any).compareIsolationLevels(
            levels[i],
            levels[j],
          );

          if (i > j) {
            expect(result).toBe(1);
          } else if (i < j) {
            expect(result).toBe(-1);
          } else {
            expect(result).toBe(0);
          }
        }
      }
    });
  });

  describe("getIsolationLevel", () => {
    it("should return the correct isolation level", () => {
      // Arrange
      const context: IsolationContext = {
        tenantId: "tenant-1",
        organizationId: "org-1",
        departmentId: "dept-1",
        userId: "user-1",
        isolationLevel: IsolationLevel.USER,
      };

      // Act
      const result = (service as any).getIsolationLevel(context);

      // Assert
      expect(result).toBe(IsolationLevel.USER);
    });

    it("should return USER level when no isolation level is specified", () => {
      // Arrange
      const context: IsolationContext = {
        tenantId: "tenant-1",
        organizationId: "org-1",
        departmentId: "dept-1",
        userId: "user-1",
      };

      // Act
      const result = (service as any).getIsolationLevel(context);

      // Assert
      expect(result).toBe(IsolationLevel.USER);
    });
  });
});
