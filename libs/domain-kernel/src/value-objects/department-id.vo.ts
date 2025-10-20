import { EntityId } from "./entity-id.vo.js";
import { randomUUID } from "node:crypto";

export class DepartmentId extends EntityId<"DepartmentId"> {
	private static cache = new Map<string, DepartmentId>();

	private constructor(value: string) {
		super(value, "DepartmentId");
	}

	static create(value: string): DepartmentId {
		let instance = this.cache.get(value);
		if (!instance) {
			instance = new DepartmentId(value);
			this.cache.set(value, instance);
		}
		return instance;
	}

	static generate(): DepartmentId {
		return this.create(randomUUID());
	}

	static clearCache(): void {
		this.cache.clear();
	}

	override equals(other?: DepartmentId): boolean {
		return super.equals(other);
	}
}
