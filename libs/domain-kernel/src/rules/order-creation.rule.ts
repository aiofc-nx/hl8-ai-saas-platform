/**
 * 订单创建业务规则
 * @description 验证订单创建的业务规则和约束条件
 *
 * @since 1.0.0
 */

import { BusinessRuleValidator, BusinessRuleValidationResult } from "./business-rule-validator.js";
import type { BusinessRuleValidationError, BusinessRuleValidationWarning } from "./business-rule-validator.js";

/**
 * 订单创建业务规则验证器
 */
export class OrderCreationBusinessRule extends BusinessRuleValidator {
  validate(context: any): BusinessRuleValidationResult {
    const errors: BusinessRuleValidationError[] = [];
    const warnings: BusinessRuleValidationWarning[] = [];

    const orderData = context.orderData;
    if (!orderData) {
      errors.push({
        code: 'MISSING_ORDER_DATA',
        message: '订单数据不能为空',
        field: 'orderData'
      });
      return { isValid: false, errors, warnings };
    }

    // 验证订单金额
    if (!orderData.amount || orderData.amount <= 0) {
      errors.push({
        code: 'INVALID_ORDER_AMOUNT',
        message: '订单金额必须大于0',
        field: 'amount',
        context: { amount: orderData.amount }
      });
    }

    // 验证订单项
    if (!orderData.items || orderData.items.length === 0) {
      errors.push({
        code: 'EMPTY_ORDER_ITEMS',
        message: '订单必须包含至少一个商品',
        field: 'items'
      });
    }

    // 验证商品数量
    if (orderData.items) {
      for (const item of orderData.items) {
        if (!item.quantity || item.quantity <= 0) {
          errors.push({
            code: 'INVALID_ITEM_QUANTITY',
            message: '商品数量必须大于0',
            field: 'items.quantity',
            context: { itemId: item.id, quantity: item.quantity }
          });
        }
      }
    }

    // 验证库存（警告）
    if (orderData.items) {
      for (const item of orderData.items) {
        if (item.quantity > item.availableStock) {
          warnings.push({
            code: 'INSUFFICIENT_STOCK',
            message: `商品 ${item.name} 库存不足`,
            field: 'items.stock',
            context: { itemId: item.id, requested: item.quantity, available: item.availableStock }
          });
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  getRuleName(): string {
    return 'OrderCreationBusinessRule';
  }

  getRuleDescription(): string {
    return '验证订单创建的业务规则和约束条件';
  }

  isApplicable(context: any): boolean {
    return context.operation === 'order_creation';
  }
}
