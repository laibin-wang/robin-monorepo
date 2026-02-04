/**
 * 检查是否在浏览器环境
 */
export function isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * 检查是否支持 sendBeacon
 */
export function supportSendBeacon(): boolean {
    return isBrowser() && typeof navigator.sendBeacon === 'function';
}

/**
 * 检查是否支持 fetch
 */
export function supportFetch(): boolean {
    return isBrowser() && typeof fetch === 'function';
}
