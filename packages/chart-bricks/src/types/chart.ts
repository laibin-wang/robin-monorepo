import type {
	DatasetComponentOption,
	GridComponentOption,
	TitleComponentOption,
	TooltipComponentOption,
	XAXisComponentOption,
	YAXisComponentOption,
} from 'echarts/types/dist/option'
import type {
	BarSeriesOption,
	BoxplotSeriesOption,
	CandlestickSeriesOption,
	ComposeOption,
	CustomSeriesOption,
	ECBasicOption,
	EChartsOption,
	EffectScatterSeriesOption,
	FunnelSeriesOption,
	GaugeSeriesOption,
	GraphSeriesOption,
	HeatmapSeriesOption,
	LegendComponentOption,
	LineSeriesOption,
	LinesSeriesOption,
	MapSeriesOption,
	ParallelSeriesOption,
	PictorialBarSeriesOption,
	PieSeriesOption,
	RadarSeriesOption,
	ResizeOpts,
	SankeySeriesOption,
	ScatterSeriesOption,
	SunburstSeriesOption,
	ThemeRiverSeriesOption,
	TreemapSeriesOption,
	TreeSeriesOption,
	XAXisOption,
	YAXisOption,
} from 'echarts/types/dist/shared'
import type { Ref, ShallowRef } from 'vue'

import type { Chart } from '../core/Chart'
import type { ModuleName } from './register'

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

export type SeriesOptionType =
	| LineSeriesOption
	| BarSeriesOption
	| PieSeriesOption
	| ScatterSeriesOption
	| RadarSeriesOption
	| HeatmapSeriesOption
	| GraphSeriesOption
	| MapSeriesOption
	| LinesSeriesOption
	| GaugeSeriesOption
	| BoxplotSeriesOption
	| TreeSeriesOption
	| TreemapSeriesOption
	| SunburstSeriesOption
	| ParallelSeriesOption
	| SankeySeriesOption
	| FunnelSeriesOption
	| PictorialBarSeriesOption
	| ThemeRiverSeriesOption
	| CustomSeriesOption

export type EChartsFullOption = ComposeOption<
	| TitleComponentOption
	| TooltipComponentOption
	| GridComponentOption
	| LegendComponentOption
	| DatasetComponentOption
	| XAXisOption
	| YAXisOption
	| LineSeriesOption
	| BarSeriesOption
	| PieSeriesOption
	| ScatterSeriesOption
	| RadarSeriesOption
	| GaugeSeriesOption
	| HeatmapSeriesOption
	| GraphSeriesOption
	| TreeSeriesOption
	| TreemapSeriesOption
	| SunburstSeriesOption
	| ParallelSeriesOption
	| SankeySeriesOption
	| FunnelSeriesOption
	| BoxplotSeriesOption
	| CandlestickSeriesOption
	| EffectScatterSeriesOption
	| LinesSeriesOption
	| PictorialBarSeriesOption
	| ThemeRiverSeriesOption
	| CustomSeriesOption
>

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

export interface UseChartOptions {
	initialModules?: ModuleName[]
	config?: ChartConfig
	id?: string
	onReady?: (chart: Chart) => void
	onError?: (error: Error) => void
}

export interface UseChartReturn {
	chartRef: Ref<HTMLElement | null>
	chart: ShallowRef<Chart | null>
	isReady: Ref<boolean>
	isLoading: Ref<boolean>
	error: Ref<Error | null>
	on: (event: string, handler: Function) => void
	off: (event: string, handler: Function) => void
	setOption: (option: EChartsFullOption, opts?: UpdateOptions) => void
	resize: (opts: ResizeOpts) => void
	dispatchAction: (payload: any) => void
	showLoading: (opts?: object) => void
	hideLoading: () => void
	clear: () => void
	dispose: () => void
	getOption: () => ECBasicOption | undefined
	getPerformance: () => void
}

export interface Breakpoint {
	name: string
	min?: number
	max?: number
	option?: any
}

export interface CartesianGridOption {
	yAxis: YAXisComponentOption | YAXisComponentOption[]
	xAxis: XAXisComponentOption | XAXisComponentOption[]
	grid?: GridComponentOption | GridComponentOption[]
}

type SetOptionKey = keyof EChartsOption

export interface ChartContext {
	chart: ShallowRef<Chart | null>
	setCartesianGrid(opt: CartesianGridOption): void
	setOptionByOne<K extends SetOptionKey>(
		id: string,
		type: K,
		option: Exclude<EChartsOption[K], any[]>,
	): void
	// addTitle: (titleConfig: TitleComponentOption) => void;
	// addLegend: (legendConfig: LegendComponentOption) => void;
	// addXAxis: (xAxisConfig: XAXisComponentOption) => void;
	// addYAxis: (yAxisConfig: YAXisComponentOption) => void;
	// addSeries: (seriesConfig: SeriesOptionType) => void;
	// setTooltip: (tooltipConfig: TooltipComponentOption) => void;
	// setGrid: (gridConfig: GridComponentOption) => void;
	// removeSeries: (seriesIndex: number) => void;
	// getOption: () => EChartsOption;
	// setOption: (option: EChartsOption, opts?: UpdateOptions) => void
	// resize: (opts?: ResizeOpts) => void
	// dispatchAction: (payload: any) => void
	// on: (event: string, handler: Function) => void
	// off: (event: string, handler: Function) => void
	// showLoading: (opts?: any) => void
	// hideLoading: () => void
	// clear: () => void
	// getOption: () => any
	// data?: () => void
}
