// import type { LegendComponentOption } from 'echarts/types/dist/option'

// import { defineComponent, computed, watch, type PropType } from 'vue'

// import { useChartContext } from '../composables/useChart'
// import { declareModules } from '../composables/useModuleCollector'
// import { generateId } from '../utils/chartHelpers'

// export default defineComponent({
// 	name: 'Legend',

// 	props: {
// 		config: {
// 			type: Object as PropType<LegendComponentOption>,
// 			default: () => ({}),
// 		},
// 		data: Array as PropType<LegendComponentOption['data']>,
// 		formatter: [String, Function] as PropType<LegendComponentOption['formatter']>,
// 	},

// 	setup(props) {
// 		const componentFlag = 'legend'
// 		const componentId = generateId(componentFlag)
// 		const ctx = useChartContext()
// 		declareModules(['LegendComponent'])

// 		const options = computed(() => {
// 			const { config, ...restProps } = props

// 			const baseOptions: Partial<LegendComponentOption & { _rcb_id: string }> = {
// 				_rcb_id: componentId,
// 			}

// 			Object.keys(restProps).forEach(key => {
// 				const value = restProps[key as keyof typeof restProps]
// 				if (value !== undefined && key !== 'config') {
// 					;(baseOptions as any)[key] = value
// 				}
// 			})
// 			return {
// 				...baseOptions,
// 				...config,
// 			} as LegendComponentOption
// 		})

// 		watch(options, opt => ctx.setOptionByOne(componentId, componentFlag, opt), {
// 			immediate: true,
// 			flush: 'post',
// 		})

// 		return () => null
// 	},
// })

import type { LegendComponentOption } from 'echarts/types/dist/option'
import type { PropType } from 'vue'

import { definePrivateProps } from '../types'
import { createChartComponent } from './ChartFactoryComponent'

interface LegendProps extends Omit<LegendComponentOption, 'data' | 'formatter'> {
	data?: LegendComponentOption['data']
	formatter?: LegendComponentOption['formatter']
}

type LegendPrivateProps = Pick<LegendProps, 'data' | 'formatter'>

const customPrivateProps = definePrivateProps<LegendPrivateProps>({
	data: Array as PropType<LegendComponentOption['data']>,
	formatter: [String, Function] as PropType<LegendComponentOption['formatter']>,
})
export default createChartComponent<LegendProps, LegendPrivateProps>(
	'Legend',
	{},
	['LegendComponent'],
	'legend',
	customPrivateProps,
)
