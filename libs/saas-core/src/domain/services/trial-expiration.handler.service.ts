/**
 * 试用期过期处理服务
 *
 * @description 负责处理试用期过期事件的业务逻辑
 * @since 1.0.0
 */

import { Injectable } from "@nestjs/common";
import { TrialExpiredEvent } from "../events/trial-expired.event.js";
import { TenantId } from "../value-objects/tenant-id.vo.js";
import { UserId } from "../value-objects/user-id.vo.js";
import {
  TrialPeriodService,
  TrialPeriodStatus,
} from "./trial-period.service.js";

/**
 * 试用期过期处理结果
 */
export interface TrialExpirationHandlerResult {
  readonly success: boolean;
  readonly actions: readonly string[];
  readonly errors: readonly string[];
  readonly nextActions: readonly string[];
}

/**
 * 试用期过期处理配置
 */
export interface TrialExpirationHandlerConfig {
  readonly autoSuspendTenant: boolean;
  readonly sendNotification: boolean;
  readonly enableGracePeriod: boolean;
  readonly gracePeriodDays: number;
  readonly dataRetentionDays: number;
  readonly notificationChannels: readonly string[];
  readonly escalationRules: {
    readonly enableEscalation: boolean;
    readonly escalationDays: number;
    readonly escalationRecipients: readonly string[];
  };
}

/**
 * 试用期过期处理服务
 *
 * 试用期过期处理服务负责处理试用期过期事件的业务逻辑，包括租户状态更新、通知发送、数据清理等。
 * 支持自动处理、手动处理、批量处理等多种处理模式。
 *
 * @example
 * ```typescript
 * const handler = new TrialExpirationHandler();
 * const result = await handler.handleTrialExpiration(trialExpiredEvent);
 * if (result.success) {
 *   console.log("试用期过期处理成功");
 * } else {
 *   console.log("处理失败:", result.errors);
 * }
 * ```
 */
@Injectable()
export class TrialExpirationHandler {
  private readonly config: TrialExpirationHandlerConfig;
  private readonly trialPeriodService: TrialPeriodService;

  constructor(
    config?: Partial<TrialExpirationHandlerConfig>,
    trialPeriodService?: TrialPeriodService,
  ) {
    this.config = {
      autoSuspendTenant: config?.autoSuspendTenant || true,
      sendNotification: config?.sendNotification || true,
      enableGracePeriod: config?.enableGracePeriod || true,
      gracePeriodDays: config?.gracePeriodDays || 7,
      dataRetentionDays: config?.dataRetentionDays || 30,
      notificationChannels: config?.notificationChannels || ["email", "sms"],
      escalationRules: {
        enableEscalation: config?.escalationRules?.enableEscalation || true,
        escalationDays: config?.escalationRules?.escalationDays || 3,
        escalationRecipients:
          config?.escalationRules?.escalationRecipients || [],
        ...config?.escalationRules,
      },
    };
    this.trialPeriodService = trialPeriodService || new TrialPeriodService();
  }

