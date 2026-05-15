const Store = (() => {
  const PRODUCT_KEY = "sjmj_products";
  const ORDER_KEY = "sjmj_orders";
  const VERSION_KEY = "sjmj_catalog_version";
  const CATALOG_VERSION = "2026-04-27-localized-detail-catalog-v4";

  const visuals = [
    ["gift-box gold-box", "box"],
    ["citrus red-can", "mandarin ripe"],
    ["citrus green-can", "mandarin"],
    ["tea-cake", "cake"],
    ["gift-box red-festival", "box"],
    ["citrus amber-can", "mandarin ripe"],
    ["tea-cake dark-cake", "cake"],
    ["tea-cake light-cake", "cake"],
    ["gift-box soup-box", "box"],
  ];

  const catalogRows = [
    ["YMT-3000", "Yumantang Family Collector Jar 3000g", "Family collection", 328, 18, "Collector 3000g"],
    ["MY-WM250", "Honey Winter Mandarin Chenpi Pu'er 250g", "Gift-ready", 48.9, 42, "Winter Mandarin"],
    ["SY-XHG250", "Shun Yun Small Red Mandarin Pu'er 250g", "Beginner pick", 29.9, 86, "Small Red Mandarin"],
    ["CY-DHG250", "Chen Yun Big Red Mandarin Aged Tea 250g", "Aged mellow", 36.9, 52, "Big Red Mandarin"],
    ["HY-DHG250", "He Yun Big Red Mandarin Chenpi Pu'er 250g", "Balanced cup", 34.9, 64, "Harmony Red"],
    ["GY-CPRP250", "Gong Yun Chenpi Ripe Pu'er Tea 250g", "Daily tea", 24.9, 128, "Chenpi Pu'er"],
    ["2011-LTLY", "2011 Long Teng Lu Yue Heritage Tea", "Collector tea", 168, 16, "2011 Heritage"],
    ["2025-SNAKE", "Golden Snake Auspicious 2025 Zodiac Edition", "Seasonal gift", 88, 28, "2025 Zodiac"],
    ["CXSY-JH", "Chen Xiang Si Yi Chenpi Pu'er Juhong", "Citrus comfort", 22.9, 80, "Juhong Pu'er"],
    ["CXSY-PE", "Chen Xiang Si Yi Chenpi Pu'er Tea", "Aromatic series", 21.9, 94, "Classic Pu'er"],
    ["CXSY-WT", "Chen Xiang Si Yi Chenpi White Tea", "Gentle cup", 23.9, 70, "White Tea"],
    ["YSGT", "Yue Shan Golden Soup", "Culinary use", 19.9, 110, "Soup Base"],
    ["DDJD-CKCP", "Authentic Classic Chakeng Xinhui Chenpi", "Xinhui origin", 42.9, 58, "Chakeng Chenpi"],
    ["DDJD-MJCP", "Authentic Classic Meijiang Xinhui Chenpi", "Xinhui origin", 46.9, 48, "Meijiang Chenpi"],
    ["DDJD-TMCP", "Authentic Classic Tianma Xinhui Chenpi", "Xinhui origin", 45.9, 53, "Tianma Chenpi"],
    ["LJSY-10Y", "Golden Years Xinhui Chenpi 10 Years", "Aged chenpi", 96, 32, "10Y Chenpi"],
    ["LJSY-8Y", "Golden Years Xinhui Chenpi 8 Years", "Aged chenpi", 76, 38, "8Y Chenpi"],
    ["LJSY-6Y", "Golden Years Xinhui Chenpi 6 Years", "Aged chenpi", 58, 46, "6Y Chenpi"],
    ["LJSY-5Y", "Golden Years Xinhui Chenpi 5 Years", "Aged chenpi", 48, 54, "5Y Chenpi"],
    ["LJSY-3Y", "Golden Years Xinhui Chenpi 3 Years", "Aged chenpi", 32, 70, "3Y Chenpi"],
    ["STTC-ORGANIC", "Eco Origin Organic Xinhui Chenpi", "Organic orchard", 68, 36, "Organic Chenpi"],
    ["10Y-SI-JQ", "Ten-Year Chenpi Strips Jinque", "Chenpi strips", 39.9, 60, "Chenpi Strips"],
    ["TM-5Y100", "Five-Year Tianma Chenpi Jar 100g", "Jar pack", 39.9, 72, "Tianma 5Y"],
    ["MJ-5Y100-GIFT", "Five-Year Meijiang Chenpi Gift Box 100g", "Gift box", 45.9, 44, "Meijiang Gift"],
    ["XH-5Y150", "Five-Year Xinhui Chenpi Jar 150g", "Jar pack", 52.9, 62, "Xinhui 5Y"],
    ["XH-10Y250", "Ten-Year Xinhui Chenpi Gift 250g", "Premium gift", 128, 26, "10Y Gift"],
    ["TQ-S1", "Premium Tianqing Mandarin Pu'er", "Mandarin pu'er", 27.9, 88, "Tianqing Pu'er"],
    ["DG-XQG", "Dongjia Small Green Mandarin Pu'er", "Small green mandarin", 31.9, 74, "Dongjia XQG"],
    ["TM-XQG", "Tianma Small Green Mandarin Pu'er", "Small green mandarin", 33.9, 69, "Tianma XQG"],
    ["MJ-XQG", "Meijiang Small Green Mandarin Pu'er", "Small green mandarin", 35.9, 57, "Meijiang XQG"],
    ["CK-XQG", "Chakeng Small Green Mandarin Pu'er", "Small green mandarin", 34.9, 61, "Chakeng XQG"],
    ["XHG-RIPE", "Small Red Mandarin Ripe Pu'er", "Red mandarin", 29.9, 82, "Red Mandarin"],
    ["DHG-PE", "Big Red Mandarin Pu'er Tea", "Big red mandarin", 36.9, 52, "Big Red Pu'er"],
    ["DHG-LAOCHA", "Big Red Mandarin Aged Tea", "Aged mellow", 42.9, 40, "Aged Red"],
    ["PE-CAKE-357", "Chenpi Pu'er Tea Cake 357g", "Tea cake", 59, 38, "Pu'er Cake"],
    ["PE-BRICK", "Chenpi Pu'er Tea Brick", "Tea brick", 49, 46, "Tea Brick"],
    ["PE-MINI", "Mini Chenpi Pu'er Tuocha", "Mini tuocha", 18.9, 120, "Mini Tuocha"],
    ["PE-BAG", "Chenpi Pu'er Tea Bags", "Tea bags", 16.9, 150, "Tea Bags"],
    ["WT-BAG", "Chenpi White Tea Bags", "Tea bags", 17.9, 140, "White Tea Bag"],
    ["JH-BAG", "Chenpi Juhong Tea Bags", "Tea bags", 17.9, 132, "Juhong Bag"],
    ["GIFT-STARTER", "Chenpi Tea Starter Gift Set", "Starter gift", 39.9, 55, "Starter Gift"],
    ["GIFT-FAMILY", "Family Chenpi Tea Gift Set", "Family gift", 69, 30, "Family Gift"],
    ["GIFT-BUSINESS", "Business Chenpi Tea Gift Set", "Business gift", 98, 22, "Business Gift"],
    ["SAMPLE-TRIO", "Chenpi Tea Sampler Trio", "Sampler", 19.9, 100, "Sampler Trio"],
  ];

  const zhRows = [
    ["玉满堂家庭收藏罐 3000g", "家庭收藏", "收藏装 3000g"],
    ["蜜韵冬至柑陈皮普洱 250g", "适合送礼", "冬至柑"],
    ["顺韵小红柑陈皮普洱 250g", "新手推荐", "小红柑"],
    ["陈韵大红柑老陈茶 250g", "陈香醇厚", "大红柑"],
    ["和韵大红柑陈皮普洱 250g", "均衡顺口", "和韵红柑"],
    ["贡韵陈皮普洱熟茶 250g", "日常口粮", "陈皮普洱"],
    ["2011 龙腾鹿跃典藏茶", "收藏茶", "2011 典藏"],
    ["金蛇献瑞 2025 生肖纪念版", "节庆礼品", "2025 生肖"],
    ["陈香四溢陈皮普洱桔红", "柑香舒适", "桔红普洱"],
    ["陈香四溢陈皮普洱茶", "香气系列", "经典普洱"],
    ["陈香四溢陈皮白茶", "清润茶饮", "陈皮白茶"],
    ["粤膳金汤", "餐饮调味", "金汤底料"],
    ["道地经典茶坑新会陈皮", "新会产区", "茶坑陈皮"],
    ["道地经典梅江新会陈皮", "新会产区", "梅江陈皮"],
    ["道地经典天马新会陈皮", "新会产区", "天马陈皮"],
    ["流金岁月新会陈皮 10 年", "年份陈皮", "10 年陈皮"],
    ["流金岁月新会陈皮 8 年", "年份陈皮", "8 年陈皮"],
    ["流金岁月新会陈皮 6 年", "年份陈皮", "6 年陈皮"],
    ["流金岁月新会陈皮 5 年", "年份陈皮", "5 年陈皮"],
    ["流金岁月新会陈皮 3 年", "年份陈皮", "3 年陈皮"],
    ["生态原产有机新会陈皮", "有机柑园", "有机陈皮"],
    ["十年陈皮丝金雀", "陈皮丝", "陈皮丝"],
    ["五年天马陈皮罐装 100g", "罐装", "天马 5 年"],
    ["五年梅江陈皮礼盒 100g", "礼盒装", "梅江礼盒"],
    ["五年新会陈皮罐装 150g", "罐装", "新会 5 年"],
    ["十年新会陈皮礼盒 250g", "高端礼品", "10 年礼盒"],
    ["天青精品柑普茶", "柑普茶", "天青普洱"],
    ["东甲小青柑普洱", "小青柑", "东甲小青柑"],
    ["天马小青柑普洱", "小青柑", "天马小青柑"],
    ["梅江小青柑普洱", "小青柑", "梅江小青柑"],
    ["茶坑小青柑普洱", "小青柑", "茶坑小青柑"],
    ["小红柑熟普洱", "小红柑", "红柑"],
    ["大红柑普洱茶", "大红柑", "大红柑普洱"],
    ["大红柑老陈茶", "陈香醇厚", "老陈红柑"],
    ["陈皮普洱茶饼 357g", "茶饼", "普洱茶饼"],
    ["陈皮普洱茶砖", "茶砖", "普洱茶砖"],
    ["迷你陈皮普洱沱茶", "迷你沱茶", "迷你沱茶"],
    ["陈皮普洱袋泡茶", "袋泡茶", "普洱茶包"],
    ["陈皮白茶袋泡茶", "袋泡茶", "白茶茶包"],
    ["陈皮桔红袋泡茶", "袋泡茶", "桔红茶包"],
    ["陈皮茶入门礼盒", "入门礼盒", "入门礼盒"],
    ["家庭陈皮茶礼盒", "家庭分享", "家庭礼盒"],
    ["商务陈皮茶礼盒", "商务送礼", "商务礼盒"],
    ["陈皮茶三味试饮装", "试饮组合", "三味试饮"],
  ];

  const yueRows = [
    ["玉滿堂家庭收藏罐 3000g", "家庭收藏", "收藏裝 3000g"],
    ["蜜韻冬至柑陳皮普洱 250g", "送禮啱用", "冬至柑"],
    ["順韻小紅柑陳皮普洱 250g", "新手推介", "小紅柑"],
    ["陳韻大紅柑老陳茶 250g", "陳香醇厚", "大紅柑"],
    ["和韻大紅柑陳皮普洱 250g", "均衡順口", "和韻紅柑"],
    ["貢韻陳皮普洱熟茶 250g", "日常口糧", "陳皮普洱"],
    ["2011 龍騰鹿躍典藏茶", "收藏茶", "2011 典藏"],
    ["金蛇獻瑞 2025 生肖紀念版", "節慶禮品", "2025 生肖"],
    ["陳香四溢陳皮普洱桔紅", "柑香舒服", "桔紅普洱"],
    ["陳香四溢陳皮普洱茶", "香氣系列", "經典普洱"],
    ["陳香四溢陳皮白茶", "清潤茶飲", "陳皮白茶"],
    ["粵膳金湯", "餐飲調味", "金湯底料"],
    ["道地經典茶坑新會陳皮", "新會產區", "茶坑陳皮"],
    ["道地經典梅江新會陳皮", "新會產區", "梅江陳皮"],
    ["道地經典天馬新會陳皮", "新會產區", "天馬陳皮"],
    ["流金歲月新會陳皮 10 年", "年份陳皮", "10 年陳皮"],
    ["流金歲月新會陳皮 8 年", "年份陳皮", "8 年陳皮"],
    ["流金歲月新會陳皮 6 年", "年份陳皮", "6 年陳皮"],
    ["流金歲月新會陳皮 5 年", "年份陳皮", "5 年陳皮"],
    ["流金歲月新會陳皮 3 年", "年份陳皮", "3 年陳皮"],
    ["生態原產有機新會陳皮", "有機柑園", "有機陳皮"],
    ["十年陳皮絲金雀", "陳皮絲", "陳皮絲"],
    ["五年天馬陳皮罐裝 100g", "罐裝", "天馬 5 年"],
    ["五年梅江陳皮禮盒 100g", "禮盒裝", "梅江禮盒"],
    ["五年新會陳皮罐裝 150g", "罐裝", "新會 5 年"],
    ["十年新會陳皮禮盒 250g", "高端禮品", "10 年禮盒"],
    ["天青精品柑普茶", "柑普茶", "天青普洱"],
    ["東甲小青柑普洱", "小青柑", "東甲小青柑"],
    ["天馬小青柑普洱", "小青柑", "天馬小青柑"],
    ["梅江小青柑普洱", "小青柑", "梅江小青柑"],
    ["茶坑小青柑普洱", "小青柑", "茶坑小青柑"],
    ["小紅柑熟普洱", "小紅柑", "紅柑"],
    ["大紅柑普洱茶", "大紅柑", "大紅柑普洱"],
    ["大紅柑老陳茶", "陳香醇厚", "老陳紅柑"],
    ["陳皮普洱茶餅 357g", "茶餅", "普洱茶餅"],
    ["陳皮普洱茶磚", "茶磚", "普洱茶磚"],
    ["迷你陳皮普洱沱茶", "迷你沱茶", "迷你沱茶"],
    ["陳皮普洱袋泡茶", "茶包", "普洱茶包"],
    ["陳皮白茶袋泡茶", "茶包", "白茶茶包"],
    ["陳皮桔紅袋泡茶", "茶包", "桔紅茶包"],
    ["陳皮茶入門禮盒", "入門禮盒", "入門禮盒"],
    ["家庭陳皮茶禮盒", "家庭分享", "家庭禮盒"],
    ["商務陳皮茶禮盒", "商務送禮", "商務禮盒"],
    ["陳皮茶三味試飲裝", "試飲組合", "三味試飲"],
  ];

  function getKind(sku, tag, name) {
    const text = `${sku} ${tag} ${name}`.toLowerCase();
    if (text.includes("gift") || text.includes("zodiac") || text.includes("collector") || text.includes("heritage")) return "gift";
    if (text.includes("bag") || text.includes("mini") || text.includes("sampler")) return "easy";
    if (text.includes("10y") || text.includes("8y") || text.includes("6y") || text.includes("5y") || text.includes("3y") || text.includes("aged") || text.includes("chenpi strips")) return "aged";
    if (text.includes("soup")) return "culinary";
    return "daily";
  }

  function buildDescription(lang, name, tag, label, kind) {
    const copy = {
      en: {
        daily: `${name} pairs Xinhui chenpi aroma with a smooth tea base for an easy everyday cup.`,
        gift: `${name} is positioned as a more polished chenpi tea gift with stronger shelf presence.`,
        aged: `${name} highlights aged Xinhui chenpi character for buyers who care about origin and storage value.`,
        easy: `${name} is made for simple brewing, sampling, and repeat daily use.`,
        culinary: `${name} brings chenpi depth into soup, simmering, and warm kitchen use.`,
      },
      zh: {
        daily: `${name} 以新会陈皮香气搭配顺滑茶底，适合日常杯泡、饭后饮用和复购。`,
        gift: `${name} 更强调礼品陈列感与送礼体面度，适合节日、拜访和客户场景。`,
        aged: `${name} 突出新会陈皮的年份感、产区感与仓储价值，适合进阶茶客。`,
        easy: `${name} 适合轻松冲泡、试饮和日常补货，降低第一次购买门槛。`,
        culinary: `${name} 把陈皮的温润香气延伸到煲汤、煮饮和厨房调理场景。`,
      },
      yue: {
        daily: `${name} 用新會陳皮香配順滑茶底，啱日常杯泡、飯後飲同回購。`,
        gift: `${name} 更重視送禮體面同陳列感，啱節日、拜訪同客戶場合。`,
        aged: `${name} 突出新會陳皮年份感、產區感同倉儲價值，啱進階茶客。`,
        easy: `${name} 啱輕鬆沖泡、試飲同日常補貨，第一次買都易入口。`,
        culinary: `${name} 將陳皮嘅溫潤香氣帶到煲湯、煮飲同廚房調理場景。`,
      },
    };
    return copy[lang][kind] || `${name} - ${tag} - ${label}`;
  }

  function buildDetails(lang, name, tag, label, kind) {
    const templates = {
      en: {
        profile: {
          daily: "Flavor profile: warm citrus peel, mellow ripe tea, rounded aftertaste.",
          gift: "Positioning: refined packaging, clear Chinese tea story, strong gifting value.",
          aged: "Character: deeper peel aroma, smoother texture, suitable for slow tasting.",
          easy: "Use case: quick brewing, office mugs, travel packs, and first-time sampling.",
          culinary: "Use case: soup base, simmering, and warm aromatic kitchen pairings.",
        },
        brew: "Brewing: rinse once with hot water, steep repeatedly, or simmer gently for a deeper cup.",
        buyer: `Best for: ${tag.toLowerCase()} buyers looking for ${label.toLowerCase()}.`,
      },
      zh: {
        profile: {
          daily: "口感特点：柑香温润，茶底顺滑，回甘圆融，适合每天喝。",
          gift: "产品定位：包装更有礼品感，故事更容易讲清楚，适合海外送礼。",
          aged: "风味特点：陈皮香气更深，茶汤更柔和，适合慢慢品饮和收藏。",
          easy: "使用场景：办公室杯泡、旅行携带、试饮入门和日常补货都方便。",
          culinary: "使用场景：适合煲汤、煮饮、搭配日常厨房调理，香气温和不抢味。",
        },
        brew: "冲泡建议：热水快速润茶一次，再反复冲泡；想要更浓郁，也可以小火煮饮。",
        buyer: `适合人群：正在寻找「${tag}」和「${label}」的海外买家。`,
      },
      yue: {
        profile: {
          daily: "口感特點：柑香溫潤，茶底順滑，回甘圓融，啱日日飲。",
          gift: "產品定位：包裝更有禮品感，故事容易講清楚，啱海外送禮。",
          aged: "風味特點：陳皮香更深，茶湯更柔和，啱慢慢品飲同收藏。",
          easy: "使用場景：辦公室杯泡、旅行帶住、試飲入門同日常補貨都方便。",
          culinary: "使用場景：啱煲湯、煮飲、日常廚房調理，香氣溫和唔搶味。",
        },
        brew: "沖泡建議：熱水快速潤茶一次，再重複沖泡；想濃郁啲，可以細火煮飲。",
        buyer: `適合人群：想搵「${tag}」同「${label}」嘅海外買家。`,
      },
    };
    const langTemplates = templates[lang];
    return [
      langTemplates.profile[kind],
      langTemplates.brew,
      langTemplates.buyer,
    ];
  }

  const defaultProducts = catalogRows.map((row, index) => {
    const [sku, name, tag, price, stock, label] = row;
    const [zhName, zhTag, zhLabel] = zhRows[index];
    const [yueName, yueTag, yueLabel] = yueRows[index];
    const [visual, object] = visuals[index % visuals.length];
    const kind = getKind(sku, tag, name);
    return {
      id: `p${index + 1}`,
      sku: `SJMJ-${sku}`,
      price,
      compareAt: Math.round(price * 1.25 * 10) / 10,
      stock,
      status: "active",
      visual,
      object,
      family: kind,
      label: { en: label, zh: zhLabel, yue: yueLabel },
      tag: { en: tag, zh: zhTag, yue: yueTag },
      name: { en: name, zh: zhName, yue: yueName },
      desc: {
        en: buildDescription("en", name, tag, label, kind),
        zh: buildDescription("zh", zhName, zhTag, zhLabel, kind),
        yue: buildDescription("yue", yueName, yueTag, yueLabel, kind),
      },
      details: {
        en: buildDetails("en", name, tag, label, kind),
        zh: buildDetails("zh", zhName, zhTag, zhLabel, kind),
        yue: buildDetails("yue", yueName, yueTag, yueLabel, kind),
      },
    };
  });

  function read(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch (error) {
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getProducts() {
    return read(PRODUCT_KEY, defaultProducts);
  }

  async function syncFromServer() {
    if (!window.location.protocol.startsWith("http")) return getProducts();
    try {
      const response = await fetch("/api/products", { credentials: "same-origin" });
      if (!response.ok) return getProducts();
      const products = await response.json();
      if (Array.isArray(products) && products.length) {
        saveProducts(products);
        return products;
      }
    } catch (error) {
      return getProducts();
    }
    return getProducts();
  }

  function saveProducts(products) {
    write(PRODUCT_KEY, products);
  }

  function updateProduct(id, patch) {
    const products = getProducts().map((product) => (
      product.id === id ? { ...product, ...patch } : product
    ));
    saveProducts(products);
    return products;
  }

  function addProduct(product) {
    const products = getProducts();
    const created = {
      id: `custom-${Date.now()}`,
      sku: product.sku,
      price: Number(product.price || 0),
      compareAt: Number(product.compareAt || 0),
      stock: Number(product.stock || 0),
      status: product.status || "active",
      visual: product.visual || "gift-box",
      object: product.object || "box",
      label: product.label || { en: "Tea", zh: "Tea", yue: "Tea" },
      tag: product.tag || { en: "New arrival", zh: "New arrival", yue: "New arrival" },
      name: product.name,
      desc: product.desc || {
        en: "New product added from the admin backend.",
        zh: "后台新增商品，可继续补充中文详情与规格信息。",
        yue: "後台新增產品，可以繼續補充中文詳情同規格資料。",
      },
      details: product.details || {
        en: ["New product added from the admin backend.", "Add brewing notes, gifting angle, and SKU details before launch."],
        zh: ["后台新增商品。", "上线前可补充冲泡建议、送礼角度和 SKU 规格。"],
        yue: ["後台新增產品。", "上線前可補充沖泡建議、送禮角度同 SKU 規格。"],
      },
    };
    products.unshift(created);
    saveProducts(products);
    return created;
  }

  function getOrders() {
    return read(ORDER_KEY, []);
  }

  function createOrder(items, subtotal, channel = "PayPal demo") {
    const orders = getOrders();
    const order = {
      id: `SJMJ-${Date.now().toString().slice(-8)}`,
      createdAt: new Date().toISOString(),
      status: "Pending payment",
      channel,
      subtotal,
      items,
    };
    orders.unshift(order);
    write(ORDER_KEY, orders);
    if (window.location.protocol.startsWith("http")) {
      fetch("/api/orders", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, subtotal, channel }),
      }).catch(() => {});
    }
    return order;
  }

  function updateOrderStatus(id, status) {
    const orders = getOrders().map((order) => (
      order.id === id ? { ...order, status } : order
    ));
    write(ORDER_KEY, orders);
    return orders;
  }

  function resetDemoData() {
    saveProducts(defaultProducts);
    write(ORDER_KEY, []);
  }

  if (localStorage.getItem(VERSION_KEY) !== CATALOG_VERSION) {
    saveProducts(defaultProducts);
    localStorage.setItem(VERSION_KEY, CATALOG_VERSION);
  }

  return {
    defaultProducts,
    syncFromServer,
    getProducts,
    saveProducts,
    updateProduct,
    addProduct,
    getOrders,
    createOrder,
    updateOrderStatus,
    resetDemoData,
  };
})();
