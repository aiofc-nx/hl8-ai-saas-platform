/**
 * 键生成工具单元测试
 *
 * @description 测试键生成工具的功能
 *
 * @group utils
 */

import { TenantId, IsolationContext } from "@hl8/domain-kernel";
import {
  generateCacheKey,
  generateCachePattern,
  isValidKey,
  sanitizeKey,
} from "./key-generator.util.js";
import { CacheKeyValidationError } from "../exceptions/cache.exceptions.js";

describe("Key Generator Utils", () => {
  describe("generateCacheKey", () => {
    it("should generate platform-level key when no context", () => {
      const key = generateCacheKey("user", "123");
      expect(key).toBe("platform:user:123");
    });

    it("should generate platform-level key with prefix", () => {
      const key = generateCacheKey("user", "123", undefined, "hl8:cache:");
      expect(key).toBe("hl8:cache:platform:user:123");
    });

    it("should generate tenant-level key when tenant context provided", () => {
      const tenantId = TenantId.create("550e8400-e29b-41d4-a716-446655440000");
      const context = IsolationContext.tenant(tenantId);
      const key = generateCacheKey("user", "123", context);
      expect(key).toBe(`cache:tenant:${tenantId.toString()}:user:123`);
    });

    it("should throw error for invalid namespace", () => {
      expect(() => generateCacheKey("", "123")).toThrow(
        CacheKeyValidationError,
      );
      expect(() => generateCacheKey("a".repeat(65), "123")).toThrow(
        CacheKeyValidationError,
      );
    });

    it("should throw error for invalid key", () => {
      expect(() => generateCacheKey("user", "")).toThrow(
        CacheKeyValidationError,
      );
      expect(() => generateCacheKey("user", "a".repeat(129))).toThrow(
        CacheKeyValidationError,
      );
    });

    it("should throw error for invalid characters", () => {
      expect(() => generateCacheKey("user@", "123")).toThrow(
        CacheKeyValidationError,
      );
      expect(() => generateCacheKey("user", "123#")).toThrow(
        CacheKeyValidationError,
      );
    });
  });

  describe("generateCachePattern", () => {
    it("should generate platform-level pattern when no context", () => {
      const pattern = generateCachePattern("user", "all");
      expect(pattern).toBe("platform:user:all");
    });

    it("should generate platform-level pattern with prefix", () => {
      const pattern = generateCachePattern(
        "user",
        "all",
        undefined,
        "hl8:cache:",
      );
      expect(pattern).toBe("hl8:cache:platform:user:all");
    });

    it("should generate tenant-level pattern when tenant context provided", () => {
      const tenantId = TenantId.create("550e8400-e29b-41d4-a716-446655440000");
      const context = IsolationContext.tenant(tenantId);
      const pattern = generateCachePattern("user", "all", context);
      expect(pattern).toBe(`cache:tenant:${tenantId.toString()}:user:all`);
    });
  });

  describe("isValidKey", () => {
    it("should return true for valid keys", () => {
      expect(isValidKey("user:123")).toBe(true);
      expect(isValidKey("user_profile")).toBe(true);
      expect(isValidKey("user-profile")).toBe(true);
      expect(isValidKey("user_123:profile")).toBe(true);
    });

    it("should return false for invalid keys", () => {
      expect(isValidKey("")).toBe(false);
      expect(isValidKey("user@123")).toBe(false);
      expect(isValidKey("user#123")).toBe(false);
      expect(isValidKey("user 123")).toBe(false);
      expect(isValidKey("a".repeat(257))).toBe(false);
    });
  });

  describe("sanitizeKey", () => {
    it("should sanitize invalid characters", () => {
      expect(sanitizeKey("user@123")).toBe("user_123");
      expect(sanitizeKey("user#profile")).toBe("user_profile");
      expect(sanitizeKey("user profile")).toBe("user_profile");
      expect(sanitizeKey("user@profile#123")).toBe("user_profile_123");
    });

    it("should preserve valid characters", () => {
      expect(sanitizeKey("user:123")).toBe("user:123");
      expect(sanitizeKey("user_profile")).toBe("user_profile");
      expect(sanitizeKey("user-profile")).toBe("user-profile");
    });

    it("should handle empty or invalid input", () => {
      expect(sanitizeKey("")).toBe("");
      expect(sanitizeKey(null as any)).toBe("");
      expect(sanitizeKey(undefined as any)).toBe("");
    });
  });
});
