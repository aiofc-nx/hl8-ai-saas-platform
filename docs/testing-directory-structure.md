# 测试目录结构标准化

## 概述

本文档描述了HL8 AI SAAS平台项目中统一的测试目录结构规范，确保所有项目遵循相同的测试组织方式。

## 标准化目录结构

### 项目根目录结构

```
project-root/
├── src/                    # 源代码目录
│   ├── **/*.ts            # 源代码文件
│   └── **/*.spec.ts      # 单元测试文件（与源代码同目录）
├── test/                   # 测试目录（src目录外）
│   ├── integration/       # 集成测试
│   │   └── **/*.spec.ts
│   └── e2e/              # 端到端测试
│       └── **/*.spec.ts
├── jest.config.ts         # Jest配置文件
└── package.json
```

### 测试类型说明

#### 1. 单元测试 (Unit Tests)

- **位置**: 与源代码文件同目录
- **命名**: `{被测试文件名}.spec.ts`
- **示例**: `src/services/user.service.ts` → `src/services/user.service.spec.ts`

#### 2. 集成测试 (Integration Tests)

- **位置**: `test/integration/`
- **命名**: `{功能模块}.spec.ts`
- **示例**: `test/integration/user-management.spec.ts`

#### 3. 端到端测试 (E2E Tests)

- **位置**: `test/e2e/`
- **命名**: `{业务流程}.spec.ts`
- **示例**: `test/e2e/user-registration-flow.spec.ts`

## Jest配置标准

### 统一Jest配置模板

```typescript
import type { Config } from "jest";

const config: Config = {
  displayName: "project-name",
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: {
          module: "NodeNext",
          moduleResolution: "NodeNext",
        },
      },
    ],
  },
  moduleFileExtensions: ["ts", "js", "json"],
  testMatch: [
    "src/**/*.spec.ts",
    "test/integration/**/*.spec.ts",
    "test/e2e/**/*.spec.ts",
  ],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.spec.ts",
    "!src/**/*.test.ts",
    "!src/**/*.d.ts",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  setupFilesAfterEnv: ["<rootDir>/../../jest.setup.js"],
};

export default config;
```

### 配置说明

- **testMatch**: 指定测试文件匹配模式，包含三种测试类型
- **collectCoverageFrom**: 收集覆盖率时排除测试文件
- **moduleNameMapper**: 处理ES模块路径映射
- **setupFilesAfterEnv**: 使用全局Jest设置文件

## 项目类型特定配置

### Apps项目 (如 fastify-api)

```typescript
export default {
  collectCoverageFrom: [
    "src/**/*.(t|j)s",
    "!src/**/*.spec.ts",
    "!src/**/*.test.ts",
  ],
  coverageDirectory: "../coverage",
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: ".",
  testEnvironment: "node",
  testMatch: [
    "src/**/*.spec.ts",
    "test/integration/**/*.spec.ts",
    "test/e2e/**/*.spec.ts",
  ],
  // ... 其他配置
};
```

### Libs项目

```typescript
import type { Config } from "jest";

const config: Config = {
  displayName: "lib-name",
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  // ... 其他配置
};
```

## 迁移指南

### 从旧结构迁移

1. **移动测试文件**:

   ```bash
   # 移动集成测试
   mkdir -p test/integration
   mv tests/integration/* test/integration/

   # 移动端到端测试
   mkdir -p test/e2e
   mv tests/e2e/* test/e2e/
   mv __tests__/* test/e2e/
   ```

2. **更新Jest配置**:
   - 更新 `testMatch` 模式
   - 更新 `collectCoverageFrom` 路径
   - 确保支持新的目录结构

3. **更新package.json脚本**:
   - 确保测试脚本指向正确的目录
   - 更新覆盖率收集路径

## 测试执行

### 运行特定类型测试

```bash
# 运行单元测试
pnpm test --testPathPattern="src/"

# 运行集成测试
pnpm test --testPathPattern="test/integration/"

# 运行端到端测试
pnpm test --testPathPattern="test/e2e/"
```

### 运行所有测试

```bash
# 运行所有测试
pnpm test

# 运行测试并生成覆盖率报告
pnpm test:cov
```

## 最佳实践

### 1. 测试文件组织

- **单元测试**: 与源代码紧密耦合，便于维护
- **集成测试**: 按功能模块组织，测试模块间交互
- **端到端测试**: 按业务流程组织，测试完整用户场景

### 2. 命名规范

- 测试文件使用 `.spec.ts` 后缀
- 测试描述使用中文，清晰表达测试意图
- 测试套件按功能分组

### 3. 测试隔离

- 每个测试独立运行，不依赖其他测试
- 使用 `beforeEach`/`afterEach` 清理状态
- 避免共享可变状态

## 验证清单

- [ ] 所有项目都有 `test/` 目录（src目录外）
- [ ] Jest配置支持三种测试类型
- [ ] 测试脚本能正确运行所有测试
- [ ] 覆盖率收集正确排除测试文件
- [ ] 单元测试与源代码同目录
- [ ] 集成测试在 `test/integration/` 目录
- [ ] 端到端测试在 `test/e2e/` 目录

## 更新历史

- 2024-10-22: 初始标准化配置
- 统一了所有项目的测试目录结构
- 更新了Jest配置以支持新的目录结构
- 创建了迁移指南和最佳实践文档
