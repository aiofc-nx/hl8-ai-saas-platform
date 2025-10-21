/**
 * 规格模式接口
 * @description 定义规格模式的基础接口，用于表达业务规则和约束
 *
 * ## 规格模式原则
 * - 单一职责：每个规格只负责一个业务规则
 * - 可组合性：规格可以组合成复杂的业务规则
 * - 可重用性：规格可以在不同的上下文中重用
 * - 可测试性：规格可以独立测试
 *
 * @since 1.0.0
 */

/**
 * 规格接口
 * @template T 规格适用的类型
 */
export interface ISpecification<T> {
  /**
   * 检查候选对象是否满足规格
   * @param candidate - 候选对象
   * @returns 是否满足规格
   */
  isSatisfiedBy(candidate: T): boolean;

  /**
   * 与操作
   * @param specification - 另一个规格
   * @returns 与规格
   */
  and(specification: ISpecification<T>): ISpecification<T>;

  /**
   * 或操作
   * @param specification - 另一个规格
   * @returns 或规格
   */
  or(specification: ISpecification<T>): ISpecification<T>;

  /**
   * 非操作
   * @returns 非规格
   */
  not(): ISpecification<T>;

  /**
   * 获取规格描述
   * @returns 规格描述
   */
  getDescription(): string;

  /**
   * 获取规格名称
   * @returns 规格名称
   */
  getName(): string;
}

/**
 * 异步规格接口
 * @template T 规格适用的类型
 */
export interface IAsyncSpecification<T> extends ISpecification<T> {
  /**
   * 异步检查候选对象是否满足规格
   * @param candidate - 候选对象
   * @returns 是否满足规格的Promise
   */
  isSatisfiedByAsync(candidate: T): Promise<boolean>;

  /**
   * 异步与操作
   * @param specification - 另一个规格
   * @returns 异步与规格
   */
  andAsync(specification: IAsyncSpecification<T>): IAsyncSpecification<T>;

  /**
   * 异步或操作
   * @param specification - 另一个规格
   * @returns 异步或规格
   */
  orAsync(specification: IAsyncSpecification<T>): IAsyncSpecification<T>;

  /**
   * 异步非操作
   * @returns 异步非规格
   */
  notAsync(): IAsyncSpecification<T>;
}

/**
 * 规格结果
 */
export interface SpecificationResult {
  /**
   * 是否满足规格
   */
  isSatisfied: boolean;

  /**
   * 错误消息
   */
  errorMessage?: string;

  /**
   * 上下文信息
   */
  context?: Record<string, unknown>;

  /**
   * 规格名称
   */
  specificationName: string;

  /**
   * 规格描述
   */
  specificationDescription: string;
}

/**
 * 规格元数据
 */
export interface SpecificationMetadata {
  /**
   * 规格名称
   */
  name: string;

  /**
   * 规格描述
   */
  description: string;

  /**
   * 规格版本
   */
  version: string;

  /**
   * 规格分类
   */
  category: string;

  /**
   * 规格标签
   */
  tags: string[];

  /**
   * 规格优先级
   */
  priority: number;

  /**
   * 规格是否启用
   */
  enabled: boolean;
}
