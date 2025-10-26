import {
  ModuleMetadata,
  Type,
  InjectionToken,
  OptionalFactoryDependency,
} from "@nestjs/common";
import { ILoggerService } from "../filters/http-exception.filter.js";
import { ExceptionMessageProvider } from "../providers/exception-message.provider.js";
export interface ExceptionModuleOptions {
  enableLogging?: boolean;
  logger?: ILoggerService;
  messageProvider?: ExceptionMessageProvider;
  isProduction?: boolean;
  registerGlobalFilters?: boolean;
}
export interface ExceptionModuleAsyncOptions
  extends Pick<ModuleMetadata, "imports"> {
  useFactory?: (
    ...args: unknown[]
  ) => Promise<ExceptionModuleOptions> | ExceptionModuleOptions;
  inject?: (InjectionToken | OptionalFactoryDependency)[];
  useClass?: Type<ExceptionOptionsFactory>;
  useExisting?: Type<ExceptionOptionsFactory>;
}
export interface ExceptionOptionsFactory {
  createExceptionOptions():
    | Promise<ExceptionModuleOptions>
    | ExceptionModuleOptions;
}
export declare const EXCEPTION_MODULE_OPTIONS = "EXCEPTION_MODULE_OPTIONS";
export declare const DEFAULT_EXCEPTION_OPTIONS: ExceptionModuleOptions;
//# sourceMappingURL=exception.config.d.ts.map
