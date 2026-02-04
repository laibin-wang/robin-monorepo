/**
 * 安全地将未知错误转换为 Error 对象
 */
export function normalizeError(error: unknown): Error {
	if (error instanceof Error) {
		return error
	}

	if (typeof error === 'string') {
		return new Error(error)
	}

	try {
		return new Error(JSON.stringify(error))
	} catch {
		return new Error(String(error))
	}
}

/**
 * 日志工具（仅在 debug 模式下输出）
 */
export class Logger {
	constructor(private debug: boolean = false) {}

	log(...args: any[]) {
		if (this.debug) {
			console.log('[Monitor]', ...args)
		}
	}

	warn(...args: any[]) {
		if (this.debug) {
			console.warn('[Monitor]', ...args)
		}
	}

	error(...args: any[]) {
		if (this.debug) {
			console.error('[Monitor]', ...args)
		}
	}
}

/**
 * 安全执行函数（捕获错误但不抛出）
 */
export function safeExec<T>(fn: () => T, fallback?: T): T | undefined {
	try {
		return fn()
	} catch (error) {
		// SDK 内部错误不应影响业务代码
		return fallback
	}
}
