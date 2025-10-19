import { LoggerService } from '../logger/logger.service'; // your custom logger
import { omit } from '../utils/omit';

let globalLogger: LoggerService | null = null;

/**
 * Set the logger instance once (usually from main.ts or AppModule)
 */
export function setGlobalLogger(logger: LoggerService) {
  if (!globalLogger) {
    globalLogger = logger;
  }
}

export function LogMethod(contextName?: string): MethodDecorator {
  return <T>(
    target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>,
  ): TypedPropertyDescriptor<T> | void => {
    const originalMethod = descriptor.value;

    if (typeof originalMethod !== 'function') {
      throw new Error('@LogMethod can only be applied to methods');
    }

    const wrappedMethod = function (this: unknown, ...args: unknown[]) {
      const className =
        (target as unknown)?.constructor?.name ?? 'UnknownClass';
      const methodName = String(propertyKey);
      const context = contextName || `${className}.${methodName}`;

      if (!globalLogger) {
        console.warn(`[WARN] No global logger set for @LogMethod(${context})`);
      }

      const argsStr = args.map((a) =>
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        typeof a === 'object' ? JSON.stringify(a) : String(a),
      );
      globalLogger?.log(
        `[START] ${context} called with args: [${JSON.stringify(omit(JSON.parse(argsStr.join(', ')), ['password', 'confirmPassword', 'token']))}]`,
        context,
      );

      const start = Date.now();

      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const result = originalMethod.apply(this, args);

        if (result instanceof Promise) {
          return result
            .then((res) => {
              globalLogger?.log(
                `[SUCCESS] ${context} completed in ${Date.now() - start}ms`,
                context,
              );
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return
              return res;
            })
            .catch((err: unknown) => {
              globalLogger?.error(
                `[ERROR] ${context} failed in ${Date.now() - start}ms`,
                err instanceof Error ? err.stack : String(err),
                context,
              );
              throw err;
            });
        } else {
          globalLogger?.log(
            `[SUCCESS] ${context} completed in ${Date.now() - start}ms`,
            context,
          );
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return result;
        }
      } catch (err: unknown) {
        globalLogger?.error(
          `[ERROR] ${context} failed in ${Date.now() - start}ms`,
          err instanceof Error ? err.stack : String(err),
          context,
        );
        throw err;
      }
    };

    descriptor.value = wrappedMethod as T;
    return descriptor;
  };
}
