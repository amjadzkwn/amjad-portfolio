(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const header = $("#site-header");
  const menuToggle = $("#menu-toggle");
  const nav = $("#nav");

  menuToggle?.addEventListener("click", () => {
    const open = menuToggle.classList.toggle("open");
    nav.classList.toggle("open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
  });

  $$(".nav a").forEach(link => link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuToggle?.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
  }));

  const sections = $$('main section[id]');
  const navLinks = $$(".nav a");
  const updateNavigation = () => {
    header?.classList.toggle("scrolled", window.scrollY > 30);
    let current = "home";
    sections.forEach(section => {
      if (window.scrollY >= section.offsetTop - 180) current = section.id;
    });
    navLinks.forEach(link => link.classList.toggle("active", link.getAttribute("href") === `#${current}`));
  };
  window.addEventListener("scroll", updateNavigation, { passive: true });
  updateNavigation();

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  $$(".reveal").forEach(el => observer.observe(el));

  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.counter || 0);
      const suffix = el.dataset.suffix || "";
      const start = performance.now();
      const duration = 1200;
      const tick = now => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = `${Math.round(target * eased)}${suffix}`;
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  }, { threshold: .6 });
  $$('[data-counter]').forEach(el => counterObserver.observe(el));

  $$(".filter-btn").forEach(button => {
    button.addEventListener("click", () => {
      $$(".filter-btn").forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      const filter = button.dataset.filter;
      $$(".project-card").forEach(card => {
        const categories = card.dataset.category?.split(" ") || [];
        card.classList.toggle("hidden-project", filter !== "all" && !categories.includes(filter));
      });
    });
  });

  if (matchMedia("(pointer:fine)").matches) {
    const glow = $(".cursor-glow");
    window.addEventListener("pointermove", e => {
      if (glow) {
        glow.style.left = `${e.clientX}px`;
        glow.style.top = `${e.clientY}px`;
      }
    }, { passive: true });

    $$(".tilt-card").forEach(card => {
      card.addEventListener("mousemove", e => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - .5;
        const y = (e.clientY - rect.top) / rect.height - .5;
        card.style.transform = `perspective(1000px) rotateX(${-y * 5}deg) rotateY(${x * 6}deg) translateY(-2px)`;
      });
      card.addEventListener("mouseleave", () => card.style.transform = "");
    });

    $$(".magnetic").forEach(el => {
      el.addEventListener("mousemove", e => {
        const rect = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - rect.left - rect.width / 2) * .12}px, ${(e.clientY - rect.top - rect.height / 2) * .12}px)`;
      });
      el.addEventListener("mouseleave", () => el.style.transform = "");
    });
  }

  const canvas = $("#particle-canvas");
  const ctx = canvas?.getContext("2d");
  let particles = [];
  let width = 0;
  let height = 0;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function resizeCanvas() {
    if (!canvas || !ctx) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    width = innerWidth;
    height = innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(95, Math.floor(width / 16));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - .5) * .18,
      vy: (Math.random() - .5) * .18,
      r: Math.random() * 1.4 + .35
    }));
  }

  function drawParticles() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    particles.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(111, 175, 255, .55)"; ctx.fill();
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 115) {
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(73, 180, 255, ${.075 * (1 - distance / 115)})`;
          ctx.stroke();
        }
      }
    });
    if (!reducedMotion) requestAnimationFrame(drawParticles);
  }

  resizeCanvas();
  drawParticles();
  window.addEventListener("resize", resizeCanvas);
  $("#year").textContent = new Date().getFullYear();
})();
