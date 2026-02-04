# cotc-monitor-sdk 使用指南

## 🎉 开发完成状态

SDK 核心功能已全部实现！以下是已完成的功能模块：

### ✅ 已完成功能

- **核心客户端** (`MonitorClient`)
  - ✅ 初始化配置
  - ✅ 会话管理（SessionID 自动生成）
  - ✅ 用户管理（setUser / clearUser）
  - ✅ 事件队列管理
  - ✅ 批量上报机制
  - ✅ 定时自动上报
  - ✅ 页面卸载时自动上报
  - ✅ 采样控制
  - ✅ 调试模式

- **错误监控** (`ErrorCollector`)
  - ✅ JS 运行时错误监听
  - ✅ Promise 未捕获异常监听
  - ✅ 资源加载错误监听
  - ✅ 主动错误捕获 API

- **行为埋点**
  - ✅ 页面浏览埋点 (`trackPage`)
  - ✅ 事件埋点 (`trackEvent`)
  - ✅ 自定义扩展字段支持

- **上报模块** (`Transport`)
  - ✅ sendBeacon 优先上报
  - ✅ fetch 降级兜底
  - ✅ keepalive 支持

- **工具模块**
  - ✅ ID 生成器
  - ✅ 环境检测
  - ✅ 错误规范化
  - ✅ 日志工具
  - ✅ 安全执行包装

- **构建系统**
  - ✅ ESM 格式输出
  - ✅ CommonJS 格式输出
  - ✅ UMD 格式输出（压缩）
  - ✅ TypeScript 类型声明
  - ✅ Source Map 支持

---

## 📦 安装

```bash
cd packages/cotc-monitor-sdk
npm install
npm run build
```

---

## 🚀 快速开始

### 1. ESM 方式（推荐）

```typescript
import monitor from 'cotc-monitor-sdk';

// 初始化
monitor.init({
  appId: 'your-app-id',
  endpoint: 'https://your-server.com/api/collect',
  debug: true,  // 开发环境建议开启
  enableError: true,
  enableBehavior: true
});

// 页面埋点
monitor.trackPage();

// 事件埋点
monitor.trackEvent({
  name: 'button_click',
  buttonId: 'submit',
  eventCategory: 'auth'
});
```

### 2. CommonJS 方式

```javascript
const monitor = require('cotc-monitor-sdk').default;

monitor.init({
  appId: 'your-app-id',
  endpoint: 'https://your-server.com/api/collect'
});
```

### 3. UMD 方式（Script 标签）

```html
<script src="./dist/index.umd.js"></script>
<script>
  CotcMonitor.init({
    appId: 'your-app-id',
    endpoint: 'https://your-server.com/api/collect'
  });

  CotcMonitor.trackPage();
</script>
```

---

## 📖 API 文档

### init(options)

初始化 SDK

```typescript
monitor.init({
  appId: 'string',           // 必填：应用 ID
  endpoint: 'string',        // 必填：上报地址
  userId?: 'string',         // 可选：用户 ID
  sampleRate?: number,       // 可选：采样率（0-1），默认 1
  maxBatchSize?: number,     // 可选：批量大小，默认 10
  uploadInterval?: number,   // 可选：上报间隔（ms），默认 5000
  enableError?: boolean,     // 可选：是否开启错误监控，默认 true
  enableBehavior?: boolean,  // 可选：是否开启行为埋点，默认 true
  debug?: boolean           // 可选：调试模式，默认 false
});
```

### trackPage(options?)

页面浏览埋点

```typescript
// 自动获取当前页面信息
monitor.trackPage();

// 自定义页面信息
monitor.trackPage({
  path: '/home',
  title: '首页',
  referrer: '...'
});
```

### trackEvent(options)

事件埋点

```typescript
monitor.trackEvent({
  name: 'button_click',      // 必填：事件名称
  buttonId: 'login',         // 自定义字段
  eventCategory: 'auth',     // 自定义字段  
  eventLabel: '登录按钮'      // 自定义字段
});
```

### captureError(error, extra?)

