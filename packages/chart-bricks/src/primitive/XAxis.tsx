import { defineComponent, computed, watch } from 'vue'

import { useChartContext } from '../composables/useChart'

export default defineComponent({
	name: 'XAxis',

	props: {
		dataKey: String,
		type: { type: String as () => 'category' | 'value' | 'time' | 'log', default: 'category' },
		position: { type: String as () => 'top' | 'bottom', default: 'bottom' },
		name: String,
		nameLocation: { type: String as () => 'start' | 'center' | 'end', default: 'end' },
		nameGap: Number,
		min: [Number, String, Function] as any,
		max: [Number, String, Function] as any,
		interval: [Number, Function] as any,
		axisLine: Object,
		axisTick: Object,
		axisLabel: Object,
		splitLine: Object,
		splitArea: Object,
	},

	setup(props) {
		const ctx = useChartContext()

		const option = computed(() => ({
			xAxis: {
				type: props.type,
				position: props.position,
				name: props.name,
				nameLocation: props.nameLocation,
				nameGap: props.nameGap,
				min: props.min,
				max: props.max,
				interval: props.interval,
				axisLine: props.axisLine,
				axisTick: props.axisTick,
				axisLabel: props.axisLabel,
				splitLine: props.splitLine,
				splitArea: props.splitArea,
			},
		}))

		watch(option, opt => ctx.setOption(opt), { immediate: true, deep: true })

		return () => null
	},
})
