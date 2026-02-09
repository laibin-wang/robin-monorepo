import type { TooltipComponentOption } from 'echarts/types/dist/option'

import { defineComponent, computed, watch, type PropType } from 'vue'

import { useChartContext } from '../composables/useChart'
import { declareModules } from '../composables/useModuleCollector'
import { generateId } from '../utils/chartHelpers'

export default defineComponent({
	name: 'Tooltip',

	props: {
		trigger: {
			type: String as PropType<TooltipComponentOption['trigger']>,
			default: 'item',
		},
		formatter: [String, Function] as PropType<TooltipComponentOption['formatter']>,

		config: {
			type: Object as PropType<TooltipComponentOption>,
			default: () => ({}),
		},
	},

	setup(props) {
		const componentFlag = 'tooltip'
		const componentId = generateId(componentFlag)
		const ctx = useChartContext()
		declareModules(['TooltipComponent'])

		const options = computed(() => {
			const { config, ...restProps } = props

			const baseOptions: Partial<TooltipComponentOption & { _rcb_id: string }> = {
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
			} as TooltipComponentOption
		})

		watch(options, opt => ctx.setOptionByOne(componentId, componentFlag, opt), {
			immediate: true,
			flush: 'post',
		})

		return () => null
	},
})
