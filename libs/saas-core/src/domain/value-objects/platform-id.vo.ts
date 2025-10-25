import { EntityId } from "@hl8/domain-kernel";

/**
 * 平台ID值对象
 *
 * @description 表示平台的唯一标识符，确保全局唯一性
 * @since 1.0.0
 */
export class PlatformId extends EntityId<string> {
  /**
   * 私有构造函数 - 强制使用静态工厂方法
   */
  protected constructor(value: string) {
    super(value, "PlatformId");
    this.validate(value);
  }

  /**
   * 创建平台ID
   *
   * @param value - 平台ID值
   * @returns PlatformId 实例
   */
  static create(value: string): PlatformId {
    return new PlatformId(value);
  }

  /**
   * 生成平台ID
   *
   * @returns PlatformId 实例
   */
  static generate(): PlatformId {
    const { randomUUID } = require("node:crypto");
    return new PlatformId(randomUUID());
  }

  /**
   * 验证平台ID值
   *
   * @param value - 平台ID值
   * @throws {Error} 当平台ID格式无效时抛出错误
   */
  private validate(value: string): void {
    if (!value || typeof value !== "string") {
      throw new Error("平台ID必须是非空字符串");
    }

    if (value.length < 3 || value.length > 50) {
      throw new Error("平台ID长度必须在3-50个字符之间");
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      throw new Error("平台ID只能包含字母、数字、连字符和下划线");
    }
  }


}
