(function startSearchLauncher() {
  "use strict";

  const form = document.getElementById("search-form");
  const input = document.getElementById("keyword");
  const searchButton = document.getElementById("search-button");
  const error = document.getElementById("error");
  const platformButtons = Array.from(document.querySelectorAll("[data-site]"));
  const installButton = document.getElementById("install-button");
  const installDialog = document.getElementById("install-dialog");
  let selectedSite = "xiaohongshu";
  let installPrompt = null;

  function normalizeKeyword(value) {
    return String(value || "").trim().replace(/\s+/g, " ").slice(0, 200);
  }

  function setSite(site) {
    if (site !== "xiaohongshu" && site !== "zhihu") return;
    selectedSite = site;
    platformButtons.forEach((button) => {
      const active = button.dataset.site === site;
      button.classList.toggle("active", active);
      button.setAttribute("aria-checked", String(active));
    });
    try { localStorage.setItem("search-only-site", site); } catch (_error) {}
    input.focus();
  }

  function buildSearchUrl(site, keyword) {
    if (site === "zhihu") {
      const url = new URL("https://www.zhihu.com/search");
      url.searchParams.set("type", "content");
      url.searchParams.set("q", keyword);
      return url.href;
    }
    const url = new URL("https://www.xiaohongshu.com/search_result");
    url.searchParams.set("keyword", keyword);
    url.searchParams.set("source", "web_explore_feed");
    return url.href;
  }

  platformButtons.forEach((button) =>
    button.addEventListener("click", () => setSite(button.dataset.site))
  );

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const keyword = normalizeKeyword(input.value);
    if (!keyword) {
      error.textContent = "请先输入搜索关键词";
      input.focus();
      return;
    }
    error.textContent = "";
    searchButton.disabled = true;
    searchButton.textContent = "前往…";
    location.assign(buildSearchUrl(selectedSite, keyword));
  });

  addEventListener("pageshow", () => {
    searchButton.disabled = false;
    searchButton.textContent = "搜索";
    input.select();
  });

  addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
  });

  installButton.addEventListener("click", async () => {
    if (installPrompt) {
      installPrompt.prompt();
      await installPrompt.userChoice;
      installPrompt = null;
      return;
    }
    if (typeof installDialog.showModal === "function") installDialog.showModal();
    else installDialog.setAttribute("open", "");
  });

  try { setSite(localStorage.getItem("search-only-site") || "xiaohongshu"); }
  catch (_error) { setSite("xiaohongshu"); }

  if ("serviceWorker" in navigator) {
    addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
  }
})();
