import { GenericEntityId } from "@hl8/domain-kernel";

/**
 * 角色撤销事件接口
 * @description 角色被从用户撤销时发布的事件
 */
export interface RoleRevokedEvent {
  eventId: string;
  occurredAt: Date;
  aggregateId: string;
  version: number;
  eventType: "RoleRevoked";
  eventData: {
    roleId: string;
    userId: string;
  };
}

/**
 * 创建角色撤销事件
 * @param roleId - 角色ID
 * @param userId - 用户ID
 * @param version - 版本号
 * @returns 角色撤销事件
 */
export function createRoleRevokedEvent(
  roleId: string,
  userId: string,
  version: number,
): RoleRevokedEvent {
  return {
    eventId: GenericEntityId.generate().toString(),
    occurredAt: new Date(),
    aggregateId: roleId,
    version,
    eventType: "RoleRevoked",
    eventData: {
      roleId,
      userId,
    },
  };
}
