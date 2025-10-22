/**
 * 隔离管理器真实实现测试
 *
 * @description 测试隔离管理器的实际功能
 * @since 1.0.0
 */

import { Test, TestingModule } from "@nestjs/testing";
import { IsolationManager } from "../services/isolation/isolation-manager.js";
import {
  TestModuleBuilder,
  TestDataFactory,
  TestAssertions,
} from "./test-utils.js";

describe("IsolationManager - 真实实现", () => {
  let service: IsolationManager;
  let module: TestingModule;
  let mockContextManager: any;
  let mockAccessControl: any;
  let mockAuditLog: any;
  let mockSecurityMonitor: any;

  beforeEach(async () => {
    const moduleBuilder = new TestModuleBuilder()
      .addProvider(IsolationManager)
      .addMockIsolationContextManager()
      .addMockAccessControlService()
      .addMockAuditLogService()
      .addMockSecurityMonitorService();

    module = await moduleBuilder.build();
    service = module.get<IsolationManager>(IsolationManager);
    mockContextManager = module.get("IsolationContextManager");
    mockAccessControl = module.get("AccessControlService");
    mockAuditLog = module.get("AuditLogService");
    mockSecurityMonitor = module.get("SecurityMonitorService");
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  describe("隔离上下文管理", () => {
    it("应该能够创建租户级隔离上下文", () => {
      const context = service.createIsolationContext("tenant1");

      TestAssertions.expectIsolationContext(context);
      expect(context.tenantId).toBe("tenant1");
      expect(context.sharingLevel).toBe("TENANT");
      expect(context.organizationId).toBeUndefined();
      expect(context.departmentId).toBeUndefined();
      expect(context.userId).toBeUndefined();
    });

    it("应该能够创建组织级隔离上下文", () => {
      const context = service.createIsolationContext("tenant1", "org1");

      TestAssertions.expectIsolationContext(context);
      expect(context.tenantId).toBe("tenant1");
      expect(context.organizationId).toBe("org1");
      expect(context.sharingLevel).toBe("ORGANIZATION");
      expect(context.departmentId).toBeUndefined();
      expect(context.userId).toBeUndefined();
    });

    it("应该能够创建部门级隔离上下文", () => {
      const context = service.createIsolationContext(
        "tenant1",
        "org1",
        "dept1",
      );

      TestAssertions.expectIsolationContext(context);
      expect(context.tenantId).toBe("tenant1");
      expect(context.organizationId).toBe("org1");
      expect(context.departmentId).toBe("dept1");
      expect(context.sharingLevel).toBe("DEPARTMENT");
      expect(context.userId).toBeUndefined();
    });

    it("应该能够创建用户级隔离上下文", () => {
      const context = service.createIsolationContext(
        "tenant1",
        "org1",
        "dept1",
        "user1",
      );

      TestAssertions.expectIsolationContext(context);
      expect(context.tenantId).toBe("tenant1");
      expect(context.organizationId).toBe("org1");
      expect(context.departmentId).toBe("dept1");
      expect(context.userId).toBe("user1");
      expect(context.sharingLevel).toBe("USER");
    });

    it("应该能够设置当前隔离上下文", () => {
      const context = TestDataFactory.createIsolationContext();

      expect(() => service.setCurrentIsolationContext(context)).not.toThrow();
      expect(mockContextManager.setCurrentContext).toHaveBeenCalledWith(
        context,
      );
    });

    it("应该能够获取当前隔离上下文", () => {
      const context = service.getCurrentIsolationContext();

      TestAssertions.expectIsolationContext(context);
      expect(mockContextManager.getCurrentContext).toHaveBeenCalled();
    });
  });

  describe("访问控制", () => {
    it("应该能够验证访问权限", async () => {
      const context = TestDataFactory.createIsolationContext();
      const resource = { id: "resource1", tenantId: "tenant1" };

      const hasAccess = await service.validateAccess(context, resource);

      expect(hasAccess).toBe(true);
      expect(mockAccessControl.validateAccess).toHaveBeenCalledWith(
        context,
        resource,
      );
    });

    it("应该能够应用隔离过滤", () => {
      const context = TestDataFactory.createIsolationContext();
      const query = { table: "users" };

      const filteredQuery = service.applyIsolationFilter(query, context);

      expect(filteredQuery).toBeDefined();
      expect(filteredQuery.tenantId).toBe(context.tenantId);
      expect(mockAccessControl.applyIsolationFilter).toHaveBeenCalledWith(
        query,
        context,
      );
    });

    it("应该能够过滤数据", () => {
      const context = TestDataFactory.createIsolationContext();
      const data = TestDataFactory.createTestData(5);

      const filteredData = service.filterData(data, context);

      expect(filteredData).toBeDefined();
      expect(Array.isArray(filteredData)).toBe(true);
      expect(mockAccessControl.filterData).toHaveBeenCalledWith(data, context);
    });

    it("应该拒绝跨租户访问", async () => {
      const context = TestDataFactory.createIsolationContext({
        tenantId: "tenant1",
      });
      const resource = { id: "resource1", tenantId: "tenant2" };

      jest.spyOn(mockAccessControl, "validateAccess").mockResolvedValue(false);

      const hasAccess = await service.validateAccess(context, resource);
      expect(hasAccess).toBe(false);
    });
  });

  describe("审计日志", () => {
    it("应该记录访问尝试", async () => {
      const context = TestDataFactory.createIsolationContext();
      const resource = { id: "resource1" };

      await service.validateAccess(context, resource);

      expect(mockAuditLog.logAccess).toHaveBeenCalled();
    });

    it("应该记录数据访问", async () => {
      const context = TestDataFactory.createIsolationContext();
      const data = TestDataFactory.createTestData(1);

      await service.filterData(data, context);

      expect(mockAuditLog.logDataAccess).toHaveBeenCalled();
    });
  });

  describe("安全监控", () => {
    it("应该监控访问行为", async () => {
      const context = TestDataFactory.createIsolationContext();
      const resource = { id: "resource1" };

      await service.validateAccess(context, resource);

      expect(mockSecurityMonitor.monitorAccess).toHaveBeenCalled();
    });

    it("应该检测异常行为", async () => {
      const anomalies = await service.detectAnomalies();

      expect(anomalies).toBeDefined();
      expect(Array.isArray(anomalies)).toBe(true);
    });
  });

  describe("服务管理", () => {
    it("应该能够注册服务", () => {
      const mockService = { name: "test-service" };

      service.registerService("test", mockService);

      const retrievedService = service.getService("test");
      expect(retrievedService).toBe(mockService);
    });

    it("应该能够获取所有服务", () => {
      const mockService1 = { name: "service1" };
      const mockService2 = { name: "service2" };

      service.registerService("service1", mockService1);
      service.registerService("service2", mockService2);

      const allServices = service.getAllServices();
      expect(allServices).toHaveProperty("service1", mockService1);
      expect(allServices).toHaveProperty("service2", mockService2);
    });

    it("应该返回未定义的服务", () => {
      const service = service.getService("non-existent");
      expect(service).toBeUndefined();
    });
  });

  describe("健康检查", () => {
    it("应该返回隔离管理器健康状态", async () => {
      const isHealthy = await service.healthCheck();

      TestAssertions.expectHealthCheckResult(isHealthy);
      expect(mockContextManager.healthCheck).toHaveBeenCalled();
      expect(mockAccessControl.healthCheck).toHaveBeenCalled();
      expect(mockAuditLog.healthCheck).toHaveBeenCalled();
      expect(mockSecurityMonitor.healthCheck).toHaveBeenCalled();
    });

    it("应该处理健康检查失败", async () => {
      jest
        .spyOn(mockContextManager, "healthCheck")
        .mockRejectedValue(new Error("上下文管理器健康检查失败"));

      const isHealthy = await service.healthCheck();
      expect(isHealthy).toBe(false);
    });
  });

  describe("数据隔离测试", () => {
    it("应该正确隔离不同租户的数据", () => {
      const tenant1Context = TestDataFactory.createIsolationContext({
        tenantId: "tenant1",
      });
      const tenant2Context = TestDataFactory.createIsolationContext({
        tenantId: "tenant2",
      });

      const data = [
        { id: "1", tenantId: "tenant1", name: "User 1" },
        { id: "2", tenantId: "tenant2", name: "User 2" },
        { id: "3", tenantId: "tenant1", name: "User 3" },
      ];

      const tenant1Data = service.filterData(data, tenant1Context);
      const tenant2Data = service.filterData(data, tenant2Context);

      expect(tenant1Data).toHaveLength(2);
      expect(tenant1Data.every((item) => item.tenantId === "tenant1")).toBe(
        true,
      );

      expect(tenant2Data).toHaveLength(1);
      expect(tenant2Data.every((item) => item.tenantId === "tenant2")).toBe(
        true,
      );
    });

    it("应该正确隔离不同组织的数据", () => {
      const org1Context = TestDataFactory.createIsolationContext({
        tenantId: "tenant1",
        organizationId: "org1",
      });
      const org2Context = TestDataFactory.createIsolationContext({
        tenantId: "tenant1",
        organizationId: "org2",
      });

      const data = [
        {
          id: "1",
          tenantId: "tenant1",
          organizationId: "org1",
          name: "User 1",
        },
        {
          id: "2",
          tenantId: "tenant1",
          organizationId: "org2",
          name: "User 2",
        },
        {
          id: "3",
          tenantId: "tenant1",
          organizationId: "org1",
          name: "User 3",
        },
      ];

      const org1Data = service.filterData(data, org1Context);
      const org2Data = service.filterData(data, org2Context);

      expect(org1Data).toHaveLength(2);
      expect(org1Data.every((item) => item.organizationId === "org1")).toBe(
        true,
      );

      expect(org2Data).toHaveLength(1);
      expect(org2Data.every((item) => item.organizationId === "org2")).toBe(
        true,
      );
    });

    it("应该正确隔离不同部门的数据", () => {
      const dept1Context = TestDataFactory.createIsolationContext({
        tenantId: "tenant1",
        organizationId: "org1",
        departmentId: "dept1",
      });
      const dept2Context = TestDataFactory.createIsolationContext({
        tenantId: "tenant1",
        organizationId: "org1",
        departmentId: "dept2",
      });

      const data = [
        {
          id: "1",
          tenantId: "tenant1",
          organizationId: "org1",
          departmentId: "dept1",
          name: "User 1",
        },
        {
          id: "2",
          tenantId: "tenant1",
          organizationId: "org1",
          departmentId: "dept2",
          name: "User 2",
        },
        {
          id: "3",
          tenantId: "tenant1",
          organizationId: "org1",
          departmentId: "dept1",
          name: "User 3",
        },
      ];

      const dept1Data = service.filterData(data, dept1Context);
      const dept2Data = service.filterData(data, dept2Context);

      expect(dept1Data).toHaveLength(2);
      expect(dept1Data.every((item) => item.departmentId === "dept1")).toBe(
        true,
      );

      expect(dept2Data).toHaveLength(1);
      expect(dept2Data.every((item) => item.departmentId === "dept2")).toBe(
        true,
      );
    });

    it("应该正确隔离不同用户的数据", () => {
      const user1Context = TestDataFactory.createIsolationContext({
        tenantId: "tenant1",
        organizationId: "org1",
        departmentId: "dept1",
        userId: "user1",
      });
      const user2Context = TestDataFactory.createIsolationContext({
        tenantId: "tenant1",
        organizationId: "org1",
        departmentId: "dept1",
        userId: "user2",
      });

      const data = [
        {
          id: "1",
          tenantId: "tenant1",
          organizationId: "org1",
          departmentId: "dept1",
          userId: "user1",
          name: "User 1",
        },
        {
          id: "2",
          tenantId: "tenant1",
          organizationId: "org1",
          departmentId: "dept1",
          userId: "user2",
          name: "User 2",
        },
        {
          id: "3",
          tenantId: "tenant1",
          organizationId: "org1",
          departmentId: "dept1",
          userId: "user1",
          name: "User 3",
        },
      ];

      const user1Data = service.filterData(data, user1Context);
      const user2Data = service.filterData(data, user2Context);

      expect(user1Data).toHaveLength(2);
      expect(user1Data.every((item) => item.userId === "user1")).toBe(true);

      expect(user2Data).toHaveLength(1);
      expect(user2Data.every((item) => item.userId === "user2")).toBe(true);
    });
  });

  describe("性能测试", () => {
    it("应该能够处理大量数据过滤", () => {
      const context = TestDataFactory.createIsolationContext();
      const largeData = TestDataFactory.createTestData(1000);

      const startTime = Date.now();
      const filteredData = service.filterData(largeData, context);
      const endTime = Date.now();

      expect(filteredData).toBeDefined();
      expect(endTime - startTime).toBeLessThan(1000); // 应该在1秒内完成
    });

    it("应该能够处理并发访问控制", async () => {
      const context = TestDataFactory.createIsolationContext();
      const resource = { id: "resource1" };

      const promises = Array.from({ length: 100 }, () =>
        service.validateAccess(context, resource),
      );

      const results = await Promise.all(promises);
      expect(results).toHaveLength(100);
      expect(results.every((result) => result === true)).toBe(true);
    });
  });
});
