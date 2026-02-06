<template>
	<div ref="containerRef" class="rcb-responsive-container">
		<div ref="chartRef" class="rcb-chart-wrapper" :style="wrapperStyle">
			<slot />
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useElementSize } from '@vueuse/core'
import type { CSSProperties } from 'vue'

interface Props {
	width?: string | number
	height?: string | number
	aspect?: number
	minWidth?: number
	minHeight?: number
	maxWidth?: number
	maxHeight?: number
	debounce?: number
}

const props = withDefaults(defineProps<Props>(), {
	debounce: 100,
})

const containerRef = ref<HTMLElement>()
const chartRef = ref<HTMLElement>()

const { width: containerWidth, height: containerHeight } = useElementSize(containerRef)

const wrapperStyle = computed<CSSProperties>(() => {
	let width = props.width
	let height = props.height

	if (props.aspect && containerWidth.value) {
		height = containerWidth.value / props.aspect
	}

	return {
		width: typeof width === 'number' ? `${width}px` : width || '100%',
		height: typeof height === 'number' ? `${height}px` : height || '100%',
		minWidth: props.minWidth ? `${props.minWidth}px` : undefined,
		minHeight: props.minHeight ? `${props.minHeight}px` : undefined,
		maxWidth: props.maxWidth ? `${props.maxWidth}px` : undefined,
		maxHeight: props.maxHeight ? `${props.maxHeight}px` : undefined,
	}
})

defineExpose({
	containerRef,
	chartRef,
	getSize: () => ({
		width: containerWidth.value,
		height: containerHeight.value,
	}),
})
</script>

<style scoped>
.rcb-responsive-container {
	position: relative;
	width: 100%;
	height: 100%;
}

.rcb-chart-wrapper {
	position: relative;
	width: 100%;
	height: 100%;
	overflow: hidden;
}
</style>
