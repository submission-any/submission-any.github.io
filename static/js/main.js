/* ContactMimic project page — gallery rendering, lazy video autoplay, lightbox */
(function () {
  "use strict";

  /* ---------- helpers ---------- */
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  var GROUP_LABEL = { near: "Near keypoints", far: "Far keypoints" };

  /* ---------- build real-world gallery ---------- */
  function renderTakeCard(take, meta) {
    var card = el("div", "take");
    card.dataset.src = take.src;
    card.dataset.label = meta;
    var v = el("video");
    v.muted = true; v.loop = true; v.playsInline = true;
    v.setAttribute("preload", "none");
    v.setAttribute("playsinline", "");
    v.poster = take.poster;
    v.dataset.src = take.src;          // lazy
    card.appendChild(v);
    card.appendChild(el("span", "tlabel", "Trial " + take.take));
    card.appendChild(el("span", "play-ic", '<i class="fas fa-expand"></i>'));
    return card;
  }

  function renderRow(cond, taskName) {
    var row = el("div", "cond-row " + (cond.contact ? "is-yes" : "is-no"));
    var badge = cond.contact
      ? '<span class="badge yes">contact ✔</span>'
      : '<span class="badge no">contact ✘</span>';
    // For near/far tasks the group label already shows the distance, so the row
    // head just needs the contact badge. For sit/squat, show the posture name.
    var name = cond.dist ? "" : '<span class="cond-name">' + cond.label + "</span>";
    row.appendChild(el("div", "cond-head", name + badge));
    var takes = el("div", "takes");
    cond.takes.forEach(function (t) {
      takes.appendChild(renderTakeCard(t, taskName + " — " + cond.label + " — Trial " + t.take));
    });
    row.appendChild(takes);
    return row;
  }

  function buildGallery() {
    var root = document.getElementById("real-gallery");
    if (!root || typeof REAL_DATA === "undefined") return;

    REAL_DATA.forEach(function (task) {
      var block = el("div", "task-block");
      block.appendChild(el("h3", "task-title", task.name));
      block.appendChild(el("p", "contact-pair", "<span>Contact pair:</span> " + task.contact_pair));

      // group conditions by dist (near / far / none)
      var groups = {};
      task.conditions.forEach(function (c) {
        var k = c.dist || "_";
        (groups[k] = groups[k] || []).push(c);
      });

      ["near", "far", "_"].forEach(function (k) {
        if (!groups[k]) return;
        var g = groups[k].slice().sort(function (a, b) {
          return (a.contact === b.contact) ? 0 : (a.contact ? -1 : 1);
        });
        var grp = el("div", "cond-group");
        if (k !== "_") grp.appendChild(el("div", "group-label", GROUP_LABEL[k]));
        g.forEach(function (c) { grp.appendChild(renderRow(c, task.name)); });
        block.appendChild(grp);
      });

      root.appendChild(block);
    });
  }

  /* ---------- lazy autoplay ---------- */
  function setupLazyVideos() {
    var vids = document.querySelectorAll(".take video");
    if (!("IntersectionObserver" in window)) {
      vids.forEach(function (v) { if (v.dataset.src) { v.src = v.dataset.src; } });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) {
          if (!v.src && v.dataset.src) { v.src = v.dataset.src; }
          var p = v.play();
          if (p && p.catch) p.catch(function () {});
        } else {
          if (!v.paused) v.pause();
        }
      });
    }, { rootMargin: "200px 0px", threshold: 0.2 });
    vids.forEach(function (v) { io.observe(v); });
  }

  /* ---------- lightbox ---------- */
  function setupLightbox() {
    var lb = el("div", "lightbox");
    lb.innerHTML =
      '<button class="lb-close" aria-label="Close">&times;</button>' +
      '<div class="lb-inner"><video controls autoplay loop playsinline></video>' +
      '<div class="lb-cap"></div></div>';
    document.body.appendChild(lb);
    var lbVideo = lb.querySelector("video");
    var lbCap = lb.querySelector(".lb-cap");

    function open(src, cap) {
      lbVideo.src = src; lbCap.textContent = cap || "";
      lb.classList.add("open");
      var p = lbVideo.play(); if (p && p.catch) p.catch(function () {});
    }
    function close() { lb.classList.remove("open"); lbVideo.pause(); lbVideo.removeAttribute("src"); lbVideo.load(); }

    document.addEventListener("click", function (ev) {
      var card = ev.target.closest && ev.target.closest(".take");
      if (card && card.dataset.src) { open(card.dataset.src, card.dataset.label); }
    });
    lb.addEventListener("click", function (ev) {
      if (ev.target === lb || ev.target.classList.contains("lb-close")) close();
    });
    document.addEventListener("keydown", function (ev) { if (ev.key === "Escape") close(); });
  }

  /* ---------- bibtex copy ---------- */
  function setupCopy() {
    var btn = document.getElementById("copyBib");
    var code = document.getElementById("bibtex-code");
    if (!btn || !code) return;
    btn.addEventListener("click", function () {
      var text = code.innerText;
      var done = function () {
        btn.innerHTML = '<i class="fas fa-check"></i> Copied';
        setTimeout(function () { btn.innerHTML = '<i class="fas fa-copy"></i> Copy'; }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, done);
      } else {
        var ta = document.createElement("textarea");
        ta.value = text; document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); } catch (e) {}
        document.body.removeChild(ta); done();
      }
    });
  }

  /* ---------- scroll-spy for the floating contents panel ---------- */
  function setupScrollSpy() {
    var links = document.querySelectorAll(".toc-float a");
    if (!links.length || !("IntersectionObserver" in window)) return;
    var map = {};
    links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var sections = Object.keys(map)
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);
    function activate(id) {
      links.forEach(function (l) { l.classList.remove("active"); });
      if (map[id]) map[id].classList.add("active");
    }
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) activate(e.target.id); });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- to-top ---------- */
  function setupToTop() {
    var b = document.getElementById("toTop");
    if (!b) return;
    window.addEventListener("scroll", function () {
      if (window.scrollY > 600) b.classList.add("show"); else b.classList.remove("show");
    }, { passive: true });
    b.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
  }

  /* ---------- init ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    buildGallery();
    setupLazyVideos();
    setupLightbox();
    setupCopy();
    setupScrollSpy();
    setupToTop();
  });
})();
