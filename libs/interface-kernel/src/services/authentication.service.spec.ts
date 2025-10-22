/**
 * @fileoverview Authentication Service 单元测试
 * @description 测试认证服务的所有功能
 */

import { Test, TestingModule } from "@nestjs/testing";
import { JwtModule, JwtService } from "@nestjs/jwt";
import {
  AuthenticationService,
  JwtAuthStrategy,
} from "./authentication.service";
import type { UserContext } from "../types/index.js";
import { IsolationLevel } from "../types/index";

describe("AuthenticationService", () => {
  let service: AuthenticationService;
  let jwtService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: "test-secret",
          signOptions: { expiresIn: "1h" },
        }),
      ],
      providers: [AuthenticationService, JwtAuthStrategy],
    }).compile();

    service = module.get<AuthenticationService>(AuthenticationService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("validateUser", () => {
    it("should validate user with correct credentials", async () => {
      const result = await service.validateUser("admin@hl8.com", "password");

      expect(result).toBeDefined();
      expect(result?.email).toBe("admin@hl8.com");
      expect(result?.name).toBe("Admin User");
      expect(result?.roles).toContain("admin");
      expect(result?.permissions).toContain("*");
    });

    it("should return null for invalid credentials", async () => {
      const result = await service.validateUser(
        "invalid@example.com",
        "wrongpassword",
      );

      expect(result).toBeNull();
    });

    it("should return null for empty credentials", async () => {
      const result = await service.validateUser("", "");

      expect(result).toBeNull();
    });

    it("should handle validation errors gracefully", async () => {
      const result = await service.validateUser(null as any, null as any);

      expect(result).toBeNull();
    });
  });

  describe("generateToken", () => {
    it("should generate valid JWT token", async () => {
      const user: UserContext = {
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
        roles: ["user"],
        permissions: ["read"],
        tenantId: "test-tenant",
        isolationLevel: IsolationLevel.USER,
      };

      const token = await service.generateToken(user);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".").length).toBe(3); // JWT has 3 parts
    });

    it("should generate token with correct payload", async () => {
      const user: UserContext = {
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
        roles: ["user"],
        permissions: ["read"],
        tenantId: "test-tenant",
        organizationId: "org-123",
        departmentId: "dept-123",
        isolationLevel: IsolationLevel.USER,
      };

      const token = await service.generateToken(user);
      const decoded = jwtService.decode(token);

      expect(decoded.sub).toBe("user-123");
      expect(decoded.email).toBe("test@example.com");
      expect(decoded.name).toBe("Test User");
      expect(decoded.roles).toEqual(["user"]);
      expect(decoded.permissions).toEqual(["read"]);
      expect(decoded.tenantId).toBe("test-tenant");
      expect(decoded.organizationId).toBe("org-123");
      expect(decoded.departmentId).toBe("dept-123");
      expect(decoded.isolationLevel).toBe("user");
    });

    it("should handle token generation errors", async () => {
      const invalidUser = null as any;

      await expect(service.generateToken(invalidUser)).rejects.toThrow(
        "Failed to generate token",
      );
    });
  });

  describe("verifyToken", () => {
    it("should verify valid token", async () => {
      const user: UserContext = {
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
        roles: ["user"],
        permissions: ["read"],
        tenantId: "test-tenant",
        isolationLevel: IsolationLevel.USER,
      };

      const token = await service.generateToken(user);
      const verifiedUser = await service.verifyToken(token);

      expect(verifiedUser).toBeDefined();
      expect(verifiedUser.id).toBe("user-123");
      expect(verifiedUser.email).toBe("test@example.com");
    });

    it("should throw error for invalid token", async () => {
      const invalidToken = "invalid.token.here";

      await expect(service.verifyToken(invalidToken)).rejects.toThrow(
        "Invalid token",
      );
    });

    it("should throw error for expired token", async () => {
      // Create a token with past expiration
      const expiredToken = jwtService.sign(
        { sub: "user-123", email: "test@example.com" },
        {
          secret: "default-secret",
          expiresIn: "-1h", // 设置为1小时前过期
        },
      );

      await expect(service.verifyToken(expiredToken)).rejects.toThrow(
        "Token has expired",
      );
    });

    it("should throw error for malformed token", async () => {
      const malformedToken = "not.a.valid.jwt";

      await expect(service.verifyToken(malformedToken)).rejects.toThrow(
        "Invalid token",
      );
    });
  });

  describe("refreshToken", () => {
    it("should refresh valid token", async () => {
      const user: UserContext = {
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
        roles: ["user"],
        permissions: ["read"],
        tenantId: "test-tenant",
        isolationLevel: IsolationLevel.USER,
      };

      const newToken = await service.refreshToken(user);

      expect(newToken).toBeDefined();
      expect(typeof newToken).toBe("string");
    });

    it("should handle refresh errors", async () => {
      const invalidUser = null as any;

      await expect(service.refreshToken(invalidUser)).rejects.toThrow(
        "Failed to refresh token",
      );
    });
  });

  describe("revokeToken", () => {
    it("should revoke token successfully", async () => {
      const token = "test-token";

      await expect(service.revokeToken(token)).resolves.not.toThrow();
    });

    it("should handle revocation errors gracefully", async () => {
      const invalidToken = null as any;

      await expect(service.revokeToken(invalidToken)).resolves.not.toThrow();
    });
  });

  describe("extractTokenFromRequest", () => {
    it("should extract token from Authorization header", () => {
      const request = {
        headers: {
          authorization: "Bearer test-token-123",
        },
      } as any;

      const token = service.extractTokenFromRequest(request);

      expect(token).toBe("test-token-123");
    });

    it("should return null for missing Authorization header", () => {
      const request = {
        headers: {},
      } as any;

      const token = service.extractTokenFromRequest(request);

      expect(token).toBeNull();
    });

    it("should return null for invalid Authorization format", () => {
      const request = {
        headers: {
          authorization: "Invalid test-token-123",
        },
      } as any;

      const token = service.extractTokenFromRequest(request);

      expect(token).toBeNull();
    });

    it("should return null for incomplete Authorization header", () => {
      const request = {
        headers: {
          authorization: "Bearer",
        },
      } as any;

      const token = service.extractTokenFromRequest(request);

      expect(token).toBeNull();
    });
  });

  describe("isTokenBlacklisted", () => {
    it("should return false for non-blacklisted token", async () => {
      const token = "test-token";

      const isBlacklisted = await service.isTokenBlacklisted(token);

      expect(isBlacklisted).toBe(false);
    });

    it("should handle blacklist check errors gracefully", async () => {
      const invalidToken = null as any;

      const isBlacklisted = await service.isTokenBlacklisted(invalidToken);

      expect(isBlacklisted).toBe(false);
    });
  });

  describe("getUserPermissions", () => {
    it("should return user permissions", async () => {
      const userId = "user-123";
      const permissions = await service.getUserPermissions(userId);

      expect(permissions).toBeDefined();
      expect(Array.isArray(permissions)).toBe(true);
      expect(permissions).toContain("read");
      expect(permissions).toContain("write");
      expect(permissions).toContain("delete");
    });

    it("should return empty array for invalid user", async () => {
      const userId = "invalid-user";
      const permissions = await service.getUserPermissions(userId);

      expect(permissions).toBeDefined();
      expect(Array.isArray(permissions)).toBe(true);
    });

    it("should handle permission retrieval errors", async () => {
      const userId = null as any;
      const permissions = await service.getUserPermissions(userId);

      expect(permissions).toBeDefined();
      expect(Array.isArray(permissions)).toBe(true);
    });
  });

  describe("getUserRoles", () => {
    it("should return user roles", async () => {
      const userId = "user-123";
      const roles = await service.getUserRoles(userId);

      expect(roles).toBeDefined();
      expect(Array.isArray(roles)).toBe(true);
      expect(roles).toContain("user");
    });

    it("should return empty array for invalid user", async () => {
      const userId = "invalid-user";
      const roles = await service.getUserRoles(userId);

      expect(roles).toBeDefined();
      expect(Array.isArray(roles)).toBe(true);
    });

    it("should handle role retrieval errors", async () => {
      const userId = null as any;
      const roles = await service.getUserRoles(userId);

      expect(roles).toBeDefined();
      expect(Array.isArray(roles)).toBe(true);
    });
  });
});

