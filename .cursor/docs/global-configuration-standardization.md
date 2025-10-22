# 全局项目配置标准化指南

## 概述

本文档阐述了如何在 hl8-ai-saas-platform 项目中实现全局配置的统一管理，包括 ESLint、TypeScript、Jest 等开发工具的配置标准化。

## 配置架构

### 1. 配置包结构

项目采用配置包（Configuration Packages）的方式实现全局配置统一：

```text
packages/
├── eslint-config/          # ESLint 配置包
│   ├── eslint-base.config.mjs
│   ├── eslint-nest.config.mjs
│   ├── eslint-next.config.mjs
│   └── eslint-react-internal.config.mjs
└── typescript-config/       # TypeScript 配置包
    ├── base.json
    ├── nestjs.json
    ├── nextjs.json
    └── react-library.json
```

### 2. 配置继承机制

#### ESLint 配置继承

```mjs
// 子项目 eslint.config.mjs
import nest from "@repo/eslint-config/eslint-nest.config.mjs";

export default [
  ...nest,
  {
    ignores: ["jest.config.ts"],
  },
  {
    files: ["**/*.ts"],
    ignores: ["**/*.spec.ts", "**/*.test.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  {
    files: ["**/*.spec.ts", "**/*.test.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "prefer-const": "off",
      "no-console": "off",
    },
  },
];
```

#### TypeScript 配置继承

```json
// 子项目 tsconfig.json
{
  "extends": "@repo/typescript-config/nestjs.json",
  "compilerOptions": {
    "allowJs": false,
    "esModuleInterop": true,
    "incremental": false,
    "baseUrl": ".",
    "rootDir": "./src",
    "outDir": "./dist"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "test", "dist", "**/*.js", "**/*.js.map"]
}
```

#### Jest 配置标准化

```typescript
// 子项目 jest.config.ts
import type { Config } from "jest";

const config: Config = {
  displayName: "domain-kernel",
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  rootDir: ".",
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
  testMatch: ["**/*.spec.ts"],
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

## 配置包详细说明

### ESLint 配置包 (@repo/eslint-config)

#### 基础配置 (eslint-base.config.mjs)

提供通用的 ESLint 规则配置，包括：

- TypeScript 支持
- 代码风格规范
- 最佳实践规则
- 导入/导出规则

#### 框架特定配置

- **eslint-nest.config.mjs**: NestJS 项目专用配置
- **eslint-next.config.mjs**: Next.js 项目专用配置
- **eslint-react-internal.config.mjs**: React 内部组件配置

### TypeScript 配置包 (@repo/typescript-config)

#### 基础配置 (base.json)

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "Base",
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "exclude": ["node_modules"]
}
```

#### TypeScript 框架特定配置

- **nestjs.json**: NestJS 项目配置
- **nextjs.json**: Next.js 项目配置
- **react-library.json**: React 库项目配置

## 脚本标准化

### 统一脚本配置

所有项目使用以下标准脚本配置：

```json
{
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "dev": "tsc -p tsconfig.build.json --watch",
    "lint": "eslint . --fix",
    "lint:check": "eslint .",
    "test": "NODE_OPTIONS=--experimental-vm-modules jest",
    "test:cov": "NODE_OPTIONS=--experimental-vm-modules jest --coverage",
    "test:watch": "NODE_OPTIONS=--experimental-vm-modules jest --watch",
    "type-check": "tsc --noEmit"
  }
}
```

### Turbo 任务配置

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**", "*.tsbuildinfo"]
    },
    "type-check": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", "tsconfig.json", "tsconfig.*.json"]
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "lint:check": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", "jest.config.*"]
    },
    "test:cov": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    }
  }
}
```

## 类型安全配置

### 1. 强化类型检查规则

为了确保代码质量和类型安全，项目采用严格的 ESLint 规则配置：

#### 生产代码类型安全

```mjs
// 对生产代码启用严格的类型检查
{
  files: ["**/*.ts"],
  ignores: ["**/*.spec.ts", "**/*.test.ts"],
  rules: {
    "@typescript-eslint/no-explicit-any": "error",  // 禁止使用 any 类型
    "@typescript-eslint/no-unsafe-assignment": "error",
    "@typescript-eslint/no-unsafe-call": "error",
    "@typescript-eslint/no-unsafe-member-access": "error",
    "@typescript-eslint/no-unsafe-return": "error",
  },
}
```

#### 测试代码宽松规则

```mjs
// 测试代码允许使用 any 以提高测试灵活性
{
  files: ["**/*.spec.ts", "**/*.test.ts"],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "prefer-const": "off",
    "no-console": "off",
  },
}
```

### 2. 类型安全最佳实践

#### 使用泛型替代 any

```typescript
// ❌ 不推荐：使用 any
function processData(data: any): any {
  return data;
}

// ✅ 推荐：使用泛型
function processData<T>(data: T): T {
  return data;
}
```

#### 使用 unknown 替代 any

```typescript
// ❌ 不推荐：使用 any
function handleUnknown(value: any) {
  return value.someProperty;
}

// ✅ 推荐：使用 unknown 并进行类型检查
function handleUnknown(value: unknown) {
  if (typeof value === "object" && value !== null && "someProperty" in value) {
    return (value as { someProperty: unknown }).someProperty;
  }
  return undefined;
}
```

#### 定义精确的上下文类型

```typescript
// ❌ 不推荐：使用 any 作为上下文
interface BusinessRule {
  validate(context: any): boolean;
}

// ✅ 推荐：定义精确的上下文类型
interface UserRegistrationContext {
  operation: "user_registration";
  userData: {
    email: string;
    username: string;
    password: string;
    age?: number;
  };
}

