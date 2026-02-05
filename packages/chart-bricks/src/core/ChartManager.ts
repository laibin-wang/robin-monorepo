import type { Chart } from './Chart'

export class ChartManager {
	private static instance: ChartManager
	private charts: Map<string, Chart> = new Map()
	private readonly maxInstances: number

	private constructor(maxInstances: number = 20) {
		this.maxInstances = maxInstances
	}

	static getInstance(maxInstances?: number): ChartManager {
		if (!ChartManager.instance) {
			ChartManager.instance = new ChartManager(maxInstances)
		}
		return ChartManager.instance
	}

	register(id: string, chart: Chart): void {
		if (this.charts.size >= this.maxInstances) {
			const firstId = this.charts.keys().next().value
			this.dispose(firstId!)
		}
		this.charts.set(id, chart)
	}

	get(id: string): Chart | undefined {
		return this.charts.get(id)
	}

	has(id: string): boolean {
		return this.charts.has(id)
	}

	dispose(id?: string): void {
		if (id) {
			const chart = this.charts.get(id)
			if (chart) {
				chart.dispose()
				this.charts.delete(id)
			}
		} else {
			this.charts.forEach(chart => chart.dispose())
			this.charts.clear()
		}
	}

	getAll(): Chart[] {
		return Array.from(this.charts.values())
	}

	resizeAll(): void {
		this.charts.forEach(chart => chart.resize())
	}
}
