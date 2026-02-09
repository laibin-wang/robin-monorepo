import type {
	GridComponentOption,
	YAXisComponentOption,
	XAXisComponentOption,
} from 'echarts/types/dist/option'
import type { EChartsOption, XAXisOption, YAXisOption } from 'echarts/types/dist/shared'

import { defineComponent, computed, watch, type PropType } from 'vue'

import type { CartesianGridOption } from '../types'

import { useChartContext } from '../composables/useChart'
import { declareModules } from '../composables/useModuleCollector'
import {
	DEFAULT_GRID_CONFIG,
	DEFAULT_XAXIS_CONFIG,
	DEFAULT_YAXIS_CONFIG,
} from '../constants/defaultConfig'
import { generateId } from '../utils/chartHelpers'

export default defineComponent({
	name: 'CartesianGrid',

	props: {
		grid: {
			type: [Array, Object] as PropType<GridComponentOption | GridComponentOption[]>,
			default: undefined,
		},
		xAxis: {
			type: [Array, Object] as PropType<XAXisOption | XAXisOption[]>,
			default: () => DEFAULT_XAXIS_CONFIG,
		},
		yAxis: {
			type: [Array, Object] as PropType<YAXisOption | YAXisOption[]>,
			default: () => DEFAULT_YAXIS_CONFIG,
		},
	},

	setup(props) {
		const componentFlag = 'cartesianGrid'
		const componentId = generateId(componentFlag)
		const ctx = useChartContext()
		declareModules(['GridComponent', 'UniversalTransition'])

		// 使用类型守卫函数来明确类型
		const isGridArray = (
			value: GridComponentOption | GridComponentOption[],
		): value is GridComponentOption[] => {
			return Array.isArray(value)
		}

		const isXAxisArray = (value: XAXisOption | XAXisOption[]): value is XAXisOption[] => {
			return Array.isArray(value)
		}

		const isYAxisArray = (value: YAXisOption | YAXisOption[]): value is YAXisOption[] => {
			return Array.isArray(value)
		}

		const gridOptions = computed<GridComponentOption | GridComponentOption[] | undefined>(() => {
			if (!props.grid) return undefined

			if (isGridArray(props.grid)) {
				return props.grid.map(item => ({
					...DEFAULT_GRID_CONFIG,
					...item,
				}))
			} else {
				return {
					...DEFAULT_GRID_CONFIG,
					...props.grid,
				}
			}
		})

		const xAxisOptions = computed<XAXisOption | XAXisOption[]>(() => {
			const xAxis = props.xAxis

			if (isXAxisArray(xAxis)) {
				return xAxis.map(item => ({
					...DEFAULT_XAXIS_CONFIG,
					...item,
				})) as XAXisOption[]
			} else {
				return {
					...DEFAULT_XAXIS_CONFIG,
					...xAxis,
				} as XAXisOption
			}
		})

		const yAxisOptions = computed<YAXisOption | YAXisOption[]>(() => {
			const yAxis = props.yAxis

			if (isYAxisArray(yAxis)) {
				return yAxis.map(item => ({
					...DEFAULT_YAXIS_CONFIG,
					...item,
				})) as YAXisOption[]
			} else {
				return {
					...DEFAULT_YAXIS_CONFIG,
					...yAxis,
				} as YAXisOption
			}
		})

		const option = computed<CartesianGridOption>(() => {
			const result: CartesianGridOption = {
				xAxis: xAxisOptions.value,
				yAxis: yAxisOptions.value,
			}

			const gridValue = gridOptions.value
			if (gridValue !== undefined) {
				result.grid = gridValue
			}

			return result
		})

		watch(option, opt => ctx.setCartesianGrid(opt), { immediate: true, deep: true })

		console.log('CartesianGrid component initialized with ID:', componentId)

		return () => null
	},
})
