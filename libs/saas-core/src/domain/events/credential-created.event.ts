import { GenericEntityId } from "@hl8/domain-kernel";
import { CredentialType } from "../value-objects/credential-type.vo.js";

/**
 * 凭证创建事件接口
 * @description 凭证被创建时发布的事件
 */
export interface CredentialCreatedEvent {
  eventId: string;
  occurredAt: Date;
  aggregateId: string;
  version: number;
  eventType: "CredentialCreated";
  eventData: {
    credentialId: string;
    userId: string;
    type: CredentialType;
    expiresAt?: string;
  };
}

/**
 * 创建凭证创建事件
 * @param credentialId - 凭证ID
 * @param userId - 用户ID
 * @param type - 凭证类型
 * @param expiresAt - 过期时间
 * @returns 凭证创建事件
 */
export function createCredentialCreatedEvent(
  credentialId: string,
  userId: string,
  type: CredentialType,
  expiresAt?: Date,
): CredentialCreatedEvent {
  return {
    eventId: GenericEntityId.generate().toString(),
    occurredAt: new Date(),
    aggregateId: credentialId,
    version: 1,
    eventType: "CredentialCreated",
    eventData: {
      credentialId,
      userId,
      type,
      expiresAt: expiresAt?.toISOString(),
    },
  };
}
