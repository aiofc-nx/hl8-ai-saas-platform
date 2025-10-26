# TypeScript `any` 类型快速参考指南

## 📋 概述

本指南提供了 TypeScript `any` 类型使用的快速参考，包括常用场景、代码模板和最佳实践。

## 🚀 快速开始

### 1. 使用前检查

#### 替代方案优先级

```
1. 联合类型 (string | number)
2. 泛型 (<T>)
3. 接口或类型别名
4. 类型断言 (as)
5. 类型守卫
6. any 类型（最后选择）
```

#### 快速决策流程

```
是否需要 any？
├─ 是 → 是否尝试了所有替代方案？
│   ├─ 是 → 添加注释和测试
│   └─ 否 → 尝试替代方案
└─ 否 → 使用具体类型
```

### 2. 代码模板

#### 基础模板

```typescript
/**
 * 功能描述
 * 使用 any 的原因：[具体原因]
 * 预期数据类型：[描述]
 * TODO: [改进计划]
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function functionName(param: any): any {
  // 添加运行时验证
  if (typeof param !== "expected_type") {
    throw new Error("参数类型错误");
  }

  // 业务逻辑
  return param;
}
```

#### 第三方库集成模板

```typescript
/**
 * 集成第三方库：[库名]
 * 使用 any 的原因：库没有类型定义
 * 改进计划：等待库提供类型定义或创建自定义类型
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const thirdPartyLib: any = require("untyped-library");

// 包装库调用以提供类型安全
function safeLibraryCall(param: string): string {
  try {
    return thirdPartyLib.method(param);
  } catch (error) {
    throw new Error(`库调用失败: ${error}`);
  }
}
```

#### 动态数据解析模板

```typescript
/**
 * 解析动态数据
 * 使用 any 的原因：数据结构可能变化
 * 改进计划：定义具体的数据接口
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseDynamicData(data: any): Record<string, any> {
  // 基础验证
  if (typeof data !== "object" || data === null) {
    throw new Error("数据必须是对象类型");
  }

  // 业务验证
  if (!data.id || !data.name) {
    throw new Error("数据缺少必需字段");
  }

  return data;
}
```

## 📝 常用场景

### 1. 第三方库集成

#### 场景描述

集成没有类型定义的第三方库

#### 代码示例

```typescript
// 定义库的类型接口
interface ThirdPartyLibrary {
  method1(param: string): string;
  method2(param: number): number;
}

// 使用类型断言
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const lib: ThirdPartyLibrary = require("untyped-library") as any;

// 包装库调用
function safeLibraryCall(param: string): string {
  try {
    return lib.method1(param);
  } catch (error) {
    throw new Error(`库调用失败: ${error}`);
  }
}
```

### 2. 动态数据解析

#### 场景描述

解析来自外部 API 的动态数据

#### 代码示例

```typescript
// 定义基础数据结构
interface BaseApiResponse {
  success: boolean;
  message: string;
  data: unknown;
}

// 使用类型守卫验证数据
function isApiResponse(data: unknown): data is BaseApiResponse {
  return (
    typeof data === "object" &&
    data !== null &&
    "success" in data &&
    "message" in data &&
    "data" in data
  );
}

// 安全解析数据
function parseApiResponse(response: unknown): BaseApiResponse {
  if (!isApiResponse(response)) {
    throw new Error("无效的 API 响应格式");
  }
  return response;
}
```

### 3. 反射和元编程

#### 场景描述

使用反射或元编程技术

#### 代码示例

```typescript
// 定义反射操作的约束
interface ReflectionTarget {
  [key: string]: unknown;
}

// 安全的反射操作
function safeReflection(obj: ReflectionTarget, propertyName: string): unknown {
  if (!(propertyName in obj)) {
    throw new Error(`属性 ${propertyName} 不存在`);
  }

  const value = obj[propertyName];

  // 添加类型验证
  if (typeof value === "function") {
    throw new Error("属性是函数，无法直接访问");
  }

  return value;
}
```

## 🔧 工具配置

### 1. ESLint 配置

#### 推荐配置

```json
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unsafe-assignment": "error",
    "@typescript-eslint/no-unsafe-member-access": "error",
    "@typescript-eslint/no-unsafe-call": "error",
    "@typescript-eslint/no-unsafe-return": "error"
  }
}
```

#### 临时禁用规则

