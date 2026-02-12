import type { ResizeOpts } from 'echarts/types/dist/shared'

import {
	inject,
	nextTick,
	onMounted,
	onUnmounted,
	provide,
	reactive,
	ref,
	shallowRef,
	useTemplateRef,
	type InjectionKey,
} from 'vue'

import type {
	CartesianGridOption,
	ChartContext,
	EChartsFullOption,
	UpdateOptions,
	UseChartOptions,
	UseChartReturn,
} from '../types'

import { Chart } from '../core/Chart'
import { ChartManager } from '../core/ChartManager'
import Loading from '../core/PureLoading'
import { generateId } from '../utils/chartHelpers'
import { createOptimizedResizeHandler } from '../utils/resizeOptimizer'
import { createModuleCollector, ModuleCollectorKey } from './useModuleCollector'
interface ComponentData {
	type: string
	option: EChartsFullOption
}

export const ChartKey: InjectionKey<Partial<ChartContext>> = Symbol('ChartContext')

export function useChart(options: UseChartOptions = {}): UseChartReturn {
	const { config = {}, initialModules = [], id = generateId('ins'), onReady, onError } = options

	const containerRef = useTemplateRef<HTMLElement | null>('chartBrickRef')
	const chart = shallowRef<Chart | null>(null)
	const isReady = ref(false)
	const error = ref<Error | null>(null)
	const loader = ref<Loading | null>(null)

	const componentOptions = reactive({
		data: new Map<string, ComponentData>(),
		version: 0,
	})
	const optionCache = {
		value: null as EChartsFullOption | null,
		hash: '',
	}
	const computeOptionHash = () => {
		const entries = Array.from(componentOptions.data.entries())
		return entries
			.map(([key, { type, option }]) => `${key}:${type}:${JSON.stringify(option)}`)
			.join('|')
	}
	const computeUpdatedOption = (updatedComponentIds?: string[]): EChartsFullOption => {
		const currentHash = computeOptionHash()

		// 如果缓存有效且没有指定更新的组件ID，返回缓存
		if (optionCache.value && optionCache.hash === currentHash && !updatedComponentIds?.length) {
			return optionCache.value
		}

		const result: EChartsFullOption = {}
		const groupedOptions = new Map<string, any[]>()

		// 如果指定了更新的组件ID，只处理这些组件
		const entriesToProcess = updatedComponentIds
			? updatedComponentIds
					.map(id => {
						const val = componentOptions.data.get(id)
						return val ? ([id, val] as const) : null
					})
					.filter((entry): entry is readonly [string, ComponentData] => entry !== null)
			: Array.from(componentOptions.data.entries())

		entriesToProcess.forEach(([_, { type = '', option = {} }]) => {
			if (!groupedOptions.has(type)) {
				groupedOptions.set(type, [])
			}
			groupedOptions.get(type)!.push(option)
		})

		groupedOptions.forEach((optionsArray, type) => {
			if (type === 'cartesianGrid') {
				const gridOption = optionsArray[0] as CartesianGridOption
				if (gridOption.xAxis) result.xAxis = gridOption.xAxis
				if (gridOption.yAxis) result.yAxis = gridOption.yAxis
				if (gridOption.grid) result.grid = gridOption.grid
			} else {
				;(result as any)[type] = optionsArray.length === 1 ? optionsArray[0] : optionsArray
			}
		})

		// 更新缓存
		optionCache.value = result
		optionCache.hash = currentHash

		return result
	}

	const manager = ChartManager.getInstance()
	const { collector } = createModuleCollector()

	provide(ModuleCollectorKey, collector)

	const updateQueue = new Set<string>()
	let updateTimer: ReturnType<typeof setTimeout> | null = null

	const scheduleUpdate = (componentId: string) => {
		updateQueue.add(componentId)

		if (updateTimer) {
			clearTimeout(updateTimer)
		}

		// 使用 microtask 延迟更新
		updateTimer = setTimeout(() => {
			if (chart.value && isReady.value && updateQueue.size > 0) {
				// 只更新变化的组件
				const updatedOption = computeUpdatedOption(Array.from(updateQueue))
				chart.value.setOption(updatedOption, { notMerge: false })
			}
			updateQueue.clear()
			updateTimer = null
		}, 0)
	}

	provide(ChartKey, {
		chart: chart,
		setOptionByOne: (componentId, type, option) => {
			if (!option) return

			const oldValue = componentOptions.data.get(componentId)
			// 只有选项变化时才更新
			if (!oldValue || JSON.stringify(oldValue.option) !== JSON.stringify(option)) {
				componentOptions.data.set(componentId, { type, option } as ComponentData)
				componentOptions.version++ // 触发响应式更新
				scheduleUpdate(componentId)
			}
			console.log('setOptionByOne', componentId, type, componentOptions)
		},
		setCartesianGrid: (componentId, opt) => {
			const oldValue = componentOptions.data.get(componentId)

			if (!oldValue || JSON.stringify(oldValue.option) !== JSON.stringify(opt)) {
				componentOptions.data.set(componentId, {
					type: 'cartesianGrid',
					option: opt,
				} as ComponentData)
				componentOptions.version++
				scheduleUpdate(componentId)
			}
			console.log('setCartesianGrid', componentId, opt)
		},
	})

	const resizeHandler = createOptimizedResizeHandler(
		(size: { width: number; height: number }) => {
			if (chart.value && isReady.value) {
				chart.value.resize({ width: size.width, height: size.height })
			}
		},
		config.debounce || 100,
		config.throttle || 0,
	)

	const initChart = async () => {
		if (!containerRef.value) {
			error.value = new Error('Container element not found')
			onError?.(error.value)
			return
		}
		loader.value = new Loading({ id, target: containerRef.value.parentNode as HTMLElement })
		loader.value.start({ text: '正在加载...' })

		try {
			// 测量初始化性能
			const startTime = performance.now()

			const instance = new Chart(containerRef.value, config)
			// await new Promise(resolve => setTimeout(resolve, 5000))
			// await new Promise(resolve => setTimeout(resolve, 5000))

			// 收集所有需要的模块
			const declaredModules = collector.getAll()
			const allModules = [...new Set([...initialModules, ...declaredModules])]
			console.log('Loading modules:', allModules)

			// 按需加载模块
			instance.require(...allModules)
			await instance.init()
			loader.value.start({
				text: '加在所需要的模块...',
			})
			const initTime = performance.now() - startTime
			console.log(`Chart initialized in ${initTime.toFixed(2)}ms with modules:`, allModules)

			chart.value = instance
			manager.register(id, instance)
			isReady.value = true

			// 初始设置选项
			if (componentOptions.data.size > 0) {
				const initialOption = computeUpdatedOption()
				instance.setOption(initialOption, { notMerge: false })
			}
			onReady?.(instance)
			loader.value.end()
		} catch (err) {
			loader.value.end()
			error.value = err instanceof Error ? err : new Error(String(err))
			console.error('Chart initialization failed:', error.value)
			onError?.(error.value)
		}
	}

	onMounted(() => {
		nextTick(() => {
			initChart()
		})
	})

	onUnmounted(() => {
		manager.dispose(id)
		chart.value?.dispose()
		resizeHandler.cancel()
		isReady.value = false
		componentOptions.data.clear()
		optionCache.value = null
		optionCache.hash = ''

		if (updateTimer) {
			clearTimeout(updateTimer)
			updateTimer = null
		}
		updateQueue.clear()
		if (loader.value) {
			loader.value.end(true)
			loader.value = null
		}
	})

	return {
		chartRef: containerRef,
		chart,
		isReady,
		error,
		setOption: (opt: EChartsFullOption, opts: UpdateOptions = {}) =>
			chart.value?.setOption(opt, opts),
		resize: (opts: ResizeOpts) => {
			if (typeof opts === 'object' && 'width' in opts && 'height' in opts) {
				resizeHandler(opts as any)
			} else {
				chart.value?.resize(opts)
			}
		},
		dispatchAction: payload => chart.value?.dispatchAction(payload),
		on: (event: string, handler: Function) => chart.value?.on(event, handler),
		off: (event: string, handler: Function) => chart.value?.off(event, handler),
		showLoading: opts => chart.value?.showLoading(opts),
		hideLoading: () => chart.value?.hideLoading(),
		clear: () => chart.value?.clear(),
		dispose: () => chart.value?.dispose(),
		getOption: () => chart.value?.getOption(),
		getPerformance: () => ({
			componentCount: componentOptions.data.size,
			cacheHit: optionCache.value !== null,
			updateQueueSize: updateQueue.size,
		}),
	}
}
export function useChartContext(): ChartContext {
	const ctx = inject<ChartContext>(ChartKey)
	if (!ctx) {
		throw new Error('useChartContext must be used inside a Chart component')
	}
	return ctx
}
