/**
 * 试用期配置值对象
 *
 * @description 表示租户试用期的配置信息，包括试用天数、宽限期、提醒设置等
 * @since 1.0.0
 */

import { BaseValueObject } from "./base-value-object.js";

/**
 * 试用期配置接口
 */
export interface ITrialPeriodConfig {
  readonly defaultTrialDays: number;
  readonly minTrialDays: number;
  readonly maxTrialDays: number;
  readonly gracePeriodDays: number;
  readonly dataRetentionDays: number;
  readonly reminderDays: number[];
  readonly userSpecialConfigs: Map<string, number>;
  readonly promotionConfig?: {
    readonly trialDays: number;
    readonly startDate: Date;
    readonly endDate: Date;
    readonly description: string;
  };
}

/**
 * 试用期配置值对象
 *
 * 试用期配置定义了租户试用期的各种参数和规则。
 * 支持全局默认配置、用户特殊配置、活动配置等多种配置方式。
 *
 * @example
 * ```typescript
 * const config = new TrialPeriodConfig({
 *   defaultTrialDays: 30,
 *   minTrialDays: 7,
 *   maxTrialDays: 365,
 *   gracePeriodDays: 7,
 *   dataRetentionDays: 30,
 *   reminderDays: [7, 3, 1],
 *   userSpecialConfigs: new Map([["user-123", 90]]),
 *   promotionConfig: {
 *     trialDays: 60,
 *     startDate: new Date("2024-01-01"),
 *     endDate: new Date("2024-01-31"),
 *     description: "春节促销活动"
 *   }
 * });
 * ```
 */
export class TrialPeriodConfig extends BaseValueObject<ITrialPeriodConfig> {
  constructor(config: ITrialPeriodConfig) {
    super(config);
    this.validateConfig(config);
  }

  /**
   * 验证试用期配置
   *
   * @param config - 试用期配置
   * @throws {Error} 当配置无效时抛出错误
   */
  private validateConfig(config: ITrialPeriodConfig): void {
    if (config.defaultTrialDays < config.minTrialDays) {
      throw new Error("默认试用天数不能小于最小试用天数");
    }
    if (config.defaultTrialDays > config.maxTrialDays) {
      throw new Error("默认试用天数不能大于最大试用天数");
    }
    if (config.minTrialDays < 1) {
      throw new Error("最小试用天数不能小于1天");
    }
    if (config.maxTrialDays > 365) {
      throw new Error("最大试用天数不能超过365天");
    }
    if (config.gracePeriodDays < 0) {
      throw new Error("宽限期天数不能为负数");
    }
    if (config.dataRetentionDays < 0) {
      throw new Error("数据保留天数不能为负数");
    }
    if (
      config.reminderDays.some(
        (day) => day < 0 || day > config.defaultTrialDays,
      )
    ) {
      throw new Error("提醒天数必须在有效范围内");
    }
  }

  /**
   * 获取默认试用天数
   *
   * @returns 默认试用天数
   */
  get defaultTrialDays(): number {
    return this.value.defaultTrialDays;
  }

  /**
   * 获取最小试用天数
   *
   * @returns 最小试用天数
   */
  get minTrialDays(): number {
    return this.value.minTrialDays;
  }

  /**
   * 获取最大试用天数
   *
   * @returns 最大试用天数
   */
  get maxTrialDays(): number {
    return this.value.maxTrialDays;
  }

  /**
   * 获取宽限期天数
   *
   * @returns 宽限期天数
   */
  get gracePeriodDays(): number {
    return this.value.gracePeriodDays;
  }

  /**
   * 获取数据保留天数
   *
   * @returns 数据保留天数
   */
  get dataRetentionDays(): number {
    return this.value.dataRetentionDays;
  }

  /**
   * 获取提醒天数列表
   *
   * @returns 提醒天数列表
   */
  get reminderDays(): readonly number[] {
    return this.value.reminderDays;
  }

  /**
   * 获取用户特殊配置
   *
   * @returns 用户特殊配置映射
   */
  get userSpecialConfigs(): ReadonlyMap<string, number> {
    return this.value.userSpecialConfigs;
  }

