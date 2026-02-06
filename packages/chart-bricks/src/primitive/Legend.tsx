import { defineComponent, computed, watch } from 'vue'

import { useChartContext } from '../composables/useChart'

export default defineComponent({
	name: 'Legend',

	props: {
		data: Array as any,
		orient: { type: String as () => 'horizontal' | 'vertical', default: 'horizontal' },
		position: { type: String as () => 'top' | 'bottom' | 'left' | 'right', default: 'top' },
		align: { type: String as () => 'auto' | 'left' | 'right', default: 'auto' },
		padding: [Number, Array] as any,
		itemGap: Number,
		itemWidth: Number,
		itemHeight: Number,
		textStyle: Object,
		selectedMode: {
			type: [Boolean, String] as () => boolean | 'single' | 'multiple',
			default: true,
		},
		formatter: Function as any,
	},

	setup(props) {
		const ctx = useChartContext()

		const option = computed(() => ({
			legend: {
				data: props.data,
				orient: props.orient,
				[props.position]:
					props.position === 'top' || props.position === 'bottom' ? 'center' : 'middle',
				align: props.align,
				padding: props.padding,
				itemGap: props.itemGap,
				itemWidth: props.itemWidth,
				itemHeight: props.itemHeight,
				textStyle: props.textStyle,
				selectedMode: props.selectedMode,
				formatter: props.formatter,
			},
		}))

		watch(option, opt => ctx.setOption(opt), { immediate: true, deep: true })

		return () => null
	},
})
