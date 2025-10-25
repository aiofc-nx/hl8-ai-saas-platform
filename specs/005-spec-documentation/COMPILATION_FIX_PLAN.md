# 编译错误修复计划

> **错误总数**: 1202 个 TypeScript 错误  
> **预计时间**: 8-16 小时  
> **优先级**: P0（阻塞性）

---

## 错误分类统计

### 主要错误类型

1. **构造函数签名不匹配** (~400 个)
   - BaseEntity 构造函数参数过多
   - 隔离上下文参数问题

2. **ID 值对象类型问题** (~200 个)
   - 私有属性访问
   - 类型不兼容

3. **缺少属性/方法** (~300 个)
   - domain 属性
   - getResourceLimits 方法
   - createTenant 方法

4. **事件类型问题** (~200 个)
   - 事件构造函数
   - 泛型约束

5. **实体继承问题** (~100 个)
   - BaseEntity 继承
   - 私有属性冲突

---

## 修复策略

### 阶段 1: 基础修复（4-6 小时）

#### 1.1 修复 ID 值对象使用

```typescript
// 错误用法
const id = new TenantId(value); // 构造函数是 private

// 正确用法
const id = TenantId.create(value); // 使用静态工厂方法
```

#### 1.2 修复 BaseEntity 构造

```typescript
// 错误的构造方式
const entity = new Entity(id, tenantId, {...data}, {...audit});

// 正确的构造方式（BaseEntity 标准签名）
const entity = new Entity(
  id,
  tenantId,          // 必填
  organizationId,    // 可选
  departmentId,      // 可选
  userId,            // 可选
  isShared,          // 可选
  sharingLevel,      // 可选
  auditInfo          // 可选
);
```

#### 1.3 修复 IsolationContext 使用

```typescript
// 错误用法
IsolationContext.createTenantLevel(tenantId);

// 正确用法
IsolationContext.tenant(tenantId);
```

### 阶段 2: 实体修复（3-4 小时）

#### 2.1 修复 Tenant 实体

- 添加 `domain` 属性（如果需要）
- 修复构造函数
- 移除 `usercode` 等不存在的属性

#### 2.2 修复 Department 实体

- 解决私有属性冲突
- 修复 BaseEntity 继承

#### 2.3 修复 Platform 实体

- 修复 PlatformId 类型约束
- 修正构造函数

### 阶段 3: 聚合根修复（2-3 小时）

#### 3.1 修复 TenantAggregate

- 添加 `createTenant` 方法
- 修复业务逻辑

#### 3.2 修复事件发布

- 使用 `apply` 方法替代 `createDomainEvent`
- 修复事件类型

### 阶段 4: 应用层修复（2-3 小时）

#### 4.1 修复 Handlers

- 修复构造函数调用
- 修正 ID 创建方式

#### 4.2 修复 Use Cases

- 修复 PlatformId 创建
- 修正 IsolationContext 使用

---

## 具体修复步骤

### 步骤 1: 修复 ID 值对象（优先处理）

查找所有 `new TenantId(...)` 替换为 `TenantId.create(...)`

```bash
# 查找需要修复的文件
grep -r "new TenantId(" libs/saas-core/src/
grep -r "new OrganizationId(" libs/saas-core/src/
grep -r "new DepartmentId(" libs/saas-core/src/
grep -r "new UserId(" libs/saas-core/src/
grep -r "new PlatformId(" libs/saas-core/src/
```

### 步骤 2: 修复 BaseEntity 构造

每个实体类需要：

1. 确保继承 `BaseEntity<EntityId>`
2. 构造函数调用 `super()` 时传入正确的参数顺序
3. 移除多余的参数

### 步骤 3: 修复 TenantType

如果需要 `getResourceLimits` 方法：

- 选项 A: 添加方法到 TenantType 类
- 选项 B: 创建静态映射表

### 步骤 4: 修复事件

所有领域事件需要：

1. 继承 `DomainEvent<TData>`
2. 实现必要的抽象方法
3. 使用 `eventData` 属性

---

## 自动化修复工具

创建脚本批量修复常见问题：

```typescript
// scripts/fix-compilation-errors.ts
// 1. 替换所有 new XXXId() 为 XXXId.create()
// 2. 批量修复 BaseEntity 构造
// 3. 添加缺失的属性
```

---

## 验证步骤

修复每个阶段后：

```bash
cd libs/saas-core
pnpm run build
# 检查错误数量是否减少
```

目标: 错误数量从 1202 → 0

---

## 注意事项

1. **不要破坏现有业务逻辑**
2. **保持与 kernel 的对齐**
3. **每次修复后测试**
4. **提交小粒度提交**

---

## 时间估算

- 阶段 1: 4-6 小时
- 阶段 2: 3-4 小时  
- 阶段 3: 2-3 小时
- 阶段 4: 2-3 小时
- **总计**: 11-16 小时
