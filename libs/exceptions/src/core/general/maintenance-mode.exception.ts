import { GeneralException } from "./general.exception.js";

/**
 * 维护模式异常
 *
 * @description 当系统处于维护模式时抛出此异常
 * 通常用于系统维护、升级等场景
 *
 * @example
 * ```typescript
 * // 基本使用
 * throw new MaintenanceModeException('系统正在维护中');
 *
 * // 带上下文数据
 * throw new MaintenanceModeException('系统正在维护中', {
 *   maintenanceWindow: '2024-01-01 02:00 - 2024-01-01 04:00',
 *   reason: 'database_upgrade',
 *   estimatedEndTime: new Date(Date.now() + 2 * 60 * 60 * 1000)
 * });
 * ```
 */
export class MaintenanceModeException extends GeneralException {
  /**
   * 创建维护模式异常
   *
   * @param reason - 维护原因
   * @param data - 附加数据，可包含维护窗口、预计结束时间等
   */
  constructor(reason: string, data?: Record<string, unknown>) {
    super(
      "GENERAL_MAINTENANCE_MODE",
      "系统维护中",
      reason,
      503,
      data,
      "https://docs.hl8.com/errors#GENERAL_MAINTENANCE_MODE",
    );
  }
}
