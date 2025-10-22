/**
 * 隔离服务测试 - 改进版
 *
 * @description 测试多租户数据隔离功能，修复依赖注入问题
 * @since 1.0.0
 */

import { Test, TestingModule } from "@nestjs/testing";
import { IsolationManager } from "../services/isolation/isolation-manager.js";
import { IsolationContextManager } from "../services/isolation/isolation-context-manager.js";
import { AccessControlService } from "../services/isolation/access-control-service.js";
import { AuditLogService } from "../services/isolation/audit-log-service.js";
import { SecurityMonitorService } from "../services/isolation/security-monitor-service.js";

describe("IsolationManager - 改进版", () => {
  let service: IsolationManager;
  let module: TestingModule;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        IsolationManager,
        {
          provide: IsolationContextManager,
          useValue: {
            createContext: jest.fn().mockReturnValue({
              tenantId: "tenant1",
              organizationId: "org1",
              departmentId: "dept1",
              userId: "user1",
              sharingLevel: "USER",
              isShared: false,
              accessRules: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            }),
            getCurrentContext: jest.fn().mockReturnValue({
              tenantId: "tenant1",
              organizationId: "org1",
              departmentId: "dept1",
              userId: "user1",
              sharingLevel: "USER",
              isShared: false,
              accessRules: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            }),
            setCurrentContext: jest.fn(),
            healthCheck: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: AccessControlService,
          useValue: {
            validateAccess: jest.fn().mockResolvedValue(true),
            applyIsolationFilter: jest.fn().mockReturnValue({
              tenantId: "tenant1",
              organizationId: "org1",
              departmentId: "dept1",
              userId: "user1",
            }),
            filterData: jest
              .fn()
              .mockReturnValue([
                { id: "1", tenantId: "tenant1", organizationId: "org1" },
              ]),
            healthCheck: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: AuditLogService,
          useValue: {
            logAccess: jest.fn().mockResolvedValue(undefined),
            logDataAccess: jest.fn().mockResolvedValue(undefined),
            healthCheck: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: SecurityMonitorService,
          useValue: {
            monitorAccess: jest.fn().mockResolvedValue(undefined),
            detectAnomalies: jest.fn().mockResolvedValue([]),
            healthCheck: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    service = moduleRef.get<IsolationManager>(IsolationManager);
    module = moduleRef;
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  describe("隔离上下文管理", () => {
    it("应该能够创建隔离上下文", () => {
      const context = service.createIsolationContext(
        "tenant1",
        "org1",
        "dept1",
        "user1",
      );
      expect(context).toBeDefined();
      expect(context.tenantId).toBe("tenant1");
      expect(context.organizationId).toBe("org1");
      expect(context.departmentId).toBe("dept1");
      expect(context.userId).toBe("user1");
    });

    it("应该能够设置当前隔离上下文", () => {
      const context = service.createIsolationContext("tenant1");
      expect(() => service.setCurrentIsolationContext(context)).not.toThrow();
    });

    it("应该能够获取当前隔离上下文", () => {
      const context = service.getCurrentIsolationContext();
      expect(context).toBeDefined();
    });

    it("应该能够创建租户级隔离上下文", () => {
      const context = service.createIsolationContext("tenant1");
      expect(context.tenantId).toBe("tenant1");
      expect(context.sharingLevel).toBe("TENANT");
    });

    it("应该能够创建组织级隔离上下文", () => {
      const context = service.createIsolationContext("tenant1", "org1");
      expect(context.tenantId).toBe("tenant1");
      expect(context.organizationId).toBe("org1");
      expect(context.sharingLevel).toBe("ORGANIZATION");
    });

    it("应该能够创建部门级隔离上下文", () => {
      const context = service.createIsolationContext(
        "tenant1",
        "org1",
        "dept1",
      );
      expect(context.tenantId).toBe("tenant1");
      expect(context.organizationId).toBe("org1");
      expect(context.departmentId).toBe("dept1");
      expect(context.sharingLevel).toBe("DEPARTMENT");
    });

    it("应该能够创建用户级隔离上下文", () => {
      const context = service.createIsolationContext(
        "tenant1",
        "org1",
        "dept1",
        "user1",
      );
      expect(context.tenantId).toBe("tenant1");
      expect(context.organizationId).toBe("org1");
      expect(context.departmentId).toBe("dept1");
      expect(context.userId).toBe("user1");
      expect(context.sharingLevel).toBe("USER");
    });
  });

  describe("访问控制", () => {
    it("应该能够验证访问权限", async () => {
      const context = service.createIsolationContext("tenant1");
      const hasAccess = await service.validateAccess(context, {
        id: "resource1",
      });
      expect(hasAccess).toBe(true);
    });

    it("应该能够应用隔离过滤", () => {
      const context = service.createIsolationContext("tenant1");
      const filteredQuery = service.applyIsolationFilter({}, context);
      expect(filteredQuery).toBeDefined();
      expect(filteredQuery.tenantId).toBe("tenant1");
      expect(filteredQuery.organizationId).toBe("org1");
      expect(filteredQuery.departmentId).toBe("dept1");
      expect(filteredQuery.userId).toBe("user1");
    });

    it("应该能够过滤数据", () => {
      const context = service.createIsolationContext("tenant1");
      const data = [
        { id: "1", tenantId: "tenant1", organizationId: "org1" },
        { id: "2", tenantId: "tenant2", organizationId: "org2" },
      ];

      const filteredData = service.filterData(data, context);
      expect(filteredData).toHaveLength(1);
      expect(filteredData[0].id).toBe("1");
    });

    it("应该能够处理空数据过滤", () => {
      const context = service.createIsolationContext("tenant1");
      const filteredData = service.filterData([], context);
      expect(filteredData).toHaveLength(0);
    });

    it("应该能够处理复杂数据结构过滤", () => {
      const context = service.createIsolationContext("tenant1");
      const data = [
        {
          id: "1",
          tenantId: "tenant1",
          organizationId: "org1",
          nested: { value: "test" },
        },
        {
          id: "2",
          tenantId: "tenant2",
          organizationId: "org2",
          nested: { value: "test2" },
        },
      ];

      const filteredData = service.filterData(data, context);
      expect(filteredData).toHaveLength(1);
      expect(filteredData[0].nested.value).toBe("test");
    });
  });

  describe("健康检查", () => {
    it("应该返回隔离管理器健康状态", async () => {
      const isHealthy = await service.healthCheck();
      expect(typeof isHealthy).toBe("boolean");
    });

    it("应该处理健康检查失败", async () => {
      const contextManager = module.get<IsolationContextManager>(
        IsolationContextManager,
      );
      jest
        .spyOn(contextManager, "healthCheck")
        .mockRejectedValue(new Error("上下文管理器健康检查失败"));

      const isHealthy = await service.healthCheck();
      expect(isHealthy).toBe(false);
    });
  });

  describe("审计日志", () => {
    it("应该能够记录访问日志", async () => {
      const context = service.createIsolationContext("tenant1");
      const resource = { id: "resource1", type: "document" };

      await expect(
        service.logAccess(context, resource, "READ"),
      ).resolves.not.toThrow();
    });

    it("应该能够记录数据访问日志", async () => {
      const context = service.createIsolationContext("tenant1");
      const data = { id: "1", name: "test" };

      await expect(
        service.logDataAccess(context, data, "SELECT"),
      ).resolves.not.toThrow();
    });
  });

  describe("安全监控", () => {
    it("应该能够监控访问行为", async () => {
      const context = service.createIsolationContext("tenant1");
      const resource = { id: "resource1", type: "document" };

      await expect(
        service.monitorAccess(context, resource, "READ"),
      ).resolves.not.toThrow();
    });

    it("应该能够检测异常行为", async () => {
      const anomalies = await service.detectAnomalies();
      expect(Array.isArray(anomalies)).toBe(true);
    });
  });

  describe("错误处理", () => {
    it("应该处理无效的隔离上下文", () => {
      const invalidContext = {
        tenantId: "",
        organizationId: "org1",
        departmentId: "dept1",
        userId: "user1",
        sharingLevel: "USER" as const,
        isShared: false,
        accessRules: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() =>
        service.setCurrentIsolationContext(invalidContext),
      ).not.toThrow();
    });

    it("应该处理访问控制错误", async () => {
      const accessControlService =
        module.get<AccessControlService>(AccessControlService);
      jest
        .spyOn(accessControlService, "validateAccess")
        .mockRejectedValue(new Error("访问控制验证失败"));

      const context = service.createIsolationContext("tenant1");
      await expect(
        service.validateAccess(context, { id: "resource1" }),
      ).rejects.toThrow("访问控制验证失败");
    });
  });
});

describe("IsolationContextManager - 改进版", () => {
  let service: IsolationContextManager;
  let module: TestingModule;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [IsolationContextManager],
    }).compile();

    service = moduleRef.get<IsolationContextManager>(IsolationContextManager);
    module = moduleRef;
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  describe("隔离上下文创建", () => {
    it("应该能够创建租户级隔离上下文", () => {
      const context = service.createContext("tenant1");
      expect(context.tenantId).toBe("tenant1");
      expect(context.sharingLevel).toBe("TENANT");
    });

    it("应该能够创建组织级隔离上下文", () => {
      const context = service.createContext("tenant1", "org1");
      expect(context.tenantId).toBe("tenant1");
      expect(context.organizationId).toBe("org1");
      expect(context.sharingLevel).toBe("ORGANIZATION");
    });

    it("应该能够创建部门级隔离上下文", () => {
      const context = service.createContext("tenant1", "org1", "dept1");
      expect(context.tenantId).toBe("tenant1");
      expect(context.organizationId).toBe("org1");
      expect(context.departmentId).toBe("dept1");
      expect(context.sharingLevel).toBe("DEPARTMENT");
    });

    it("应该能够创建用户级隔离上下文", () => {
      const context = service.createContext(
        "tenant1",
        "org1",
        "dept1",
        "user1",
      );
      expect(context.tenantId).toBe("tenant1");
      expect(context.organizationId).toBe("org1");
      expect(context.departmentId).toBe("dept1");
      expect(context.userId).toBe("user1");
      expect(context.sharingLevel).toBe("USER");
    });
  });

  describe("隔离上下文验证", () => {
    it("应该验证有效的隔离上下文", () => {
      const context = service.createContext("tenant1");
      const isValid = service.validateContext(context);
      expect(isValid).toBe(true);
    });

    it("应该拒绝无效的隔离上下文", () => {
      const invalidContext = {
        tenantId: "",
        organizationId: "org1",
        departmentId: "dept1",
        userId: "user1",
        sharingLevel: "USER" as const,
        isShared: false,
        accessRules: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const isValid = service.validateContext(invalidContext);
      expect(isValid).toBe(false);
    });

    it("应该验证上下文的时间戳", () => {
      const context = service.createContext("tenant1");
      expect(context.createdAt).toBeInstanceOf(Date);
      expect(context.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe("上下文管理", () => {
    it("应该能够设置当前上下文", () => {
      const context = service.createContext("tenant1");
      expect(() => service.setCurrentContext(context)).not.toThrow();
    });

    it("应该能够获取当前上下文", () => {
      const context = service.getCurrentContext();
      expect(context).toBeDefined();
    });

    it("应该能够清除当前上下文", () => {
      expect(() => service.clearCurrentContext()).not.toThrow();
    });
  });
});

describe("AccessControlService - 改进版", () => {
  let service: AccessControlService;
  let module: TestingModule;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [AccessControlService],
    }).compile();

    service = moduleRef.get<AccessControlService>(AccessControlService);
    module = moduleRef;
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  describe("访问控制", () => {
    it("应该能够验证资源访问权限", async () => {
      const context = {
        tenantId: "tenant1",
        organizationId: "org1",
        departmentId: "dept1",
        userId: "user1",
        sharingLevel: "USER" as const,
        isShared: false,
        accessRules: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const hasAccess = await service.validateAccess(context, {
        id: "resource1",
      });
      expect(typeof hasAccess).toBe("boolean");
    });

    it("应该能够应用隔离过滤", () => {
      const context = {
        tenantId: "tenant1",
        organizationId: "org1",
        departmentId: "dept1",
        userId: "user1",
        sharingLevel: "USER" as const,
        isShared: false,
        accessRules: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const filteredQuery = service.applyIsolationFilter({}, context);
      expect(filteredQuery).toHaveProperty("tenantId", "tenant1");
      expect(filteredQuery).toHaveProperty("organizationId", "org1");
      expect(filteredQuery).toHaveProperty("departmentId", "dept1");
      expect(filteredQuery).toHaveProperty("userId", "user1");
    });

    it("应该能够过滤数据", () => {
      const context = {
        tenantId: "tenant1",
        organizationId: "org1",
        departmentId: "dept1",
        userId: "user1",
        sharingLevel: "USER" as const,
        isShared: false,
        accessRules: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const data = [
        { id: "1", tenantId: "tenant1", organizationId: "org1" },
        { id: "2", tenantId: "tenant2", organizationId: "org2" },
      ];

      const filteredData = service.filterData(data, context);
      expect(filteredData).toHaveLength(1);
      expect(filteredData[0].id).toBe("1");
    });

    it("应该能够处理复杂查询过滤", () => {
      const context = {
        tenantId: "tenant1",
        organizationId: "org1",
        departmentId: "dept1",
        userId: "user1",
        sharingLevel: "USER" as const,
        isShared: false,
        accessRules: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const complexQuery = {
        where: { status: "active" },
        include: ["relations"],
        orderBy: { createdAt: "desc" },
      };

      const filteredQuery = service.applyIsolationFilter(complexQuery, context);
      expect(filteredQuery).toHaveProperty("tenantId", "tenant1");
      expect(filteredQuery).toHaveProperty("where");
      expect(filteredQuery).toHaveProperty("include");
      expect(filteredQuery).toHaveProperty("orderBy");
    });
  });

  describe("权限验证", () => {
    it("应该能够验证读取权限", async () => {
      const context = {
        tenantId: "tenant1",
        organizationId: "org1",
        departmentId: "dept1",
        userId: "user1",
        sharingLevel: "USER" as const,
        isShared: false,
        accessRules: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const hasReadAccess = await service.validateAccess(
        context,
        { id: "resource1" },
        "READ",
      );
      expect(typeof hasReadAccess).toBe("boolean");
    });

    it("应该能够验证写入权限", async () => {
      const context = {
        tenantId: "tenant1",
        organizationId: "org1",
        departmentId: "dept1",
        userId: "user1",
        sharingLevel: "USER" as const,
        isShared: false,
        accessRules: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const hasWriteAccess = await service.validateAccess(
        context,
        { id: "resource1" },
        "WRITE",
      );
      expect(typeof hasWriteAccess).toBe("boolean");
    });

    it("应该能够验证删除权限", async () => {
      const context = {
        tenantId: "tenant1",
        organizationId: "org1",
        departmentId: "dept1",
        userId: "user1",
        sharingLevel: "USER" as const,
        isShared: false,
        accessRules: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const hasDeleteAccess = await service.validateAccess(
        context,
        { id: "resource1" },
        "DELETE",
      );
      expect(typeof hasDeleteAccess).toBe("boolean");
    });
  });
});
