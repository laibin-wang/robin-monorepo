import type { GridComponentOption } from 'echarts/types/dist/option'
import type { XAXisOption, YAXisOption } from 'echarts/types/dist/shared'

import { defineComponent, computed, type PropType, watchEffect, nextTick, onUnmounted } from 'vue'

import type { CartesianGridOption } from '../types'

import { useChartContext } from '../composables/useChart'
import { declareModules } from '../composables/useModuleCollector'
import { generateId } from '../utils/chartHelpers'

export default defineComponent({
	name: 'CartesianGrid',

	props: {
		grid: {
			type: [Array, Object] as PropType<GridComponentOption | GridComponentOption[]>,
		},
		xAxis: {
			type: [Array, Object] as PropType<XAXisOption | XAXisOption[]>,
			default: () => {},
		},
		yAxis: {
			type: [Array, Object] as PropType<YAXisOption | YAXisOption[]>,
			default: () => {},
		},
	},

	setup(props) {
		const componentFlag = 'cartesianGrid'
		const componentId = generateId(componentFlag)
		const ctx = useChartContext()
		declareModules(['GridComponent', 'UniversalTransition'])
		console.log('createChartComponent', 'CartesianGrid', componentFlag, componentId)

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
					...item,
				}))
			} else {
				return {
					...props.grid,
				}
			}
		})

		const xAxisOptions = computed<XAXisOption | XAXisOption[]>(() => {
			const xAxis = props.xAxis

			if (isXAxisArray(xAxis)) {
				return xAxis.map(item => ({
					type: 'category',
					...item,
				})) as XAXisOption[]
			} else {
				return {
					type: 'category',
					...xAxis,
				} as XAXisOption
			}
		})

		const yAxisOptions = computed<YAXisOption | YAXisOption[]>(() => {
			const yAxis = props.yAxis

			if (isYAxisArray(yAxis)) {
				return yAxis.map(item => ({
					type: 'value',
					...item,
				})) as YAXisOption[]
			} else {
				return {
					type: 'value',
					...yAxis,
				} as YAXisOption
			}
		})

		const options = computed<CartesianGridOption>(() => {
			const result: CartesianGridOption = {
				xAxis: xAxisOptions.value,
				yAxis: yAxisOptions.value,
			}

			const gridValue = gridOptions.value
			if (gridValue) {
				result.grid = gridValue
			}

			return result
		})

		watchEffect(() => {
			const opt = options.value // 自动追踪
			nextTick(() => {
				ctx.setCartesianGrid(componentId, opt)
			})
		})

		onUnmounted(() => {
			// 清理图表实例
			// ctx.removeOption(componentId)
		})
		return () => null
	},
})