```typescript
// 在特定行禁用规则
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = getData();

// 在特定块禁用规则
/* eslint-disable @typescript-eslint/no-explicit-any */
function legacyFunction(data: any): any {
  return data;
}
/* eslint-enable @typescript-eslint/no-explicit-any */
```

### 2. TypeScript 配置

#### 推荐配置

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

## 🧪 测试模板

### 1. 单元测试模板

```typescript
describe("functionName", () => {
  it("should handle valid data", () => {
    const validData = { id: "1", name: "test" };
    const result = functionName(validData);
    expect(result).toBeDefined();
  });

  it("should throw error for invalid data", () => {
    expect(() => functionName(null)).toThrow();
    expect(() => functionName("invalid")).toThrow();
  });

  it("should handle edge cases", () => {
    const edgeData = { id: "", name: "" };
    const result = functionName(edgeData);
    expect(result).toBeDefined();
  });
});
```

### 2. 类型测试模板

```typescript
// 类型测试
type TestType = ReturnType<typeof functionName>;
// 验证返回类型是否符合预期
```

## 📊 监控和度量

### 1. 使用统计

```typescript
// 统计 any 类型使用情况
interface TypeUsageStats {
  anyTypeCount: number;
  totalTypeCount: number;
  anyTypeRatio: number;
}

function analyzeTypeUsage(sourceCode: string): TypeUsageStats {
  // 分析代码中的类型使用情况
  // 返回统计结果
}
```

### 2. 改进跟踪

```typescript
// 改进计划跟踪
interface ImprovementPlan {
  id: string;
  description: string;
  priority: "high" | "medium" | "low";
  estimatedEffort: number;
  targetDate: Date;
  status: "planned" | "in-progress" | "completed";
}
```

## 🎯 最佳实践

### 1. 类型优先原则

- 始终优先考虑使用具体的类型定义
- 从 `any` 开始，逐步替换为更具体的类型
- 建立类型安全的开发文化

### 2. 文档化驱动

- 详细记录使用 `any` 的原因
- 记录改进计划和进度
- 维护类型定义文档

### 3. 测试保障

- 为使用 `any` 的代码编写完整测试
- 使用类型测试工具验证类型安全
- 建立持续集成检查

### 4. 持续改进

- 定期审查 `any` 类型使用
- 跟踪改进进度
- 分享最佳实践

## 🚫 常见错误

### 1. 懒惰使用

```typescript
// ❌ 错误：懒惰使用 any
function badExample(data: any): any {
  return data.someProperty;
}

// ✅ 正确：定义具体类型
interface DataWithProperty {
  someProperty: string;
}

function goodExample(data: DataWithProperty): string {
  return data.someProperty;
}
```

### 2. 避免类型错误

```typescript
// ❌ 错误：用 any 绕过类型检查
function badExample(data: any): any {
  return data.property.that.might.not.exist;
}

// ✅ 正确：使用可选链和类型检查
function goodExample(data: unknown): string | undefined {
  if (typeof data === "object" && data !== null) {
    const obj = data as Record<string, unknown>;
    return obj.property?.that?.might?.not?.exist as string;
  }
  return undefined;
}
```

## 📚 参考资源

### 相关文档

- [TypeScript `any` 类型处理方案](./ANY_TYPE_HANDLING_GUIDE.md)
- [TypeScript `any` 类型使用检查清单](./ANY_TYPE_CHECKLIST.md)
- [项目宪章](../memory/constitution.md)

### 工具推荐

- TypeScript 编译器
- ESLint
- Prettier
- Jest/Mocha
- 类型测试工具

## ✅ 快速检查清单

### 使用前检查

- [ ] 是否尝试了所有替代方案？
- [ ] 是否真的需要使用 `any`？
- [ ] 是否评估了风险？

### 实现检查

- [ ] 是否添加了详细注释？
- [ ] 是否添加了运行时验证？
- [ ] 是否使用了 ESLint 禁用注释？
- [ ] 是否限制了使用范围？

### 测试检查

- [ ] 是否编写了单元测试？
- [ ] 是否测试了各种情况？
- [ ] 是否验证了错误处理？

### 文档检查

- [ ] 是否记录了使用原因？
- [ ] 是否记录了改进计划？
- [ ] 是否添加了 TODO 注释？

通过遵循这个快速参考指南，可以确保 `any` 类型的安全、合理使用，提高代码质量和类型安全性。
