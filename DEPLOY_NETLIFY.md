# Netlify 发布版说明

这版支持 Netlify：

- 前台：静态页面
- 后台：`/sjmj-admin-portal`
- API：Netlify Functions
- 数据：Netlify Blobs

## 重要

不要只用 Netlify Drop 上传纯静态文件夹。后台登录需要 Functions 和依赖安装，推荐用 GitHub 连接 Netlify 部署，或使用 Netlify CLI 部署。

## Netlify 配置

项目已包含：

```text
netlify.toml
netlify/functions/api.mjs
package.json
```

Netlify 会自动识别：

```text
Publish directory: .
Functions directory: netlify/functions
```

## 后台地址

```text
https://你的域名/sjmj-admin-portal
```

默认超级管理员：

```text
账号：admin
密码：SJMJ@2026
```

上线后请立刻修改默认密码。

## 数据保存

商品、订单、用户、支付配置、物流配置、内容任务会存到 Netlify Blobs。

## 如果登录失败

检查：

1. Netlify 是否执行了 build/install，而不是只上传静态文件。
2. `Functions` 页面是否能看到 `api` function。
3. 浏览器访问 `https://你的域名/api/products` 是否返回商品 JSON。
4. 后台登录接口 `https://你的域名/api/auth/login` 是否存在。
