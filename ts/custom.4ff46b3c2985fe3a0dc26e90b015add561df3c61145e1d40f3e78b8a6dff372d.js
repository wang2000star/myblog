"use strict";
(() => {
  // <stdin>
  function initProgressBar() {
    const bar = document.createElement("div");
    bar.id = "reading-progress";
    document.body.prepend(bar);
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = window.scrollY;
          const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
          const progress = docHeight > 0 ? scrollTop / docHeight * 100 : 0;
          bar.style.width = `${Math.min(progress, 100)}%`;
          if (progress > 0) {
            bar.classList.add("active");
          } else {
            bar.classList.remove("active");
          }
          ticking = false;
        });
        ticking = true;
      }
    });
  }
  function initBackToTop() {
    const btn = document.createElement("button");
    btn.id = "back-to-top";
    btn.setAttribute("aria-label", "\u56DE\u5230\u9876\u90E8");
    btn.title = "\u56DE\u5230\u9876\u90E8";
    document.body.appendChild(btn);
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (window.scrollY > 400) {
            btn.classList.add("visible");
          } else {
            btn.classList.remove("visible");
          }
          ticking = false;
        });
        ticking = true;
      }
    });
    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
  function initScrollAnimations() {
    const targets = document.querySelectorAll(
      ".article-list article, .section-card, .widget, .archives, .home-intro"
    );
    if (targets.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            const delay = entry.target.dataset.animDelay ? parseInt(
              entry.target.dataset.animDelay
            ) : 0;
            setTimeout(() => {
              entry.target.classList.add("visible");
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px"
      }
    );
    targets.forEach((el, i) => {
      el.classList.add("animate-on-scroll");
      if (el.closest(".article-list")) {
        el.dataset.animDelay = String(i * 80);
      }
      observer.observe(el);
    });
  }
  function initSmoothAnchors() {
    document.addEventListener("click", (e) => {
      const target = e.target;
      const anchor = target.closest('a[href^="#"]');
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;
      const id = href.substring(1);
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
  function initTocTracking() {
    const headings = document.querySelectorAll(
      ".article-content h2, .article-content h3, .article-content h4"
    );
    const tocLinks = document.querySelectorAll("#TableOfContents a");
    if (headings.length === 0 || tocLinks.length === 0) return;
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          let current = "";
          headings.forEach((heading) => {
            const rect = heading.getBoundingClientRect();
            if (rect.top <= 100) {
              current = heading.id;
            }
          });
          tocLinks.forEach((link) => {
            const li = link.closest("li");
            if (!li) return;
            const href = link.getAttribute("href");
            if (href === `#${current}`) {
              li.classList.add("active-class");
            } else {
              li.classList.remove("active-class");
            }
          });
          ticking = false;
        });
        ticking = true;
      }
    });
  }
  function initAvatarTilt() {
    const avatar = document.querySelector(".home-intro-avatar");
    if (!avatar) return;
    avatar.addEventListener("mousemove", (e) => {
      const rect = avatar.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotateX = y / rect.height * -8;
      const rotateY = x / rect.width * 8;
      avatar.style.transform = `perspective(200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    avatar.addEventListener("mouseleave", () => {
      avatar.style.transform = "perspective(200px) rotateX(0deg) rotateY(0deg)";
    });
  }
  document.addEventListener("DOMContentLoaded", () => {
    initProgressBar();
    initBackToTop();
    initScrollAnimations();
    initSmoothAnchors();
    initTocTracking();
    initAvatarTilt();
  });
  document.addEventListener("turbo:load", () => {
    initScrollAnimations();
    initTocTracking();
    initAvatarTilt();
  });
})();
