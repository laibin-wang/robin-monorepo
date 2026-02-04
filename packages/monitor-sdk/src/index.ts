/**
 * cotc-monitor-sdk 入口文件
 * 提供单例模式的监控客户端和类型定义
 */

import { MonitorClient } from './core';

// 导出类型定义
export type {
    MonitorInitOptions,
    TrackPageOptions,
    TrackEventOptions,
    BaseEvent,
    EventKind,
    MonitorStats,
    ErrorExtra,
    BehaviorExtra,
    ReportPayload
} from './types';

// 导出 MonitorClient 类（用于自定义实例化）
export { MonitorClient };

// 创建并导出默认单例
const monitor = new MonitorClient();

export default monitor;

// 同时导出为命名导出（方便不同使用场景）
export { monitor };

// SDK 版本号
export const version = '0.1.0';
