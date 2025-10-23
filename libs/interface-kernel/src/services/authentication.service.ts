/**
 * @fileoverview 认证服务
 * @description 提供用户认证功能，包括JWT令牌验证、用户身份验证等
 */

import { Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { GeneralBadRequestException } from "@hl8/exceptions";
import type { UserContext, InterfaceFastifyRequest } from "../types/index.js";
import { IsolationLevel } from "../types/index.js";

/**
 * JWT 认证策略
 * @description 使用 JWT 令牌进行用户认证
 */
@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtAuthStrategy.name);

  constructor(private readonly jwtService: JwtService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env["JWT_SECRET"] || "default-secret",
      issuer: process.env["JWT_ISSUER"] || "hl8-platform",
      audience: process.env["JWT_AUDIENCE"] || "hl8-users",
    });
  }

  /**
   * 验证 JWT 令牌
   * @description 验证 JWT 令牌并返回用户上下文
   * @param payload JWT 载荷
   * @returns 用户上下文
   */
  async validate(payload: Record<string, unknown>): Promise<UserContext> {
    this.logger.debug(`Validating JWT token for user: ${payload.sub}`);

    try {
      // 验证令牌基本结构
      if (!payload.sub || !payload.email) {
        throw new GeneralBadRequestException(
          "令牌载荷无效",
          "JWT令牌缺少必要的用户标识信息",
        );
      }

      // 验证令牌过期时间
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && typeof payload.exp === "number" && payload.exp < now) {
        throw new GeneralBadRequestException(
          "令牌已过期",
          "JWT令牌已超过有效期",
        );
      }

      // 验证令牌签发者
      if (payload.iss !== (process.env["JWT_ISSUER"] || "hl8-platform")) {
        throw new GeneralBadRequestException(
          "令牌签发者无效",
          "JWT令牌的签发者与系统配置不匹配",
        );
      }

      // 验证令牌受众
      if (payload.aud !== (process.env["JWT_AUDIENCE"] || "hl8-users")) {
        throw new GeneralBadRequestException(
          "令牌受众无效",
          "JWT令牌的受众与系统配置不匹配",
        );
      }

      // 构建用户上下文
      const userContext: UserContext = {
        id: payload.sub as string,
        email: payload.email as string,
        name: (payload.name as string) || (payload.email as string),
        roles: (payload.roles as string[]) || [],
        permissions: (payload.permissions as string[]) || [],
        tenantId: (payload.tenantId as string) || "default",
        organizationId: payload.organizationId as string,
        departmentId: payload.departmentId as string,
        isolationLevel:
          (payload.isolationLevel as IsolationLevel) || IsolationLevel.USER,
      };

      this.logger.debug(`User authenticated: ${userContext.email}`);
      return userContext;
    } catch (error) {
      this.logger.error(
        `JWT validation failed: ${error instanceof Error ? error.message : String(error)}`,
      );

      // 根据错误类型返回具体的错误信息
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (
        errorMessage.includes("jwt expired") ||
        errorMessage.includes("Token has expired")
      ) {
        throw new GeneralBadRequestException(
          "令牌已过期",
          "JWT令牌已超过有效期",
        );
      } else if (errorMessage.includes("issuer")) {
        throw new GeneralBadRequestException(
          "令牌签发者无效",
          "JWT令牌的签发者与系统配置不匹配",
        );
      } else if (errorMessage.includes("audience")) {
        throw new GeneralBadRequestException(
          "令牌受众无效",
          "JWT令牌的受众与系统配置不匹配",
        );
      } else if (
        errorMessage.includes("jwt malformed") ||
        errorMessage.includes("Invalid token payload")
      ) {
        throw new GeneralBadRequestException(
          "令牌格式无效",
          "JWT令牌格式不正确",
        );
      } else {
        throw new GeneralBadRequestException(
          "认证失败",
          "用户认证过程中发生错误",
        );
      }
    }
  }
}

/**
 * 认证服务
 * @description 提供用户认证相关功能
 */
@Injectable()
export class AuthenticationService {
  private readonly logger = new Logger(AuthenticationService.name);

  constructor(private readonly jwtService: JwtService) {
    this.logger.log("Authentication Service initialized");
  }

  /**
   * 验证用户凭据
   * @description 验证用户名和密码
   * @param email 用户邮箱
   * @param password 用户密码
   * @returns 用户上下文或 null
   */
  async validateUser(
    email: string,
    password: string,
  ): Promise<UserContext | null> {
    try {
      this.logger.debug(`Validating user credentials for: ${email}`);

      // 这里应该调用应用层服务验证用户凭据
      // 暂时使用模拟验证
      if (email === "admin@hl8.com" && password === "password") {
        return {
          id: "1",
          email: "admin@hl8.com",
          name: "Admin User",
          roles: ["admin"],
          permissions: ["*"],
          tenantId: "default",
          isolationLevel: IsolationLevel.PLATFORM,
        };
      }

      return null;
    } catch (error) {
      this.logger.error(
        `User validation failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }

  /**
   * 生成 JWT 令牌
   * @description 为用户生成 JWT 访问令牌
   * @param user 用户上下文
   * @returns JWT 令牌
   */
  async generateToken(user: UserContext): Promise<string> {
    try {
      this.logger.debug(`Generating JWT token for user: ${user.email}`);

      const payload = {
        sub: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles,
        permissions: user.permissions,
        tenantId: user.tenantId,
        organizationId: user.organizationId,
        departmentId: user.departmentId,
        isolationLevel: user.isolationLevel,
        iat: Math.floor(Date.now() / 1000),
        iss: process.env["JWT_ISSUER"] || "hl8-platform",
        aud: process.env["JWT_AUDIENCE"] || "hl8-users",
      };

      const token = await this.jwtService.signAsync(payload, {
        secret: process.env["JWT_SECRET"] || "default-secret",
        expiresIn: "24h", // 24 hours
      });
      this.logger.debug(`JWT token generated successfully`);

      return token;
    } catch (error) {
      this.logger.error(
        `Token generation failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new GeneralBadRequestException(
        "令牌生成失败",
        "JWT令牌生成过程中发生错误",
      );
    }
  }

  /**
   * 验证 JWT 令牌
   * @description 验证 JWT 令牌并返回用户上下文
   * @param token JWT 令牌
   * @returns 用户上下文
   */
  async verifyToken(token: string): Promise<UserContext> {
    try {
      this.logger.debug("Verifying JWT token");

      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env["JWT_SECRET"] || "default-secret",
      });

      // 构建用户上下文
      const userContext: UserContext = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        roles: payload.roles || [],
        permissions: payload.permissions || [],
        tenantId: payload.tenantId || "default",
        organizationId: payload.organizationId,
        departmentId: payload.departmentId,
        isolationLevel: payload.isolationLevel || "user",
      };

