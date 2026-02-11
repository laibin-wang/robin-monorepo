import type { TitleComponentOption } from 'echarts/types/dist/option'
import type { PropType } from 'vue'

import { definePrivateProps } from '../types'
import { createChartComponent } from './ChartFactoryComponent'

interface TitleProps extends TitleComponentOption {
	text?: string
	subtext?: string
	textAlign?: TitleComponentOption['textAlign']
}
type TitlePrivateProps = Pick<TitleProps, 'text' | 'subtext' | 'textAlign'>

const titlePrivateProps = definePrivateProps<TitlePrivateProps>({
	text: String,
	subtext: String,
	textAlign: String as PropType<TitleComponentOption['textAlign']>,
})

export default createChartComponent<TitleProps, TitlePrivateProps>(
	'Title',
	{},
	['TitleComponent'],
	'title',
	titlePrivateProps,
)
