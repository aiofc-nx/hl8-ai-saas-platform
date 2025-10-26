/**
 * @hl8/domain-kernel 基础设置
 * 配置领域内核组件的基础设施
 */

import {
  IsolationContext,
  IsolationLevel,
  SharingLevel,
} from "@hl8/domain-kernel";

/**
 * 领域内核组件配置
 */
export class DomainKernelSetup {
  /**
   * 初始化隔离上下文
   */
  static initializeIsolationContext(): void {
    // 设置默认隔离级别
    process.env.DEFAULT_ISOLATION_LEVEL = IsolationLevel.TENANT;

    // 配置隔离上下文工厂方法
    IsolationContext.tenant = IsolationContext.tenant.bind(IsolationContext);
    IsolationContext.organization =
      IsolationContext.organization.bind(IsolationContext);
    IsolationContext.department =
      IsolationContext.department.bind(IsolationContext);
    IsolationContext.user = IsolationContext.user.bind(IsolationContext);
  }

  /**
   * 配置数据隔离策略
   */
  static configureDataIsolation(): void {
    // 配置5层隔离架构
    const isolationLevels = [
      IsolationLevel.PLATFORM,
      IsolationLevel.TENANT,
      IsolationLevel.ORGANIZATION,
      IsolationLevel.DEPARTMENT,
      IsolationLevel.USER,
    ];

    // 配置共享级别
    const sharingLevels = [
      SharingLevel.PLATFORM,
      SharingLevel.TENANT,
      SharingLevel.ORGANIZATION,
      SharingLevel.DEPARTMENT,
      SharingLevel.USER,
    ];

    // 存储配置到环境变量
    process.env.ISOLATION_LEVELS = JSON.stringify(isolationLevels);
    process.env.SHARING_LEVELS = JSON.stringify(sharingLevels);
  }

  /**
   * 初始化领域内核
   */
  static initialize(): void {
    this.initializeIsolationContext();
    this.configureDataIsolation();
  }
}
