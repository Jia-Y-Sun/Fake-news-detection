# Fake News Detection（多模型虚假新闻检测集成系统）

AI 赋能背景下多模型虚假新闻检测集成系统 —— 信安赛参赛作品。

## 目录结构

```
├── MultiMode-NewsDetection/   浏览器插件（popup / 悬浮窗 floater / content 注入）
│   ├── api.py                 后端 API（多模型集成检测）
│   ├── SEUclass.py            检测模型集成
│   ├── popup.html/js          插件弹窗与检测交互
│   ├── floater.html/css/js    网页悬浮窗（检测触发显示）
│   ├── content.js             页面内容注入
│   ├── manifest.json          插件清单
│   └── run.bat                本地启动入口
├── 源代码/                     作品源代码（content / floater / manifest / popup）
├── 使用图/                     使用截图（注册/登录/模型选择/检测结果等）
├── 演示视频/                   演示视频（mp4）
├── AI赋能背景下多模型虚假新闻检测集成系统作品报告.doc   作品报告
└── 附件7.作品原创性声明.docx
```

## 说明

- 系统形态：浏览器插件（前端） + Python 后端 API，多模型集成完成新闻真实性检测；
- 详细设计与实验数据见作品报告（doc）。
