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

- **RevenueCat 不拆**:那边 v8 pod `SubscriptionPeriod` 与 iOS18 SDK 撞名被迫云端 uninstall;本仓库 v13.2.x 已修,**IAP 随包构建**。**RevenueCat `appl_` 真 key 已填进 `js/purchases.js`**(`appl_ABKmuZTWZgBaJMKeDPoFklGzQqK`),订阅商品(`postflop_pro_yearly`/`postflop_pro_monthly`)ASC 已建、App ID 已勾 In-App Purchase → TestFlight 起就能走真购买(沙盒)。
- **iOS 跨商店不互通**:Android 买的订阅 iPhone 不解锁(无账号系统);两站捆绑(同 entitlement `pro`)在 App Store 内部正常。
- `ios/` 在 .gitignore 里,永远云端现场生成;本地 Windows 不用也不能碰。
- 上架正式版(非 TestFlight)时:隐私政策 URL、隐私营养标签、截图、分级;yaml 加 `submit_to_app_store`。本 app 有 SRS/每日训练/计算讲解,非纯套壳,通常可过审。
- 姐妹站 pokerPreFlop 同法炮制:它已装 `@capacitor/ios`,复制本 yaml 改 `BUNDLE_ID: com.pokerpreflop.trainer` + 新 app 记录即可(**它已实战跑通,本 yaml 的两处坑就是从它那边同步来的**)。

## preflop 实战验证同步的两个坑(已内建进 yaml)

preflop 那边真跑通了云端构建(拿到数字 App ID、成功上 TestFlight),暴露两个 japanese-study 没遇到的坑,本 yaml 已内建修法,**你什么都不用做,列在此仅供理解**:

1. **`node: 22`(不是 20)** —— Cap8 CLI 硬性要求 Node ≥22,`node:20` 会在 `cap add ios` 直接 fatal(`Capacitor CLI requires NodeJS >=22`)。
2. **build-ipa 用 `--project` 而非 `--workspace`** —— Cap8 默认 SPM、RevenueCat v13 也走 SPM,现场生成的 `ios/` 没有 `.xcworkspace`(那是 CocoaPods 才有的),硬写 `--workspace` 会 `Path does not exist`。yaml 用 `if [ -d ...xcworkspace ]` 检测,两种情况都覆盖。

> **完整 iOS 踩坑清单(11 条,含签名/证书/SDK 版本/刘海安全区)见 `capacitor-ios-codemagic` skill** —— 那是所有 Capacitor→iOS 项目的通用知识库,本文档只记本仓库特有部分。
