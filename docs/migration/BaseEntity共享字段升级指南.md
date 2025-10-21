# BaseEntity 共享字段升级指南

## 📋 概述

本文档指导您如何将现有的 `BaseEntity` 子类升级为支持数据共享功能的新版本。新增的共享字段完全符合项目宪章中的数据分类规则。

## 🆕 新增功能

### 共享字段

根据项目宪章中的数据分类规则，新增了两个共享相关字段：

- `isShared: boolean` - 是否为共享数据
- `sharingLevel?: SharingLevel` - 共享级别

### 数据分类支持

- **共享数据（Shared Data）**：可以在特定层级内被所有下级访问
- **非共享数据（Non-Shared Data）**：仅限特定层级访问，不可跨层级访问

---

## 🔄 迁移步骤

### 步骤1：更新子类构造函数

#### 旧代码

```typescript
export class User extends BaseEntity {
  constructor(
    id: UserId,
    tenantId: TenantId,
    private name: string,
    private email: string,
    organizationId?: OrganizationId,
    departmentId?: DepartmentId,
    auditInfo?: Partial<AuditInfo>
  ) {
    super(id, tenantId, organizationId, departmentId, undefined, auditInfo);
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
    isShared: boolean = false,
    sharingLevel?: SharingLevel,
    auditInfo?: Partial<AuditInfo>
  ) {
    super(id, tenantId, organizationId, departmentId, undefined, isShared, sharingLevel, auditInfo);
  }
}
```

### 步骤2：更新实体创建代码

#### 创建私有数据（默认行为）

```typescript
// 私有数据 - 默认行为，无需额外参数
const privateUser = new User(
  UserId.generate(),
  TenantId.create('tenant-123'),
  '张三',
  'zhangsan@example.com'
);
// isShared = false, sharingLevel = undefined
```

#### 创建共享数据

```typescript
// 租户级共享数据
const tenantSharedUser = new User(
  UserId.generate(),
  TenantId.create('tenant-123'),
  '李四',
  'lisi@example.com',
  undefined,
  undefined,
  true, // 标记为共享数据
  SharingLevel.TENANT // 租户级共享
);

// 组织级共享数据
const orgSharedUser = new User(
  UserId.generate(),
  TenantId.create('tenant-123'),
  '王五',
  'wangwu@example.com',
  OrganizationId.create('org-456'),
  undefined,
  true, // 标记为共享数据
  SharingLevel.ORGANIZATION // 组织级共享
);
```

### 步骤3：使用新的共享检查方法

```typescript
export class UserService {
  async processUser(user: User): Promise<void> {
    // 检查是否为共享数据
    if (user.isSharedData()) {
      console.log(`共享数据: ${user.getSharingScopeDescription()}`);
      await this.processSharedUser(user);
    } else {
      console.log('私有数据，仅限所有者访问');
      await this.processPrivateUser(user);
    }

    // 检查共享级别
    if (user.sharingLevel === SharingLevel.TENANT) {
      // 处理租户级共享逻辑
      await this.processTenantSharedData(user);
    }
  }
}
```

---

## 🎯 使用场景示例

### 场景1：公告系统

```typescript
export class Announcement extends BaseEntity {
  constructor(
    id: AnnouncementId,
    tenantId: TenantId,
    private title: string,
    private content: string,
    organizationId?: OrganizationId,
    departmentId?: DepartmentId,
    isShared: boolean = false,
    sharingLevel?: SharingLevel,
    auditInfo?: Partial<AuditInfo>
  ) {
    super(id, tenantId, organizationId, departmentId, undefined, isShared, sharingLevel, auditInfo);
  }
}

// 创建租户级共享公告
const tenantAnnouncement = new Announcement(
  AnnouncementId.generate(),
  TenantId.create('tenant-123'),
  '重要通知',
  '系统维护通知...',
  undefined,
  undefined,
  true, // 共享数据
  SharingLevel.TENANT // 租户内所有用户可见
);

// 创建部门级私有公告
const deptAnnouncement = new Announcement(
  AnnouncementId.generate(),
  TenantId.create('tenant-123'),
  '部门内部通知',
  '部门会议通知...',
  OrganizationId.create('org-456'),
  DepartmentId.create('dept-789')
  // 默认私有数据
);
```

### 场景2：文档系统

```typescript
export class Document extends BaseEntity {
  constructor(
    id: DocumentId,
    tenantId: TenantId,
    private name: string,
    private content: string,
    organizationId?: OrganizationId,
    departmentId?: DepartmentId,
    isShared: boolean = false,
    sharingLevel?: SharingLevel,
    auditInfo?: Partial<AuditInfo>
  ) {
    super(id, tenantId, organizationId, departmentId, undefined, isShared, sharingLevel, auditInfo);
  }
}

// 创建组织级共享文档
const sharedDocument = new Document(
  DocumentId.generate(),
  TenantId.create('tenant-123'),
  '组织章程',
  '组织章程内容...',
  OrganizationId.create('org-456'),
  undefined,
  true, // 共享数据
  SharingLevel.ORGANIZATION // 组织内所有部门可见
);

// 创建私有文档
const privateDocument = new Document(
  DocumentId.generate(),
  TenantId.create('tenant-123'),
  '个人笔记',
  '个人笔记内容...',
  undefined,
  undefined
  // 默认私有数据
);
```

