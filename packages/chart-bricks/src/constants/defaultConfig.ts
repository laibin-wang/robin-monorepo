import type { ChartConfig } from '../types'

export const DEFAULT_CHART_CONFIG: ChartConfig = {
	renderer: 'canvas',
	theme: 'default',
	autoResize: true,
	locale: 'ZH-CN',
	useDirtyRect: true,
	useCoarsePointer: true,
	pointerSize: 20,
}

export const DEFAULT_ANIMATION_CONFIG = {
	enabled: true,
	duration: 1000,
	easing: 'cubicOut',
	delay: 0,
	progressive: false,
	progressiveThreshold: 5000,
}

export const DEFAULT_LOADING_CONFIG = {
	text: '加载中...',
	color: '#5470c6',
	textColor: '#333',
	maskColor: 'rgba(255, 255, 255, 0.8)',
	zlevel: 0,
	showSpinner: true,
	spinnerRadius: 10,
	lineWidth: 5,
	fontSize: 12,
	fontWeight: 'normal',
	fontStyle: 'normal',
	fontFamily: 'sans-serif',
}

export const DEFAULT_BREAKPOINTS = [
	{ name: 'mobile', max: 768 },
	{ name: 'tablet', min: 769, max: 1024 },
	{ name: 'desktop', min: 1025 },
]
