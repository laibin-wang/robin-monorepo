import { Transport } from '../transport'
import {
	MonitorInitOptions,
	TrackPageOptions,
	TrackEventOptions,
	BaseEvent,
	EventKind,
	MonitorStats,
	ReportPayload,
} from '../types'
import { genSessionId, isBrowser, Logger, safeExec } from '../utils'

const SDK_VERSION = '0.1.0'

/**
 * 默认配置
 */
const DEFAULT_OPTIONS: Partial<MonitorInitOptions> = {
	sampleRate: 1,
	maxBatchSize: 10,
	uploadInterval: 5000,
	enableError: true,
	enableBehavior: true,
	enablePerformance: false,
	enableNetwork: false,
	debug: false,
}

/**
 * MonitorClient 核心类
 */
export class MonitorClient {
	private options: MonitorInitOptions | null = null
	private sessionId: string = ''
	private userId?: string
	private eventQueue: BaseEvent[] = []
	private transport: Transport | null = null
	private uploadTimer: number | null = null
	private logger: Logger = new Logger(false)

	// 统计信息
	private stats = {
		totalEvents: 0,
		droppedEvents: 0,
		uploadCount: 0,
		totalUploadTime: 0,
	}

	/**
	 * 初始化 SDK
	 */
	init(options: MonitorInitOptions): void {
		safeExec(() => {
			// 环境检查
			if (!isBrowser()) {
				console.error('[Monitor] SDK only works in browser environment')
				return
			}

			// 参数校验
			if (!options.appId || !options.endpoint) {
				console.error('[Monitor] appId and endpoint are required')
				return
			}

			// 防止重复初始化
			if (this.options) {
				this.logger.warn('SDK already initialized')
				return
			}

			// 合并配置
			this.options = { ...DEFAULT_OPTIONS, ...options } as MonitorInitOptions
			this.logger = new Logger(this.options.debug)
			this.userId = this.options.userId
			this.sessionId = genSessionId()

			// 初始化上报模块
			this.transport = new Transport(this.options.endpoint, this.options.debug)

			this.logger.log('SDK initialized', {
				appId: this.options.appId,
				sessionId: this.sessionId,
				version: SDK_VERSION,
			})

			// 注册采集器
			this.registerCollectors()

			// 启动定时上报
			this.startUploadTimer()

			// 注册页面卸载监听
			this.registerUnloadListeners()
		})
	}

	/**
	 * 设置用户 ID
	 */
	setUser(userId: string): void {
		safeExec(() => {
			this.userId = userId
			this.logger.log('User set:', userId)
		})
	}

	/**
	 * 清空用户 ID
	 */
	clearUser(): void {
		safeExec(() => {
			this.userId = undefined
			this.logger.log('User cleared')
		})
	}

	/**
	 * 页面埋点
	 */
	trackPage(options?: TrackPageOptions): void {
		safeExec(() => {
			if (!this.options?.enableBehavior) {
				return
			}

			const path = options?.path || (isBrowser() ? location.pathname : '')
			const title = options?.title || (isBrowser() ? document.title : '')
			const referrer = options?.referrer || (isBrowser() ? document.referrer : '')

			this.record('behavior', 'page_view', {
				pageType: 'page_view',
				path,
				title,
				referrer,
				...options,
			})

			this.logger.log('Page tracked:', path)
		})
	}

	/**
	 * 事件埋点
	 */
	trackEvent(options: TrackEventOptions): void {
		safeExec(() => {
			if (!this.options?.enableBehavior) {
				return
			}

			if (!options.name) {
				this.logger.warn('Event name is required')
				return
			}

			this.record('behavior', options.name, options)
			this.logger.log('Event tracked:', options.name)
		})
	}

	/**
	 * 主动捕获错误
	 */
	captureError(error: Error | string | unknown, extra?: Record<string, any>): void {
		safeExec(() => {
			if (!this.options?.enableError) {
				return
			}

			const err = error instanceof Error ? error : new Error(String(error))

			this.record('error', 'manual_error', {
				message: err.message,
				stack: err.stack,
				errorType: 'js',
				...extra,
			})

			this.logger.log('Error captured:', err.message)
		})
	}

