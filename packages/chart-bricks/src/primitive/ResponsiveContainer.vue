<template>
	<div ref="containerRef" class="rcb-responsive-container">
		<div ref="chartBrickRef" class="rcb-chart-wrapper" :style="wrapperStyle">
			<slot />
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, useTemplateRef, watch, watchEffect } from 'vue'
import { useResizeObserver } from '@vueuse/core'
import { useChart } from '../composables/useChart'
import type { CSSProperties } from 'vue'
import { createOptimizedResizeHandler } from '../utils/resizeOptimizer'

interface Props {
	width?: string | number
	height?: string | number
	aspect?: number
	minWidth?: number
	minHeight?: number
	maxWidth?: number
	maxHeight?: number
	debounce?: number
	throttle?: number
	immediate?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	debounce: 100,
	throttle: 0, // 0表示不使用节流
	immediate: false,
})

const containerRef = useTemplateRef<HTMLElement>('containerRef')

const wrapperStyle = computed<CSSProperties>(() => {
	const { width, height, aspect, minWidth, minHeight, maxWidth, maxHeight } = props

	let computedWidth = width
	let computedHeight = height

	if (aspect && computedWidth) {
		if (typeof computedWidth === 'number') {
			computedHeight = computedWidth / aspect
		} else if (typeof computedWidth === 'string' && computedWidth.endsWith('%')) {
			// 如果是百分比，保持百分比
			computedHeight = 'auto'
		}
	}

	return {
		width: typeof computedWidth === 'number' ? `${computedWidth}px` : computedWidth || '100%',
		height: typeof computedHeight === 'number' ? `${computedHeight}px` : computedHeight || '100%',
		minWidth: minWidth ? `${minWidth}px` : undefined,
		minHeight: minHeight ? `${minHeight}px` : undefined,
		maxWidth: maxWidth ? `${maxWidth}px` : undefined,
		maxHeight: maxHeight ? `${maxHeight}px` : undefined,
	}
})

const {
	chart,
	chartRef,
	resize: chartResize,
} = useChart({
	initialModules: [],
})

const optimizedResizeHandler = createOptimizedResizeHandler(
	(size: { width: number; height: number }) => {
		chartResize(size)
	},
	props.debounce,
	props.throttle,
)
const handleResize = (width: number, height: number) => {
	if (width > 0 && height > 0) {
		optimizedResizeHandler({ width, height })
	}
}

const { stop: stopResizeObserver } = useResizeObserver(containerRef, entries => {
	const entry = entries[0]
	if (!entry) return
	const { width, height } = entry.contentRect
	handleResize(width, height)
})
// 立即触发一次 resize（如果需要）
onMounted(() => {
	if (props.immediate && containerRef.value) {
		const rect = containerRef.value.getBoundingClientRect()
		handleResize(rect.width, rect.height)
	}
})

onUnmounted(() => {
	stopResizeObserver()
	optimizedResizeHandler.cancel()
	optimizedResizeHandler.flush()
})

defineExpose({
	containerRef,
	chartRef,
	getSize: () => {
		if (!containerRef.value) return { width: 0, height: 0 }
		const rect = containerRef.value.getBoundingClientRect()
		return {
			width: rect.width,
			height: rect.height,
		}
	},
	getChart: () => chart.value,
	forceResize: () => {
		if (containerRef.value) {
			const rect = containerRef.value.getBoundingClientRect()
			handleResize(rect.width, rect.height)
		}
	},
	resizeHandler: optimizedResizeHandler,
})
</script>

<style scoped>
.rcb-responsive-container {
	position: relative;
	width: 100%;
	height: 100%;
	contain: layout style;
}

.rcb-chart-wrapper {
	position: relative;
	width: 100%;
	height: 100%;
	overflow: hidden;
	will-change: transform;
}
</style>
