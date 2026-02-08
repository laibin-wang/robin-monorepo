import type {
	GridComponentOption,
	YAXisComponentOption,
	XAXisComponentOption,
} from 'echarts/types/dist/option'
import type { EChartsOption } from 'echarts/types/dist/shared'

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
			type: [Array, Object] as PropType<EChartsOption['grid']>,
			default: undefined,
		},
		xAxis: {
			type: [Array, Object] as PropType<EChartsOption['xAxis']>,
			default: () => DEFAULT_XAXIS_CONFIG,
		},
		yAxis: {
			type: [Array, Object] as PropType<EChartsOption['yAxis']>,
			default: () => DEFAULT_YAXIS_CONFIG,
		},
	},

	setup(props) {
		const componentFlag = 'cartesianGrid'
		const componentId = generateId(componentFlag)
		const ctx = useChartContext()
		declareModules(['GridComponent', 'UniversalTransition'])

		// 使用类型守卫函数来明确类型
		const isGridArray = (value: EChartsOption['grid']): value is GridComponentOption[] => {
			return Array.isArray(value)
		}

		const isXAxisArray = (value: EChartsOption['xAxis']): value is XAXisComponentOption[] => {
			return Array.isArray(value)
		}

		const isYAxisArray = (value: EChartsOption['yAxis']): value is YAXisComponentOption[] => {
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

		const xAxisOptions = computed<XAXisComponentOption | XAXisComponentOption[]>(() => {
			const xAxis = props.xAxis

			const xAxisType = 'category'
			if (isXAxisArray(xAxis)) {
				return xAxis.map(item => ({
					type: 'category',
					...item,
				}))
			} else {
				return {
					type: 'category',
					...xAxis,
				}
			}
		})

		const yAxisOptions = computed<YAXisComponentOption | YAXisComponentOption[]>(() => {
			const yAxis = props.yAxis

			if (isYAxisArray(yAxis)) {
				return yAxis.map(item => ({
					type: 'value',
					...item,
				}))
			} else {
				return {
					type: 'value',
					...yAxis,
				}
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
