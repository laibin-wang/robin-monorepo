# cotc-monitor-sdk 设计文档

## 一、项目定位

`cotc-monitor-sdk` 是一个 **多框架通用的前端监控与日志埋点 SDK**，面向浏览器端 H5 / WebView 场景，为业务页面提供：

- 错误监控（JS 运行时错误、Promise 未捕获异常、资源加载错误）
- 埋点能力：
  - **页面埋点**：页面浏览、路由变化等 PageView 相关埋点
  - **事件埋点**：按钮点击、表单提交等业务事件埋点
- 性能监控（基础页面性能指标与 Web Vitals，后续逐步增强）
- 网络请求监控（XHR / fetch，后续增强）

SDK 本身 **不依赖任何前端框架（React/Vue/Angular 等）**，只依赖浏览器基础能力。针对不同框架（如 React、Vue）会通过单独的轻量适配层来集成，而不会将监控逻辑与某个框架耦合。

---

## 二、设计目标

### 2.1 功能目标

- **必选能力（第一阶段）**
  - JS 运行时错误监控（`window.onerror`）
  - Promise 未捕获异常监控（`unhandledrejection`）
  - 资源加载错误监控（`error` 事件 + 元素信息）
  - 埋点能力区分为两类：
    - **页面埋点**：`trackPage(options)`，用于记录 PV / 路由变化等页面级事件
    - **事件埋点**：`trackEvent(options)`，用于记录按钮点击等业务事件
  - 基础事件队列 & 批量上报机制
  - 页面关闭 / 隐藏时自动 flush

- **可选 / 后续扩展能力**
  - 页面性能指标采集（`LOAD`、`TTFB`、`FCP`、`LCP`、`CLS` 等）
  - 网络请求监控（代理 XHR / fetch）
  - 自动化行为埋点（如点击、路由变化）
  - 插件机制（针对特定框架或路由库的适配）

### 2.2 非功能目标

- **多框架通用**：核心只依赖浏览器 API，不绑定任何前端框架。
- **轻量 & 低侵入**：不显著影响业务页面性能，不阻塞主流程。
- **高稳定性**：SDK 内部错误不得影响业务代码运行（内部错误需要安全捕获并降级）。
- **可扩展性**：通过模块化设计、插件机制和统一事件模型，方便后期增加新事件类型与采集方式。
- **安全与合规**：支持敏感信息脱敏，要求 HTTPS 上报，避免泄露用户隐私。

---

## 三、整体架构设计

### 3.1 模块划分

`cotc-monitor-sdk` 的核心模块划分如下：

- **公共类型定义（`types`）**
  - `MonitorInitOptions`：SDK 初始化配置
  - `EventKind`：事件类型枚举（`error` | `performance` | `behavior` | `network`）
  - `BaseEvent`：统一事件模型
  - `MonitorClient` 接口：对外暴露的客户端能力接口

- **核心客户端（`core/MonitorClient`）**
  - 负责：
    - 初始化（init）
    - 公共上下文管理（appId、userId、sessionId、环境信息等）
    - 队列管理 & 批量上报（record / flush）
    - 采样、基本过滤
    - 生命周期钩子注册（beforeunload / visibilitychange）
  - 对外暴露的方法：
    - `init(options)`
    - **页面埋点**：`trackPage(options)`
    - **事件埋点**：`trackEvent(options)`
    - `captureError(error, extra?)`
    - `setUser(userId)`
    - `clearUser()`
    - `flush()`

- **采集器（`collectors/*`）**
  - `errorCollector`：错误相关采集
    - JS 运行时错误（`window.onerror`）
    - Promise 未捕获异常（`unhandledrejection`）
    - 资源加载错误（`window.addEventListener('error', handler, { capture: true })`）
  - `behaviorCollector`：行为采集
    - 手动埋点由业务调用 `trackPage` / `trackEvent`，无需额外监听
    - 后续可以扩展自动点击埋点 / 路由变化埋点
  - `performanceCollector`（后续）：
    - 使用 `Performance` API、`PerformanceObserver` 采集性能指标
  - `networkCollector`（后续）：
    - 代理 XHR / fetch，采集接口耗时、状态码等

