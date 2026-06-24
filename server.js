const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 4175);
const HOST = process.env.HOST || "127.0.0.1";
const ROOT = __dirname;

const channelConfig = {
  ai: {
    source: "AI智能拓词",
    category: "升学规划",
    intent: "咨询",
    matchType: "短语匹配",
    scoreBase: 96,
    patterns: [
      "{seed}规划方案",
      "{seed}怎么选择",
      "{seed}一对一咨询",
      "{seed}全流程指导",
      "{seed}避坑指南",
      "{seed}申请条件",
      "{seed}适合人群",
      "{seed}定制服务",
      "{seed}智能推荐",
      "{seed}注意事项"
    ],
    reason: "AI根据搜索意图生成，适合做核心广告词扩展"
  },
  web: {
    source: "全网抓取",
    category: "搜索长尾",
    intent: "了解",
    matchType: "智能匹配",
    scoreBase: 91,
    patterns: [
      "{seed}怎么弄",
      "{seed}需要准备什么",
      "{seed}流程",
      "{seed}时间安排",
      "{seed}经验分享",
      "{seed}最新政策",
      "{seed}常见问题",
      "{seed}入口",
      "{seed}详细步骤",
      "{seed}官方信息"
    ],
    reason: "模拟全网搜索语料抓取，偏长尾和信息检索需求"
  },
  competitor: {
    source: "竞品词",
    category: "商业转化",
    intent: "购买",
    matchType: "精确匹配",
    scoreBase: 94,
    patterns: [
      "{seed}机构",
      "{seed}哪家好",
      "{seed}服务",
      "{seed}培训班",
      "{seed}辅导机构",
      "{seed}排名",
      "{seed}价格",
      "{seed}收费标准",
      "{seed}品牌推荐",
      "{seed}在线咨询"
    ],
    reason: "模拟竞品广告词结构，偏高商业意向"
  },
  industry: {
    source: "行业词库",
    category: "行业标准",
    intent: "咨询",
    matchType: "短语匹配",
    scoreBase: 89,
    patterns: [
      "{seed}指导",
      "{seed}方案",
      "{seed}服务中心",
      "{seed}专业咨询",
      "{seed}评估",
      "{seed}系统",
      "{seed}测评",
      "{seed}报名",
      "{seed}资料",
      "{seed}课程"
    ],
    reason: "来自行业词库模板，适合补充标准品类词"
  },
  synonym: {
    source: "同义词",
    category: "近义表达",
    intent: "了解",
    matchType: "短语匹配",
    scoreBase: 86,
    patterns: [
      "{seed}替代表达",
      "{seed}相关词",
      "{seed}近义需求",
      "{seed}同类服务",
      "{seed}解决方案",
      "{seed}咨询指导",
      "{seed}服务推荐",
      "{seed}帮助",
      "{seed}顾问",
      "{seed}规划"
    ],
    reason: "通过近义表达拓展，覆盖不同搜索说法"
  },
  trend: {
    source: "热门趋势",
    category: "热点趋势",
    intent: "了解",
    matchType: "智能匹配",
    scoreBase: 88,
    patterns: [
      "2026{seed}时间",
      "2026{seed}政策",
      "2026{seed}新变化",
      "今年{seed}怎么做",
      "{seed}最新消息",
      "{seed}热点",
      "{seed}趋势",
      "{seed}时间表",
      "{seed}截止时间",
      "{seed}热门问题"
    ],
    reason: "模拟趋势词来源，适合承接季节性和热点流量"
  },
  qa: {
    source: "问答平台",
    category: "问题需求",
    intent: "咨询",
    matchType: "短语匹配",
    scoreBase: 87,
    patterns: [
      "{seed}怎么办",
      "{seed}有必要吗",
      "{seed}靠谱吗",
      "{seed}怎么收费",
      "{seed}要注意什么",
      "{seed}失败怎么办",
      "{seed}怎么提高成功率",
      "{seed}适合哪些人",
      "{seed}能解决什么问题",
      "{seed}哪里咨询"
    ],
    reason: "模拟问答平台真实提问，便于发现用户痛点"
  },
  ecommerce: {
    source: "电商平台",
    category: "购买意图",
    intent: "购买",
    matchType: "精确匹配",
    scoreBase: 90,
    patterns: [
      "{seed}服务购买",
      "{seed}套餐",
      "{seed}优惠",
      "{seed}课程价格",
      "{seed}在线服务",
      "{seed}顾问套餐",
      "{seed}预约",
      "{seed}低价",
      "{seed}付费咨询",
      "{seed}购买入口"
    ],
    reason: "模拟电商平台搜索词，偏强转化和价格比较"
  }
};