interface BusinessRule<TContext = unknown> {
  validate(context: TContext): boolean;
}
```

## 配置应用指南

### 1. 新建项目配置

#### 创建 ESLint 配置

```mjs
// eslint.config.mjs
import nest from "@repo/eslint-config/eslint-nest.config.mjs";

export default [
  ...nest,
  {
    ignores: ["jest.config.ts", "dist/**", "coverage/**"],
  },
  {
    files: ["**/*.spec.ts", "**/*.test.ts"],
    rules: {
      // 测试文件特定规则
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
];
```

#### 创建 TypeScript 配置

```json
// tsconfig.json
{
  "extends": "@repo/typescript-config/nestjs.json",
  "compilerOptions": {
    "baseUrl": ".",
    "rootDir": "./src",
    "outDir": "./dist"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "test", "dist", "**/*.js", "**/*.js.map"]
}
```

#### 创建 Jest 配置

```typescript
// jest.config.ts
import type { Config } from "jest";

const config: Config = {
  displayName: "your-project-name",
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  rootDir: ".",
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
  testMatch: ["**/*.spec.ts"],
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

### 2. 更新现有项目配置

#### 更新 package.json 脚本

```bash
# 使用标准化脚本替换现有脚本
pnpm run libs:fix
```

#### 更新配置文件

1. **ESLint 配置**: 替换为继承 `@repo/eslint-config` 的配置
2. **TypeScript 配置**: 更新 `extends` 字段指向 `@repo/typescript-config`
3. **Jest 配置**: 使用标准化的 Jest 配置模板

### 3. 验证配置

#### 运行配置验证

```bash
# 检查所有项目配置
pnpm lint:check
pnpm type-check
pnpm test

# 检查特定项目
pnpm lint:check --filter=@hl8/your-project
pnpm test --filter=@hl8/your-project
```

## 配置维护

### 1. 配置更新流程

1. **修改配置包**: 在 `packages/eslint-config` 或 `packages/typescript-config` 中更新配置
2. **测试配置**: 在测试项目中验证配置变更
3. **应用配置**: 使用 `pnpm run libs:fix` 自动更新所有项目
4. **验证结果**: 运行 `pnpm lint:check` 和 `pnpm test` 验证配置

### 2. 配置版本管理

- 配置包使用语义化版本控制
- 重大配置变更需要更新版本号
- 向下兼容的配置更新可以直接应用

### 3. 配置文档维护

- 配置变更需要更新本文档
- 新增配置选项需要添加说明
- 废弃的配置需要标记并说明迁移路径

## 最佳实践

### 1. 配置继承原则

- **优先使用配置包**: 避免在子项目中重复定义通用配置
- **最小化覆盖**: 只在必要时覆盖基础配置
- **保持一致性**: 相同类型的项目使用相同的配置

### 2. 配置组织

- **按框架分类**: 不同框架使用不同的配置包
- **按环境分类**: 开发、测试、生产环境使用不同配置
- **按功能分类**: 通用配置和特定功能配置分离

### 3. 配置验证

- **自动化检查**: 在 CI/CD 中自动验证配置
- **定期审查**: 定期检查配置的有效性和一致性
- **文档同步**: 确保配置文档与实际配置保持同步

## 故障排除

### 常见问题

#### 1. ESLint 配置冲突

**问题**: 子项目 ESLint 配置与全局配置冲突

**解决方案**:

```mjs
// 在子项目 eslint.config.mjs 中明确覆盖
export default [
  ...nest,
  {
    rules: {
      // 明确覆盖冲突的规则
      "conflicting-rule": "off",
    },
  },
];
```

#### 2. TypeScript 配置继承失败

**问题**: TypeScript 配置继承不生效

**解决方案**:

```json
// 确保 extends 路径正确
{
  "extends": "@repo/typescript-config/nestjs.json"
}
```

#### 3. Jest 配置 ES 模块问题

**问题**: Jest 无法正确处理 ES 模块

**解决方案**:

```typescript
// 确保 Jest 配置正确设置 ES 模块支持
const config: Config = {
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { useESM: true }],
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};
```

#### 4. 类型安全配置问题

**问题**: ESLint 报告 `@typescript-eslint/no-explicit-any` 错误

**解决方案**:

```typescript
// ❌ 问题代码
function processData(data: any): any {
  return data;
}

// ✅ 解决方案1：使用泛型
function processData<T>(data: T): T {
  return data;
}

// ✅ 解决方案2：使用 unknown 并进行类型检查
function processData(data: unknown): unknown {
  if (typeof data === "object" && data !== null) {
    return data;
  }
  return undefined;
}

// ✅ 解决方案3：定义精确类型
interface UserData {
  id: string;
  name: string;
  email: string;
}

function processUserData(data: UserData): UserData {
  return data;
}
```

**问题**: 测试文件中需要使用 any 类型

**解决方案**:

```mjs
// 在 eslint.config.mjs 中为测试文件关闭 any 检查
{
  files: ["**/*.spec.ts", "**/*.test.ts"],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
  },
}
```

### 调试工具

#### 1. 配置验证命令

```bash
# 验证 ESLint 配置
npx eslint --print-config src/index.ts

# 验证 TypeScript 配置
npx tsc --showConfig

# 验证 Jest 配置
npx jest --showConfig
```

#### 2. 配置调试

```bash
# 启用详细日志
DEBUG=eslint:* pnpm lint
DEBUG=jest:* pnpm test
```

## 总结

通过实施全局配置标准化，项目实现了：

1. **配置一致性**: 所有项目使用统一的配置标准
2. **维护效率**: 集中管理配置，减少重复工作
3. **开发体验**: 统一的开发工具配置提升开发效率
4. **质量保证**: 标准化的代码检查和测试配置

这种配置管理方式为项目的长期维护和扩展提供了坚实的基础，确保了代码质量和开发效率的持续提升。
