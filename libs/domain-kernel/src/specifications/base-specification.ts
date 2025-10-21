/**
 * 基础规格抽象类
 * @description 提供规格模式的基础实现，包含通用的规格操作
 *
 * ## 规格模式原则
 * - 单一职责：每个规格只负责一个业务规则
 * - 可组合性：规格可以组合成复杂的业务规则
 * - 可重用性：规格可以在不同的上下文中重用
 * - 可测试性：规格可以独立测试
 *
 * @since 1.0.0
 */

import {
  ISpecification,
  SpecificationResult,
  SpecificationMetadata,
} from "./specification.interface.js";

/**
 * 基础规格抽象类
 * @template T 规格适用的类型
 */
export abstract class BaseSpecification<T> implements ISpecification<T> {
  protected metadata: SpecificationMetadata;

  constructor(metadata: Partial<SpecificationMetadata> = {}) {
    this.metadata = {
      name: this.constructor.name,
      description: "基础规格",
      version: "1.0.0",
      category: "default",
      tags: [],
      priority: 0,
      enabled: true,
      ...metadata,
    };
  }

  /**
   * 检查候选对象是否满足规格
   * @param candidate - 候选对象
   * @returns 是否满足规格
   */
  abstract isSatisfiedBy(candidate: T): boolean;

  /**
   * 与操作
   * @param specification - 另一个规格
   * @returns 与规格
   */
  and(specification: ISpecification<T>): ISpecification<T> {
    return new AndSpecification(this, specification);
  }

  /**
   * 或操作
   * @param specification - 另一个规格
   * @returns 或规格
   */
  or(specification: ISpecification<T>): ISpecification<T> {
    return new OrSpecification(this, specification);
  }

  /**
   * 非操作
   * @returns 非规格
   */
  not(): ISpecification<T> {
    return new NotSpecification(this);
  }

  /**
   * 获取规格描述
   * @returns 规格描述
   */
  getDescription(): string {
    return this.metadata.description;
  }

  /**
   * 获取规格名称
   * @returns 规格名称
   */
  getName(): string {
    return this.metadata.name;
  }

  /**
   * 获取规格元数据
   * @returns 规格元数据
   */
  getMetadata(): SpecificationMetadata {
    return { ...this.metadata };
  }

  /**
   * 检查规格是否启用
   * @returns 是否启用
   */
  isEnabled(): boolean {
    return this.metadata.enabled;
  }

  /**
   * 启用规格
   */
  enable(): void {
    this.metadata.enabled = true;
  }

  /**
   * 禁用规格
   */
  disable(): void {
    this.metadata.enabled = false;
  }

  /**
   * 设置规格优先级
   * @param priority - 优先级
   */
  setPriority(priority: number): void {
    this.metadata.priority = priority;
  }

  /**
   * 添加规格标签
   * @param tag - 标签
   */
  addTag(tag: string): void {
    if (!this.metadata.tags.includes(tag)) {
      this.metadata.tags.push(tag);
    }
  }

  /**
   * 移除规格标签
   * @param tag - 标签
   */
  removeTag(tag: string): void {
    const index = this.metadata.tags.indexOf(tag);
    if (index > -1) {
      this.metadata.tags.splice(index, 1);
    }
  }

  /**
   * 检查规格结果
   * @param candidate - 候选对象
   * @returns 规格结果
   */
  check(candidate: T): SpecificationResult {
    const isSatisfied = this.isSatisfiedBy(candidate);

    return {
      isSatisfied,
      errorMessage: isSatisfied ? undefined : this.getErrorMessage(candidate),
      context: this.getContext(candidate),
      specificationName: this.getName(),
      specificationDescription: this.getDescription(),
    };
  }

  /**
   * 获取错误消息
   * @param candidate - 候选对象
   * @returns 错误消息
   */
  protected getErrorMessage(_candidate: T): string {
    return `${this.getName()} 规格不满足`;
  }

  /**
   * 获取上下文信息
   * @param candidate - 候选对象
   * @returns 上下文信息
   */
  protected getContext(candidate: T): Record<string, unknown> {
    return {
      candidate: candidate,
      specification: this.getName(),
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * 与规格
 * @template T 规格适用的类型
 */
export class AndSpecification<T> extends BaseSpecification<T> {
  constructor(
    private left: ISpecification<T>,
    private right: ISpecification<T>,
  ) {
    super({
      name: "AndSpecification",
      description: `(${left.getName()} AND ${right.getName()})`,
      category: "composite",
      tags: ["and", "composite"],
    });
  }

  isSatisfiedBy(candidate: T): boolean {
    return (
      this.left.isSatisfiedBy(candidate) && this.right.isSatisfiedBy(candidate)
    );
  }

  protected getErrorMessage(candidate: T): string {
    const leftSatisfied = this.left.isSatisfiedBy(candidate);
    const rightSatisfied = this.right.isSatisfiedBy(candidate);

    const errors: string[] = [];
    if (!leftSatisfied) {
      errors.push(`${this.left.getName()} 不满足`);
    }
    if (!rightSatisfied) {
      errors.push(`${this.right.getName()} 不满足`);
    }

    return errors.join("; ");
  }
}

/**
 * 或规格
 * @template T 规格适用的类型
 */
export class OrSpecification<T> extends BaseSpecification<T> {
  constructor(
    private left: ISpecification<T>,
    private right: ISpecification<T>,
  ) {
    super({
      name: "OrSpecification",
      description: `(${left.getName()} OR ${right.getName()})`,
      category: "composite",
      tags: ["or", "composite"],
    });
  }

  isSatisfiedBy(candidate: T): boolean {
    return (
      this.left.isSatisfiedBy(candidate) || this.right.isSatisfiedBy(candidate)
    );
  }

  protected getErrorMessage(_candidate: T): string {
    return `(${this.left.getName()} OR ${this.right.getName()}) 都不满足`;
  }
}

/**
 * 非规格
 * @template T 规格适用的类型
 */
export class NotSpecification<T> extends BaseSpecification<T> {
  constructor(private specification: ISpecification<T>) {
    super({
      name: "NotSpecification",
      description: `NOT ${specification.getName()}`,
      category: "composite",
      tags: ["not", "composite"],
    });
  }

  isSatisfiedBy(candidate: T): boolean {
    return !this.specification.isSatisfiedBy(candidate);
  }

  protected getErrorMessage(_candidate: T): string {
    return `NOT ${this.specification.getName()} 不满足`;
  }
}
