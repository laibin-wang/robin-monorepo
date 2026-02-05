import type {
	EChartsOption,
	SeriesOption,
	XAXisComponentOption,
	YAXisComponentOption,
	GridComponentOption,
	LegendComponentOption,
	TooltipComponentOption,
	DataZoomComponentOption,
	VisualMapComponentOption,
	ToolboxComponentOption,
} from 'echarts'

export interface ChartOptions extends EChartsOption {
	series?: SeriesOption | SeriesOption[]
	xAxis?: XAXisComponentOption | XAXisComponentOption[]
	yAxis?: YAXisComponentOption | YAXisComponentOption[]
	grid?: GridComponentOption | GridComponentOption[]
	legend?: LegendComponentOption
	tooltip?: TooltipComponentOption
	dataZoom?: DataZoomComponentOption | DataZoomComponentOption[]
	visualMap?: VisualMapComponentOption | VisualMapComponentOption[]
	toolbox?: ToolboxComponentOption
}

export type SeriesConfig = SeriesOption & {
	dataKey?: string
	nameKey?: string
	valueKey?: string
}
