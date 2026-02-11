// import type { LineSeriesOption } from 'echarts/types/dist/option'

// import { defineComponent, computed, watch, type PropType } from 'vue'

// import { useChartContext } from '../composables/useChart'
// import { declareModules } from '../composables/useModuleCollector'
// import { generateId } from '../utils/chartHelpers'

// export default defineComponent({
//   name: 'Line',

//   props: {
//     name: String,
//     data: Array as PropType<LineSeriesOption['data']>,
//     formatter: [String, Function] as any,
//     config: {
//       type: Object as PropType<LineSeriesOption>,
//       default: () => ({}),
//     },
//   },

//   setup(props) {
//     const componentFlag = 'line'
//     const componentId = generateId(componentFlag)
//     const ctx = useChartContext()
//     declareModules(['LineChart'])

//     const options = computed(() => {
//       const { config, ...restProps } = props

// 			const baseOptions: Partial<LineSeriesOption & { _rcb_id: string }> = {
// 				_rcb_id: componentId,
// 			}

//       Object.keys(restProps).forEach(key => {
//         const value = restProps[key as keyof typeof restProps]
//         if (value !== undefined && key !== 'config') {
//           ;(baseOptions as any)[key] = value
//         }
//       })
//       return {
//         ...baseOptions,
//         ...config,
//         type: 'line',
//       } as LineSeriesOption
//     })

//     watch(options, opt => ctx.setOptionByOne(componentId, 'series', opt), {
//       immediate: true,
//       flush: 'post',
//     })

//     return () => null
//   }
// })

import type { LineSeriesOption } from 'echarts/types/dist/option'
import type { PropType } from 'vue'

import { createChartComponent } from '../primitive/ChartFactoryComponent'
import { definePrivateProps } from '../types'

interface LineSeriesProps extends LineSeriesOption {
	name?: LineSeriesOption['name']
	data?: LineSeriesOption['data']
}
type LineSeriesPrivateProps = Pick<LineSeriesProps, 'name' | 'data'>

const customPrivateProps = definePrivateProps<LineSeriesPrivateProps>({
	name: String as PropType<LineSeriesOption['name']>,
	data: Array as PropType<LineSeriesOption['data']>,
})

export default createChartComponent<LineSeriesProps, LineSeriesPrivateProps>(
	'Line',
	{
		type: 'line',
	},
	['LineChart'],
	'series',
	customPrivateProps,
)
