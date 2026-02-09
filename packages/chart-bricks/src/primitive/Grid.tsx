import type { GridComponentOption } from 'echarts/types/dist/option'

import { defineComponent, computed, watch, type PropType } from 'vue'

import { useChartContext } from '../composables/useChart'
import { declareModules } from '../composables/useModuleCollector'
import { generateId } from '../utils/chartHelpers'

export default defineComponent({
	name: 'Grid',

	props: {
		top: [String, Number],
		bottom: [String, Number],
		right: [String, Number],
		left: [String, Number],

		config: {
			type: Object as PropType<GridComponentOption>,
			default: () => ({}),
		},
	},

	setup(props) {
		const componentFlag = 'grid'
		const componentId = generateId(componentFlag)
		const ctx = useChartContext()
		declareModules(['GridComponent'])

		const options = computed(() => {
			const { config, ...restProps } = props

			const baseOptions: Partial<GridComponentOption & { _rcb_id: string }> = {
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
			} as GridComponentOption
		})

		watch(options, opt => ctx.setOptionByOne(componentId, componentFlag, opt), {
			immediate: true,
			flush: 'post',
		})

		return () => null
	},
})