- **上报模块（`transport`）**
  - 封装上报通道：
    - 优先使用 `navigator.sendBeacon`
    - 兜底使用 `fetch`（带 `keepalive`）
  - 支持失败重试（后续增强）

- **工具模块（`utils`）**
  - `genId`：ID 生成（sessionId 等）
  - 时间获取、环境检测（浏览器 / Node）
  - 对象合并、深拷贝（必要时）

> 第一阶段实现以「核心客户端 + 错误采集 + 行为埋点 + 上报模块」为主，其他 collector 和插件作为后续迭代内容。

### 3.2 目录结构规划

预期目录结构（不代表一定全部立即实现）：

```txt
packages/
  cotc-monitor-sdk/
    package.json
    tsconfig.json
    README.md          # 本设计文档
    src/
      index.ts         # 对外入口，导出单例与类型
      types.ts         # 类型定义（InitOptions、BaseEvent 等）
      core/
        MonitorClient.ts
      collectors/
        error.ts
        behavior.ts
        performance.ts   # 预留
        network.ts       # 预留
      transport/
        http.ts          # sendBeacon / fetch 发送逻辑
      utils/
        id.ts
        env.ts
        misc.ts
```

---

## 四、事件模型与上报协议

### 4.1 统一事件模型（BaseEvent）

SDK 内部和对接后端的核心是「统一事件模型」，所有采集类型最终统一到 `BaseEvent` 结构：

```ts
type EventKind = 'error' | 'performance' | 'behavior' | 'network'

interface BaseEvent {
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
```

不同类型事件通过 `extra` 扩展字段承载特有信息，例如：

- 错误事件（`type: 'error'`）

```ts
interface ErrorExtra {
	message: string
	stack?: string
	filename?: string
	lineno?: number
	colno?: number
	errorType: 'js' | 'promise' | 'resource'
}
```

- 行为事件（`type: 'behavior'`），在行为事件中再通过 `name` 区分「页面埋点」和「事件埋点」：

```ts
interface BehaviorExtra {
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
```

> 第一阶段实现中，`extra` 字段类型可以在 TS 内部定义，但发往后端统一为 JSON 对象，后端按约定解析。

### 4.2 上报协议

- 请求方法：`POST`
- Content-Type：`application/json`
- 请求体结构：

```json
{
	"appId": "string",
	"sessionId": "string",
	"events": [
		{
			"type": "error",
			"name": "js_error",
			"timestamp": 1700000000000,
			"appId": "demo-app",
			"sessionId": "sess-xxx",
			"userId": "user-123",
			"url": "https://example.com/page",
			"referrer": "https://example.com/",
			"userAgent": "Mozilla/5.0 ...",
			"sdkVersion": "0.1.0",
			"extra": {
				"message": "xxx is not defined",
				"stack": "...",
				"errorType": "js"
			}
		}
	]
}
```

- 上报策略：
  - 优先使用 `navigator.sendBeacon(endpoint, body)`。
  - 若 `sendBeacon` 不可用或失败，使用 `fetch` 兜底，启用 `keepalive`（若环境支持）。
  - 服务端需按 `events[]` 批量处理单次请求中的多个事件。
- 大小限制处理（后续迭代）：
  - `sendBeacon` 通常有 64KB 限制，当数据量过大时可能失败。
  - 建议在 `flush()` 逻辑中增加 payload 大小检查：
    - 若超过限制，可选择分片发送（将 `events[]` 拆成多个批次）或降级为 `fetch` 发送。
    - MVP 阶段可暂不实现，但需在代码中预留处理空间。

---

## 五、SDK 工作流程（时序）

### 5.1 生命周期主流程

