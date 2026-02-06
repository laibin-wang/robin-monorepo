import type {
	ECBasicOption,
	EChartsOption,
	ResizeOpts,
	EChartsType,
} from 'echarts/types/dist/shared'

import { init, dispose } from 'echarts/core'

import type { ChartConfig, ChartContext, UpdateOptions } from '../types'

import { registerModules, type ModuleName } from '../utils/register'

export class AsyncChart {
	instance: EChartsType | null = null
	container: HTMLElement
	config: ChartConfig
	private updateQueue: EChartsOption[] = []
	private rafId: number | null = null
	private eventHandlers: Map<string, Set<Function>> = new Map()
	private requiredModules: Set<ModuleName> = new Set()
	private isRegistering = false
	private registrationPromise: Promise<void> | null = null

	constructor(container: HTMLElement, config: ChartConfig = {}) {
		this.container = container
		this.config = {
			renderer: 'canvas',
			theme: 'default',
			autoResize: true,
			useDirtyRect: true,
			useCoarsePointer: true,
			pointerSize: 20,
			...config,
		}
	}

	// 声明需要的模块（由子组件调用）
	require(...modules: ModuleName[]): this {
		if (this.instance) {
			console.warn('Cannot add modules after chart is initialized')
			return this
		}
		modules.forEach(m => this.requiredModules.add(m))
		return this
	}

	// 异步初始化
	async init(): Promise<void> {
		if (this.instance || this.isRegistering) return

		this.isRegistering = true

		// 始终需要渲染器
		const rendererName = this.config.renderer === 'svg' ? 'svg' : 'canvas'
		this.requiredModules.add(rendererName as ModuleName)

		// 异步注册所有模块
		this.registrationPromise = registerModules([...this.requiredModules])
		await this.registrationPromise

		this.instance = init(this.container, this.config.theme, {
			renderer: this.config.renderer,
			useDirtyRect: this.config.useDirtyRect,
			useCoarsePointer: this.config.useCoarsePointer,
			pointerSize: this.config.pointerSize,
			locale: this.config.locale,
		})

		this.isRegistering = false
	}

	// 等待初始化完成
	async ready(): Promise<void> {
		if (this.instance) return
		if (this.registrationPromise) {
			await this.registrationPromise
		}
	}

	setOption(option: EChartsOption, opts: UpdateOptions = {}): void {
		if (!this.instance) {
			this.updateQueue.push(option)
			return
		}

		if (this.rafId === null) {
			this.rafId = requestAnimationFrame(() => this.flushUpdate(opts))
		}
	}

	private flushUpdate(opts: UpdateOptions): void {
		if (!this.instance) return

		const merged = this.updateQueue.reduce((acc, curr) => ({ ...acc, ...curr }), {})
		this.instance.setOption(merged, {
			notMerge: opts.notMerge ?? false,
			lazyUpdate: opts.lazyUpdate ?? false,
			silent: opts.silent ?? false,
		})

		this.updateQueue = []
		this.rafId = null
	}

	resize(opts?: ResizeOpts): void {
		this.instance?.resize(opts)
	}

	on(event: string, handler: Function): void {
		if (!this.eventHandlers.has(event)) {
			this.eventHandlers.set(event, new Set())
		}
		this.eventHandlers.get(event)!.add(handler)
		this.instance?.on(event, handler as any)
	}

	off(event: string, handler: Function): void {
		this.eventHandlers.get(event)?.delete(handler)
		this.instance?.off(event, handler as any)
	}

	dispatchAction(payload: any): void {
		this.instance?.dispatchAction(payload)
	}

	showLoading(opts?: any): void {
		this.instance?.showLoading(opts)
	}

	hideLoading(): void {
		this.instance?.hideLoading()
	}

	clear(): void {
		this.instance?.clear()
	}

	getOption(): ECBasicOption | undefined {
		return this.instance?.getOption()
	}

	dispose(): void {
		if (this.rafId) {
			cancelAnimationFrame(this.rafId)
			this.rafId = null
		}

		this.eventHandlers.forEach((handlers, event) => {
			handlers.forEach(h => this.instance?.off(event, h as any))
		})
		this.eventHandlers.clear()

		if (this.instance) {
			dispose(this.instance)
			this.instance = null
		}
	}

	getContext(): ChartContext {
		return {
			chart: this,
			setOption: this.setOption.bind(this),
			resize: this.resize.bind(this),
			dispatchAction: this.dispatchAction.bind(this),
			on: this.on.bind(this),
			off: this.off.bind(this),
			showLoading: this.showLoading.bind(this),
			hideLoading: this.hideLoading.bind(this),
			clear: this.clear.bind(this),
			getOption: this.getOption.bind(this),
		}
	}
}
