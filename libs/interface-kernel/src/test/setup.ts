/**
 * @fileoverview Jest 测试设置文件
 * @description 为接口层核心模块配置测试环境
 */

// 设置测试环境
process.env.NODE_ENV = "test";
process.env.LOG_LEVEL = "error";

// 模拟环境变量
process.env.AUTH_SECRET = "test-secret-key";
process.env.AUTH_EXPIRES_IN = "1h";
process.env.RATE_LIMIT_TTL = "60000";
process.env.RATE_LIMIT_MAX = "100";

// 全局测试设置
global.console = {
  ...console,
  // 在测试中静默日志输出
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// 设置测试超时
jest.setTimeout(10000);

// 清理模拟和定时器
beforeEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.clearAllTimers();
});

// 全局清理
afterAll(() => {
  jest.clearAllTimers();
  jest.resetAllMocks();
  jest.restoreAllMocks();
});

// 全局测试工具
global.testUtils = {
  createMockRequest: (overrides = {}) => ({
    method: "GET",
    url: "/api/v1/test",
    headers: {},
    body: {},
    query: {},
    params: {},
    socket: { remoteAddress: "127.0.0.1" },
    ...overrides,
  }),

  createMockReply: (overrides = {}) => ({
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
    header: jest.fn().mockReturnThis(),
    ...overrides,
  }),

  createMockUser: (overrides = {}) => ({
    id: "user-123",
    email: "test@example.com",
    name: "Test User",
    roles: ["user"],
    permissions: ["read"],
    tenantId: "test-tenant",
    isolationLevel: "user",
    ...overrides,
  }),
};
