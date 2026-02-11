import type { EChartsOption, SeriesOption } from 'echarts/types/dist/shared'

import type { DataItem, ChartType } from '../types'

export function createSeries(
	type: ChartType,
	data: DataItem[],
	config: Partial<SeriesOption> = {},
): SeriesOption {
	return {
		type,
		data,
		...config,
	} as SeriesOption
}

export function generateId(prefix = 'chart'): string {
	return `${prefix}-${Math.random().toString(36).substring(2, 9)}`
}

export function deepMerge<T extends Record<string, any>>(
	target: T & Record<string, any>,
	source: any,
): T {
	if (!source || typeof source !== 'object') return target
	for (const key in source) {
		if (source[key] === null || source[key] === undefined) continue
		if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
			if (!target[key] || typeof target[key] !== 'object') target[key as keyof T] = {} as any
			deepMerge(target[key], source[key])
		} else {
			target[key as keyof T] = source[key]
		}
	}
	return target
}

export function mergeOptions<T extends object, P extends Record<string, any>>(
	baseOptions: T,
	defaultOpts: Partial<T>,
	configOpts: T | undefined,
	privateProps: P,
): T {
	const result = { ...baseOptions }

	// 按优先级合并：默认值 < config < 私有属性（私有属性优先级最高）
	Object.assign(result, defaultOpts)

	if (configOpts) {
		Object.assign(result, configOpts)
	}

	// 私有属性覆盖所有（优先级最高）
	Object.assign(result, privateProps)

	return result
}

export function hasField<T>(obj: T, field: keyof T): boolean {
	if (typeof obj !== 'object' || obj === null) {
		return false
	}
	return field in obj
}

export function shallowEqual(a: any, b: any): boolean {
	if (a === b) return true
	if (!a || !b) return false
	if (typeof a !== 'object' || typeof b !== 'object') return false
	const keysA = Object.keys(a)
	const keysB = Object.keys(b)
	if (keysA.length !== keysB.length) return false
	for (const key of keysA) {
		if (a[key] !== b[key]) return false
	}
	return true
}

export function createOptionHash(type: string, option: any): string {
	if (!option || typeof option !== 'object') return `${type}:${String(option)}`
	const keys = Object.keys(option).sort()
	const signature = keys
		.map(k => {
			const v = option[k]
			if (v === null) return `${k}:null`
			if (typeof v === 'function') return `${k}:fn`
			if (typeof v === 'object') {
				if (Array.isArray(v)) return `${k}:[${v.length}]`
				return `${k}:{${Object.keys(v).length}}`
			}
			return `${k}:${String(v).slice(0, 50)}`
		})
		.join('|')
	return `${type}:${signature}`
}

export function debounce<T extends (...args: any[]) => any>(
	fn: T,
	wait: number,
	immediate: boolean = false,
): {
	(...args: Parameters<T>): void
	cancel: () => void
	flush: () => void
	pending: () => boolean
} {
	let timeout: ReturnType<typeof setTimeout> | null = null
	let args: Parameters<T> | null = null
	let timestamp = 0
	let result: ReturnType<T>

	const later = () => {
		const last = Date.now() - timestamp
		if (last < wait && last >= 0) {
			timeout = setTimeout(later, wait - last)
		} else {
			timeout = null
			if (!immediate) {
				result = fn(...args!)
				args = null
			}
		}
	}

	const debounced = function (this: any, ...newArgs: Parameters<T>) {
		args = newArgs
		timestamp = Date.now()
		const callNow = immediate && !timeout
		if (!timeout) timeout = setTimeout(later, wait)
		if (callNow) {
			result = fn(...args)
			args = null
		}
	} as any

	debounced.cancel = () => {
		if (timeout) {
			clearTimeout(timeout)
			timeout = null
		}
		args = null
	}
	debounced.flush = () => {
		if (timeout) {
			clearTimeout(timeout)
			timeout = null
			result = fn(...args!)
			args = null
		}
	}
	debounced.pending = () => !!timeout
	return debounced
}

export function throttleRAF<T extends (...args: any[]) => any>(
	fn: T,
): { (...args: Parameters<T>): void; cancel: () => void } {
	let rafId: number | null = null
	let lastArgs: Parameters<T> | null = null

	const throttled = function (this: any, ...args: Parameters<T>) {
		lastArgs = args
		if (rafId === null) {
			rafId = requestAnimationFrame(() => {
				fn(...lastArgs!)
				rafId = null
				lastArgs = null
			})
		}
	} as any

	throttled.cancel = () => {
		if (rafId !== null) {
			cancelAnimationFrame(rafId)
			rafId = null
			lastArgs = null
		}
	}
	return throttled
}

export class BatchProcessor<T> {
	private queue: T[] = []
	private timeout: ReturnType<typeof setTimeout> | null = null
	private rafId: number | null = null
	private processing = false

	constructor(
		private processor: (items: T[]) => void,
		private options: { maxBatchSize?: number; debounceMs?: number; useRAF?: boolean } = {},
	) {
		this.options = { maxBatchSize: 100, debounceMs: 16, useRAF: true, ...options }
	}

	add(item: T) {
		this.queue.push(item)
		this.schedule()
	}

	addMany(items: T[]) {
		this.queue.push(...items)
		this.schedule()
	}

	private schedule() {
		if (this.processing) return
		if (this.timeout) clearTimeout(this.timeout)
		if (this.rafId) cancelAnimationFrame(this.rafId)

		if (this.options.useRAF) {
			this.rafId = requestAnimationFrame(() => this.flush())
		} else {
			this.timeout = setTimeout(() => this.flush(), this.options.debounceMs)
		}
	}

	flush() {
		if (this.processing || this.queue.length === 0) return
		this.processing = true
		const batch = this.queue.splice(0, this.options.maxBatchSize)
		try {
			this.processor(batch)
		} finally {
			this.processing = false
			if (this.queue.length > 0) this.schedule()
		}
	}

	clear() {
		this.queue = []
		if (this.timeout) {
			clearTimeout(this.timeout)
			this.timeout = null
		}
		if (this.rafId) {
			cancelAnimationFrame(this.rafId)
			this.rafId = null
		}
	}

	get size() {
		return this.queue.length
	}
}
