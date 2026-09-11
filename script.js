/* ==========================================================================
   Particle field — cobalt dots drifting behind the hero
   ========================================================================== */
(function particleField() {
  const canvas = document.getElementById('field');
  const ctx = canvas.getContext('2d');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let w, h, dpr;
  let particles = [];
  const COUNT_DESKTOP = 90;
  const COUNT_MOBILE = 32;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = Math.min(window.innerHeight, 900); // field only really needs to cover the hero viewport
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function seed() {
    const count = w < 700 ? COUNT_MOBILE : COUNT_DESKTOP;
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.4 + 0.4,
      speed: Math.random() * 0.25 + 0.05,
      drift: Math.random() * Math.PI * 2,
      alpha: Math.random() * 0.5 + 0.15,
    }));
  }

  function tick(t) {
    ctx.clearRect(0, 0, w, h);
    const fade = Math.max(0, 1 - (window.scrollY / (h * 0.9)));
    if (fade <= 0.01) { requestAnimationFrame(tick); return; }

    for (const p of particles) {
      const wobble = Math.sin(t * 0.0002 + p.drift) * 8;
      const y = (p.y - (t * p.speed * 0.02)) % h;
      const drawY = y < 0 ? y + h : y;
      ctx.beginPath();
      ctx.arc(p.x + wobble, drawY, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(31, 88, 242, ${p.alpha * fade})`;
      ctx.fill();
    }
    requestAnimationFrame(tick);
  }

  function init() {
    resize();
    seed();
    if (!prefersReducedMotion) {
      requestAnimationFrame(tick);
    } else {
      // static single paint, no animation loop
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(31, 88, 242, ${p.alpha})`;
        ctx.fill();
      }
    }
  }

  const scheduleInit = () => {
    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(init, { timeout: 500 });
    } else {
      setTimeout(init, 120);
    }
  };

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resize(); seed(); }, 200);
  });

  scheduleInit();
})();

/* ==========================================================================
   Nav: mobile burger + scroll shadow
   ========================================================================== */
(function nav() {
  const burger = document.querySelector('[data-burger]');
  const links = document.querySelector('.navLink');
  if (!burger) return;

  burger.addEventListener('click', () => {
    const expanded = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', String(!expanded));
    links.style.display = expanded ? 'none' : 'flex';
    links.style.position = 'fixed';
    links.style.top = '72px';
    links.style.right = '20px';
    links.style.left = '20px';
    links.style.flexDirection = 'column';
    links.style.gap = '20px';
    links.style.background = '#0d0d0f';
    links.style.border = '1px solid rgba(216,234,255,0.14)';
    links.style.borderRadius = '16px';
    links.style.padding = '24px';
  });

  links.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      burger.setAttribute('aria-expanded', 'false');
      links.style.display = 'none';
    });
  });
})();

/* ==========================================================================
   GSAP: hero entrance + scroll reveals
   ========================================================================== */
(function motion() {
  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    document.querySelectorAll('[data-reveal], [data-tl], [data-tilt]').forEach((el) => {
      el.style.opacity = 1;
      el.style.transform = 'none';
    });
    return;
  }

  // One orchestrated hero sequence on load.
  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .to('[data-reveal]', {
      opacity: 1,
      y: 0,
      duration: 1,
      stagger: 0.12,
      delay: 0.15,
    });

  // Timeline items: reveal once as the section enters.
  gsap.utils.toArray('[data-tl]').forEach((item, i) => {
    gsap.to(item, {
      opacity: 1,
      x: 0,
      duration: 0.7,
      ease: 'power2.out',
      delay: i * 0.06,
      scrollTrigger: {
        trigger: item,
        start: 'top 88%',
        once: true,
      },
    });
  });

  // Capability cards: reveal once as the grid enters.
  gsap.to('[data-tilt]', {
    opacity: 1,
    duration: 0.6,
    stagger: 0.05,
    scrollTrigger: {
      trigger: '.capability__grid',
      start: 'top 85%',
      once: true,
    },
  });

  // Projects: each fades in once as it reaches the viewport.
  gsap.utils.toArray('.project').forEach((project) => {
    gsap.from(project, {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: project,
        start: 'top 85%',
        once: true,
      },
    });
  });

  // Statement + contact: quiet fade, no slide.
  gsap.utils.toArray('.statement p, .about__grid, .contact').forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      duration: 0.9,
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        once: true,
      },
    });
  });
})();