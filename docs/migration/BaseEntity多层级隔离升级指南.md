# BaseEntity 多层级隔离升级指南

## 📋 概述

本文档指导您如何将现有的 `BaseEntity` 子类升级为支持多层级数据隔离的新版本。

## 🚨 重要变更

### 构造函数签名变更

**旧版本**：

```typescript
protected constructor(id: TId, auditInfo: IPartialAuditInfo)
```

**新版本**：

```typescript
protected constructor(
  id: TId,
  tenantId: TenantId,           // 新增：必填
  organizationId?: OrganizationId, // 新增：可选
  departmentId?: DepartmentId,    // 新增：可选
  userId?: UserId,               // 新增：可选
  auditInfo?: IPartialAuditInfo  // 改为可选
)
```

### 新增属性

- `organizationId?: EntityId` - 组织级隔离字段
- `departmentId?: EntityId` - 部门级隔离字段
- `userId?: EntityId` - 用户级隔离字段

### 新增方法

- `getIsolationLevel(): string` - 获取实体隔离级别
- `isTenantLevel(): boolean` - 检查是否为租户级
- `isOrganizationLevel(): boolean` - 检查是否为组织级
- `isDepartmentLevel(): boolean` - 检查是否为部门级
- `isUserLevel(): boolean` - 检查是否为用户级
- `isPlatformLevel(): boolean` - 检查是否为平台级

---

## 🔄 迁移步骤

### 步骤1：更新子类构造函数

#### 旧代码

```typescript
export class User extends BaseEntity {
  constructor(
    id: UserId,
    private name: string,
    private email: string,
    auditInfo: IPartialAuditInfo,
  ) {
    super(id, auditInfo);
  }
}
```

#### 新代码

```typescript
export class User extends BaseEntity {
  constructor(
    id: UserId,
    tenantId: TenantId,
    private name: string,
    private email: string,
    organizationId?: OrganizationId,
    departmentId?: DepartmentId,
    auditInfo?: IPartialAuditInfo,
  ) {
    super(id, tenantId, organizationId, departmentId, undefined, auditInfo);
  }
}
```

### 步骤2：更新实体创建代码

#### 旧代码

```typescript
const user = new User(UserId.generate(), "张三", "zhangsan@example.com", {
  createdBy: "system",
  tenantId: TenantId.create("tenant-123"),
});
```

#### 新代码

```typescript
// 租户级用户
const tenantUser = new User(
  UserId.generate(),
  TenantId.create("tenant-123"),
  "张三",
  "zhangsan@example.com",
);

// 组织级用户
const orgUser = new User(
  UserId.generate(),
  TenantId.create("tenant-123"),
  "李四",
  "lisi@example.com",
  OrganizationId.create("org-456"),
);

// 部门级用户
const deptUser = new User(
  UserId.generate(),
  TenantId.create("tenant-123"),
  "王五",
  "wangwu@example.com",
  OrganizationId.create("org-456"),
  DepartmentId.create("dept-789"),
);
```

### 步骤3：更新业务逻辑

#### 使用隔离级别检查

```typescript
export class UserService {
  async processUser(user: User): Promise<void> {
    // 根据隔离级别执行不同的业务逻辑
    if (user.isTenantLevel()) {
      await this.processTenantUser(user);
    } else if (user.isOrganizationLevel()) {
      await this.processOrganizationUser(user);
    } else if (user.isDepartmentLevel()) {
      await this.processDepartmentUser(user);
    }
  }
}
```

#### 使用隔离字段进行查询

```typescript
export class UserRepository {
  async findByContext(context: IsolationContext): Promise<User[]> {
    const users = await this.findAll();

    return users.filter((user) => {
      // 根据隔离上下文过滤用户
      if (context.isTenantLevel()) {
        return user.tenantId.equals(context.tenantId!);
      }

      if (context.isOrganizationLevel()) {
        return (
          user.tenantId.equals(context.tenantId!) &&
          user.organizationId?.equals(context.organizationId!)
        );
      }

      if (context.isDepartmentLevel()) {
        return (
          user.tenantId.equals(context.tenantId!) &&
          user.organizationId?.equals(context.organizationId!) &&
          user.departmentId?.equals(context.departmentId!)
        );
      }

      return true;
    });
  }
}
```

---

## 📝 迁移检查清单

### ✅ 代码更新检查

- [ ] **构造函数签名更新**：所有子类构造函数已更新为新签名
- [ ] **实体创建代码更新**：所有实体实例化代码已更新
- [ ] **导入语句更新**：添加了必要的ID类型导入
- [ ] **业务逻辑更新**：使用了新的隔离级别检查方法

### ✅ 测试更新检查

- [ ] **单元测试更新**：所有测试用例已更新为新的构造函数
- [ ] **集成测试更新**：集成测试中的实体创建已更新
- [ ] **隔离测试添加**：添加了隔离级别相关的测试用例

### ✅ 文档更新检查

