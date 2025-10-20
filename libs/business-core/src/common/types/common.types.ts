/**
 * 通用基础类型定义
 *
 * @description 定义通用的基础类型和接口
 * @since 1.0.0
 */

/**
 * 分页结果接口
 */
export interface IPaginatedResult<T> {
  /** 数据列表 */
  data: T[];
  /** 总数量 */
  total: number;
  /** 当前页码 */
  page: number;
  /** 每页大小 */
  pageSize: number;
  /** 总页数 */
  totalPages: number;
  /** 是否有下一页 */
  hasNext: boolean;
  /** 是否有上一页 */
  hasPrevious: boolean;
}

/**
 * 分页查询参数接口
 */
export interface IPaginationParams {
  /** 页码 */
  page?: number;
  /** 每页大小 */
  pageSize?: number;
  /** 排序字段 */
  sortBy?: string;
  /** 排序方向 */
  sortOrder?: "ASC" | "DESC";
}

/**
 * 查询选项接口
 */
export interface IQueryOptions {
  /** 分页参数 */
  pagination?: IPaginationParams;
  /** 过滤条件 */
  filters?: Record<string, unknown>;
  /** 包含的关联数据 */
  includes?: string[];
  /** 排除的字段 */
  excludes?: string[];
}

/**
 * 审计信息接口
 */
export interface IAuditInfo {
  /** 创建者ID */
  createdBy: string;
  /** 创建时间 */
  createdAt: Date;
  /** 更新者ID */
  updatedBy?: string;
  /** 更新时间 */
  updatedAt?: Date;
  /** 版本号 */
  version: number;
}

/**
 * 部分审计信息接口
 */
export interface IPartialAuditInfo {
  /** 创建者ID */
  createdBy: string;
  /** 更新者ID */
  updatedBy?: string;
  /** 版本号 */
  version?: number;
}

/**
 * 审计信息构建器
 */
export class AuditInfoBuilder {
  private _createdBy: string;
  private _createdAt: Date;
  private _updatedBy?: string;
  private _updatedAt?: Date;
  private _version: number;

  constructor(createdBy: string, version: number = 1) {
    this._createdBy = createdBy;
    this._createdAt = new Date();
    this._version = version;
  }

  /**
   * 设置更新者
   */
  setUpdatedBy(updatedBy: string): AuditInfoBuilder {
    this._updatedBy = updatedBy;
    this._updatedAt = new Date();
    return this;
  }

  /**
   * 设置版本号
   */
  setVersion(version: number): AuditInfoBuilder {
    this._version = version;
    return this;
  }

  /**
   * 构建审计信息
   */
  build(): IAuditInfo {
    return {
      createdBy: this._createdBy,
      createdAt: this._createdAt,
      updatedBy: this._updatedBy,
      updatedAt: this._updatedAt,
      version: this._version,
    };
  }
}

/**
 * 验证结果接口
 */
export interface IValidationResult {
  /** 是否有效 */
  isValid: boolean;
  /** 错误信息列表 */
  errors: string[];
  /** 警告信息列表 */
  warnings: string[];
}

/**
 * 业务规则接口
 */
export interface IBusinessRule<T> {
  /** 规则名称 */
  name: string;
  /** 规则描述 */
  description: string;
  /** 检查规则是否满足 */
  isSatisfied(entity: T): boolean;
  /** 获取错误信息 */
  getErrorMessage(): string;
}

/**
 * 业务规则管理器接口
 */
export interface IBusinessRuleManager<T> {
  /**
   * 添加业务规则
   */
  addRule(rule: IBusinessRule<T>): void;
  /**
   * 移除业务规则
   */
  removeRule(ruleName: string): void;
  /**
   * 检查所有规则
   */
  checkAllRules(entity: T): IValidationResult;
  /**
   * 检查特定规则
   */
  checkRule(ruleName: string, entity: T): boolean;
}

/**
 * 规格模式接口
 */
export interface ISpecification<T> {
  /** 规格名称 */
  name: string;
  /** 检查是否满足规格 */
  isSatisfiedBy(entity: T): boolean;
  /** 与另一个规格进行AND操作 */
  and(specification: ISpecification<T>): ISpecification<T>;
  /** 与另一个规格进行OR操作 */
  or(specification: ISpecification<T>): ISpecification<T>;
  /** 对规格进行NOT操作 */
  not(): ISpecification<T>;
}

/**
 * 领域服务接口
 */
export interface IDomainService {
  /** 服务名称 */
  name: string;
  /** 服务描述 */
  description: string;
}
