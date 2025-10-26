import { GenericEntityId } from "@hl8/domain-kernel";

/**
 * 凭证更新事件接口
 * @description 凭证被更新时发布的事件
 */
export interface CredentialUpdatedEvent {
  eventId: string;
  occurredAt: Date;
  aggregateId: string;
  version: number;
  eventType: "CredentialUpdated";
  eventData: {
    credentialId: string;
    userId: string;
  };
}

/**
 * 创建凭证更新事件
 * @param credentialId - 凭证ID
 * @param userId - 用户ID
 * @param version - 版本号
 * @returns 凭证更新事件
 */
export function createCredentialUpdatedEvent(
  credentialId: string,
  userId: string,
  version: number,
): CredentialUpdatedEvent {
  return {
    eventId: GenericEntityId.generate().toString(),
    occurredAt: new Date(),
    aggregateId: credentialId,
    version,
    eventType: "CredentialUpdated",
    eventData: {
      credentialId,
      userId,
    },
  };
}
