/**
 * 创建租户处理器测试
 *
 * @description 测试 CreateTenantHandler 命令处理器
 */

import { CreateTenantHandler } from "./create-tenant.handler.js";
import { CreateTenantCommand } from "../commands/create-tenant.command.js";
import { TenantCode } from "../../domain/value-objects/tenant-code.vo.js";
import { TenantName } from "../../domain/value-objects/tenant-name.vo.js";
import { TenantType, TenantTypeEnum } from "../../domain/value-objects/tenant-type.vo.js";

describe("CreateTenantHandler", () => {
  let handler: CreateTenantHandler;
  let validCommand: CreateTenantCommand;
  let validCode: TenantCode;
  let validName: TenantName;
  let validType: TenantType;

  beforeEach(() => {
    handler = new CreateTenantHandler();
    validCode = new TenantCode("acme-corp");
    validName = new TenantName("Acme Corporation");
    validType = new TenantType(TenantTypeEnum.BASIC);
    validCommand = new CreateTenantCommand(
      validCode,
      validName,
      validType,
      "测试租户描述",
      "user-123",
    );
  });

  describe("handle 方法", () => {
    it("应该成功处理有效的命令", async () => {
      const result = await handler.handle(validCommand);

      expect(result).toBeDefined();
      expect(result.tenant).toBeDefined();
      expect(result.tenant.code).toBe(validCode);
      expect(result.tenant.name).toBe(validName);
      expect(result.tenant.type).toBe(validType);
    });

    it("应该抛出错误当命令无效", async () => {
      const invalidCommand = new CreateTenantCommand(
        validCode,
        validName,
        undefined as any,
      );

      await expect(handler.handle(invalidCommand)).rejects.toThrow(
        "租户类型不能为空",
      );
    });

    it("应该生成唯一的租户ID", async () => {
      const result1 = await handler.handle(validCommand);
      const result2 = await handler.handle(validCommand);

      expect(result1.tenant.id).not.toBe(result2.tenant.id);
    });
  });

  describe("validateCommand 方法", () => {
    it("应该验证有效的命令", () => {
      expect(() => handler.validateCommand(validCommand)).not.toThrow();
    });

    it("应该抛出错误当代码为空", () => {
      const invalidCommand = new CreateTenantCommand(
        undefined as any,
        validName,
        validType,
      );

      expect(() => handler.validateCommand(invalidCommand)).toThrow(
        "租户代码不能为空",
      );
    });

    it("应该抛出错误当名称为空", () => {
      const invalidCommand = new CreateTenantCommand(
        validCode,
        undefined as any,
        validType,
      );

      expect(() => handler.validateCommand(invalidCommand)).toThrow(
        "租户名称不能为空",
      );
    });

    it("应该抛出错误当类型为空", () => {
      const invalidCommand = new CreateTenantCommand(
        validCode,
        validName,
        undefined as any,
      );

      expect(() => handler.validateCommand(invalidCommand)).toThrow(
        "租户类型不能为空",
      );
    });
  });

  describe("canHandle 方法", () => {
    it("应该返回 true 对于 CreateTenantCommand", () => {
      expect(handler.canHandle(validCommand)).toBe(true);
    });

    it("应该返回 false 对于其他命令", () => {
      const otherCommand = {
        commandName: "OtherCommand",
      } as any;

      expect(handler.canHandle(otherCommand)).toBe(false);
    });
  });

  describe("getHandlerName 方法", () => {
    it("应该返回处理器名称", () => {
      expect(handler.getHandlerName()).toBe("CreateTenantHandler");
    });
  });

  describe("getPriority 方法", () => {
    it("应该返回优先级", () => {
      expect(handler.getPriority()).toBe(0);
    });
  });

  describe("接口实现", () => {
    it("应该实现 CommandHandler 接口的所有方法", () => {
      expect(typeof handler.handle).toBe("function");
      expect(typeof handler.validateCommand).toBe("function");
      expect(typeof handler.canHandle).toBe("function");
      expect(typeof handler.getHandlerName).toBe("function");
      expect(typeof handler.getPriority).toBe("function");
    });
  });
});
