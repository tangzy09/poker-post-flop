# 上架状态 & 交接清单

> 双端(App Store + Google Play)上架进度与复用信息。**本文件在 git 里,绝不写任何密钥/密码/token 本体——只记位置。**
> 全链路实操见全局 skill:`appstore-listing`(iOS 商店页/提交)、`appstore-connect-iap-api`(订阅+RevenceCat)、`googleplay-publish`(Play)、`capacitor-ios-codemagic`(iOS 出包)。

最后更新:2026-07-09。

## 一句话状态

| | App Store (iOS) | Google Play (Android) |
|---|---|---|
| 计费/订阅 | ✅ RevenueCat + 月/年订阅 | ✅ 同 RevenueCat + Play 订阅 |
| 安装包 | 🔄 build 3 出包中(含付费墙修复) | ⚠ AAB versionCode 1(**旧包未锁内容,需重出**) |
| 图标/截图/图形 | ✅ | ✅ icon+feature+4截图 |
| 39 语言商店文案 | ✅(已修 subtitle 价格词+补 EULA) | ✅ |
| App content/隐私声明 | ✅ (UI 已填) | ✅ (UI 已填) |
| **发布状态** | **首审被拒 4 项,已全修,待挂 build 3 重提** | **已发布内测 (internal, completed)** |

## 2026-07-09 iOS 首审被拒(1.0 build 2)与修复

4 项拒审原因,全部已修(ASC 侧 API 实查落地,代码侧 commit `b3f9b61`):

1. **模拟赌博×个人账号(苹果 2026-07 新政)**:个人账号禁发 simulated gambling app → 分级 `gamblingSimulated` 改 **NONE**(本 app 无真钱/无筹码/无下注,是教学工具,合规)。
2. **2.3.7 subtitle 价格词**:12 个 locale 副标题含 free/gratis/gratuit 等 → 全部改中性关键词。**教训:名称/副标题永远不能提价格,「免费」只能写进描述。**
3. **3.1.2(c) 缺 EULA**:39 locale 描述尾部补标准 Apple EULA + 隐私政策链接;app 内 paywall 也加了两个可点链接。
4. **2.1(b) 审核员找不到内购(根因=真 bug)**:原 30 课全 free、`showPaywall` 无调用点,原生端付费墙不可达 → **C13–C30 改 Pro 锁**(切分线=两套内容系统边界),锁定卡可点弹付费墙;web 不受影响(`isProUnlocked()` web 恒 true)。审核备注已写明 IAP 入口路径。

重提流程:build 3 VALID → 挂 1.0 → ASC 回复审核信(说明 IAP 路径+非赌博声明,3.1.2(c) 那条苹果要求附录屏)→ resubmit。

## 标识符

- **Bundle/包名(两端一致)**:`com.pokerpostflop.trainer`
- **App Store 数字 App ID**:`6787552890`(PostFlop GTO Poker Trainer)
- **iOS Bundle ID 资源 id**:`47W29QHW79`
- **ASC appInfo id**:`8c9028c4-f87f-494a-b18d-3469987f6464`
- **ASC 版本(1.0)id**:`8eacac29-de06-44b1-80f3-854f8fb3a1f8`
- **ASC 送审 reviewSubmission**:`e353b290-0715-4a10-804c-09522d394119`
- **Codemagic app id**:`6a49d9baeee47db7103da8a8`,workflow `postflop-testflight`
- **RevenueCat**:project `projc5134d3a`("Postflop Coach"),entitlement `entl1a48452563`(lookup `pro`);iOS app `appac6e113a8f`、Android app `appdd2bf595dd`。公开 key 已在 `js/purchases.js`(可进 git)。
- **产品 id**:`postflop_pro_yearly` / `postflop_pro_monthly`(账号级唯一,带前缀)

## 凭据位置(本机,均不进 git)

- ASC API key(.p8, ES256):`C:\Users\tangz\Documents\credentials\AuthKey_6TLMXCG564.p8`(Key ID `6TLMXCG564`,Issuer `f723569b-c38d-4acf-96da-fde9db2b0b63`)——账号级,所有 app 复用
- IAP key(给 RevenueCat):`C:\Users\tangz\Documents\credentials\SubscriptionKey_4N977536WH.p8`
- Play 服务账号 JSON:`C:\Users\tangz\Documents\credentials\play-sa.json`(`revenuecat@triple-backbone-469007-i5.iam.gserviceaccount.com`,有发布权限)
- **Android 上传 keystore**:`C:\Users\tangz\Documents\credentials\postflop-upload.jks`,密码/别名见同目录 `postflop-keystore-pw.txt`(alias `postflop`)
- iOS 签名私钥:锁在 Codemagic(`ios_signing` 组 `CERTIFICATE_PRIVATE_KEY`)+ 本机 `C:\Users\tangz\Documents\credentials\ios_signing_key.pem`(供复用避苹果 2 证书上限)
- Codemagic API token(账号级,2026-07-09 起留存):`C:\Users\tangz\Documents\credentials\codemagic-api-token.txt`;RevenueCat sk_ 仍不留存,需用时后台生成

## 本地出 Android AAB(可重复)

```
# 环境:JBR java + 默认 SDK 路径;android/local.properties 用正斜杠 sdk.dir
export JAVA_HOME="/c/Program Files/Android/Android Studio/jbr"
export ANDROID_HOME="/c/Users/tangz/AppData/Local/Android/Sdk"
npm run build:www && npx cap sync android
npx @capacitor/assets generate --android --iconBackgroundColor '#0c2a22' ...   # 图标变更时
cd android && ./gradlew bundleRelease \
  -Pandroid.injected.signing.store.file=C:/Users/tangz/Documents/credentials/postflop-upload.jks \
  -Pandroid.injected.signing.store.password=<见 pw.txt> -Pandroid.injected.signing.key.alias=postflop \
  -Pandroid.injected.signing.key.password=<见 pw.txt> -Pandroid.injected.version.code=N
# 产物 android/app/build/outputs/bundle/release/app-release.aab(下次 versionCode 要 +1)
```
出 iOS 包:`git push` 触发 Codemagic(见 `docs/IOS-CODEMAGIC.md`)。

## 待办 / 下一步

- **iOS**:build 3 出包中(Codemagic `6a500e3e`)→ 挂版本 → 回复审核信+重提(见上节)。
- **Android 重出 AAB**:内测轨道的 versionCode 1 是未锁内容的旧包,iOS 过审后用新代码重出(versionCode 2)。
- **Android 内测**:Play Console → 内部测试 → 加测试员邮箱 + 发 opt-in 链接,测试员才能装。
- **Android 转生产**:新个人开发者账号首次生产发布需**封闭测试 12–20 人 × 14 天**,跑完才开生产轨道。
- **ASO**:27 个 locale 的关键词标了「需母语复核」(zh-Hant ja ko de fr fr-CA es-ES es-MX it pt-BR pt-PT nl uk pl cs sk hu hr ro el fi ca ar he th vi hi),上线后按数据让母语者微调。
- **年龄分级**:两端均 17+/模拟赌博(扑克内容,已声明)。

## 生成脚本

- iOS 截图:`tools/gen-ios-shots.js`(headless Chrome/Edge,en/zh × iPhone/iPad)
- Play 截图/图形:同法 Chrome headless(手机 540×960@2=1080×1920;feature graphic 渲染 1024×500 HTML;icon 512 渲染 `assets/icon-source.svg`)
- 图标源:`assets/icon-source.svg`(E4 动作三色范围表,可重生成)
