/**
 * 数据访问被拒绝事件
 * @description 当用户尝试访问无权限的数据时触发
 */
export class DataAccessDeniedEvent {
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
}
