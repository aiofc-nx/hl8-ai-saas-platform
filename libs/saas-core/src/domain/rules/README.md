# 领域规则（Domain Rules）

## 目录说明

此目录存放领域业务规则验证器，用于验证业务逻辑和约束条件。

## 与 libs/domain-kernel/src/rules 对齐

- **基类**: `BusinessRuleValidator<Context>`
- **职责**: 业务规则验证
- **原则**: 
  - 约束规则：数据约束和限制
  - 计算规则：业务计算逻辑
  - 验证规则：数据验证逻辑
  - 授权规则：权限和访问控制

## 实现规范

### 必须实现的方法
- `validate(context: Context): BusinessRuleValidationResult`
- `getRuleName(): string`
- `getRuleDescription(): string`

### 可选重写的方法
- `getPriority(): number` - 规则优先级（默认100）
- `isApplicable(context: Context): boolean` - 规则适用性（默认true）

## 示例文件

TODO: 创建以下业务规则验证器
- `permission-assignment.rule.ts` - 权限分配规则
- `role-inheritance.rule.ts` - 角色继承规则
- `credential-validation.rule.ts` - 凭证验证规则
- `authorization-check.rule.ts` - 授权检查规则
