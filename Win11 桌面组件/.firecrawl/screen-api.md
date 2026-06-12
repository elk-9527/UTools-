[Skip to content](https://www.u-tools.cn/docs/developer/utools-api/screen.html#VPContent)

Return to top

# 屏幕 [​](https://www.u-tools.cn/docs/developer/utools-api/screen.html\#%E5%B1%8F%E5%B9%95)

提供一些针对用户屏幕的操作

## `utools.screenColorPick(callback)` [​](https://www.u-tools.cn/docs/developer/utools-api/screen.html\#utools-screencolorpick-callback)

屏幕取色，弹出一个取色器，用户取完色执行回调函数

### 类型定义 [​](https://www.u-tools.cn/docs/developer/utools-api/screen.html\#%E7%B1%BB%E5%9E%8B%E5%AE%9A%E4%B9%89)

ts

```
function screenColorPick(callback: (colors: { hex: string; rgb: string }) => void): void;
```

- `callback`: 颜色选择后的回调函数
  - `colors`: 颜色对象
    - `hex`: 十六进制颜色值
    - `rgb`: RGB 颜色值

### 示例代码 [​](https://www.u-tools.cn/docs/developer/utools-api/screen.html\#%E7%A4%BA%E4%BE%8B%E4%BB%A3%E7%A0%81)

js

```
// 取色
utools.screenColorPick((colors) => {
  const { hex, rgb } = colors;
  console.log(hex, rgb);
});
```

## `utools.screenCapture(callback)` [​](https://www.u-tools.cn/docs/developer/utools-api/screen.html\#utools-screencapture-callback)

屏幕截图，会进入截图模式，用户框选区域截图完执行回调函数

### 类型定义 [​](https://www.u-tools.cn/docs/developer/utools-api/screen.html\#%E7%B1%BB%E5%9E%8B%E5%AE%9A%E4%B9%89-1)

ts

```
function screenCapture(callback: (image: string) => void): void;
```

- `callback`: 截图完的回调函数
  - `image` 截图的图像 base64 Data Url

### 示例代码 [​](https://www.u-tools.cn/docs/developer/utools-api/screen.html\#%E7%A4%BA%E4%BE%8B%E4%BB%A3%E7%A0%81-1)

js

```
// 截图完将图片发送到「OCR 文字识别」再跳转到进行翻译
utools.screenCapture((image) => {
  utools.redirect(['OCR 文字识别', '文字识别+翻译'], image)
});
```

## `utools.getPrimaryDisplay()` [​](https://www.u-tools.cn/docs/developer/utools-api/screen.html\#utools-getprimarydisplay)

获取主显示器

### 类型定义 [​](https://www.u-tools.cn/docs/developer/utools-api/screen.html\#%E7%B1%BB%E5%9E%8B%E5%AE%9A%E4%B9%89-2)

ts

```
function getPrimaryDisplay(): Display;
```

提示

在下列获取屏幕对象时，`Display` 类型定义见 [Display](https://www.electronjs.org/docs/api/screen#screengetprimarydisplay)

### 示例代码 [​](https://www.u-tools.cn/docs/developer/utools-api/screen.html\#%E7%A4%BA%E4%BE%8B%E4%BB%A3%E7%A0%81-2)

js

```
const display = utools.getPrimaryDisplay();
console.log(display);
```

## `utools.getAllDisplays()` [​](https://www.u-tools.cn/docs/developer/utools-api/screen.html\#utools-getalldisplays)

获取所有显示器

### 类型定义 [​](https://www.u-tools.cn/docs/developer/utools-api/screen.html\#%E7%B1%BB%E5%9E%8B%E5%AE%9A%E4%B9%89-3)

ts

```
function getAllDisplays(): Display[];
```

### 示例代码 [​](https://www.u-tools.cn/docs/developer/utools-api/screen.html\#%E7%A4%BA%E4%BE%8B%E4%BB%A3%E7%A0%81-3)

js

```
const displays = utools.getAllDisplays();
console.log(displays);
```

## `utools.getCursorScreenPoint()` [​](https://www.u-tools.cn/docs/developer/utools-api/screen.html\#utools-getcursorscreenpoint)

获取鼠标当前位置，为鼠标在系统中的绝对位置

### 类型定义 [​](https://www.u-tools.cn/docs/developer/utools-api/screen.html\#%E7%B1%BB%E5%9E%8B%E5%AE%9A%E4%B9%89-4)

ts

```
function getCursorScreenPoint(): { x: number; y: number };
```

### 示例代码 [​](https://www.u-tools.cn/docs/developer/utools-api/screen.html\#%E7%A4%BA%E4%BE%8B%E4%BB%A3%E7%A0%81-4)

js

```
const { x, y } = utools.getCursorScreenPoint();
console.log(x, y);
```

## `utools.getDisplayNearestPoint(point)` [​](https://www.u-tools.cn/docs/developer/utools-api/screen.html\#utools-getdisplaynearestpoint-point)

获取点位置所在的显示器

### 类型定义 [​](https://www.u-tools.cn/docs/developer/utools-api/screen.html\#%E7%B1%BB%E5%9E%8B%E5%AE%9A%E4%B9%89-5)

ts

```
function getDisplayNearestPoint(point: { x: number; y: number }): Display;
```

- `point` 包含 x 和 y 的位置对象

### 示例代码 [​](https://www.u-tools.cn/docs/developer/utools-api/screen.html\#%E7%A4%BA%E4%BE%8B%E4%BB%A3%E7%A0%81-5)

js

```
const display = utools.getDisplayNearestPoint({ x: 100, y: 100 });
console.log(display);
```

## `utools.getDisplayMatching(rect)` [​](https://www.u-tools.cn/docs/developer/utools-api/screen.html\#utools-getdisplaymatching-rect)

获取矩形所在的显示器

### 类型定义 [​](https://www.u-tools.cn/docs/developer/utools-api/screen.html\#%E7%B1%BB%E5%9E%8B%E5%AE%9A%E4%B9%89-6)

ts

```
function getDisplayMatching(rect: { x: number; y: number; width: number; height: number; }): Display;
```

- `rect` 矩形对象

### 示例代码 [​](https://www.u-tools.cn/docs/developer/utools-api/screen.html\#%E7%A4%BA%E4%BE%8B%E4%BB%A3%E7%A0%81-6)

js

```
const display = utools.getDisplayMatching({
  x: 100,
  y: 100,
  width: 200,
  height: 200,
});
console.log(display);
```

## `utools.screenToDipPoint(point)` [​](https://www.u-tools.cn/docs/developer/utools-api/screen.html\#utools-screentodippoint-point)

屏幕物理坐标转 DIP 坐标

### 类型定义 [​](https://www.u-tools.cn/docs/developer/utools-api/screen.html\#%E7%B1%BB%E5%9E%8B%E5%AE%9A%E4%B9%89-7)

ts

```
function screenToDipPoint(point: { x: number; y: number }): { x: number; y: number; };
```

- `point` 包含 x 和 y 的位置对象

### 示例代码 [​](https://www.u-tools.cn/docs/developer/utools-api/screen.html\#%E7%A4%BA%E4%BE%8B%E4%BB%A3%E7%A0%81-7)

js

```
const dipPoint = utools.screenToDipPoint({ x: 200, y: 200 });
console.log(dipPoint);
```

## `utools.dipToScreenPoint(point)` [​](https://www.u-tools.cn/docs/developer/utools-api/screen.html\#utools-diptoscreenpoint-point)

屏幕 DIP 坐标转物理坐标

### 类型定义 [​](https://www.u-tools.cn/docs/developer/utools-api/screen.html\#%E7%B1%BB%E5%9E%8B%E5%AE%9A%E4%B9%89-8)

ts

```
function dipToScreenPoint(point: { x: number; y: number }): { x: number; y: number;};
```

- `point` 包含 x 和 y 的位置对象

### 示例代码 [​](https://www.u-tools.cn/docs/developer/utools-api/screen.html\#%E7%A4%BA%E4%BE%8B%E4%BB%A3%E7%A0%81-8)

js

```
const screenPoint = utools.dipToScreenPoint({ x: 200, y: 200 });
console.log(screenPoint);
```

## `utools.screenToDipRect(rect)` [​](https://www.u-tools.cn/docs/developer/utools-api/screen.html\#utools-screentodiprect-rect)

屏幕物理区域转 DIP 区域

### 类型定义 [​](https://www.u-tools.cn/docs/developer/utools-api/screen.html\#%E7%B1%BB%E5%9E%8B%E5%AE%9A%E4%B9%89-9)

ts

```
function screenToDipRect(rect: { x: number; y: number; width: number; height: number; }): { x: number; y: number; width: number; height: number; };
```

- `rect` 矩形对象

### 示例代码 [​](https://www.u-tools.cn/docs/developer/utools-api/screen.html\#%E7%A4%BA%E4%BE%8B%E4%BB%A3%E7%A0%81-9)

js

```
const dipRect = utools.screenToDipRect({ x: 0, y: 0, width: 200, height: 200 });
console.log(dipRect);
```

## `utools.dipToScreenRect(rect)` [​](https://www.u-tools.cn/docs/developer/utools-api/screen.html\#utools-diptoscreenrect-rect)

DIP 区域转屏幕物理区域

### 类型定义 [​](https://www.u-tools.cn/docs/developer/utools-api/screen.html\#%E7%B1%BB%E5%9E%8B%E5%AE%9A%E4%B9%89-10)

ts

```
function dipToScreenRect(rect: { x: number; y: number; width: number; height: number; }): { x: number; y: number; width: number; height: number; };
```

- `rect` 矩形对象

### 示例代码 [​](https://www.u-tools.cn/docs/developer/utools-api/screen.html\#%E7%A4%BA%E4%BE%8B%E4%BB%A3%E7%A0%81-10)

js

```
const rect = utools.dipToScreenRect({ x: 0, y: 0, width: 200, height: 200 });
console.log(rect);
```

## `utools.desktopCaptureSources(options)` [​](https://www.u-tools.cn/docs/developer/utools-api/screen.html\#utools-desktopcapturesources-options)

获取录屏源，用它来录屏或者截取屏幕

### 类型定义 [​](https://www.u-tools.cn/docs/developer/utools-api/screen.html\#%E7%B1%BB%E5%9E%8B%E5%AE%9A%E4%B9%89-11)

ts

```
function desktopCaptureSources(options: { types: string[], thumbnailSize?: { width: number, height: number  }, fetchWindowIcons: boolean }): Promise<DesktopCaptureSource[]>;
```

- `options` 获取的选项：获取类型、返回的图片尺寸

### 示例代码 [​](https://www.u-tools.cn/docs/developer/utools-api/screen.html\#%E7%A4%BA%E4%BE%8B%E4%BB%A3%E7%A0%81-11)

webm 录屏

js

```
async function screenRecording() {
  const ousrces = await utools.desktopCaptureSources({
    types: ["window", "screen"],
  });
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: "desktop",
        chromeMediaSourceId: ousrces[0].id,
        minWidth: 1280,
        maxWidth: 1280,
        minHeight: 720,
        maxHeight: 720,
      },
    },
  });
  const video = document.querySelector("video");
  video.srcObject = stream;
  video.onloadedmetadata = (e) => video.play();
}
```

屏幕截图（截取整个屏幕）

js

```
async function captureScreen() {
  const sources = await utools.desktopCaptureSources({ types: ['screen'] });
  // 获取第一个屏幕（通常是主屏）
  const screenSource = sources[0];

  // 使用 MediaStream API 获取视频流
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: screenSource.id,
      }
    }
  });

  // 创建一个 <video> 元素播放这个流
  const video = document.createElement('video');
  video.srcObject = stream;
  await video.play();

  // 等待视频加载完毕
  await new Promise(resolve => video.onplaying = resolve);

  // 创建 canvas 并绘制当前帧
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // 将截图转为 base64
  const imageData = canvas.toDataURL('image/png');

  // 停止视频流释放资源
  stream.getTracks().forEach(track => track.stop());

  console.log('截图完成:', imageData);
  return imageData;
}
```