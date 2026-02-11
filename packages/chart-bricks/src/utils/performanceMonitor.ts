// utils/performanceMonitor.ts
export interface PerformanceMetric {
	name: string
	duration: number
	timestamp: number
	meta?: Record<string, any>
}

export interface PerformanceStats {
	initTime: number
	updateCount: number
	avgUpdateTime: number
	cacheHitRate: number
	componentCount: number
	totalModules: number
	memoryUsage?: {
		jsHeapSize: number
		jsHeapTotal: number
		usedJSHeapSize: number
	}
}

interface PerfLogger {
	log: (message: string, ...args: any[]) => void
	warn: (message: string, ...args: any[]) => void
	error: (message: string, ...args: any[]) => void
	debug: (message: string, ...args: any[]) => void
}

class PerformanceMonitor {
	private metrics: PerformanceMetric[] = []
	private stats: Partial<PerformanceStats> = {}
	private isEnabled = process.env.NODE_ENV !== 'production'
	private logLevel: 'debug' | 'info' | 'warn' | 'error' = 'info'
	private memoryCheckInterval?: number

	private readonly logger: PerfLogger = {
		log: (message: string, ...args: any[]) => {
			if (this.isEnabled && this.logLevel === 'info') {
				console.log(`[Chart-Perf] ${message}`, ...args)
			}
		},
		warn: (message: string, ...args: any[]) => {
			if (this.isEnabled && (this.logLevel === 'info' || this.logLevel === 'warn')) {
				console.warn(`[Chart-Perf] ${message}`, ...args)
			}
		},
		error: (message: string, ...args: any[]) => {
			console.error(`[Chart-Perf] ${message}`, ...args)
		},
		debug: (message: string, ...args: any[]) => {
			if (this.isEnabled && this.logLevel === 'debug') {
				console.debug(`[Chart-Perf] ${message}`, ...args)
			}
		},
	}

	constructor() {
		if (this.isEnabled && 'memory' in performance) {
			this.startMemoryMonitoring()
		}
	}

	start(name: string, meta?: Record<string, any>): () => PerformanceMetric {
		if (!this.isEnabled) return () => ({ name, duration: 0, timestamp: Date.now() })

		const startTime = performance.now()
		const startMemory = this.getMemoryUsage()

		return () => {
			const duration = performance.now() - startTime
			const endMemory = this.getMemoryUsage()
			const memoryDiff = startMemory
				? {
						heapUsed: endMemory?.usedJSHeapSize - startMemory?.usedJSHeapSize,
						heapTotal: startMemory?.jsHeapTotal - startMemory?.jsHeapTotal,
					}
				: undefined

			const metric: PerformanceMetric = {
				name,
				duration,
				timestamp: Date.now(),
				meta: {
					...meta,
					memory: memoryDiff,
					startTime,
				},
			}

			this.recordMetric(metric)
			return metric
		}
	}

	recordMetric(metric: PerformanceMetric): void {
		if (!this.isEnabled) return

		this.metrics.push(metric)

		// 保持最近的200个指标
		if (this.metrics.length > 200) {
			this.metrics.splice(0, 100) // 移除前100个，保留后100个
		}

		// 自动警告长时间操作
		if (metric.duration > 50) {
			this.logger.warn(
				`Operation "${metric.name}" took ${metric.duration.toFixed(2)}ms`,
				metric.meta,
			)
		}
	}

	log(message: string, ...args: any[]): void {
		this.logger.log(message, ...args)
	}

	warn(message: string, ...args: any[]): void {
		this.logger.warn(message, ...args)
	}

	error(message: string, ...args: any[]): void {
		this.logger.error(message, ...args)
	}

	debug(message: string, ...args: any[]): void {
		this.logger.debug(message, ...args)
	}

	getStats(): PerformanceStats {
		const updateMetrics = this.metrics.filter(
			m => m.name.startsWith('update') || m.name === 'setOption',
		)
		const initMetrics = this.metrics.filter(m => m.name === 'init')
		const moduleLoadMetrics = this.metrics.filter(m => m.name === 'module-load')

		const totalUpdates = updateMetrics.length
		const totalUpdateTime = updateMetrics.reduce((sum, m) => sum + m.duration, 0)

		const cacheMetrics = this.metrics.filter(m => m.name === 'cache-hit' || m.name === 'cache-miss')
		const hits = cacheMetrics.filter(m => m.name === 'cache-hit').length
		const misses = cacheMetrics.filter(m => m.name === 'cache-miss').length

		const memoryUsage = this.getMemoryUsage()

		return {
			initTime: initMetrics[0]?.duration || 0,
			updateCount: totalUpdates,
			avgUpdateTime: totalUpdates > 0 ? totalUpdateTime / totalUpdates : 0,
			cacheHitRate: hits + misses > 0 ? hits / (hits + misses) : 0,
			componentCount: this.stats.componentCount || 0,
			totalModules: moduleLoadMetrics.length,
			memoryUsage: memoryUsage,
		}
	}

	private getMemoryUsage(): PerformanceStats['memoryUsage'] {
		if ('memory' in performance) {
			const memory = (performance as any).memory
			return {
				jsHeapSize: memory.jsHeapSizeLimit,
				jsHeapTotal: memory.totalJSHeapSize,
				usedJSHeapSize: memory.usedJSHeapSize,
			}
		}
		return undefined
	}

	private startMemoryMonitoring(): void {
		if (!this.isEnabled) return

		let lastMemoryCheck = 0
		const checkMemory = () => {
			const now = Date.now()
			if (now - lastMemoryCheck > 10000) {
				// 每10秒检查一次
				const memory = this.getMemoryUsage()
				if (memory && memory.usedJSHeapSize > 0.8 * memory.jsHeapSize) {
					this.warn('High memory usage detected:', {
						used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
						total: `${(memory.jsHeapSize / 1024 / 1024).toFixed(2)}MB`,
						percentage: `${((memory.usedJSHeapSize / memory.jsHeapSize) * 100).toFixed(1)}%`,
					})
				}
				lastMemoryCheck = now
			}
		}

		this.memoryCheckInterval = window.setInterval(checkMemory, 10000)
	}

	setLogLevel(level: 'debug' | 'info' | 'warn' | 'error'): void {
		this.logLevel = level
	}

	enable(): void {
		this.isEnabled = true
	}

	disable(): void {
		this.isEnabled = false
	}

	clear(): void {
		this.metrics = []
		this.stats = {}

		if (this.memoryCheckInterval) {
			clearInterval(this.memoryCheckInterval)
			this.memoryCheckInterval = undefined
		}
	}

	getMetrics(): PerformanceMetric[] {
		return [...this.metrics]
	}

	async exportMetrics(): Promise<string> {
		const stats = this.getStats()
		const metrics = this.getMetrics()

		return JSON.stringify(
			{
				timestamp: new Date().toISOString(),
				stats,
				metrics: metrics.slice(-50), // 只导出最近50个指标
			},
			null,
			2,
		)
	}
}

export const perfMonitor = new PerformanceMonitor()
