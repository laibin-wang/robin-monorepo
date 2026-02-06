import { defineComponent, computed, watch } from 'vue'

import { useChartContext } from '../composables/useChart'

export default defineComponent({
	name: 'Tooltip',

	props: {
		trigger: { type: String as () => 'item' | 'axis' | 'none', default: 'item' },
		formatter: [String, Function] as any,
		position: [String, Array, Function] as any,
		backgroundColor: String,
		borderColor: String,
		borderWidth: Number,
		padding: [Number, Array] as any,
		textStyle: Object,
		extraCssText: String,
		enterable: Boolean,
		confine: Boolean,
		showDelay: Number,
		hideDelay: Number,
		transitionDuration: Number,
	},

	setup(props) {
		const ctx = useChartContext()

		const option = computed(() => ({
			tooltip: {
				trigger: props.trigger,
				formatter: props.formatter,
				position: props.position,
				backgroundColor: props.backgroundColor,
				borderColor: props.borderColor,
				borderWidth: props.borderWidth,
				padding: props.padding,
				textStyle: props.textStyle,
				extraCssText: props.extraCssText,
				enterable: props.enterable,
				confine: props.confine,
				showDelay: props.showDelay,
				hideDelay: props.hideDelay,
				transitionDuration: props.transitionDuration,
			},
		}))

		watch(option, opt => ctx.setOption(opt), { immediate: true, deep: true })

		return () => null
	},
})
