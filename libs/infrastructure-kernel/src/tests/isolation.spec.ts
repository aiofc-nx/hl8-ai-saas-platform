/**
 * 隔离服务测试
 *
 * @description 测试多租户数据隔离功能
 * @since 1.0.0
 */

import { Test, TestingModule } from "@nestjs/testing";
import { IsolationManager } from "../services/isolation/isolation-manager.js";
import { IsolationContextManager } from "../services/isolation/isolation-context-manager.js";
import { AccessControlService } from "../services/isolation/access-control-service.js";

describe("IsolationManager", () => {
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
            applyIsolationFilter: jest.fn().mockReturnValue({}),
            filterData: jest.fn().mockReturnValue([]),
            healthCheck: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    service = moduleRef.get<IsolationManager>(IsolationManager);
    module = moduleRef;
  });

  afterEach(async () => {
    await module.close();
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
    });

    it("应该能够过滤数据", () => {
      const context = service.createIsolationContext("tenant1");
      const filteredData = service.filterData(
        [{ id: "1", tenantId: "tenant1" }],
        context,
      );
      expect(filteredData).toBeDefined();
    });
  });

  describe("健康检查", () => {
    it("应该返回隔离管理器健康状态", async () => {
      const isHealthy = await service.healthCheck();
      expect(typeof isHealthy).toBe("boolean");
    });
  });
});

describe("IsolationContextManager", () => {
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
    await module.close();
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
  });
});

describe("AccessControlService", () => {
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
    await module.close();
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
  });
});