1. **初始化**
   - 业务调用 `monitor.init(options)`。
   - SDK 校验 & 合并配置（填充默认值：`sampleRate`、`maxBatchSize`、`uploadInterval` 等）。
   - 生成 `sessionId` 并缓存公共字段（`appId`、`endpoint` 等）。
   - 根据开关注册对应采集器（错误、行为、性能、网络）。
   - 启动定时器（每 `uploadInterval` ms 调用一次 `flush()`）。
   - 注册 `beforeunload` / `visibilitychange` 事件，页面关闭/隐藏时强制 `flush()`。

2. **运行期**
   - 采集器监听浏览器事件（如 `error`、`unhandledrejection`）。
   - 业务代码可在任意时机调用：
     - **页面埋点**：`monitor.trackPage(pageInfo)`
     - **事件埋点**：`monitor.trackEvent(name, extra)`
     - `monitor.captureError(error, extra)`
     - `monitor.setUser(userId)`
   - 所有事件统一调用内部 `record(type, name, extra)`，写入事件队列。
   - 队列满足条件时触发上报：
     - 队列长度 `>= maxBatchSize`；
     - 定时器时间到；
     - 页面关闭/隐藏。

3. **结束阶段**
   - 页面关闭/刷新，触发 `beforeunload`；
   - SDK 调用 `flush()` 尝试发送队列内剩余事件；
   - 请求通过 `sendBeacon` 或 `fetch` 发送，完成本次会话的数据采集。

### 5.2 单条事件流转

以 JS 错误事件为例：

1. 浏览器触发 `window.onerror`；
2. `errorCollector` 捕获事件，提取 `message`、`stack` 等信息；
3. `errorCollector` 调用 `record('error', 'js_error', extra)`；
4. `record`：
   - 根据 `sampleRate` 决定是否丢弃（采样）。
   - 补全公共字段（`timestamp`、`appId`、`sessionId`、`userId`、`url` 等）。
   - 将 `BaseEvent` push 进队列。
   - 若队列长度 `>= maxBatchSize`，立即触发 `flush()`。
5. `flush` 将事件队列打包为 `{ appId, sessionId, events: [...] }`，调用上报模块发送。

---

## 六、对外 API 设计

### 6.1 初始化与基础配置

```ts
interface MonitorInitOptions {
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

	// 错误去重与限流（后续迭代，建议 MVP 后第一轮实现）
	errorThrottle?: {
		maxCount?: number // 相同错误在时间窗口内最多上报次数，默认 10
		timeWindow?: number // 时间窗口（ms），默认 60000（1分钟）
		dedupBy?: 'message' | 'message_stack_hash' // 去重依据：仅 message 或 message+stack 的 hash
	}

	// 队列持久化（后续迭代）
	persistentBeforeCrash?: boolean // 是否在页面崩溃前持久化未上报数据到 LocalStorage/IndexedDB
	storageKey?: string // 持久化存储 key，默认 'cotc_monitor_queue'
}
```

对外使用方式（多框架通用）：

```ts
import monitor from 'cotc-monitor-sdk'

monitor.init({
	appId: 'your-app-id',
	endpoint: 'https://log.example.com/collect',
	sampleRate: 1,
	maxBatchSize: 10,
	uploadInterval: 5000,
	enableError: true,
	enableBehavior: true,
})
```

### 6.2 用户信息管理

```ts
// 登录后设置用户
monitor.setUser('user-123')

// 退出登录时清空用户信息（可选设计）
monitor.clearUser()
```

- 若未调用 `setUser`，SDK 仍然可用，只是事件中不包含 `userId`。
- 推荐：
  - 仅在「需要按用户维度进行分析」的场景调用 `setUser`；
  - 对于需匿名的业务，可完全不使用该 API。

### 6.3 页面埋点 API（PageView）

用于记录页面浏览 / 路由变化等页面级事件。

```ts
// 全量写法
monitor.trackPage({
	path: '/home',
	title: document.title,
	referrer: document.referrer,
})

// 简化写法（可选设计：若不传则使用当前 location 信息）
monitor.trackPage()
```

