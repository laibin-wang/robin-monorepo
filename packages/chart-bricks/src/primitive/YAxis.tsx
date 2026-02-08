import type { YAXisComponentOption } from 'echarts/types/dist/option'

import { defineComponent, computed, watch, type PropType } from 'vue'

import { useChartContext } from '../composables/useChart'
import { declareModules } from '../composables/useModuleCollector'
import { generateId } from '../utils/chartHelpers'

export default defineComponent({
	name: 'YAxis',

	props: {
		type: {
			type: String as PropType<YAXisComponentOption['type']>,
			default: 'value',
		},
		config: {
			type: Object as PropType<YAXisComponentOption>,
			default: () => ({}),
		},
		name: String as PropType<YAXisComponentOption['name']>,
		position: {
			type: String as PropType<YAXisComponentOption['position']>,
			default: 'left',
		},
		nameLocation: {
			type: String as PropType<YAXisComponentOption['nameLocation']>,
			default: 'end',
		},
		nameGap: Number as PropType<YAXisComponentOption['nameGap']>,
		min: [Number, String, Function] as PropType<YAXisComponentOption['min']>,
		max: [Number, String, Function] as PropType<YAXisComponentOption['max']>,
		interval: Number,
	},

	setup(props) {
		const componentFlag = 'yAxis'
		const componentId = generateId(componentFlag)
		const ctx = useChartContext()
		declareModules(['GridComponent'])

		const options = computed(() => {
			const { config, ...restProps } = props

			const baseOptions: Partial<YAXisComponentOption> = {
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
			} as YAXisComponentOption
		})

		watch(options, opt => ctx.setOptionByOne(componentId, componentFlag, opt), {
			immediate: true,
			flush: 'post',
		})

		return () => null
	},
})
