export interface ExceptionMessageProvider {
  getMessage(
    errorCode: string,
    messageType: "title" | "detail",
    params?: Record<string, unknown>,
  ): string | undefined;
  hasMessage(errorCode: string, messageType: "title" | "detail"): boolean;
  getAvailableErrorCodes?(): string[];
}
//# sourceMappingURL=exception-message.provider.d.ts.map
