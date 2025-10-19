/**
 * 最小测试
 *
 * @description 测试配置模块的最小功能
 * @author HL8 SAAS Platform Team
 * @since 1.0.0
 */

import "../lib/typed-config.module.js";
import "../lib/loader/index.js";
import "../lib/cache/index.js";
import "../lib/errors/index.js";

describe("配置模块最小测试", () => {
  it("应该能够导入模块", () => {
    expect(true).toBe(true);
  });

  it("应该能够导入加载器", () => {
    expect(true).toBe(true);
  });

  it("应该能够导入缓存", () => {
    expect(true).toBe(true);
  });

  it("应该能够导入错误处理", () => {
    expect(true).toBe(true);
  });
});
