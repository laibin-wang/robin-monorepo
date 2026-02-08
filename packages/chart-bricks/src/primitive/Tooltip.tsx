import type { TooltipComponentOption } from 'echarts/types/dist/option'

import { defineComponent, computed, watch, type PropType } from 'vue'

import { useChartContext } from '../composables/useChart'
import { declareModules } from '../composables/useModuleCollector'
import { generateId } from '../utils/chartHelpers'

export default defineComponent({
	name: 'Tooltip',

	props: {
		config: {
			type: Object as PropType<TooltipComponentOption>,
			default: () => ({}),
		},
		trigger: { type: String as () => 'item' | 'axis' | 'none', default: 'item' },
		formatter: [String, Function] as any,
		position: [String, Array, Function] as any,
		backgroundColor: String,
		borderColor: String,
		borderWidth: Number,
		padding: [Number, Array] as any,
		textStyle: Object,
		extraCssText: String,
		enterable: Boolean,
		confine: Boolean,
		showDelay: Number,
		hideDelay: Number,
		transitionDuration: Number,
	},

	setup(props) {
		const componentFlag = 'tooltip'
		const componentId = generateId(componentFlag)
		const ctx = useChartContext()
		declareModules(['TooltipComponent'])

		const options = computed(() => {
			const { config, ...restProps } = props

			const baseOptions: Partial<TooltipComponentOption> = {
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
			} as TooltipComponentOption
		})

		watch(options, opt => ctx.setOptionByOne(componentId, componentFlag, opt), {
			immediate: true,
			flush: 'post',
		})

		return () => null
	},
})
