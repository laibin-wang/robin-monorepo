import type { LegendComponentOption } from 'echarts/types/dist/option'

import { defineComponent, computed, watch, type PropType } from 'vue'

import { useChartContext } from '../composables/useChart'
import { declareModules } from '../composables/useModuleCollector'
import { generateId } from '../utils/chartHelpers'

export default defineComponent({
	name: 'Legend',

	props: {
		config: {
			type: Object as PropType<LegendComponentOption>,
			default: () => ({}),
		},
		data: Array as any,
		orient: { type: String as () => 'horizontal' | 'vertical', default: 'horizontal' },
		position: { type: String as () => 'top' | 'bottom' | 'left' | 'right', default: 'top' },
		align: { type: String as () => 'auto' | 'left' | 'right', default: 'auto' },
		padding: [Number, Array] as any,
		itemGap: Number,
		itemWidth: Number,
		itemHeight: Number,
		textStyle: Object,
		formatter: Function as any,
	},

	setup(props) {
		const componentFlag = 'legend'
		const componentId = generateId(componentFlag)
		const ctx = useChartContext()
		declareModules(['LegendComponent'])

		const options = computed(() => {
			const { config, ...restProps } = props

			const baseOptions: Partial<LegendComponentOption> = {
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
			} as LegendComponentOption
		})

		watch(options, opt => ctx.setOptionByOne(componentId, componentFlag, opt), {
			immediate: true,
			flush: 'post',
		})

		return () => null
	},
})
