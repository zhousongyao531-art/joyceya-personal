const video = document.querySelector(".hero-video");
const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const navMenu = document.querySelector("[data-nav-menu]");
const revealItems = document.querySelectorAll(".reveal");
const languageSwitchers = document.querySelectorAll("[data-language-switcher]");
const photoGalleries = document.querySelectorAll("[data-photo-gallery]");
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

if (video) {
  const fadeDuration = 0.5;
  let rafId = null;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const setOpacityForFrame = () => {
    if (!video.duration || Number.isNaN(video.duration)) {
      video.style.opacity = "0";
      rafId = requestAnimationFrame(setOpacityForFrame);
      return;
    }

    const current = video.currentTime;
    const remaining = video.duration - current;
    const fadeIn = clamp(current / fadeDuration, 0, 1);
    const fadeOut = clamp(remaining / fadeDuration, 0, 1);
    video.style.opacity = String(Math.min(fadeIn, fadeOut));

    if (!video.paused && !video.ended) {
      rafId = requestAnimationFrame(setOpacityForFrame);
    }
  };

  const playFromStart = () => {
    video.currentTime = 0;
    video.style.opacity = "0";
    const playPromise = video.play();

    if (playPromise) {
      playPromise
        .then(() => {
          cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(setOpacityForFrame);
        })
        .catch(() => {
          video.style.opacity = "0";
        });
    }
  };

  video.addEventListener("loadedmetadata", playFromStart, { once: true });

  video.addEventListener("play", () => {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(setOpacityForFrame);
  });

  video.addEventListener("ended", () => {
    cancelAnimationFrame(rafId);
    video.style.opacity = "0";
    window.setTimeout(playFromStart, 100);
  });

  if (video.readyState >= 1) {
    playFromStart();
  }
}

const syncHeaderState = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 12);
};

syncHeaderState();
window.addEventListener("scroll", syncHeaderState, { passive: true });

const closeMenu = () => {
  if (!menuToggle || !navMenu) return;
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation menu");
  navMenu.classList.remove("is-open");
  document.body.classList.remove("menu-open");
};

if (menuToggle && navMenu) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Open navigation menu" : "Close navigation menu");
    navMenu.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);
  });

  navMenu.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof HTMLAnchorElement) {
      closeMenu();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
}

languageSwitchers.forEach((switcher) => {
  const buttons = switcher.querySelectorAll("[data-language-button]");
  const panels = switcher.querySelectorAll("[data-language-panel]");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const language = button.getAttribute("data-language-button");

      buttons.forEach((item) => {
        item.classList.toggle("is-active", item === button);
      });

      panels.forEach((panel) => {
        panel.hidden = panel.getAttribute("data-language-panel") !== language;
      });
    });
  });
});

photoGalleries.forEach((gallery) => {
  const mainImage = gallery.querySelector("[data-photo-main]");
  const title = gallery.querySelector("[data-photo-title]");
  const caption = gallery.querySelector("[data-photo-caption]");
  const counter = gallery.querySelector("[data-photo-counter]");
  const items = Array.from(gallery.querySelectorAll("[data-photo-src]"));
  const orbitSlots = {
    "-2": { x: "-400px", y: "150px", r: "-14deg", s: "0.74" },
    "-1": { x: "-210px", y: "52px", r: "-7deg", s: "0.86" },
    "0": { x: "0px", y: "10px", r: "0deg", s: "0.96" },
    "1": { x: "210px", y: "52px", r: "7deg", s: "0.86" },
    "2": { x: "400px", y: "150px", r: "14deg", s: "0.74" },
  };

  if (!mainImage || !title || !caption || !counter) return;

  const setOrbitPosition = (activeIndex) => {
    const midpoint = Math.floor(items.length / 2);

    items.forEach((item, index) => {
      let offset = index - activeIndex;

      if (offset > midpoint) offset -= items.length;
      if (offset < -midpoint) offset += items.length;

      const slot = orbitSlots[String(offset)] || orbitSlots["0"];
      item.style.setProperty("--x", slot.x);
      item.style.setProperty("--y", slot.y);
      item.style.setProperty("--r", slot.r);
      item.style.setProperty("--s", slot.s);
    });
  };

  const setActivePhoto = (item, activeIndex) => {
    mainImage.setAttribute("src", item.getAttribute("data-photo-src"));
    mainImage.setAttribute("alt", item.getAttribute("data-photo-alt"));
    title.textContent = item.getAttribute("data-photo-title");
    caption.textContent = item.getAttribute("data-photo-caption");
    counter.textContent = item.getAttribute("data-photo-counter");
    setOrbitPosition(activeIndex);

    items.forEach((button) => {
      button.classList.toggle("is-active", button === item);
    });
  };

  items.forEach((item, index) => {
    item.addEventListener("click", () => {
      setActivePhoto(item, index);
    });
  });

  setOrbitPosition(0);
});

