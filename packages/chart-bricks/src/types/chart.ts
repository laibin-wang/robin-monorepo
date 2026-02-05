import type { ECBasicOption, EChartsOption, ResizeOpts } from 'echarts/types/dist/shared'
import type { Ref, ShallowRef } from 'vue'

import type { Chart } from '../core/Chart'

export interface DataItem {
	[key: string]: any
}
export type ChartType =
	| 'line'
	| 'bar'
	| 'pie'
	| 'scatter'
	| 'effectScatter'
	| 'radar'
	| 'tree'
	| 'treemap'
	| 'sunburst'
	| 'boxplot'
	| 'candlestick'
	| 'heatmap'
	| 'map'
	| 'parallel'
	| 'lines'
	| 'graph'
	| 'sankey'
	| 'funnel'
	| 'gauge'
	| 'pictorialBar'
	| 'themeRiver'
	| 'custom'

export interface ChartConfig {
	theme?: string | object
	renderer?: 'canvas' | 'svg'
	autoResize?: boolean
	locale?: string
	useDirtyRect?: boolean
	useCoarsePointer?: boolean
	pointerSize?: number
}

export interface UpdateOptions {
	notMerge?: boolean
	lazyUpdate?: boolean
	silent?: boolean
	replaceMerge?: string | string[]
}

export interface ChartContext {
	chart: Chart
	setOption: (option: EChartsOption, opts?: UpdateOptions) => void
	resize: (opts?: ResizeOpts) => void
	dispatchAction: (payload: any) => void
	on: (event: string, handler: Function) => void
	off: (event: string, handler: Function) => void
	showLoading: (opts?: any) => void
	hideLoading: () => void
	clear: () => void
	getOption: () => any
}

export interface UseChartOptions {
	config?: ChartConfig
	id?: string
	onReady?: (chart: Chart) => void
	onError?: (error: Error) => void
}

export interface UseChartReturn {
	chartRef: Ref<HTMLElement | null>
	chart: ShallowRef<Chart | null>
	isReady: Ref<boolean>
	error: Ref<Error | null>
	on: (event: string, handler: Function) => void
	off: (event: string, handler: Function) => void
	setOption: (option: EChartsOption, opts?: UpdateOptions) => void
	resize: (opts: ResizeOpts) => void
	dispatchAction: (payload: any) => void
	showLoading: (opts?: object) => void
	hideLoading: () => void
	clear: () => void
	dispose: () => void
	getOption: () => ECBasicOption | undefined
}

export interface Breakpoint {
	name: string
	min?: number
	max?: number
	option?: any
}
