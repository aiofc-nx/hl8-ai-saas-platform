import { GeneralException } from "./general.exception.js";

/**
 * 未实现异常
 *
 * @description 当功能未实现时抛出此异常
 * 通常用于开发阶段、功能占位等场景
 *
 * @example
 * ```typescript
 * // 基本使用
 * throw new NotImplementedException('高级搜索功能');
 *
 * // 带上下文数据
 * throw new NotImplementedException('高级搜索功能', {
 *   feature: 'advanced_search',
 *   version: '2.0.0',
 *   estimatedCompletion: '2024-06-01'
 * });
 * ```
 */
export class NotImplementedException extends GeneralException {
  /**
   * 创建未实现异常
   *
   * @param feature - 未实现的功能名称
   * @param data - 附加数据，可包含功能标识、版本信息等
   */
  constructor(feature: string, data?: Record<string, unknown>) {
    super(
      "GENERAL_NOT_IMPLEMENTED",
      "功能未实现",
      `功能 "${feature}" 尚未实现`,
      501,
      { feature, ...data },
      "https://docs.hl8.com/errors#GENERAL_NOT_IMPLEMENTED",
    );
  }
}
