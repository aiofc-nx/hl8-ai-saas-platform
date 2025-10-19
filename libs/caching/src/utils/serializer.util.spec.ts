/**
 * 序列化工具单元测试
 *
 * @description 测试序列化工具的功能
 *
 * @group utils
 */

import {
  serialize,
  deserialize,
  isSerializable,
  getSerializedSize,
  isOversized,
} from "./serializer.util.js";
import { CacheSerializationError } from "../exceptions/cache.exceptions.js";

describe("Serializer Utils", () => {
  describe("serialize", () => {
    it("should serialize primitive values", () => {
      expect(serialize("string")).toBe('"string"');
      expect(serialize(123)).toBe("123");
      expect(serialize(true)).toBe("true");
      expect(serialize(null)).toBe("null");
      expect(serialize(undefined)).toBe("undefined");
    });

    it("should serialize objects", () => {
      const obj = { name: "John", age: 30 };
      const serialized = serialize(obj);
      expect(serialized).toBe('{"name":"John","age":30}');
    });

    it("should serialize arrays", () => {
      const arr = [1, 2, 3];
      const serialized = serialize(arr);
      expect(serialized).toBe("[1,2,3]");
    });

    it("should serialize Date objects", () => {
      const date = new Date("2023-01-01T00:00:00.000Z");
      const serialized = serialize(date);
      expect(serialized).toBe(
        '{"__type":"Date","value":"2023-01-01T00:00:00.000Z"}',
      );
    });

    it("should serialize RegExp objects", () => {
      const regex = /test/gi;
      const serialized = serialize(regex);
      expect(serialized).toBe('{"__type":"RegExp","value":"/test/gi"}');
    });

    it("should handle circular references", () => {
      const obj: any = { name: "John" };
      obj.self = obj;
      const serialized = serialize(obj);
      expect(serialized).toContain("[Circular]");
    });

    it("should handle non-serializable values gracefully", () => {
      const func = () => {};
      const serialized = serialize(func);
      expect(serialized).toBeUndefined(); // Functions are not serializable
    });
  });

  describe("deserialize", () => {
    it("should deserialize primitive values", () => {
      expect(deserialize('"string"')).toBe("string");
      expect(deserialize("123")).toBe(123);
      expect(deserialize("true")).toBe(true);
      expect(deserialize("null")).toBe(null);
      expect(deserialize("undefined")).toBe(undefined);
    });

    it("should deserialize objects", () => {
      const serialized = '{"name":"John","age":30}';
      const obj = deserialize(serialized);
      expect(obj).toEqual({ name: "John", age: 30 });
    });

    it("should deserialize arrays", () => {
      const serialized = "[1,2,3]";
      const arr = deserialize(serialized);
      expect(arr).toEqual([1, 2, 3]);
    });

    it("should deserialize Date objects", () => {
      const serialized = '{"__type":"Date","value":"2023-01-01T00:00:00.000Z"}';
      const date = deserialize(serialized);
      expect(date).toBeInstanceOf(Date);
      expect(date.toISOString()).toBe("2023-01-01T00:00:00.000Z");
    });

    it("should deserialize RegExp objects", () => {
      const serialized = '{"__type":"RegExp","value":"/test/gi"}';
      const regex = deserialize(serialized);
      expect(regex).toBeInstanceOf(RegExp);
      expect(regex.toString()).toBe("/test/gi");
    });

    it("should throw error for invalid JSON", () => {
      expect(() => deserialize("invalid json")).toThrow(
        CacheSerializationError,
      );
    });
  });

  describe("isSerializable", () => {
    it("should return true for serializable values", () => {
      expect(isSerializable("string")).toBe(true);
      expect(isSerializable(123)).toBe(true);
      expect(isSerializable(true)).toBe(true);
      expect(isSerializable(null)).toBe(true);
      expect(isSerializable(undefined)).toBe(true);
      expect(isSerializable({ name: "John" })).toBe(true);
      expect(isSerializable([1, 2, 3])).toBe(true);
    });

    it("should return false for non-serializable values", () => {
      expect(isSerializable(() => {})).toBe(false);
      expect(isSerializable(Symbol("test"))).toBe(false);
    });
  });

  describe("getSerializedSize", () => {
    it("should return correct size for strings", () => {
      const size = getSerializedSize("hello");
      expect(size).toBe(7); // "hello" = 7 bytes
    });

    it("should return correct size for objects", () => {
      const obj = { name: "John", age: 30 };
      const size = getSerializedSize(obj);
      expect(size).toBeGreaterThan(0);
    });

    it("should return 0 for non-serializable values", () => {
      const size = getSerializedSize(() => {});
      expect(size).toBe(0);
    });
  });

  describe("isOversized", () => {
    it("should return false for small values", () => {
      expect(isOversized("small string")).toBe(false);
      expect(isOversized({ name: "John" })).toBe(false);
    });

    it("should return true for large values", () => {
      const largeString = "a".repeat(1024 * 1024 + 1); // 1MB + 1 byte
      expect(isOversized(largeString)).toBe(true);
    });

    it("should use custom size limit", () => {
      const mediumString = "a".repeat(1000);
      expect(isOversized(mediumString, 500)).toBe(true);
      expect(isOversized(mediumString, 2000)).toBe(false);
    });
  });
});