- 适用场景：
  - 首屏加载时记录一次 PV；
  - SPA 应用在路由变化时记录 PV；
  - 某些特殊「页面」概念（如弹窗 / 步骤页）也可以抽象为 PageView。

SDK 内部会将其封装为一个 `type: 'behavior'` 的行为事件，例如：

```ts
{
  type: 'behavior',
  name: 'page_view',
  extra: {
    pageType: 'page_view',
    path: '/home',
    title: '首页',
    referrer: '...'
  }
}
```

### 6.4 事件埋点 API（Event）

用于记录按钮点击、表单提交、业务流程节点等具体「事件」。

```ts
monitor.trackEvent({
	name: 'button_click',
	buttonId: 'login',
	page: '/login',
	eventCategory: 'auth',
	eventLabel: '登录按钮',
})
```

- `options.name`：事件名称（如 `button_click`、`submit_order`）
- 其他字段作为扩展信息，用于承载业务自定义维度和属性

SDK 内部会将其封装为：

```ts
{
  type: 'behavior',
  name: 'button_click',
  extra: {
    pageType: undefined, // 或不设置
    buttonId: 'login',
    page: '/login',
    eventCategory: 'auth',
    eventLabel: '登录按钮'
  }
}
```

### 6.5 错误上报 API

```ts
// 主动捕获并上报错误
monitor.captureError(error, {
	module: 'login',
	level: 'error',
})
```

- `error` 支持 `Error` 实例、字符串或任意未知类型。
- SDK 内部会标准化为 `Error` 对象，再封装进 `BaseEvent.extra`。
- 自动监听的 `window.onerror` 和 `unhandledrejection` 也会调用同一套 `captureError` / `record` 流程。

### 6.6 手动触发 flush

```ts
// 在某些需要即时上报的场景（如关键流程结束）可以手动调用
monitor.flush()
```

---

## 七、扩展与插件设计（预留）

### 7.1 插件机制（设计预案）

后续可考虑为 SDK 提供简单插件机制，例如：

```ts
interface MonitorPlugin {
	name: string
	setup(client: MonitorClient): void
}

monitor.use(plugin)
```

示例插件：

- `@cotc/monitor-react`：自动监听 React Router 路由变化并上报 PV。
- `@cotc/monitor-vue`：提供 Vue 插件，在组件中注入 `$monitor`，以及自动路由上报。

> 插件设计属于后续扩展内容，当前阶段只在设计上预留 `use` 能力，不实现具体插件。

### 7.2 Collector 扩展

通过模块化 collector 设计，可以方便增加新的采集能力，例如：

- 长任务监控（Long Task）
- 静态资源加载慢监控
- 自定义指标采集（如业务层 KPI）

---

## 八、兼容性与约束

- 浏览器环境：
  - 优先支持：现代浏览器（Chrome / Edge / Firefox / Safari）最新 2~3 个大版本。
  - 对于老旧浏览器：
    - 若不支持 `sendBeacon`，降级为 `fetch`。
    - 若不支持 `fetch`，可选择不做兜底（第一阶段可以不实现 XHR 兜底）。
- Node 环境：
  - 当前 SDK 明确面向浏览器，不考虑在 Node 中直接运行。

---

## 九、后续迭代路线（建议）

1. **MVP 阶段**
   - 实现：
     - `MonitorClient` 核心
     - 错误采集（JS / Promise / 资源）
     - 手动埋点 API（`trackPage` / `trackEvent`）
     - 队列 & 批量上报 & `sendBeacon` / `fetch` 通道
     - `init` / `setUser` / `clearUser` / `flush`
   - 编写基础单元测试和简单 demo 页面。

