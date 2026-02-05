import { ref, computed } from 'vue'

import type { Theme, UseThemeReturn } from '../types'

import { defaultTheme } from '../constants/themes'

export function useTheme(initialTheme: Theme | string = 'default'): UseThemeReturn {
	const currentTheme = ref<Theme | string>(initialTheme)
	const customThemes: Map<string, Theme> = new Map()

	const resolvedTheme = computed<Theme>(() => {
		if (typeof currentTheme.value === 'string') {
			return customThemes.get(currentTheme.value) || defaultTheme
		}
		return currentTheme.value
	})

	const option = computed(() => ({
		color: resolvedTheme.value.colors,
		backgroundColor: resolvedTheme.value.backgroundColor,
		textStyle: resolvedTheme.value.textStyle,
		title: resolvedTheme.value.title,
		legend: resolvedTheme.value.legend,
		tooltip: resolvedTheme.value.tooltip,
		grid: resolvedTheme.value.grid,
		xAxis: resolvedTheme.value.axis,
		yAxis: resolvedTheme.value.axis,
	}))

	const setTheme = (theme: Theme | string): void => {
		currentTheme.value = theme
	}

	const registerTheme = (name: string, theme: Theme): void => {
		customThemes.set(name, theme)
	}

	const getTheme = (name: string): Theme | undefined => {
		return customThemes.get(name)
	}

	const removeTheme = (name: string): boolean => {
		return customThemes.delete(name)
	}

	return {
		currentTheme: currentTheme as unknown as Theme,
		option,
		setTheme,
		registerTheme,
		getTheme,
		removeTheme,
	}
}
