import type { Theme } from '../types'

export const defaultTheme: Theme = {
	name: 'default',
	colors: [
		'#5470c6',
		'#91cc75',
		'#fac858',
		'#ee6666',
		'#73c0de',
		'#3ba272',
		'#fc8452',
		'#9a60b4',
		'#ea7ccc',
	],
	backgroundColor: 'transparent',
	textStyle: {
		fontFamily: 'sans-serif',
		fontSize: 12,
		color: '#333',
	},
	title: {
		textStyle: {
			fontSize: 18,
			fontWeight: 'bold',
			color: '#1a1a1a',
		},
		subtextStyle: {
			fontSize: 12,
			color: '#666666',
		},
	},
	legend: {
		textStyle: {
			color: '#333',
		},
	},
	tooltip: {
		backgroundColor: 'rgba(255, 255, 255, 0.95)',
		borderColor: '#ccc',
		textStyle: {
			color: '#333',
		},
		extraCssText: 'box-shadow: 0 0 8px rgba(0, 0, 0, 0.15); border-radius: 4px;',
	},
	axis: {
		lineStyle: {
			color: '#666',
		},
		splitLine: {
			lineStyle: {
				color: '#eee',
				type: 'dashed',
			},
		},
		axisLabel: {
			color: '#666',
		},
	},
	grid: {
		lineStyle: {
			color: '#ccc',
		},
	},
}

export const darkTheme: Theme = {
	name: 'dark',
	colors: [
		'#4992ff',
		'#7cffb2',
		'#fddd60',
		'#ff6e76',
		'#58d9f9',
		'#05c091',
		'#ff8a45',
		'#8d48e3',
		'#dd79ff',
	],
	backgroundColor: '#1a1a1a',
	textStyle: {
		fontFamily: 'sans-serif',
		fontSize: 12,
		color: '#ccc',
	},
	title: {
		textStyle: {
			fontSize: 18,
			fontWeight: 'bold',
			color: '#eee',
		},
		subtextStyle: {
			fontSize: 12,
			color: '#aaa',
		},
	},
	legend: {
		textStyle: {
			color: '#ccc',
		},
	},
	tooltip: {
		backgroundColor: 'rgba(50, 50, 50, 0.95)',
		borderColor: '#555',
		textStyle: {
			color: '#fff',
		},
		extraCssText: 'box-shadow: 0 0 8px rgba(0, 0, 0, 0.5); border-radius: 4px;',
	},
	axis: {
		lineStyle: {
			color: '#555',
		},
		splitLine: {
			lineStyle: {
				color: '#333',
				type: 'dashed',
			},
		},
		axisLabel: {
			color: '#999',
		},
	},
	grid: {
		lineStyle: {
			color: '#444',
		},
	},
}

export const minimalTheme: Theme = {
	name: 'minimal',
	colors: ['#333', '#666', '#999', '#ccc', '#000'],
	backgroundColor: 'transparent',
	textStyle: {
		fontFamily: 'system-ui, sans-serif',
		fontSize: 11,
		color: '#666',
	},
	title: {
		textStyle: {
			fontSize: 16,
			fontWeight: 'normal',
			color: '#000',
		},
	},
	axis: {
		lineStyle: {
			color: '#eee',
		},
		splitLine: {
			show: false,
		},
		axisLabel: {
			color: '#999',
		},
	},
}
