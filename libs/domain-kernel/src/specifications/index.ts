/**
 * 规格模式导出
 * @description 导出规格模式相关的所有公共API
 *
 * @since 1.0.0
 */

// 基础规格组件
export {
  BaseSpecification,
  AndSpecification,
  OrSpecification,
  NotSpecification,
} from "./base-specification.js";

// 重新导出类型定义
export type {
  ISpecification,
  SpecificationResult,
  SpecificationMetadata,
} from "./specification.interface.js";

// 用户规格
export {
  UserActiveSpecification,
  UserEmailFormatSpecification,
  UsernameFormatSpecification,
  UserLifecycleSpecification,
  ValidUserSpecification,
  type UserData,
} from "./user-specifications.js";

// 订单规格
export {
  OrderAmountSpecification,
  OrderStatusSpecification,
  OrderItemsSpecification,
  OrderLifecycleSpecification,
  ValidOrderSpecification,
  type OrderData,
  type OrderItemData,
} from "./order-specifications.js";

// 规格工厂
export { SpecificationFactory } from "./specification-factory.js";
