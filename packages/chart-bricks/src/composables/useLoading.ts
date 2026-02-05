import { ref, computed } from 'vue'

import type { LoadingConfig, UseLoadingReturn } from '../types'

export function useLoading(config: LoadingConfig = {}): UseLoadingReturn {
	const {
		text = '加载中...',
		color = '#5470c6',
		textColor = '#333',
		maskColor = 'rgba(255, 255, 255, 0.8)',
		zlevel = 0,
		showSpinner = true,
		spinnerRadius = 10,
		lineWidth = 5,
		fontSize = 12,
		fontWeight = 'normal',
		fontStyle = 'normal',
		fontFamily = 'sans-serif',
	} = config

	const isLoading = ref(false)

	const option = computed(() => ({
		show: isLoading.value,
		text,
		color,
		textColor,
		maskColor,
		zlevel,
		lineWidth,
		showSpinner,
		spinnerRadius,
		fontSize,
		fontWeight,
		fontStyle,
		fontFamily,
	}))

	const show = (opts?: Partial<LoadingConfig>): void => {
		if (opts) {
			Object.assign(config, opts)
		}
		isLoading.value = true
	}

	const hide = (): void => {
		isLoading.value = false
	}

	const toggle = (): void => {
		isLoading.value = !isLoading.value
	}

	return {
		isLoading,
		option,
		show,
		hide,
		toggle,
	}
}
