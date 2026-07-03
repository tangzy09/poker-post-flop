# Poker Post-Flop iOS —— Codemagic 云端构建 + TestFlight

流程照搬 `japansese-study/mando-IOS-CODEMAGIC.md`(你已跑通过 Mando/Kototabi)。
**账号级资产全部复用,不用重做**:

| 已有(跳过) | 出处 |
|---|---|
| Apple Developer 账号($99/年) | japanese-study 时已付 |
| App Store Connect API Key(.p8,App Manager) | 账号级,整个账号共用一条 |
| Codemagic 账号 + GitHub 授权 + `ASC API Key` 集成 | japanese-study 时已配 |
| 签名私钥 CERTIFICATE_PRIVATE_KEY(`ios_signing` 组) | 同一把,自动签名复用 |

## 本仓库要做的增量(约 15 分钟)

### ① Apple 开发者门户:注册 App ID
https://developer.apple.com/account → Identifiers → **+** → App IDs → App
- Description:`Poker Post-Flop`;Bundle ID **Explicit**:**`com.pokerpostflop.trainer`**
- Capabilities:先不勾(将来接 IAP 时回来勾 **In-App Purchase**)→ Register

### ② App Store Connect:创建 app 记录
https://appstoreconnect.apple.com → 我的 App → **+** 新建 App
- 平台 iOS;名称 `Poker Post-Flop`(可后改);主要语言按主受众选
- 套装 ID 选 `com.pokerpostflop.trainer`;SKU 如 `postflop-ios`
- 创建后在「App 信息」页记下**数字 Apple ID**(如 `6480123456`)

### ③ Codemagic:加仓库
codemagic.io → **Add application** → 选 `tangzy09/poker-post-flop` → 识别到 `codemagic.yaml`
- 在本 app 的 **Environment variables** 里把 `ios_signing` 组挂上(CERTIFICATE_PRIVATE_KEY 已在账号里)
- `ASC API Key` 集成已存在,yaml 里名字已对上,无需再动

### ④ 回填数字 App ID
`codemagic.yaml` 里 `APP_STORE_APP_ID: "REPLACE_WITH_POSTFLOP_NUMERIC_APP_ID"` 换成第②步的数字。
没填也能跑(构建号从 1 起),填了才自动取 TestFlight 最新号 +1。

### 🚀 触发构建
Codemagic → Start new build → main + **Poker Post-Flop iOS → TestFlight**。
云端:npm ci → **npm test 门禁** → build:www → cap add ios → 图标/启动屏(毡绿 #0c2a22)→ 自动签名 → IPA → TestFlight。约 10–20 分钟,邮件通知。
首个构建在 ASC/TestFlight 处理完后答一次出口合规(yaml 已设 non-exempt=false,直接过)。

## 与 japanese-study 的差异 / 注意

- **RevenueCat 不拆**:那边 v8 pod `SubscriptionPeriod` 与 iOS18 SDK 撞名被迫云端 uninstall;本仓库 v13.2.x 已修,**IAP 随包构建**。TestFlight 阶段 RevenueCat key 还是 `appl_REPLACE_ME` → `Pay.init()` 报 warn 后空跑,不影响使用;真收费时:App ID 勾 In-App Purchase → ASC 建订阅商品(`pro_monthly`/`pro_yearly`)→ RevenueCat 加 iOS app 拿 `appl_` key 填进 `js/purchases.js`。
- **iOS 跨商店不互通**:Android 买的订阅 iPhone 不解锁(无账号系统);两站捆绑(同 entitlement `pro`)在 App Store 内部正常。
- `ios/` 在 .gitignore 里,永远云端现场生成;本地 Windows 不用也不能碰。
- 上架正式版(非 TestFlight)时:隐私政策 URL、隐私营养标签、截图、分级;yaml 加 `submit_to_app_store`。本 app 有 SRS/每日训练/计算讲解,非纯套壳,通常可过审。
- 姐妹站 pokerPreFlop 同法炮制:它已装 `@capacitor/ios`,复制本 yaml 改 `BUNDLE_ID: com.pokerpreflop.trainer` + 新 app 记录即可。
