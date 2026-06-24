# 百度搜索广告关键词拓展工具

一个本地可运行的网页版本，包含页面、交互和 mock API。

## 运行

```bash
node server.js
```

打开：

```text
http://127.0.0.1:4175
```

## 部署

推荐使用 Render / Railway 这类 Node.js 托管平台。

启动命令：

```bash
npm start
```

环境变量：

```text
HOST=0.0.0.0
```

平台会自动提供 `PORT`，不需要手动填写。

## 已实现

- 多行种子关键词输入
- 已有关键词去重
- 8 个独立拓词接口
- 聚合拓词接口 `/api/keywords/expand`
- 结果筛选、搜索、排序
- 删除选中、清空结果
- 本地缓存
- Excel 兼容文档导出

## 后续替换真实 API

真实数据源可以从 `server.js` 中的 `generateForChannel` 和 `channelConfig` 开始替换。保留输出字段结构即可让前端无感切换。
