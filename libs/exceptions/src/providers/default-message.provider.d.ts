import { ExceptionMessageProvider } from "./exception-message.provider.js";
export declare class DefaultMessageProvider implements ExceptionMessageProvider {
    private readonly messages;
    getMessage(errorCode: string, messageType: "title" | "detail", params?: Record<string, unknown>): string | undefined;
    hasMessage(errorCode: string, messageType: "title" | "detail"): boolean;
    getAvailableErrorCodes(): string[];
    private replaceParams;
    private getNestedValue;
}
//# sourceMappingURL=default-message.provider.d.ts.map