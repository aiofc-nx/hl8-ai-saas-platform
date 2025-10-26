import { GenericEntityId } from "@hl8/domain-kernel";

/**
 * 权限撤销事件接口
 * @description 权限被从用户撤销时发布的事件
 */
export interface PermissionRevokedEvent {
  eventId: string;
  occurredAt: Date;
  aggregateId: string;
  version: number;
  eventType: "PermissionRevoked";
  eventData: {
    permissionId: string;
    userId: string;
  };
}

/**
 * 创建权限撤销事件
 * @param permissionId - 权限ID
 * @param userId - 用户ID
 * @param version - 版本号
 * @returns 权限撤销事件
 */
export function createPermissionRevokedEvent(
  permissionId: string,
  userId: string,
  version: number,
): PermissionRevokedEvent {
  return {
    eventId: GenericEntityId.generate().toString(),
    occurredAt: new Date(),
    aggregateId: permissionId,
    version,
    eventType: "PermissionRevoked",
    eventData: {
      permissionId,
      userId,
    },
  };
}
