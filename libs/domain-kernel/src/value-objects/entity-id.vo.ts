/**
 * 实体 ID 值对象基类
 *
 * @description 所有实体 ID 的基础值对象，使用 UUID v4 格式
 *
 * @since 0.1.0
 */

import { IsolationValidationError } from "../errors/isolation-validation.error.js";

/** UUID v4 正则表达式 */
const UUID_V4_REGEX =
	/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * 实体 ID 基类（抽象）
 * @template TType - 类型标识（用于类型安全）
 */
export abstract class EntityId<TType extends string = string> {
	/**
	 * 保护的构造函数 - 子类通过静态工厂方法创建
	 * @param value - UUID v4 字符串
	 * @param typeName - 类型名称（用于错误消息）
	 */
	protected constructor(
		private readonly value: string,
		private readonly typeName: string,
	) {
		this.validate();
	}

	/** 验证 UUID v4 格式 */
	private validate(): void {
		if (!this.value || typeof this.value !== "string") {
			throw new IsolationValidationError(
				`${this.typeName} 必须是非空字符串`,
				`INVALID_${this.typeName.toUpperCase()}`,
				{ value: this.value },
			);
		}

		if (!UUID_V4_REGEX.test(this.value)) {
			throw new IsolationValidationError(
				`${this.typeName} 必须是有效的 UUID v4 格式`,
				`INVALID_${this.typeName.toUpperCase()}_FORMAT`,
				{ value: this.value },
			);
		}
	}

	/** 获取 ID 值 */
	getValue(): string {
		return this.value;
	}

	/** 值对象相等性比较 */
	equals(other?: EntityId<TType>): boolean {
		if (!other) return false;
		return this.value === other.value;
	}

	/** 字符串表示 */
	toString(): string {
		return this.value;
	}

	/** 获取哈希码 */
	getHashCode(): string {
		return this.value;
	}

	/** 比较方法 */
	compareTo(other?: EntityId<TType>): number {
		if (!other) return 1;
		return this.value.localeCompare(other.value);
	}

	/** 检查是否为空 */
	isEmpty(): boolean {
		return !this.value || this.value.trim().length === 0;
	}
}
