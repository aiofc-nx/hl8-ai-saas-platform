import { TenantId } from "./tenant-id.vo.js";
import { IsolationValidationError } from "../errors/isolation-validation.error.js";

describe("TenantId", () => {
  beforeEach(() => {
    TenantId.clearCache();
  });

  describe("create", () => {
    it("should create with valid UUID", () => {
      const value = "550e8400-e29b-41d4-a716-446655440000";
      const id = TenantId.create(value);
      expect(id.getValue()).toBe(value);
    });

    it("should throw for invalid UUID", () => {
      expect(() => TenantId.create("invalid")).toThrow(
        IsolationValidationError,
      );
    });

    it("should use flyweight pattern", () => {
      const value = "550e8400-e29b-41d4-a716-446655440000";
      const id1 = TenantId.create(value);
      const id2 = TenantId.create(value);
      expect(id1).toBe(id2);
    });
  });

  describe("generate", () => {
    it("should generate valid UUID", () => {
      const id = TenantId.generate();
      expect(id.getValue()).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
    });

    it("should generate different UUIDs", () => {
      const id1 = TenantId.generate();
      const id2 = TenantId.generate();
      expect(id1.getValue()).not.toBe(id2.getValue());
    });
  });

  describe("equality", () => {
    it("should be equal for same value", () => {
      const value = "550e8400-e29b-41d4-a716-446655440000";
      const id1 = TenantId.create(value);
      const id2 = TenantId.create(value);
      expect(id1.equals(id2)).toBe(true);
    });
  });
});
