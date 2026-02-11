import { ref, computed } from 'vue'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent'

interface LogEntry {
	level: LogLevel
	message: string
	data?: any
	timestamp: number
}

interface PerformanceEntry {
	name: string
	startTime: number
	endTime?: number
	duration?: number
}

const LOG_LEVEL_WEIGHTS: Record<LogLevel, number> = {
	debug: 0,
	info: 1,
	warn: 2,
	error: 3,
	silent: 4,
}

export function createLogger(
	namespace: string,
	enabled: boolean = true,
	minLevel: LogLevel = 'debug',
) {
	const logs = ref<LogEntry[]>([])
	const minWeight = LOG_LEVEL_WEIGHTS[minLevel]

	const shouldLog = (level: LogLevel) => {
		if (!enabled) return false
		return LOG_LEVEL_WEIGHTS[level] >= minWeight
	}

	const log = (level: LogLevel, message: string, data?: any) => {
		if (!shouldLog(level)) return

		const entry: LogEntry = {
			level,
			message: `[${namespace}] ${message}`,
			data,
			timestamp: Date.now(),
		}

		logs.value.push(entry)
		if (logs.value.length > 100) logs.value.shift()

		const consoleMethod =
			level === 'error'
				? console.error
				: level === 'warn'
					? console.warn
					: level === 'info'
						? console.info
						: console.log

		if (data !== undefined) {
			consoleMethod(entry.message, data)
		} else {
			consoleMethod(entry.message)
		}
	}

	return {
		debug: (msg: string, data?: any) => log('debug', msg, data),
		info: (msg: string, data?: any) => log('info', msg, data),
		warn: (msg: string, data?: any) => log('warn', msg, data),
		error: (msg: string, data?: any) => log('error', msg, data),
		logs: computed(() => logs.value),
		clear: () => {
			logs.value = []
		},
		export: () => JSON.stringify(logs.value, null, 2),
	}
}

export function createPerformanceMonitor(id: string, enabled: boolean = true) {
	const marks = new Map<string, number>()
	const measures = new Map<string, number[]>()
	let totalInitTime = 0

	const mark = (name: string) => {
		if (!enabled) return
		marks.set(name, performance.now())
	}

	const measure = (name: string, startMark: string, endMark: string) => {
		if (!enabled) return
		const start = marks.get(startMark)
		const end = marks.get(endMark)
		if (start && end) {
			const duration = end - start
			if (!measures.has(name)) measures.set(name, [])
			measures.get(name)!.push(duration)
			if (name === 'total-init') totalInitTime = duration
		}
	}

	const getMetrics = () => {
		const result: Record<string, { avg: number; min: number; max: number; count: number }> = {}
		measures.forEach((durations, name) => {
			const avg = durations.reduce((a, b) => a + b, 0) / durations.length
			result[name] = {
				avg,
				min: Math.min(...durations),
				max: Math.max(...durations),
				count: durations.length,
			}
		})
		return { id, measures: result, totalInitTime, currentMarks: Object.fromEntries(marks) }
	}

	const getLastMeasure = (name: string): number | undefined => {
		const durations = measures.get(name)
		return durations?.[durations.length - 1]
	}

	const report = () => {
		if (!enabled) return
		const metrics = getMetrics()
		console.group(`📊 Chart Performance Report [${id}]`)
		if (metrics.totalInitTime) console.log(`Initialization: ${metrics.totalInitTime.toFixed(2)}ms`)
		Object.entries(metrics.measures).forEach(([name, data]) => {
			if (name !== 'total-init') {
				console.log(
					`${name}: avg=${data.avg.toFixed(2)}ms, min=${data.min.toFixed(2)}ms, max=${data.max.toFixed(2)}ms (${data.count} samples)`,
				)
			}
		})
		console.groupEnd()
	}

	return {
		mark,
		measure,
		getMetrics,
		getLastMeasure,
		report,
		clear: () => {
			marks.clear()
			measures.clear()
			totalInitTime = 0
		},
	}
}

export function createGlobalMonitor() {
	const instances = new Map<string, ReturnType<typeof createPerformanceMonitor>>()
	return {
		register: (id: string, monitor: ReturnType<typeof createPerformanceMonitor>) =>
			instances.set(id, monitor),
		unregister: (id: string) => instances.delete(id),
		getAllReports: () =>
			Array.from(instances.entries()).map(([id, monitor]) => ({ id, ...monitor.getMetrics() })),
		reportAll: () => {
			console.group('🌍 Global Chart Performance Report')
			instances.forEach(monitor => monitor.report())
			console.groupEnd()
		},
	}
}

export const globalMonitor = createGlobalMonitor()
