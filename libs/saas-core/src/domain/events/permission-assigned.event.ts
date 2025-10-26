import { GenericEntityId } from "@hl8/domain-kernel";

/**
 * 权限分配事件接口
 * @description 权限被分配给用户时发布的事件
 */
export interface PermissionAssignedEvent {
  eventId: string;
  occurredAt: Date;
  aggregateId: string;
  version: number;
  eventType: "PermissionAssigned";
  eventData: {
    permissionId: string;
    userId: string;
  };
}

/**
 * 创建权限分配事件
 * @param permissionId - 权限ID
 * @param userId - 用户ID
 * @param version - 版本号
 * @returns 权限分配事件
 */
export function createPermissionAssignedEvent(
  permissionId: string,
  userId: string,
  version: number,
): PermissionAssignedEvent {
  return {
    eventId: GenericEntityId.generate().toString(),
    occurredAt: new Date(),
    aggregateId: permissionId,
    version,
    eventType: "PermissionAssigned",
    eventData: {
      permissionId,
      userId,
    },
  };
}
