/**
 * Jest 测试设置
 */

// 设置全局测试环境
beforeAll(() => {
  // 设置测试环境变量
  process.env.NODE_ENV = "test";
});

afterAll(() => {
  // 清理测试环境
});
