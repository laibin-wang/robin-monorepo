/**
 * 事件类型枚举
 */
export type EventKind = 'error' | 'performance' | 'behavior' | 'network'

/**
 * 统一事件模型
 */
export interface BaseEvent {
	type: EventKind // 事件大类
	name: string // 事件名称，如 'js_error'、'page_view'、'LCP'
	timestamp: number // 事件发生时间（ms）

	appId: string // 应用 ID
	sessionId: string // 会话 ID，由 SDK 自动生成
	userId?: string // 用户 ID，可选，由业务通过 setUser 提供

	url: string // 当前页面 URL
	referrer?: string // 来源页面
	userAgent: string // 浏览器 UA
	sdkVersion: string // SDK 版本号

	extra?: Record<string, any> // 各类型专有扩展字段
}

/**
 * 错误事件扩展字段
 */
export interface ErrorExtra {
	message: string
	stack?: string
	filename?: string
	lineno?: number
	colno?: number
	errorType: 'js' | 'promise' | 'resource'
}

/**
 * 行为事件扩展字段
 */
export interface BehaviorExtra {
	// 页面埋点（PageView）
	pageType?: 'page_view' | 'route_change'
	path?: string // 页面路径（如 /home）
	title?: string // 页面标题
	referrer?: string // 前一个页面

	// 事件埋点（Event）
	elementId?: string
	elementText?: string
	eventCategory?: string // 业务自定义类别，如 'auth' / 'order'
	eventLabel?: string // 业务自定义标签

	// 预留字段
	[key: string]: any
}

/**
 * SDK 初始化配置
 */
export interface MonitorInitOptions {
	appId: string // 必填，应用标识
	endpoint: string // 必填，上报地址

	userId?: string // 可选，若已登录可直接传入

	sampleRate?: number // 采样率，0~1，默认 1（100%）
	maxBatchSize?: number // 批量大小，默认 10
	uploadInterval?: number // 批量上报间隔 ms，默认 5000

	enableError?: boolean // 是否开启错误采集，默认 true
	enableBehavior?: boolean // 是否开启行为埋点，默认 true
	enablePerformance?: boolean // 是否开启性能采集，默认 false（后续实现）
	enableNetwork?: boolean // 是否开启网络请求采集，默认 false（后续实现）

	debug?: boolean // 是否开启调试模式，默认 false

	// 错误去重与限流（后续迭代）
	errorThrottle?: {
		maxCount?: number // 相同错误在时间窗口内最多上报次数，默认 10
		timeWindow?: number // 时间窗口（ms），默认 60000（1分钟）
		dedupBy?: 'message' | 'message_stack_hash' // 去重依据
	}

	// 队列持久化（后续迭代）
	persistentBeforeCrash?: boolean
	storageKey?: string
}

/**
 * 页面埋点参数
 */
export interface TrackPageOptions {
	path?: string
	title?: string
	referrer?: string
	[key: string]: any
}

/**
 * 事件埋点参数
 */
export interface TrackEventOptions {
	name: string // 事件名称
	[key: string]: any // 其他自定义字段
}

/**
 * 上报请求体结构
 */
export interface ReportPayload {
	appId: string
	sessionId: string
	events: BaseEvent[]
}

/**
 * SDK 性能统计信息（调试用）
 */
export interface MonitorStats {
	queueSize: number
	totalEvents: number
	droppedEvents: number
	avgUploadTime: number
}

/**
 * MonitorClient 对外接口
 */
export interface MonitorClient {
	/**
	 * 初始化 SDK
	 */
	init(options: MonitorInitOptions): void

	/**
	 * 设置用户 ID
	 */
	setUser(userId: string): void

	/**
	 * 清空用户 ID
	 */
	clearUser(): void

	/**
	 * 页面埋点
	 */
	trackPage(options?: TrackPageOptions): void

	/**
	 * 事件埋点
	 */
	trackEvent(options: TrackEventOptions): void

	/**
	 * 主动捕获错误
	 */
	captureError(error: Error | string | unknown, extra?: Record<string, any>): void

	/**
	 * 手动触发上报
	 */
	flush(): void

	/**
	 * 获取性能统计（调试用）
	 */
	getStats?(): MonitorStats
}
