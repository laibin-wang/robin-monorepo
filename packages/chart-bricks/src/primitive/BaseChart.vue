<template>
	<ResponsiveContainer ref="containerRef" :width="width" :height="height">
		<div v-if="isLoading" class="chart-loading">Loading...</div>
		<slot v-if="isReady" />
	</ResponsiveContainer>
</template>

<script setup lang="ts">
import { useChart } from '../composables/useChart'
import type { DataItem, ModuleName } from '../types'
import ResponsiveContainer from './ResponsiveContainer.vue'

interface Props {
	data: DataItem[]
	width?: string | number
	height?: string | number
	layout?: 'vertical' | 'horizontal'
}

const props = withDefaults(defineProps<Props>(), {
	layout: 'vertical',
})

const baseModules: ModuleName[] = [
	'GridComponent',
	'DatasetComponent',
	'TooltipComponent',
	'LegendComponent',
]

const { isReady, isLoading } = useChart({
	initialModules: baseModules,
})
</script>