	/**
	 * 手动触发上报
	 */
	flush(): void {
		safeExec(() => {
			if (this.eventQueue.length === 0) {
				this.logger.log('No events to flush')
				return
			}

			this.logger.log('Flushing', this.eventQueue.length, 'events')
			this.uploadEvents()
		})
	}

	/**
	 * 获取统计信息（调试用）
	 */
	getStats(): MonitorStats {
		return {
			queueSize: this.eventQueue.length,
			totalEvents: this.stats.totalEvents,
			droppedEvents: this.stats.droppedEvents,
			avgUploadTime:
				this.stats.uploadCount > 0 ? this.stats.totalUploadTime / this.stats.uploadCount : 0,
		}
	}

	/**
	 * 内部方法：记录事件
	 */
	private record(type: EventKind, name: string, extra?: Record<string, any>): void {
		if (!this.options) {
			return
		}

		// 采样
		if (Math.random() > this.options.sampleRate!) {
			this.stats.droppedEvents++
			return
		}

		// 构建事件
		const event: BaseEvent = {
			type,
			name,
			timestamp: Date.now(),
			appId: this.options.appId,
			sessionId: this.sessionId,
			userId: this.userId,
			url: isBrowser() ? location.href : '',
			referrer: isBrowser() ? document.referrer : undefined,
			userAgent: isBrowser() ? navigator.userAgent : '',
			sdkVersion: SDK_VERSION,
			extra,
		}

		// 入队
		this.eventQueue.push(event)
		this.stats.totalEvents++

		// 队列满时触发上报
		if (this.eventQueue.length >= this.options.maxBatchSize!) {
			this.uploadEvents()
		}
	}

	/**
	 * 上报事件
	 */
	private async uploadEvents(): Promise<void> {
		if (!this.transport || !this.options || this.eventQueue.length === 0) {
			return
		}

		const events = this.eventQueue.splice(0, this.eventQueue.length)
		const payload: ReportPayload = {
			appId: this.options.appId,
			sessionId: this.sessionId,
			events,
		}

		const startTime = Date.now()
		const success = await this.transport.send(payload)
		const uploadTime = Date.now() - startTime

		this.stats.uploadCount++
		this.stats.totalUploadTime += uploadTime

		if (!success) {
			this.logger.error('Upload failed')
		}
	}

	/**
	 * 启动定时上报
	 */
	private startUploadTimer(): void {
		if (!this.options) {
			return
		}

		this.uploadTimer = window.setInterval(() => {
			this.flush()
		}, this.options.uploadInterval!)
	}

	/**
	 * 停止定时上报
	 */
	private stopUploadTimer(): void {
		if (this.uploadTimer !== null) {
			clearInterval(this.uploadTimer)
			this.uploadTimer = null
		}
	}

	/**
	 * 注册页面卸载监听
	 */
	private registerUnloadListeners(): void {
		if (!isBrowser()) {
			return
		}

		// beforeunload：页面关闭/刷新
		window.addEventListener('beforeunload', () => {
			safeExec(() => {
				this.flush()
			})
		})

		// visibilitychange：页面隐藏
		document.addEventListener('visibilitychange', () => {
			safeExec(() => {
				if (document.visibilityState === 'hidden') {
					this.flush()
				}
			})
		})
	}

	/**
	 * 注册采集器
	 */
	private registerCollectors(): void {
		if (!this.options) {
			return
		}

		// 注册错误采集器
		if (this.options.enableError) {
			// 动态导入采集器
			import('../collectors')
				.then(({ ErrorCollector }) => {
					const errorCollector = new ErrorCollector(this)
					errorCollector.register()
					this.logger.log('Error collector registered')
				})
				.catch(err => {
					this.logger.error('Failed to load error collector:', err)
				})
		}

		// 后续可扩展性能、网络采集器
	}
}
