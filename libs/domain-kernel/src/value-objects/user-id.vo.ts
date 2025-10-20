import { EntityId } from "./entity-id.vo.js";
import { randomUUID } from "node:crypto";

export class UserId extends EntityId<"UserId"> {
  private static cache = new Map<string, UserId>();

  private constructor(value: string) {
    super(value, "UserId");
  }

  static create(value: string): UserId {
    let instance = this.cache.get(value);
    if (!instance) {
      instance = new UserId(value);
      this.cache.set(value, instance);
    }
    return instance;
  }

  static generate(): UserId {
    return this.create(randomUUID());
  }

  static clearCache(): void {
    this.cache.clear();
  }

  override equals(other?: UserId): boolean {
    return super.equals(other);
  }
}
