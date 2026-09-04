/* Alphabet++ — progressive enhancement only.
   The page is fully readable with JavaScript disabled: the inline
   head script gates all hidden-by-default styling behind `.js-anim`. */
(function () {
  "use strict";

  var root = document.documentElement;
  var animate = root.classList.contains("js-anim");

  /* ---------- theme ----------
     Initial resolution happens pre-paint in the inline head script.
     This only wires the toggle. */
  var STORE = "app-theme";
  var toggle = document.getElementById("theme-toggle");

  function label() {
    if (!toggle) return;
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    toggle.setAttribute("aria-label", "Switch to " + next + " theme");
  }
  label();

  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      label();
      try { localStorage.setItem(STORE, next); } catch (e) { /* private mode */ }
    });
  }

  /* ---------- reveal on scroll ---------- */
  if (animate) {
    // Sections below the hero animate as a block; the hero staggers its children.
    Array.prototype.forEach.call(
      document.querySelectorAll(".band .wrap > *, .close .wrap > *"),
      function (el) { el.classList.add("reveal"); }
    );

    var all = document.querySelectorAll(".reveal");

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });

    Array.prototype.forEach.call(all, function (el) { io.observe(el); });

    // Hero is above the fold — release it immediately.
    requestAnimationFrame(function () {
      Array.prototype.forEach.call(
        document.querySelectorAll(".hero .reveal"),
        function (el) { el.classList.add("is-in"); }
      );
    });

    // Safety net: nothing may stay hidden because an observer never fired.
    window.setTimeout(function () {
      Array.prototype.forEach.call(all, function (el) { el.classList.add("is-in"); });
    }, 2500);
  }

  /* ---------- header shadow ---------- */
  var head = document.querySelector(".site-head");
  if (head) {
    var onScroll = function () {
      head.classList.toggle("is-stuck", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- active section in nav ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll(".site-nav a"));
  var targets = links
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  if (targets.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    targets.forEach(function (t) { spy.observe(t); });
  }
})();