2. **稳定性与可靠性增强**
   - **错误去重与限流机制**（建议 MVP 后第一轮实现）：
     - 实现相同错误在时间窗口内的去重与限流，防止错误风暴（如循环中的报错瞬间产生上千条相同日志）。
     - 支持按 `message` 或 `message+stack` 的 hash 进行去重。
   - **队列持久化与崩溃恢复**：
     - 在页面崩溃前将未上报数据持久化到 LocalStorage/IndexedDB。
     - 解决致命 JS 错误导致页面白屏时，队列中的事件（包括错误本身）丢失的问题。
   - **sendBeacon 大小限制处理**：
     - 在 `flush()` 中增加 payload 大小检查（64KB 限制）。
     - 超过限制时自动分片或降级为 `fetch`。

3. **性能 & 网络增强**
   - 新增性能采集器（FCP / LCP / CLS / LOAD）。
   - 新增网络采集器（XHR / fetch）。

4. **自动埋点 & 插件体系**
   - 基于 DOM 事件的自动点击埋点。
   - 针对路由库与框架（React/Vue）的轻量插件。

5. **配置中心 & 动态下发（更远期）**
   - 通过后端配置中心动态下发采样率、开关等策略。

---

## 十、本次实现范围说明

本次在仓库中仅完成：

- `packages/cotc-monitor-sdk` 目录与基础工程文件创建：
  - `package.json`（构建配置、入口文件设定）
  - `tsconfig.json`
  - `src/index.ts`（占位入口）
  - `README.md`（即本设计文档）

**尚未开始具体功能实现代码。**  
后续实现将严格按照本设计文档（或你确认后的版本）推进，必要调整会先更新设计文档。

---

## 十一、错误处理与降级策略

### 11.1 设计原则

- **不影响业务主流程**：SDK 内部的错误不得中断业务代码执行，不向外抛出未捕获异常。
- **内部自愈与降级**：监控能力属于「附加值」，在异常情况下优先选择降级（停止部分采集/上报），而不是影响用户体验。
- **可观测但不打扰**：SDK 自身错误可以在开发阶段通过 `console.debug` / `console.warn` 输出，线上环境则尽量降低噪音。

### 11.2 错误处理约定

- **对外公开 API**（`init` / `trackPage` / `trackEvent` / `captureError` / `setUser` / `clearUser` / `flush`）：
  - 内部全部通过 `try/catch` 保护。
  - 在出现异常时：
    - 静默失败或在控制台输出一条低优先级日志；
    - 不抛出异常，不中断调用方逻辑。
- **采集器内部错误**（error/performance/network 等）：
  - 所有事件监听回调内部均使用 `try/catch`。
  - 若发生错误，仅影响该次采集，不影响后续事件监听。
- **上报模块错误**（网络异常、JSON 序列化失败等）：
  - 网络请求失败时：
    - 不重试或做有限次数重试（后续按策略扩展）；
    - 不抛出异常，不阻塞页面卸载。
  - JSON 序列化异常时：
    - 丢弃当前批次事件，并记录内部日志（仅在开发调试阶段可见）。

### 11.3 降级行为

- 若初始化阶段 `options` 严重不合法（如缺失 `appId` 或 `endpoint`）：
  - `init` 内部直接返回，不注册任何采集器，并在 `console.error` 提示开发者。
- 若环境不支持关键 API（如 `fetch` / `sendBeacon`）：
  - 自动降级为「仅采集、不上报」或「仅在可用通道上报」，不额外引入 polyfill。

---

## 十二、数据安全与隐私边界

### 12.1 设计原则

- **最小必要原则**：只采集完成监控/统计所必需的信息，避免过度采集。
- **默认无敏感信息**：SDK 不主动采集明显的敏感个人信息（如密码、身份证号、银行卡号、手机号等）。
- **可控扩展**：任何与业务相关的敏感字段，均由业务方通过 `extra` 显式传入，SDK 不做自动抓取。

### 12.2 默认采集范围

