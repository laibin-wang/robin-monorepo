// PureLoading.ts
import { DEFAULT_LOADING_CONFIG } from '../constants/defaultConfig'

type LoadingId = symbol | string

// 构造配置：必须包含 target，可包含 id 和其他配置（排除 removeOnClose）
interface LoadingConstructorConfig extends Partial<Omit<LoadingConfig, 'removeOnClose'>> {
	target: HTMLElement
	id?: LoadingId
}

// 启动配置：排除 id、target、removeOnClose
type LoadingStartConfig = Partial<Omit<LoadingConfig, 'id' | 'target' | 'removeOnClose'>>

interface LoadingConfig {
	text?: string
	color?: string
	textColor?: string
	maskColor?: string
	showSpinner?: boolean
	spinnerRadius?: number
	lineWidth?: number
	fontSize?: number
	zlevel?: number // 保持与原有字段一致，内部使用 zIndex
	removeOnClose?: boolean // 构造时传入无效，仅在无 target 全局模式时有效，此处保留以兼容类型
}

const DEFAULT_CONFIG = {
	...DEFAULT_LOADING_CONFIG,
	removeOnClose: true,
	zlevel: 9999,
}

/**
 * 单个 Loading 实例类
 * 构造时绑定容器，控制单个 Loading 的显示/隐藏/更新/销毁
 */
class PureLoadingService {
	private id: LoadingId
	private target: HTMLElement
	private config: Required<Omit<LoadingConfig, 'target' | 'id' | 'removeOnClose'>> & {
		removeOnClose?: boolean
	}
	private maskEl: HTMLElement
	private contentEl: HTMLElement
	private spinnerEl?: HTMLElement
	private textEl: HTMLElement
	private isShown: boolean = false
	private isDestroyed: boolean = false

	constructor(options: LoadingConstructorConfig) {
		const { target, id, ...restConfig } = options

		// 合并默认配置
		this.config = {
			...DEFAULT_CONFIG,
			...restConfig,
		}
		this.target = target
		this.id = id ?? Symbol('pure-loading')

		// 确保容器定位
		if (getComputedStyle(this.target).position === 'static') {
			this.target.style.position = 'relative'
		}

		this.maskEl = this.createMaskEl()
		this.contentEl = this.createContentEl()
		if (this.config.showSpinner) {
			this.spinnerEl = this.createSpinnerEl()
			this.contentEl.appendChild(this.spinnerEl)
		}
		this.textEl = this.createTextEl()
		this.contentEl.appendChild(this.textEl)
		this.maskEl.appendChild(this.contentEl)
		this.target.appendChild(this.maskEl)

		// 全局动画（仅注入一次）
		if (!document.querySelector('#pure-loading-style')) {
			const style = document.createElement('style')
			style.id = 'pure-loading-style'
			style.textContent = `
        @keyframes pure-loading-spin {
          to { transform: rotate(360deg); }
        }
      `
			document.head.appendChild(style)
		}
	}

	createMaskEl(): HTMLElement {
		const maskEl = document.createElement('div')
		maskEl.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: ${this.config.maskColor};
      display: none;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      pointer-events: auto;
      z-index: ${this.config.zlevel};
    `
		return maskEl
	}

	createContentEl(): HTMLElement {
		const contentEl = document.createElement('div')
		contentEl.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    `
		return contentEl
	}

	createTextEl(): HTMLElement {
		const textEl = document.createElement('div')
		textEl.textContent = this.config.text
		textEl.style.cssText = `
      font-size: ${this.config.fontSize}px;
      color: ${this.config.textColor};
      margin-top: ${this.config.showSpinner ? '8px' : '0'};
      font-family: sans-serif;
    `
		return textEl
	}
	createSpinnerEl(): HTMLElement {
		const spinnerEl = document.createElement('div')
		spinnerEl.style.cssText = `
        width: ${this.config.spinnerRadius * 2}px;
        height: ${this.config.spinnerRadius * 2}px;
        border: ${this.config.lineWidth}px solid ${this.config.color}20;
        border-top-color: ${this.config.color};
        border-radius: 50%;
        animation: pure-loading-spin 0.8s linear infinite;
      `
		return spinnerEl
	}

