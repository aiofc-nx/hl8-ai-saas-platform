/**
 * 业务规则使用示例
 * @description 展示如何使用整合后的业务规则系统
 *
 * @since 1.0.0
 */

import {
  BusinessRuleManager,
  UserRegistrationBusinessRule,
  OrderCreationBusinessRule,
  UserStateBusinessRule,
} from "./index.js";

/**
 * 业务规则使用示例
 */
export function demonstrateBusinessRules(): void {
  console.log("🧪 演示业务规则系统...");

  // 方式1：使用工厂创建默认管理器
  // const defaultManager = BusinessRuleFactory.createDefaultManager();
  console.log("✅ 创建默认业务规则管理器");

  // 方式2：手动创建和管理
  const customManager = new BusinessRuleManager();

  // 注册具体的业务规则
  customManager.registerValidator(new UserRegistrationBusinessRule());
  customManager.registerValidator(new OrderCreationBusinessRule());
  customManager.registerValidator(new UserStateBusinessRule());

  console.log("✅ 注册业务规则验证器");

  // 测试用户注册验证
  console.log("\n📝 测试用户注册业务规则...");

  const userRegistrationContext = {
    operation: "user_registration",
    userData: {
      email: "user@example.com",
      username: "john_doe",
      password: "SecurePass123!",
      age: 25,
    },
  };

  const userResult = customManager.validateAll(userRegistrationContext);
  console.log("用户注册验证结果:", {
    isValid: userResult.isValid,
    errors: userResult.errors.map((e) => e.message),
    warnings: userResult.warnings.map((w) => w.message),
  });

  // 测试订单创建验证
  console.log("\n🛒 测试订单创建业务规则...");

  const orderCreationContext = {
    operation: "order_creation",
    orderData: {
      amount: 100.0,
      items: [
        {
          id: "item1",
          name: "商品A",
          quantity: 2,
          availableStock: 5,
        },
      ],
    },
  };

  const orderResult = customManager.validateAll(orderCreationContext);
  console.log("订单创建验证结果:", {
    isValid: orderResult.isValid,
    errors: orderResult.errors.map((e) => e.message),
    warnings: orderResult.warnings.map((w) => w.message),
  });

  // 测试用户状态验证
  console.log("\n👤 测试用户状态业务规则...");

  const userStateContext = {
    operation: "status_change",
    userData: {
      currentStatus: "PENDING",
      newStatus: "ACTIVE",
      isDeleted: false,
    },
  };

  const stateResult = customManager.validateAll(userStateContext);
  console.log("用户状态验证结果:", {
    isValid: stateResult.isValid,
    errors: stateResult.errors.map((e) => e.message),
    warnings: stateResult.warnings.map((w) => w.message),
  });

  console.log("\n🎉 业务规则系统演示完成！");
}

/**
 * 业务规则最佳实践示例
 */
export function demonstrateBestPractices(): void {
  console.log("\n📚 业务规则最佳实践...");

  // 创建专门的业务规则管理器
  const userManager = new BusinessRuleManager();
  userManager.registerValidator(new UserRegistrationBusinessRule());
  userManager.registerValidator(new UserStateBusinessRule());

  const orderManager = new BusinessRuleManager();
  orderManager.registerValidator(new OrderCreationBusinessRule());

  console.log("✅ 按业务域分离规则管理器");

  // 验证用户操作
  const userContext = {
    operation: "user_registration",
    userData: {
      email: "test@example.com",
      username: "testuser",
      password: "Password123!",
    },
  };

  const userValidation = userManager.validateAll(userContext);
  console.log("用户域验证结果:", {
    isValid: userValidation.isValid,
    errorCount: userValidation.errors.length,
  });

  // 验证订单操作
  const orderContext = {
    operation: "order_creation",
    orderData: {
      amount: 50.0,
      items: [{ id: "item1", name: "商品", quantity: 1, availableStock: 10 }],
    },
  };

  const orderValidation = orderManager.validateAll(orderContext);
  console.log("订单域验证结果:", {
    isValid: orderValidation.isValid,
    errorCount: orderValidation.errors.length,
  });

  console.log("✅ 业务规则最佳实践演示完成！");
}

// 如果直接运行此文件，执行演示
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateBusinessRules();
  demonstrateBestPractices();
}
