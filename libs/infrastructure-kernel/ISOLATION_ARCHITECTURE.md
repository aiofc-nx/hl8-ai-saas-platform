# 统一隔离架构设计

## 🎯 架构目标

通过彻底重构，消除重复实现，建立清晰的隔离架构层次。

## 🏗️ 统一架构

### 1. **领域层 (Domain Layer)**

```
@hl8/domain-kernel
├── IsolationContext (核心实体)
├── IsolationLevel (枚举)
├── SharingLevel (枚举)
├── TenantId, OrganizationId, DepartmentId, UserId (值对象)
└── IsolationValidationError (领域错误)
```

**职责**：

- 定义隔离业务规则
- 提供核心隔离上下文实体
- 实现权限验证逻辑

### 2. **NestJS 集成层 (Framework Layer)**

```
@hl8/nestjs-isolation
├── IsolationContextService (请求级上下文管理)
├── MultiLevelIsolationService (权限验证)
├── IsolationGuard (路由守卫)
├── @CurrentContext() (装饰器)
└── IsolationExtractionMiddleware (中间件)
```

**职责**：

- 提供 NestJS 框架集成
- 管理请求级隔离上下文
- 实现装饰器和守卫

### 3. **基础设施层 (Infrastructure Layer)**

```
@hl8/infrastructure-kernel
├── IsolationContextManager (上下文生命周期管理)
├── AccessControlService (访问控制)
├── AuditLogService (审计日志)
└── SecurityMonitorService (安全监控)
```

**职责**：

- 管理隔离上下文的生命周期
- 实现基础设施层的隔离服务
- 提供审计和安全监控

## 🔄 依赖关系

```
infrastructure-kernel → nestjs-isolation → domain-kernel
```

## 📋 重构成果

### ✅ 已完成的改进

1. **删除重复实现**
   - 删除了 `infrastructure-kernel` 中重复的 `IsolationContext` 类
   - 统一使用 `domain-kernel` 的 `IsolationContext` 实体

2. **重构基础设施服务**
   - `IsolationContextManager` 现在使用领域模型的工厂方法
   - `AccessControlService` 使用领域模型的权限检查逻辑
   - `AuditLogService` 导入统一的隔离上下文类型

3. **明确职责分工**
   - **domain-kernel**: 核心业务逻辑和规则
   - **nestjs-isolation**: NestJS 框架集成
   - **infrastructure-kernel**: 基础设施服务实现

### 🎯 架构优势

1. **消除重复**：不再有重复的隔离上下文实现
2. **职责清晰**：每层都有明确的职责边界
3. **依赖明确**：单向依赖，避免循环依赖
4. **易于维护**：统一的业务逻辑，便于测试和扩展

## 🚀 使用示例

### 在 NestJS 应用中使用

```typescript
// 1. 使用装饰器获取当前上下文
@Controller('users')
export class UserController {
  @Get()
  @RequireLevel(IsolationLevel.TENANT)
  async getUsers(@CurrentContext() context: IsolationContext) {
    // 使用隔离上下文进行数据查询
    return this.userService.findByContext(context);
  }
}

// 2. 在服务中使用权限检查
@Injectable()
export class UserService {
  async findById(id: string, context: IsolationContext) {
    // 使用领域模型的权限检查
    if (!context.canAccess(targetContext, SharingLevel.TENANT)) {
      throw new Error('Access denied');
    }
    return this.repository.findById(id);
  }
}
```

### 在基础设施层使用

```typescript
// 3. 在基础设施服务中管理上下文
@Injectable()
export class IsolationContextManager {
  createContext(tenantId: string, orgId?: string): IsolationContext {
    // 使用领域模型的工厂方法
    return IsolationContext.organization(
      TenantId.create(tenantId),
      OrganizationId.create(orgId)
    );
  }
}
```

## 📊 架构对比

| 方面 | 重构前 | 重构后 |
|------|--------|--------|
| 隔离上下文实现 | 3个重复实现 | 1个统一实现 |
| 职责边界 | 模糊不清 | 清晰明确 |
| 依赖关系 | 循环依赖 | 单向依赖 |
| 维护成本 | 高 | 低 |
| 测试复杂度 | 高 | 低 |

## 🔧 下一步计划

1. **更新测试**：更新所有测试以使用统一的隔离上下文
2. **文档完善**：完善各层的使用文档
3. **性能优化**：基于统一架构进行性能优化
4. **监控集成**：集成监控和指标收集
