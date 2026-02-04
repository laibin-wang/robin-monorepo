# MonitorSDK 监控 SDK

基于浏览器的前端监控与日志埋点 SDK，支持错误监控、行为埋点和智能上报。

## 特性

- 🚨 **错误监控** - 自动捕获 JS 错误、Promise 异常、资源加载错误
- 📊 **行为埋点** - 支持页面浏览 (PV) 和自定义事件埋点
- 🔄 **智能上报** - sendBeacon + fetch 双通道，批量上报机制
- 🎯 **轻量高效** - 构建产物 < 10KB (gzip)
- 🔧 **多格式支持** - ESM、CommonJS、UMD 三种格式
- 📦 **TypeScript** - 完整的类型定义
- 🌐 **框架无关** - 可在 React/Vue/Angular 等项目中使用

## 安装

::: code-group

```bash [npm]
npm install cotc-monitor-sdk
```

```bash [yarn]
yarn add cotc-monitor-sdk
```

```bash [pnpm]
pnpm add cotc-monitor-sdk
```

:::

## 快速开始

### 基本使用

```typescript
import monitor from 'cotc-monitor-sdk'

// 初始化
monitor.init({
	appId: 'your-app-id',
	endpoint: 'https://api.example.com/collect',
	debug: true, // 开发环境建议开启
})

// 页面埋点
monitor.trackPage()

// 事件埋点
monitor.trackEvent({
	name: 'button_click',
	buttonId: 'submit',
	eventCategory: 'auth',
})
```

### React 集成

```tsx
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import monitor from 'cotc-monitor-sdk'

function App() {
	const location = useLocation()

	useEffect(() => {
		monitor.init({
			appId: 'react-app',
			endpoint: 'https://api.example.com/collect',
			debug: import.meta.env.DEV,
		})
	}, [])

	useEffect(() => {
		monitor.trackPage({
			path: location.pathname,
			title: document.title,
		})
	}, [location])

	return <YourApp />
}
```

### Vue 集成

```typescript
// main.ts
import { createApp } from 'vue'
import router from './router'
import monitor from 'cotc-monitor-sdk'

monitor.init({
	appId: 'vue-app',
	endpoint: 'https://api.example.com/collect',
})

router.afterEach(to => {
	monitor.trackPage({
		path: to.path,
		title: (to.meta.title as string) || document.title,
	})
})

createApp(App).use(router).mount('#app')
```

## API 参考

### init(options)

初始化 SDK。

```typescript
monitor.init({
  appId: 'string',           // 必填：应用标识
  endpoint: 'string',        // 必填：上报地址

  // 可选配置
  userId?: 'string',         // 用户 ID
  sampleRate?: number,       // 采样率 (0-1)，默认 1
  maxBatchSize?: number,     // 批量大小，默认 10
  uploadInterval?: number,   // 上报间隔(ms)，默认 5000
  enableError?: boolean,     // 开启错误监控，默认 true
  enableBehavior?: boolean,  // 开启行为埋点，默认 true
  debug?: boolean           // 调试模式，默认 false
});
```

### trackPage(options?)

记录页面浏览事件。

```typescript
// 使用默认值
monitor.trackPage()

// 自定义参数
monitor.trackPage({
	path: '/product/123',
	title: '商品详情页',
	category: 'product',
})
```

### trackEvent(options)

记录自定义事件。

```typescript
monitor.trackEvent({
	name: 'button_click', // 必填
	buttonId: 'login-btn',
	eventCategory: 'auth',
	eventLabel: '登录按钮',
})
```

### captureError(error, extra?)

主动捕获错误。

```typescript
try {
	// some code
} catch (error) {
	monitor.captureError(error, {
		module: 'payment',
		level: 'critical',
	})
}
```

### setUser(userId) / clearUser()

用户管理。

```typescript
// 登录后
monitor.setUser('user-12345')

// 登出时
monitor.clearUser()
```

### flush()

立即上报队列中的事件。

```typescript
monitor.flush()
```

### getStats()

获取统计信息（调试用）。

```typescript
const stats = monitor.getStats()
// {
//   queueSize: 3,
//   totalEvents: 42,
//   droppedEvents: 5,
//   avgUploadTime: 123
// }
```

## 配置选项

| 选项             | 类型      | 默认值  | 说明           |
| ---------------- | --------- | ------- | -------------- |
| `appId`          | `string`  | -       | 必填，应用标识 |
| `endpoint`       | `string`  | -       | 必填，上报地址 |
| `userId`         | `string`  | -       | 用户 ID        |
| `sampleRate`     | `number`  | `1`     | 采样率 (0-1)   |
| `maxBatchSize`   | `number`  | `10`    | 批量上报大小   |
| `uploadInterval` | `number`  | `5000`  | 上报间隔 (ms)  |
| `enableError`    | `boolean` | `true`  | 开启错误监控   |
| `enableBehavior` | `boolean` | `true`  | 开启行为埋点   |
| `debug`          | `boolean` | `false` | 调试模式       |

## 事件上报协议

### 请求格式

```
POST {endpoint}
Content-Type: application/json
```

### 请求体结构

