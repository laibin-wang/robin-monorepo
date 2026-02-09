export class PerfMonitor {
	private measures = new Map<string, number[]>()
	private thresholds = new Map<string, number>()

	constructor() {
		this.thresholds.set('chart_update', 16)
		this.thresholds.set('chart_init', 300)
		this.thresholds.set('module_load', 100)
	}

	start(measureName: string): () => void {
		const startTime = performance.now()

		return () => {
			const duration = performance.now() - startTime
			this.record(measureName, duration)

			const threshold = this.thresholds.get(measureName)
			if (threshold && duration > threshold) {
				console.warn(`${measureName} took too long: ${duration.toFixed(2)}ms`)
			}
		}
	}

	record(measureName: string, duration: number): void {
		if (!this.measures.has(measureName)) {
			this.measures.set(measureName, [])
		}

		const measures = this.measures.get(measureName)!
		measures.push(duration)

		if (measures.length > 100) {
			measures.shift()
		}
	}

	getStats(measureName: string): {
		avg: number
		min: number
		max: number
		count: number
	} | null {
		const measures = this.measures.get(measureName)
		if (!measures || measures.length === 0) return null

		const sum = measures.reduce((a, b) => a + b, 0)
		const avg = sum / measures.length
		const min = Math.min(...measures)
		const max = Math.max(...measures)

		return { avg, min, max, count: measures.length }
	}

	logReport(): void {
		console.group('Performance Report')
		for (const [name, measures] of this.measures) {
			const stats = this.getStats(name)
			if (stats) {
				console.log(`${name}: ${stats.avg.toFixed(2)}ms avg (${stats.count} samples)`)
			}
		}
		console.groupEnd()
	}
}

export const perfMonitor = new PerfMonitor()