  /**
   * 处理试用期过期事件
   *
   * @param event - 试用期过期事件
   * @returns 处理结果
   */
  async handleTrialExpiration(
    event: TrialExpiredEvent,
  ): Promise<TrialExpirationHandlerResult> {
    const actions: string[] = [];
    const errors: string[] = [];
    const nextActions: string[] = [];

    try {
      // 1. 验证事件数据
      const validationResult = this.validateEvent(event);
      if (!validationResult.isValid) {
        errors.push(...validationResult.errors);
        return {
          success: false,
          actions,
          errors,
          nextActions,
        };
      }

      // 2. 更新租户状态
      if (this.config.autoSuspendTenant) {
        const suspendResult = await this.suspendTenant(
          event.tenantId,
          event.userId,
        );
        if (suspendResult.success) {
          actions.push("租户已暂停");
        } else {
          errors.push(...suspendResult.errors);
        }
      }

      // 3. 发送通知
      if (this.config.sendNotification) {
        const notificationResult = await this.sendExpirationNotification(event);
        if (notificationResult.success) {
          actions.push("通知已发送");
        } else {
          errors.push(...notificationResult.errors);
        }
      }

      // 4. 设置宽限期
      if (this.config.enableGracePeriod) {
        const gracePeriodResult = await this.setupGracePeriod(event);
        if (gracePeriodResult.success) {
          actions.push("宽限期已设置");
          nextActions.push("监控宽限期状态");
        } else {
          errors.push(...gracePeriodResult.errors);
        }
      }

      // 5. 设置数据清理计划
      const cleanupResult = await this.scheduleDataCleanup(event);
      if (cleanupResult.success) {
        actions.push("数据清理计划已设置");
        nextActions.push("执行数据清理");
      } else {
        errors.push(...cleanupResult.errors);
      }

      // 6. 记录处理日志
      await this.logTrialExpiration(event, actions, errors);

      return {
        success: errors.length === 0,
        actions,
        errors,
        nextActions,
      };
    } catch (error) {
      errors.push(`处理试用期过期事件时发生错误: ${error}`);
      return {
        success: false,
        actions,
        errors,
        nextActions,
      };
    }
  }

