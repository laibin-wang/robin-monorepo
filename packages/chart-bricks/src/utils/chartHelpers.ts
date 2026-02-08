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

export function mergeOptions(...options: EChartsOption[]): EChartsOption {
	return options.reduce((acc, curr) => {
		if (!acc) return curr
		if (!curr) return acc

		return {
			...acc,
			...curr,
			series: [
				...(Array.isArray(acc.series) ? acc.series : acc.series ? [acc.series] : []),
				...(Array.isArray(curr.series) ? curr.series : curr.series ? [curr.series] : []),
			],
			xAxis: curr.xAxis || acc.xAxis,
			yAxis: curr.yAxis || acc.yAxis,
			grid: { ...acc.grid, ...curr.grid },
			legend: { ...acc.legend, ...curr.legend },
			tooltip: { ...acc.tooltip, ...curr.tooltip },
		}
	}, {})
}

export function debounce<T extends (...args: any[]) => any>(
	fn: T,
	delay: number,
): (...args: Parameters<T>) => void {
	let timeoutId: ReturnType<typeof setTimeout>
	return (...args) => {
		clearTimeout(timeoutId)
		timeoutId = setTimeout(() => fn(...args), delay)
	}
}

export function throttle<T extends (...args: any[]) => any>(
	fn: T,
	limit: number,
): (...args: Parameters<T>) => void {
	let inThrottle = false
	return (...args) => {
		if (!inThrottle) {
			fn(...args)
			inThrottle = true
			setTimeout(() => (inThrottle = false), limit)
		}
	}
}

export function deepClone<T>(obj: T): T {
	return JSON.parse(JSON.stringify(obj))
}

export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
	const result = {} as Pick<T, K>
	keys.forEach(key => {
		if (key in obj) result[key] = obj[key]
	})
	return result
}

export function generateId(prefix = 'chart'): string {
	return `${prefix}-${Math.random().toString(36).substring(2, 9)}`
}