- SDK 默认仅自动采集的字段包括（但不限于）：
  - 环境相关：
    - `appId`, `sessionId`, `sdkVersion`
    - `url`, `referrer`
    - `userAgent`
  - 事件相关：
    - `type`, `name`, `timestamp`
    - 采集器内约定的非敏感字段（如错误的 message/stack、资源 tagName 等）

### 12.3 不做的事情（边界）

- SDK 不会默认采集：
  - 表单输入内容（用户名、密码、手机号等）。
  - 接口请求 body/response 的原始数据。
  - 重度浏览器指纹（Canvas/WebGL/字体指纹等）。
- 若业务方希望上报特定字段（如订单号、业务状态码）：
  - 由业务在调用 `trackEvent` / `trackPage` / `captureError` 时，在 `extra` 中显式传入；
  - 由业务自身根据公司隐私政策和合规要求控制内容。

### 12.4 传输安全

- 强制要求：
  - `endpoint` 应为 HTTPS 链接（`https://`），避免明文传输。
- 建议：
  - 若需要进一步保护敏感字段，可在 SDK 内对部分字段做加密/脱敏处理（此为后续扩展能力，不在 MVP 范围内）。

---

## 十三、测试与验证规划

### 13.1 单元测试

- **核心模块测试**
  - `MonitorClient`：
    - `init`：配置合并、重复初始化的幂等性。
    - `record`：公共字段补全（时间、URL、sessionId 等）与采样逻辑。
    - 队列逻辑：队列入队/长度限制，满足 `maxBatchSize` 时触发 `flush`。
  - 上报模块（transport）：
    - 在测试环境中模拟 `navigator.sendBeacon` 和 `fetch`，验证调用参数正确。
- **采集器测试**
  - 错误采集器：
    - 模拟触发 `window.onerror`、`unhandledrejection`，验证是否生成对应事件。
    - 模拟资源错误事件，验证 `tagName/src` 等字段。
  - 行为埋点：
    - 调用 `trackPage` / `trackEvent`，验证生成的 `BaseEvent` 结构正确。

### 13.2 集成测试 / 手工验证

- 提供一个简单的 demo 页面（不一定单独建包，可放在仓库 `examples` 或某个 app 中）：
  - 引入构建后的 SDK（UMD/ESM 皆可）。
  - 执行以下场景检查：
    - 初始化 SDK。
    - 手动调用 `trackPage` / `trackEvent`，在控制台或 mock 接口中查看上报 payload。
    - 手动抛出错误/Promise 拒绝，验证是否被采集。
    - 页面刷新/关闭时，验证是否触发最后一次 `flush`。
- 在浏览器中覆盖至少：
  - Chrome（主测）、Edge、Safari（如有条件）、移动端 WebView 主要场景（可选）。

### 13.3 回归与演进

- 约定：
  - 每次对核心流程（event 模型、上报协议、公开 API）做重大调整时，需要更新：
    - 设计文档（本 README）
    - 对应单元测试与 demo 验证用例。
- 后续引入性能/网络采集、插件机制时，按模块补充相应测试用例。

---

## 十四、SDK 构建与发布

### 14.1 构建产物

SDK 需要支持多种模块格式以适配不同使用场景：

- **ESM (ES Module)**：`dist/index.esm.js`
  - 面向现代构建工具（Vite、Webpack 5+、Rollup）
  - 支持 Tree Shaking
- **CommonJS**：`dist/index.cjs.js`
  - 面向 Node.js 环境和传统构建工具
- **UMD (Universal Module Definition)**：`dist/index.umd.js`
  - 面向直接通过 `<script>` 标签引入的场景
  - 全局变量名：`window.CotcMonitor`
- **类型声明文件**：`dist/index.d.ts`
  - 提供完整的 TypeScript 类型支持

### 14.2 构建工具

使用 **Rollup** 进行构建：

**package.json 配置：**

