# 快速开始

## 安装

使用你喜欢的包管理器安装组件：

::: code-group

```bash [SignaturePad - npm]
npm install cotc-signature-pad
```

```bash [SignaturePad - pnpm]
pnpm add cotc-signature-pad
```

```bash [SignaturePad - yarn]
yarn add cotc-signature-pad
```

```bash [MonitorSDK - npm]
npm install cotc-monitor-sdk
```

```bash [MonitorSDK - pnpm]
pnpm add cotc-monitor-sdk
```

```bash [MonitorSDK - yarn]
yarn add cotc-monitor-sdk
```

:::

## 基本使用

### SignaturePad

```html
<canvas id="signature"></canvas>
```

```typescript
import SignaturePad from 'cotc-signature-pad';

const pad = new SignaturePad('signature', {
  width: 400,
  height: 200
});
```

### MonitorSDK

```typescript
import monitor from 'cotc-monitor-sdk';

// 初始化
monitor.init({
  appId: 'your-app-id',
  endpoint: 'https://api.example.com/collect'
});

// 页面埋点
monitor.trackPage();

// 事件埋点
monitor.trackEvent({
  name: 'button_click',
  buttonId: 'submit'
});
```

## TypeScript 支持

所有组件都提供完整的 TypeScript 类型定义：

### SignaturePad

```typescript
import SignaturePad, { SignaturePadOptions } from 'cotc-signature-pad';

const options: SignaturePadOptions = {
  width: 400,
  height: 200,
  panColor: '#000000',
  backgroundColor: '#ffffff'
};

const pad = new SignaturePad('signature', options);
```

### MonitorSDK

```typescript
import monitor, { MonitorInitOptions } from 'cotc-monitor-sdk';

const options: MonitorInitOptions = {
  appId: 'my-app',
  endpoint: 'https://api.example.com/collect',
  debug: true,
  enableError: true,
  enableBehavior: true
};

monitor.init(options);
```
