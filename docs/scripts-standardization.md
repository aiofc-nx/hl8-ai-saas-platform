# 项目脚本标准化配置

## 概述

本文档描述了HL8 AI SAAS平台项目中各子项目的脚本标准化配置，确保所有项目使用统一的测试和lint脚本。

## 标准化脚本配置

### 通用脚本

所有子项目（libs和apps）都应包含以下标准化脚本：

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

### 脚本说明

#### 构建脚本

- `build`: 使用TypeScript编译器构建项目
- `dev`: 开发模式，监听文件变化并自动重新构建

#### Lint脚本

- `lint`: 运行ESLint并自动修复可修复的问题
- `lint:check`: 仅检查代码风格，不进行修复

#### 测试脚本

- `test`: 运行所有测试
- `test:cov`: 运行测试并生成覆盖率报告
- `test:watch`: 监听模式运行测试

#### 类型检查

- `type-check`: 运行TypeScript类型检查，不生成输出文件

### 特殊脚本

某些项目可能包含特殊脚本：

#### 数据库相关项目

```json
{
  "scripts": {
    "migration:create": "mikro-orm migration:create",
    "migration:up": "mikro-orm migration:up",
    "migration:down": "mikro-orm migration:down",
    "migration:pending": "mikro-orm migration:pending",
    "schema:drop": "mikro-orm schema:drop --run",
    "schema:fresh": "mikro-orm schema:fresh --run"
  }
}
```

#### 应用项目

```json
{
  "scripts": {
    "start": "node dist/src/main.js",
    "start:debug": "nest start --debug --watch",
    "start:dev": "nest start"
  }
}
```

## Turbo配置

在`turbo.json`中，我们为所有标准化脚本配置了依赖关系：

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

## 根项目脚本

根`package.json`提供了便捷的脚本命令：

```json
{
  "scripts": {
    "lint": "turbo lint",
    "lint:check": "turbo lint:check",
    "lint:fastify-api": "pnpm lint --filter=fastify-api",
    "lint:libs": "pnpm lint --filter=@hl8/*",
    "test": "turbo test",
    "test:libs": "pnpm test --filter=@hl8/*",
    "test:cov": "turbo test:cov",
    "test:fastify-api": "pnpm test --filter=fastify-api"
  }
}
```

## 使用指南

### 开发工作流

1. **代码检查**：

   ```bash
   # 检查所有项目
   pnpm lint:check

   # 修复所有项目
   pnpm lint

   # 检查特定项目
   pnpm lint --filter=@hl8/config
   ```

2. **测试**：

   ```bash
   # 运行所有测试
   pnpm test

   # 运行测试并生成覆盖率报告
   pnpm test:cov

   # 运行特定项目的测试
   pnpm test --filter=@hl8/config
   ```

3. **类型检查**：

   ```bash
   # 检查所有项目类型
   pnpm type-check
   ```

### 项目特定命令

- **数据库迁移**（仅限database项目）：

  ```bash
  pnpm migration:create --name=add-user-table
  pnpm migration:up
  ```

- **应用启动**（仅限apps项目）：

  ```bash
  pnpm start:fastify-api
  ```

## 注意事项

1. **Node.js版本**：所有项目要求Node.js >= 20
2. **ES模块**：使用`NODE_OPTIONS=--experimental-vm-modules`支持ES模块测试
3. **依赖关系**：所有脚本都依赖于构建完成，确保类型检查通过
4. **缓存**：Turbo会自动缓存构建结果，提高开发效率

## 更新历史

- 2024-01-XX: 初始标准化配置
- 统一了所有项目的lint和test脚本
- 添加了lint:check脚本用于CI/CD环境
- 配置了Turbo依赖关系以优化构建流程
