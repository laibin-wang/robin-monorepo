export interface ResizeHandlerOptions {
	debounce?: number
	throttle?: number
	leading?: boolean
	trailing?: boolean
}

export interface OptimizedResizeHandler {
	(size: { width: number; height: number }): void
	cancel: () => void
	flush: () => void
	pending: () => boolean
}

/**
 * 创建优化的 resize 处理器
 * 结合了防抖和节流的优点
 */
export function createOptimizedResizeHandler(
	callback: (size: { width: number; height: number }) => void,
	debounceMs: number = 100,
	throttleMs: number = 0,
): OptimizedResizeHandler {
	let lastArgs: { width: number; height: number } | null = null
	let timeoutId: ReturnType<typeof setTimeout> | null = null
	let rafId: number | null = null
	let lastCallTime = 0
	let isLeadingCall = false

	const executeCallback = () => {
		if (lastArgs) {
			callback(lastArgs)
			lastArgs = null
		}
		timeoutId = null
		rafId = null
		isLeadingCall = false
	}

	const handler = (size: { width: number; height: number }) => {
		lastArgs = size
		const now = Date.now()

		// 如果有节流配置
		if (throttleMs > 0) {
			if (now - lastCallTime < throttleMs) {
				// 节流期内，不执行
				return
			}
			lastCallTime = now
		}

		// 清除现有的定时器
		if (timeoutId) {
			clearTimeout(timeoutId)
			timeoutId = null
		}

		// 如果有防抖配置
		if (debounceMs > 0) {
			// 使用 requestAnimationFrame 确保在下一帧执行
			if (rafId) {
				cancelAnimationFrame(rafId)
			}

			rafId = requestAnimationFrame(() => {
				timeoutId = setTimeout(executeCallback, debounceMs)
			})
		} else {
			// 没有防抖，立即执行
			executeCallback()
		}
	}

	handler.cancel = () => {
		if (timeoutId) {
			clearTimeout(timeoutId)
			timeoutId = null
		}
		if (rafId) {
			cancelAnimationFrame(rafId)
			rafId = null
		}
		lastArgs = null
		isLeadingCall = false
	}

	handler.flush = () => {
		if (lastArgs) {
			executeCallback()
		}
	}

	handler.pending = () => {
		return !!timeoutId || !!rafId
	}

	return handler
}

/**
 * 批量 resize 处理器
 * 用于管理多个图表的 resize 操作
 */
export class BatchResizeHandler {
	private handlers = new Map<string, OptimizedResizeHandler>()
	private batchTimeoutId: ReturnType<typeof setTimeout> | null = null
	private batchQueue = new Map<string, { width: number; height: number }>()

	constructor(
		private batchDelay: number = 50,
		private onBatchComplete?: () => void,
	) {}

	register(
		id: string,
		callback: (size: { width: number; height: number }) => void,
		options: ResizeHandlerOptions = {},
	) {
		const handler = createOptimizedResizeHandler(callback, options.debounce, options.throttle)

		this.handlers.set(id, handler)
		return handler
	}

	resize(id: string, size: { width: number; height: number }) {
		const handler = this.handlers.get(id)
		if (handler) {
			handler(size)
		} else {
			// 如果没有注册 handler，加入批量队列
			this.batchQueue.set(id, size)
			this.scheduleBatch()
		}
	}

	private scheduleBatch() {
		if (this.batchTimeoutId) {
			clearTimeout(this.batchTimeoutId)
		}

		this.batchTimeoutId = setTimeout(() => {
			this.flushBatch()
		}, this.batchDelay)
	}

	private flushBatch() {
		if (this.batchQueue.size > 0) {
			// 这里可以添加批量处理逻辑
			this.batchQueue.clear()
			this.onBatchComplete?.()
		}
		this.batchTimeoutId = null
	}

	cancel(id: string) {
		const handler = this.handlers.get(id)
		handler?.cancel()
		this.handlers.delete(id)
		this.batchQueue.delete(id)
	}

	flush(id: string) {
		const handler = this.handlers.get(id)
		handler?.flush()
	}

	dispose() {
		this.handlers.forEach(handler => handler.cancel())
		this.handlers.clear()
		this.batchQueue.clear()

		if (this.batchTimeoutId) {
			clearTimeout(this.batchTimeoutId)
			this.batchTimeoutId = null
		}
	}
}
