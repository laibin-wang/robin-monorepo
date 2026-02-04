# SignaturePad 签名板

基于 Canvas 的签名板组件，支持触摸和鼠标操作。

## 安装

```bash
npm install cotc-signature-pad
```

## 在线演示

<script setup>
import { onMounted, ref } from 'vue'

const padRef = ref(null)
const imageData = ref('')

onMounted(async () => {
  if (typeof window !== 'undefined') {
    const { default: SignaturePad } = await import('cotc-signature-pad')
    padRef.value = new SignaturePad('demo-canvas', {
      width: 400,
      height: 200,
      backgroundColor: '#ffffff',
      panColor: '#1a1a1a'
    })
  }
})

function clearPad() {
  padRef.value?.clear()
  imageData.value = ''
}

function getImage() {
  if (padRef.value) {
    imageData.value = padRef.value.getImage()
  }
}

function undo() {
  padRef.value?.undo()
}

function redo() {
  padRef.value?.redo()
}
</script>

<div class="demo-container">
  <canvas id="demo-canvas" style="border: 1px solid #ddd; border-radius: 8px; touch-action: none;"></canvas>
  <div class="demo-buttons">
    <button @click="clearPad">清空</button>
    <button @click="undo">撤销</button>
    <button @click="redo">重做</button>
    <button @click="getImage">获取图片</button>
  </div>
  <div v-if="imageData" class="demo-result">
    <p>导出结果：</p>
    <img :src="imageData" alt="签名" style="border: 1px solid #ddd; border-radius: 4px;" />
  </div>
</div>

<style>
.demo-container {
  padding: 20px;
  background: #f9f9f9;
  border-radius: 12px;
  margin: 20px 0;
}
.demo-buttons {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}
.demo-buttons button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: var(--vp-c-brand-1);
  color: white;
  cursor: pointer;
  transition: opacity 0.2s;
}
.demo-buttons button:hover {
  opacity: 0.8;
}
.demo-result {
  margin-top: 16px;
}
</style>

## 基本使用

```html
<canvas id="signature"></canvas>
```

```typescript
import SignaturePad from 'cotc-signature-pad';

const pad = new SignaturePad('signature', {
  width: 400,
  height: 200,
  panColor: '#000000',
  backgroundColor: '#ffffff'
});

// 获取签名图片（Base64 PNG）
const imageData = pad.getImage();

// 清空签名
pad.clear();

// 撤销
pad.undo();

// 重做
pad.redo();

// 销毁实例
pad.destroy();
```

## 配置选项

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `width` | `number` | `300` | 画布宽度（像素） |
| `height` | `number` | `150` | 画布高度（像素） |
| `panColor` | `string` | `'#000000'` | 笔迹颜色 |
| `backgroundColor` | `string` | `'transparent'` | 画布背景色 |

## 方法

### getImage()

获取签名的 Base64 PNG 数据。

```typescript
const imageData: string = pad.getImage();
```

### clear()

清空签名板。

```typescript
pad.clear();
```

### undo()

撤销上一笔。

```typescript
pad.undo();
```

### redo()

重做上一笔。

```typescript
pad.redo();
```

### destroy()

销毁签名板实例，移除事件监听。

```typescript
pad.destroy();
```

## 类型定义

```typescript
interface SignaturePadOptions {
  width?: number;
  height?: number;
  backgroundColor?: string;
  panColor?: string;
}
```
