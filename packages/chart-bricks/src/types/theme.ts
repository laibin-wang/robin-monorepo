import type { ComputedRef, CSSProperties, Ref } from 'vue'

export interface ThemeColors {
	primary: string
	secondary: string
	success: string
	warning: string
	error: string
	info: string
	text: {
		primary: string
		secondary: string
		disabled: string
	}
	background: string
	border: string
	chart: string[]
}

export interface ThemeTextStyle {
	fontFamily?: string
	fontSize?: number
	fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter' | number
	fontStyle?: 'normal' | 'italic' | 'oblique'
	color?: string
}

export interface Theme {
	name: string
	colors: string[]
	backgroundColor: string
	textStyle: ThemeTextStyle
	title?: {
		textStyle?: ThemeTextStyle
		subtextStyle?: ThemeTextStyle
	}
	legend?: {
		textStyle?: ThemeTextStyle
		pageTextStyle?: ThemeTextStyle
	}
	tooltip?: {
		backgroundColor?: string
		borderColor?: string
		textStyle?: ThemeTextStyle
		extraCssText?: string
	}
	axis?: {
		lineStyle?: { color?: string; width?: number }
		splitLine?: {
			show?: boolean
			lineStyle?: { color?: string; type?: 'solid' | 'dashed' | 'dotted' }
		}
		axisLabel?: ThemeTextStyle
	}
	grid?: { lineStyle?: { color?: string } }
	series?: Record<string, any>
}

export type AnimationPreset = 'fade' | 'scale' | 'slide' | 'elastic' | 'bounce'

export interface AnimationConfig {
	enabled?: boolean
	duration?: number
	easing?: string
	delay?: number | ((idx: number) => number)
	delayGroup?: number
	progressive?: boolean
	progressiveThreshold?: number
}

export interface LoadingConfig {
	text?: string
	color?: string
	textColor?: string
	maskColor?: string
	zlevel?: number
	showSpinner?: boolean
	spinnerRadius?: number
	lineWidth?: number
	fontSize?: number
	fontWeight?: string
	fontStyle?: string
	fontFamily?: string
}

export interface UseAnimationReturn {
	isAnimating: Ref<boolean>
	progress: Ref<number>
	option: ComputedRef<Record<string, any>>
	presets: Record<AnimationPreset, AnimationConfig>
	createStagger: (count: number, baseDelay?: number) => number[]
	start: () => void
	stop: () => void
}

export interface UseLoadingReturn {
	isLoading: Ref<boolean>
	option: ComputedRef<Record<string, any>>
	show: (opts?: Partial<LoadingConfig>) => void
	hide: () => void
	toggle: () => void
}

export interface UseThemeReturn {
	currentTheme: Theme
	option: ComputedRef<Record<string, any>>
	setTheme: (theme: Theme | string) => void
	registerTheme: (name: string, theme: Theme) => void
	getTheme: (name: string) => Theme | undefined
	removeTheme: (name: string) => boolean
}

export interface UseResponsiveReturn {
	breakpoint: Ref<string | null>
	width: Ref<number>
	height: Ref<number>
	isMobile: ComputedRef<boolean>
	isTablet: ComputedRef<boolean>
	isDesktop: ComputedRef<boolean>
}
