/**
 * Jest测试环境设置
 * 配置测试环境的基础设置和全局变量
 * 基于全局配置标准化要求
 */

// 设置测试环境变量
process.env.NODE_ENV = "test";

// 模拟@hl8内核组件
jest.mock("@hl8/domain-kernel", () => ({
  BaseEntity: jest.fn(),
  AggregateRoot: jest.fn(),
  BaseValueObject: jest.fn(),
  EntityId: jest.fn(),
  DomainEvent: jest.fn(),
  IsolationContext: {
    tenant: jest.fn(),
    organization: jest.fn(),
    department: jest.fn(),
    user: jest.fn(),
  },
  IsolationLevel: {
    PLATFORM: "PLATFORM",
    TENANT: "TENANT",
    ORGANIZATION: "ORGANIZATION",
    DEPARTMENT: "DEPARTMENT",
    USER: "USER",
  },
  SharingLevel: {
    PLATFORM: "PLATFORM",
    TENANT: "TENANT",
    ORGANIZATION: "ORGANIZATION",
    DEPARTMENT: "DEPARTMENT",
    USER: "USER",
  },
}));

jest.mock("@hl8/application-kernel", () => ({
  BaseUseCase: jest.fn(),
  BaseCommand: jest.fn(),
  BaseQuery: jest.fn(),
  CommandHandler: jest.fn(),
  QueryHandler: jest.fn(),
}));

jest.mock("@hl8/infrastructure-kernel", () => ({
  // 基础设施内核组件模拟
}));

jest.mock("@hl8/interface-kernel", () => ({
  RestController: jest.fn(),
  AuthenticationGuard: jest.fn(),
  AuthorizationGuard: jest.fn(),
}));

jest.mock("@hl8/exceptions", () => ({
  DomainException: jest.fn(),
  BusinessException: jest.fn(),
  ValidationException: jest.fn(),
  NotFoundException: jest.fn(),
}));

jest.mock("@hl8/caching", () => ({
  ICacheService: jest.fn(),
}));

jest.mock("@hl8/config", () => ({
  ConfigService: jest.fn(),
}));

jest.mock("@hl8/nestjs-fastify", () => ({
  Logger: jest.fn(),
}));

// 设置测试超时
jest.setTimeout(10000);
