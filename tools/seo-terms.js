'use strict';
/*
 * seo-terms.js — 术语/概念长尾落地页数据(pillar-spoke 的 spoke)。
 * 每条厚内容:short(40-60 词直接答案)+ body(厚解释)+ example(真实算例)+ 2 FAQ,双语。
 * 诚实红线:算例数学正确、不编造频率/评分;每页链回相关课程(course)做深度。
 * ⚠ slug 发布后永不改(外链/收录会断)。改数据后重跑 node tools/gen-seo-pages.js。
 * 结构:[ {slug, course, term:{en,zh}, short:{en,zh}, body:{en,zh}(可含<b>/<br>), example:{en,zh}, faq:[{q,a}×2]} ]
 */
module.exports = [
  {
    slug: 'pot-odds', course: 'c2',
    term: { en: 'Pot Odds', zh: '底池赔率' },
    short: {
      en: 'Pot odds are the price you’re getting to call: the ratio of the total pot to the amount you must call. They tell you the minimum equity your hand needs to make calling break even.',
      zh: '底池赔率是你跟注时得到的价格:总底池与你要跟注额的比值。它告诉你手牌至少需要多少胜率,跟注才不亏。' },
    body: {
      en: 'To use pot odds, convert them to the equity you need with the formula <b>call ÷ (pot after your call)</b>. If that break-even percentage is below your hand’s equity, calling is profitable; if it’s above, you should fold (barring implied odds).<br><br>Bigger bets lay worse pot odds and demand more equity to continue, which is exactly why aggressors size up to deny draws a correct call. Pot odds are the foundation every other postflop defense concept — MDF, bluff-catching, drawing — is built on.',
      zh: '用底池赔率时,用公式 <b>跟注额 ÷(跟注后的底池)</b> 换算成所需胜率。若这个盈亏平衡百分比低于你手牌的胜率,跟注就盈利;高于则应弃牌(除非有隐含赔率)。<br><br>越大的下注给出越差的底池赔率、要求更多胜率才能继续,这正是进攻方加大尺寸来否定听牌正确跟注的原因。底池赔率是其它所有翻后防守概念——MDF、抓诈、听牌——的地基。' },
    example: {
      en: 'The pot is 80 and villain bets 40, making it 120. You must call 40 to win 120, so you’re getting 3:1 and need 40 ÷ (120 + 40) = <b>25% equity</b> to break even. A flush draw with ~19% equity is a fold on pot odds alone; a flush + overcard draw at ~30% is a profitable call.',
      zh: '底池 80,对手下注 40,变成 120。你要跟 40 去赢 120,即 3:1,需要 40 ÷(120+40)= <b>25% 胜率</b>才不亏。约 19% 胜率的同花听牌单看底池赔率是弃牌;约 30% 的同花+高牌听牌则是盈利跟注。' },
    faq: [
      { q: { en: 'How do you calculate pot odds quickly?', zh: '怎么快速算底池赔率?' },
        a: { en: 'Divide the call by the final pot (pot + all bets + your call). That percentage is the equity you need. Calling 40 into a final pot of 160 needs 25%.',
             zh: '用跟注额除以最终底池(底池+所有下注+你的跟注)。那个百分比就是所需胜率。跟 40 进最终 160 的底池需要 25%。' } },
      { q: { en: 'What’s the difference between pot odds and equity?', zh: '底池赔率和胜率有什么区别?' },
        a: { en: 'Pot odds are the price of a call; equity is your hand’s share of the pot at showdown. You call when your equity is at least the break-even percentage the pot odds require.',
             zh: '底池赔率是跟注的价格;胜率是你手牌在摊牌时占底池的份额。当你的胜率不低于底池赔率要求的盈亏平衡百分比时就跟注。' } },
    ],
  },
  {
    slug: 'mdf', course: 'c2',
    term: { en: 'MDF (Minimum Defense Frequency)', zh: 'MDF(最小防守频率)' },
    short: {
      en: 'MDF is the minimum share of your range you must continue with against a bet so the bettor can’t profitably bluff any two cards. It equals pot ÷ (pot + bet).',
      zh: 'MDF 是面对下注时你必须继续的最小范围比例,用来让下注方无法用任意两张牌盈利地诈唬。等于 底池 ÷(底池 + 下注)。' },
    body: {
      en: 'MDF answers a different question than pot odds. Pot odds tell one hand whether to call; MDF tells your whole <b>range</b> how often it must defend to stay unexploitable. Defend less than the MDF and the opponent can bluff any two cards for an automatic profit.<br><br>Because MDF depends only on bet size, bigger bets lower it — a defender owes less against a large bet. In practice you meet the MDF with your best bluff-catchers and give up your worst hands, and against players who under-bluff you can correctly defend below the MDF (an exploitative over-fold).',
      zh: 'MDF 回答的问题和底池赔率不同。底池赔率告诉单一手牌是否跟注;MDF 告诉你整个<b>范围</b>必须多频繁防守才能保持不可被剥削。防守低于 MDF,对手就能用任意两张牌诈唬获得自动利润。<br><br>因为 MDF 只取决于下注尺寸,越大的注 MDF 越低——面对大注防守方需要防守得更少。实战中你用最好的抓诈牌满足 MDF、弃掉最差的牌;面对诈唬不足的对手,可以正确地防守到 MDF 以下(剥削性的过度弃牌)。' },
    example: {
      en: 'Villain bets 40 into an 80 pot (a half-pot bet). MDF = 80 ÷ (80 + 40) = <b>67%</b>, so you continue with roughly two-thirds of your range. Against a pot-sized bet MDF drops to 50%; against a 2x overbet it’s just 33%.',
      zh: '对手向 80 的底池下注 40(半池)。MDF = 80 ÷(80+40)= <b>67%</b>,即你继续大约三分之二的范围。面对底池大小的下注 MDF 降到 50%;面对 2 倍超池只有 33%。' },
    faq: [
      { q: { en: 'What is the MDF against a pot-sized bet?', zh: '面对底池大小的下注 MDF 是多少?' },
        a: { en: 'Exactly 50%. MDF = pot ÷ (pot + bet), and when the bet equals the pot that’s pot ÷ 2·pot = 50%.',
             zh: '正好 50%。MDF = 底池 ÷(底池+下注),当下注等于底池时是 底池 ÷ 2·底池 = 50%。' } },
      { q: { en: 'Should you always defend the full MDF?', zh: '一定要防守满 MDF 吗?' },
        a: { en: 'No. MDF is the unexploitable baseline. Against opponents who rarely bluff you should over-fold; against players who bluff too much you should over-call beyond the MDF.',
             zh: '不。MDF 是不可被剥削的基准。面对很少诈唬的对手应过度弃牌;面对诈唬过多的对手则应超过 MDF 多跟注。' } },
    ],
  },
  {
    slug: 'implied-odds', course: 'c2',
    term: { en: 'Implied Odds', zh: '隐含赔率' },
    short: {
      en: 'Implied odds are the extra money you expect to win on later streets when your draw completes. They let you call a bet that immediate pot odds alone don’t justify.',
      zh: '隐含赔率是当你的听牌成牌后,预计在后续街道能额外赢到的钱。它让你能跟一个仅凭当前底池赔率不划算的下注。' },
    body: {
      en: 'A hand can be a fold on raw pot odds but a call once you add the payoffs you’ll collect when you hit. Deep stacks, well-disguised draws (like a low straight draw), and opponents who pay off big hands all raise your implied odds.<br><br>The mirror image is <b>reverse implied odds</b>: hands that win a small pot when ahead but lose a big one when behind — such as a weak top pair or a dominated draw. Spots decided by implied odds resist exact equations, so judge them by stack depth, board disguise, and how sticky your opponent is.',
      zh: '一手牌单看底池赔率可能是弃牌,但加上击中后能收到的回报就变成跟注。深筹码、隐蔽性好的听牌(如小顺子听牌)、以及会为大牌付钱的对手都会提高你的隐含赔率。<br><br>其镜像是<b>反向隐含赔率</b>:领先时赢小底池、落后时输大底池的牌——比如弱顶对或被压制的听牌。由隐含赔率定夺的局面难以精确用等式计算,应按筹码深度、牌面隐蔽性和对手粘性来判断。' },
    example: {
      en: 'You have a gutshot needing ~11% but the immediate pot odds require 20%. If stacks are deep and villain will stack off when you hit your straight, the extra ~2 big bets you expect to win can push the call into profit — that gap is implied odds.',
      zh: '你有个卡顺听牌约需 11% 胜率,但当前底池赔率要求 20%。若筹码深、对手在你成顺时会全下,你预计多赢的约 2 个大注就能把跟注推向盈利——这个差额就是隐含赔率。' },
    faq: [
      { q: { en: 'When are implied odds highest?', zh: '隐含赔率什么时候最高?' },
        a: { en: 'When stacks are deep, your draw is disguised, and your opponent tends to pay off big hands. Shallow stacks and obvious draws kill implied odds.',
             zh: '筹码深、听牌隐蔽、对手爱为大牌付钱时最高。浅筹码和明显的听牌会扼杀隐含赔率。' } },
      { q: { en: 'What are reverse implied odds?', zh: '什么是反向隐含赔率?' },
        a: { en: 'The risk of losing extra money when you make a hand that’s still second-best — like completing a low flush against a possible higher one. They argue for caution with dominated draws.',
             zh: '当你成的牌仍是第二好时会输掉额外的钱的风险——比如成了小同花却面对可能更大的同花。它提醒你对被压制的听牌要谨慎。' } },
    ],
  },
  {
    slug: 'range-advantage', course: 'c3',
    term: { en: 'Range Advantage', zh: '范围优势' },
    short: {
      en: 'Range advantage means your entire range of possible hands is stronger than your opponent’s on a given board. The player with range advantage can bet more often and at higher frequency.',
      zh: '范围优势是指在特定牌面上,你所有可能手牌组成的范围整体强于对手。拥有范围优势的一方可以更频繁、更高比例地下注。' },
    body: {
      en: 'Range advantage comes from the preflop action. On an ace-high or king-high board, the preflop raiser usually has more top pairs and overpairs than the caller, so they hold range advantage and can c-bet a wide range. On low, connected boards that hit the caller’s suited connectors, the advantage can flip.<br><br>Range advantage justifies <b>frequency</b> (how often you bet), while its cousin the <b>nut advantage</b> — holding more of the very strongest hands — justifies <b>sizing</b> (using big bets and overbets). Reading who owns the board is the first question on every flop.',
      zh: '范围优势来自翻前的行动。在 A 高或 K 高的牌面上,翻前加注者通常比跟注者有更多顶对和超对,因此拥有范围优势、可以用宽范围持续下注。在击中跟注方同花连张的低、连接牌面上,优势可能反转。<br><br>范围优势决定<b>频率</b>(你多常下注),而它的近亲<b>坚果优势</b>——拥有更多最强牌——决定<b>尺寸</b>(使用大注和超池)。判断谁占据牌面是每个翻牌的第一个问题。' },
    example: {
      en: 'On K-7-2 rainbow, a button raiser versus a big-blind caller holds a meaningful range advantage — about 53% to 47% equity — because far more Kx and overpairs live in the raiser’s range. That edge supports a high-frequency small c-bet.',
      zh: '在 K-7-2 彩虹面上,按钮加注者对大盲跟注者拥有实质范围优势——约 53% 对 47% 的胜率——因为加注者范围里有远多得多的 Kx 和超对。这个优势支持高频率的小额持续下注。' },
    faq: [
      { q: { en: 'How do you know who has range advantage?', zh: '怎么判断谁有范围优势?' },
        a: { en: 'Ask which player’s preflop range connects better with the board. High, disconnected boards favor the raiser; low, connected boards favor the caller.',
             zh: '问哪位玩家的翻前范围与牌面结合得更好。高、不连接的牌面偏向加注者;低、连接的牌面偏向跟注者。' } },
      { q: { en: 'Is range advantage the same as nut advantage?', zh: '范围优势和坚果优势一样吗?' },
        a: { en: 'No. Range advantage is overall equity and drives betting frequency; nut advantage is holding more of the top hands and drives big-bet and overbet sizing.',
             zh: '不一样。范围优势是整体胜率、决定下注频率;坚果优势是拥有更多顶端牌、决定大注和超池的尺寸。' } },
    ],
  },
  {
    slug: 'continuation-bet', course: 'c5',
    term: { en: 'Continuation Bet (C-bet)', zh: '持续下注(C-bet)' },
    short: {
      en: 'A continuation bet, or c-bet, is a bet made on the flop by the player who raised before the flop. It continues the preflop aggression and pressures the opponent with both value and bluffs.',
      zh: '持续下注(c-bet)是翻前加注的玩家在翻牌圈继续下注。它延续翻前的进攻,用价值牌和诈唬同时给对手施压。' },
    body: {
      en: 'The best c-betting strategy depends on the board and position. In position on dry boards you own the range advantage, so you can c-bet a wide range for a small size at high frequency, denying equity cheaply. On wet, connected boards you bet a tighter, more <b>polarized</b> range and size up.<br><br>Not every flop is a c-bet: boards that smash the caller’s range, or medium hands that prefer pot control, are checked. Getting c-bet frequency and sizing right is the single most common postflop decision in Hold’em.',
      zh: '最佳持续下注策略取决于牌面和位置。有位置、在干燥牌面上你占据范围优势,可以用宽范围、小尺寸、高频率持续下注,廉价否定对手胜率。在湿润、连接的牌面上则用更窄、更<b>极化</b>的范围并加大尺寸。<br><br>不是每个翻牌都该持续下注:击中跟注方范围的牌面、或偏好控池的中等牌都应过牌。把持续下注的频率和尺寸做对,是德州扑克里最常见的翻后决策。' },
    example: {
      en: 'As the button raiser on K-7-2 rainbow you can c-bet close to your whole range for about one-third pot: it’s cheap, folds out air, and gets value from worse Kx and pairs. On a wet 9-8-7 two-tone board you’d check far more and bet a polarized range larger.',
      zh: '作为按钮加注者在 K-7-2 彩虹面上,你可以用接近全部范围、约三分之一底池持续下注:便宜、赶走空气牌,又能从更差的 Kx 和对子拿价值。在湿润的 9-8-7 双色面上你会更多过牌、用极化范围下更大的注。' },
    faq: [
      { q: { en: 'How often should you c-bet the flop?', zh: '翻牌该多频繁持续下注?' },
        a: { en: 'It depends on the board. On dry boards you own, a small c-bet at very high frequency is standard; on wet boards that hit the caller you check more and bet a tighter, bigger, polarized range.',
             zh: '取决于牌面。在你占优的干燥牌面上,小额、极高频率持续下注是标准;在击中跟注方的湿润牌面上则更多过牌、用更窄更大更极化的范围下注。' } },
      { q: { en: 'When should you not c-bet?', zh: '什么时候不该持续下注?' },
        a: { en: 'Check boards that favor the caller’s range, and check medium hands that prefer pot control — betting there only folds out worse and gets called by better.',
             zh: '在偏向跟注方范围的牌面上过牌,用偏好控池的中等牌过牌——此时下注只会赶走更差的牌、被更好的牌跟注。' } },
    ],
  },
  {
    slug: 'board-texture', course: 'c4',
    term: { en: 'Board Texture (Wet vs Dry)', zh: '牌面纹理(湿润与干燥)' },
    short: {
      en: 'Board texture describes how connected and coordinated the community cards are. Dry boards are disconnected and favor the aggressor; wet boards are connected and shift equity toward the caller.',
      zh: '牌面纹理描述公共牌的连接与配合程度。干燥牌面不连接、偏向进攻方;湿润牌面连接、把胜率推向跟注方。' },
    body: {
      en: 'Texture decides both how often and how big you bet. A <b>dry</b> board like K-7-2 rainbow has few draws, so the preflop raiser can c-bet a wide range small. A <b>wet</b> board like J-T-9 two-tone is full of straights, flush draws, and made hands for the caller, so you bet a tighter, more polarized range and size up to charge the draws.<br><br>Also watch paired boards (fewer strong hands, more room to bluff) and monotone boards (whoever holds more of the top suit gets the nut advantage). The first read on any flop is: does this texture favor my range or my opponent’s?',
      zh: '纹理同时决定你下注的频率和尺寸。<b>干燥</b>牌面如 K-7-2 彩虹几乎没有听牌,翻前加注者可以用宽范围小额持续下注。<b>湿润</b>牌面如 J-T-9 双色充满顺子、同花听牌和跟注方的成牌,你要用更窄、更极化的范围并加大尺寸向听牌收费。<br><br>还要留意配对牌面(强牌更少、诈唬空间更大)和同色牌面(谁拥有更多顶级花色就获得坚果优势)。每个翻牌的第一判断是:这个纹理偏向我的范围还是对手的?' },
    example: {
      en: 'On dry K-7-2r the raiser bets ~33% pot with a wide range. Move to wet J-T-9 with a flush draw present and the same raiser checks more of their air and bets bigger (~66% pot) with a polarized range of sets, straights, and strong draws to deny equity.',
      zh: '在干燥的 K-7-2 彩虹面上,加注者用宽范围下约 33% 底池。换到有同花听牌的湿润 J-T-9,同一加注者会更多过牌空气牌、用暗三条/顺子/强听牌的极化范围下更大的注(约 66% 底池)以否定胜率。' },
    faq: [
      { q: { en: 'What makes a board wet or dry?', zh: '什么让牌面变湿或变干?' },
        a: { en: 'Connectedness and suits. Cards close in rank and of the same suit (many straight and flush draws) are wet; disconnected rainbow cards with few draws are dry.',
             zh: '连接性和花色。点数相近、同花色(很多顺子同花听牌)的牌是湿的;不连接的彩虹牌、听牌少的是干的。' } },
      { q: { en: 'Do you bet bigger on wet or dry boards?', zh: '湿润还是干燥牌面下注更大?' },
        a: { en: 'Bigger on wet boards, to charge draws and protect equity with a polarized range; smaller and more often on dry boards you dominate.',
             zh: '湿润牌面更大,用极化范围向听牌收费、保护胜率;在你占优的干燥牌面上更小、更频繁。' } },
    ],
  },
  {
    slug: 'polarized-range', course: 'c7',
    term: { en: 'Polarized Range', zh: '极化范围' },
    short: {
      en: 'A polarized range is a betting range made up of strong value hands and bluffs, with medium-strength hands checked. Big bets and overbets should be polarized so the bluffs are backed by real value.',
      zh: '极化范围是由强价值牌和诈唬组成的下注范围,中等牌力过牌。大注和超池应当极化,让诈唬有真实的价值牌支撑。' },
    body: {
      en: 'Polarization is what makes large bets credible. If you only bet big with value, observant opponents fold everything; if you only bluff, they call everything. Mixing the two — value plus a correct fraction of bluffs — makes the opponent <b>indifferent</b> between calling and folding their bluff-catchers.<br><br>The opposite is a <b>linear</b> (or merged) range, which bets a band of strong-to-medium hands for a smaller size. Rule of thumb: bet small and linear when you have range advantage but not nut advantage; bet big and polarized when you also hold the nuts more often.',
      zh: '极化是让大注可信的原因。若你只用价值牌下大注,观察力强的对手会全弃;若你只诈唬,他们会全跟。把两者混合——价值牌加上正确比例的诈唬——让对手在跟注和弃掉抓诈牌之间<b>无差异</b>。<br><br>它的反面是<b>线性</b>(或合并)范围,用较小尺寸下注一段强到中等的牌。经验法则:有范围优势但没坚果优势时下小注、走线性;当你也更常拥有坚果时下大注、走极化。' },
    example: {
      en: 'On the river you bet pot with a range of nut straights and sets (value) plus missed flush draws (bluffs), and you check your medium pairs. A pot-sized bet mixes roughly one bluff for every two value hands so the opponent’s bluff-catchers break even.',
      zh: '河牌你用坚果顺子和暗三条(价值)加上没成的同花听牌(诈唬)下底池大小的注,并过牌你的中等对子。底池大小的下注大约每两手价值配一手诈唬,让对手的抓诈牌盈亏平衡。' },
    faq: [
      { q: { en: 'When should you use a polarized range?', zh: '什么时候用极化范围?' },
        a: { en: 'When you use big bets or overbets and hold a nut advantage. Polarize so your bluffs are credible; use a smaller linear range when you only have range advantage.',
             zh: '当你使用大注或超池且拥有坚果优势时。极化让你的诈唬可信;只有范围优势时用更小的线性范围。' } },
      { q: { en: 'What is the opposite of a polarized range?', zh: '极化范围的反面是什么?' },
        a: { en: 'A linear or merged range — betting a continuous band of strong-to-medium hands for a smaller size, typically when you have range advantage but not nut advantage.',
             zh: '线性或合并范围——用较小尺寸下注一段连续的强到中等牌,通常在有范围优势但无坚果优势时使用。' } },
    ],
  },
  {
    slug: 'bluff-catcher', course: 'c7',
    term: { en: 'Bluff Catcher', zh: '抓诈牌' },
    short: {
      en: 'A bluff catcher is a hand that beats only your opponent’s bluffs, not their value bets. You call with it to stop the opponent from bluffing profitably, choosing the ones that block their value.',
      zh: '抓诈牌是只能击败对手诈唬、打不过其价值下注的牌。你用它跟注来阻止对手盈利地诈唬,并优先选择阻断对手价值牌的组合。' },
    body: {
      en: 'On a polarized river, most of your calling range is bluff catchers — hands like a middling pair that beat air but lose to any value. Your job is to call enough of them to meet the MDF, and to pick the specific combos that <b>block</b> the opponent’s value hands and <b>unblock</b> their bluffs.<br><br>Against balanced opponents a bluff catcher is a break-even call by design. The profit comes from exploitation: fold more of them versus players who under-bluff, and call them all down versus players who bluff too much.',
      zh: '在极化的河牌上,你跟注范围的大部分是抓诈牌——像中对这样能击败空气、却输给任何价值的牌。你的任务是跟注足够多的抓诈牌以满足 MDF,并挑出那些<b>阻断</b>对手价值牌、<b>不阻断</b>其诈唬的具体组合。<br><br>面对平衡的对手,抓诈牌按设计是盈亏平衡的跟注。利润来自剥削:面对诈唬不足的玩家多弃掉,面对诈唬过多的玩家全部跟到底。' },
    example: {
      en: 'You hold A-J on a K-9-4-2-6 board and face a pot-sized river bet. Ace-high is a pure bluff catcher: it beats his busted draws but loses to any king or better. Calling with the ace that blocks his A-K value combos is better than calling a worse ace.',
      zh: '你在 K-9-4-2-6 的牌面上持 A-J,面对底池大小的河牌下注。A 高是纯抓诈牌:它击败对手没成的听牌,却输给任何 K 或更好。用能阻断对手 A-K 价值组合的那张 A 跟注,优于用更差的 A 跟注。' },
    faq: [
      { q: { en: 'How do you pick which bluff catchers to call?', zh: '怎么选用哪些抓诈牌跟注?' },
        a: { en: 'Prefer combos that block the opponent’s value hands and don’t block their bluffs — that makes it likelier you’re facing a bluff and less likely they hold a call.',
             zh: '优先选阻断对手价值牌、不阻断其诈唬的组合——这让你更可能面对诈唬、对手更不可能拿着跟注牌。' } },
      { q: { en: 'Is calling a bluff catcher profitable?', zh: '用抓诈牌跟注盈利吗?' },
        a: { en: 'Against a balanced bettor it’s break-even by design. It becomes profitable when the opponent bluffs too often, and a fold when they rarely bluff.',
             zh: '面对平衡的下注者,按设计是盈亏平衡。当对手诈唬过多时变盈利,当对手很少诈唬时应弃牌。' } },
    ],
  },
  {
    slug: 'spr', course: 'c12',
    term: { en: 'SPR (Stack-to-Pot Ratio)', zh: 'SPR(筹码底池比)' },
    short: {
      en: 'SPR is the effective stack divided by the pot at the start of the flop. It tells you how committed you are: low SPR means top pair can stack off, high SPR rewards implied odds and pot control.',
      zh: 'SPR 是翻牌开始时有效筹码除以底池。它告诉你承诺程度:低 SPR 时顶对可以全下,高 SPR 奖励隐含赔率和控池。' },
    body: {
      en: 'SPR sets how strong a hand you need to commit your stack. At a <b>low SPR</b> (under about 4), top pair or an overpair is often good enough to get all-in profitably, so play fast and straightforward. At a <b>high SPR</b> (10+), the same top pair prefers pot control, because stacks only go in when you’re usually beaten.<br><br>You influence SPR before the flop: 3-betting and 4-betting lowers it, while calling to keep the pot small keeps it high. Planning around SPR is how you avoid the classic trap of bloating a pot with a hand that can’t stand the heat.',
      zh: 'SPR 决定你需要多强的牌才该承诺筹码。在<b>低 SPR</b>(约 4 以下)时,顶对或超对通常已足以盈利地全下,应快速直接地打。在<b>高 SPR</b>(10 以上)时,同样的顶对更偏好控池,因为筹码进锅时你通常已落后。<br><br>你在翻前就影响 SPR:3-bet 和 4-bet 降低它,而跟注保持小底池则让它保持高。围绕 SPR 做计划,是你避免「用扛不住压力的牌把底池打大」这个经典陷阱的方法。',},
    example: {
      en: 'You have 100 in your stack and the pot is 25 on the flop: SPR = 4. Here top pair top kicker is happy to get it in. In a limped pot with SPR 20, that same top pair is a one- or two-street hand that prefers to control the pot rather than stack off.',
      zh: '你筹码 100、翻牌底池 25:SPR = 4。此时顶对顶踢乐意全下。在一个跛入底池、SPR 为 20 的局面里,同样的顶对只是能打一到两条街的牌,更偏好控池而非全下。' },
    faq: [
      { q: { en: 'What is a low vs high SPR?', zh: '低 SPR 和高 SPR 怎么分?' },
        a: { en: 'Roughly: under 4 is low (commit with top pair and overpairs), 4–10 is medium, and 10+ is high (favor pot control and implied-odds hands).',
             zh: '大致:4 以下为低(用顶对超对承诺),4–10 为中,10 以上为高(偏好控池和隐含赔率的牌)。' } },
      { q: { en: 'How do you control SPR?', zh: '怎么控制 SPR?' },
        a: { en: 'Preflop: 3-betting and 4-betting build the pot and lower SPR; flat-calling keeps the pot small and SPR high. Choose the SPR that suits your hand class.',
             zh: '翻前:3-bet 和 4-bet 做大底池、降低 SPR;平跟保持小底池、SPR 高。选择适合你手牌类别的 SPR。' } },
    ],
  },
  {
    slug: 'blockers', course: 'c14',
    term: { en: 'Blockers', zh: '阻断牌' },
    short: {
      en: 'Blockers are cards in your hand that reduce the combinations of hands your opponent can hold. Holding the ace of a suit, for example, makes it less likely your opponent has the nut flush.',
      zh: '阻断牌是你手中能减少对手可能组合数的牌。例如握着某花色的 A,就降低了对手拿到坚果同花的可能。' },
    body: {
      en: 'Blockers refine range-based decisions into specific-combo decisions. The best <b>bluffs</b> block the opponent’s value and calling hands while unblocking their folds — so you fire the combos that make a call least likely. The best <b>bluff-catches</b> do the reverse: they block the opponent’s value so a bluff is more likely.<br><br>Blockers are a tiebreaker, not a trump card. Use them to choose which of two equivalent hands to turn into a bluff or a call — but a strong blocker never overrides bad pot odds or a range that just doesn’t have enough bluffs.',
      zh: '阻断牌把基于范围的决策细化成基于具体组合的决策。最好的<b>诈唬</b>阻断对手的价值牌和跟注牌、不阻断其弃牌——即用让对手最不可能跟注的组合去开火。最好的<b>抓诈</b>相反:阻断对手的价值牌,让诈唬更可能。<br><br>阻断牌是决胜局的平局判定,不是王牌。用它在两手等价牌之间选谁去诈唬或跟注——但强阻断牌永远不能凌驾于糟糕的底池赔率、或一个根本没有足够诈唬的范围之上。' },
    example: {
      en: 'On a board of Q-J-8-5-3 with a flush possible, you decide to bluff the river. Holding the ace of the flush suit is ideal: it blocks the opponent’s nut flush, making it far less likely they can call, so that combo is a better bluff than one without the blocker.',
      zh: '在 Q-J-8-5-3、有同花可能的牌面上,你决定河牌诈唬。手里握着同花花色的 A 最理想:它阻断对手的坚果同花,让对手能跟注的可能大幅降低,所以这个组合比没有阻断牌的组合是更好的诈唬。' },
    faq: [
      { q: { en: 'How do blockers help when bluffing?', zh: '阻断牌在诈唬时如何帮忙?' },
        a: { en: 'Bluff with cards that block the opponent’s value and calling range while not blocking their folds — it makes a call less likely and your bluff more profitable.',
             zh: '用阻断对手价值和跟注范围、又不阻断其弃牌的牌去诈唬——这让对手更不可能跟注,你的诈唬更盈利。' } },
      { q: { en: 'Are blockers more important than pot odds?', zh: '阻断牌比底池赔率更重要吗?' },
        a: { en: 'No. Blockers break ties between similar hands; they never justify a call the pot odds reject or a bluff a balanced range can’t support.',
             zh: '不。阻断牌用来在相似牌之间打破平局;它们永远不能为底池赔率否决的跟注、或平衡范围不支持的诈唬提供理由。' } },
    ],
  },
  {
    slug: 'semi-bluff', course: 'c23',
    term: { en: 'Semi-Bluff', zh: '半诈唬' },
    short: {
      en: 'A semi-bluff is a bet or raise made with a drawing hand — one that can win now by making the opponent fold, and can also improve to the best hand if called. It combines fold equity with real equity.',
      zh: '半诈唬是用听牌下注或加注——它既能通过让对手弃牌当场获胜,被跟注后也能补牌成为最好的牌。它结合了弃牌率与真实胜率。' },
    body: {
      en: 'The semi-bluff is one of the most profitable plays in poker because it wins two ways. Even when called, your draw still has equity to make the nuts, so you’re never drawing dead the way a pure bluff often is.<br><br>Raise your <b>strongest</b> draws — big combo draws and open-enders with overcards — for maximum fold equity and to build the pot for when you hit. Just call with weaker draws that prefer to see a cheap card and realize their equity passively rather than get blown off the hand by a re-raise.',
      zh: '半诈唬是扑克里最盈利的打法之一,因为它有两种获胜方式。即使被跟注,你的听牌仍有成坚果的胜率,所以你从不像纯诈唬那样常常「毫无出路」。<br><br>用你<b>最强</b>的听牌加注——大组合听牌、带高牌的两头顺听——以获得最大弃牌率并做大底池以备击中。用较弱的听牌只跟注,它们更偏好廉价看牌、被动兑现胜率,而不是被再加注赶出这手牌。' },
    example: {
      en: 'You hold the nut flush draw with two overcards on the flop — about 15 outs and often a coin flip even when called. Raising is a textbook semi-bluff: worse hands fold now, and when you’re called you still hit your flush or a top pair roughly half the time.',
      zh: '翻牌你持坚果同花听牌加两张高牌——约 15 个 outs,即使被跟注也常常接近五五开。加注是教科书式的半诈唬:更差的牌现在弃牌,而被跟注时你仍有大约一半的机会击中同花或顶对。' },
    faq: [
      { q: { en: 'Why is a semi-bluff better than a pure bluff?', zh: '半诈唬为什么比纯诈唬好?' },
        a: { en: 'It wins two ways: the opponent may fold now, and if called your draw can still improve to the best hand. A pure bluff only wins when the opponent folds.',
             zh: '它有两种获胜方式:对手现在可能弃牌,被跟注后你的听牌还能补成最好的牌。纯诈唬只有对手弃牌时才赢。' } },
      { q: { en: 'Which draws should you semi-bluff raise?', zh: '哪些听牌该半诈唬加注?' },
        a: { en: 'Your strongest draws with the most outs and fold equity — big combo draws and open-enders with overcards. Weaker draws usually prefer to call and see a cheap card.',
             zh: '你 outs 最多、弃牌率最高的最强听牌——大组合听牌和带高牌的两头顺听。较弱的听牌通常更偏好跟注、廉价看牌。' } },
    ],
  },
  {
    slug: 'overbet', course: 'c20',
    term: { en: 'Overbet', zh: '超池下注' },
    short: {
      en: 'An overbet is a bet larger than the size of the pot. It’s used with a polarized range on boards where you hold the nut advantage and the opponent’s range is capped at medium-strength hands.',
      zh: '超池下注是大于底池的下注。它用极化范围,在你拥有坚果优势、对手范围被封顶在中等牌力的牌面上使用。' },
    body: {
      en: 'Overbetting maximizes value and fold equity when the situation is right. Because it risks more than the pot, it demands a credible top of range — nut hands plus bluffs — so it must be <b>polarized</b> and backed by a <b>nut advantage</b>. Without those, a large bet is easy to bluff-catch and re-raise.<br><br>Great overbet spots are cards and runouts that hit your range hard and miss the opponent’s: an ace turning on a board you can hold two-pair-plus, or a river that completes your value while the opponent is capped. Applied correctly, overbets extract stacks that a pot-sized bet would leave on the table.',
      zh: '当局面合适时,超池能最大化价值和弃牌率。因为它冒的风险超过底池,需要可信的范围顶端——坚果牌加诈唬——所以它必须<b>极化</b>并有<b>坚果优势</b>支撑。缺了这些,大注很容易被抓诈和再加注。<br><br>绝佳的超池局面是那些狠狠击中你范围、错过对手的牌与走向:在你能持两对以上的牌面上转出一张 A,或一张让你价值成立而对手被封顶的河牌。用对了,超池能榨出底池大小下注会留在桌上的筹码。' },
    example: {
      en: 'You hold a set on a board where the river completes an obvious straight the opponent’s capped range can’t have. Overbetting 1.5x pot with your sets and nut straights, balanced with a few busted draws as bluffs, gets called by their two-pair and one-pair bluff catchers for maximum value.',
      zh: '你在一张河牌完成了对手被封顶的范围不可能持有的明显顺子的牌面上持暗三条。用你的暗三条和坚果顺子超池下注 1.5 倍底池、并用几手没成的听牌作诈唬平衡,能被对手的两对和单对抓诈牌跟注,获取最大价值。' },
    faq: [
      { q: { en: 'When should you overbet?', zh: '什么时候该超池下注?' },
        a: { en: 'When you hold a nut advantage on a runout that favors your range and caps the opponent’s, using a polarized range of strong value plus bluffs.',
             zh: '当你在偏向你范围、封顶对手范围的走向上拥有坚果优势时,用强价值加诈唬的极化范围。' } },
      { q: { en: 'Why do overbets need a nut advantage?', zh: '超池为什么需要坚果优势?' },
        a: { en: 'A bet larger than the pot risks a lot, so it needs the very top of the range to be credible. Without nut advantage it’s easy to bluff-catch and re-raise, turning it into a losing play.',
             zh: '大于底池的下注风险很大,需要范围最顶端来使其可信。没有坚果优势时容易被抓诈和再加注,反而成为亏损打法。' } },
    ],
  },
];
