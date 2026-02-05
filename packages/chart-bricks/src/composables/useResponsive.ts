import { ref, onMounted, onUnmounted, computed, type Ref } from 'vue'

import type { Breakpoint, UseResponsiveReturn } from '../types'

const defaultBreakpoints: Breakpoint[] = [
	{ name: 'mobile', max: 768 },
	{ name: 'tablet', min: 769, max: 1024 },
	{ name: 'desktop', min: 1025 },
]

export function useResponsive(
	containerRef: Ref<HTMLElement | null>,
	breakpoints: Breakpoint[] = defaultBreakpoints,
): UseResponsiveReturn {
	const current = ref<string | null>(null)
	const width = ref(0)
	const height = ref(0)

	let observer: ResizeObserver | null = null

	const updateSize = (entry: ResizeObserverEntry): void => {
		width.value = entry.contentRect.width
		height.value = entry.contentRect.height

		const matched = breakpoints.find(bp => {
			const min = bp.min ?? 0
			const max = bp.max ?? Infinity
			return width.value >= min && width.value <= max
		})

		current.value = matched?.name || null
	}

	onMounted(() => {
		if (!containerRef.value || typeof ResizeObserver === 'undefined') return

		observer = new ResizeObserver(entries => {
			for (const entry of entries) {
				updateSize(entry)
			}
		})

		observer.observe(containerRef.value)
	})

	onUnmounted(() => {
		observer?.disconnect()
	})

	return {
		breakpoint: current,
		width,
		height,
		isMobile: computed(() => current.value === 'mobile'),
		isTablet: computed(() => current.value === 'tablet'),
		isDesktop: computed(() => current.value === 'desktop'),
	}
}
