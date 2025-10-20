/**
 * 租户 ID 值对象
 * @description 封装租户标识符，使用 UUID v4 格式
 */
import { EntityId } from "./entity-id.vo.js";
import { randomUUID } from "node:crypto";

export class TenantId extends EntityId<"TenantId"> {
	private static cache = new Map<string, TenantId>();

	private constructor(value: string) {
		super(value, "TenantId");
	}

	static create(value: string): TenantId {
		let instance = this.cache.get(value);
		if (!instance) {
			instance = new TenantId(value);
			this.cache.set(value, instance);
		}
		return instance;
	}

	static generate(): TenantId {
		return this.create(randomUUID());
	}

	static clearCache(): void {
		this.cache.clear();
	}

	override equals(other?: TenantId): boolean {
		return super.equals(other);
	}
}
