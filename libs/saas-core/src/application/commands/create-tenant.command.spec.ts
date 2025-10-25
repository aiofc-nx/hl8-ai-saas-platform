/**
 * 创建租户命令测试
 *
 * @description 测试 CreateTenantCommand 命令对象
 */

import { CreateTenantCommand } from "./create-tenant.command.js";
import { TenantCode } from "../../domain/value-objects/tenant-code.vo.js";
import { TenantName } from "../../domain/value-objects/tenant-name.vo.js";
import { TenantType, TenantTypeEnum } from "../../domain/value-objects/tenant-type.vo.js";

describe("CreateTenantCommand", () => {
  let validCode: TenantCode;
  let validName: TenantName;
  let validType: TenantType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- 测试中用于模拟隔离上下文
  let isolationContext: any;

  beforeEach(() => {
    validCode = new TenantCode("acme-corp");
    validName = new TenantName("Acme Corporation");
    validType = new TenantType(TenantTypeEnum.BASIC);
    isolationContext = undefined;
  });

  describe("构造函数", () => {
    it("应该成功创建命令对象", () => {
      const command = new CreateTenantCommand(
        validCode,
        validName,
        validType,
        undefined,
        undefined,
        isolationContext,
      );

      expect(command).toBeDefined();
      expect(command.code).toBe(validCode);
      expect(command.name).toBe(validName);
      expect(command.type).toBe(validType);
      expect(command.commandName).toBe("CreateTenantCommand");
      expect(command.description).toBe("创建租户命令");
    });

    it("应该包含可选字段", () => {
      const description = "测试租户描述";
      const createdBy = "user-123";

      const command = new CreateTenantCommand(
        validCode,
        validName,
        validType,
        description,
        createdBy,
        isolationContext,
      );

      expect(command.tenantDescription).toBe(description);
      expect(command.createdBy).toBe(createdBy);
    });

    it("应该包含隔离上下文", () => {
      const mockContext = { tenant: { id: "tenant-123" } };
      const command = new CreateTenantCommand(
        validCode,
        validName,
        validType,
        undefined,
        undefined,
        mockContext,
      );

      expect(command.isolationContext).toBe(mockContext);
    });

    it("应该自动生成时间戳和ID", () => {
      const command = new CreateTenantCommand(
        validCode,
        validName,
        validType,
        undefined,
        undefined,
        isolationContext,
      );

      expect(command.timestamp).toBeInstanceOf(Date);
      expect(command.commandId).toBeDefined();
    });
  });

  describe("继承验证", () => {
    it("应该继承自 BaseCommand", () => {
      const command = new CreateTenantCommand(
        validCode,
        validName,
        validType,
        undefined,
        undefined,
        isolationContext,
      );

      // 检查是否继承 BaseCommand 的属性
      expect(command).toHaveProperty("commandId");
      expect(command).toHaveProperty("commandName");
      expect(command).toHaveProperty("description");
      expect(command).toHaveProperty("timestamp");
    });

    it("应该正确调用 super()", () => {
      const command = new CreateTenantCommand(
        validCode,
        validName,
        validType,
        undefined,
        undefined,
        isolationContext,
      );

      expect(command.commandName).toBe("CreateTenantCommand");
      expect(command.description).toBe("创建租户命令");
    });
  });

  describe("属性访问", () => {
    it("应该正确返回只读属性", () => {
      const command = new CreateTenantCommand(
        validCode,
        validName,
        validType,
        "描述",
        "user-123",
        isolationContext,
      );

      expect(command.code).toBe(validCode);
      expect(command.name).toBe(validName);
      expect(command.type).toBe(validType);
      expect(command.tenantDescription).toBe("描述");
      expect(command.createdBy).toBe("user-123");
    });
  });
});
