/**
 * 领域业务规则模块
 * @description 导出所有业务规则验证器
 */

export { PermissionAssignmentBusinessRule } from "./permission-assignment.rule.js";
export type { PermissionAssignmentContext } from "./permission-assignment.rule.js";

export { RoleInheritanceBusinessRule } from "./role-inheritance.rule.js";
export type { RoleInheritanceContext } from "./role-inheritance.rule.js";

export { CredentialValidationBusinessRule } from "./credential-validation.rule.js";
export type { CredentialValidationContext } from "./credential-validation.rule.js";

export { AuthorizationCheckBusinessRule } from "./authorization-check.rule.js";
export type { AuthorizationCheckContext } from "./authorization-check.rule.js";
