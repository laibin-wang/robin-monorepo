import { use } from 'echarts/core'

// 异步加载器映射
export const MODULE_LOADERS = {
	// 渲染器
	canvas: () => import('echarts/renderers').then(m => m.CanvasRenderer),
	svg: () => import('echarts/renderers').then(m => m.SVGRenderer),

	// 组件
	GridComponent: () => import('echarts/components').then(m => m.GridComponent),
	TooltipComponent: () => import('echarts/components').then(m => m.TooltipComponent),
	LegendComponent: () => import('echarts/components').then(m => m.LegendComponent),
	TitleComponent: () => import('echarts/components').then(m => m.TitleComponent),
	DatasetComponent: () => import('echarts/components').then(m => m.DatasetComponent),
	DataZoomComponent: () => import('echarts/components').then(m => m.DataZoomComponent),
	VisualMapComponent: () => import('echarts/components').then(m => m.VisualMapComponent),
	GraphicComponent: () => import('echarts/components').then(m => m.GraphicComponent),
	PolarComponent: () => import('echarts/components').then(m => m.PolarComponent),
	RadarComponent: () => import('echarts/components').then(m => m.RadarComponent),
	GeoComponent: () => import('echarts/components').then(m => m.GeoComponent),

	// 图表
	BarChart: () => import('echarts/charts').then(m => m.BarChart),
	LineChart: () => import('echarts/charts').then(m => m.LineChart),
	PieChart: () => import('echarts/charts').then(m => m.PieChart),
	ScatterChart: () => import('echarts/charts').then(m => m.ScatterChart),
	RadarChart: () => import('echarts/charts').then(m => m.RadarChart),
	MapChart: () => import('echarts/charts').then(m => m.MapChart),
	TreeChart: () => import('echarts/charts').then(m => m.TreeChart),
	TreemapChart: () => import('echarts/charts').then(m => m.TreemapChart),
	GraphChart: () => import('echarts/charts').then(m => m.GraphChart),
	GaugeChart: () => import('echarts/charts').then(m => m.GaugeChart),
	FunnelChart: () => import('echarts/charts').then(m => m.FunnelChart),
	HeatmapChart: () => import('echarts/charts').then(m => m.HeatmapChart),
	BoxplotChart: () => import('echarts/charts').then(m => m.BoxplotChart),
	CandlestickChart: () => import('echarts/charts').then(m => m.CandlestickChart),
	EffectScatterChart: () => import('echarts/charts').then(m => m.EffectScatterChart),
	LinesChart: () => import('echarts/charts').then(m => m.LinesChart),
	PictorialBarChart: () => import('echarts/charts').then(m => m.PictorialBarChart),
	ThemeRiverChart: () => import('echarts/charts').then(m => m.ThemeRiverChart),
	SunburstChart: () => import('echarts/charts').then(m => m.SunburstChart),
	CustomChart: () => import('echarts/charts').then(m => m.CustomChart),
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
