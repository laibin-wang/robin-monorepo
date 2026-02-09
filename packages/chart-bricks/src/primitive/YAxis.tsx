import type { YAXisOption } from 'echarts/types/dist/shared'

import { defineComponent, computed, watch, type PropType } from 'vue'

import { useChartContext } from '../composables/useChart'
import { declareModules } from '../composables/useModuleCollector'
import { generateId } from '../utils/chartHelpers'

export default defineComponent({
	name: 'YAxis',

	props: {
		type: {
			type: String as PropType<YAXisOption['type']>,
			default: 'value',
		},
		config: {
			type: Object as PropType<YAXisOption>,
			default: () => ({}),
		},
	},

	setup(props) {
		const componentFlag = 'yAxis'
		const componentId = generateId(componentFlag)
		const ctx = useChartContext()
		declareModules(['GridComponent'])

		const options = computed(() => {
			const { config, ...restProps } = props

			const baseOptions: Partial<YAXisOption & { _rcb_id: string }> = {
				_rcb_id: componentId,
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
			} as YAXisOption
		})

		watch(options, opt => ctx.setOptionByOne(componentId, componentFlag, opt), {
			immediate: true,
			flush: 'post',
		})

		return () => null
	},
})
