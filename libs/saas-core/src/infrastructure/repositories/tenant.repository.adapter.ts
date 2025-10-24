import { Injectable } from "@nestjs/common";
import { BaseRepositoryAdapter } from "@hl8/infrastructure-kernel";
import { EntityManager, FilterQuery, FindOptions } from "@hl8/database";
import { Tenant, TenantId } from "../../domain/entities/tenant.entity.js";
import { TenantRepository } from "../../domain/repositories/tenant.repository.js";

/**
 * 租户仓储适配器
 *
 * @description 基于MikroORM的租户仓储实现
 * @since 1.0.0
 */
@Injectable()
export class TenantRepositoryAdapter
  extends BaseRepositoryAdapter<Tenant, TenantId>
  implements TenantRepository
{
  constructor(entityManager: EntityManager) {
    super(entityManager, Tenant);
  }

  /**
   * 根据租户代码查找租户
   *
   * @param code - 租户代码
   * @returns 租户实体或null
   */
  async findByCode(code: string): Promise<Tenant | null> {
    return this.entityManager.findOne(this.entity, { code });
  }

  /**
   * 根据租户名称查找租户
   *
   * @param name - 租户名称
   * @returns 租户实体或null
   */
  async findByName(name: string): Promise<Tenant | null> {
    return this.entityManager.findOne(this.entity, { name });
  }

  /**
   * 检查租户代码是否存在
   *
   * @param code - 租户代码
   * @param excludeId - 排除的租户ID
   * @returns 是否存在
   */
  async existsByCode(code: string, excludeId?: TenantId): Promise<boolean> {
    const filter: FilterQuery<Tenant> = { code };
    if (excludeId) {
      filter.id = { $ne: excludeId };
    }
    const count = await this.entityManager.count(this.entity, filter);
    return count > 0;
  }

  /**
   * 检查租户名称是否存在
   *
   * @param name - 租户名称
   * @param excludeId - 排除的租户ID
   * @returns 是否存在
   */
  async existsByName(name: string, excludeId?: TenantId): Promise<boolean> {
    const filter: FilterQuery<Tenant> = { name };
    if (excludeId) {
      filter.id = { $ne: excludeId };
    }
    const count = await this.entityManager.count(this.entity, filter);
    return count > 0;
  }

  /**
   * 根据租户类型查找租户列表
   *
   * @param type - 租户类型
   * @param options - 查找选项
   * @returns 租户列表
   */
  async findByType(
    type: string,
    options?: FindOptions<Tenant>,
  ): Promise<Tenant[]> {
    return this.entityManager.find(this.entity, { type }, options);
  }

  /**
   * 根据租户状态查找租户列表
   *
   * @param status - 租户状态
   * @param options - 查找选项
   * @returns 租户列表
   */
  async findByStatus(
    status: string,
    options?: FindOptions<Tenant>,
  ): Promise<Tenant[]> {
    return this.entityManager.find(this.entity, { status }, options);
  }

  /**
   * 查找活跃的租户列表
   *
   * @param options - 查找选项
   * @returns 活跃租户列表
   */
  async findActive(options?: FindOptions<Tenant>): Promise<Tenant[]> {
    return this.findByStatus("ACTIVE", options);
  }

  /**
   * 查找待处理的租户列表
   *
   * @param options - 查找选项
   * @returns 待处理租户列表
   */
  async findPending(options?: FindOptions<Tenant>): Promise<Tenant[]> {
    return this.findByStatus("PENDING", options);
  }

  /**
   * 查找已暂停的租户列表
   *
   * @param options - 查找选项
   * @returns 已暂停租户列表
   */
  async findSuspended(options?: FindOptions<Tenant>): Promise<Tenant[]> {
    return this.findByStatus("SUSPENDED", options);
  }

  /**
   * 查找已过期的租户列表
   *
   * @param options - 查找选项
   * @returns 已过期租户列表
   */
  async findExpired(options?: FindOptions<Tenant>): Promise<Tenant[]> {
    return this.findByStatus("EXPIRED", options);
  }

  /**
   * 查找已取消的租户列表
   *
   * @param options - 查找选项
   * @returns 已取消租户列表
   */
  async findCancelled(options?: FindOptions<Tenant>): Promise<Tenant[]> {
    return this.findByStatus("CANCELLED", options);
  }

  /**
   * 统计租户数量
   *
   * @param filter - 过滤条件
   * @returns 租户数量
   */
  async countTenants(filter?: FilterQuery<Tenant>): Promise<number> {
    return this.entityManager.count(this.entity, filter);
  }

  /**
   * 统计活跃租户数量
   *
   * @returns 活跃租户数量
   */
  async countActiveTenants(): Promise<number> {
    return this.countTenants({ status: "ACTIVE" });
  }

  /**
   * 统计待处理租户数量
   *
   * @returns 待处理租户数量
   */
  async countPendingTenants(): Promise<number> {
    return this.countTenants({ status: "PENDING" });
  }

  /**
   * 统计已暂停租户数量
   *
   * @returns 已暂停租户数量
   */
  async countSuspendedTenants(): Promise<number> {
    return this.countTenants({ status: "SUSPENDED" });
  }

  /**
   * 统计已过期租户数量
   *
   * @returns 已过期租户数量
   */
  async countExpiredTenants(): Promise<number> {
    return this.countTenants({ status: "EXPIRED" });
  }

  /**
   * 统计已取消租户数量
   *
   * @returns 已取消租户数量
   */
  async countCancelledTenants(): Promise<number> {
    return this.countTenants({ status: "CANCELLED" });
  }

  /**
   * 根据订阅结束日期查找即将过期的租户
   *
   * @param days - 天数
   * @param options - 查找选项
   * @returns 即将过期的租户列表
   */
  async findExpiringSoon(
    days: number = 7,
    options?: FindOptions<Tenant>,
  ): Promise<Tenant[]> {
    const date = new Date();
    date.setDate(date.getDate() + days);

    return this.entityManager.find(
      this.entity,
      {
        subscriptionEndDate: { $lte: date },
        status: { $in: ["ACTIVE", "PENDING"] },
      },
      options,
    );
  }

  /**
   * 根据创建日期查找租户
   *
   * @param startDate - 开始日期
   * @param endDate - 结束日期
   * @param options - 查找选项
   * @returns 租户列表
   */
  async findByCreatedDateRange(
    startDate: Date,
    endDate: Date,
    options?: FindOptions<Tenant>,
  ): Promise<Tenant[]> {
    return this.entityManager.find(
      this.entity,
      {
        createdAt: { $gte: startDate, $lte: endDate },
      },
      options,
    );
  }
}
