# 平台积分消费者端

消费者端使用 UniApp、Vue 3、TypeScript、Vite 和 Wot UI，同一工程面向微信公众号 H5，并预留微信小程序构建。

## 常用命令

```bash
npm run dev:h5
npm run type-check
npm run build:h5
npm run build:mp-weixin
npm run check
```

`npm run check` 会依次执行严格类型检查、H5生产构建和微信小程序构建。

修改 `pages.json` 中的页面列表后，需要停止并重新运行 H5；已有开发进程只做样式和组件热更新，不会重建完整路由表。

## 本地联调

开发环境默认让浏览器请求当前H5地址下的 `/api`，Vite再代理到 `http://127.0.0.1:8888`。如后端地址不同，在不提交Git的 `.env.development.local` 中覆盖：

```text
VITE_DEV_PROXY_TARGET=http://127.0.0.1:8888
```

小程序没有浏览器开发代理，构建前必须通过环境配置提供可访问的HTTPS API地址。

## 目录约定

```text
src/
├── api/        统一请求层与领域接口
├── config/     应用环境配置
├── pages/      页面
├── platform/   H5和小程序平台适配
├── stores/     跨页面状态
├── styles/     全局样式及主题
├── types/      API与领域类型
└── utils/      无业务状态的通用工具
```

微信网页授权联调时，在不提交Git的 `.env.development.local` 中配置：

```text
VITE_WECHAT_AUTH_ENABLED=true
```

微信密钥只配置在Spring Boot后端环境变量中，不能放入本项目。当前首次微信授权会创建一个尚未绑定手机号的客户账户；用户可以从首页进入手机号绑定页，绑定前只开放登录和账户查看。本地验证码由后端 `PLATFORM_PHONE_VERIFICATION_MODE=LOG` 控制并输出到后端日志，前端不会收到明文验证码。