	/**
	 * 显示 Loading，并可更新配置（排除 id/target/removeOnClose）
	 */
	start(config: LoadingStartConfig = {}): void {
		if (this.isDestroyed) {
			console.warn('PureLoadingService: 实例已销毁，无法 start')
			return
		}
		this.update(config)
		this.maskEl.style.display = 'flex'
		this.isShown = true
	}

	/**
	 * 更新配置（不改变显示状态）
	 */
	update(config: LoadingStartConfig): void {
		if (this.isDestroyed) return

		const prevConfig = { ...this.config }
		Object.assign(this.config, config)

		// 遮罩颜色
		if (config.maskColor) {
			this.maskEl.style.backgroundColor = config.maskColor
		}

		// 文字内容及样式
		if (config.text) this.textEl.textContent = config.text
		if (config.textColor) this.textEl.style.color = config.textColor
		if (config.fontSize) this.textEl.style.fontSize = `${config.fontSize}px`

		// 旋转器显隐
		if (config.showSpinner !== undefined) {
			if (config.showSpinner && !this.spinnerEl) {
				// 创建 spinner
				const radius = config.spinnerRadius ?? prevConfig.spinnerRadius
				const width = config.lineWidth ?? prevConfig.lineWidth
				const color = config.color ?? prevConfig.color
				const newSpinner = document.createElement('div')
				newSpinner.style.cssText = `
          width: ${radius * 2}px;
          height: ${radius * 2}px;
          border: ${width}px solid ${color}20;
          border-top-color: ${color};
          border-radius: 50%;
          animation: pure-loading-spin 0.8s linear infinite;
        `
				this.contentEl.insertBefore(newSpinner, this.textEl)
				this.spinnerEl = newSpinner
				this.textEl.style.marginTop = '8px'
			} else if (!config.showSpinner && this.spinnerEl) {
				this.spinnerEl.remove()
				this.spinnerEl = undefined
				this.textEl.style.marginTop = '0'
			}
		}

		// 更新 spinner 样式
		if (this.spinnerEl) {
			if (config.color) {
				this.spinnerEl.style.borderTopColor = config.color
				// 保持半透明边框颜色一致
				const borderColor = this.spinnerEl.style.borderColor
				if (borderColor && borderColor.includes('rgba')) {
					this.spinnerEl.style.borderColor = `${config.color}20`
				}
			}
			if (config.spinnerRadius) {
				this.spinnerEl.style.width = `${config.spinnerRadius * 2}px`
				this.spinnerEl.style.height = `${config.spinnerRadius * 2}px`
			}
			if (config.lineWidth) {
				this.spinnerEl.style.borderWidth = `${config.lineWidth}px`
			}
		}
	}

	/**
	 * 关闭 Loading
	 * @param destroy true - 彻底销毁（移除 DOM，实例不可再用）
	 *                false - 仅隐藏，可再次 start
	 */
	end(destroy: boolean = false): void {
		if (this.isDestroyed) return

		if (destroy) {
			// 彻底销毁
			this.maskEl.remove()
			this.isDestroyed = true
			this.isShown = false
			// 清理引用（可选）
			;(this as any).target = null
			;(this as any).maskEl = null
			;(this as any).contentEl = null
			;(this as any).spinnerEl = null
			;(this as any).textEl = null
		} else {
			// 仅隐藏
			this.maskEl.style.display = 'none'
			this.isShown = false
		}
	}

	/**
	 * 获取当前是否显示
	 */
	get isActive(): boolean {
		return this.isShown && !this.isDestroyed
	}

	/**
	 * 获取实例唯一标识
	 */
	getId(): LoadingId {
		return this.id
	}
}

export default PureLoadingService

// 为了兼容原有全局单例调用方式，可以保留，但不再是核心
// 如不需要可删除
// export const Loading = new PureLoadingService({
//   target: document.body,
//   text: '加载中...'
// })
