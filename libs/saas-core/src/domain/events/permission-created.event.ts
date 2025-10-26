import { GenericEntityId } from "@hl8/domain-kernel";
import { PermissionAction } from "../value-objects/permission-action.vo.js";
import { PermissionScope } from "../value-objects/permission-scope.vo.js";

/**
 * 权限创建事件接口
 * @description 权限被创建时发布的事件
 */
export interface PermissionCreatedEvent {
  eventId: string;
  occurredAt: Date;
  aggregateId: string;
  version: number;
  eventType: "PermissionCreated";
  eventData: {
    permissionId: string;
    code: string;
    name: string;
    action: PermissionAction;
    scope: PermissionScope;
    description?: string;
  };
}

/**
 * 创建权限创建事件
 * @param permissionId - 权限ID
 * @param code - 权限代码
 * @param name - 权限名称
 * @param action - 权限操作
 * @param scope - 权限范围
 * @param description - 权限描述
 * @returns 权限创建事件
 */
export function createPermissionCreatedEvent(
  permissionId: string,
  code: string,
  name: string,
  action: PermissionAction,
  scope: PermissionScope,
  description?: string,
): PermissionCreatedEvent {
  return {
    eventId: GenericEntityId.generate().toString(),
    occurredAt: new Date(),
    aggregateId: permissionId,
    version: 1,
    eventType: "PermissionCreated",
    eventData: {
      permissionId,
      code,
      name,
      action,
      scope,
      description,
    },
  };
}
