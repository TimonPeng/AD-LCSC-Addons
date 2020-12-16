# AD LCSC Addons

[English](./README.md) | 中文

[![Preview](https://img.youtube.com/vi/Rm9fCbNcvS4/0.jpg)](https://www.youtube.com/watch?v=Rm9fCbNcvS4)

## 编译安装包

可自行使用 Inno Setup 编译。

## 注意事项与免责声明

1. 生成的 Altium Design 文件格式无法实现 100% 完整，在导入原理图及封装库后请务必进行仔细检查，作者不保证没有任何错误产生！
2. 作者不承担因为库错误和格式错误导致的任何损失！如不同意请不要使用！
3. 暂不支持 Altium Designer 19 版本，导出的文件需要在 Altium Designer 18 版及以下打开，**推荐 Altium Designer 17**。

## 优化点

- Altium Design 版本检查
- ~~自动设置搜索结果的最大宽度~~（已完成）
- ~~输入后回车搜索~~（已完成）
- ~~滚动时会卡顿~~（已将请求改成异步进行修复）
- 滚动时会选择其他单元格，可能会导致图片对不上（建议用鼠标拉动滚动条）
- 多组件处理
- 3D 模型显示
- 无需打开文件，直接在图中放置元件
- 本地完成文件格式转换（现由远程服务器处理）
- 安装和卸载时适配其他插件的配置文件

## 技术壁垒

Altium Design 插件界面需要使用 Delphi 的 dfm 布局文件，但只支持非常少的组件，因此在实现程序 UI 时受到了很大的限制，导致诸多功能不易实现。

然而另一个好处是，Altium Design 插件支持各个语言互相调用，就很棒。

### TWebBrowser

最初计划使用 TWebBrowser 作为容器，实现 JSBridge 接口供内部网页调用，然而它属于 FMX，而 Altium Design 只支持了部分 VCL 组件。

具体实现可以参考：

https://delphidabbler.com/articles/article-22

https://www.ideasawakened.com/post/delphi-javascript-execution-ditch-twebbrowser-for-chakracore

### 图片显示

最初计划将 HTTP 请求到的图片字节流转换为 HEX String，但实现中发现动态赋值 Picture.Data 无法实现，无奈只能先下载文件，再通过 Picture.LoadFromFile 显示图片。

API 文档：

http://docwiki.embarcadero.com/Libraries/Sydney/en/Vcl.ExtCtrls.TImage

~~然而使用此方法存在的问题是：上游图片大小格式不统一，需要额外进行缩放，暂未实现。~~（已通过 Proportional 参数实现）

## 致谢

- 立创商城
- Altium Library Loader

## 参考

- http://caidiot.blogspot.com/
- https://blog.mbedded.ninja/electronics/general/altium/altium-scripting-and-using-the-api/
- https://techdocs.altium.com/display/SCRT/Altium+Designer+API
- https://techdocs.altium.com/display/SCRT/Script+Examples+Reference
- https://techdocs.altium.com/display/SCRT/JScript((Statements))
- https://docs.microsoft.com/en-us/previous-versions/hbxc2t98(v=vs.71)
- http://doc.51windows.net/jscript5/?url=/jscript5/dir.htm
- https://www.altium.com/altium-dxp/overview
