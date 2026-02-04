import { ReportPayload } from '../types'
import { supportSendBeacon, supportFetch } from '../utils'

/**
 * 上报模块
 */
export class Transport {
	constructor(
		private endpoint: string,
		private debug: boolean = false,
	) {}

	/**
	 * 发送事件数据
	 */
	async send(payload: ReportPayload): Promise<boolean> {
		try {
			const body = JSON.stringify(payload)

			if (this.debug) {
				console.log('[Monitor] Sending events:', payload.events.length, 'events', payload)
			}

			// 优先使用 sendBeacon
			if (supportSendBeacon()) {
				const success = navigator.sendBeacon(this.endpoint, body)
				if (success) {
					if (this.debug) {
						console.log('[Monitor] Sent via sendBeacon')
					}
					return true
				}
				// sendBeacon 失败，降级到 fetch
				if (this.debug) {
					console.warn('[Monitor] sendBeacon failed, fallback to fetch')
				}
			}

			// 兜底使用 fetch
			if (supportFetch()) {
				const response = await fetch(this.endpoint, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body,
					keepalive: true, // 页面卸载时仍然尝试发送
				})

				if (this.debug) {
					console.log('[Monitor] Sent via fetch, status:', response.status)
				}

				return response.ok
			}

			// 无可用的上报通道
			if (this.debug) {
				console.error('[Monitor] No available transport method')
			}
			return false
		} catch (error) {
			// 上报失败不应影响业务代码
			if (this.debug) {
				console.error('[Monitor] Send failed:', error)
			}
			return false
		}
	}
}
