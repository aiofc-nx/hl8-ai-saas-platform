var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ExceptionModule_1;
import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { DEFAULT_EXCEPTION_OPTIONS, EXCEPTION_MODULE_OPTIONS, } from "./config/exception.config.js";
import { AnyExceptionFilter } from "./filters/any-exception.filter.js";
import { HttpExceptionFilter } from "./filters/http-exception.filter.js";
import { DefaultMessageProvider } from "./providers/default-message.provider.js";
let ExceptionModule = ExceptionModule_1 = class ExceptionModule {
    static forRoot(options = {}) {
        const mergedOptions = { ...DEFAULT_EXCEPTION_OPTIONS, ...options };
        const providers = [
            {
                provide: EXCEPTION_MODULE_OPTIONS,
                useValue: mergedOptions,
            },
        ];
        if (!mergedOptions.messageProvider) {
            providers.push(DefaultMessageProvider);
        }
        if (mergedOptions.registerGlobalFilters) {
            providers.push({
                provide: APP_FILTER,
                useClass: HttpExceptionFilter,
            }, {
                provide: APP_FILTER,
                useClass: AnyExceptionFilter,
            });
        }
        return {
            module: ExceptionModule_1,
            providers,
            exports: [EXCEPTION_MODULE_OPTIONS],
        };
    }
    static forRootAsync(options) {
        const providers = [
            ...this.createAsyncProviders(options),
            DefaultMessageProvider,
        ];
        providers.push({
            provide: APP_FILTER,
            useClass: HttpExceptionFilter,
        }, {
            provide: APP_FILTER,
            useClass: AnyExceptionFilter,
        });
        return {
            module: ExceptionModule_1,
            imports: options.imports || [],
            providers,
            exports: [EXCEPTION_MODULE_OPTIONS],
        };
    }
    static createAsyncProviders(options) {
        if (options.useFactory) {
            return [
                {
                    provide: EXCEPTION_MODULE_OPTIONS,
                    useFactory: async (...args) => {
                        const config = await options.useFactory(...args);
                        return { ...DEFAULT_EXCEPTION_OPTIONS, ...config };
                    },
                    inject: options.inject || [],
                },
            ];
        }
        if (options.useClass) {
            return [
                {
                    provide: EXCEPTION_MODULE_OPTIONS,
                    useFactory: async (optionsFactory) => {
                        const config = await optionsFactory.createExceptionOptions();
                        return { ...DEFAULT_EXCEPTION_OPTIONS, ...config };
                    },
                    inject: [options.useClass],
                },
                {
                    provide: options.useClass,
                    useClass: options.useClass,
                },
            ];
        }
        if (options.useExisting) {
            return [
                {
                    provide: EXCEPTION_MODULE_OPTIONS,
                    useFactory: async (optionsFactory) => {
                        const config = await optionsFactory.createExceptionOptions();
                        return { ...DEFAULT_EXCEPTION_OPTIONS, ...config };
                    },
                    inject: [options.useExisting],
                },
            ];
        }
        return [];
    }
};
ExceptionModule = ExceptionModule_1 = __decorate([
    Module({})
], ExceptionModule);
export { ExceptionModule };
//# sourceMappingURL=exception.module.js.map