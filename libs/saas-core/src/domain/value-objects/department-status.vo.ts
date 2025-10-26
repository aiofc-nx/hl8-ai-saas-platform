import { BaseValueObject } from "@hl8/domain-kernel";

/**
 * 部门状态
 * @description 部门的生命周期状态
 */
export enum DepartmentStatus {
  /** 活跃：部门正常运行中 */
  ACTIVE = "ACTIVE",

  /** 非活跃：部门暂时停止活动 */
  INACTIVE = "INACTIVE",

  /** 已归档：部门已归档 */
  ARCHIVED = "ARCHIVED",
}

/**
 * 部门状态转换规则
 * @description 定义部门状态之间的转换规则
 */
export class DepartmentStatusTransition extends BaseValueObject {
  private static readonly VALID_TRANSITIONS = new Map<
    DepartmentStatus,
    Set<DepartmentStatus>
  >([
    [
      DepartmentStatus.ACTIVE,
      new Set([DepartmentStatus.INACTIVE, DepartmentStatus.ARCHIVED]),
    ],
    [
      DepartmentStatus.INACTIVE,
      new Set([DepartmentStatus.ACTIVE, DepartmentStatus.ARCHIVED]),
    ],
    [
      DepartmentStatus.ARCHIVED,
      new Set([DepartmentStatus.ACTIVE, DepartmentStatus.INACTIVE]),
    ],
  ]);

  /**
   * 验证状态转换是否有效
   * @param fromStatus 当前状态
   * @param toStatus 目标状态
   * @returns 是否允许转换
   */
  public static canTransition(
    fromStatus: DepartmentStatus,
    toStatus: DepartmentStatus,
  ): boolean {
    const allowedStatuses = this.VALID_TRANSITIONS.get(fromStatus);
    return allowedStatuses?.has(toStatus) ?? false;
  }

  /**
   * 获取允许转换的目标状态列表
   * @param currentStatus 当前状态
   * @returns 允许转换的状态列表
   */
  public static getAllowedTransitions(
    currentStatus: DepartmentStatus,
  ): Set<DepartmentStatus> {
    return this.VALID_TRANSITIONS.get(currentStatus) ?? new Set();
  }

  constructor(private readonly status: DepartmentStatus) {
    super();
    this.validate();
  }

  get value(): DepartmentStatus {
    return this.status;
  }

  protected validate(): void {
    if (!Object.values(DepartmentStatus).includes(this.status)) {
      throw new Error(`无效的部门状态: ${this.status}`);
    }
  }

  protected arePropertiesEqual(other: BaseValueObject): boolean {
    return other instanceof DepartmentStatusTransition &&
      this.status === other.status;
  }

  protected getPropertiesForEquality(): Record<string, unknown> {
    return { status: this.status };
  }
}