const endpointMap = {
  "/api/keywords/ai-expand": "ai",
  "/api/keywords/web-crawl": "web",
  "/api/keywords/competitor": "competitor",
  "/api/keywords/industry-library": "industry",
  "/api/keywords/synonyms": "synonym",
  "/api/keywords/trends": "trend",
  "/api/keywords/qa-platform": "qa",
  "/api/keywords/ecommerce": "ecommerce"
};

function parseLines(value) {
  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }

  if (typeof value !== "string") return [];
  return value
    .split(/\r?\n|,|，|;|；/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeKeyword(keyword) {
  return String(keyword || "")
    .trim()
    .replace(/\s+/g, "")
    .replace(/[，,。.!！?？、;；:："'“”‘’()（）【】\[\]{}]/g, "")
    .toLowerCase();
}

const regions = [
  "北京",
  "上海",
  "广州",
  "深圳",
  "杭州",
  "南京",
  "成都",
  "武汉",
  "西安",
  "重庆",
  "天津",
  "苏州",
  "郑州",
  "长沙",
  "青岛",
  "宁波",
  "佛山",
  "合肥",
  "济南",
  "厦门",
  "无锡",
  "东莞",
  "福州",
  "昆明"
];

const audiences = ["家长", "学生", "高三", "复读生", "艺考生", "本地", "线上", "一对一", "低分段", "中高分段"];
const qualifiers = ["免费", "专业", "靠谱", "精准", "快速", "官方", "最新", "高性价比", "口碑好", "附近"];
const intentSuffixes = ["咨询", "服务", "机构", "老师", "平台", "系统", "方案", "价格", "排名", "电话", "入口", "指南"];

function buildKeywordVariant(base, variantIndex) {
  if (variantIndex === 0) return base;

  const region = regions[variantIndex % regions.length];
  const audience = audiences[Math.floor(variantIndex / regions.length) % audiences.length];
  const qualifier = qualifiers[Math.floor(variantIndex / (regions.length * audiences.length)) % qualifiers.length];
  const intent = intentSuffixes[Math.floor(variantIndex / (regions.length * audiences.length * qualifiers.length)) % intentSuffixes.length];
  const mode = variantIndex % 10;

  if (mode === 0) return `${region}${base}${intent}`;
  if (mode === 1) return `${base}${region}${intent}`;
  if (mode === 2) return `${region}${base}`;
  if (mode === 3) return `${base}${region}`;
  if (mode === 4) return `${audience}${base}${intent}`;
  if (mode === 5) return `${base}${audience}${intent}`;
  if (mode === 6) return `${qualifier}${base}${region}`;
  if (mode === 7) return `${base}${qualifier}${intent}`;
  if (mode === 8) return `${region}${base}${intent}`;
  return `${qualifier}${region}${base}${audience}`;
}

function generateForChannel(channel, seedKeywords, targetCount) {
  const config = channelConfig[channel];
  const seeds = seedKeywords.length ? seedKeywords : ["高考", "志愿", "复读", "专业选择"];
  const safeTarget = Math.max(10, Math.min(Number(targetCount) || 100, 10000));
  const rows = [];
  const seen = new Set();
  let cursor = 0;
  const maxAttempts = safeTarget * 40;

  while (rows.length < safeTarget && cursor < maxAttempts) {
    const seed = seeds[cursor % seeds.length];
    const pattern = config.patterns[Math.floor(cursor / seeds.length) % config.patterns.length];
    const base = pattern.replace("{seed}", seed);
    const variantIndex = Math.floor(cursor / (seeds.length * config.patterns.length));
    const keyword = buildKeywordVariant(base, variantIndex);
    const key = normalizeKeyword(keyword);

    if (key && !seen.has(key)) {
      seen.add(key);
      const score = Math.max(60, config.scoreBase - ((rows.length + variantIndex) % 18));
      rows.push({
        keyword,
        source: config.source,
        category: config.category,
        intent: config.intent,
        matchType: config.matchType,
        score,
        reason: `${config.reason}，基于种子词"${seed}"拓展`
      });
    }

    cursor += 1;
  }

  return rows;
}

function expandKeywords(payload) {
  const seedKeywords = parseLines(payload.seedKeywords);
  const existingKeywords = new Set(parseLines(payload.existingKeywords).map(normalizeKeyword));
  const selectedChannels = Array.isArray(payload.channels) && payload.channels.length
    ? payload.channels.filter((channel) => channelConfig[channel])
    : Object.keys(channelConfig);
  const targetCount = Math.max(10, Math.min(Number(payload.targetCount) || 100, 10000));

  const seen = new Set();
  let removedDuplicateCount = 0;
  let removedExistingCount = 0;
  const results = [];

  const perChannelPool = Math.min(
    10000,
    Math.max(targetCount, Math.ceil(targetCount / Math.max(selectedChannels.length, 1)) + existingKeywords.size + 100)
  );
  const channelPools = selectedChannels.map((channel) => ({
    channel,
    items: generateForChannel(channel, seedKeywords, perChannelPool),
    cursor: 0
  }));
  const candidateTotal = channelPools.reduce((sum, pool) => sum + pool.items.length, 0);

  while (results.length < targetCount && channelPools.some((pool) => pool.cursor < pool.items.length)) {
    for (const pool of channelPools) {
      while (pool.cursor < pool.items.length) {
        const item = pool.items[pool.cursor];
        pool.cursor += 1;
        const key = normalizeKeyword(item.keyword);
        if (!key) continue;

        if (existingKeywords.has(key)) {
          removedExistingCount += 1;
          continue;
        }

        if (seen.has(key)) {
          removedDuplicateCount += 1;
          continue;
        }

        seen.add(key);
        results.push(item);
        break;
      }

      if (results.length >= targetCount) break;
    }
  }

  results.sort((a, b) => b.score - a.score || a.keyword.localeCompare(b.keyword, "zh-Hans-CN"));
  return {
    total: Math.min(results.length, targetCount),
    targetCount,
    candidateTotal,
    removedDuplicateCount,
    removedExistingCount,
    results: results.slice(0, targetCount)
  };
}

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 2_000_000) {
        reject(new Error("请求体过大"));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!data) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(data));
      } catch {
        reject(new Error("JSON 格式不正确"));
      }
    });
    req.on("error", reject);
  });
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml; charset=utf-8"
  }[ext] || "application/octet-stream";
}