---

## 🔍 验证和测试

### 共享字段验证测试

```typescript
describe('BaseEntity Sharing Fields', () => {
  it('should create private data by default', () => {
    const user = new User(
      UserId.generate(),
      TenantId.create('tenant-123'),
      '张三',
      'zhangsan@example.com'
    );
    
    expect(user.isShared).toBe(false);
    expect(user.sharingLevel).toBeUndefined();
    expect(user.isPrivateData()).toBe(true);
    expect(user.isSharedData()).toBe(false);
  });

  it('should create shared data with sharing level', () => {
    const user = new User(
      UserId.generate(),
      TenantId.create('tenant-123'),
      '李四',
      'lisi@example.com',
      undefined,
      undefined,
      true,
      SharingLevel.TENANT
    );
    
    expect(user.isShared).toBe(true);
    expect(user.sharingLevel).toBe(SharingLevel.TENANT);
    expect(user.isPrivateData()).toBe(false);
    expect(user.isSharedData()).toBe(true);
    expect(user.getSharingScopeDescription()).toContain('租户级共享');
  });

  it('should validate sharing level compatibility', () => {
    expect(() => {
      new User(
        UserId.generate(),
        TenantId.create('tenant-123'),
        '王五',
        'wangwu@example.com',
        OrganizationId.create('org-456'),
        DepartmentId.create('dept-789'),
        true,
        SharingLevel.PLATFORM // 错误：部门级数据不能设置为平台级共享
      );
    }).toThrow('Sharing level \'platform\' is not compatible with entity level \'department\'');
  });

  it('should require sharing level for shared data', () => {
    expect(() => {
      new User(
        UserId.generate(),
        TenantId.create('tenant-123'),
        '赵六',
        'zhaoliu@example.com',
        undefined,
        undefined,
        true // 错误：共享数据必须指定共享级别
      );
    }).toThrow('Shared data must specify sharing level');
  });
});
```

---

## 📝 迁移检查清单

### ✅ 代码更新检查

- [ ] **构造函数签名更新**：所有子类构造函数已添加共享字段参数
- [ ] **实体创建代码更新**：共享数据创建时正确设置参数
- [ ] **导入语句更新**：添加了 `SharingLevel` 枚举导入
- [ ] **业务逻辑更新**：使用了新的共享检查方法

### ✅ 测试更新检查

- [ ] **单元测试更新**：所有测试用例已更新为新的构造函数
- [ ] **共享功能测试**：添加了共享字段相关的测试用例
- [ ] **验证测试**：添加了共享级别兼容性验证测试

### ✅ 文档更新检查

- [ ] **API文档更新**：更新了实体类的API文档
- [ ] **使用示例更新**：更新了代码示例展示共享数据用法
- [ ] **业务规则文档**：更新了数据分类和共享规则文档

---

## 🚨 常见问题

### Q1: 如何处理现有的实体实例？

**A**: 现有实体默认为私有数据，无需修改：

```typescript
// 现有代码无需修改，默认为私有数据
const existingUser = new User(id, tenantId, name, email);
// isShared = false (默认值)
// sharingLevel = undefined (默认值)
```

### Q2: 如何将现有数据转换为共享数据？

**A**: 需要重新创建实体实例：

```typescript
// 将私有数据转换为共享数据
const privateUser = new User(id, tenantId, name, email);
const sharedUser = new User(
  privateUser.id,
  privateUser.tenantId,
  privateUser.name,
  privateUser.email,
  privateUser.organizationId,
  privateUser.departmentId,
  true, // 标记为共享
  SharingLevel.TENANT // 设置共享级别
);
```

### Q3: 如何验证共享级别与隔离级别的兼容性？

**A**: BaseEntity 会自动验证：

```typescript
// 错误示例：部门级数据不能设置为平台级共享
try {
  new User(
    id, tenantId, name, email,
    orgId, deptId,
    true, SharingLevel.PLATFORM // 会抛出错误
  );
} catch (error) {
  console.log(error.message); // "Sharing level 'platform' is not compatible with entity level 'department'"
}
```

---

## 📚 相关文档

- [BaseEntity多层级隔离升级指南](./BaseEntity多层级隔离升级指南.md)
- [多层级数据隔离数据库设计指南](../database/多层级数据隔离数据库设计指南.md)
- [SAAS平台数据隔离机制培训文档](../training/SAAS平台数据隔离机制培训文档.md)
- [项目宪章数据分类规则](../../.specify/memory/constitution.md#数据分类)

---

## 🎯 总结

通过这次升级，`BaseEntity` 现在完全支持数据共享功能：

1. **完整的共享字段支持**：isShared 和 sharingLevel
2. **自动验证机制**：共享级别与隔离级别的兼容性验证
3. **便捷检查方法**：isSharedData()、isPrivateData()、getSharingScopeDescription()
4. **符合项目宪章**：完全遵循数据分类规则

升级完成后，您的实体将能够：

- 支持共享数据和私有数据的区分
- 自动验证共享级别的合理性
- 提供丰富的共享状态检查方法
- 与数据隔离机制完美配合

---

*最后更新：2024年1月*
