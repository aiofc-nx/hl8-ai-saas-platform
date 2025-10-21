/**
 * 订单规格
 * @description 订单相关的业务规格实现
 *
 * @since 1.0.0
 */

import { BaseSpecification } from "./base-specification.js";

/**
 * 订单数据接口
 */
export interface OrderData {
  id: string;
  amount: number;
  status: string;
  items: OrderItemData[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 订单项数据接口
 */
export interface OrderItemData {
  id: string;
  name: string;
  quantity: number;
  price: number;
  availableStock: number;
}

/**
 * 订单金额规格
 * @description 检查订单金额是否有效
 */
export class OrderAmountSpecification extends BaseSpecification<OrderData> {
  constructor() {
    super({
      name: "OrderAmountSpecification",
      description: "订单金额必须大于0",
      category: "order",
      tags: ["order", "amount", "validation"],
      priority: 1,
    });
  }

  isSatisfiedBy(order: OrderData): boolean {
    return order.amount > 0;
  }

  protected getErrorMessage(order: OrderData): string {
    return `订单 ${order.id} 金额 ${order.amount} 无效`;
  }
}

/**
 * 订单状态规格
 * @description 检查订单状态是否有效
 */
export class OrderStatusSpecification extends BaseSpecification<OrderData> {
  constructor() {
    super({
      name: "OrderStatusSpecification",
      description: "订单状态必须有效",
      category: "order",
      tags: ["order", "status", "validation"],
      priority: 2,
    });
  }

  isSatisfiedBy(order: OrderData): boolean {
    const validStatuses = ['DRAFT', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED'];
    return validStatuses.includes(order.status);
  }

  protected getErrorMessage(order: OrderData): string {
    return `订单 ${order.id} 状态 ${order.status} 无效`;
  }
}

/**
 * 订单项规格
 * @description 检查订单项是否有效
 */
export class OrderItemsSpecification extends BaseSpecification<OrderData> {
  constructor() {
    super({
      name: "OrderItemsSpecification",
      description: "订单必须包含有效的商品项",
      category: "order",
      tags: ["order", "items", "validation"],
      priority: 3,
    });
  }

  isSatisfiedBy(order: OrderData): boolean {
    if (!order.items || order.items.length === 0) {
      return false;
    }

    return order.items.every(item => 
      item.quantity > 0 && 
      item.price > 0 && 
      item.availableStock >= item.quantity
    );
  }

  protected getErrorMessage(order: OrderData): string {
    if (!order.items || order.items.length === 0) {
      return `订单 ${order.id} 没有商品项`;
    }

    const invalidItems = order.items.filter(item => 
      item.quantity <= 0 || 
      item.price <= 0 || 
      item.availableStock < item.quantity
    );

    if (invalidItems.length > 0) {
      return `订单 ${order.id} 包含无效商品项`;
    }

    return `订单 ${order.id} 商品项验证失败`;
  }
}

/**
 * 订单生命周期规格
 * @description 检查订单生命周期是否合理
 */
export class OrderLifecycleSpecification extends BaseSpecification<OrderData> {
  constructor() {
    super({
      name: "OrderLifecycleSpecification",
      description: "订单生命周期必须合理",
      category: "order",
      tags: ["order", "lifecycle", "time"],
      priority: 4,
    });
  }

  isSatisfiedBy(order: OrderData): boolean {
    // 检查创建时间和更新时间
    if (order.updatedAt < order.createdAt) {
      return false;
    }

    // 检查时间是否在合理范围内
    const now = new Date();
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    
    return order.createdAt >= oneYearAgo && order.createdAt <= now;
  }

  protected getErrorMessage(order: OrderData): string {
    return `订单 ${order.id} 生命周期不合理`;
  }
}

/**
 * 有效订单规格
 * @description 组合规格：订单必须是有效的
 */
export class ValidOrderSpecification extends BaseSpecification<OrderData> {
  private amountSpec: OrderAmountSpecification;
  private statusSpec: OrderStatusSpecification;
  private itemsSpec: OrderItemsSpecification;
  private lifecycleSpec: OrderLifecycleSpecification;

  constructor() {
    super({
      name: "ValidOrderSpecification",
      description: "订单必须是有效的（金额有效、状态有效、商品项有效、生命周期合理）",
      category: "order",
      tags: ["order", "valid", "composite"],
      priority: 1,
    });

    this.amountSpec = new OrderAmountSpecification();
    this.statusSpec = new OrderStatusSpecification();
    this.itemsSpec = new OrderItemsSpecification();
    this.lifecycleSpec = new OrderLifecycleSpecification();
  }

  isSatisfiedBy(order: OrderData): boolean {
    return (
      this.amountSpec.isSatisfiedBy(order) &&
      this.statusSpec.isSatisfiedBy(order) &&
      this.itemsSpec.isSatisfiedBy(order) &&
      this.lifecycleSpec.isSatisfiedBy(order)
    );
  }

  protected getErrorMessage(order: OrderData): string {
    const errors: string[] = [];

    if (!this.amountSpec.isSatisfiedBy(order)) {
      errors.push(this.amountSpec.check(order).errorMessage || '订单金额检查失败');
    }
    if (!this.statusSpec.isSatisfiedBy(order)) {
      errors.push(this.statusSpec.check(order).errorMessage || '订单状态检查失败');
    }
    if (!this.itemsSpec.isSatisfiedBy(order)) {
      errors.push(this.itemsSpec.check(order).errorMessage || '订单商品项检查失败');
    }
    if (!this.lifecycleSpec.isSatisfiedBy(order)) {
      errors.push(this.lifecycleSpec.check(order).errorMessage || '订单生命周期检查失败');
    }

    return errors.join("; ");
  }
}
