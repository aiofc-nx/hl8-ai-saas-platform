import { GenericEntityId } from "@hl8/domain-kernel";
import { RoleType } from "../value-objects/role-type.vo.js";

/**
 * 角色创建事件接口
 * @description 角色被创建时发布的事件
 */
export interface RoleCreatedEvent {
  eventId: string;
  occurredAt: Date;
  aggregateId: string;
  version: number;
  eventType: "RoleCreated";
  eventData: {
    roleId: string;
    code: string;
    name: string;
    type: RoleType;
    description?: string;
  };
}

/**
 * 创建角色创建事件
 * @param roleId - 角色ID
 * @param code - 角色代码
 * @param name - 角色名称
 * @param type - 角色类型
 * @param description - 角色描述
 * @returns 角色创建事件
 */
export function createRoleCreatedEvent(
  roleId: string,
  code: string,
  name: string,
  type: RoleType,
  description?: string,
): RoleCreatedEvent {
  return {
    eventId: GenericEntityId.generate().toString(),
    occurredAt: new Date(),
    aggregateId: roleId,
    version: 1,
    eventType: "RoleCreated",
    eventData: {
      roleId,
      code,
      name,
      type,
      description,
    },
  };
}
