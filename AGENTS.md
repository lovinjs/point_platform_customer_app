# point_platform_customer_app 开发说明

本仓库是积分平台消费者端，远端为 lovinjs/point_platform_customer_app。主要面向微信公众号 H5，并保留微信小程序构建。本文路径均相对本仓库，优先用中文沟通。

## 协作方式

用户选择“云端阅读和修改代码，本地运行与验收”：云端实现代码、类型检查和构建；页面、手机微信授权和真实平台交互默认在用户本地或预发布环境验证。不要为普通页面修改默认部署新站点、配置云端业务数据库或访问服务器账本。

- 开始前检查分支、提交和工作区，保留用户已有修改。本地与云端通过 Git 同步，未推送的本地文件不自动可见；不强行 reset、clean 或覆盖内容。
- 本次交接由用户自行提交推送，后续 Git 和部署操作按用户任务授权执行。
- 修改集中在相关页面与公共层，沿用现有设计、请求和平台适配，不顺带升级 UniApp、Wot UI、Vue 或重写整个应用。
- 完成时报告实际检查结果、环境/接口影响和本地验收步骤；没有运行的检查明确列出。历史部署文档中的通过记录不能当作本次验证。
- 云端与本地反馈附分支、提交、平台、复现步骤和关键错误，避免仅凭截图猜测接口或账户状态。

## 技术与目录

UniApp、Vue 3、TypeScript、Vite、Wot UI。使用 npm 和 package-lock.json，通过 npm ci 复现依赖，不改用 pnpm/yarn。@dcloudio 各包保持现有匹配版本；若任务需要升级，整体核对跨平台兼容。

- src/pages/：首页、门店、登录回调、绑定手机号、消费密码/找回、待确认消费、账单和协议。
- src/api/：统一 http、错误处理及 auth/customer/consumption/transactions/stores 接口。
- src/config/app.ts：环境配置及 API URL；src/config/theme.ts：非 CSS 场景的颜色常量。
- src/platform/：H5/小程序认证、回调和会话存储适配。
- src/stores/auth.ts：客户登录与账户状态。
- src/styles/theme.scss、src/uni.scss、src/static/tabbar/：主题和导航资源。
- src/pages.json：页面与原生导航配置。
- docs/theme-system.md、docs/h5-staging-deployment.md：主题约定和预发布记录。

## 运行与检查

以下命令在仓库根目录运行：

~~~bash
npm ci
npm run dev:h5
npm run type-check
npm run build:h5
npm run build:mp-weixin
npm run check
npm run build:h5:staging
~~~

npm run check 依次执行类型检查、普通 H5 和微信小程序构建。涉及页面、共享请求或平台适配时验证受影响平台；仅 staging 配置变更也应确认普通生产配置不被影响。构建成功不等于手机微信授权、短信或完整消费流程已验收。

修改 src/pages.json 后停止并重启 H5 开发进程，不能仅依靠组件热更新刷新路由表。

H5 浏览器请求 /api，由 Vite 默认代理到 http://127.0.0.1:8888。需要其他开发地址时使用未跟踪的 .env.development.local 中的 VITE_DEV_PROXY_TARGET。小程序不能使用浏览器代理，需可访问的 HTTPS API，并核对微信平台域名配置。

## 账户、消费与请求约束

- 所有客户 API 经现有统一请求层和平台适配调用，路径通常为 /api/v1/customer，H5 认证为 /api/v1/h5/auth。不要重复添加 /api 前缀。
- 微信登录新建账户后可能未绑定手机号；绑定前仅开放登录和账户查看，按后端账户状态控制可用入口。
- 消费密码在客户自己的设备输入，只提交后端校验，不能本地保存、写日志、填入 URL 或交给后台员工。
- 员工创建待确认订单后，客户核对门店、金额和积分并确认，后端才扣款。待确认页仅在可见时轮询，隐藏、离开或成功后停止，避免重复轮询及重复提交。
- 余额、充值退款资格和消费成功状态以服务端为准，不在前端自行计算或修改资金账本；金额接口单位为分、积分为整数。
- 账单分页、刷新及确认后的余额更新保持一致。原充值整笔退款后显示退款流水和订单状态，不提供普通消费退款入口。
- 客户端不展示内部收款参考号、后台操作员、幂等键等无关后台字段，不把客户令牌或密码放入页面反馈。
- 1 元 = 1 积分，积分不过期。微信支付、赠送积分及消费二维码不属于当前 V1，不因预留平台代码就宣称已支持。
- 本地验证码由后端 LOG 模式输出到后端开发日志，前端接口不返回明文验证码；真实微信与短信调用按具体任务范围执行。

## 跨平台与视觉约定

- 沿用 src/platform/ 分离 H5 和小程序差异；新增浏览器 API 前考虑目标平台，不在共用代码直接假设 window、document 可用。
- 主题为“低空科技蓝”：样式优先用 --app-color-*、--app-gradient-*、--app-shadow-*，组件属性从 themeColors 读取。
- 成功绿用于成功业务状态，风险红用于失败/扣减，避免把状态色用于普通品牌装饰。
- 品牌调整联动检查 theme.scss、theme.ts、uni.scss、pages.json 和 tabbar 图标。
- 本地页面验收覆盖窄屏、安全区、底部导航遮挡、长文本、空态、加载/错误状态；涉及登录和消费时在手机微信内验收。

## 环境与发布

- development、staging、production 分开配置。VITE_ 值可能写入浏览器产物，不能包含 JWT 密钥、微信 AppSecret、短信 AccessKey、数据库密码。
- .env.staging 仅含可公开配置；.env.*.local、真实凭证、dist、ZIP、node_modules 不提交 Git。
- npm run build:h5:staging 使用 .env.staging，输出 dist/build/h5-staging，不覆盖普通 H5；普通 H5 输出 dist/build/h5，小程序输出 dist/build/mp-weixin。
- 预发布提示、备案链接和微信授权开关按各环境处理，不把 staging 配置扩散到普通生产或小程序。
- 候选构建、本地页面验证、用户上传和手机验收分别记录。协议与隐私文案目前是开发草案，不能宣称已完成正式运营审核。

## 跨仓库接续

后端为 lovinjs/point_platform，管理端为 lovinjs/point_platform_admin。其他仓库可用时先读后端 docs/cloud-development-handoff.md 和相关接口文档；不要假定它们一定在同级目录。

当前有消费者 H5 预发布部署记录，完整自然月结算、正式服务号和正式上线仍需独立验收，状态以最新有日期的文档及用户反馈为准。改接口契约时同时核对后端响应、前端类型和管理端影响，并列出跨仓库待办。
