import { use } from 'echarts/core'

// 异步加载器映射
export const MODULE_LOADERS = {
	// 渲染器
	canvas: () => import('echarts/renderers').then(m => m.CanvasRenderer),
	svg: () => import('echarts/renderers').then(m => m.SVGRenderer),

	// 组件
	TitleComponent: () => import('echarts/components').then(m => m.TitleComponent),
	TooltipComponent: () => import('echarts/components').then(m => m.TooltipComponent),
	GridComponent: () => import('echarts/components').then(m => m.GridComponent),
	LegendComponent: () => import('echarts/components').then(m => m.LegendComponent),
	DatasetComponent: () => import('echarts/components').then(m => m.DatasetComponent),
	DataZoomComponent: () => import('echarts/components').then(m => m.DataZoomComponent),
	VisualMapComponent: () => import('echarts/components').then(m => m.VisualMapComponent),
	ToolboxComponent: () => import('echarts/components').then(m => m.ToolboxComponent),
	BrushComponent: () => import('echarts/components').then(m => m.BrushComponent),
	TimelineComponent: () => import('echarts/components').then(m => m.TimelineComponent),
	GraphicComponent: () => import('echarts/components').then(m => m.GraphicComponent),
	CalendarComponent: () => import('echarts/components').then(m => m.CalendarComponent),
	PolarComponent: () => import('echarts/components').then(m => m.PolarComponent),
	RadarComponent: () => import('echarts/components').then(m => m.RadarComponent),
	SingleAxisComponent: () => import('echarts/components').then(m => m.SingleAxisComponent),
	MarkPointComponent: () => import('echarts/components').then(m => m.MarkPointComponent),
	MarkLineComponent: () => import('echarts/components').then(m => m.MarkLineComponent),
	MarkAreaComponent: () => import('echarts/components').then(m => m.MarkAreaComponent),
	GeoComponent: () => import('echarts/components').then(m => m.GeoComponent),

	// 图表
	LineChart: () => import('echarts/charts').then(m => m.LineChart),
	BarChart: () => import('echarts/charts').then(m => m.BarChart),
	PieChart: () => import('echarts/charts').then(m => m.PieChart),
	ScatterChart: () => import('echarts/charts').then(m => m.ScatterChart),
	RadarChart: () => import('echarts/charts').then(m => m.RadarChart),
	GaugeChart: () => import('echarts/charts').then(m => m.GaugeChart),
	HeatmapChart: () => import('echarts/charts').then(m => m.HeatmapChart),
	GraphChart: () => import('echarts/charts').then(m => m.GraphChart),
	MapChart: () => import('echarts/charts').then(m => m.MapChart),
	TreeChart: () => import('echarts/charts').then(m => m.TreeChart),
	TreemapChart: () => import('echarts/charts').then(m => m.TreemapChart),
	SunburstChart: () => import('echarts/charts').then(m => m.SunburstChart),
	ParallelChart: () => import('echarts/charts').then(m => m.ParallelChart),
	SankeyChart: () => import('echarts/charts').then(m => m.SankeyChart),
	FunnelChart: () => import('echarts/charts').then(m => m.FunnelChart),
	BoxplotChart: () => import('echarts/charts').then(m => m.BoxplotChart),
	CandlestickChart: () => import('echarts/charts').then(m => m.CandlestickChart),
	EffectScatterChart: () => import('echarts/charts').then(m => m.EffectScatterChart),
	LinesChart: () => import('echarts/charts').then(m => m.LinesChart),
	PictorialBarChart: () => import('echarts/charts').then(m => m.PictorialBarChart),
	ThemeRiverChart: () => import('echarts/charts').then(m => m.ThemeRiverChart),
	CustomChart: () => import('echarts/charts').then(m => m.CustomChart),

	UniversalTransition: () => import('echarts/features').then(m => m.UniversalTransition),
} as const

export type ModuleName = keyof typeof MODULE_LOADERS

// 记录已注册的模块
const registeredModules = new Set<string>()

// 异步注册单个模块
export async function registerModule(name: ModuleName): Promise<void> {
	if (registeredModules.has(name)) return

	const loader = MODULE_LOADERS[name]
	if (!loader) {
		console.warn(`Unknown module: ${name}`)
		return
	}

	const module = await loader()
	use([module])
	registeredModules.add(name)
}

// 批量注册
export async function registerModules(names: ModuleName[]): Promise<void> {
	const uniqueNames = [...new Set(names)].filter(n => !registeredModules.has(n))
	if (uniqueNames.length === 0) return

	const modules = await Promise.all(uniqueNames.map(name => MODULE_LOADERS[name]()))
	use(modules)
	uniqueNames.forEach(n => registeredModules.add(n))
}

// 检查是否已注册
export function isModuleRegistered(name: ModuleName): boolean {
	return registeredModules.has(name)
}

// 清除注册记录（主要用于测试）
export function clearRegisteredModules(): void {
	registeredModules.clear()
}