- [ ] **API文档更新**：更新了实体类的API文档
- [ ] **使用示例更新**：更新了代码示例和教程
- [ ] **架构文档更新**：更新了架构设计文档

---

## 🧪 测试用例示例

### 隔离级别测试

```typescript
describe("BaseEntity Isolation Levels", () => {
  it("should create tenant-level entity", () => {
    const user = new User(
      UserId.generate(),
      TenantId.create("tenant-123"),
      "张三",
      "zhangsan@example.com",
    );

    expect(user.getIsolationLevel()).toBe("tenant");
    expect(user.isTenantLevel()).toBe(true);
    expect(user.organizationId).toBeUndefined();
    expect(user.departmentId).toBeUndefined();
  });

  it("should create organization-level entity", () => {
    const user = new User(
      UserId.generate(),
      TenantId.create("tenant-123"),
      "李四",
      "lisi@example.com",
      OrganizationId.create("org-456"),
    );

    expect(user.getIsolationLevel()).toBe("organization");
    expect(user.isOrganizationLevel()).toBe(true);
    expect(user.organizationId).toBeDefined();
    expect(user.departmentId).toBeUndefined();
  });

  it("should create department-level entity", () => {
    const user = new User(
      UserId.generate(),
      TenantId.create("tenant-123"),
      "王五",
      "wangwu@example.com",
      OrganizationId.create("org-456"),
      DepartmentId.create("dept-789"),
    );

    expect(user.getIsolationLevel()).toBe("department");
    expect(user.isDepartmentLevel()).toBe(true);
    expect(user.organizationId).toBeDefined();
    expect(user.departmentId).toBeDefined();
  });

  it("should validate isolation hierarchy", () => {
    expect(() => {
      new User(
        UserId.generate(),
        TenantId.create("tenant-123"),
        "测试用户",
        "test@example.com",
        undefined,
        DepartmentId.create("dept-789"), // 错误：部门级必须有组织
      );
    }).toThrow("Department level data must have organization ID");
  });
});
```

### 数据序列化测试

```typescript
describe("BaseEntity Data Serialization", () => {
  it("should serialize with all isolation fields", () => {
    const user = new User(
      UserId.generate(),
      TenantId.create("tenant-123"),
      "张三",
      "zhangsan@example.com",
      OrganizationId.create("org-456"),
      DepartmentId.create("dept-789"),
    );

    const data = user.toData();

    expect(data.tenantId).toBe("tenant-123");
    expect(data.organizationId).toBe("org-456");
    expect(data.departmentId).toBe("dept-789");
    expect(data.userId).toBeUndefined();
  });
});
```

---

## 🚨 常见问题

### Q1: 如何处理现有的实体实例？

**A**: 需要为现有实体添加默认的隔离字段值：

```typescript
// 迁移脚本示例
async function migrateExistingEntities() {
  const users = await userRepository.findAll();

  for (const user of users) {
    // 为现有用户分配默认租户
    if (!user.tenantId) {
      user.tenantId = TenantId.create("default-tenant");
    }

    await userRepository.save(user);
  }
}
```

### Q2: 如何处理跨租户的数据？

**A**: 需要重新设计数据模型，确保每个实体都有明确的隔离级别：

```typescript
// 错误：跨租户数据
const sharedData = {
  tenantId: null, // 不允许
  organizationId: null,
  departmentId: null,
};

// 正确：平台级数据
const platformData = {
  tenantId: null,
  organizationId: null,
  departmentId: null,
  // 明确标记为平台级数据
  isolationLevel: "platform",
};
```

### Q3: 如何保持向后兼容性？

**A**: 可以创建兼容性包装器：

```typescript
// 兼容性包装器
export class LegacyUserWrapper extends BaseEntity {
  constructor(
    id: UserId,
    private name: string,
    private email: string,
    auditInfo: IPartialAuditInfo,
  ) {
    // 从auditInfo中提取tenantId
    const tenantId = auditInfo.tenantId || TenantId.create("default-tenant");
    super(id, tenantId, undefined, undefined, undefined, auditInfo);
  }
}
```

---

## 📚 相关文档

- [多层级数据隔离数据库设计指南](../database/多层级数据隔离数据库设计指南.md)
- [SAAS平台数据隔离机制培训文档](../training/SAAS平台数据隔离机制培训文档.md)
- [数据隔离表设计检查清单](../database/数据隔离表设计检查清单.md)

---

## 🎯 总结

通过这次升级，`BaseEntity` 现在完全支持多层级数据隔离：

1. **完整的隔离字段支持**：tenantId、organizationId、departmentId、userId
2. **层级依赖验证**：自动验证隔离字段的层级依赖关系
3. **隔离级别检查**：提供便捷的隔离级别检查方法
4. **向后兼容性**：通过合理的迁移策略保持兼容性

升级完成后，您的实体将能够：

- 支持多层级数据隔离
- 自动验证隔离字段的完整性
- 提供丰富的隔离级别检查方法
- 与数据库表设计完美匹配

---

_最后更新：2024年1月_
