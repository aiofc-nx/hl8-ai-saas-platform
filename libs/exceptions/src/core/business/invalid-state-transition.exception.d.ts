import { BusinessException } from "./business.exception.js";
export declare class InvalidStateTransitionException extends BusinessException {
  constructor(
    entity: string,
    currentState: string,
    targetState: string,
    data?: Record<string, unknown>,
  );
}
//# sourceMappingURL=invalid-state-transition.exception.d.ts.map
