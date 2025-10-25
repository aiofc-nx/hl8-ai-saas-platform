/**
 * 值对象导出入口
 *
 * @description 统一导出所有值对象
 * @since 1.0.0
 */

// 基础值对象
export { BaseValueObject } from "./base-value-object.js";

// ID值对象
export { PlatformId } from "./platform-id.vo.js";
export { TenantId } from "@hl8/domain-kernel";
export { OrganizationId } from "./organization-id.vo.js";
export { DepartmentId } from "./department-id.vo.js";
export { UserId } from "./user-id.vo.js";
export { RoleId } from "./role-id.vo.js";
export { CaslAbilityId } from "./casl-ability-id.vo.js";

// 隔离上下文值对象
export {
  IsolationContext,
  type IsolationContextData,
} from "./isolation-context.vo.js";

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
