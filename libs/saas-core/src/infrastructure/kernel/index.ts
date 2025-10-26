/**
 * @hl8 内核组件统一初始化
 * 初始化所有@hl8内核组件的基础设施
 */

import { DomainKernelSetup } from "./domain-kernel.setup.js";
import { ApplicationKernelSetup } from "./application-kernel.setup.js";
import { InfrastructureKernelSetup } from "./infrastructure-kernel.setup.js";
import { InterfaceKernelSetup } from "./interface-kernel.setup.js";
import { CrossCuttingSetup } from "./cross-cutting.setup.js";

/**
 * 内核组件初始化器
 */
export class KernelInitializer {
  /**
   * 初始化所有内核组件
   */
  static async initialize(): Promise<void> {
    try {
      // 初始化领域内核
      DomainKernelSetup.initialize();

      // 初始化应用内核
      ApplicationKernelSetup.initialize();

      // 初始化基础设施内核
      InfrastructureKernelSetup.initialize();

      // 初始化接口内核
      InterfaceKernelSetup.initialize();

      // 初始化横切关注点
      CrossCuttingSetup.initialize();

      console.log("✅ 所有@hl8内核组件初始化完成");
    } catch (error) {
      console.error("❌ 内核组件初始化失败:", error);
      throw error;
    }
  }

  /**
   * 验证内核组件配置
   */
  static validateConfiguration(): boolean {
    const requiredEnvVars = [
      "DEFAULT_ISOLATION_LEVEL",
      "COMMAND_BUS_ENABLED",
      "QUERY_BUS_ENABLED",
      "EVENT_BUS_ENABLED",
      "CACHE_ENABLED",
      "CONFIG_VALIDATION_ENABLED",
      "LOG_LEVEL",
      "AUDIT_LOGGING_ENABLED",
    ];

    const missingVars = requiredEnvVars.filter(
      (varName) => !process.env[varName],
    );

    if (missingVars.length > 0) {
      console.warn("⚠️ 缺少必要的环境变量:", missingVars);
      return false;
    }

    console.log("✅ 内核组件配置验证通过");
    return true;
  }
}

// 导出所有设置类
export {
  DomainKernelSetup,
  ApplicationKernelSetup,
  InfrastructureKernelSetup,
  InterfaceKernelSetup,
  CrossCuttingSetup,
};
