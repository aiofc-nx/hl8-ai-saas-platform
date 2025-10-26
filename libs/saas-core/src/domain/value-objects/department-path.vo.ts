import { BaseValueObject } from "@hl8/domain-kernel";
import { DepartmentId } from "@hl8/domain-kernel";

/**
 * 部门路径值对象
 * @description 用于支持8层部门层级结构，通过路径跟踪部门的层级关系
 *
 * 路径格式: /deptId1/deptId2/deptId3...
 * - 路径从根部门开始，使用 / 分隔
 * - 最大支持8层嵌套
 * - 路径用于快速查找祖先和后代部门
 *
 * @example
 * ```typescript
 * // 创建根部门路径
 * const rootPath = DepartmentPath.createRoot(DepartmentId.generate());
 *
 * // 添加子部门
 * const childPath = rootPath.append(DepartmentId.generate());
 *
 * // 获取层级
 * console.log(childPath.getLevel()); // 2
 *
 * // 获取父级路径
 * const parentPath = childPath.getParent();
 *
 * // 检查是否为根部门
 * console.log(rootPath.isRoot()); // true
 * ```
 */
export class DepartmentPath extends BaseValueObject {
  private static readonly MAX_LEVEL = 8;
  private static readonly SEPARATOR = "/";

  /**
   * 创建根部门路径
   * @param deptId 部门ID
   * @returns 根部门路径
   */
  public static createRoot(deptId: DepartmentId): DepartmentPath {
    const path = `${this.SEPARATOR}${deptId.getValue()}`;
    return new DepartmentPath(path);
  }

  /**
   * 从字符串创建路径
   * @param path 路径字符串
   * @returns 部门路径
   */
  public static fromString(path: string): DepartmentPath {
    this.validatePath(path);
    return new DepartmentPath(path);
  }

  /**
   * 验证路径格式
   * @param path 路径字符串
   * @throws {Error} 当路径格式无效时
   */
  private static validatePath(path: string): void {
    if (!path || !path.startsWith("/")) {
      throw new Error("路径必须以 / 开头");
    }

    // 计算层级（去掉开头的 / 后，按 / 分割）
    const parts = path.substring(1).split(this.SEPARATOR).filter(Boolean);
    if (parts.length > this.MAX_LEVEL) {
      throw new Error(`部门层级不能超过 ${this.MAX_LEVEL} 层`);
    }

    // 验证每个部分是否为有效的UUID v4格式
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    for (const part of parts) {
      if (!uuidRegex.test(part)) {
        throw new Error(`路径包含无效的部门ID: ${part}`);
      }
    }
  }

  /**
   * 构造函数
   * @param path 路径字符串
   */
  private constructor(private readonly path: string) {
    super();
    this.validate();
  }

  protected validate(): void {
    DepartmentPath.validatePath(this.path);
  }

  protected arePropertiesEqual(other: BaseValueObject): boolean {
    return this.equals(other as DepartmentPath);
  }

  protected getPropertiesForEquality(): Record<string, unknown> {
    return { path: this.path };
  }

  /**
   * 获取路径字符串
   */
  get value(): string {
    return this.path;
  }

  /**
   * 添加子部门
   * @param deptId 子部门ID
   * @returns 新的路径
   */
  public append(deptId: DepartmentId): DepartmentPath {
    const currentLevel = this.getLevel();
    if (currentLevel >= DepartmentPath.MAX_LEVEL) {
      throw new Error(`已达到最大层级 ${DepartmentPath.MAX_LEVEL}`);
    }

    const newPath = `${this.path}${DepartmentPath.SEPARATOR}${deptId.getValue()}`;
    return new DepartmentPath(newPath);
  }

  /**
   * 移除最后一个部门
   * @returns 父级路径，如果是根部门则返回 null
   */
  public remove(): DepartmentPath | null {
    const parts = this.path
      .substring(1)
      .split(DepartmentPath.SEPARATOR)
      .filter(Boolean);
    if (parts.length <= 1) {
      return null; // 根部门没有父级
    }

    parts.pop();
    const newPath = `${DepartmentPath.SEPARATOR}${parts.join(DepartmentPath.SEPARATOR)}`;
    return new DepartmentPath(newPath);
  }

  /**
   * 获取父级路径
   * @returns 父级路径，如果是根部门则返回 null
   */
  public getParent(): DepartmentPath | null {
    return this.remove();
  }

  /**
   * 获取当前层级
   * @returns 层级（1-based）
   */
  public getLevel(): number {
    return this.path
      .substring(1)
      .split(DepartmentPath.SEPARATOR)
      .filter(Boolean).length;
  }

  /**
   * 检查是否为根部门
   * @returns 是否为根部门
   */
  public isRoot(): boolean {
    return this.getLevel() === 1;
  }

  /**
   * 获取当前部门的ID
   * @returns 当前部门ID
   */
  public getCurrentDeptId(): DepartmentId {
    const parts = this.path
      .substring(1)
      .split(DepartmentPath.SEPARATOR)
      .filter(Boolean);
    const lastPart = parts[parts.length - 1];
    return DepartmentId.create(lastPart);
  }

  /**
   * 获取所有祖先部门的ID
   * @returns 祖先部门ID列表
   */
  public getAncestorIds(): DepartmentId[] {
    const parts = this.path
      .substring(1)
      .split(DepartmentPath.SEPARATOR)
      .filter(Boolean);
    if (parts.length <= 1) {
      return [];
    }

    return parts.slice(0, -1).map((id) => DepartmentId.create(id));
  }

  /**
   * 检查是否为指定路径的后代
   * @param otherPath 其他路径
   * @returns 是否为其后代
   */
  public isDescendantOf(otherPath: DepartmentPath): boolean {
    return this.path.startsWith(otherPath.path) && this.path !== otherPath.path;
  }

  /**
   * 检查是否为指定路径的祖先
   * @param otherPath 其他路径
   * @returns 是否为其祖先
   */
  public isAncestorOf(otherPath: DepartmentPath): boolean {
    return otherPath.path.startsWith(this.path) && this.path !== otherPath.path;
  }

  /**
   * 检查是否包含指定的部门ID
   * @param deptId 部门ID
   * @returns 是否包含
   */
  public contains(deptId: DepartmentId): boolean {
    return this.path.includes(deptId.getValue());
  }

  /**
   * 转换为字符串
   * @returns 路径字符串
   */
  public toString(): string {
    return this.path;
  }

  /**
   * 相等性比较
   * @param other 其他路径
   * @returns 是否相等
   */
  public equals(other?: DepartmentPath): boolean {
    if (!other) return false;
    return this.path === other.path;
  }
}
