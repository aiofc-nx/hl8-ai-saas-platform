/**
 * 数据访问被拒绝事件
 *
 * @description 当用户尝试访问无权限的数据时触发
 *
 * ## 业务规则
 *
 * ### 触发条件
 * - 用户尝试访问超出其隔离级别的数据
 * - 用户尝试访问非共享的私有数据
 * - 共享级别不匹配的数据访问
 *
 * ### 事件用途
 * - 安全审计和监控
 * - 权限异常检测
 * - 合规性报告
 * - 安全告警
 *
 * @example
 * ```typescript
 * // 触发数据访问被拒绝事件
 * const event = new DataAccessDeniedEvent(
 *   'user-123',
 *   'data-456',
 *   'User level context cannot access organization level data',
 *   new Date()
 * );
 *
 * // 发布事件
 * eventBus.publish(event);
 * ```
 *
 * @since 1.0.0
 */
export class DataAccessDeniedEvent {
  /**
   * 构造函数
   *
   * @param userId - 尝试访问数据的用户ID
   * @param dataId - 被访问的数据ID
   * @param reason - 访问被拒绝的原因
   * @param occurredAt - 事件发生时间，默认为当前时间
   */
  constructor(
    /** 用户 ID */
    public readonly userId: string,
    /** 数据 ID */
    public readonly dataId: string,
    /** 拒绝原因 */
    public readonly reason: string,
    /** 发生时间 */
    public readonly occurredAt: Date = new Date(),
  ) {}

  /**
   * 获取事件的字符串表示
   *
   * @returns 事件描述字符串
   */
  toString(): string {
    return `DataAccessDeniedEvent: User ${this.userId} denied access to data ${this.dataId}. Reason: ${this.reason}`;
  }

  /**
   * 获取事件的JSON表示
   *
   * @returns 事件的JSON对象
   */
  toJSON(): Record<string, unknown> {
    return {
      type: 'DataAccessDeniedEvent',
      userId: this.userId,
      dataId: this.dataId,
      reason: this.reason,
      occurredAt: this.occurredAt.toISOString(),
    };
  }
}
