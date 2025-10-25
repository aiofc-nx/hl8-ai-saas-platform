/**
 * 试用期服务
 *
 * @description 负责试用期计算、管理和业务逻辑处理
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import { TrialPeriodConfig } from "../value-objects/trial-period-config.vo.js";
import { TenantId } from "../value-objects/tenant-id.vo.js";
import { UserId } from "../value-objects/user-id.vo.js";

/**
 * 试用期状态枚举
 */
export enum TrialPeriodStatus {
  ACTIVE = "ACTIVE",
  EXPIRING = "EXPIRING",
  EXPIRED = "EXPIRED",
  GRACE_PERIOD = "GRACE_PERIOD",
  CLEANUP_READY = "CLEANUP_READY",
}

/**
 * 试用期信息
 */
export interface TrialPeriodInfo {
  readonly tenantId: TenantId;
  readonly userId: UserId;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly status: TrialPeriodStatus;
  readonly daysRemaining: number;
  readonly gracePeriodEndDate?: Date;
  readonly cleanupDate?: Date;
  readonly reminderDates: readonly Date[];
}

/**
 * 试用期服务
 *
 * 试用期服务负责管理租户的试用期逻辑，包括试用期计算、状态管理、提醒处理等。
 * 支持多种试用期配置、自动状态转换、数据清理等功能。
 *
 * @example
 * ```typescript
 * const service = new TrialPeriodService();
 * const info = await service.getTrialPeriodInfo(tenantId, userId);
 * if (info.status === TrialPeriodStatus.EXPIRING) {
 *   await service.sendExpirationReminder(tenantId, userId);
 * }
 * ```
 */
@Injectable()
export class TrialPeriodService {
  private readonly defaultConfig: TrialPeriodConfig;

  constructor(config?: TrialPeriodConfig) {
    this.defaultConfig = config || TrialPeriodConfig.createDefault();
  }

  /**
   * 获取试用期信息
   *
   * @param tenantId - 租户ID
   * @param userId - 用户ID
   * @param createdAt - 创建时间
   * @param config - 试用期配置
   * @returns 试用期信息
   */
  async getTrialPeriodInfo(
    tenantId: TenantId,
    userId: UserId,
    createdAt: Date,
    config: TrialPeriodConfig = this.defaultConfig,
  ): Promise<TrialPeriodInfo> {
    const endDate = config.calculateTrialEndDate(userId.value, createdAt);
    const status = this.calculateTrialStatus(
      tenantId,
      userId,
      createdAt,
      config,
    );
    const daysRemaining = this.calculateDaysRemaining(endDate);

    let gracePeriodEndDate: Date | undefined;
    let cleanupDate: Date | undefined;

    if (
      status === TrialPeriodStatus.GRACE_PERIOD ||
      status === TrialPeriodStatus.CLEANUP_READY
    ) {
      gracePeriodEndDate = new Date(endDate);
      gracePeriodEndDate.setDate(
        gracePeriodEndDate.getDate() + config.gracePeriodDays,
      );
    }

    if (status === TrialPeriodStatus.CLEANUP_READY) {
      cleanupDate = new Date(endDate);
      cleanupDate.setDate(cleanupDate.getDate() + config.dataRetentionDays);
    }

    const reminderDates = this.calculateReminderDates(
      createdAt,
      endDate,
      config,
    );

    return {
      tenantId,
      userId,
      startDate: createdAt,
      endDate,
      status,
      daysRemaining,
      gracePeriodEndDate,
      cleanupDate,
      reminderDates,
    };
  }

  /**
   * 计算试用期状态
   *
   * @param tenantId - 租户ID
   * @param userId - 用户ID
   * @param createdAt - 创建时间
   * @param config - 试用期配置
   * @returns 试用期状态
   */
  private calculateTrialStatus(
    tenantId: TenantId,
    userId: UserId,
    createdAt: Date,
    config: TrialPeriodConfig,
  ): TrialPeriodStatus {
    const now = new Date();
    const endDate = config.calculateTrialEndDate(userId.value, createdAt);

    if (now <= endDate) {
      // 试用期内
      const daysRemaining = this.calculateDaysRemaining(endDate);
      if (daysRemaining <= 3) {
        return TrialPeriodStatus.EXPIRING;
      }
      return TrialPeriodStatus.ACTIVE;
    }

    // 试用期已过期
    if (config.isInGracePeriod(userId.value, createdAt)) {
      return TrialPeriodStatus.GRACE_PERIOD;
    }

    if (config.shouldCleanupData(userId.value, createdAt)) {
      return TrialPeriodStatus.CLEANUP_READY;
    }

    return TrialPeriodStatus.EXPIRED;
  }

