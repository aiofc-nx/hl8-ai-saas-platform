import { EntityId } from "./entity-id.vo.js";
import { IsolationValidationError } from "../../isolation/isolation-validation.error.js";

// 测试用的具体实现
class TestEntityId extends EntityId<"TestEntityId"> {
  constructor(value: string) {
    super(value, "TestEntityId");
  }
}

describe("EntityId", () => {
  describe("validation", () => {
    it("should throw for empty string", () => {
      expect(() => new TestEntityId("")).toThrow(IsolationValidationError);
    });

    it("should throw for invalid UUID format", () => {
      expect(() => new TestEntityId("invalid-uuid")).toThrow(
        IsolationValidationError,
      );
    });

    it("should accept valid UUID v4", () => {
      const validUuid = "550e8400-e29b-41d4-a716-446655440000";
      expect(() => new TestEntityId(validUuid)).not.toThrow();
    });
  });

  describe("equality", () => {
    it("should be equal for same value", () => {
      const id1 = new TestEntityId("550e8400-e29b-41d4-a716-446655440000");
      const id2 = new TestEntityId("550e8400-e29b-41d4-a716-446655440000");
      expect(id1.equals(id2)).toBe(true);
    });

    it("should not be equal for different values", () => {
      const id1 = new TestEntityId("550e8400-e29b-41d4-a716-446655440000");
      const id2 = new TestEntityId("550e8400-e29b-41d4-a716-446655440001");
      expect(id1.equals(id2)).toBe(false);
    });
  });

  describe("serialization", () => {
    it("should return value via getValue()", () => {
      const value = "550e8400-e29b-41d4-a716-446655440000";
      const id = new TestEntityId(value);
      expect(id.getValue()).toBe(value);
    });

    it("should return value via toString()", () => {
      const value = "550e8400-e29b-41d4-a716-446655440000";
      const id = new TestEntityId(value);
      expect(id.toString()).toBe(value);
    });
  });
});