  /**
   * 验证试用期过期事件
   *
   * @param event - 试用期过期事件
   * @returns 验证结果
   */
  private validateEvent(event: TrialExpiredEvent): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!event.tenantId) {
      errors.push("租户ID不能为空");
    }
    if (!event.userId) {
      errors.push("用户ID不能为空");
    }
    if (!event.expiredAt) {
      errors.push("过期时间不能为空");
    }
    if (!event.trialStartDate) {
      errors.push("试用期开始时间不能为空");
    }
    if (!event.trialEndDate) {
      errors.push("试用期结束时间不能为空");
    }
    if (event.trialStartDate >= event.trialEndDate) {
      errors.push("试用期开始时间必须早于结束时间");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 暂停租户
   *
   * @param tenantId - 租户ID
   * @param userId - 用户ID
   * @returns 暂停结果
   */
  private async suspendTenant(
    tenantId: TenantId,
    userId: UserId,
  ): Promise<{ success: boolean; errors: string[] }> {
    try {
      // 这里应该调用实际的租户服务来暂停租户
      // await this.tenantService.suspendTenant(tenantId, userId);

      console.log(`暂停租户: ${tenantId.value}, 用户: ${userId.value}`);
      return {
        success: true,
        errors: [],
      };
    } catch (error) {
      return {
        success: false,
        errors: [`暂停租户失败: ${error}`],
      };
    }
  }

  /**
   * 发送过期通知
   *
   * @param event - 试用期过期事件
   * @returns 通知结果
   */
  private async sendExpirationNotification(
    event: TrialExpiredEvent,
  ): Promise<{ success: boolean; errors: string[] }> {
    try {
      // 这里应该调用实际的通知服务
      // await this.notificationService.sendTrialExpirationNotification(event);

      console.log(
        `发送试用期过期通知: 租户 ${event.tenantId.value}, 用户 ${event.userId.value}`,
      );
      return {
        success: true,
        errors: [],
      };
    } catch (error) {
      return {
        success: false,
        errors: [`发送通知失败: ${error}`],
      };
    }
  }

  /**
   * 设置宽限期
   *
   * @param event - 试用期过期事件
   * @returns 宽限期设置结果
   */
  private async setupGracePeriod(
    event: TrialExpiredEvent,
  ): Promise<{ success: boolean; errors: string[] }> {
    try {
      // 这里应该调用实际的服务来设置宽限期
      // await this.tenantService.setupGracePeriod(event.tenantId, this.config.gracePeriodDays);

      console.log(
        `设置宽限期: 租户 ${event.tenantId.value}, 宽限期 ${this.config.gracePeriodDays} 天`,
      );
      return {
        success: true,
        errors: [],
      };
    } catch (error) {
      return {
        success: false,
        errors: [`设置宽限期失败: ${error}`],
      };
    }
  }

  /**
   * 安排数据清理
   *
   * @param event - 试用期过期事件
   * @returns 数据清理安排结果
   */
  private async scheduleDataCleanup(
    event: TrialExpiredEvent,
  ): Promise<{ success: boolean; errors: string[] }> {
    try {
      // 计算清理时间
      const cleanupDate = new Date(event.trialEndDate);
      cleanupDate.setDate(
        cleanupDate.getDate() + this.config.dataRetentionDays,
      );

      // 这里应该调用实际的服务来安排数据清理
      // await this.dataCleanupService.scheduleCleanup(event.tenantId, cleanupDate);

      console.log(
        `安排数据清理: 租户 ${event.tenantId.value}, 清理时间 ${cleanupDate.toISOString()}`,
      );
      return {
        success: true,
        errors: [],
      };
    } catch (error) {
      return {
        success: false,
        errors: [`安排数据清理失败: ${error}`],
      };
    }
  }

  /**
   * 记录处理日志
   *
   * @param event - 试用期过期事件
   * @param actions - 执行的操作
   * @param errors - 错误信息
   */
  private async logTrialExpiration(
    event: TrialExpiredEvent,
    actions: string[],
    errors: string[],
  ): Promise<void> {
    try {
      // 这里应该调用实际的日志服务
      // await this.loggingService.logTrialExpiration(event, actions, errors);

      console.log(
        `记录试用期过期处理日志: 租户 ${event.tenantId.value}, 操作: ${actions.join(", ")}, 错误: ${errors.join(", ")}`,
      );
    } catch (error) {
      console.error(`记录日志失败: ${error}`);
    }
  }

  /**
   * 批量处理试用期过期事件
   *
   * @param events - 试用期过期事件列表
   * @returns 批量处理结果
   */
  async handleBatchTrialExpiration(
    events: readonly TrialExpiredEvent[],
  ): Promise<{
    readonly totalEvents: number;
    readonly successfulEvents: number;
    readonly failedEvents: number;
    readonly results: readonly TrialExpirationHandlerResult[];
  }> {
    const results: TrialExpirationHandlerResult[] = [];
    let successfulEvents = 0;
    let failedEvents = 0;

    for (const event of events) {
      const result = await this.handleTrialExpiration(event);
      results.push(result);

      if (result.success) {
        successfulEvents++;
      } else {
        failedEvents++;
      }
    }

    return {
      totalEvents: events.length,
      successfulEvents,
      failedEvents,
      results,
    };
  }

  /**
   * 获取试用期过期处理统计信息
   *
   * @param events - 试用期过期事件列表
   * @returns 统计信息
   */
  getTrialExpirationStatistics(events: readonly TrialExpiredEvent[]): {
    readonly totalEvents: number;
    readonly eventsByTenant: Record<string, number>;
    readonly eventsByUser: Record<string, number>;
    readonly eventsByStatus: Record<TrialPeriodStatus, number>;
    readonly averageTrialDuration: number;
  } {
    const eventsByTenant: Record<string, number> = {};
    const eventsByUser: Record<string, number> = {};
    const eventsByStatus: Record<TrialPeriodStatus, number> = {} as Record<
      TrialPeriodStatus,
      number
    >;
    let totalTrialDuration = 0;

    for (const event of events) {
      // 按租户统计
      eventsByTenant[event.tenantId.value] =
        (eventsByTenant[event.tenantId.value] || 0) + 1;

      // 按用户统计
      eventsByUser[event.userId.value] =
        (eventsByUser[event.userId.value] || 0) + 1;

      // 按状态统计
      eventsByStatus[event.status] = (eventsByStatus[event.status] || 0) + 1;

      // 计算试用期持续时间
      totalTrialDuration += event.getTrialDuration();
    }

    return {
      totalEvents: events.length,
      eventsByTenant,
      eventsByUser,
      eventsByStatus,
      averageTrialDuration:
        events.length > 0 ? totalTrialDuration / events.length : 0,
    };
  }
}