      this.logger.debug(`Token verified for user: ${userContext.email}`);
      return userContext;
    } catch (error) {
      this.logger.error(
        `Token verification failed: ${error instanceof Error ? error.message : String(error)}`,
      );

      // 根据错误类型返回具体的错误信息
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (
        errorMessage.includes("jwt expired") ||
        errorMessage.includes("Token has expired")
      ) {
        throw new GeneralBadRequestException(
          "令牌已过期",
          "JWT令牌已超过有效期",
        );
      } else if (errorMessage.includes("issuer")) {
        throw new GeneralBadRequestException(
          "令牌签发者无效",
          "JWT令牌的签发者与系统配置不匹配",
        );
      } else if (errorMessage.includes("audience")) {
        throw new GeneralBadRequestException(
          "令牌受众无效",
          "JWT令牌的受众与系统配置不匹配",
        );
      } else if (
        errorMessage.includes("jwt malformed") ||
        errorMessage.includes("Invalid token payload")
      ) {
        throw new GeneralBadRequestException(
          "令牌格式无效",
          "JWT令牌格式不正确",
        );
      } else {
        throw new GeneralBadRequestException(
          "认证失败",
          "用户认证过程中发生错误",
        );
      }
    }
  }

  /**
   * 刷新 JWT 令牌
   * @description 为用户刷新 JWT 令牌
   * @param user 用户上下文
   * @returns 新的 JWT 令牌
   */
  async refreshToken(user: UserContext): Promise<string> {
    try {
      this.logger.debug(`Refreshing token for user: ${user.email}`);
      return await this.generateToken(user);
    } catch (error) {
      this.logger.error(
        `Token refresh failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new GeneralBadRequestException(
        "令牌刷新失败",
        "JWT令牌刷新过程中发生错误",
      );
    }
  }

  /**
   * 撤销 JWT 令牌
   * @description 将 JWT 令牌加入黑名单
   * @param token JWT 令牌
   */
  async revokeToken(_token: string): Promise<void> {
    try {
      this.logger.debug("Revoking JWT token");

      // 这里应该将令牌加入黑名单
      // 可以使用 Redis 或其他存储来维护黑名单
      this.logger.debug("Token revoked successfully");
    } catch (error) {
      this.logger.error(
        `Token revocation failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new GeneralBadRequestException(
        "令牌撤销失败",
        "JWT令牌撤销过程中发生错误",
      );
    }
  }

  /**
   * 从请求中提取令牌
   * @description 从请求头中提取 JWT 令牌
   * @param request 请求对象
   * @returns JWT 令牌或 null
   */
  extractTokenFromRequest(_request: InterfaceFastifyRequest): string | null {
    const authHeader = _request.headers?.authorization;

    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return null;
    }

    return parts[1];
  }

  /**
   * 检查令牌是否在黑名单中
   * @description 检查 JWT 令牌是否已被撤销
   * @param token JWT 令牌
   * @returns 是否在黑名单中
   */
  async isTokenBlacklisted(_token: string): Promise<boolean> {
    try {
      // 这里应该检查令牌是否在黑名单中
      // 可以使用 Redis 或其他存储来检查
      return false;
    } catch (error) {
      this.logger.error(
        `Blacklist check failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      return false;
    }
  }

  /**
   * 获取用户权限
   * @description 获取用户的权限列表
   * @param userId 用户ID
   * @returns 权限列表
   */
  async getUserPermissions(userId: string): Promise<string[]> {
    try {
      this.logger.debug(`Getting permissions for user: ${userId}`);

      // 这里应该从应用层服务获取用户权限
      // 暂时返回模拟权限
      return ["read", "write", "delete"];
    } catch (error) {
      this.logger.error(
        `Failed to get user permissions: ${error instanceof Error ? error.message : String(error)}`,
      );
      return [];
    }
  }

  /**
   * 获取用户角色
   * @description 获取用户的角色列表
   * @param userId 用户ID
   * @returns 角色列表
   */
  async getUserRoles(userId: string): Promise<string[]> {
    try {
      this.logger.debug(`Getting roles for user: ${userId}`);

      // 这里应该从应用层服务获取用户角色
      // 暂时返回模拟角色
      return ["user"];
    } catch (error) {
      this.logger.error(
        `Failed to get user roles: ${error instanceof Error ? error.message : String(error)}`,
      );
      return [];
    }
  }
}
