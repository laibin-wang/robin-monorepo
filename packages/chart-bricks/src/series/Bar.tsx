import type { BarSeriesOption } from 'echarts/types/dist/option'
import type { PropType } from 'vue'

import { createChartComponent } from '../primitive/ChartFactoryComponent'
import { definePrivateProps } from '../types'

interface BarSeriesProps extends BarSeriesOption {
	name?: BarSeriesOption['name']
	data?: BarSeriesOption['data']
}
type BarSeriesPrivateProps = Pick<BarSeriesProps, 'name' | 'data'>

const customPrivateProps = definePrivateProps<BarSeriesPrivateProps>({
	name: String as PropType<BarSeriesOption['name']>,
	data: Array as PropType<BarSeriesOption['data']>,
})
export default createChartComponent<BarSeriesProps, BarSeriesPrivateProps>(
	'Bar',
	{
		type: 'bar',
	},
	['BarChart'],
	'series',
	customPrivateProps,
)
