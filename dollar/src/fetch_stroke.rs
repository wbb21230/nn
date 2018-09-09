use bincode::{serialize, deserialize};
use std::fs::File;
use std::io::prelude::*;
use reqwest;

pub fn run(){
    let contents = {
        let mut contents = String::new();
        let mut file = File::open("yq.txt").unwrap();
        file.read_to_string(&mut contents).unwrap();
        contents
    };

    for line in contents.lines(){
        for ch in line.chars(){
            let file = File::open(format!("strokes/{}.stroke", ch));
            let file_err = File::open(format!("strokes/{}.stroke_err", ch));
            if file.is_err() && file_err.is_err(){
                //println!("没有{}的文件", ch);
                let result = get_strokes(ch);
                if let Some(strokes) = result{
                    //println!("{:?}", strokes);
                    let strokes = strokes.1;
                    let encoded: Vec<u8> = serialize(&strokes).unwrap();
                    let mut file = File::create(format!("strokes/{}.stroke", ch)).unwrap();
                    file.write_all(&encoded).unwrap();
                }else{
                    //println!("找不到{}的笔画，删除", ch);
                    let mut file = File::create(format!("strokes/{}.stroke_err", ch)).unwrap();
                    file.write_all(b"").unwrap();
                }
            }
        }    
    }
    
    // return;

    // let text = "一乙二十丁厂七卜八人入儿九几了乃刀力又三干于亏士土工才下寸丈大与万上小口山巾千乞川亿个么久勺丸夕凡及广亡门义之尸已弓己卫子也女飞刃习叉马乡丰王井开夫天元无云专扎艺木五支厅不太犬区历友尤匹车巨牙屯比互切瓦止少日中贝内水冈见手午牛毛气升长仁什片仆化仇币仍仅斤爪反介父从今凶分乏公仓月氏勿风欠丹匀乌勾凤六文方火为斗忆计订户认心尺引丑巴孔队办以允予劝双书幻玉刊末未示击打巧正扑扒功扔去甘世古节本术可丙左厉石右布龙平灭轧东卡北占业旧帅归目旦且叮叶甲申号电田由只央史兄叼叫叨另叹四生失禾丘付仗代仙们仪白仔他斥瓜乎丛令用甩印乐句匆册犯外处冬鸟务包饥主市立闪兰半汁汇头汉宁穴它讨写让礼训必议讯记永司尼民出辽奶奴加召皮边孕发圣对台矛纠母幼丝式刑动扛寺吉扣考托老圾巩执扩扫地扬场耳共芒亚芝朽朴机权过臣再协西压厌在百有存而页匠夸夺灰达列死成夹轨邪划迈毕至此贞师尘尖劣光当早吐吓虫曲团同吊吃因吸吗屿帆岁回岂则刚网肉年朱先丢舌竹迁乔伟传乒乓休伍伏优伐延件任伤价份华仰仿伙伪自血向似后行舟全会杀合兆企众爷伞创肌朵杂危旬旨负各名多争色壮冲冰庄庆亦刘齐交次衣产决充妄闭问闯羊并关米灯州汗污江池汤忙兴宇守宅字安讲军许论农讽设访寻那迅尽导异孙阵阳收阶阴防奸如妇好她妈戏羽观欢买红纤约级纪驰巡寿弄麦形进戒吞远违运扶抚坛技坏扰拒找批扯址走抄坝贡攻赤折抓扮抢孝均抛投坟坑抗坊抖护壳志块扭声把报却劫芽花芹芬苍芳严芦劳克苏杆杜杠材村杏极李杨求更束豆两丽医辰励否还歼来连步坚旱盯呈时吴助县里呆园旷围呀吨足邮男困吵串员听吩吹呜吼吧别岗帐财钉针告我乱利秃秀私每兵估体何但伸作伯伶佣低你住位伴身皂佛近彻役返余希坐谷妥含邻岔肝肚肠龟免狂犹角删条卵岛迎饭饮系言冻状亩况床库疗应冷这序辛弃冶忘闲间闷判灶灿弟汪沙汽沃泛沟没沈沉怀忧快完宋宏牢究穷灾良证启评补初社识诉诊词译君灵即层尿尾迟局改张忌际陆阿陈阻附妙妖妨努忍劲鸡驱纯纱纲纳纵驳纷纸纹纺驴纽奉玩环武青责现表规抹拢拔拣坦担押抽拐拖者拍顶拆拥抵拘势抱垃拉拦幸拌招坡披拨择抬其取苦若茂苹苗英范直茄茎茅林枝杯柜析板松枪构杰述枕丧或画卧事刺枣雨卖矿码厕奔奇奋态欧垄妻轰顷转斩轮软到非叔肯齿些虎虏肾贤尚旺具果味昆国昌畅明易昂典固忠咐呼鸣咏呢岸岩帖罗帜岭凯败贩购图钓制知垂牧物乖刮秆和季委佳侍供使例版侄侦侧凭侨佩货依的迫质欣征往爬彼径所舍金命斧爸采受乳贪念贫肤肺肢肿胀朋股肥服胁周昏鱼兔狐忽狗备饰饱饲变京享店夜庙府底剂郊废净盲放刻育闸闹郑券卷单炒炊炕炎炉沫浅法泄河沾泪油泊沿泡注泻泳泥沸波泼泽治怖性怕怜怪学宝宗定宜审宙官空帘实试郎诗肩房诚衬衫视话诞询该详建肃隶录居届刷屈弦承孟孤陕降限妹姑姐姓始驾参艰线练组细驶织终驻驼绍经贯奏春帮珍玻毒型挂封持项垮挎城挠政赴赵挡挺括拴拾挑指垫挣挤拼挖按挥挪某甚革荐巷带草茧茶荒茫荡荣故胡南药标枯柄栋相查柏柳柱柿栏树要咸威歪研砖厘厚砌砍面耐耍牵残殃轻鸦皆背战点临览竖省削尝是盼眨哄哑显冒映星昨畏趴胃贵界虹虾蚁思蚂虽品咽骂哗咱响哈咬咳哪炭峡罚贱贴骨钞钟钢钥钩卸缸拜看矩怎牲选适秒香种秋科重复竿段便俩货顺修保促侮俭俗俘信皇泉鬼侵追俊盾待律很须叙剑逃食盆胆胜胞胖脉勉狭狮独狡狱狠贸怨急饶蚀饺饼弯将奖哀亭亮度迹庭疮疯疫疤姿亲音帝施闻阀阁差养美姜叛送类迷前首逆总炼炸炮烂剃洁洪洒浇浊洞测洗活派洽染济洋洲浑浓津恒恢恰恼恨举觉宣室宫宪突穿窃客冠语扁袄祖神祝误诱说诵垦退既屋昼费陡眉孩除险院娃姥姨姻娇怒架贺盈勇怠柔垒绑绒结绕骄绘给络骆绝绞统耕耗艳泰珠班素蚕顽盏匪捞栽捕振载赶起盐捎捏埋捉捆捐损都哲逝捡换挽热恐壶挨耻耽恭莲莫荷获晋恶真框桂档桐株桥桃格校核样根索哥速逗栗配翅辱唇夏础破原套逐烈殊顾轿较顿毙致柴桌虑监紧党晒眠晓鸭晃晌晕蚊哨哭恩唤啊唉罢峰圆贼贿钱钳钻铁铃铅缺氧特牺造乘敌秤租秧积秩称秘透笔笑笋债借值倚倾倒倘俱倡候俯倍倦健臭射躬息徒徐舰舱般航途拿爹爱颂翁脆脂胸胳脏胶脑狸狼逢留皱饿恋桨浆衰高席准座症病疾疼疲脊效离唐资凉站剖竞部旁旅畜阅羞瓶拳粉料益兼烤烘烦烧烛烟递涛浙涝酒涉消浩海涂浴浮流润浪浸涨烫涌悟悄悔悦害宽家宵宴宾窄容宰案请朗诸读扇袜袖袍被祥课谁调冤谅谈谊剥恳展剧屑弱陵陶陷陪娱娘通能难预桑绢绣验继球理捧堵描域掩捷排掉推堆掀授教掏掠培接控探据掘职基著勒黄萌萝菌菜萄菊萍菠营械梦梢梅检梳梯桶救副票戚爽聋袭盛雪辅辆虚雀堂常匙晨睁眯眼悬野啦晚啄距跃略蛇累唱患唯崖崭崇圈铜铲银甜梨犁移笨笼笛符第敏做袋悠偿偶偷您售停偏假得衔盘船斜盒鸽悉欲彩领脚脖脸脱象够猜猪猎猫猛馅馆凑减毫麻痒痕廊康庸鹿盗章竟商族旋望率着盖粘粗粒断剪兽清添淋淹渠渐混渔淘液淡深婆梁渗情惜惭悼惧惕惊惨惯寇寄宿窑密谋谎祸谜逮敢屠弹随蛋隆隐婚婶颈绩绪续骑绳维绵绸绿琴斑替款堪塔搭越趁趋超提堤博揭喜插揪搜煮援裁搁搂搅握揉斯期欺联散惹葬葛董葡敬葱落朝辜葵棒棋植森椅椒棵棍棉棚棕惠惑逼厨厦硬确雁殖裂雄暂雅辈悲紫辉敞赏掌晴暑最量喷晶喇遇喊景践跌跑遗蛙蛛蜓喝喂喘喉幅帽赌赔黑铸铺链销锁锄锅锈锋锐短智毯鹅剩稍程稀税筐等筑策筛筒答筋筝傲傅牌堡集焦傍储奥街惩御循艇舒番释禽腊脾腔鲁猾猴然馋装蛮就痛童阔善羡普粪尊道曾焰港湖渣湿温渴滑湾渡游滋溉愤慌惰愧愉慨割寒富窜窝窗遍裕裤裙谢谣谦属屡强粥疏隔隙絮嫂登缎缓骗编缘瑞魂肆摄摸填搏塌鼓摆携搬摇搞塘摊蒜勤鹊蓝墓幕蓬蓄蒙蒸献禁楚想槐榆楼概赖酬感碍碑碎碰碗碌雷零雾雹输督龄鉴睛睡睬鄙愚暖盟歇暗照跨跳跪路跟遣蛾蜂嗓置罪罩错锡锣锤锦键锯矮辞稠愁筹签简毁舅鼠催傻像躲微愈遥腰腥腹腾腿触解酱痰廉新韵意粮数煎塑慈煤煌满漠源滤滥滔溪溜滚滨粱滩慎誉塞谨福群殿辟障嫌嫁叠缝缠静碧璃墙嘉摧截誓境摘摔撇聚慕暮蔑蔽模榴榜榨歌遭酷酿酸磁愿需裳颗嗽蜻蜡蝇蜘赚锹锻舞稳算箩管僚鼻魄貌膜膊膀鲜疑馒裹敲豪膏遮腐瘦辣竭端旗精歉弊熄熔漆漂漫滴演漏慢寨赛察蜜谱嫩翠熊凳骡缩慧撕撒趣趟撑播撞撤增聪鞋蕉蔬横槽樱橡飘醋醉震霉瞒题暴瞎影踢踏踩踪蝶蝴嘱墨镇靠稻黎稿稼箱箭篇僵躺僻德艘膝膛熟摩颜毅糊遵潜潮懂额慰劈操燕薯薪薄颠橘整融醒餐嘴蹄器赠默镜赞篮邀衡膨雕磨凝辨辩糖糕燃澡激懒壁避缴戴擦鞠藏霜霞瞧蹈螺穗繁辫赢糟糠燥臂翼骤鞭覆蹦镰翻鹰警攀蹲颤瓣爆疆壤耀躁嚼嚷籍魔灌蠢霸露囊罐匕刁丐歹戈夭仑讥冗邓艾夯凸卢叭叽皿凹囚矢乍尔冯玄邦迂邢芋芍吏夷吁吕吆屹廷迄臼仲伦伊肋旭匈凫妆亥汛讳讶讹讼诀弛阱驮驯纫玖玛韧抠扼汞扳抡坎坞抑拟抒芙芜苇芥芯芭杖杉巫杈甫匣轩卤肖吱吠呕呐吟呛吻吭邑囤吮岖牡佑佃伺囱肛肘甸狈鸠彤灸刨庇吝庐闰兑灼沐沛汰沥沦汹沧沪忱诅诈罕屁坠妓姊妒纬玫卦坷坯拓坪坤拄拧拂拙拇拗茉昔苛苫苟苞茁苔枉枢枚枫杭郁矾奈奄殴歧卓昙哎咕呵咙呻咒咆咖帕账贬贮氛秉岳侠侥侣侈卑刽刹肴觅忿瓮肮肪狞庞疟疙疚卒氓炬沽沮泣泞泌沼怔怯宠宛衩祈诡帚屉弧弥陋陌函姆虱三绅驹绊绎契贰玷玲珊拭拷拱挟垢垛拯荆茸茬荚茵茴荞荠荤荧荔栈柑栅柠枷勃柬砂泵砚鸥轴韭虐昧盹咧昵昭盅勋哆咪哟幽钙钝钠钦钧钮毡氢秕俏俄俐侯徊衍胚胧胎狰饵峦奕咨飒闺闽籽娄烁炫洼柒涎洛恃恍恬恤宦诫诬祠诲屏屎逊陨姚娜蚤骇耕耙秦匿埂捂捍袁捌挫挚捣捅埃耿聂荸莽莱莉莹莺梆栖桦栓桅桩贾酌砸砰砾殉逞哮唠哺剔蚌蚜畔蚣蚪蚓哩圃鸯唁哼唧唆峭峻赂赃钾铆氨秫笆俺赁倔殷耸舀豺豹颁胯胰脐脓逛卿鸵鸳馁凌凄衷郭斋疹紊瓷羔烙浦涡涣涤涧涕涩悍悯窍诺诽袒谆祟恕娩骏琐麸琉琅措捺捶赦埠捻掐掂掖掷掸掺勘聊娶菱菲萎菩萤干萧萨菇彬梗梧梭曹酝酗厢硅硕奢盔匾颅彪眶晤曼晦冕啡畦趾啃蛆蚯蛉蛀唬啰唾啤啥啸崎逻崔崩婴赊铐铛铝铡铣铭矫秸秽笙笤偎傀躯兜衅徘徒舶舷舵敛翎脯逸凰猖祭烹庶庵痊阎阐眷焊焕鸿涯淑淌淮淆渊淫淳淤淀涮涵惦悴惋寂窒谍谐裆袱祷谒谓谚尉堕隅婉颇绰绷综绽缀巢琳琢琼揍堰揩揽揖彭揣搀搓壹搔葫募蒋蒂韩棱椰焚椎棺榔椭粟棘酣酥硝硫颊雳翘凿棠晰鼎喳遏晾畴跋跛蛔蜒蛤鹃喻啼喧嵌赋赎赐锉锌甥掰氮氯黍筏牍粤逾腌腋腕猩猬惫敦痘痢痪竣翔奠遂焙滞湘渤渺溃溅湃愕惶寓窖窘雇谤犀隘媒媚婿缅缆缔缕骚瑟鹉瑰搪聘斟靴靶蓖蒿蒲蓉楔椿楷榄楞楣酪碘硼碉辐辑频睹睦瞄嗜嗦暇畸跷跺蜈蜗蜕蛹嗅嗡嗤署蜀幌锚锥锨锭锰稚颓筷魁衙腻腮腺鹏肄猿颖煞雏馍馏禀痹廓痴靖誊漓溢溯溶滓溺寞窥窟寝褂裸谬媳嫉缚缤剿赘熬赫蔫摹蔓蔗蔼熙蔚兢榛榕酵碟碴碱碳辕辖雌墅嘁踊蝉嘀幔镀舔熏箍箕箫舆僧孵瘩瘟彰粹漱漩漾慷寡寥谭褐裉隧嫡缨撵撩撮撬擒墩撰鞍蕊蕴樊樟橄敷豌醇磕磅碾嘶嘲嘹蝠蝎蝌蝗蝙嘿幢镊镐稽篓膘鲤鲫褒瘪瘤瘫凛憋澎潭潦澳潘澈澜澄憔懊憎翩褥谴鹤憨履嬉豫缭撼擂擅蕾薛薇擎翰噩橱橙瓢磺霍霎辙冀踱蹂蟆螃螟噪鹦黔穆篡篷篙篱儒膳鲸瘾瘸糙燎濒憾懈窿缰壕藐檬檐檩檀礁磷瞭瞬瞳瞪曙蹋蟋蟀嚎赡镣魏簇儡徽爵朦臊鳄糜癌懦豁臀藕藤瞻嚣鳍癞瀑襟璧戳攒孽蘑藻蹭蹬簸簿蟹靡癣羹鳖鬓攘蠕巍鳞糯譬霹躏髓蘸镶瓤矗";
    
    // for ch in text.chars(){
    //     let file = File::open(format!("{}.stroke", ch));
    //     if file.is_ok(){
    //         //println!("{}已存在", ch);
    //         continue;
    //     }

    //     let result = get_strokes(ch);
    //     if let Some(strokes) = result{
    //         //println!("{:?}", strokes);
    //         let strokes = strokes.1;
    //         let encoded: Vec<u8> = serialize(&strokes).unwrap();
    //         let mut file = File::create(format!("{}.stroke", ch)).unwrap();
    //         file.write_all(&encoded).unwrap();
    //     }else{
    //         println!("没有{}的笔画", ch);
    //     }
    // }
    // let strokes_data = "280,264-280,264-297,263-299,277-316,279-313,261-330,259-332,276-348,273-346,257-363,256-365,272-381,269-379,254-395,251-398,267-414,265-412,249-428,246-430,262-447,260-444,244-461,241-463,257-480,255-477,239-494,236-496,252-512,250-510,234-526,231-529,248-545,245-543,228-559,226-561,243-578,240-574,217-588,198-594,240-611,239-606,202-624,216-613,238#575,236-615,234-608,249-576,241-574,257-601,264-597,280-571,273-568,289-594,296-591,312-565,305-562,321-588,328-585,344-560,337-557,353-581,360-578,376-554,369-551,385-575,392-572,408-548,402-546,418-569,424-565,440-542,433-538,449-561,455-557,471-534,465-529,481-553,487-549,503-525,496-521,512-545,518-538,534-517,528-513,543-532,549-525,564-499,557-483,569-518,579-511,594-492,588-504,608-504,608#507,555-483,573-476,562-494,545-480,536-467,548-457,534-468,524-456,512-448,520-436,508-442,502-424,496-424,496#432,8-432,8-463,35-434,26-436,43-487,59-478,73-437,61-439,78-470,88-464,103-440,95-440,112-464,120-464,136-440,129-440,146-464,153-463,170-440,163-438,179-462,186-460,202-437,195-435,211-458,219-456,235-433,228-430,244-452,251-449,266-427,260-424,276-445,282-442,298-421,291-418,307-438,314-435,329-415,323-412,339-431,345-428,361-409,355-404,370-424,377-419,392-398,385-392,400-414,407-409,422-386,415-380,430-401,437-393,451-374,445-367,460-384,465-375,479-359,474-352,489-367,494-358,508-345,504-338,518-350,522-341,536-330,533-319,546-331,550-318,563-306,559-293,572-305,575-296,584-280,584#136,96-144,96-154,102-147,110-158,123-169,111-183,120-169,136-180,148-198,129-213,138-192,160-203,173-227,147-242,156-213,188-223,202-243,180-232,216-232,216#24,344-24,344-41,343-43,359-62,367-58,341-74,340-78,364-94,360-91,338-108,337-111,357-127,354-124,335-141,333-144,350-160,347-158,332-174,330-176,343-193,340-191,329-206,315-209,336-226,334-221,300-237,293-242,332-243,331-256,312#245,328-240,336-237,343-211,332-205,348-231,358-224,373-201,363-196,379-217,388-210,402-192,395-187,411-203,417-196,432-183,427-178,443-198,451-211,473-183,462-194,484-224,496-224,514-205,506-206,524-220,530-213,545-204,541-201,557-208,560-202,575-193,572-185,586-196,591-192,600-176,600#40,600-40,600-57,601-55,615-70,630-73,601-90,601-87,628-104,622-106,601-122,601-121,617-137,617-139,601-155,601-154,617-170,617-172,601-188,601-186,617-202,620-204,603-220,607-218,624-235,627-236,611-252,615-251,630-267,634-268,619-284,622-283,637-299,641-300,625-316,629-315,644-331,647-333,632-349,635-347,651-363,654-365,638-381,642-379,658-395,662-397,646-413,651-411,665-427,671-429,655-444,659-443,676-458,682-460,664-476,668-474,687-490,693-492,673-508,677-506,698-522,704-524,681-540,683-538,709-553,715-557,686-573,688-569,720-585,726-589,689-605,689-601,726-618,720-622,689-638,689-635,715-652,710-655,689-671,689-669,704-686,699-688,689-704,689-703,694-720,688-720,688 ".trim();
    // let mut strokes:Vec<Vec<[i32; 2]>> = vec![];
    // for stroke in strokes_data.split("#"){
    //     let mut points = vec![];
    //     for point in stroke.split("-"){
    //         let mut iter = point.split(",");
    //         let val1 = iter.next().unwrap();
    //         let val2 = iter.next().unwrap();
    //         points.push([val1.parse::<i32>().unwrap(), val2.parse::<i32>().unwrap()]);
    //     }
    //     strokes.push(points);
    // }

    // let strokes = get_strokes('繁').unwrap();
    // println!("{:?}", strokes);
    // let strokes = strokes.1;
}

