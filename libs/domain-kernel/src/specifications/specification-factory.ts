/**
 * 规格工厂
 * @description 提供规格的创建和管理功能
 *
 * @since 1.0.0
 */

import { ISpecification } from "./specification.interface.js";
import { UserActiveSpecification, UserEmailFormatSpecification, UsernameFormatSpecification, UserLifecycleSpecification, ValidUserSpecification } from "./user-specifications.js";
import { OrderAmountSpecification, OrderStatusSpecification, OrderItemsSpecification, OrderLifecycleSpecification, ValidOrderSpecification } from "./order-specifications.js";

/**
 * 规格工厂
 * @description 提供规格的创建和管理功能
 */
export class SpecificationFactory {
  /**
   * 创建用户激活规格
   */
  static createUserActiveSpecification(): UserActiveSpecification {
    return new UserActiveSpecification();
  }

  /**
   * 创建用户邮箱格式规格
   */
  static createUserEmailFormatSpecification(): UserEmailFormatSpecification {
    return new UserEmailFormatSpecification();
  }

  /**
   * 创建用户名格式规格
   */
  static createUsernameFormatSpecification(): UsernameFormatSpecification {
    return new UsernameFormatSpecification();
  }

  /**
   * 创建用户生命周期规格
   */
  static createUserLifecycleSpecification(): UserLifecycleSpecification {
    return new UserLifecycleSpecification();
  }

  /**
   * 创建有效用户规格
   */
  static createValidUserSpecification(): ValidUserSpecification {
    return new ValidUserSpecification();
  }

  /**
   * 创建订单金额规格
   */
  static createOrderAmountSpecification(): OrderAmountSpecification {
    return new OrderAmountSpecification();
  }

  /**
   * 创建订单状态规格
   */
  static createOrderStatusSpecification(): OrderStatusSpecification {
    return new OrderStatusSpecification();
  }

  /**
   * 创建订单项规格
   */
  static createOrderItemsSpecification(): OrderItemsSpecification {
    return new OrderItemsSpecification();
  }

  /**
   * 创建订单生命周期规格
   */
  static createOrderLifecycleSpecification(): OrderLifecycleSpecification {
    return new OrderLifecycleSpecification();
  }

  /**
   * 创建有效订单规格
   */
  static createValidOrderSpecification(): ValidOrderSpecification {
    return new ValidOrderSpecification();
  }

  /**
   * 创建用户相关规格集合
   */
  static createUserSpecifications(): ISpecification<any>[] {
    return [
      this.createUserActiveSpecification(),
      this.createUserEmailFormatSpecification(),
      this.createUsernameFormatSpecification(),
      this.createUserLifecycleSpecification(),
    ];
  }

  /**
   * 创建订单相关规格集合
   */
  static createOrderSpecifications(): ISpecification<any>[] {
    return [
      this.createOrderAmountSpecification(),
      this.createOrderStatusSpecification(),
      this.createOrderItemsSpecification(),
      this.createOrderLifecycleSpecification(),
    ];
  }

  /**
   * 创建所有规格集合
   */
  static createAllSpecifications(): ISpecification<any>[] {
    return [
      ...this.createUserSpecifications(),
      ...this.createOrderSpecifications(),
    ];
  }
}
