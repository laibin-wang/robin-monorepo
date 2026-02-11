import type { TooltipComponentOption } from 'echarts/types/dist/option'
import type { PropType } from 'vue'

import { definePrivateProps } from '../types'
import { createChartComponent } from './ChartFactoryComponent'

interface TooltipProps extends TooltipComponentOption {
	trigger?: TooltipComponentOption['trigger']
	formatter?: TooltipComponentOption['formatter']
}
type TooltipPrivateProps = Pick<TooltipProps, 'trigger' | 'formatter'>

const customPrivateProps = definePrivateProps<TooltipPrivateProps>({
	trigger: String as PropType<TooltipComponentOption['trigger']>,
	formatter: [String, Function] as PropType<TooltipComponentOption['formatter']>,
})
export default createChartComponent<TooltipProps, TooltipPrivateProps>(
	'Tooltip',
	{
		trigger: 'item',
	},
	['TooltipComponent'],
	'tooltip',
	customPrivateProps,
)
