# ID Value Object Unification - Progress Report

> **日期**: 2025-01-27  
> **状态**: 进行中

---

## 📋 概述

已完成 ID 值对象的统一，从重复的本地定义迁移到统一的 `@hl8/domain-kernel` 定义。

---

## ✅ 已完成的工作

### 1. Domain Kernel 扩展

**在 `@hl8/domain-kernel` 添加 RoleId**:
- ✅ 创建 `libs/domain-kernel/src/value-objects/ids/role-id.vo.ts`
- ✅ 在 `libs/domain-kernel/src/index.ts` 中导出
- ✅ 编译成功

### 2. 删除重复定义

**删除 saas-core 中的本地 ID 值对象**:
- ✅ `tenant-id.vo.ts`
- ✅ `organization-id.vo.ts`
- ✅ `department-id.vo.ts`
- ✅ `user-id.vo.ts`
- ✅ `role-id.vo.ts`

### 3. 更新导入语句

**批量更新所有导入**:
- ✅ 46 个文件已更新
- ✅ 统一使用 `import { ... } from "@hl8/domain-kernel"`

### 4. 修复构造函数调用

**迁移到静态工厂方法**:
- ✅ `new TenantId(...)` → `TenantId.create(...)`
- ✅ `new UserId(...)` → `UserId.create(...)` (部分修复)
- ⚠️ 剩余需要修复的地方

---

## 📊 当前状态

### 编译错误变化

- **开始**: 1077 个错误
- **删除重复定义后**: 1307 个错误（增加原因：删除文件导致临时引用错误）
- **更新导入后**: 约 1200 个错误
- **目标**: 0 个错误

### 主要剩余问题

1. **构造函数调用**:
   - 约 20 个 `new UserId(...)` 需要改为 `UserId.create(...)`
   - 约 10 个 `new TenantId(...)` 需要改为 `TenantId.create(...)`

2. **实体构造函数参数**:
   - BaseEntity 构造函数需要多层级隔离参数
   - 约 200 个实体需要修复构造函数

3. **聚合根事件发布**:
   - OrganizationAggregate 需要迁移到 `apply(createDomainEvent(...))`
   - DepartmentAggregate 需要迁移到 `apply(createDomainEvent(...))`

4. **其他类型不兼容**:
   - 约 500 个其他类型错误需要修复

---

## 🎯 下一步计划

### 优先级 1: 修复构造函数调用

**任务**:
- [ ] 修复所有 `new UserId(...)` 为 `UserId.create(...)`
- [ ] 修复所有 `new TenantId(...)` 为 `TenantId.create(...)`
- [ ] 修复所有 `new OrganizationId(...)` 为 `OrganizationId.create(...)`
- [ ] 修复所有 `new DepartmentId(...)` 为 `DepartmentId.create(...)`
- [ ] 修复所有 `new RoleId(...)` 为 `RoleId.create(...)`

**估计时间**: 2-4 小时

### 优先级 2: 修复实体构造函数

**任务**:
- [ ] 更新所有实体使用新的 BaseEntity 构造函数签名
- [ ] 添加多层级隔离参数

**估计时间**: 4-8 小时

### 优先级 3: 修复聚合根事件发布

**任务**:
- [ ] OrganizationAggregate 迁移到 `apply(createDomainEvent(...))`
- [ ] DepartmentAggregate 迁移到 `apply(createDomainEvent(...))`

**估计时间**: 2-4 小时

---

## 📝 技术细节

### ID 值对象工厂方法

所有 kernel ID 值对象使用静态工厂方法：

```typescript
// ❌ 错误方式（构造函数私有）
const tenantId = new TenantId("tenant-123");

// ✅ 正确方式（使用工厂方法）
const tenantId = TenantId.create("tenant-123");

// ✅ 生成新 ID
const newTenantId = TenantId.generate();
```

### 统一导入

```typescript
// ✅ 统一从 @hl8/domain-kernel 导入
import {
  TenantId,
  OrganizationId,
  DepartmentId,
  UserId,
  RoleId,
  GenericEntityId
} from "@hl8/domain-kernel";
```

---

## 💡 关键教训

1. **避免重复定义**: 应该从一开始就使用 kernel 的定义
2. **静态工厂方法**: 确保类型安全和一致性
3. **批量重构**: 使用脚本批量更新导入可以提高效率

---

## 🔗 相关文件

- `libs/domain-kernel/src/value-objects/ids/` - ID 值对象定义
- `libs/domain-kernel/src/index.ts` - 导出入口
- `libs/saas-core/KERNEL_ALIGNMENT_ISSUES.md` - 对齐问题分析
