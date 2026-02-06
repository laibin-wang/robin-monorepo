import { defineComponent, computed, watch } from 'vue'

import { useChartContext } from '../composables/useChart'

export default defineComponent({
	name: 'CartesianGrid',

	props: {
		stroke: { type: String, default: '#ccc' },
		strokeWidth: { type: Number, default: 1 },
		strokeDasharray: String,
		horizontal: { type: Boolean, default: true },
		vertical: { type: Boolean, default: true },
		horizontalValues: Array as any,
		verticalValues: Array as any,
	},

	setup(props) {
		const ctx = useChartContext()

		const option = computed(() => ({
			grid: {
				show: true,
				borderColor: props.stroke,
				borderWidth: props.strokeWidth,
			},
			xAxis: {
				splitLine: {
					show: props.vertical,
					lineStyle: {
						color: props.stroke,
						type: props.strokeDasharray ? 'dashed' : 'solid',
						dashOffset: props.strokeDasharray,
					},
				},
			},
			yAxis: {
				splitLine: {
					show: props.horizontal,
					lineStyle: {
						color: props.stroke,
						type: props.strokeDasharray ? 'dashed' : 'solid',
						dashOffset: props.strokeDasharray,
					},
				},
			},
		}))

		watch(option, opt => ctx.setOption(opt), { immediate: true, deep: true })

		return () => null
	},
})
