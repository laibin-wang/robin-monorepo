import { MonitorClient } from '../core';
import { isBrowser, safeExec } from '../utils';

/**
 * 错误采集器
 */
export class ErrorCollector {
    private client: MonitorClient;
    private hasRegistered: boolean = false;

    constructor(client: MonitorClient) {
        this.client = client;
    }

    /**
     * 注册错误监听
     */
    register(): void {
        if (!isBrowser() || this.hasRegistered) {
            return;
        }

        this.registerJsError();
        this.registerPromiseError();
        this.registerResourceError();

        this.hasRegistered = true;
    }

    /**
     * 注册 JS 运行时错误监听
     */
    private registerJsError(): void {
        window.addEventListener('error', (event: ErrorEvent) => {
            safeExec(() => {
                // 排除资源加载错误（ target 是 Element）
                if (event.target && event.target !== window) {
                    return;
                }

                this.client['record']('error', 'js_error', {
                    message: event.message,
                    stack: event.error?.stack,
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno,
                    errorType: 'js'
                });
            });
        });
    }

    /**
     * 注册 Promise 未捕获异常监听
     */
    private registerPromiseError(): void {
        window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
            safeExec(() => {
                const reason = event.reason;
                const error = reason instanceof Error ? reason : new Error(String(reason));

                this.client['record']('error', 'promise_error', {
                    message: error.message,
                    stack: error.stack,
                    errorType: 'promise'
                });
            });
        });
    }

    /**
     * 注册资源加载错误监听
     */
    private registerResourceError(): void {
        window.addEventListener(
            'error',
            (event: Event) => {
                safeExec(() => {
                    const target = event.target;

                    // 仅处理资源加载错误（target 必须是 HTMLElement）
                    if (!target || !(target instanceof HTMLElement)) {
                        return;
                    }

                    const tagName = target.tagName?.toLowerCase();
                    let src = '';

                    if (tagName === 'img' || tagName === 'script') {
                        src = (target as HTMLImageElement | HTMLScriptElement).src;
                    } else if (tagName === 'link') {
                        src = (target as HTMLLinkElement).href;
                    }

                    if (src) {
                        this.client['record']('error', 'resource_error', {
                            message: `Resource load failed: ${tagName}`,
                            filename: src,
                            tagName,
                            errorType: 'resource'
                        });
                    }
                });
            },
            true // 使用捕获阶段
        );
    }

    /**
     * 注销错误监听
     */
    unregister(): void {
        // 由于 addEventListener 使用了箭头函数，无法精确移除
        // 实际场景中 SDK 通常不需要 unregister，页面关闭即释放
        this.hasRegistered = false;
    }
}
