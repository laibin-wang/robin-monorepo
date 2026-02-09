import type { TitleComponentOption } from 'echarts/types/dist/option'

import { defineComponent, computed, watch, type PropType } from 'vue'

import { useChartContext } from '../composables/useChart'
import { declareModules } from '../composables/useModuleCollector'
import { generateId } from '../utils/chartHelpers'

export default defineComponent({
	name: 'Title',

	props: {
		text: String,
		subtext: String,
		textAlign: String as PropType<TitleComponentOption['textAlign']>,
		config: {
			type: Object as PropType<TitleComponentOption>,
			default: () => ({}),
		},
	},

	setup(props) {
		const componentFlag = 'title'
		const componentId = generateId(componentFlag)
		const ctx = useChartContext()
		declareModules(['TitleComponent'])

		const options = computed(() => {
			const { config, ...restProps } = props

			const baseOptions: Partial<TitleComponentOption & { _rcb_id: string }> = {
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
			} as TitleComponentOption
		})

		watch(options, opt => ctx.setOptionByOne(componentId, componentFlag, opt), {
			immediate: true,
			flush: 'post',
		})

		return () => null
	},
})