```json
{
	"appId": "your-app-id",
	"sessionId": "sess-1706542800000-abc123",
	"events": [
		{
			"type": "error",
			"name": "js_error",
			"timestamp": 1706542800000,
			"appId": "your-app-id",
			"sessionId": "sess-xxx",
			"userId": "user-123",
			"url": "https://example.com/page",
			"referrer": "https://example.com/",
			"userAgent": "Mozilla/5.0...",
			"sdkVersion": "0.1.0",
			"extra": {
				"message": "xxx is not defined",
				"stack": "Error: xxx is not defined\n  at...",
				"errorType": "js"
			}
		}
	]
}
```

### 事件类型

#### 错误事件 (type: 'error')

```typescript
{
  type: 'error',
  name: 'js_error' | 'promise_error' | 'resource_error' | 'manual_error',
  extra: {
    message: string,
    stack?: string,
    filename?: string,
    lineno?: number,
    colno?: number,
    errorType: 'js' | 'promise' | 'resource'
  }
}
```

#### 行为事件 (type: 'behavior')

```typescript
// 页面埋点
{
  type: 'behavior',
  name: 'page_view',
  extra: {
    pageType: 'page_view',
    path: string,
    title: string,
    referrer?: string
  }
}

// 事件埋点
{
  type: 'behavior',
  name: string,
  extra: {
    // 自定义字段
  }
}
```

## 自动捕获的错误

SDK 会自动捕获以下错误，无需手动调用：

### JavaScript 运行时错误

```javascript
// 会被自动捕获
throw new Error('Oops!')
undefinedVariable.property
```

### Promise 未捕获异常

```javascript
// 会被自动捕获
Promise.reject('Something went wrong')

fetch('/api').then(res => {
	throw new Error('Failed')
})
```

### 资源加载错误

```html
<!-- 会被自动捕获 -->
<img src="https://invalid-url.com/image.jpg" />
<script src="https://invalid-url.com/script.js"></script>
<link rel="stylesheet" href="https://invalid-url.com/style.css" />
```

## 使用示例

### 电商场景

```typescript
// 商品详情页 PV
monitor.trackPage({
	path: '/product/123',
	title: 'iPhone 15 Pro',
	category: 'electronics',
})

// 加入购物车
monitor.trackEvent({
	name: 'add_to_cart',
	productId: '123',
	productName: 'iPhone 15 Pro',
	price: 7999,
	quantity: 1,
})

// 订单支付
monitor.trackEvent({
	name: 'order_paid',
	orderId: 'ORD20240129001',
	amount: 7999,
	paymentMethod: 'alipay',
})
```

### 表单场景

```typescript
// 表单提交
document.querySelector('form').addEventListener('submit', e => {
	e.preventDefault()

	monitor.trackEvent({
		name: 'form_submit',
		formName: 'contact',
		fields: ['name', 'email', 'message'],
		eventCategory: 'engagement',
	})

	// 提交表单...
})

// 表单验证失败
monitor.trackEvent({
	name: 'form_validation_error',
	formName: 'register',
	invalidFields: ['email', 'password'],
	eventCategory: 'error',
})
```

### 视频播放场景

```typescript
const video = document.querySelector('video')

// 播放
video.addEventListener('play', () => {
	monitor.trackEvent({
		name: 'video_play',
		videoId: 'vid-123',
		videoTitle: '教程视频',
		duration: video.duration,
	})
})

// 暂停
video.addEventListener('pause', () => {
	monitor.trackEvent({
		name: 'video_pause',
		videoId: 'vid-123',
		currentTime: video.currentTime,
	})
})

// 播放完成
video.addEventListener('ended', () => {
	monitor.trackEvent({
		name: 'video_complete',
		videoId: 'vid-123',
		watchDuration: video.duration,
	})
})
```

## 调试模式

开启 `debug: true` 后，SDK 会在控制台输出详细日志：

```typescript
monitor.init({
	appId: 'test-app',
	endpoint: 'https://api.example.com/collect',
	debug: true, // 👈 开启调试
})
```

输出示例：

```
[Monitor] SDK initialized { appId: 'test-app', sessionId: 'sess-xxx', version: '0.1.0' }
[Monitor] Error collector registered
[Monitor] Page tracked: /home
[Monitor] Event tracked: button_click
[Monitor] Flushing 5 events
[Monitor] Sending events: 5 events
[Monitor] Sent via sendBeacon
```

## 性能影响

- **包体积**：< 10KB (gzip)
- **初始化耗时**：< 50ms
- **单次事件采集**：< 5ms
- **内存占用**：< 2MB

## 浏览器支持

- Chrome (最新 2 个版本)
- Edge (最新 2 个版本)
- Firefox (最新 2 个版本)
- Safari (最新 2 个版本)

对于不支持 `sendBeacon` 的浏览器会自动降级为 `fetch`。

## TypeScript 支持

SDK 提供完整的类型定义：

```typescript
import monitor, {
	MonitorInitOptions,
	TrackPageOptions,
	TrackEventOptions,
	MonitorStats,
} from 'cotc-monitor-sdk'

const options: MonitorInitOptions = {
	appId: 'app',
	endpoint: 'https://api.example.com/collect',
}

monitor.init(options)
```

## 更多资源

- [GitHub 仓库](https://github.com/WenwuLi/cotc-monorepo)
- [设计文档](../../packages/cotc-monitor-sdk/README.md)
- [NPM 包](https://www.npmjs.com/package/cotc-monitor-sdk)