```json
{
	"name": "cotc-monitor-sdk",
	"version": "0.1.0",
	"main": "./dist/index.cjs.js",
	"module": "./dist/index.esm.js",
	"types": "./dist/index.d.ts",
	"exports": {
		".": {
			"types": "./dist/index.d.ts",
			"import": "./dist/index.esm.js",
			"require": "./dist/index.cjs.js"
		}
	},
	"files": ["dist"],
	"scripts": {
		"build": "rollup -c"
	},
	"devDependencies": {
		"@rollup/plugin-typescript": "^11.1.6",
		"@rollup/plugin-terser": "^0.4.4",
		"rollup": "^4.9.6",
		"typescript": "^5.3.3"
	}
}
```

**rollup.config.js 配置：**

```js
import typescript from '@rollup/plugin-typescript'
import terser from '@rollup/plugin-terser'
import { defineConfig } from 'rollup'

export default defineConfig([
	// ESM 和 CJS 构建
	{
		input: 'src/index.ts',
		output: [
			{
				file: 'dist/index.esm.js',
				format: 'esm',
				sourcemap: true,
			},
			{
				file: 'dist/index.cjs.js',
				format: 'cjs',
				sourcemap: true,
				exports: 'auto',
			},
		],
		plugins: [
			typescript({
				declaration: true,
				declarationDir: 'dist',
				rootDir: 'src',
			}),
		],
	},
	// UMD 构建（压缩版）
	{
		input: 'src/index.ts',
		output: {
			file: 'dist/index.umd.js',
			format: 'umd',
			name: 'CotcMonitor',
			sourcemap: true,
		},
		plugins: [typescript(), terser()],
	},
])
```

### 14.3 版本管理

遵循 **语义化版本**（Semver）：

- **MAJOR**：不兼容的 API 变更
- **MINOR**：向下兼容的功能新增
- **PATCH**：向下兼容的问题修复

### 14.4 发布检查清单

发布前确认：

- [ ] 所有单元测试通过
- [ ] 构建产物正常生成（ESM/CJS/UMD）
- [ ] 类型声明文件完整
- [ ] README 与 CHANGELOG 更新
- [ ] Demo 页面验证通过
- [ ] 版本号已更新

---

## 十五、性能影响与资源占用

### 15.1 设计目标

- **包体积**：压缩后 < 10KB（gzip）
- **初始化耗时**：< 50ms
- **运行时开销**：
  - 单次事件采集 < 5ms
  - 内存占用 < 2MB（队列 + 采集器）

### 15.2 性能优化策略

- **延迟初始化**：采集器注册使用懒加载，按需启用
- **防抖与节流**：
  - 批量上报避免频繁网络请求
  - 资源错误采集使用节流（同一资源短时间内只上报一次）
- **异步处理**：
  - 事件序列化与上报放在 `requestIdleCallback` 或微任务中执行（可选）
- **内存管理**：
  - 队列设置最大长度限制（如 100 条），超过时丢弃最旧事件

### 15.3 监控自身性能

SDK 可提供内部性能指标（开发模式）：

```ts
monitor.getStats() // 返回：{ queueSize, totalEvents, droppedEvents, avgUploadTime }
```

### 15.4 性能测试基准

在实施阶段需要建立性能基准测试：

- **加载性能**：
  - 测量 SDK 脚本加载与解析时间
  - 对比引入 SDK 前后的页面加载时间差异
- **运行时性能**：
  - 使用 Performance API 测量 `init()` 耗时
  - 测量单次 `trackEvent` / `trackPage` 调用耗时
  - 测量 `flush()` 序列化与上报耗时
- **内存占用**：
  - 使用 Chrome DevTools Memory Profiler 监控内存增长
  - 长时间运行测试（如 1 小时），验证是否存在内存泄漏

### 15.5 性能降级策略

当检测到性能问题时的降级措施：

- **高频事件限流**：同一类型事件在短时间内（如 1 秒）最多采集 N 次
- **队列满时丢弃策略**：优先保留错误事件，丢弃行为埋点
- **自动降采样**：在低端设备或资源受限环境下，动态降低采样率
