import type { YAXisOption } from 'echarts/types/dist/shared'
import type { PropType } from 'vue'

import { definePrivateProps, type OptionAxisType } from '../types'
import { createChartComponent } from './ChartFactoryComponent'

interface YAXisProps extends Omit<YAXisOption, 'type'> {
	type?: OptionAxisType
}

type XAXisPrivateProps = Pick<YAXisProps, 'type'>

const customPrivateProps = definePrivateProps<XAXisPrivateProps>({
	type: String as PropType<YAXisOption['type']>,
})

export default createChartComponent<YAXisProps, XAXisPrivateProps>(
	'YAxis',
	{
		type: 'value',
	},
	['GridComponent'],
	'yAxis',
	customPrivateProps,
)
