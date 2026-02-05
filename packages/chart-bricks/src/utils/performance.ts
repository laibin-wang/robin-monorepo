export function rafThrottle<T extends (...args: any[]) => any>(fn: T): T {
	let rafId: number | null = null

	return ((...args: Parameters<T>) => {
		if (rafId !== null) return

		rafId = requestAnimationFrame(() => {
			rafId = null
			fn(...args)
		})
	}) as T
}

export function measureTime<T>(fn: () => T, label: string): T {
	const start = performance.now()
	const result = fn()
	const end = performance.now()
	console.log(`${label}: ${(end - start).toFixed(2)}ms`)
	return result
}

export function lazyTask<T>(tasks: (() => T)[], batchSize: number = 5): Promise<T[]> {
	return new Promise(resolve => {
		const results: T[] = []
		let index = 0

		function runBatch() {
			const batch = tasks.slice(index, index + batchSize)
			index += batchSize

			batch.forEach(task => results.push(task()))

			if (index < tasks.length) {
				setTimeout(runBatch, 0)
			} else {
				resolve(results)
			}
		}

		runBatch()
	})
}

export function memoize<T extends (...args: any[]) => any>(
	fn: T,
	keyFn?: (...args: Parameters<T>) => string,
): T {
	const cache = new Map<string, ReturnType<T>>()

	return ((...args: Parameters<T>) => {
		const key = keyFn ? keyFn(...args) : JSON.stringify(args)
		if (cache.has(key)) return cache.get(key)!

		const result = fn(...args)
		cache.set(key, result)
		return result
	}) as T
}

export function nextFrame(): Promise<void> {
	return new Promise(resolve => requestAnimationFrame(() => resolve()))
}
