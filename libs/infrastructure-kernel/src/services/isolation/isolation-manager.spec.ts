/**
 * 隔离管理器单元测试
 *
 * @description 测试 IsolationManager 的隔离管理功能
 * @since 1.0.0
 */

import { Test, TestingModule } from "@nestjs/testing";
import { IsolationManager } from "../../src/services/isolation/isolation-manager.js";
import { IsolationContextManager } from "../../src/services/isolation/isolation-context-manager.js";
import { AccessControlService } from "../../src/services/isolation/access-control-service.js";
import { AuditLogService } from "../../src/services/isolation/audit-log-service.js";
import { SecurityMonitorService } from "../../src/services/isolation/security-monitor-service.js";
import { IsolationLevel } from "@hl8/domain-kernel";
import type { IsolationContext } from "../../src/types/isolation.types.js";

describe("IsolationManager", () => {
  let service: IsolationManager;
  let mockContextManager: jest.Mocked<IsolationContextManager>;
  let mockAccessControlService: jest.Mocked<AccessControlService>;
  let mockAuditLogService: jest.Mocked<AuditLogService>;
  let mockSecurityMonitorService: jest.Mocked<SecurityMonitorService>;

  beforeEach(async () => {
    // Create mocks
    mockContextManager = {
      getCurrentContext: jest.fn(),
      setContext: jest.fn(),
      clearContext: jest.fn(),
      withContext: jest.fn(),
      isContextActive: jest.fn(),
      getContextStack: jest.fn(),
    } as any;

    mockAccessControlService = {
      canAccess: jest.fn(),
      checkPermission: jest.fn(),
      validateAccess: jest.fn(),
    } as any;

    mockAuditLogService = {
      logAccess: jest.fn(),
      logOperation: jest.fn(),
      logSecurityEvent: jest.fn(),
      getAuditLogs: jest.fn(),
    } as any;

    mockSecurityMonitorService = {
      monitorAccess: jest.fn(),
      detectAnomaly: jest.fn(),
      reportViolation: jest.fn(),
      getSecurityMetrics: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IsolationManager,
        {
          provide: IsolationContextManager,
          useValue: mockContextManager,
        },
        {
          provide: AccessControlService,
          useValue: mockAccessControlService,
        },
        {
          provide: AuditLogService,
          useValue: mockAuditLogService,
        },
        {
          provide: SecurityMonitorService,
          useValue: mockSecurityMonitorService,
        },
      ],
    }).compile();

    service = module.get<IsolationManager>(IsolationManager);
  });

  afterEach(async () => {
    await module.close();
  });

  describe("registerService", () => {
    it("should register a service", () => {
      // Arrange
      const serviceName = "test-service";
      const testService = { name: "test" };

      // Act
      service.registerService(serviceName, testService);

      // Assert
      expect(service.getService(serviceName)).toBe(testService);
    });

    it("should overwrite existing service", () => {
      // Arrange
      const serviceName = "test-service";
      const firstService = { name: "first" };
      const secondService = { name: "second" };

      // Act
      service.registerService(serviceName, firstService);
      service.registerService(serviceName, secondService);

      // Assert
      expect(service.getService(serviceName)).toBe(secondService);
    });
  });

  describe("getService", () => {
    it("should return registered service", () => {
      // Arrange
      const serviceName = "test-service";
      const testService = { name: "test" };
      service.registerService(serviceName, testService);

      // Act
      const result = service.getService(serviceName);

      // Assert
      expect(result).toBe(testService);
    });

    it("should return undefined for unregistered service", () => {
      // Act
      const result = service.getService("non-existent-service");

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe("getAllServices", () => {
    it("should return all registered services", () => {
      // Arrange
      const service1 = { name: "service1" };
      const service2 = { name: "service2" };
      service.registerService("service1", service1);
      service.registerService("service2", service2);

      // Act
      const result = service.getAllServices();

      // Assert
      expect(result).toEqual({
        service1,
        service2,
      });
    });

    it("should return empty object when no services registered", () => {
      // Act
      const result = service.getAllServices();

      // Assert
      expect(result).toEqual({});
    });
  });

  describe("validateAccess", () => {
    it("should validate access using access control service", () => {
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

      mockAccessControlService.canAccess.mockReturnValue(true);

      // Act
      const result = service.validateAccess(
        userContext,
        resourceContext,
        IsolationLevel.USER,
      );

      // Assert
      expect(mockAccessControlService.canAccess).toHaveBeenCalledWith(
        userContext,
        resourceContext,
        IsolationLevel.USER,
      );
      expect(result).toBe(true);
    });

    it("should log access attempt", () => {
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

      mockAccessControlService.canAccess.mockReturnValue(true);

      // Act
      service.validateAccess(userContext, resourceContext, IsolationLevel.USER);

      // Assert
      expect(mockAuditLogService.logAccess).toHaveBeenCalledWith(
        userContext,
        resourceContext,
        true,
      );
    });

    it("should monitor access attempt", () => {
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

      mockAccessControlService.canAccess.mockReturnValue(true);

      // Act
      service.validateAccess(userContext, resourceContext, IsolationLevel.USER);

      // Assert
      expect(mockSecurityMonitorService.monitorAccess).toHaveBeenCalledWith(
        userContext,
        resourceContext,
      );
    });
  });

  describe("checkPermission", () => {
    it("should check permission using access control service", () => {
      // Arrange
      const userContext: IsolationContext = {
        tenantId: "tenant-1",
        organizationId: "org-1",
        departmentId: "dept-1",
        userId: "user-1",
        isolationLevel: IsolationLevel.USER,
      };

      const permission = "read:users";

      mockAccessControlService.checkPermission.mockReturnValue(true);

      // Act
      const result = service.checkPermission(userContext, permission);

      // Assert
      expect(mockAccessControlService.checkPermission).toHaveBeenCalledWith(
        userContext,
        permission,
      );
      expect(result).toBe(true);
    });
  });

  describe("validateAccessWithContext", () => {
    it("should validate access with current context", () => {
      // Arrange
      const currentContext: IsolationContext = {
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

      mockContextManager.getCurrentContext.mockReturnValue(currentContext);
      mockAccessControlService.canAccess.mockReturnValue(true);

      // Act
      const result = service.validateAccessWithContext(
        resourceContext,
        IsolationLevel.USER,
      );

      // Assert
      expect(mockContextManager.getCurrentContext).toHaveBeenCalled();
      expect(mockAccessControlService.canAccess).toHaveBeenCalledWith(
        currentContext,
        resourceContext,
        IsolationLevel.USER,
      );
      expect(result).toBe(true);
    });

    it("should throw _error when no current context", () => {
      // Arrange
      const resourceContext: IsolationContext = {
        tenantId: "tenant-1",
        organizationId: "org-1",
        departmentId: "dept-1",
        userId: "user-1",
        isolationLevel: IsolationLevel.USER,
      };

      mockContextManager.getCurrentContext.mockReturnValue(null);

      // Act & Assert
      expect(() => {
        service.validateAccessWithContext(resourceContext, IsolationLevel.USER);
      }).toThrow("No isolation context available");
    });
  });

  describe("checkPermissionWithContext", () => {
    it("should check permission with current context", () => {
      // Arrange
      const currentContext: IsolationContext = {
        tenantId: "tenant-1",
        organizationId: "org-1",
        departmentId: "dept-1",
        userId: "user-1",
        isolationLevel: IsolationLevel.USER,
      };

      const permission = "read:users";

      mockContextManager.getCurrentContext.mockReturnValue(currentContext);
      mockAccessControlService.checkPermission.mockReturnValue(true);

      // Act
      const result = service.checkPermissionWithContext(permission);

      // Assert
      expect(mockContextManager.getCurrentContext).toHaveBeenCalled();
      expect(mockAccessControlService.checkPermission).toHaveBeenCalledWith(
        currentContext,
        permission,
      );
      expect(result).toBe(true);
    });

    it("should throw _error when no current context", () => {
      // Arrange
      const permission = "read:users";

      mockContextManager.getCurrentContext.mockReturnValue(null);

      // Act & Assert
      expect(() => {
        service.checkPermissionWithContext(permission);
      }).toThrow("No isolation context available");
    });
  });

  describe("getCurrentContext", () => {
    it("should return current context from context manager", () => {
      // Arrange
      const currentContext: IsolationContext = {
        tenantId: "tenant-1",
        organizationId: "org-1",
        departmentId: "dept-1",
        userId: "user-1",
        isolationLevel: IsolationLevel.USER,
      };

      mockContextManager.getCurrentContext.mockReturnValue(currentContext);

      // Act
      const result = service.getCurrentContext();

      // Assert
      expect(mockContextManager.getCurrentContext).toHaveBeenCalled();
      expect(result).toBe(currentContext);
    });
  });

  describe("setContext", () => {
    it("should set context using context manager", () => {
      // Arrange
      const context: IsolationContext = {
        tenantId: "tenant-1",
        organizationId: "org-1",
        departmentId: "dept-1",
        userId: "user-1",
        isolationLevel: IsolationLevel.USER,
      };

      // Act
      service.setContext(context);

      // Assert
      expect(mockContextManager.setContext).toHaveBeenCalledWith(context);
    });
  });

  describe("clearContext", () => {
    it("should clear context using context manager", () => {
      // Act
      service.clearContext();

      // Assert
      expect(mockContextManager.clearContext).toHaveBeenCalled();
    });
  });

  describe("withContext", () => {
    it("should execute function with context", async () => {
      // Arrange
      const context: IsolationContext = {
        tenantId: "tenant-1",
        organizationId: "org-1",
        departmentId: "dept-1",
        userId: "user-1",
        isolationLevel: IsolationLevel.USER,
      };

      const testFunction = jest.fn().mockResolvedValue("result");

      mockContextManager.withContext.mockResolvedValue("result");

      // Act
      const result = await service.withContext(context, testFunction);

      // Assert
      expect(mockContextManager.withContext).toHaveBeenCalledWith(
        context,
        testFunction,
      );
      expect(result).toBe("result");
    });
  });

  describe("isContextActive", () => {
    it("should check if context is active", () => {
      // Arrange
      mockContextManager.isContextActive.mockReturnValue(true);

      // Act
      const result = service.isContextActive();

      // Assert
      expect(mockContextManager.isContextActive).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe("getContextStack", () => {
    it("should return context stack", () => {
      // Arrange
      const contextStack = [
        {
          tenantId: "tenant-1",
          organizationId: "org-1",
          departmentId: "dept-1",
          userId: "user-1",
          isolationLevel: IsolationLevel.USER,
        },
      ];

      mockContextManager.getContextStack.mockReturnValue(contextStack);

      // Act
      const result = service.getContextStack();

      // Assert
      expect(mockContextManager.getContextStack).toHaveBeenCalled();
      expect(result).toBe(contextStack);
    });
  });

  describe("logOperation", () => {
    it("should log operation using audit log service", () => {
      // Arrange
      const userContext: IsolationContext = {
        tenantId: "tenant-1",
        organizationId: "org-1",
        departmentId: "dept-1",
        userId: "user-1",
        isolationLevel: IsolationLevel.USER,
      };

      const operation = "create:user";
      const details = { userId: "user-123" };

      // Act
      service.logOperation(userContext, operation, details);

      // Assert
      expect(mockAuditLogService.logOperation).toHaveBeenCalledWith(
        userContext,
        operation,
        details,
      );
    });
  });

  describe("logSecurityEvent", () => {
    it("should log security event using audit log service", () => {
      // Arrange
      const userContext: IsolationContext = {
        tenantId: "tenant-1",
        organizationId: "org-1",
        departmentId: "dept-1",
        userId: "user-1",
        isolationLevel: IsolationLevel.USER,
      };

      const event = "unauthorized_access";
      const details = { resource: "sensitive-data" };

      // Act
      service.logSecurityEvent(userContext, event, details);

      // Assert
      expect(mockAuditLogService.logSecurityEvent).toHaveBeenCalledWith(
        userContext,
        event,
        details,
      );
    });
  });

  describe("getAuditLogs", () => {
    it("should get audit logs from audit log service", () => {
      // Arrange
      const filters = { userId: "user-1" };
      const mockLogs = [
        {
          id: "log-1",
          userId: "user-1",
          operation: "read:user",
          timestamp: new Date(),
        },
      ];

      mockAuditLogService.getAuditLogs.mockReturnValue(mockLogs);

      // Act
      const result = service.getAuditLogs(filters);

      // Assert
      expect(mockAuditLogService.getAuditLogs).toHaveBeenCalledWith(filters);
      expect(result).toBe(mockLogs);
    });
  });

  describe("detectAnomaly", () => {
    it("should detect anomaly using security monitor service", () => {
      // Arrange
      const userContext: IsolationContext = {
        tenantId: "tenant-1",
        organizationId: "org-1",
        departmentId: "dept-1",
        userId: "user-1",
        isolationLevel: IsolationLevel.USER,
      };

      const activity = "unusual_access_pattern";

      mockSecurityMonitorService.detectAnomaly.mockReturnValue(true);

      // Act
      const result = service.detectAnomaly(userContext, activity);

      // Assert
      expect(mockSecurityMonitorService.detectAnomaly).toHaveBeenCalledWith(
        userContext,
        activity,
      );
      expect(result).toBe(true);
    });
  });

  describe("reportViolation", () => {
    it("should report violation using security monitor service", () => {
      // Arrange
      const userContext: IsolationContext = {
        tenantId: "tenant-1",
        organizationId: "org-1",
        departmentId: "dept-1",
        userId: "user-1",
        isolationLevel: IsolationLevel.USER,
      };

      const violation = "cross_tenant_access";
      const details = { attemptedTenant: "tenant-2" };

      // Act
      service.reportViolation(userContext, violation, details);

      // Assert
      expect(mockSecurityMonitorService.reportViolation).toHaveBeenCalledWith(
        userContext,
        violation,
        details,
      );
    });
  });

  describe("getSecurityMetrics", () => {
    it("should get security metrics from security monitor service", () => {
      // Arrange
      const mockMetrics = {
        totalAccessAttempts: 100,
        failedAttempts: 5,
        anomalyDetections: 2,
      };

      mockSecurityMonitorService.getSecurityMetrics.mockReturnValue(
        mockMetrics,
      );

      // Act
      const result = service.getSecurityMetrics();

      // Assert
      expect(mockSecurityMonitorService.getSecurityMetrics).toHaveBeenCalled();
      expect(result).toBe(mockMetrics);
    });
  });
});