  /**
   * 获取活动配置
   *
   * @returns 活动配置或undefined
   */
  get promotionConfig(): ITrialPeriodConfig["promotionConfig"] {
    return this.value.promotionConfig;
  }

  /**
   * 获取用户的试用期天数
   *
   * @param userId - 用户ID
   * @returns 用户的试用期天数
   */
  getTrialPeriodForUser(userId: string): number {
    // 检查用户特殊配置
    const userSpecialConfig = this.userSpecialConfigs.get(userId);
    if (userSpecialConfig !== undefined) {
      return userSpecialConfig;
    }

    // 检查活动配置
    if (this.promotionConfig) {
      const now = new Date();
      if (
        now >= this.promotionConfig.startDate &&
        now <= this.promotionConfig.endDate
      ) {
        return this.promotionConfig.trialDays;
      }
    }

    // 返回默认配置
    return this.defaultTrialDays;
  }

  /**
   * 计算试用期结束时间
   *
   * @param userId - 用户ID
   * @param createdAt - 创建时间
   * @returns 试用期结束时间
   */
  calculateTrialEndDate(userId: string, createdAt: Date): Date {
    const trialDays = this.getTrialPeriodForUser(userId);
    const endDate = new Date(createdAt);
    endDate.setDate(endDate.getDate() + trialDays);
    return endDate;
  }

  /**
   * 检查试用期是否即将到期
   *
   * @param userId - 用户ID
   * @param createdAt - 创建时间
   * @param reminderDays - 提醒天数
   * @returns 是否即将到期
   */
  isTrialExpiringSoon(
    userId: string,
    createdAt: Date,
    reminderDays: number,
  ): boolean {
    const trialEndDate = this.calculateTrialEndDate(userId, createdAt);
    const reminderDate = new Date(trialEndDate);
    reminderDate.setDate(reminderDate.getDate() - reminderDays);
    return new Date() >= reminderDate;
  }

  /**
   * 检查试用期是否已过期
   *
   * @param userId - 用户ID
   * @param createdAt - 创建时间
   * @returns 是否已过期
   */
  isTrialExpired(userId: string, createdAt: Date): boolean {
    const trialEndDate = this.calculateTrialEndDate(userId, createdAt);
    return new Date() > trialEndDate;
  }

  /**
   * 检查是否在宽限期内
   *
   * @param userId - 用户ID
   * @param createdAt - 创建时间
   * @returns 是否在宽限期内
   */
  isInGracePeriod(userId: string, createdAt: Date): boolean {
    if (!this.isTrialExpired(userId, createdAt)) {
      return false;
    }
    const trialEndDate = this.calculateTrialEndDate(userId, createdAt);
    const gracePeriodEndDate = new Date(trialEndDate);
    gracePeriodEndDate.setDate(
      gracePeriodEndDate.getDate() + this.gracePeriodDays,
    );
    return new Date() <= gracePeriodEndDate;
  }

  /**
   * 检查数据是否应该被清理
   *
   * @param userId - 用户ID
   * @param createdAt - 创建时间
   * @returns 是否应该清理数据
   */
  shouldCleanupData(userId: string, createdAt: Date): boolean {
    const trialEndDate = this.calculateTrialEndDate(userId, createdAt);
    const cleanupDate = new Date(trialEndDate);
    cleanupDate.setDate(cleanupDate.getDate() + this.dataRetentionDays);
    return new Date() > cleanupDate;
  }

  /**
   * 获取试用期配置的字符串表示
   *
   * @returns 试用期配置字符串
   */
  toString(): string {
    return `TrialPeriodConfig(defaultTrialDays: ${this.defaultTrialDays}, gracePeriodDays: ${this.gracePeriodDays})`;
  }

  /**
   * 创建默认试用期配置
   *
   * @returns 默认试用期配置
   */
  static createDefault(): TrialPeriodConfig {
    return new TrialPeriodConfig({
      defaultTrialDays: 30,
      minTrialDays: 7,
      maxTrialDays: 365,
      gracePeriodDays: 7,
      dataRetentionDays: 30,
      reminderDays: [7, 3, 1],
      userSpecialConfigs: new Map(),
    });
  }
}
