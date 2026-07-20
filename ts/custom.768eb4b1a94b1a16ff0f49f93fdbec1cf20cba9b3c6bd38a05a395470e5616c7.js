"use strict";
(() => {
  // <stdin>
  var Starfield = class {
    constructor() {
      this.particles = [];
      this.mouse = { x: -9999, y: -9999 };
      this.width = 0;
      this.height = 0;
      this.animationId = 0;
      this.PARTICLE_COUNT = 80;
      this.CONNECTION_DIST = 140;
      this.MOUSE_RADIUS = 160;
      this.canvas = document.createElement("canvas");
      this.canvas.id = "starfield-canvas";
      this.canvas.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;z-index:-2;pointer-events:none;";
      document.body.prepend(this.canvas);
      const ctx = this.canvas.getContext("2d");
      if (!ctx) return;
      this.ctx = ctx;
      this.resize();
      this.createParticles();
      this.bindEvents();
      this.animate();
    }
    resize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = this.width;
      this.canvas.height = this.height;
    }
    createParticles() {
      this.particles = [];
      for (let i = 0; i < this.PARTICLE_COUNT; i++) {
        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          radius: Math.random() * 2.2 + 0.8,
          opacity: Math.random() * 0.5 + 0.2,
          opacitySpeed: (Math.random() - 0.5) * 5e-3,
          baseOpacity: Math.random() * 0.5 + 0.2
        });
      }
    }
    bindEvents() {
      window.addEventListener("resize", () => {
        this.resize();
        this.createParticles();
      });
      window.addEventListener("mousemove", (e) => {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
      });
      window.addEventListener("mouseleave", () => {
        this.mouse.x = -9999;
        this.mouse.y = -9999;
      });
      const observer = new MutationObserver(() => {
      });
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-scheme"]
      });
    }
    getColors() {
      const isDark = document.documentElement.getAttribute("data-scheme") === "dark";
      const style = getComputedStyle(document.documentElement);
      if (isDark) {
        return {
          particle: "rgba(196, 163, 90, OPACITY)",
          line: "rgba(196, 163, 90, OPACITY)"
        };
      }
      return {
        particle: "rgba(58, 90, 140, OPACITY)",
        line: "rgba(58, 90, 140, OPACITY)"
      };
    }
    animate() {
      this.ctx.clearRect(0, 0, this.width, this.height);
      const colors = this.getColors();
      for (const p of this.particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.opacity += p.opacitySpeed;
        if (p.opacity > p.baseOpacity + 0.35 || p.opacity < 0.05) {
          p.opacitySpeed *= -1;
        }
        const dx = p.x - this.mouse.x;
        const dy = p.y - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.MOUSE_RADIUS && dist > 0) {
          const force = (this.MOUSE_RADIUS - dist) / this.MOUSE_RADIUS;
          const angle = Math.atan2(dy, dx);
          p.x += Math.cos(angle) * force * 1.2;
          p.y += Math.sin(angle) * force * 1.2;
        }
        if (p.x < -10) p.x = this.width + 10;
        if (p.x > this.width + 10) p.x = -10;
        if (p.y < -10) p.y = this.height + 10;
        if (p.y > this.height + 10) p.y = -10;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = colors.particle.replace(
          "OPACITY",
          p.opacity.toFixed(3)
        );
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius * 2.5, 0, Math.PI * 2);
        this.ctx.fillStyle = colors.particle.replace(
          "OPACITY",
          (p.opacity * 0.12).toFixed(3)
        );
        this.ctx.fill();
      }
      for (let i = 0; i < this.particles.length; i++) {
        for (let j = i + 1; j < this.particles.length; j++) {
          const a = this.particles[i];
          const b = this.particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < this.CONNECTION_DIST) {
            const lineOpacity = (1 - dist / this.CONNECTION_DIST) * Math.min(a.opacity, b.opacity) * 0.45;
            this.ctx.beginPath();
            this.ctx.moveTo(a.x, a.y);
            this.ctx.lineTo(b.x, b.y);
            this.ctx.strokeStyle = colors.line.replace(
              "OPACITY",
              lineOpacity.toFixed(3)
            );
            this.ctx.lineWidth = 0.6;
            this.ctx.stroke();
          }
        }
      }
      this.animationId = requestAnimationFrame(() => this.animate());
    }
    destroy() {
      cancelAnimationFrame(this.animationId);
      this.canvas.remove();
    }
  };
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
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = entry.target.dataset.animDelay ? parseInt(entry.target.dataset.animDelay) : 0;
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
    new Starfield();
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