  /**
   * 计算剩余天数
   *
   * @param endDate - 结束时间
   * @returns 剩余天数
   */
  private calculateDaysRemaining(endDate: Date): number {
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  /**
   * 计算提醒日期
   *
   * @param startDate - 开始时间
   * @param endDate - 结束时间
   * @param config - 试用期配置
   * @returns 提醒日期列表
   */
  private calculateReminderDates(
    startDate: Date,
    endDate: Date,
    config: TrialPeriodConfig,
  ): readonly Date[] {
    const reminderDates: Date[] = [];

    for (const reminderDay of config.reminderDays) {
      const reminderDate = new Date(endDate);
      reminderDate.setDate(reminderDate.getDate() - reminderDay);

      // 确保提醒日期在开始时间之后
      if (reminderDate > startDate) {
        reminderDates.push(reminderDate);
      }
    }

    return reminderDates.sort((a, b) => a.getTime() - b.getTime());
  }

  /**
   * 检查是否需要发送提醒
   *
   * @param tenantId - 租户ID
   * @param userId - 用户ID
   * @param createdAt - 创建时间
   * @param config - 试用期配置
   * @returns 是否需要发送提醒
   */
  async shouldSendReminder(
    tenantId: TenantId,
    userId: UserId,
    createdAt: Date,
    config: TrialPeriodConfig = this.defaultConfig,
  ): Promise<boolean> {
    const info = await this.getTrialPeriodInfo(
      tenantId,
      userId,
      createdAt,
      config,
    );
    return info.status === TrialPeriodStatus.EXPIRING;
  }

  /**
   * 发送试用期到期提醒
   *
   * @param tenantId - 租户ID
   * @param userId - 用户ID
   * @param createdAt - 创建时间
   * @param config - 试用期配置
   * @returns 是否发送成功
   */
  async sendExpirationReminder(
    tenantId: TenantId,
    userId: UserId,
    createdAt: Date,
    config: TrialPeriodConfig = this.defaultConfig,
  ): Promise<boolean> {
    try {
      const info = await this.getTrialPeriodInfo(
        tenantId,
        userId,
        createdAt,
        config,
      );

      if (info.status !== TrialPeriodStatus.EXPIRING) {
        return false;
      }

      // 这里应该调用实际的通知服务
      // await this.notificationService.sendTrialExpirationReminder(tenantId, userId, info);

      console.log(
        `发送试用期到期提醒: 租户 ${tenantId.value}, 用户 ${userId.value}, 剩余 ${info.daysRemaining} 天`,
      );
      return true;
    } catch (error) {
      console.error(`发送试用期到期提醒失败: ${error}`);
      return false;
    }
  }

  /**
   * 处理试用期过期
   *
   * @param tenantId - 租户ID
   * @param userId - 用户ID
   * @param createdAt - 创建时间
   * @param config - 试用期配置
   * @returns 处理结果
   */
  async handleTrialExpiration(
    tenantId: TenantId,
    userId: UserId,
    createdAt: Date,
    config: TrialPeriodConfig = this.defaultConfig,
  ): Promise<{
    readonly shouldSuspend: boolean;
    readonly shouldNotify: boolean;
    readonly gracePeriodDays: number;
  }> {
    const info = await this.getTrialPeriodInfo(
      tenantId,
      userId,
      createdAt,
      config,
    );

    if (info.status === TrialPeriodStatus.EXPIRED) {
      return {
        shouldSuspend: true,
        shouldNotify: true,
        gracePeriodDays: 0,
      };
    }

    if (info.status === TrialPeriodStatus.GRACE_PERIOD) {
      const gracePeriodDays = info.gracePeriodEndDate
        ? Math.max(
            0,
            Math.ceil(
              (info.gracePeriodEndDate.getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24),
            ),
          )
        : 0;

      return {
        shouldSuspend: false,
        shouldNotify: true,
        gracePeriodDays,
      };
    }

    return {
      shouldSuspend: false,
      shouldNotify: false,
      gracePeriodDays: 0,
    };
  }

  /**
   * 处理试用期数据清理
   *
   * @param tenantId - 租户ID
   * @param userId - 用户ID
   * @param createdAt - 创建时间
   * @param config - 试用期配置
   * @returns 是否应该清理数据
   */
  async shouldCleanupTrialData(
    tenantId: TenantId,
    userId: UserId,
    createdAt: Date,
    config: TrialPeriodConfig = this.defaultConfig,
  ): Promise<boolean> {
    const info = await this.getTrialPeriodInfo(
      tenantId,
      userId,
      createdAt,
      config,
    );
    return info.status === TrialPeriodStatus.CLEANUP_READY;
  }

  /**
   * 清理试用期数据
   *
   * @param tenantId - 租户ID
   * @param userId - 用户ID
   * @param createdAt - 创建时间
   * @param config - 试用期配置
   * @returns 清理结果
   */
  async cleanupTrialData(
    tenantId: TenantId,
    userId: UserId,
    createdAt: Date,
    config: TrialPeriodConfig = this.defaultConfig,
  ): Promise<{
    readonly success: boolean;
    readonly cleanedData: readonly string[];
    readonly errors: readonly string[];
  }> {
    try {
      const shouldCleanup = await this.shouldCleanupTrialData(
        tenantId,
        userId,
        createdAt,
        config,
      );

      if (!shouldCleanup) {
        return {
          success: false,
          cleanedData: [],
          errors: ["数据尚未到清理时间"],
        };
      }

      // 这里应该调用实际的数据清理服务
      // const cleanupResult = await this.dataCleanupService.cleanupTrialData(tenantId, userId);

      const cleanedData = [
        `租户 ${tenantId.value} 的用户数据`,
        `租户 ${tenantId.value} 的组织数据`,
        `租户 ${tenantId.value} 的部门数据`,
      ];

      console.log(
        `清理试用期数据: 租户 ${tenantId.value}, 用户 ${userId.value}`,
      );

      return {
        success: true,
        cleanedData,
        errors: [],
      };
    } catch (error) {
      return {
        success: false,
        cleanedData: [],
        errors: [`清理失败: ${error}`],
      };
    }
  }

  /**
   * 获取试用期统计信息
   *
   * @param tenantIds - 租户ID列表
   * @param config - 试用期配置
   * @returns 统计信息
   */
  async getTrialPeriodStatistics(
    tenantIds: readonly TenantId[],
    config: TrialPeriodConfig = this.defaultConfig,
  ): Promise<{
    readonly totalTenants: number;
    readonly activeTrials: number;
    readonly expiringTrials: number;
    readonly expiredTrials: number;
    readonly gracePeriodTrials: number;
    readonly cleanupReadyTrials: number;
  }> {
    let activeTrials = 0;
    let expiringTrials = 0;
    let expiredTrials = 0;
    let gracePeriodTrials = 0;
    let cleanupReadyTrials = 0;

    for (const tenantId of tenantIds) {
      // 这里应该从数据库获取实际的租户信息
      // const tenant = await this.tenantRepository.findById(tenantId);
      // if (tenant) {
      //   const info = await this.getTrialPeriodInfo(tenantId, tenant.createdBy, tenant.createdAt, config);
      //   switch (info.status) {
      //     case TrialPeriodStatus.ACTIVE:
      //       activeTrials++;
      //       break;
      //     case TrialPeriodStatus.EXPIRING:
      //       expiringTrials++;
      //       break;
      //     case TrialPeriodStatus.EXPIRED:
      //       expiredTrials++;
      //       break;
      //     case TrialPeriodStatus.GRACE_PERIOD:
      //       gracePeriodTrials++;
      //       break;
      //     case TrialPeriodStatus.CLEANUP_READY:
      //       cleanupReadyTrials++;
      //       break;
      //   }
      // }
    }

    return {
      totalTenants: tenantIds.length,
      activeTrials,
      expiringTrials,
      expiredTrials,
      gracePeriodTrials,
      cleanupReadyTrials,
    };
  }
}
