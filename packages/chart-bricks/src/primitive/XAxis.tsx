import type { XAXisComponentOption } from 'echarts/types/dist/option'

import { defineComponent, computed, watch, type PropType } from 'vue'

import { useChartContext } from '../composables/useChart'
import { declareModules } from '../composables/useModuleCollector'
import { generateId } from '../utils/chartHelpers'

export default defineComponent({
	name: 'XAxis',

	props: {
		type: {
			type: String as PropType<XAXisComponentOption['type']>,
			default: 'category',
		},
		config: {
			type: Object as PropType<XAXisComponentOption>,
			default: () => ({}),
		},
	},

	setup(props) {
		const componentFlag = 'xAxis'
		const componentId = generateId(componentFlag)
		const ctx = useChartContext()
		declareModules(['GridComponent'])

		const options = computed(() => {
			const { config, ...restProps } = props

			const baseOptions: Partial<XAXisComponentOption> = {
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
			} as XAXisComponentOption
		})

		watch(options, opt => ctx.setOptionByOne(componentId, componentFlag, opt), {
			immediate: true,
			flush: 'post',
		})

		return () => null
	},
})
