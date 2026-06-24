const channels = [
  { id: "ai", name: "AI智能拓词", icon: "✦", className: "channel-ai" },
  { id: "web", name: "全网抓取", icon: "⌕", className: "channel-web" },
  { id: "competitor", name: "竞品词", icon: "⌕", className: "channel-competitor" },
  { id: "industry", name: "行业词库", icon: "⌕", className: "channel-industry" },
  { id: "synonym", name: "同义词", icon: "⌕", className: "channel-synonym" },
  { id: "trend", name: "热门趋势", icon: "⌕", className: "channel-trend" },
  { id: "qa", name: "问答平台", icon: "⌕", className: "channel-qa" },
  { id: "ecommerce", name: "电商平台", icon: "⌕", className: "channel-ecommerce" }
];

const state = {
  results: [],
  selectedIds: new Set(),
  stats: {
    removedDuplicateCount: 0,
    removedExistingCount: 0
  }
};

const storageKey = "baiduKeywordToolState.v2";

const elements = {
  seedKeywords: document.querySelector("#seedKeywords"),
  existingKeywords: document.querySelector("#existingKeywords"),
  targetCount: document.querySelector("#targetCount"),
  channelList: document.querySelector("#channelList"),
  toggleChannels: document.querySelector("#toggleChannels"),
  expandButton: document.querySelector("#expandButton"),
  exportButton: document.querySelector("#exportButton"),
  deleteButton: document.querySelector("#deleteButton"),
  clearButton: document.querySelector("#clearButton"),
  sourceFilter: document.querySelector("#sourceFilter"),
  keywordSearch: document.querySelector("#keywordSearch"),
  sortMode: document.querySelector("#sortMode"),
  selectAllRows: document.querySelector("#selectAllRows"),
  resultBody: document.querySelector("#resultBody"),
  summaryText: document.querySelector("#summaryText"),
  statusMessage: document.querySelector("#statusMessage")
};

