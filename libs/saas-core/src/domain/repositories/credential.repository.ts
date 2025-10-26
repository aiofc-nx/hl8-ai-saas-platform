/**
 * 凭证仓储接口
 * @description 定义凭证聚合根的持久化契约
 *
 * @since 1.0.0
 */
import { GenericEntityId } from "@hl8/domain-kernel";
import { Credential } from "../aggregates/credential.aggregate.js";
import { CredentialType } from "../value-objects/credential-type.vo.js";

/**
 * 凭证仓储接口
 */
export interface ICredentialRepository {
  /**
   * 保存凭证
   * @param credential - 凭证聚合根
   * @returns Promise<void>
   */
  save(credential: Credential): Promise<void>;

  /**
   * 根据ID查找凭证
   * @param id - 凭证ID
   * @returns 凭证聚合根或null
   */
  findById(id: GenericEntityId): Promise<Credential | null>;

  /**
   * 根据用户ID和类型查找凭证
   * @param userId - 用户ID
   * @param type - 凭证类型
   * @returns 凭证聚合根或null
   */
  findByUserAndType(
    userId: GenericEntityId,
    type: CredentialType,
  ): Promise<Credential | null>;

  /**
   * 查找用户的所有凭证
   * @param userId - 用户ID
   * @returns 凭证列表
   */
  findByUser(userId: GenericEntityId): Promise<Credential[]>;

  /**
   * 查找过期的凭证
   * @param before - 过期时间之前
   * @param offset - 偏移量
   * @param limit - 限制数量
   * @returns 凭证列表和总数
   */
  findExpired(
    before: Date,
    offset?: number,
    limit?: number,
  ): Promise<{ credentials: Credential[]; total: number }>;

  /**
   * 删除凭证
   * @param id - 凭证ID
   * @returns Promise<void>
   */
  delete(id: GenericEntityId): Promise<void>;
}
