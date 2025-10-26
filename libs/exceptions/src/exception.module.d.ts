import { DynamicModule } from "@nestjs/common";
import {
  ExceptionModuleAsyncOptions,
  ExceptionModuleOptions,
} from "./config/exception.config.js";
export declare class ExceptionModule {
  static forRoot(options?: ExceptionModuleOptions): DynamicModule;
  static forRootAsync(options: ExceptionModuleAsyncOptions): DynamicModule;
  private static createAsyncProviders;
}
//# sourceMappingURL=exception.module.d.ts.map
