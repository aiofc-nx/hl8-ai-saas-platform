/**
 * 规格模式使用示例
 * @description 展示如何使用规格模式
 *
 * @since 1.0.0
 */

import {
  SpecificationFactory,
  UserActiveSpecification,
  UserEmailFormatSpecification,
  ValidUserSpecification,
  ValidOrderSpecification,
  type UserData,
  type OrderData,
} from "./index.js";

/**
 * 规格模式使用示例
 */
export function demonstrateSpecifications(): void {
  console.log('🧪 演示规格模式...');

  // 创建用户数据
  const validUser: UserData = {
    id: 'user1',
    email: 'user@example.com',
    username: 'john_doe',
    status: 'ACTIVE',
    isDeleted: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
  };

  const invalidUser: UserData = {
    id: 'user2',
    email: 'invalid-email',
    username: 'ab', // 太短
    status: 'PENDING',
    isDeleted: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
  };

  // 测试单个规格
  console.log('\n📝 测试单个规格...');
  
  const activeSpec = SpecificationFactory.createUserActiveSpecification();
  const emailSpec = SpecificationFactory.createUserEmailFormatSpecification();

  console.log('有效用户激活检查:', activeSpec.isSatisfiedBy(validUser));
  console.log('无效用户激活检查:', activeSpec.isSatisfiedBy(invalidUser));
  
  console.log('有效用户邮箱检查:', emailSpec.isSatisfiedBy(validUser));
  console.log('无效用户邮箱检查:', emailSpec.isSatisfiedBy(invalidUser));

  // 测试组合规格
  console.log('\n🔗 测试组合规格...');
  
  const combinedSpec = activeSpec.and(emailSpec);
  console.log('组合规格（激活 AND 邮箱）:', combinedSpec.isSatisfiedBy(validUser));
  console.log('组合规格（激活 AND 邮箱）:', combinedSpec.isSatisfiedBy(invalidUser));

  // 测试复杂规格
  console.log('\n🎯 测试复杂规格...');
  
  const validUserSpec = SpecificationFactory.createValidUserSpecification();
  const validUserResult = validUserSpec.check(validUser);
  const invalidUserResult = validUserSpec.check(invalidUser);

  console.log('有效用户规格检查:', {
    isSatisfied: validUserResult.isSatisfied,
    errorMessage: validUserResult.errorMessage,
  });

  console.log('无效用户规格检查:', {
    isSatisfied: invalidUserResult.isSatisfied,
    errorMessage: invalidUserResult.errorMessage,
  });

  // 测试订单规格
  console.log('\n🛒 测试订单规格...');
  
  const validOrder: OrderData = {
    id: 'order1',
    amount: 100.00,
    status: 'CONFIRMED',
    items: [
      {
        id: 'item1',
        name: '商品A',
        quantity: 2,
        price: 50.00,
        availableStock: 10,
      },
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
  };

  const invalidOrder: OrderData = {
    id: 'order2',
    amount: -10.00, // 无效金额
    status: 'INVALID_STATUS', // 无效状态
    items: [], // 空商品项
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
  };

  const validOrderSpec = SpecificationFactory.createValidOrderSpecification();
  const validOrderResult = validOrderSpec.check(validOrder);
  const invalidOrderResult = validOrderSpec.check(invalidOrder);

  console.log('有效订单规格检查:', {
    isSatisfied: validOrderResult.isSatisfied,
    errorMessage: validOrderResult.errorMessage,
  });

  console.log('无效订单规格检查:', {
    isSatisfied: invalidOrderResult.isSatisfied,
    errorMessage: invalidOrderResult.errorMessage,
  });

  console.log('\n🎉 规格模式演示完成！');
}

/**
 * 规格模式最佳实践示例
 */
export function demonstrateBestPractices(): void {
  console.log('\n📚 规格模式最佳实践...');

  // 创建用户数据
  const user: UserData = {
    id: 'user1',
    email: 'user@example.com',
    username: 'john_doe',
    status: 'ACTIVE',
    isDeleted: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
  };

  // 方式1：使用工厂创建规格
  const userSpecs = SpecificationFactory.createUserSpecifications();
  console.log('✅ 使用工厂创建用户规格集合');

  // 方式2：手动组合规格
  const activeSpec = new UserActiveSpecification();
  const emailSpec = new UserEmailFormatSpecification();
  const combinedSpec = activeSpec.and(emailSpec);

  console.log('✅ 手动组合规格');

  // 方式3：使用复杂规格
  const validUserSpec = new ValidUserSpecification();
  const result = validUserSpec.check(user);

  console.log('✅ 使用复杂规格检查:', {
    isSatisfied: result.isSatisfied,
    errorMessage: result.errorMessage,
  });

  // 方式4：规格的元数据管理
  activeSpec.addTag('critical');
  activeSpec.setPriority(1);
  console.log('✅ 规格元数据管理:', {
    name: activeSpec.getName(),
    description: activeSpec.getDescription(),
    tags: activeSpec.getMetadata().tags,
    priority: activeSpec.getMetadata().priority,
  });

  console.log('✅ 规格模式最佳实践演示完成！');
}

// 如果直接运行此文件，执行演示
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateSpecifications();
  demonstrateBestPractices();
}
