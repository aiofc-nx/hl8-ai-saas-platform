import { EntityId } from "@hl8/domain-kernel";
import { randomUUID } from "node:crypto";

/**
 * 平台ID值对象
 *
 * @description 表示平台的唯一标识符，确保全局唯一性
 * @since 1.0.0
 */
export class PlatformId extends EntityId<"PlatformId"> {
  private static cache = new Map<string, PlatformId>();

  /**
   * 私有构造函数 - 强制使用静态工厂方法
   */
  private constructor(value: string) {
    super(value, "PlatformId");
  }

  /**
   * 创建平台ID
   *
   * @param value - 平台ID值
   * @returns PlatformId 实例
   */
  static create(value: string): PlatformId {
    let instance = this.cache.get(value);
    if (!instance) {
      instance = new PlatformId(value);
      this.cache.set(value, instance);
    }
    return instance;
  }

  /**
   * 生成平台ID
   *
   * @returns PlatformId 实例
   */
  static generate(): PlatformId {
    return new PlatformId(randomUUID());
  }

  /**
   * 清理缓存
   */
  static clearCache(): void {
    this.cache.clear();
  }

  /**
   * 重写相等性比较
   */
  override equals(other?: PlatformId): boolean {
    return super.equals(other);
  }
}
