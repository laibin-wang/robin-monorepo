import type { BarSeriesOption, TooltipComponentOption } from 'echarts/types/dist/option'

import { defineComponent, computed, watch, type PropType } from 'vue'

import { useChartContext } from '../composables/useChart'
import { declareModules } from '../composables/useModuleCollector'
import { generateId } from '../utils/chartHelpers'

export default defineComponent({
	name: 'Bar',

	props: {
		name: String,
		data: Array as PropType<BarSeriesOption['data']>,
		formatter: [String, Function] as any,
		config: {
			type: Object as PropType<BarSeriesOption>,
			default: () => ({}),
		},
	},

	setup(props) {
		const componentFlag = 'bar'
		const componentId = generateId(componentFlag)
		const ctx = useChartContext()
		declareModules(['BarChart'])

		const options = computed(() => {
			const { config, ...restProps } = props

			const baseOptions: Partial<BarSeriesOption> = {
				id: componentId,
			}

			Object.keys(restProps).forEach(key => {
				const value = restProps[key as keyof typeof restProps]
				if (value !== undefined && key !== 'config') {
					;(baseOptions as any)[key] = value
				}
			})
			return {
				...baseOptions,
				...config,
				type: 'bar',
			} as BarSeriesOption
		})

		watch(options, opt => ctx.setOptionByOne(componentId, 'series', opt), {
			immediate: true,
			flush: 'post',
		})

		return () => null
	},
})
