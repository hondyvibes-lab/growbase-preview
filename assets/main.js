/* GrowBase（仮称） 共通スクリプト */
document.documentElement.classList.add("js");
(function () {
  var toggle = document.getElementById("menuToggle");
  var menu = document.getElementById("mobileMenu");
  if (!toggle || !menu) return;

  function setOpen(open) {
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
    menu.classList.toggle("is-open", open);
    if (open) {
      menu.removeAttribute("hidden");
    } else {
      menu.setAttribute("hidden", "");
    }
  }

  toggle.addEventListener("click", function () {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  menu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () { setOpen(false); });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      setOpen(false);
      toggle.focus();
    }
  });

  document.addEventListener("click", function (e) {
    if (toggle.getAttribute("aria-expanded") !== "true") return;
    if (!menu.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth >= 1040) setOpen(false);
  });
})();

/* スクロール時のふわっと表示（prefers-reduced-motion では即表示） */
(function () {
  var items = document.querySelectorAll(".reveal");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("is-visible"); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  items.forEach(function (el) { io.observe(el); });
})();

/* カテゴリタブ（category.html）: JSなしでは全カテゴリを縦に表示 */
(function () {
  var tabs = Array.prototype.slice.call(document.querySelectorAll("[data-cat-tab]"));
  if (!tabs.length) return;
  var panels = Array.prototype.slice.call(document.querySelectorAll("[data-cat-panel]"));
  var countEl = document.getElementById("resultCount");
  var nameEl = document.getElementById("resultName");

  function select(id, focus, push) {
    var found = false;
    tabs.forEach(function (t) {
      var on = t.getAttribute("data-cat-tab") === id;
      if (on) found = true;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
      if (on) t.scrollIntoView({ block: "nearest", inline: "nearest" });
    });
    if (!found) return select(tabs[0].getAttribute("data-cat-tab"), focus, push);
    panels.forEach(function (p) {
      var on = p.getAttribute("data-cat-panel") === id;
      p.hidden = !on;
      if (on) {
        if (countEl) countEl.textContent = p.querySelectorAll(".product").length;
        if (nameEl) nameEl.textContent = p.getAttribute("data-name");
      }
    });
    if (push && history.replaceState) history.replaceState(null, "", "#" + id);
  }

  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { select(t.getAttribute("data-cat-tab"), false, true); });
    t.addEventListener("keydown", function (e) {
      var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (e.key === "Home") { e.preventDefault(); select(tabs[0].getAttribute("data-cat-tab"), true, true); return; }
      if (e.key === "End") { e.preventDefault(); select(tabs[tabs.length - 1].getAttribute("data-cat-tab"), true, true); return; }
      if (!d) return;
      e.preventDefault();
      var n = tabs[(i + d + tabs.length) % tabs.length];
      select(n.getAttribute("data-cat-tab"), true, true);
    });
  });

  var initial = (location.hash || "").replace("#", "");
  select(initial || tabs[0].getAttribute("data-cat-tab"), false, false);
  window.addEventListener("hashchange", function () {
    select((location.hash || "").replace("#", ""), false, false);
  });
})();

/* お問い合わせフォーム（contact.html）: 送信は動かさない見本 */
(function () {
  var form = document.getElementById("contactForm");
  if (!form) return;
  var status = document.getElementById("formStatus");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (status) status.textContent = "フォームは準備中のため、送信されません（入力内容はどこにも保存・送信されていません）。";
  });
})();

/* 商品詳細（product.html）: ギャラリー切替・数量・カート（見本、何も起きない） */
(function () {
  var gallery = document.querySelector("[data-gallery]");
  if (gallery) {
    var thumbs = gallery.querySelectorAll("[data-thumb]");
    var views = gallery.querySelectorAll("[data-view]");
    thumbs.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-thumb");
        thumbs.forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
        views.forEach(function (v) {
          var on = v.getAttribute("data-view") === id;
          v.hidden = !on;
          v.classList.toggle("is-active", on);
        });
      });
    });
  }
  var qty = document.getElementById("qty");
  document.querySelectorAll("[data-qty]").forEach(function (b) {
    b.addEventListener("click", function () {
      if (!qty) return;
      var n = (parseInt(qty.value, 10) || 1) + parseInt(b.getAttribute("data-qty"), 10);
      qty.value = Math.min(9, Math.max(1, n));
    });
  });
  var buy = document.getElementById("buyForm");
  if (buy) {
    buy.addEventListener("submit", function (e) {
      e.preventDefault();
      var s = document.getElementById("cartStatus");
      if (s) s.textContent = "オンライン販売は準備中です。カートには追加されていません（見本ページのため何も起きません）。";
    });
  }
})();
