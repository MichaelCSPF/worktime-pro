/**
 * Logger — Interface de logging para observabilidade
 *
 * Abstração para logging. Em desenvolvimento usa console,
 * em produção pode ser substituído por serviço externo.
 * Toda feature deve utilizar o logger — nunca console.log direto.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  module: string;
  action: string;
  userId?: string;
  companyId?: string;
  metadata?: Record<string, unknown>;
}

export interface Logger {
  debug(message: string, context: LogContext): void;
  info(message: string, context: LogContext): void;
  warn(message: string, context: LogContext): void;
  error(message: string, context: LogContext, error?: Error): void;
}

/**
 * Console Logger — Implementação padrão para desenvolvimento
 */
export class ConsoleLogger implements Logger {
  debug(message: string, context: LogContext): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] [${context.module}] ${context.action}: ${message}`, context.metadata);
    }
  }

  info(message: string, context: LogContext): void {
    console.info(`[INFO] [${context.module}] ${context.action}: ${message}`, context.metadata);
  }

  warn(message: string, context: LogContext): void {
    console.warn(`[WARN] [${context.module}] ${context.action}: ${message}`, context.metadata);
  }

  error(message: string, context: LogContext, error?: Error): void {
    console.error(`[ERROR] [${context.module}] ${context.action}: ${message}`, {
      ...context.metadata,
      stack: error?.stack,
    });
  }
}

/** Singleton instance — substituível em testes via DI */
export const logger: Logger = new ConsoleLogger();