describe("JwtAuthStrategy", () => {
  let strategy: JwtAuthStrategy;
  let jwtService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: "test-secret",
          signOptions: { expiresIn: "1h" },
        }),
      ],
      providers: [JwtAuthStrategy],
    }).compile();

    strategy = module.get<JwtAuthStrategy>(JwtAuthStrategy);
    jwtService = module.get<JwtService>(JwtService);
  });

  it("should be defined", () => {
    expect(strategy).toBeDefined();
  });

  describe("validate", () => {
    it("should validate correct JWT payload", async () => {
      const payload = {
        sub: "user-123",
        email: "test@example.com",
        name: "Test User",
        roles: ["user"],
        permissions: ["read"],
        tenantId: "test-tenant",
        organizationId: "org-123",
        departmentId: "dept-123",
        isolationLevel: IsolationLevel.USER,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
        iss: "hl8-platform",
        aud: "hl8-users",
      };

      const result = await strategy.validate(payload);

      expect(result).toBeDefined();
      expect(result.id).toBe("user-123");
      expect(result.email).toBe("test@example.com");
      expect(result.name).toBe("Test User");
      expect(result.roles).toEqual(["user"]);
      expect(result.permissions).toEqual(["read"]);
      expect(result.tenantId).toBe("test-tenant");
      expect(result.organizationId).toBe("org-123");
      expect(result.departmentId).toBe("dept-123");
      expect(result.isolationLevel).toBe("user");
    });

    it("should throw error for invalid payload", async () => {
      const invalidPayload = {
        sub: null,
        email: null,
      };

      await expect(strategy.validate(invalidPayload)).rejects.toThrow(
        "Invalid token payload",
      );
    });

    it("should throw error for expired token", async () => {
      const expiredPayload = {
        sub: "user-123",
        email: "test@example.com",
        exp: Math.floor(Date.now() / 1000) - 3600,
        iss: "hl8-platform",
        aud: "hl8-users",
      };

      await expect(strategy.validate(expiredPayload)).rejects.toThrow(
        "Token has expired",
      );
    });

    it("should throw error for invalid issuer", async () => {
      const invalidIssuerPayload = {
        sub: "user-123",
        email: "test@example.com",
        iss: "invalid-issuer",
        aud: "hl8-users",
      };

      await expect(strategy.validate(invalidIssuerPayload)).rejects.toThrow(
        "Invalid token issuer",
      );
    });

    it("should throw error for invalid audience", async () => {
      const invalidAudiencePayload = {
        sub: "user-123",
        email: "test@example.com",
        iss: "hl8-platform",
        aud: "invalid-audience",
      };

      await expect(strategy.validate(invalidAudiencePayload)).rejects.toThrow(
        "Invalid token audience",
      );
    });
  });
});
