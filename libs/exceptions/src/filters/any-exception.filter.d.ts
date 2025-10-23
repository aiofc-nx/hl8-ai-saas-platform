import { ArgumentsHost, ExceptionFilter } from "@nestjs/common";
import type { ILoggerService } from "./http-exception.filter.js";
export declare class AnyExceptionFilter implements ExceptionFilter {
    private readonly logger?;
    private readonly isProduction?;
    constructor(logger?: ILoggerService, isProduction?: boolean);
    catch(exception: unknown, host: ArgumentsHost): void;
    private getDetailedError;
    private logException;
}
//# sourceMappingURL=any-exception.filter.d.ts.map