import type { BarSeriesOption } from 'echarts/types/dist/option'
import type { PropType } from 'vue'

import { createChartComponent } from '../primitive/BaseChartComponent'
import { definePrivateProps } from '../types'

interface GridOptions extends BarSeriesOption {
	top?: string | number
	left?: string | number
	right?: string | number
	bottom?: string | number
}
type GridPrivateProps = Pick<GridOptions, 'top' | 'left' | 'right' | 'bottom'>

const gridPrivateProps = definePrivateProps<GridPrivateProps>({
	top: [String, Number] as PropType<string | number>,
	left: [String, Number] as PropType<string | number>,
	right: [String, Number] as PropType<string | number>,
	bottom: [String, Number] as PropType<string | number>,
})
export default createChartComponent<GridOptions, GridPrivateProps>(
	'Grid',
	{
		top: '10%',
		left: '10%',
		right: '10%',
		bottom: '10%',
	},
	['GridComponent'],
	'grid',
	gridPrivateProps,
)
