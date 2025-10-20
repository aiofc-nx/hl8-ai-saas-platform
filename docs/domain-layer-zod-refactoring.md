# 领域层引入Zod重构方案

## 文档概述

本文档阐述了在HL8 AI SaaS平台业务核心库（@hl8/business-core）的领域层引入Zod验证库的重构方案。该方案旨在提升代码质量、减少样板代码、增强类型安全，同时保持领域驱动设计（DDD）的架构完整性。

## 目录

1. [背景与动机](#背景与动机)
2. [现状分析](#现状分析)
3. [重构目标](#重构目标)
4. [技术方案](#技术方案)
5. [实施计划](#实施计划)
6. [风险评估](#风险评估)
7. [预期收益](#预期收益)
8. [附录](#附录)

## 背景与动机

### 当前问题

1. **验证逻辑分散**：验证代码散布在各个实体、值对象和聚合根中
2. **重复代码**：相似的验证逻辑在多个地方重复实现
3. **类型安全不足**：运行时验证与编译时类型检查分离
4. **错误处理不统一**：验证错误的格式和结构不一致
5. **测试复杂度高**：验证逻辑的测试用例编写和维护成本高

### 引入Zod的动机

- **框架无关性**：Zod是纯TypeScript库，不依赖任何框架
- **类型安全**：提供运行时验证和编译时类型推断
- **声明式API**：减少样板代码，提高可读性
- **组合性强**：验证模式可以轻松组合和复用
- **错误处理优秀**：提供结构化的错误信息

## 现状分析

### 当前验证架构

```typescript
// 当前的自定义验证器示例
export class EmailValidator {
  public static validateFormat(email: string): {
    isValid: boolean;
    error?: string;
  } {
    if (!email || typeof email !== "string" || email.trim().length === 0) {
      return { isValid: false, error: "邮箱不能为空" };
    }

    if (email.length > 254) {
      return { isValid: false, error: "邮箱长度不能超过254个字符" };
    }

    // ... 更多验证逻辑
    return { isValid: true };
  }
}
```

### 现有验证器清单

| 验证器类型        | 文件位置                                             | 复杂度 | 维护成本 |
| ----------------- | ---------------------------------------------------- | ------ | -------- |
| EmailValidator    | `src/domain/validators/common/email.validator.ts`    | 高     | 高       |
| UsernameValidator | `src/domain/validators/common/username.validator.ts` | 中     | 中       |
| 各种实体验证      | 散布在实体类中                                       | 高     | 高       |
| 业务规则验证      | 散布在聚合根中                                       | 很高   | 很高     |

### 问题统计

- **验证器数量**：15+ 个自定义验证器
- **重复代码行数**：约 500+ 行
- **测试用例数量**：80+ 个验证相关测试
- **维护时间**：每月约 2-3 小时

## 重构目标

### 主要目标

1. **统一验证接口**：建立一致的验证API和错误处理机制
2. **提升类型安全**：实现编译时和运行时类型的一致性
3. **减少代码重复**：消除验证逻辑的重复实现
4. **改善开发体验**：提供更好的IDE支持和错误提示
5. **保持架构完整性**：维护DDD架构的清晰边界

### 成功指标

- 验证相关代码减少 40%
- 类型错误减少 60%
- 新验证器开发时间减少 50%
- 验证测试用例编写时间减少 30%

## 技术方案

### 1. 架构设计

```typescript
// 新的验证架构
domain/
├── expense/
│   ├── schemas/           # Zod验证模式定义
│   │   ├── user.schema.ts
│   │   ├── tenant.schema.ts
│   │   └── organization.schema.ts
│   ├── validators/        # 领域特定验证器
│   │   ├── business-rule.validator.ts
│   │   └── domain-constraint.validator.ts
│   └── entities/          # 使用验证模式的实体
```

### 2. 核心组件设计

#### 2.1 基础验证模式

```typescript
// src/domain/schemas/base.schema.ts
import { z } from "zod";

// 基础值对象验证模式
export const EntityIdSchema = z.string().uuid();
export const TenantIdSchema = z.string().uuid();
export const UserIdSchema = z.string().uuid();

// 基础验证模式
export const EmailSchema = z
  .string()
  .email("邮箱格式无效")
  .max(254, "邮箱长度不能超过254个字符");

export const UsernameSchema = z
  .string()
  .min(3, "用户名长度不能少于3个字符")
  .max(50, "用户名长度不能超过50个字符")
  .regex(/^[a-zA-Z0-9_-]+$/, "用户名只能包含字母、数字、下划线和连字符");

export const PhoneSchema = z
  .string()
  .regex(/^1[3-9]\d{9}$/, "手机号格式无效")
  .optional();
```

#### 2.2 实体验证模式

```typescript
// src/domain/schemas/user.schema.ts
import { z } from "zod";
import { EmailSchema, UsernameSchema, PhoneSchema } from "./base.schema.js";

export const UserPropsSchema = z.object({
  username: UsernameSchema,
  email: EmailSchema,
  displayName: z
    .string()
    .min(1, "显示名称不能为空")
    .max(100, "显示名称长度不能超过100个字符"),
  phone: PhoneSchema,
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING"], {
    errorMap: () => ({ message: "用户状态必须是ACTIVE、INACTIVE或PENDING" }),
  }),
  role: z.enum(["ADMIN", "USER", "GUEST"], {
    errorMap: () => ({ message: "用户角色必须是ADMIN、USER或GUEST" }),
  }),
});

export const UserCreateCommandSchema = UserPropsSchema.extend({
  departmentId: z.string().uuid(),
  tenantId: z.string().uuid(),
});

export const UserUpdateCommandSchema = UserPropsSchema.partial();

// 自动生成类型
export type UserProps = z.infer<typeof UserPropsSchema>;
export type UserCreateCommand = z.infer<typeof UserCreateCommandSchema>;
export type UserUpdateCommand = z.infer<typeof UserUpdateCommandSchema>;
```

#### 2.3 验证器基类

```typescript
// src/domain/validators/base/base.validator.ts
import { z, ZodSchema, ZodError } from "zod";

export interface ValidationResult<T = unknown> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

export interface ValidationError {
  path: string[];
  message: string;
  code: string;
}

export abstract class BaseValidator<T> {
  protected schema: ZodSchema<T>;

  constructor(schema: ZodSchema<T>) {
    this.schema = schema;
  }

  public validate(input: unknown): ValidationResult<T> {
    try {
      const data = this.schema.parse(input);
      return { success: true, data };
    } catch (error) {
      if (error instanceof ZodError) {
        return {
          success: false,
          errors: error.errors.map((err) => ({
            path: err.path,
            message: err.message,
            code: err.code,
          })),
        };
      }
      throw error;
    }
  }

  public validateOrThrow(input: unknown): T {
    return this.schema.parse(input);
  }

  public safeValidate(
    input: unknown,
  ): { success: true; data: T } | { success: false; error: ZodError } {
    return this.schema.safeParse(input);
  }
}
```

#### 2.4 领域特定验证器

```typescript
// src/domain/validators/business-rule.validator.ts
import { z } from "zod";
import { BaseValidator } from "./base/base.validator.js";

export const TenantQuotaSchema = z.object({
  maxUsers: z.number().int().min(1).max(1000000),
  maxStorage: z.number().int().min(1),
  maxApiCalls: z.number().int().min(1),
});

export class TenantQuotaValidator extends BaseValidator<
  z.infer<typeof TenantQuotaSchema>
> {
  constructor() {
    super(TenantQuotaSchema);
  }

  public validateQuotaBusinessRules(
    currentQuota: z.infer<typeof TenantQuotaSchema>,
    newQuota: z.infer<typeof TenantQuotaSchema>,
  ): ValidationResult<boolean> {
    // 验证新配额不能小于当前使用量
    const usageValidation = z.object({
      currentUsers: z.number().int().min(0).max(currentQuota.maxUsers),
      currentStorage: z.number().int().min(0).max(currentQuota.maxStorage),
      currentApiCalls: z.number().int().min(0).max(currentQuota.maxApiCalls),
    });

    try {
      // 这里可以添加复杂的业务规则验证
      if (newQuota.maxUsers < currentQuota.maxUsers) {
        return {
          success: false,
          errors: [
            {
              path: ["maxUsers"],
              message: "新用户配额不能小于当前配额",
              code: "BUSINESS_RULE_VIOLATION",
            },
          ],
        };
      }

      return { success: true, data: true };
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            path: [],
            message: "业务规则验证失败",
            code: "BUSINESS_RULE_ERROR",
          },
        ],
      };
    }
  }
}
```

### 3. 实体重构示例

```typescript
// src/domain/entities/user/user.entity.ts
import { UserPropsSchema, UserProps } from "../schemas/user.schema.js";
import { BaseValidator } from "../validators/base/base.validator.js";

export class User extends BaseEntity {
  private _username: string;
  private _email: string;
  private _displayName: string;
  private _phone?: string;
  private _status: UserStatus;
  private _role: UserRole;

  constructor(
    id: UserId,
    props: UserProps,
    auditInfo: IPartialAuditInfo,
    logger?: IPureLogger,
  ) {
    super(id, auditInfo, logger);

    // 使用Zod验证输入
    const validatedProps = UserPropsSchema.parse(props);

    this._username = validatedProps.username;
    this._email = validatedProps.email;
    this._displayName = validatedProps.displayName;
    this._phone = validatedProps.phone;
    this._status = UserStatus.create(validatedProps.status);
    this._role = UserRole.create(validatedProps.role);
  }

  public updateEmail(email: string): void {
    // 使用Zod验证
    const validatedEmail = EmailSchema.parse(email);
    this._email = validatedEmail;
    this.markModified();
  }

  public updateProfile(profile: Partial<UserProps>): void {
    // 使用部分验证模式
    const updateSchema = UserPropsSchema.partial();
    const validatedProfile = updateSchema.parse(profile);

    // 更新属性
    Object.assign(this, validatedProfile);
    this.markModified();
  }
}
```

### 4. 聚合根重构示例

```typescript
// src/domain/aggregates/tenant-aggregate.ts
import {
  TenantCreatePropsSchema,
  TenantUpdatePropsSchema,
} from "../schemas/tenant.schema.js";

export class TenantAggregate extends IsolationAwareAggregateRoot {
  constructor(
    id: EntityId,
    props: z.infer<typeof TenantCreatePropsSchema>,
    auditInfo: IPartialAuditInfo,
    logger?: IPureLogger,
  ) {
    super(id, auditInfo, logger);

    // 使用Zod验证输入
    const validatedProps = TenantCreatePropsSchema.parse(props);

    // 继续业务逻辑...
  }

  public updateTenant(
    updateProps: Partial<z.infer<typeof TenantUpdatePropsSchema>>,
  ): void {
    // 验证更新属性
    const validatedUpdate = TenantUpdatePropsSchema.parse(updateProps);

    // 执行业务逻辑...
  }
}
```

## 实施计划

### 阶段1：基础设施搭建（1-2周）

1. **安装依赖**

   ```bash
   pnpm add zod
   pnpm add -D @types/zod
   ```

2. **创建基础架构**
   - 创建 `src/domain/schemas/` 目录
   - 创建 `src/domain/validators/base/` 目录
   - 实现基础验证器和模式

3. **建立测试框架**
   - 创建验证器测试模板
   - 建立性能基准测试

### 阶段2：核心验证器迁移（2-3周）

1. **EmailValidator迁移**
   - 重构现有EmailValidator
   - 保持向后兼容性
   - 更新测试用例

2. **UsernameValidator迁移**
   - 重构用户名验证逻辑
   - 添加新的验证规则

3. **值对象验证迁移**
   - 重构EntityId、UserId等值对象验证
   - 统一ID验证逻辑

### 阶段3：实体层重构（3-4周）

1. **User实体重构**
   - 引入用户验证模式
   - 重构构造函数和更新方法
   - 更新相关测试

2. **Tenant实体重构**
   - 重构租户相关验证
   - 更新聚合根逻辑

3. **Organization实体重构**
   - 重构组织验证逻辑
   - 更新业务规则验证

### 阶段4：聚合根重构（2-3周）

1. **TenantAggregate重构**
   - 引入租户聚合验证模式
   - 重构业务规则验证

2. **UserAggregate重构**
   - 重构用户聚合验证
   - 更新事件验证逻辑

### 阶段5：清理和优化（1周）

1. **移除旧代码**
   - 删除不再使用的验证器
   - 清理重复代码

2. **性能优化**
   - 优化验证性能
   - 添加缓存机制

3. **文档更新**
   - 更新API文档
   - 更新开发指南

## 风险评估

### 技术风险

| 风险           | 概率 | 影响 | 缓解措施               |
| -------------- | ---- | ---- | ---------------------- |
| 性能下降       | 低   | 中   | 性能测试，优化关键路径 |
| 类型兼容性问题 | 中   | 高   | 渐进式迁移，充分测试   |
| 学习曲线陡峭   | 高   | 低   | 培训文档，代码示例     |

### 业务风险

| 风险             | 概率 | 影响 | 缓解措施               |
| ---------------- | ---- | ---- | ---------------------- |
| 功能回归         | 中   | 高   | 全面测试覆盖，灰度发布 |
| 开发效率暂时下降 | 高   | 中   | 培训支持，工具辅助     |
| 第三方依赖风险   | 低   | 中   | 版本锁定，备用方案     |

### 缓解策略

1. **渐进式迁移**：分阶段实施，降低风险
2. **向后兼容**：保持现有API兼容性
3. **充分测试**：建立完整的测试覆盖
4. **回滚计划**：准备快速回滚方案

## 预期收益

### 短期收益（1-3个月）

- **代码质量提升**：减少验证相关bug 30%
- **开发效率提升**：新功能开发时间减少 20%
- **类型安全增强**：编译时错误减少 50%

### 中期收益（3-6个月）

- **维护成本降低**：验证逻辑维护时间减少 40%
- **测试覆盖率提升**：验证测试覆盖率从 80% 提升到 95%
- **代码复用性提升**：验证模式复用率提升 60%

### 长期收益（6个月以上）

- **架构一致性**：统一的验证架构
- **团队效率**：新成员上手时间减少 30%
- **系统稳定性**：运行时错误减少 40%

## 附录

### A. 依赖管理

```json
{
  "dependencies": {
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/zod": "^3.22.0"
  }
}
```

### B. 性能基准

```typescript
// 性能测试示例
import { benchmark } from "benchmark";

const emailValidator = new EmailValidator();
const zodValidator = z.string().email();

benchmark("EmailValidator.validate", () => {
  emailValidator.validate("test@example.com");
});

benchmark("Zod.email", () => {
  zodValidator.parse("test@example.com");
});
```

### C. 迁移检查清单

- [ ] 安装Zod依赖
- [ ] 创建基础验证架构
- [ ] 迁移EmailValidator
- [ ] 迁移UsernameValidator
- [ ] 重构User实体
- [ ] 重构Tenant实体
- [ ] 重构聚合根
- [ ] 更新测试用例
- [ ] 性能测试
- [ ] 文档更新

### D. 相关资源

- [Zod官方文档](https://zod.dev/)
- [TypeScript验证最佳实践](https://typescript-eslint.io/rules/prefer-optional-chain/)
- [DDD验证模式](https://martinfowler.com/articles/domain-oriented-observability.html)

---

**文档版本**: 1.0  
**最后更新**: 2024年12月  
**审核状态**: 待审核  
**实施状态**: 计划中
