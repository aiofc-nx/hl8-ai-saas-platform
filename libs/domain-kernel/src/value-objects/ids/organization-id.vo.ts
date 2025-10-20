import { EntityId } from "./entity-id.vo.js";
import { randomUUID } from "node:crypto";

export class OrganizationId extends EntityId<"OrganizationId"> {
  private static cache = new Map<string, OrganizationId>();

  private constructor(value: string) {
    super(value, "OrganizationId");
  }

  static create(value: string): OrganizationId {
    let instance = this.cache.get(value);
    if (!instance) {
      instance = new OrganizationId(value);
      this.cache.set(value, instance);
    }
    return instance;
  }

  static generate(): OrganizationId {
    return this.create(randomUUID());
  }

  static clearCache(): void {
    this.cache.clear();
  }

  override equals(other?: OrganizationId): boolean {
    return super.equals(other);
  }
}
