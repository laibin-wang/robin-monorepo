import type { GridComponentOption } from 'echarts/types/dist/option'

import { definePrivateProps } from '../types'
import { createChartComponent } from './ChartFactoryComponent'
interface GridProps extends GridComponentOption {
	top?: number | string
	bottom?: number | string
	right?: number | string
	left?: number | string
}

type XAXisPrivateProps = Pick<GridProps, 'top' | 'bottom' | 'right' | 'left'>

const customPrivateProps = definePrivateProps<XAXisPrivateProps>({
	top: [String, Number],
	bottom: [String, Number],
	right: [String, Number],
	left: [String, Number],
})

export default createChartComponent<GridProps, XAXisPrivateProps>(
	'Grid',
	{},
	['GridComponent'],
	'grid',
	customPrivateProps,
)
