# Domain-Kernel Usage Requirement Analysis

> **日期**: 2025-01-27  
> **目的**: 分析架构文档是否明确要求优先使用 domain-kernel 的组件

---

## 📋 分析总结

### 结论

**架构文档并没有明确、直接地要求优先使用 `libs/domain-kernel` 的组件**，但通过代码示例和最佳实践示例，**隐含地推荐使用基类**。

---

## 🔍 详细分析

### 1. 文档中的基类定义位置

#### 1.1 架构文档中的定义

在以下文档中，基类都在**文档内部定义**，而不是引用 `libs/domain-kernel`：

**`docs/architecture/02-core-layers-detailed-design.md`**:

```typescript
// 在文档内部定义
export abstract class BaseEntity { ... }
export abstract class AggregateRoot extends BaseEntity { ... }
export abstract class BaseValueObject { ... }
export abstract class EntityId extends BaseValueObject { ... }
```

**`docs/architecture/04-1-best-practices-overview.md`**:

```typescript
// 代码示例中使用，但没有明确说明来源
export class User extends BaseEntity { ... }
export class User extends AggregateRoot { ... }
export class Email extends BaseValueObject { ... }
```

#### 1.2 业务模块开发指南

**`docs/architecture/03-business-module-development-guide.md`**:

- 第 200 行提到依赖 `@hl8/domain-kernel`
- 但**没有明确说明**要使用其中的基类和值对象
- 文档中的代码示例使用了基类，但**没有导入语句**

---

### 2. IsolationContext 的使用

#### 2.1 在代码示例中的使用

文档中广泛使用了 `IsolationContext`:

**`docs/architecture/02-core-layers-detailed-design.md`**:

```typescript
protected constructor(protected readonly context: IsolationContext) {}
public validate(context: IsolationContext): BusinessRuleValidationResult { ... }
```

**`docs/architecture/03-business-module-development-guide.md`**:

```typescript
private readonly isolationContext: IsolationContext,
tenantId: this.isolationContext.tenantId.value,
```

#### 2.2 但缺少明确导入

所有代码示例都**没有显示导入语句**：

```typescript
// 缺少明确的导入
import { IsolationContext } from "@hl8/domain-kernel";
```

---

### 3. 缺失的明确指导

#### 3.1 应该有的指导（但缺失）

1. **明确的推荐语句**:
   > "业务模块开发时，应优先使用 `@hl8/domain-kernel` 提供的基类、值对象和数据隔离机制"

2. **导入示例**:

   ```typescript
   import { BaseEntity, AggregateRoot, BaseValueObject } from "@hl8/domain-kernel";
   import { IsolationContext, SharingLevel } from "@hl8/domain-kernel";
   import { TenantId, OrganizationId, DepartmentId, UserId } from "@hl8/domain-kernel";
   ```

3. **对比说明**:
   > "优先使用 domain-kernel 中定义的 ID 值对象（TenantId, OrganizationId 等），而不是在业务模块中重新定义"

4. **数据隔离使用指导**:
   > "所有涉及多租户数据访问的操作都应使用 IsolationContext 进行隔离"

---

## 📊 实际影响

### 1. 当前问题

由于文档**缺乏明确的指导**，导致：

1. **重复定义**: `libs/saas-core` 中重复定义了 `TenantId`、`OrganizationId`、`DepartmentId` 等
2. **IsolationContext 重复**: 定义了本地的 `isolation-context.vo.ts`
3. **基类不一致**: 可能使用不同版本的基类实现

### 2. 已经修复的问题

我们已经通过以下方式修复了这些问题：

1. ✅ 删除重复的 ID 值对象定义
2. ✅ 统一使用 `libs/domain-kernel` 的组件
3. ✅ 迁移 IsolationContext 到 domain-kernel 标准

### 3. 待改进

1. ⚠️ **更新架构文档**: 在文档中明确要求使用 domain-kernel
2. ⚠️ **添加导入示例**: 在代码示例中包含完整的导入语句
3. ⚠️ **添加对比说明**: 说明为什么应该使用 domain-kernel

---

## 💡 建议

### 1. 文档改进建议

#### 1.1 在 `03-business-module-development-guide.md` 中添加一节

```markdown
### 3.3 优先使用 domain-kernel 组件

业务模块开发时，应优先使用 `@hl8/domain-kernel` 提供的以下组件：

#### 3.3.1 基类

```typescript
import { BaseEntity, AggregateRoot, BaseValueObject } from "@hl8/domain-kernel";
```

所有领域实体应继承 `BaseEntity` 或 `AggregateRoot`，值对象应继承 `BaseValueObject`。

#### 3.3.2 ID 值对象

```typescript
import { 
  TenantId, 
  OrganizationId, 
  DepartmentId, 
  UserId,
  GenericEntityId 
} from "@hl8/domain-kernel";
```

所有实体 ID 应使用 domain-kernel 提供的 ID 值对象，而不是重新定义。

#### 3.3.3 数据隔离机制

```typescript
import { IsolationContext, SharingLevel } from "@hl8/domain-kernel";
```

所有涉及多租户数据访问的操作都应使用 `IsolationContext` 进行隔离。

```

#### 1.2 在 `02-core-layers-detailed-design.md` 中添加导入示例：

```typescript
import { BaseEntity } from "@hl8/domain-kernel";

export class User extends BaseEntity {
  // ...
}
```

#### 1.3 在 README.md 中添加提示

```markdown
## 重要提示

业务模块开发时，应优先使用 `@hl8/domain-kernel` 提供的基类、值对象和数据隔离机制，而不是重新定义。

详见：[业务模块开发指南](docs/architecture/03-business-module-development-guide.md)
```

---

## 📝 总结

### 当前状态

- ❌ 架构文档**没有明确**要求优先使用 domain-kernel
- ✅ 但通过代码示例**隐含**推荐使用基类
- ❌ 文档中**缺少完整的导入语句**示例
- ❌ 文档中**没有说明**为什么要使用 domain-kernel

### 建议行动

1. **短期**: 在 README 和开发指南中添加明确的使用指导
2. **中期**: 更新所有代码示例，添加完整的导入语句
3. **长期**: 建立代码审查流程，确保新代码遵循这些指导

---

## 🔗 相关文档

- `docs/architecture/02-core-layers-detailed-design.md` - 核心层详细设计
- `docs/architecture/03-business-module-development-guide.md` - 业务模块开发指南
- `docs/architecture/04-1-best-practices-overview.md` - 最佳实践概述
- `libs/domain-kernel/README.md` - domain-kernel 使用说明

---

**结论**: 文档**缺乏明确的指导**，建议在文档中明确添加使用 domain-kernel 的要求和示例。