function parseLines(value) {
  return value
    .split(/\r?\n|,|，|;|；/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function createId(item, index) {
  return `${item.keyword}-${item.source}-${index}`;
}

function renderChannels() {
  elements.channelList.innerHTML = channels
    .map((channel) => `
      <label class="channel-item">
        <input type="checkbox" name="channel" value="${channel.id}" checked>
        <span class="channel-icon ${channel.className}" aria-hidden="true">${channel.icon}</span>
        <span>${channel.name}</span>
      </label>
    `)
    .join("");
}

function getSelectedChannels() {
  return [...document.querySelectorAll('input[name="channel"]:checked')].map((input) => input.value);
}

function setStatus(message, type = "normal") {
  elements.statusMessage.textContent = message;
  elements.statusMessage.classList.toggle("error", type === "error");
}

function setLoading(isLoading) {
  document.body.classList.toggle("is-loading", isLoading);
  elements.expandButton.disabled = isLoading;
  elements.expandButton.innerHTML = isLoading
    ? '<span class="button-icon" aria-hidden="true">...</span> 拓词中'
    : '<span class="button-icon" aria-hidden="true">✦</span> 开始拓词';
}

function saveState() {
  const payload = {
    seedKeywords: elements.seedKeywords.value,
    existingKeywords: elements.existingKeywords.value,
    targetCount: elements.targetCount.value,
    checkedChannels: getSelectedChannels(),
    results: state.results,
    stats: state.stats
  };
  localStorage.setItem(storageKey, JSON.stringify(payload));
}

function restoreState() {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return;

  try {
    const payload = JSON.parse(raw);
    elements.seedKeywords.value = payload.seedKeywords ?? elements.seedKeywords.value;
    elements.existingKeywords.value = payload.existingKeywords ?? "";
    elements.targetCount.value = payload.targetCount ?? "100";
    state.results = Array.isArray(payload.results) ? payload.results : [];
    state.stats = payload.stats || state.stats;

    if (Array.isArray(payload.checkedChannels)) {
      document.querySelectorAll('input[name="channel"]').forEach((input) => {
        input.checked = payload.checkedChannels.includes(input.value);
      });
    }
  } catch {
    localStorage.removeItem(storageKey);
  }
}

function updateSourceFilter() {
  const current = elements.sourceFilter.value;
  const sources = [...new Set(state.results.map((item) => item.source))];
  elements.sourceFilter.innerHTML = '<option value="all">全部来源</option>' + sources
    .map((source) => `<option value="${escapeHtml(source)}">${escapeHtml(source)}</option>`)
    .join("");
  elements.sourceFilter.value = sources.includes(current) ? current : "all";
}

function getVisibleResults() {
  const source = elements.sourceFilter.value;
  const search = elements.keywordSearch.value.trim().toLowerCase();
  const sorted = state.results
    .filter((item) => source === "all" || item.source === source)
    .filter((item) => !search || item.keyword.toLowerCase().includes(search))
    .slice();

  if (elements.sortMode.value === "scoreAsc") {
    sorted.sort((a, b) => a.score - b.score);
  } else if (elements.sortMode.value === "keywordAsc") {
    sorted.sort((a, b) => a.keyword.localeCompare(b.keyword, "zh-Hans-CN"));
  } else {
    sorted.sort((a, b) => b.score - a.score);
  }

  return sorted;
}

function renderResults() {
  updateSourceFilter();
  const visible = getVisibleResults();
  elements.exportButton.disabled = state.results.length === 0;
  elements.clearButton.disabled = state.results.length === 0;
  elements.deleteButton.disabled = state.selectedIds.size === 0;

  if (!state.results.length) {
    elements.summaryText.textContent = "还没有结果，输入关键词后点击开始拓词。";
  } else {
    elements.summaryText.textContent = `共 ${state.results.length} 个关键词，已去重 ${state.stats.removedDuplicateCount} 个，过滤已有词 ${state.stats.removedExistingCount} 个。`;
  }

  if (!visible.length) {
    elements.resultBody.innerHTML = `
      <tr class="empty-row">
        <td colspan="9">${state.results.length ? "当前筛选条件下没有结果" : "暂无关键词结果"}</td>
      </tr>
    `;
    elements.selectAllRows.checked = false;
    elements.selectAllRows.indeterminate = false;
    return;
  }

  elements.resultBody.innerHTML = visible
    .map((item, index) => `
      <tr>
        <td class="check-col">
          <input type="checkbox" data-row-id="${escapeHtml(item.id)}" ${state.selectedIds.has(item.id) ? "checked" : ""} aria-label="选择 ${escapeHtml(item.keyword)}">
        </td>
        <td>${index + 1}</td>
        <td class="keyword-cell">${escapeHtml(item.keyword)}</td>
        <td><span class="source-pill">${escapeHtml(item.source)}</span></td>
        <td>${escapeHtml(item.category)}</td>
        <td><span class="intent-pill">${escapeHtml(item.intent)}</span></td>
        <td>${escapeHtml(item.matchType)}</td>
        <td><span class="score-pill">${item.score}</span></td>
        <td>${escapeHtml(item.reason)}</td>
      </tr>
    `)
    .join("");

  const visibleIds = visible.map((item) => item.id);
  const selectedVisibleCount = visibleIds.filter((id) => state.selectedIds.has(id)).length;
  elements.selectAllRows.checked = selectedVisibleCount === visibleIds.length;
  elements.selectAllRows.indeterminate = selectedVisibleCount > 0 && selectedVisibleCount < visibleIds.length;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function expandKeywords() {
  const seedKeywords = parseLines(elements.seedKeywords.value);
  if (!seedKeywords.length) {
    setStatus("请至少输入 1 个种子关键词。", "error");
    return;
  }

  const selectedChannels = getSelectedChannels();
  if (!selectedChannels.length) {
    setStatus("请至少选择 1 个拓词渠道。", "error");
    return;
  }

  setLoading(true);
  setStatus("正在调用拓词接口...");

  try {
    const targetCount = Math.max(10, Math.min(Number(elements.targetCount.value) || 100, 10000));
    elements.targetCount.value = String(targetCount);

    const response = await fetch("/api/keywords/expand", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        seedKeywords,
        existingKeywords: parseLines(elements.existingKeywords.value),
        targetCount,
        channels: selectedChannels
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "接口请求失败");
    }

    const data = await response.json();
    state.results = data.results.map((item, index) => ({
      ...item,
      id: createId(item, index)
    }));
    state.selectedIds.clear();
    state.stats = {
      removedDuplicateCount: data.removedDuplicateCount || 0,
      removedExistingCount: data.removedExistingCount || 0,
      targetCount: data.targetCount || targetCount,
      candidateTotal: data.candidateTotal || 0
    };

    const targetText = state.stats.targetCount ? ` / 目标 ${state.stats.targetCount}` : "";
    setStatus(`拓词完成，返回 ${state.results.length}${targetText} 个关键词。`);
    saveState();
    renderResults();
  } catch (error) {
    setStatus(error.message || "拓词失败，请稍后重试。", "error");
  } finally {
    setLoading(false);
  }
}

function exportExcel() {
  if (!state.results.length) return;

  const header = ["关键词", "来源渠道", "分类", "用户意图", "推荐匹配方式", "相关性评分", "推荐理由"];
  const rows = state.results.map((item) => [
    item.keyword,
    item.source,
    item.category,
    item.intent,
    item.matchType,
    item.score,
    item.reason
  ]);
  const tableRows = [header, ...rows]
    .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`)
    .join("");
  const workbook = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>关键词拓展结果</x:Name>
                <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
      </head>
      <body>
        <table>${tableRows}</table>
      </body>
    </html>
  `;
  const blob = new Blob(["\ufeff" + workbook], { type: "application/vnd.ms-excel;charset=utf-8" });
  const link = document.createElement("a");
  const now = new Date();
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    "_",
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0")
  ].join("");

  link.href = URL.createObjectURL(blob);
  link.download = `百度搜索广告关键词拓展结果_${stamp}.xls`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
  setStatus("Excel 文档已导出。");
}

function deleteSelected() {
  if (!state.selectedIds.size) return;
  state.results = state.results.filter((item) => !state.selectedIds.has(item.id));
  state.selectedIds.clear();
  saveState();
  renderResults();
  setStatus("已删除选中的关键词。");
}

function clearResults() {
  state.results = [];
  state.selectedIds.clear();
  state.stats = {
    removedDuplicateCount: 0,
    removedExistingCount: 0
  };
  saveState();
  renderResults();
  setStatus("结果已清空。");
}

function toggleChannels() {
  const inputs = [...document.querySelectorAll('input[name="channel"]')];
  const allChecked = inputs.every((input) => input.checked);
  inputs.forEach((input) => {
    input.checked = !allChecked;
  });
  elements.toggleChannels.textContent = allChecked ? "全选" : "取消全选";
  saveState();
}

function bindEvents() {
  elements.expandButton.addEventListener("click", expandKeywords);
  elements.exportButton.addEventListener("click", exportExcel);
  elements.deleteButton.addEventListener("click", deleteSelected);
  elements.clearButton.addEventListener("click", clearResults);
  elements.toggleChannels.addEventListener("click", toggleChannels);

  elements.resultBody.addEventListener("change", (event) => {
    const input = event.target.closest("[data-row-id]");
    if (!input) return;
    if (input.checked) {
      state.selectedIds.add(input.dataset.rowId);
    } else {
      state.selectedIds.delete(input.dataset.rowId);
    }
    renderResults();
  });

  elements.selectAllRows.addEventListener("change", () => {
    const visibleIds = getVisibleResults().map((item) => item.id);
    visibleIds.forEach((id) => {
      if (elements.selectAllRows.checked) {
        state.selectedIds.add(id);
      } else {
        state.selectedIds.delete(id);
      }
    });
    renderResults();
  });

  [elements.sourceFilter, elements.keywordSearch, elements.sortMode].forEach((element) => {
    element.addEventListener("input", renderResults);
  });

  [elements.seedKeywords, elements.existingKeywords, elements.targetCount].forEach((element) => {
    element.addEventListener("input", saveState);
  });

  elements.channelList.addEventListener("change", () => {
    const inputs = [...document.querySelectorAll('input[name="channel"]')];
    const allChecked = inputs.every((input) => input.checked);
    elements.toggleChannels.textContent = allChecked ? "取消全选" : "全选";
    saveState();
  });
}

renderChannels();
restoreState();
bindEvents();
renderResults();
