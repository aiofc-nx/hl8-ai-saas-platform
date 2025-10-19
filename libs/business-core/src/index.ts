/**
 * Business Core Module
 *
 * @description 业务核心模块，提供领域驱动设计的核心功能
 * @since 1.0.0
 */

// 通用功能层 (包含所有横切关注点)
export * from "./common/constants/index.js";
export * from "./common/enums/index.js";
export * from "./common/types/index.js";
export * from "./common/utils/index.js";

// 从isolation-model重新导出ID值对象
export { EntityId, TenantId, UserId } from "@hl8/isolation-model";