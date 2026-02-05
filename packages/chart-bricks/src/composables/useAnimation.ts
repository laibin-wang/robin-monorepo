import { ref, computed } from 'vue'

import type { AnimationConfig, AnimationPreset, UseAnimationReturn } from '../types'

const presets: Record<AnimationPreset, AnimationConfig> = {
	fade: { duration: 500, easing: 'linear' },
	scale: { duration: 800, easing: 'backOut' },
	slide: { duration: 600, easing: 'quadraticOut' },
	elastic: { duration: 1200, easing: 'elasticOut' },
	bounce: { duration: 1000, easing: 'bounceOut' },
}

export function useAnimation(config: AnimationConfig = {}): UseAnimationReturn {
	const {
		enabled = true,
		duration = 1000,
		easing = 'cubicOut',
		delay = 0,
		delayGroup = 0,
		progressive = false,
		progressiveThreshold = 5000,
	} = config

	const isAnimating = ref(false)
	const progress = ref(0)

	const option = computed(() => {
		if (!enabled) return { animation: false }

		return {
			animation: true,
			animationDuration: duration,
			animationEasing: easing,
			animationDelay: typeof delay === 'function' ? delay : () => delay,
			animationDelayUpdate: delayGroup,
			progressive,
			progressiveThreshold,
			animationDurationUpdate: Math.floor(duration * 0.8),
		}
	})

	const createStagger = (count: number, baseDelay: number = 100): number[] => {
		return Array.from({ length: count }, (_, i) => i * baseDelay)
	}

	const start = (): void => {
		isAnimating.value = true
		progress.value = 0

		const startTime = Date.now()
		const animate = () => {
			const elapsed = Date.now() - startTime
			progress.value = Math.min(elapsed / duration, 1)

			if (progress.value < 1) {
				requestAnimationFrame(animate)
			} else {
				isAnimating.value = false
			}
		}
		requestAnimationFrame(animate)
	}

	const stop = (): void => {
		isAnimating.value = false
		progress.value = 0
	}

	return {
		isAnimating,
		progress,
		option,
		presets,
		createStagger,
		start,
		stop,
	}
}
