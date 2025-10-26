import { BaseValueObject } from "@hl8/domain-kernel";

/**
 * 组织状态
 * @description 组织的生命周期状态
 */
export enum OrganizationStatus {
  /** 活跃：组织正常运行中 */
  ACTIVE = "ACTIVE",

  /** 非活跃：组织暂时停止活动 */
  INACTIVE = "INACTIVE",

  /** 暂停：组织被暂停 */
  SUSPENDED = "SUSPENDED",
}

/**
 * 组织状态转换规则
 * @description 定义组织状态之间的转换规则
 */
export class OrganizationStatusTransition extends BaseValueObject {
  private static readonly VALID_TRANSITIONS = new Map<
    OrganizationStatus,
    Set<OrganizationStatus>
  >([
    [
      OrganizationStatus.ACTIVE,
      new Set([OrganizationStatus.INACTIVE, OrganizationStatus.SUSPENDED]),
    ],
    [
      OrganizationStatus.INACTIVE,
      new Set([OrganizationStatus.ACTIVE, OrganizationStatus.SUSPENDED]),
    ],
    [
      OrganizationStatus.SUSPENDED,
      new Set([OrganizationStatus.ACTIVE, OrganizationStatus.INACTIVE]),
    ],
  ]);

  /**
   * 验证状态转换是否有效
   * @param fromStatus 当前状态
   * @param toStatus 目标状态
   * @returns 是否允许转换
   */
  public static canTransition(
    fromStatus: OrganizationStatus,
    toStatus: OrganizationStatus,
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
    currentStatus: OrganizationStatus,
  ): Set<OrganizationStatus> {
    return this.VALID_TRANSITIONS.get(currentStatus) ?? new Set();
  }

  constructor(private readonly status: OrganizationStatus) {
    super();
    this.validate();
  }

  get value(): OrganizationStatus {
    return this.status;
  }

  protected validate(): void {
    if (!Object.values(OrganizationStatus).includes(this.status)) {
      throw new Error(`无效的组织状态: ${this.status}`);
    }
  }

  protected arePropertiesEqual(other: BaseValueObject): boolean {
    return other instanceof OrganizationStatusTransition &&
      this.status === other.status;
  }

  protected getPropertiesForEquality(): Record<string, unknown> {
    return { status: this.status };
  }
}
