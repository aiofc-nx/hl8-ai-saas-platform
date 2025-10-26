import { EntityId } from "./entity-id.vo.js";
import { randomUUID } from "node:crypto";

export class RoleId extends EntityId<"RoleId"> {
  private static cache = new Map<string, RoleId>();

  private constructor(value: string) {
    super(value, "RoleId");
  }

  static create(value: string): RoleId {
    let instance = this.cache.get(value);
    if (!instance) {
      instance = new RoleId(value);
      this.cache.set(value, instance);
    }
    return instance;
  }

  static generate(): RoleId {
    return this.create(randomUUID());
  }

  static clearCache(): void {
    this.cache.clear();
  }

  override equals(other?: RoleId): boolean {
    return super.equals(other);
  }
}