主动捕获错误

```typescript
try {
  // some code
} catch (error) {
  monitor.captureError(error, {
    module: 'login',
    level: 'error'
  });
}
```

### setUser(userId)

设置用户 ID  

```typescript
monitor.setUser('user-12345');
```

### clearUser()

清除用户 ID

```typescript
monitor.clearUser();
```

### flush()

手动触发上报

```typescript
monitor.flush();
```

### getStats()

获取统计信息（调试用）

```typescript
const stats = monitor.getStats();
console.log(stats);
// {
//   queueSize: 3,          // 当前队列大小
//   totalEvents: 42,       // 总事件数
//   droppedEvents: 5,      // 丢弃事件数
//   avgUploadTime: 123     // 平均上报耗时（ms）
// }
```

---

## 🧪 测试 Demo

已提供交互式 Demo 页面：

```bash
# 方式1：使用本地服务器
cd packages/cotc-monitor-sdk
npx http-server -p 8080
# 访问 http://localhost:8080/demo/

# 方式2：直接在浏览器打开
# 打开 packages/cotc-monitor-sdk/demo/index.html
```

---

## 📊 事件上报协议

### 请求格式

```
POST {endpoint}
Content-Type: application/json
```

### 请求体

```json
{
  "appId": "your-app-id",
  "sessionId": "sess-xxx",
  "events": [
    {
      "type": "error",
      "name": "js_error",
      "timestamp": 1700000000000,
      "appId": "your-app-id",
      "sessionId": "sess-xxx",
      "userId": "user-123",
      "url": "https://example.com/page",
      "referrer": "https://example.com/",
      "userAgent": "Mozilla/5.0...",
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

---

## 🔧 开发脚本

```bash
# 构建
npm run build

# 开发模式（监听文件变化）
npm run dev

# 清理构建产物
npm run clean
```

---

## 📝 后续扩展计划

根据设计文档，以下功能可在后续迭代中实现：

### 第二阶段：稳定性增强
- [ ] 错误去重与限流
- [ ] 队列持久化（LocalStorage/IndexedDB）
- [ ] sendBeacon 大小限制处理

### 第三阶段：性能与网络
- [ ] 性能指标采集（FCP/LCP/CLS）
- [ ] 网络请求监控（XHR/fetch）

### 第四阶段：自动化与插件
- [ ] 自动点击埋点
- [ ] React/Vue 路由插件
- [ ] 插件机制

---

## 💡 使用建议

1. **生产环境**
   - 关闭 `debug` 模式
   - 根据业务量调整 `sampleRate`
   - 使用 HTTPS endpoint

2. **开发环境**
   - 开启 `debug` 模式查看详细日志
   - 使用测试端点（如 httpbin.org）

3. **性能优化**
   - 合理设置 `maxBatchSize` 和 `uploadInterval`
   - 避免在高频场景下过度埋点

---

## 🎯 使用示例

### React 应用

```tsx
// App.tsx
import { useEffect } from 'react';
iimport { useLocation } from 'react-router-dom';
import monitor from 'cotc-monitor-sdk';

function App() {
  const location = useLocation();

  useEffect(() => {
    monitor.init({
      appId: 'react-app',
      endpoint: 'https://api.example.com/collect',
      enableError: true,
      enableBehavior: true
    });
  }, []);

  useEffect(() => {
    monitor.trackPage({
      path: location.pathname,
      title: document.title
    });
  }, [location]);

  return <YourApp />;
}
```

### Vue 应用

```typescript
// main.ts
import { createApp } from 'vue';
import router from './router';
import monitor from 'cotc-monitor-sdk';

monitor.init({
  appId: 'vue-app',
  endpoint: 'https://api.example.com/collect'
});

router.afterEach((to) => {
  monitor.trackPage({
    path: to.path,
    title: to.meta.title as string || document.title
  });
});

createApp(App).use(router).mount('#app');
```

---

## 📄 License

MIT

---

**开发完成日期**: 2026-01-29  
**SDK 版本**: 0.1.0