const readingShelf = document.querySelector("[data-reading-shelf]");

if (readingShelf) {
  const bookOrbit = readingShelf.querySelector("[data-book-orbit]");
  const bookCounter = readingShelf.querySelector("[data-book-counter]");
  const bookCover = readingShelf.querySelector("[data-book-cover]");
  const bookCoverImage = readingShelf.querySelector("[data-book-cover-image]");
  const bookIndex = readingShelf.querySelector("[data-book-index]");
  const bookCoverTitle = readingShelf.querySelector("[data-book-cover-title]");
  const bookCoverAuthor = readingShelf.querySelector("[data-book-cover-author]");
  const bookTitleEn = readingShelf.querySelector("[data-book-title-en]");
  const bookTitleZh = readingShelf.querySelector("[data-book-title-zh]");
  const bookDescriptionEn = readingShelf.querySelector("[data-book-description-en]");
  const bookDescriptionZh = readingShelf.querySelector("[data-book-description-zh]");
  const bookInsightEn = readingShelf.querySelector("[data-book-insight-en]");
  const bookInsightZh = readingShelf.querySelector("[data-book-insight-zh]");
  const bookAuthor = readingShelf.querySelector("[data-book-author]");
  const bookCategory = readingShelf.querySelector("[data-book-category]");
  const previousBook = readingShelf.querySelector("[data-book-prev]");
  const nextBook = readingShelf.querySelector("[data-book-next]");

  if (
    !bookOrbit ||
    !bookCounter ||
    !bookCover ||
    !bookCoverImage ||
    !bookIndex ||
    !bookCoverTitle ||
    !bookCoverAuthor ||
    !bookTitleEn ||
    !bookTitleZh ||
    !bookDescriptionEn ||
    !bookDescriptionZh ||
    !bookInsightEn ||
    !bookInsightZh ||
    !bookAuthor ||
    !bookCategory
  ) {
    // The shelf remains optional so other pages can reuse this script safely.
  } else {
    const books = [
      {
        id: "book-1",
        index: "01",
        titleEn: "Everyone Is a Product Manager",
        titleZh: "人人都是产品经理",
        authorEn: "Su Jie",
        authorZh: "苏杰",
        categoryEn: "Product foundations",
        categoryZh: "产品基础",
        descriptionEn:
          "A friendly introduction to product management in the context of the Chinese internet industry. It maps the full workflow from user needs and product planning to prototyping, delivery, iteration, and market operations.",
        descriptionZh:
          "国内互联网产品经理启蒙经典，贴合行业发展现状，系统讲解用户需求挖掘、产品规划、原型设计、项目推进、版本迭代与市场运营等全流程基础内容。",
        insightEn:
          "1. Built a complete view of the product role and its value boundaries.\n2. Reframed product work as solving user problems and creating business value.\n3. Established a practical foundation for requirements analysis, planning, and cross-functional collaboration.",
        insightZh:
          "1. 搭建完整职业认知：系统梳理产品经理全流程工作模块，明确岗位核心职责与价值边界。\n2. 锚定产品核心目标：理解产品工作的本质是解决用户问题、创造商业价值。\n3. 夯实从业入门基础：掌握产品从 0 到 1 的落地流程，为需求分析、产品规划和跨部门协作筑基。",
        color: "#506b9b",
        accent: "#91c8d5",
        cover: "./src/assets/books/01-everyone-is-a-product-manager.png",
      },
      {
        id: "book-2",
        index: "02",
        titleEn: "30 Lectures on Product Thinking",
        titleZh: "产品思维 30 讲",
        authorEn: "Liang Ning",
        authorZh: "梁宁",
        categoryEn: "Product foundations",
        categoryZh: "产品基础",
        descriptionEn:
          "A guide to the deeper logic beneath digital products, focusing on human nature, cognition, decision-making, context, and empathy rather than tools or delivery rituals.",
        descriptionZh:
          "聚焦产品底层思维与用户心理逻辑，从人性、认知、决策、场景和共情等维度拆解互联网产品的底层规律，帮助建立产品敏感度。",
        insightEn:
          "1. Developed a bottom-up product mindset centered on context, human needs, and decisions.\n2. Strengthened the ability to read beyond surface feedback and find latent needs.\n3. Turned mental models into support for positioning, prioritization, and requirement reviews.",
        insightZh:
          "1. 塑造底层产品思维：建立以场景、人性和用户决策为核心的底层认知。\n2. 强化用户洞察能力：穿透表层反馈，挖掘潜在诉求与真实痛点。\n3. 赋能各类产品决策：将思维模型落地于产品定位、功能取舍和需求评审。",
        color: "#8c4e55",
        accent: "#d69d83",
        cover: "./src/assets/books/02-product-thinking-30-lectures.png",
      },
      {
        id: "book-3",
        index: "03",
        titleEn: "Inspired",
        titleZh: "启示录：打造用户喜爱的产品",
        authorEn: "Marty Cagan",
        authorZh: "Marty Cagan",
        categoryEn: "Product foundations",
        categoryZh: "产品基础",
        descriptionEn:
          "A Silicon Valley product classic about discovering valuable customer needs, building products people love, and creating high-performing product teams instead of merely completing feature requests.",
        descriptionZh:
          "硅谷产品经典著作，结合顶尖产品团队实践，强调挖掘真正有价值的用户需求、打造有竞争力的产品，并建立高效产品团队。",
        insightEn:
          "1. Built a professional value system that judges iterations by user problems solved and business value created.\n2. Learned to distinguish feature completion from meaningful product advantage.\n3. Found a product logic that transfers across B2B and B2C contexts.",
        insightZh:
          "1. 建立专业价值判断体系：以解决用户痛点、落地商业价值作为迭代评判标准。\n2. 掌握爆款产品打造逻辑：区分基础功能实现与核心价值打造。\n3. 适配不同产品工作：需求研判、产品打磨和团队协作方法可迁移到 B 端与 C 端。",
        color: "#4f7c73",
        accent: "#b3d09c",
        cover: "./src/assets/books/03-inspired.png",
      },
      {
        id: "book-4",
        index: "04",
        titleEn: "User Stories Applied",
        titleZh: "用户故事与敏捷方法",
        authorEn: "Mike Cohn",
        authorZh: "Mike Cohn",
        categoryEn: "Product delivery",
        categoryZh: "产品交付",
        descriptionEn:
          "A practical guide to agile product delivery, covering user stories, requirement slicing, iteration rhythm, and communication between product, engineering, and testing teams.",
        descriptionZh:
          "聚焦互联网主流敏捷开发模式，讲解用户故事撰写、需求拆分、迭代节奏和产品与研发测试协作，解决需求落地偏差与迭代混乱。",
        insightEn:
          "1. Mastered a standardized way to write user stories and split requirements.\n2. Reduced collaboration cost by using language that engineering teams can act on.\n3. Improved delivery quality through clearer iteration rhythm and handoffs.",
        insightZh:
          "1. 掌握标准化迭代方法：熟练使用用户故事撰写和精细化需求拆分。\n2. 大幅降低协作成本：掌握研发适配的专业沟通语言，减少信息偏差和返工。\n3. 提升方案落地效率：规范迭代节奏和需求流程，保障产品方案稳定落地。",
        color: "#9b7343",
        accent: "#e2bd7c",
        cover: "./src/assets/books/04-user-stories-applied.png",
      },
      {
        id: "book-5",
        index: "05",
        titleEn: "Deep User Interviews",
        titleZh: "用户访谈：如何深度挖掘用户需求",
        authorEn: "Author not specified",
        authorZh: "作者待补充",
        categoryEn: "Research & user needs",
        categoryZh: "需求与用户研究",
        descriptionEn:
          "A hands-on user research guide for selecting participants, designing interview questions, eliciting real pain points, and turning scattered feedback into clear product needs.",
        descriptionZh:
          "聚焦需求挖掘，系统讲解访谈用户筛选、问题设计、引导表达和反馈提炼，帮助区分表层反馈、真实痛点与伪需求。",
        insightEn:
          "1. Replaced intuition-led discovery with a structured interview process.\n2. Learned to separate surface statements from deeper needs and false demand.\n3. Made user pain points a stronger basis for product iterations.",
        insightZh:
          "1. 构建科学需求挖掘体系：摆脱主观经验判断，掌握标准化用户访谈流程。\n2. 精准甄别真伪需求：拆解表层反馈与深层痛点，过滤伪需求。\n3. 提升产品迭代价值：以真实用户痛点为迭代依据，减少无效优化。",
        color: "#6d5b8e",
        accent: "#b9a4e8",
        cover: "./src/assets/books/05-deep-user-interviews.png",
      },
      {
        id: "book-6",
        index: "06",
        titleEn: "Simple and Usable",
        titleZh: "简约至上：交互式设计四策略",
        authorEn: "Giles Colborne",
        authorZh: "Giles Colborne",
        categoryEn: "Interaction design",
        categoryZh: "交互设计",
        descriptionEn:
          "A classic about making products simpler through four strategies: delete, organize, hide, and transfer. It turns feature reduction and cleaner paths into deliberate design decisions.",
        descriptionZh:
          "围绕删除、组织、隐藏、转移四大策略，解决功能冗余、界面杂乱和操作繁琐，建立少即是多的产品设计理念。",
        insightEn:
          "1. Built a stronger sense of prioritization and feature trade-offs.\n2. Learned to simplify product logic and user paths without losing core value.\n3. Kept version planning focused on the most important usage scenarios.",
        insightZh:
          "1. 建立功能取舍思维：拒绝功能堆砌，树立精简高效的产品设计理念。\n2. 优化用户操作体验：运用四大策略简化产品逻辑与操作路径。\n3. 聚焦核心场景价值：在版本规划与需求评审中精准分配资源。",
        color: "#536d62",
        accent: "#9ec8b2",
        cover: "./src/assets/books/06-simple-and-usable.png",
      },
      {
        id: "book-7",
        index: "07",
        titleEn: "The Elements of User Experience",
        titleZh: "用户体验要素",
        authorEn: "Jesse James Garrett",
        authorZh: "Jesse James Garrett",
        categoryEn: "User experience",
        categoryZh: "用户体验",
        descriptionEn:
          "A foundational model for understanding experience through five layers: strategy, scope, structure, skeleton, and surface. It connects product goals to information architecture, interaction, and visual design.",
        descriptionZh:
          "以战略层、范围层、结构层、框架层和表现层搭建完整体验模型，打通产品定位、需求范围、信息架构、交互和视觉设计。",
        insightEn:
          "1. Created a systematic five-layer view of product experience.\n2. Learned to diagnose product problems beyond surface interface polish.\n3. Turned experience improvement into a structured and reviewable process.",
        insightZh:
          "1. 系统化体验认知：建立从战略到视觉的五层产品体验架构。\n2. 全局审视产品问题：从业务、信息架构、交互和视觉多维度排查。\n3. 标准化体验优化：依托五层模型拆解方案，让优化工作可落地、可复盘。",
        color: "#49647e",
        accent: "#8eb6d2",
        cover: "./src/assets/books/07-elements-of-user-experience.png",
      },
      {
        id: "book-8",
        index: "08",
        titleEn: "Lean Analytics",
        titleZh: "精益数据分析",
        authorEn: "Alistair Croll & Benjamin Yoskovitz",
        authorZh: "Alistair Croll、Benjamin Yoskovitz",
        categoryEn: "Data & business",
        categoryZh: "数据分析与商业视角",
        descriptionEn:
          "A practical guide to using data to validate ideas, evaluate demand, and choose better iteration directions. It translates key product metrics into everyday product decisions.",
        descriptionZh:
          "结合精益创业理念，用核心指标验证产品想法、判断需求价值、优化迭代方向，帮助产品经理通过数据发现问题和捕捉用户行为规律。",
        insightEn:
          "1. Replaced opinion-first decisions with a data-driven product mindset.\n2. Learned to use core metrics to understand user behavior and validate outcomes.\n3. Made iteration reviews and trend judgments more evidence-based.",
        insightZh:
          "1. 树立数据驱动思维：摒弃主观经验决策，建立以数据为核心的产品判断逻辑。\n2. 掌握核心分析方法：通过产品指标挖掘用户行为问题，验证需求效果。\n3. 精准指导迭代方向：用数据复盘成果、预判趋势，让产品优化有据可依。",
        color: "#426f7d",
        accent: "#8ed4d1",
        cover: "./src/assets/books/08-lean-analytics.png",
      },
      {
        id: "book-9",
        index: "09",
        titleEn: "Hacking Growth",
        titleZh: "增长黑客",
        authorEn: "Sean Ellis & Morgan Brown",
        authorZh: "Sean Ellis、Morgan Brown",
        categoryEn: "Growth",
        categoryZh: "增长",
        descriptionEn:
          "A low-cost growth playbook covering acquisition, activation, retention, revenue, and referral. It connects experimentation with a full user lifecycle rather than treating growth as a campaign alone.",
        descriptionZh:
          "围绕获客、激活、留存、变现和推荐，构建完整用户增长体系，拆解低成本增长案例与实操方法，适配不同阶段的互联网产品。",
        insightEn:
          "1. Expanded product thinking from feature delivery to the full user lifecycle.\n2. Learned a lighter, more efficient growth logic for digital products.\n3. Connected product design with acquisition, retention, and monetization.",
        insightZh:
          "1. 拓展产品增长视角：建立用户全生命周期的增长运营认知。\n2. 掌握低成本增长逻辑：适配互联网产品轻量化、高效化的增长需求。\n3. 赋能商业价值落地：将增长思维融入产品设计，助力获客、留存和变现。",
        color: "#8a5a42",
        accent: "#e7ae79",
        cover: "./src/assets/books/09-hacking-growth.png",
      },
      {
        id: "book-10",
        index: "10",
        titleEn: "Traffic Pool",
        titleZh: "流量池",
        authorEn: "Yang Fei",
        authorZh: "杨飞",
        categoryEn: "Growth & business",
        categoryZh: "增长与商业",
        descriptionEn:
          "A China-focused view of traffic operations, covering public traffic acquisition, private traffic retention, brand marketing, and conversion paths for consumer products.",
        descriptionZh:
          "聚焦消费类与 ToC 互联网产品的流量运营和转化，讲解公域获客、私域沉淀、品牌营销与流量转化的完整逻辑。",
        insightEn:
          "1. Connected product thinking with traffic and conversion thinking.\n2. Built a more grounded understanding of public and private traffic in China.\n3. Learned to balance product experience with commercial conversion.",
        insightZh:
          "1. 打通产品与流量思维：建立以流量转化为导向的产品设计思路。\n2. 掌握本土流量玩法：理解国内公域与私域生态中的获客和用户沉淀。\n3. 强化产品商业属性：兼顾功能、活动、用户体系与商业转化。",
        color: "#76524c",
        accent: "#d19b84",
        cover: "./src/assets/books/10-traffic-pool.png",
      },
      {
        id: "book-11",
        index: "11",
        titleEn: "The Pyramid Principle",
        titleZh: "金字塔原理",
        authorEn: "Barbara Minto",
        authorZh: "Barbara Minto",
        categoryEn: "Structured thinking",
        categoryZh: "结构化思考",
        descriptionEn:
          "A universal toolkit for structuring ideas, documents, presentations, and communication. It helps turn fragmented information into a clear hierarchy of conclusions and supporting arguments.",
        descriptionZh:
          "结构化表达与逻辑思维经典工具书，帮助梳理混乱信息、搭建清晰逻辑框架，适用于需求文档、工作汇报、方案输出和跨部门沟通。",
        insightEn:
          "1. Built a clearer framework for organizing fragmented information.\n2. Made documents, presentations, and proposals more direct and professional.\n3. Reduced the comprehension cost of collaboration and upward reporting.",
        insightZh:
          "1. 构建结构化逻辑思维：梳理碎片化信息，建立清晰思考框架。\n2. 提升职场表达专业性：让文档、汇报和方案输出重点突出、条理清晰。\n3. 全方位提升工作效率：降低跨部门沟通和向上汇报的理解成本。",
        color: "#5b6688",
        accent: "#aebce3",
        cover: "./src/assets/books/11-pyramid-principle.png",
      },
      {
        id: "book-12",
        index: "12",
        titleEn: "Getting to Yes",
        titleZh: "谈判力",
        authorEn: "Roger Fisher & William Ury",
        authorZh: "Roger Fisher、William Ury",
        categoryEn: "Communication & negotiation",
        categoryZh: "沟通与谈判",
        descriptionEn:
          "A classic on principled negotiation that replaces adversarial bargaining with a focus on interests, options, and mutual gains in complex collaboration.",
        descriptionZh:
          "非对抗式沟通与谈判经典读物，强调在坚守核心诉求的同时平衡各方利益，适用于跨部门协作、资源争取和分歧化解。",
        insightEn:
          "1. Replaced win-lose bargaining with a more constructive, interest-based mindset.\n2. Strengthened the ability to negotiate resources and move proposals forward.\n3. Made collaboration conflicts easier to frame, discuss, and resolve.",
        insightZh:
          "1. 建立共赢沟通思维：以利益共识为核心，化解跨部门协作分歧。\n2. 提升资源争取能力：掌握专业谈判技巧，推动方案落地，减少无效妥协。\n3. 高效解决协作矛盾：把控沟通边界与核心诉求，提升团队协作效率。",
        color: "#4d6b67",
        accent: "#a4d0c0",
        cover: "./src/assets/books/12-getting-to-yes.png",
      },
    ];
    const orbitSlots = {
      "-3": { x: "-430px", y: "150px", r: "-22deg", s: "0.62", o: "0.62" },
      "-2": { x: "-330px", y: "82px", r: "-14deg", s: "0.74", o: "0.78" },
      "-1": { x: "-195px", y: "24px", r: "-8deg", s: "0.86", o: "0.92" },
      "0": { x: "0px", y: "0px", r: "0deg", s: "1.06", o: "1" },
      "1": { x: "195px", y: "24px", r: "8deg", s: "0.86", o: "0.92" },
      "2": { x: "330px", y: "82px", r: "14deg", s: "0.74", o: "0.78" },
      "3": { x: "430px", y: "150px", r: "22deg", s: "0.62", o: "0.62" },
    };
    let activeIndex = 0;

    const setOrbitPosition = () => {
      const midpoint = Math.floor(books.length / 2);
      const buttons = Array.from(bookOrbit.querySelectorAll("[data-book-id]"));

      buttons.forEach((button, index) => {
        let offset = index - activeIndex;

        if (offset > midpoint) offset -= books.length;
        if (offset < -midpoint) offset += books.length;

        const slot = orbitSlots[String(offset)];
        const isMobileShelf = window.matchMedia("(max-width: 768px)").matches;

        if (!slot && !isMobileShelf) {
          button.style.opacity = "0";
          button.style.pointerEvents = "none";
          button.setAttribute("tabindex", "-1");
          return;
        }

        const resolvedSlot = slot || orbitSlots["0"];
        button.style.setProperty("--book-x", resolvedSlot.x);
        button.style.setProperty("--book-y", resolvedSlot.y);
        button.style.setProperty("--book-r", resolvedSlot.r);
        button.style.setProperty("--book-s", resolvedSlot.s);
        button.style.opacity = isMobileShelf ? "1" : resolvedSlot.o;
        button.style.pointerEvents = "auto";
        button.removeAttribute("tabindex");
        button.style.zIndex = String(10 - Math.abs(offset));
      });
    };

    const setActiveBook = (nextIndex) => {
      activeIndex = (nextIndex + books.length) % books.length;
      const book = books[activeIndex];
      const buttons = Array.from(bookOrbit.querySelectorAll("[data-book-id]"));

      bookCounter.textContent = `${book.index} / ${String(books.length).padStart(2, "0")}`;
      bookIndex.textContent = book.index;
      bookCoverTitle.textContent = book.titleEn;
      bookCoverAuthor.textContent = book.authorEn;
      bookTitleEn.textContent = book.titleEn;
      bookTitleZh.textContent = book.titleZh;
      bookDescriptionEn.textContent = book.descriptionEn;
      bookDescriptionZh.textContent = book.descriptionZh;
      bookInsightEn.textContent = book.insightEn;
      bookInsightZh.textContent = book.insightZh;
      bookAuthor.textContent = `${book.authorEn} / ${book.authorZh}`;
      bookCategory.textContent = `${book.categoryEn} / ${book.categoryZh}`;
      bookCover.style.setProperty("--book-color", book.color);
      bookCover.style.setProperty("--book-accent", book.accent);
      bookCover.classList.toggle("has-image", Boolean(book.cover));
      bookCoverImage.hidden = !book.cover;
      if (book.cover) {
        bookCoverImage.setAttribute("src", book.cover);
        bookCoverImage.setAttribute("alt", `${book.titleEn} cover`);
      } else {
        bookCoverImage.removeAttribute("src");
        bookCoverImage.removeAttribute("alt");
      }

      buttons.forEach((button, index) => {
        button.classList.toggle("is-active", index === activeIndex);
        button.setAttribute("aria-pressed", String(index === activeIndex));
      });

      setOrbitPosition();
    };

    books.forEach((book) => {
      const button = document.createElement("button");
      const spine = document.createElement("span");
      const coverImage = document.createElement("img");
      const indexLabel = document.createElement("span");
      const titleLabel = document.createElement("span");
      const statusLabel = document.createElement("span");

      button.type = "button";
      button.className = "book-stand";
      button.dataset.bookId = book.id;
      button.setAttribute("aria-label", `Open ${book.titleEn}`);
      button.setAttribute("aria-pressed", "false");
      spine.className = "book-spine";
      if (book.cover) spine.classList.add("has-cover");
      spine.style.setProperty("--book-color", book.color);
      spine.style.setProperty("--book-accent", book.accent);
      if (book.cover) {
        coverImage.className = "book-spine-cover";
        coverImage.src = book.cover;
        coverImage.alt = "";
        coverImage.setAttribute("aria-hidden", "true");
        spine.append(coverImage);
      }
      indexLabel.className = "book-spine-index";
      indexLabel.textContent = book.index;
      titleLabel.className = "book-spine-title";
      titleLabel.textContent = book.titleEn;
      statusLabel.className = "book-spine-status";
      statusLabel.textContent = "notes";
      spine.append(indexLabel, titleLabel, statusLabel);
      button.append(spine);
      button.addEventListener("click", () => {
        setActiveBook(books.findIndex((item) => item.id === book.id));
      });
      bookOrbit.append(button);
    });

    previousBook?.addEventListener("click", () => setActiveBook(activeIndex - 1));
    nextBook?.addEventListener("click", () => setActiveBook(activeIndex + 1));
    window.addEventListener("resize", setOrbitPosition);
    setActiveBook(0);
  }
}

if (reducedMotionQuery.matches) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.14,
    }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}