fn get_strokes(c:char) -> Option<(String, Vec<Vec<[i32;2]>>)>{
    //获取unicode码
    let unicode = c.escape_unicode().to_string().replace("\\", "").replace("u{", "").replace("}", "");

    //查询笔顺
    let dict_url = format!("http://dict.r12345.com/0x{}.html", unicode);
    let dict_html = fetch(&dict_url);
    let mut stroke_orders:Vec<usize> = vec![];
    if let Some(j2) = dict_html.split("笔顺编号:</span>").skip(1).next(){
        if let Some(s) = j2.split("<br>").next(){
            for c in s.chars(){
                if let Ok(u) = format!("{}", c).parse::<usize>(){
                    stroke_orders.push(u);
                }
            }
        }
    }
    println!("stroke_orders={:?}", stroke_orders);

    //查询笔画
    //let strock_url = format!("http://bishun.shufaji.com/0x{}.html", unicode);
    let strock_url = format!("http://bihua.shufami.com/0x{}.html", unicode);
    let html = fetch(&strock_url);
    parse_html(&html, &stroke_orders)
}

fn fetch(url:&str) -> String{
    let mut res = reqwest::get(url).unwrap();
    println!("fetch {} Status: {}", url, res.status());
    res.text().unwrap()
}

/**
 * 从 http://bishun.shufaji.com 解析一个汉字的笔画
 */
