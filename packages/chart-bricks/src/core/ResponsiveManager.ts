import type { Breakpoint } from '../types'
import type { Chart } from './Chart'

export class ResponsiveManager {
	private chart: Chart
	private breakpoints: Breakpoint[]
	private currentBreakpoint: string | null = null
	private resizeObserver: ResizeObserver | null = null

	constructor(chart: Chart, breakpoints: Breakpoint[] = []) {
		this.chart = chart
		this.breakpoints = breakpoints.sort((a, b) => (b.min || 0) - (a.min || 0))
	}

	observe(container: HTMLElement): void {
		if (typeof ResizeObserver === 'undefined') return

		this.resizeObserver = new ResizeObserver(entries => {
			for (const entry of entries) {
				const width = entry.contentRect.width
				this.checkBreakpoint(width)
			}
		})

		this.resizeObserver.observe(container)
	}

	private checkBreakpoint(width: number): void {
		const matched = this.breakpoints.find(bp => {
			const min = bp.min ?? 0
			const max = bp.max ?? Infinity
			return width >= min && width <= max
		})

		if (matched && matched.name !== this.currentBreakpoint) {
			this.currentBreakpoint = matched.name
			this.chart.setOption(matched.option)
		}
	}

	disconnect(): void {
		this.resizeObserver?.disconnect()
		this.resizeObserver = null
	}

	updateBreakpoints(breakpoints: Breakpoint[]): void {
		this.breakpoints = breakpoints.sort((a, b) => (b.min || 0) - (a.min || 0))
	}
}
