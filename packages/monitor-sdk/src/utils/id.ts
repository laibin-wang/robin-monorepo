/**
 * 生成唯一 ID
 */
export function genId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * 生成会话 ID（页面级别唯一）
 */
export function genSessionId(): string {
    return `sess-${genId()}`;
}
