/* ==========================================================================
   Studio Plume · mouvement
   GSAP + ScrollTrigger + Lenis, tout est local (assets/vendor).
   Principes : courbes expo, transform/opacity d'abord, jamais de contenu
   caché sans JavaScript, version apaisée si prefers-reduced-motion.
   ========================================================================== */
(function () {
  'use strict';

  const doc = document;
  const root = doc.documentElement;
  const $ = (s, c) => (c || doc).querySelector(s);
  const $$ = (s, c) => Array.from((c || doc).querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  const reducedMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const hasLibs = !!(window.gsap && window.ScrollTrigger);
  const reduced = reducedMQ.matches || !hasLibs;

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  /* ------------------------------------------------------------------
     Plume : un trait unique (tige + barbes), généré en SVG
     ------------------------------------------------------------------ */
  const FEATHERS = {
    loader:   { barbs: 30, sw: 3.4 },
    mini:     { barbs: 8,  sw: 15 },
    hero:     { barbs: 30, sw: 2.6 },
    'hero-b': { barbs: 20, sw: 3.8 },
    ritual:   { barbs: 40, sw: 1.7 }
  };

  function buildFeather(svg, o) {
    const NS = 'http://www.w3.org/2000/svg';
    svg.setAttribute('viewBox', '-20 0 240 420');
    const P0 = [46, 406], P1 = [34, 214], P2 = [152, 14];
    const pt = (t) => { const u = 1 - t; return [u * u * P0[0] + 2 * u * t * P1[0] + t * t * P2[0], u * u * P0[1] + 2 * u * t * P1[1] + t * t * P2[1]]; };
    const tg = (t) => { const u = 1 - t; const x = 2 * u * (P1[0] - P0[0]) + 2 * t * (P2[0] - P1[0]); const y = 2 * u * (P1[1] - P0[1]) + 2 * t * (P2[1] - P1[1]); const l = Math.hypot(x, y); return [x / l, y / l]; };
    const paths = [];
    const add = (d, w) => {
      const p = doc.createElementNS(NS, 'path');
      p.setAttribute('d', d); p.setAttribute('pathLength', '1'); p.setAttribute('stroke-width', w);
      svg.appendChild(p); paths.push(p);
    };
    add('M' + P0 + ' Q' + P1 + ' ' + P2, (o.sw * 1.35).toFixed(2));
    const a = 52 * Math.PI / 180, b = a * 0.5;
    for (let i = 0; i < o.barbs; i++) {
      const t = 0.2 + 0.77 * (i / (o.barbs - 1));
      const p = pt(t), d = tg(t), nx = -d[1], ny = d[0];
      const prof = Math.sin(Math.PI * Math.pow((t - 0.1) / 0.92, 0.82));
      const L = 78 * Math.max(prof, 0.12);
      [-1, 1].forEach((s) => {
        const LL = L * (s < 0 ? 1 : 0.9);
        const ex = p[0] + (d[0] * Math.cos(a) + s * nx * Math.sin(a)) * LL;
        const ey = p[1] + (d[1] * Math.cos(a) + s * ny * Math.sin(a)) * LL;
        const cx = p[0] + (d[0] * Math.cos(b) + s * nx * Math.sin(b)) * LL * 0.62;
        const cy = p[1] + (d[1] * Math.cos(b) + s * ny * Math.sin(b)) * LL * 0.62;
        add('M' + p[0].toFixed(1) + ',' + p[1].toFixed(1) + ' Q' + cx.toFixed(1) + ',' + cy.toFixed(1) + ' ' + ex.toFixed(1) + ',' + ey.toFixed(1), o.sw);
      });
    }
    svg.__paths = paths;
  }
  $$('[data-feather]').forEach((svg) => buildFeather(svg, FEATHERS[svg.dataset.feather] || FEATHERS.hero));

  /* ------------------------------------------------------------------
     Découpe de texte : mots / lettres sous masque
     ------------------------------------------------------------------ */
  function split(el, mode, keepReadable) {
    if (!keepReadable) el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    const walker = doc.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    const inner = [];
    nodes.forEach((node) => {
      const frag = doc.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(doc.createTextNode(' ')); return; }
        const w = doc.createElement('span');
        w.className = 'w';
        if (!keepReadable) w.setAttribute('aria-hidden', 'true');
        if (mode === 'chars') {
          Array.from(part).forEach((ch) => { const c = doc.createElement('span'); c.className = 'wi'; c.textContent = ch; w.appendChild(c); inner.push(c); });
        } else {
          const i = doc.createElement('span'); i.className = 'wi'; i.textContent = part; w.appendChild(i); inner.push(i);
        }
        frag.appendChild(w);
      });
      node.replaceWith(frag);
    });
    return inner;
  }

  /* ------------------------------------------------------------------
     Ouvert / fermé : calculé sur l'heure de Brest (Europe/Paris)
     ------------------------------------------------------------------ */
  function parisNow() {
    const wd = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Paris', weekday: 'short' }).format(new Date());
    const hm = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
    const h = +hm.find((p) => p.type === 'hour').value, m = +hm.find((p) => p.type === 'minute').value;
    const day = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[wd];
    return { day: day, mins: h * 60 + m };
  }
  function updateOpenState() {
    const n = parisNow();
    const openDay = n.day >= 1 && n.day <= 6;
    const isOpen = openDay && n.mins >= 600 && n.mins < 1080;
    let next;
    if (openDay && n.mins < 600) next = 'à 10 h';
    else if (n.day === 6 || n.day === 0) next = 'lundi à 10 h';
    else next = 'demain à 10 h';
    const sign = $('#doorSign'), state = $('#doorState'), when = $('#doorWhen');
    const open = $('#openNow'), openText = $('#openNowText');
    if (state) state.textContent = isOpen ? 'Ouvert' : 'Fermé';
    if (when) when.textContent = isOpen ? "jusqu'à 18 h" : 'rouvre ' + next;
    if (sign) sign.classList.toggle('is-closed', !isOpen);
    if (openText) openText.textContent = isOpen ? "Ouvert maintenant · jusqu'à 18 h" : 'Fermé pour le moment · rouvre ' + next;
    if (open) open.classList.toggle('is-closed', !isOpen);
    $$('.hours tr').forEach((tr) => tr.classList.toggle('is-today', +tr.dataset.day === n.day));
  }
  updateOpenState();
  const yearEl = $('#year'); if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ------------------------------------------------------------------
     En-tête, menu mobile, avis : comportements communs
     ------------------------------------------------------------------ */
  const header = $('#header');
  const burger = $('#burger');
  const menu = $('#menu');
  let lenis = null;
  let menuOpen = false;

  function setMenu(open) {
    if (!menu || open === menuOpen) return;
    menuOpen = open;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    menu.setAttribute('aria-hidden', String(!open));
    doc.body.classList.toggle('menu-open', open);
    ['main', '.footer'].forEach((s) => { const e = $(s); if (e) e.inert = open; });
    if (open) { menu.inert = false; header.classList.remove('is-hidden'); if (lenis) lenis.stop(); }
    else if (lenis) lenis.start();
    const links = $$('li a, .menu__foot a', menu);
    if (hasLibs && !reducedMQ.matches) {
      if (open) {
        menu.classList.add('is-open');
        gsap.fromTo(menu, { clipPath: 'circle(0% at calc(100% - 3rem) 2.2rem)' }, { clipPath: 'circle(150% at calc(100% - 3rem) 2.2rem)', duration: 1, ease: 'expo.inOut' });
        gsap.fromTo(links, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.1, ease: 'expo.out', stagger: 0.06, delay: 0.25 });
        setTimeout(() => links[0] && links[0].focus({ preventScroll: true }), 350);
      } else {
        gsap.to(menu, { clipPath: 'circle(0% at calc(100% - 3rem) 2.2rem)', duration: 0.7, ease: 'expo.inOut', onComplete: () => { menu.classList.remove('is-open'); menu.inert = true; } });
      }
    } else {
      menu.classList.toggle('is-open', open);
      menu.style.clipPath = open ? 'none' : '';
      if (!open) menu.inert = true;
      if (open && links[0]) links[0].focus({ preventScroll: true });
    }
  }
  if (burger) {
    burger.addEventListener('click', () => setMenu(!menuOpen));
    doc.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuOpen) { setMenu(false); burger.focus(); } });
  }

  // Ancres : défilement fluide (Lenis) ou natif
  doc.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const target = $(id);
    if (!target) return;
    e.preventDefault();
    const go = () => {
      if (lenis) lenis.scrollTo(target, { offset: id === '#top' ? 0 : -(header.offsetHeight + 8), duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 4) });
      else target.scrollIntoView({ behavior: reducedMQ.matches ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', id);
    };
    if (menuOpen) { setMenu(false); setTimeout(go, 500); } else go();
  });

  // Carrousel d'avis
  (function reviews() {
    const stage = $('#reviewStage'); if (!stage) return;
    const slides = $$('.review', stage), dots = $$('.dot'), section = $('#avis');
    const prev = $('#rPrev'), next = $('#rNext'), pauseBtn = $('#rPause');
    const DUR = 8000;
    let cur = 0, timer = null, paused = reduced, inView = false, hovering = false;
    const words = slides.map((s) => reduced ? [] : split($('blockquote p', s), 'words', true));
    section.style.setProperty('--dur', DUR + 'ms');

    function clearTimer() { clearTimeout(timer); timer = null; }
    function schedule() {
      clearTimer();
      dots.forEach((d) => d.classList.remove('is-playing'));
      if (paused || !inView || hovering) return;
      void dots[cur].offsetWidth;
      dots[cur].classList.add('is-playing');
      timer = setTimeout(() => go(cur + 1), DUR);
    }
    function go(i, user) {
      const n = (i + slides.length) % slides.length;
      if (n === cur && slides[cur].classList.contains('is-active')) { schedule(); return; }
      const out = slides[cur], inn = slides[n];
      const dir = (n > cur || (cur === slides.length - 1 && n === 0)) ? 1 : -1;
      cur = n;
      dots.forEach((d, k) => { d.classList.toggle('is-active', k === cur); d.classList.remove('is-playing'); d.setAttribute('aria-current', k === cur ? 'true' : 'false'); });
      if (hasLibs && !reducedMQ.matches) {
        gsap.to(out, { opacity: 0, y: -24 * dir, duration: 0.55, ease: 'power2.in', onComplete: () => { out.classList.remove('is-active'); gsap.set(out, { clearProps: 'all' }); } });
        inn.classList.add('is-active');
        gsap.fromTo(inn, { opacity: 0 }, { opacity: 1, duration: 0.5, delay: 0.3 });
        gsap.fromTo(words[cur], { yPercent: 105 }, { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.012, delay: 0.3 });
        gsap.fromTo($('figcaption', inn), { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 1, ease: 'expo.out', delay: 0.7 });
      } else {
        out.classList.remove('is-active'); inn.classList.add('is-active');
      }
      schedule();
    }
    prev.addEventListener('click', () => go(cur - 1, true));
    next.addEventListener('click', () => go(cur + 1, true));
    dots.forEach((d, k) => d.addEventListener('click', () => go(k, true)));
    stage.parentElement.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { go(cur + 1, true); } else if (e.key === 'ArrowLeft') { go(cur - 1, true); }
    });
    function setPaused(p) {
      paused = p; section.classList.toggle('is-paused', p);
      pauseBtn.setAttribute('aria-pressed', String(p));
      pauseBtn.setAttribute('aria-label', p ? 'Reprendre le défilement des avis' : 'Mettre le défilement des avis en pause');
      schedule();
    }
    pauseBtn.addEventListener('click', () => setPaused(!paused));
    section.addEventListener('pointerenter', () => { hovering = true; clearTimer(); section.classList.add('is-paused'); });
    section.addEventListener('pointerleave', () => { hovering = false; section.classList.toggle('is-paused', paused); schedule(); });
    section.addEventListener('focusin', () => { hovering = true; clearTimer(); });
    section.addEventListener('focusout', () => { hovering = false; schedule(); });
    // swipe tactile
    let x0 = null;
    stage.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', (e) => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) go(cur + (dx < 0 ? 1 : -1), true); x0 = null; }, { passive: true });
    new IntersectionObserver((en) => { inView = en[0].isIntersecting; schedule(); }, { threshold: 0.35 }).observe(section);
    if (reduced) { paused = true; section.classList.add('is-paused'); pauseBtn.setAttribute('aria-pressed', 'true'); pauseBtn.setAttribute('aria-label', 'Reprendre le défilement des avis'); }
  })();

  // Le bouton « Appeler » s'efface quand le numéro est déjà affiché (appel à l'action, pied de page)
  (function fab() {
    const hide = new Set();
    const io = new IntersectionObserver((en) => {
      en.forEach((e) => { if (e.isIntersecting) hide.add(e.target); else hide.delete(e.target); });
      doc.body.classList.toggle('fab-hidden', hide.size > 0);
    }, { threshold: 0.25 });
    ['.cta', '.footer', '.hero'].forEach((s) => { const el = $(s); if (el) io.observe(el); });
  })();

  // Header : se cache à la descente, revient à la montée
  function headerBehaviour(ST) {
    let last = 0;
    ST.create({
      start: 0, end: 'max',
      onUpdate: (self) => {
        const y = self.scroll();
        header.classList.toggle('is-scrolled', y > 30);
        if (menuOpen) return;
        if (y > 320 && y > last + 4) header.classList.add('is-hidden');
        else if (y < last - 4 || y < 320) header.classList.remove('is-hidden');
        last = y;
      }
    });
  }

  /* ------------------------------------------------------------------
     Version apaisée (mouvement réduit ou bibliothèques absentes)
     ------------------------------------------------------------------ */
  if (reduced) {
    root.classList.add('no-motion');
    const l = $('#loader'); if (l) l.remove();
    if (hasLibs) { gsap.registerPlugin(ScrollTrigger); headerBehaviour(ScrollTrigger); }
    else {
      let last = 0;
      window.addEventListener('scroll', () => { const y = window.scrollY; header.classList.toggle('is-scrolled', y > 30); if (y > 320 && y > last + 4) header.classList.add('is-hidden'); else if (y < last - 4 || y < 320) header.classList.remove('is-hidden'); last = y; }, { passive: true });
    }
    return;
  }

  /* ==================================================================
     MOUVEMENT COMPLET
     ================================================================== */
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  gsap.defaults({ ease: 'expo.out' });

  // Défilement fluide
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();

  headerBehaviour(ScrollTrigger);
  gsap.to('#progress span', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.25 } });

  // Vitesse de défilement (px/s), lissée : pilote le bandeau et le balancement des étiquettes
  let lastY = window.scrollY, vel = 0, flip = 1, flipS = 1;
  const marquees = [];
  const swingers = [];
  let swingOn = false;
  gsap.ticker.add((time, dtMs) => {
    const dt = Math.max(dtMs, 1) / 1000;
    const y = window.scrollY;
    vel += (((y - lastY) / dt) - vel) * 0.12;
    lastY = y;
    if (vel > 40) flip = 1; else if (vel < -40) flip = -1;
    flipS += (flip - flipS) * 0.07;
    const boost = Math.min(Math.abs(vel) * 0.32, 1100);
    for (let i = 0; i < marquees.length; i++) {
      const m = marquees[i];
      if (!m.visible) continue;
      m.x += m.dir * flipS * (55 + boost) * dt;
      if (m.x <= -m.gw) m.x += m.gw; else if (m.x > 0) m.x -= m.gw;
      m.track.style.transform = 'translate3d(' + m.x.toFixed(2) + 'px,0,0)';
    }
    if (swingOn) { const r = clamp(-vel * 0.0036, -7, 7); for (let i = 0; i < swingers.length; i++) swingers[i](r); }
  });

  /* ---- Bandeaux défilants : groupes clonés pour remplir la largeur ---- */
  $$('.marquee__row').forEach((row) => {
    const track = $('.marquee__track', row);
    const group = doc.createElement('div'); group.className = 'marquee__group';
    while (track.firstChild) group.appendChild(track.firstChild);
    track.appendChild(group);
    const m = { track: track, x: 0, gw: 1, dir: +row.dataset.dir || -1, visible: false };
    const fill = () => {
      $$('.marquee__group', track).slice(1).forEach((g) => g.remove());
      m.gw = group.getBoundingClientRect().width || 1;
      const n = Math.ceil(window.innerWidth * 2 / m.gw) + 1;
      for (let k = 0; k < n; k++) track.appendChild(group.cloneNode(true));
      if (m.x < -m.gw) m.x = 0;
    };
    fill();
    marquees.push(m);
    new IntersectionObserver((en) => { m.visible = en[0].isIntersecting; }, { rootMargin: '100px' }).observe(row);
    window.addEventListener('resize', () => { clearTimeout(m.rt); m.rt = setTimeout(fill, 250); });
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(fill);
  });

  /* ---- Découpes de texte ---- */
  const heroChars = split($('.hero__title'), 'chars');
  const titleWords = $$('[data-split="words"]').map((el) => ({ el: el, inner: split(el, 'words') }));

  /* ---- États initiaux de l'intro (cachés derrière le préchargeur) ---- */
  const win = $('.window__glass', $('.hero'));
  const winImg = $('.window__img');
  gsap.set(heroChars, { yPercent: 118 });
  gsap.set('[data-hero-in]', { opacity: 0, y: 34 });
  gsap.set('.hero__disc', { scale: 0 });
  gsap.set('.hero__sun', { scale: 0.6, opacity: 0 });
  gsap.set(win, { clipPath: 'circle(0% at 50% 62%)' });
  gsap.set(winImg, { scale: 1.3 });
  gsap.set('.door-sign', { y: -170, rotation: 12 });
  gsap.set('.hero .feather', { opacity: 1 });
  $$('.hero .feather').forEach((f) => gsap.set(f.__paths, { strokeDashoffset: 1 }));
  gsap.set(header, { yPercent: -110 });

  function heroIn() {
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.to('.hero__sun', { scale: 1, opacity: 1, duration: 2.2 }, 0)
      .to('.hero__disc', { scale: 1, duration: 2 }, 0.1)
      .to(heroChars, { yPercent: 0, duration: 1.5, stagger: 0.05 }, 0.05)
      .to(win, { clipPath: 'circle(78% at 50% 55%)', duration: 1.8, ease: 'expo.inOut', onComplete: () => gsap.set(win, { clearProps: 'clipPath' }) }, 0.15)
      .to(winImg, { scale: 1.03, duration: 3.6, ease: 'power2.out' }, 0.15)
      .to('[data-hero-in]', { opacity: 1, y: 0, duration: 1.3, stagger: 0.14 }, 0.55)
      .to(header, { yPercent: 0, duration: 1.3, onComplete: () => gsap.set(header, { clearProps: 'transform' }) }, 0.4)
      .to('.door-sign', { y: 0, rotation: 0, duration: 2.2, ease: 'elastic.out(1, 0.42)' }, 1.0);
    $$('.hero .feather').forEach((f, i) => tl.to(f.__paths, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut', stagger: 0.012 }, 0.7 + i * 0.25));
    return tl;
  }

  /* ---- Préchargeur : le néon s'allume, le store se relève ---- */
  const loader = $('#loader');
  const intro = (function () {
    const core = $('.neon--core', loader), glow = $('.neon--glow', loader), sub = $('.loader__sub', loader);
    const lf = $('.loader__feather', loader).__paths;
    gsap.set(lf, { strokeDashoffset: 1 });
    gsap.set([core, glow], { opacity: 0 });
    gsap.set(sub, { opacity: 0, y: 14 });
    const tl = gsap.timeline({ paused: true });
    tl.to(lf, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut', stagger: 0.012 }, 0)
      .to([core, glow], { opacity: 1, duration: 0.07, ease: 'none' }, 0.35)
      .to([core, glow], { opacity: 0.12, duration: 0.06, ease: 'none' }, 0.5)
      .to([core, glow], { opacity: 1, duration: 0.05, ease: 'none' }, 0.58)
      .to([core, glow], { opacity: 0.35, duration: 0.05, ease: 'none' }, 0.72)
      .to([core, glow], { opacity: 1, duration: 0.35, ease: 'power1.out' }, 0.8)
      .to(sub, { opacity: 0.85, y: 0, duration: 0.8 }, 0.95)
      .to(loader, { y: () => -(window.innerHeight + 60), duration: 1.25, ease: 'expo.inOut' }, 1.75)
      .add(heroIn(), 2.05)
      .add(() => {
        loader.style.display = 'none';
        root.classList.add('is-ready');
        lenis.start();
        ScrollTrigger.refresh();
      }, 3.1);
    // Un clic ou une touche accélère l'ouverture
    const speedUp = () => tl.timeScale(3);
    loader.addEventListener('click', speedUp);
    doc.addEventListener('keydown', speedUp, { once: true });
    return tl;
  })();
  // Filet de sécurité : jamais bloqué derrière le préchargeur
  setTimeout(() => { if (loader && loader.style.display !== 'none') intro.progress(1); }, 7000);

  const startIntro = () => intro.play();
  if (doc.fonts && doc.fonts.ready) {
    Promise.race([doc.fonts.ready, new Promise((r) => setTimeout(r, 1500))]).then(startIntro);
  } else startIntro();

  /* ------------------------------------------------------------------
     Hero : parallax multicouche
     ------------------------------------------------------------------ */
  const hero = $('.hero');
  $$('[data-parallax]').forEach((el) => {
    const f = parseFloat(el.dataset.parallax);
    gsap.to(el, { y: () => f * hero.offsetHeight * 1.1, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });
  });
  gsap.to(winImg, { yPercent: 7, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__title', { yPercent: -10, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });

  /* ------------------------------------------------------------------
     Titres, paragraphes, révélations génériques
     ------------------------------------------------------------------ */
  titleWords.forEach((t) => {
    gsap.set(t.inner, { yPercent: 118 });
    ScrollTrigger.create({
      trigger: t.el, start: 'top 90%', once: true,
      onEnter: () => gsap.to(t.inner, { yPercent: 0, duration: 1.4, stagger: 0.075 })
    });
  });
  $$('[data-fade]').forEach((el) => {
    gsap.from(el, { opacity: 0, y: 36, duration: 1.3, scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
  });

  /* ------------------------------------------------------------------
     Zone desktop : sections pinnées. Zone mobile : versions simples.
     ------------------------------------------------------------------ */
  const mm = gsap.matchMedia();

  mm.add('(min-width: 900px)', () => {
    const ritual = $('.ritual');
    const shop = $('.shop');
    ritual.classList.add('is-pinned');
    shop.classList.add('is-horizontal');

    /* ---- Le rituel : section pinnée, 4 temps ---- */
    const steps = $$('.step', ritual);
    const imgs = $$('.stage__img', ritual);
    const stepsBox = $('.steps', ritual);
    const setHeight = () => { stepsBox.style.height = Math.max.apply(null, steps.map((s) => s.offsetHeight)) + 'px'; };
    setHeight();
    steps.forEach((s, i) => { s.classList.toggle('is-current', i === 0); gsap.set(s, { opacity: i === 0 ? 1 : 0, y: i === 0 ? 0 : 50 }); });
    const feather = $('.ritual__feather', ritual).__paths;
    gsap.set(feather, { strokeDashoffset: 1 });
    gsap.set(imgs[1], { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.3 });
    gsap.set(imgs[2], { clipPath: 'circle(0% at 50% 55%)', scale: 1.3 });
    gsap.set(imgs[3], { clipPath: 'inset(0% 100% 0% 0%)', scale: 1.3 });
    gsap.set(imgs[0], { scale: 1.3 });

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: ritual, pin: $('.ritual__pin', ritual), start: 'top top', end: () => '+=' + Math.round(window.innerHeight * 3.6), scrub: 0.7, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: (self) => { const idx = Math.min(3, Math.floor(self.progress * 3.4 + 0.12)); steps.forEach((s, i) => s.classList.toggle('is-current', i === idx)); } }
    });
    tl.to('.rail__fill', { scaleY: 1, duration: 3.6 }, 0)
      .to(feather, { strokeDashoffset: 0, duration: 3.2, stagger: 0.02 }, 0)
      .fromTo('.ritual__glow', { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1.1, duration: 2.4, ease: 'power2.out' }, 0.2)
      .to(imgs[0], { scale: 1.12, duration: 1.2 }, 0);
    steps.forEach((s, i) => {
      if (!i) return;
      tl.to(steps[i - 1], { opacity: 0, y: -46, duration: 0.35, ease: 'power2.in' }, i - 0.12)
        .to(s, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, i + 0.12)
        .to(imgs[i], { clipPath: i === 2 ? 'circle(80% at 50% 55%)' : 'inset(0% 0% 0% 0%)', scale: 1.1, duration: 0.8, ease: 'power3.inOut' }, i - 0.1);
    });
    tl.to({}, { duration: 0.5 }, 3.1);

    /* ---- Les soins : défilement horizontal piloté par le scroll ---- */
    const track = $('.shop__track', shop);
    const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
    const tags = $$('.tag', shop);
    const swing = tags.map((t) => { gsap.set(t, { transformOrigin: '50% 0%' }); return gsap.quickTo(t, 'rotation', { duration: 1.1, ease: 'elastic.out(1, 0.5)' }); });
    swing.forEach((f) => swingers.push(f));
    const fillBar = $('.shop__progress span', shop);
    gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: { trigger: shop, pin: $('.shop__pin', shop), start: 'top top', end: () => '+=' + dist(), scrub: 0.9, invalidateOnRefresh: true, anticipatePin: 1,
        onToggle: (self) => { swingOn = self.isActive; if (!self.isActive) swingers.forEach((f) => f(0)); },
        onUpdate: (self) => gsap.set(fillBar, { scaleX: self.progress }) }
    });
    gsap.from(tags, { opacity: 0, y: 70, duration: 1.4, stagger: 0.12, scrollTrigger: { trigger: shop, start: 'top 60%', once: true } });

    return () => { ritual.classList.remove('is-pinned'); shop.classList.remove('is-horizontal'); stepsBox.style.height = ''; swingers.length = 0; swingOn = false; };
  });

  mm.add('(max-width: 899px)', () => {
    $$('.step').forEach((s) => gsap.from(s, { opacity: 0, y: 46, duration: 1.2, scrollTrigger: { trigger: s, start: 'top 88%', once: true } }));
    $$('.tag').forEach((t) => gsap.from(t, { opacity: 0, x: 40, duration: 1.2, scrollTrigger: { trigger: t, start: 'left 95%', horizontal: false, once: true } }));
  });

  /* ------------------------------------------------------------------
     Chiffres : compteurs animés + soulignement qui se trace
     ------------------------------------------------------------------ */
  $$('.count').forEach((c) => {
    const to = +c.dataset.to, val = $('.count__val', c), o = { v: 0 };
    val.textContent = '0';
    gsap.set(c, { '--u': 0 });
    ScrollTrigger.create({
      trigger: c, start: 'top 88%', once: true,
      onEnter: () => {
        gsap.to(o, { v: to, duration: 2.4, ease: 'power3.out', onUpdate: () => { val.textContent = Math.round(o.v); } });
        gsap.to(c, { '--u': 1, duration: 1.6, delay: 0.5 });
      }
    });
  });
  $$('.figures__line').forEach((l, i) => gsap.from(l, { opacity: 0, x: -50, duration: 1.4, scrollTrigger: { trigger: l, start: 'top 90%', once: true }, delay: i * 0.05 }));
  const stamp = $('[data-stamp]');
  if (stamp) {
    gsap.from(stamp, { scale: 0.2, opacity: 0, duration: 1.8, ease: 'elastic.out(1, 0.55)', scrollTrigger: { trigger: stamp, start: 'top 85%', once: true } });
    gsap.fromTo(stamp, { rotation: -26 }, { rotation: 6, ease: 'none', scrollTrigger: { trigger: '.figures', start: 'top bottom', end: 'bottom top', scrub: true } });
  }
  gsap.from('.figures__tail', { opacity: 0, rotation: -6, y: 20, duration: 1.4, scrollTrigger: { trigger: '.figures__tail', start: 'top 92%', once: true } });

  /* ------------------------------------------------------------------
     Offrir : tickets qui arrivent comme glissés sur un comptoir
     ------------------------------------------------------------------ */
  $$('[data-ticket]').forEach((t, i) => {
    gsap.from(t, { x: 140, opacity: 0, rotation: 7, duration: 1.5, delay: i * 0.12, scrollTrigger: { trigger: '.gift__tickets', start: 'top 82%', once: true } });
  });

  /* ------------------------------------------------------------------
     Galerie : masques, parallaxe croisée, tilt 3D
     ------------------------------------------------------------------ */
  const reveals = {
    g1: ['inset(100% 0% 0% 0%)', 'inset(0% 0% 0% 0%)'],
    g2: ['inset(0% 100% 0% 0%)', 'inset(0% 0% 0% 0%)'],
    g3: ['circle(0% at 50% 50%)', 'circle(75% at 50% 50%)'],
    g4: ['inset(0% 0% 100% 0%)', 'inset(0% 0% 0% 0%)'],
    g5: ['circle(0% at 50% 100%)', 'circle(150% at 50% 100%)']
  };
  $$('[data-frame]').forEach((fr) => {
    const key = Array.from(fr.classList).find((c) => /^g\d$/.test(c));
    const inner = $('.frame__inner', fr), img = $('img', fr);
    const sp = parseFloat(fr.dataset.speed) || 0;
    const r = reveals[key] || reveals.g1;
    gsap.set(inner, { clipPath: r[0] });
    gsap.to(inner, { clipPath: r[1], duration: 1.7, ease: 'expo.inOut', scrollTrigger: { trigger: fr, start: 'top 86%', once: true }, onComplete: () => gsap.set(inner, { clearProps: 'clipPath' }) });
    gsap.fromTo(img, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: fr, start: 'top bottom', end: 'bottom top', scrub: true } });
    if (sp) gsap.fromTo(fr, { y: sp }, { y: -sp, ease: 'none', scrollTrigger: { trigger: fr, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* ------------------------------------------------------------------
     Appel à l'action et carte
     ------------------------------------------------------------------ */
  const ctaFeather = $('.cta__feather');
  gsap.set(ctaFeather.__paths, { strokeDashoffset: 1 });
  gsap.to(ctaFeather.__paths, { strokeDashoffset: 0, ease: 'none', stagger: 0.02, scrollTrigger: { trigger: '.cta', start: 'top 80%', end: 'center 40%', scrub: 0.6 } });
  gsap.from('.badge', { scale: 0.2, rotation: -120, opacity: 0, duration: 1.8, scrollTrigger: { trigger: '.cta', start: 'top 70%', once: true } });
  gsap.from('.find__map', { y: 90, opacity: 0, duration: 1.6, scrollTrigger: { trigger: '.find__map', start: 'top 88%', once: true } });
  gsap.from('.footer__sign', { opacity: 0, scale: 0.92, duration: 1.8, scrollTrigger: { trigger: '.footer', start: 'top 70%', once: true } });
  // Le néon du pied de page vacille légèrement
  gsap.to('.footer__sign', { opacity: 0.86, duration: 0.09, repeat: -1, yoyo: true, repeatDelay: 3.6, ease: 'steps(1)', delay: 4 });

  /* ------------------------------------------------------------------
     Micro-interactions au pointeur (souris uniquement)
     ------------------------------------------------------------------ */
  if (finePointer.matches) {
    // Boutons magnétiques
    const mags = $$('.magnetic').map((el) => ({ el: el, x: gsap.quickTo(el, 'x', { duration: 0.7, ease: 'elastic.out(1, 0.5)' }), y: gsap.quickTo(el, 'y', { duration: 0.7, ease: 'elastic.out(1, 0.5)' }) }));
    window.addEventListener('pointermove', (e) => {
      mags.forEach((m) => {
        const r = m.el.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const dx = e.clientX - cx, dy = e.clientY - cy;
        const near = Math.abs(dx) < r.width / 2 + 46 && Math.abs(dy) < r.height / 2 + 46;
        m.x(near ? dx * 0.32 : 0); m.y(near ? dy * 0.38 : 0);
      });
    }, { passive: true });

    // Inclinaison 3D + reflet qui suit la souris
    function tilt(el, max, glareEl) {
      gsap.set(el, { transformPerspective: 1000 });
      const rx = gsap.quickTo(el, 'rotationX', { duration: 0.7, ease: 'power3' });
      const ry = gsap.quickTo(el, 'rotationY', { duration: 0.7, ease: 'power3' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        ry(px * max * 2); rx(-py * max * 2);
        const g = glareEl || el;
        g.style.setProperty('--gx', (px * r.width * 0.9).toFixed(0) + 'px');
        g.style.setProperty('--gy', (py * r.height * 0.9).toFixed(0) + 'px');
        g.style.setProperty('--go', '1');
      });
      el.addEventListener('pointerleave', () => { rx(0); ry(0); (glareEl || el).style.setProperty('--go', '0'); });
    }
    $$('[data-tilt]').forEach((t) => tilt(t, 7));
    $$('.frame__inner').forEach((f) => tilt(f, 5));
  }

  /* ------------------------------------------------------------------
     Recalage après chargement complet
     ------------------------------------------------------------------ */
  window.addEventListener('load', () => ScrollTrigger.refresh());
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('pageshow', (e) => { if (e.persisted) ScrollTrigger.refresh(); });
  setInterval(updateOpenState, 60000);
})();
