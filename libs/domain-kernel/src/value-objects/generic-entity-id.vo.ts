import { EntityId } from "./entity-id.vo.js";
import { randomUUID } from "node:crypto";

export class GenericEntityId extends EntityId<"GenericEntityId"> {
	private static cache = new Map<string, GenericEntityId>();

	private constructor(value: string) {
		super(value, "GenericEntityId");
	}

	static create(value: string): GenericEntityId {
		let instance = this.cache.get(value);
		if (!instance) {
			instance = new GenericEntityId(value);
			this.cache.set(value, instance);
		}
		return instance;
	}

	static generate(): GenericEntityId {
		return this.create(randomUUID());
	}

	static clearCache(): void {
		this.cache.clear();
	}

	override equals(other?: GenericEntityId): boolean {
		return super.equals(other);
	}
}