fn parse_html<'a>(html: &str, stroke_orders:&Vec<usize>)->Option<(String, Vec<Vec<[i32;2]>>)>{
    /*

	hzbh.main('繁', 繁:[17,'0:(162,18) (186,36) (138,96) (96,144) (30,204)#1:(138,96) (420,96) (378,78) (336,96)#2:(144,138) (108,336) (84,354) (108,336) (444,336) (402,324) (366,336)#3:(138,162) (360,162) (390,138) (360,162) (330,360)#4:(192,168) (246,204) (264,228) (270,246)#5:(24,252) (462,252) (420,234) (384,252)#6:(192,252) (246,276) (264,300) (270,324)#7:(528,18) (552,30) (510,96) (474,144) (444,186)#8:(498,114) (726,114) (684,96) (648,114)#9:(654,114) (636,162) (612,216) (582,264) (546,306) (492,354) (438,390)#10:(486,132) (522,210) (552,258) (588,300) (630,336) (660,360) (714,390)#11:(312,360) (348,366) (198,456) (162,468) (198,456) (402,444)#12:(468,384) (498,396) (348,474) (150,564) (114,576) (150,564) (576,540)#13:(480,474) (552,516) (594,552) (618,588)#14:(390,552) (390,708) (378,732) (348,762) (270,702)#15:(234,594) (276,612) (192,672) (120,714) (54,744)#16:(480,606) (540,636) (618,684) (690,738)']});hzbh.flash('繁','fj/fan7');
    */
   let s = html.split("hzbh.main(");
   if let Some(s) = s.skip(1).next(){
       let mut s = s.split(");");
       if let Some(s) = s.next(){
            //println!("{}", s);
            let s = s.split("{");
            if let Some(s) = s.skip(1).next(){
                //繁:[17, '0:(x,y)..#2:(x,y)..#3..']}
                
                let mut map = s.split(":[");
                let key = map.next().unwrap();
                let mut value = map.next().unwrap().trim_right_matches("']}").split(",'");
                let count = value.next().unwrap();
                let mut string = String::from(value.next().unwrap());
                println!("汉字={}", key);
                println!("笔画数={}", count);
                let mut result = vec![];
                string.replace_range(0..2, "");
                for i in 1..count.parse().unwrap(){
                    string = string.replace(&format!("#{}:", i), "#");
                }
                let arr = string.split("#");
                
                let mut si = 0;
                for b in arr{
                    if b.trim().len() == 0{
                        continue;
                    }
                    let mut points:Vec<[i32;2]> = b.split(" ").map(|p|{
                        let xy:Vec<&str> = p.trim_right_matches(")")
                        .trim_left_matches("(").split(",").collect();
                        [xy[0].parse().unwrap(), xy[1].parse().unwrap()]
                    }).collect();
                    //如果是横(提)，只要起点和终点
                    let points = 
                    if stroke_orders.len()>si && stroke_orders[si] == 1{
                        //y最大的点为起点
                        let mut lowest = 0;
                        for pi in 0..points.len(){
                            if points[pi][1]>points[lowest][1]{
                                lowest = pi;
                            }
                        }
                        let mut newpoints = vec![points[lowest], points[points.len()-1]];
                        //如果起点x大于终点x，反过来
                        if newpoints[0][0]>newpoints[1][0]{
                            vec![newpoints[1], newpoints[0]]
                        }else{
                            newpoints
                        }
                    }else{
                        points
                    };
                    //折线中间的突起去掉
                    let mut new_points:Vec<[i32;2]> = vec![];
                    for [x, y] in points{
                        let len = new_points.len();
                        if len>=2 && new_points[len-2][0] == x &&
                                         new_points[len-2][1] == y{
                             new_points.pop();
                        }else{
                           new_points.push([x, y]);
                        }
                    }
                    //折末尾的勾去掉(如：每)
                    if stroke_orders.len()>si &&  stroke_orders[si] == 5{
                        let len = new_points.len();
                        if len>=5{
                            //最后一个点的y和倒数第3个点的y相等
                            if new_points[len-1][1] == new_points[len-3][1]{
                                new_points.pop();
                                new_points.pop();
                            }
                        }
                    }
                    //如果当前笔画是撇，【撇开头的勾去掉】
                    if stroke_orders.len()>si &&  stroke_orders[si] == 3{
                        //如果第一个点的x小于第二个点的x，删掉第一个点
                        if new_points.len()>=3 &&
                            new_points[0][0] < new_points[1][0]{
                            new_points.remove(0);
                        }
                    }
                    
                    if stroke_orders.len()>si &&  stroke_orders[si] == 4{
                        let start = new_points[0];
                        let end = new_points[new_points.len()-1];
                        let dx = (start[0]-end[0]).abs();
                        let dy = (start[1]-end[1]).abs();
                        //如果是捺(4)，起点x大于终点x且（起点和终点dx>dy），数组需要倒序（如边、逃）
                        if start[0] > end[0] && dx>dy{
                            new_points = new_points.iter().rev().cloned().collect();
                            //如果当前点y小于之前的点，前一个点y赋值为当前点的y
                            for pi in 1..new_points.len(){
                                if new_points[pi][1]<new_points[pi-1][1]{
                                    new_points[pi-1][1] = new_points[pi][1];
                                }
                            }
                            for pi in 1..new_points.len(){
                                if new_points[pi][1]<new_points[pi-1][1]{
                                    new_points[pi-1][1] = new_points[pi][1];
                                }
                            }
                        }
                        //如果是捺(4)，起点x大于终点x 且 终点y大于起点y 且（起点和终点dx<dy），图形需要反转（如：烦）
                        if start[0] > end[0] && dx<dy{
                            //middle x
                            let mx = end[0]+(start[0]-end[0])/2;
                            for point in &mut new_points{
                                let d = point[0]-mx;
                                point[0] += -d*2;
                            }
                        }
                    }

                    result.push(new_points);
                    si += 1;
                }

                return Some((key.to_string(), result));
                
            }else{
                println!("没有找到花括号");
            }
       }else{
           println!("没有找到);");
       }
   }else{
       println!("没有找到hzbh.main(");
   }
   
   None
}