/**
 * 值对象导出入口
 *
 * @description 统一导出所有值对象
 * @since 1.0.0
 */

// 租户相关值对象
export { TenantCode } from "./tenant-code.vo.js";
export { TenantName } from "./tenant-name.vo.js";
export {
  TenantType,
  TenantTypeEnum,
  type TenantTypeConfig,
} from "./tenant-type.vo.js";
export {
  TenantStatus,
  TenantStatusEnum,
  type TenantStatusTransition,
} from "./tenant-status.vo.js";

// CASL相关值对象
export { CaslRule, CaslActionEnum, CaslSubjectEnum } from "./casl-rule.vo.js";
export {
  CaslCondition,
  CaslConditionOperatorEnum,
} from "./casl-condition.vo.js";

// 角色相关值对象
export {
  RoleLevel,
  RoleLevelEnum,
  type RoleLevelConfig,
} from "./role-level.vo.js";
