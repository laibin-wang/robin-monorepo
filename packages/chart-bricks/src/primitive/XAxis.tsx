import type { XAXisOption } from 'echarts/types/dist/shared'
import type { PropType } from 'vue'

import { definePrivateProps, type OptionAxisType } from '../types'
import { createChartComponent } from './ChartFactoryComponent'

interface XAXisProps extends Omit<XAXisOption, 'type'> {
	type?: OptionAxisType
}
type XAXisPrivateProps = Pick<XAXisProps, 'type'>

const customPrivateProps = definePrivateProps<XAXisPrivateProps>({
	type: String as PropType<XAXisOption['type']>,
})

export default createChartComponent<XAXisProps, XAXisPrivateProps>(
	'XAxis',
	{
		type: 'category',
	},
	['GridComponent'],
	'xAxis',
	customPrivateProps,
)