function serveStatic(req, res) {
  const requestPath = decodeURIComponent(new URL(req.url, `http://${req.headers.host}`).pathname);
  const safePath = requestPath === "/" ? "/index.html" : requestPath;
  const filePath = path.normalize(path.join(ROOT, safePath));

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    res.writeHead(200, { "Content-Type": contentType(filePath) });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "POST" && url.pathname in endpointMap) {
    try {
      const payload = await readBody(req);
      const channel = endpointMap[url.pathname];
      const seedKeywords = parseLines(payload.seedKeywords);
      const targetCount = Number(payload.targetCount) || 100;
      sendJson(res, 200, {
        source: channelConfig[channel].source,
        keywords: generateForChannel(channel, seedKeywords, targetCount)
      });
    } catch (error) {
      sendJson(res, 400, { message: error.message });
    }
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/keywords/expand") {
    try {
      const payload = await readBody(req);
      sendJson(res, 200, expandKeywords(payload));
    } catch (error) {
      sendJson(res, 400, { message: error.message });
    }
    return;
  }

  if (req.method === "GET") {
    serveStatic(req, res);
    return;
  }

  sendJson(res, 405, { message: "Method not allowed" });
});

server.listen(PORT, HOST, () => {
  console.log(`百度搜索广告关键词拓展工具已启动：http://${HOST}:${PORT}`);
});
