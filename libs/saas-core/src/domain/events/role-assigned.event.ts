import { GenericEntityId } from "@hl8/domain-kernel";

/**
 * 角色分配事件接口
 * @description 角色被分配给用户时发布的事件
 */
export interface RoleAssignedEvent {
  eventId: string;
  occurredAt: Date;
  aggregateId: string;
  version: number;
  eventType: "RoleAssigned";
  eventData: {
    roleId: string;
    userId: string;
  };
}

/**
 * 创建角色分配事件
 * @param roleId - 角色ID
 * @param userId - 用户ID
 * @param version - 版本号
 * @returns 角色分配事件
 */
export function createRoleAssignedEvent(
  roleId: string,
  userId: string,
  version: number,
): RoleAssignedEvent {
  return {
    eventId: GenericEntityId.generate().toString(),
    occurredAt: new Date(),
    aggregateId: roleId,
    version,
    eventType: "RoleAssigned",
    eventData: {
      roleId,
      userId,
    },
  };
}
