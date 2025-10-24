/**
 * @fileoverview 集成测试
 * @description 测试 @hl8/exceptions 与 interface-kernel 的集成
 */

import { Test, TestingModule } from "@nestjs/testing";
import { InterfaceKernelModule } from "../interface-kernel.module.js";
import { ApiGatewayService } from "../services/api-gateway.service.js";
import { AuthenticationService } from "../services/authentication.service.js";
import { AuthorizationService } from "../services/authorization.service.js";
import { ValidationService } from "../services/validation.service.js";
import {
  InterfaceLayerException,
  AuthenticationFailedException,
  ValidationFailedException,
  InsufficientPermissionsException,
} from "@hl8/exceptions";

describe("Interface Kernel Integration Tests", () => {
  let module: TestingModule;
  let apiGatewayService: ApiGatewayService;
  let authenticationService: AuthenticationService;
  let authorizationService: AuthorizationService;
  let validationService: ValidationService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [InterfaceKernelModule],
    }).compile();

    apiGatewayService = module.get<ApiGatewayService>(ApiGatewayService);
    authenticationService = module.get<AuthenticationService>(
      AuthenticationService,
    );
    authorizationService =
      module.get<AuthorizationService>(AuthorizationService);
    validationService = module.get<ValidationService>(ValidationService);
  });

  afterAll(async () => {
    await module.close();
  });

  describe("Exception Integration", () => {
    it("should throw InterfaceLayerException for API gateway errors", async () => {
      const mockRequest = {
        method: "INVALID_METHOD",
        url: "/test",
        headers: {},
        id: "test-request-id",
      } as any;

      await expect(
        apiGatewayService.handleHttpRequest(mockRequest, {} as any),
      ).rejects.toThrow(InterfaceLayerException);
    });

    it("should throw AuthenticationFailedException for invalid credentials", async () => {
      await expect(
        authenticationService.validateUser("invalid@test.com", "wrongpassword"),
      ).resolves.toBeNull();
    });

    it("should throw ValidationFailedException for invalid data", async () => {
      const mockRequest = {
        body: { invalid: "data" },
        headers: {},
      } as any;

      await expect(
        validationService.validateRequestData(mockRequest, "userCreate"),
      ).rejects.toThrow(ValidationFailedException);
    });

    it("should throw InsufficientPermissionsException for insufficient permissions", async () => {
      const mockUser = {
        id: "user-1",
        email: "test@example.com",
        name: "Test User",
        roles: ["user"],
        permissions: ["read"],
        tenantId: "tenant-1",
        isolationLevel: "user" as any,
      };

      const mockContext = {
        tenantId: "tenant-2", // Different tenant
        organizationId: "org-1",
        departmentId: "dept-1",
        userId: "user-1",
        isolationLevel: "user" as any,
        sharingLevel: "private" as any,
      };

      await expect(
        authorizationService.checkPermission(
          mockUser,
          "users",
          "read",
          mockContext,
        ),
      ).rejects.toThrow(InsufficientPermissionsException);
    });
  });

  describe("Exception Module Integration", () => {
    it("should have ExceptionModule properly configured", () => {
      expect(module).toBeDefined();
      expect(apiGatewayService).toBeDefined();
      expect(authenticationService).toBeDefined();
      expect(authorizationService).toBeDefined();
      expect(validationService).toBeDefined();
    });
  });
});
