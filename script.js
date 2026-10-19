/* ==========================================================================
   Portfólio — Thiago Andrade
   JavaScript só para o que HTML/CSS não resolvem sozinhos:
   relógios, tema, reveal no scroll, scrollspy, timeline, typewriter,
   tilt do cartão e copiar e-mail.
   ========================================================================== */
(() => {
  'use strict';

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

  /* Tema claro/escuro ---------------------------------------------------- */
  function initTheme() {
    const btn = document.querySelector('[data-theme-toggle]');
    if (!btn) return;

    const current = () => root.dataset.theme || (prefersDark.matches ? 'dark' : 'light');

    const sync = () => {
      const isDark = current() === 'dark';
      const label = isDark ? 'Ativar tema claro' : 'Ativar tema escuro';
      btn.setAttribute('aria-label', label);
      btn.title = label;
      btn.dataset.state = isDark ? 'dark' : 'light';
    };

    btn.addEventListener('click', () => {
      const next = current() === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try {
        localStorage.setItem('theme', next);
      } catch (e) {
        /* armazenamento indisponível: o tema vale só para esta visita */
      }
      sync();
    });

    prefersDark.addEventListener('change', sync);
    sync();
  }

  /* Letreiro de horários ------------------------------------------------- */
  function initClocks() {
    const ticker = document.querySelector('[data-ticker]');
    if (!ticker) return;

    // Duplica a lista para o loop ser contínuo; a cópia fica oculta para leitores de tela
    const list = ticker.querySelector('.ticker__list');
    const clone = list.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.dataset.clone = '';
    list.after(clone);

    const zoneFormatter = (timeZone) => {
      try {
        return new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'shortOffset' });
      } catch (e) {
        return null;
      }
    };

    const formatters = new Map();
    const items = [...ticker.querySelectorAll('[data-tz]')].map((el) => {
      const tz = el.dataset.tz;
      if (!formatters.has(tz)) {
        formatters.set(tz, {
          time: new Intl.DateTimeFormat('pt-BR', {
            timeZone: tz,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hourCycle: 'h23',
          }),
          zone: zoneFormatter(tz),
        });
      }
      return {
        tz,
        time: el.querySelector('.ticker__time'),
        zone: el.querySelector('.ticker__zone'),
      };
    });

    // "GMT-3" → "UTC−3" (o horário de verão é tratado pelo próprio Intl)
    const zoneLabel = (formatter, now) => {
      if (!formatter) return '';
      const part = formatter.formatToParts(now).find((p) => p.type === 'timeZoneName');
      return part ? part.value.replace('GMT', 'UTC').replace('-', '−') : '';
    };

    const tick = () => {
      const now = new Date();
      items.forEach(({ tz, time, zone }) => {
        const f = formatters.get(tz);
        time.textContent = f.time.format(now);
        zone.textContent = zoneLabel(f.zone, now);
      });
    };

    tick();
    // Alinha a atualização com a virada do segundo
    setTimeout(() => {
      tick();
      setInterval(tick, 1000);
    }, 1000 - (Date.now() % 1000));

    // Pausar/retomar (WCAG 2.2.2)
    const toggle = document.querySelector('[data-ticker-toggle]');
    if (toggle) {
      toggle.addEventListener('click', () => {
        const paused = ticker.classList.toggle('is-paused');
        toggle.setAttribute('aria-pressed', String(paused));
        toggle.setAttribute('aria-label', paused ? 'Retomar letreiro de horários' : 'Pausar letreiro de horários');
      });
    }
  }

  /* Conteúdo aparece conforme o scroll ----------------------------------- */
  function initReveal() {
    const els = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window) || reduceMotion.matches) {
      els.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        // Escalonamento suave só entre os itens que entram juntos na tela (máx. 400ms)
        entries
          .filter((entry) => entry.isIntersecting)
          .forEach((entry, i) => {
            entry.target.style.setProperty('--delay', `${Math.min(i, 5) * 80}ms`);
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.1 }
    );
    els.forEach((el) => io.observe(el));
  }

  /* Seção ativa na navegação inferior ------------------------------------ */
  function initScrollSpy() {
    const list = document.querySelector('.dock__list');
    const links = [...document.querySelectorAll('.dock__link')];
    if (!list || !links.length || !('IntersectionObserver' in window)) return;

    const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
    const sections = [...byId.keys()].map((id) => document.getElementById(id)).filter(Boolean);

    const setActive = (id) => {
      const active = byId.get(id);
      links.forEach((a) => {
        if (a === active) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });

      // No mobile, centraliza o link ativo dentro da pílula rolável
      if (active && list.scrollWidth > list.clientWidth) {
        const left = active.offsetLeft - (list.clientWidth - active.offsetWidth) / 2;
        list.scrollTo({ left, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    sections.forEach((s) => io.observe(s));
  }

  /* Scrollytelling da timeline + sticky headers -------------------------- */
  function initScrollEffects() {
    const timelines = [...document.querySelectorAll('[data-timeline]')];
    const heads = [...document.querySelectorAll('.section__head')];
    let stickyTops = [];
    let ticking = false;

    const measure = () => {
      stickyTops = heads.map((h) => parseFloat(getComputedStyle(h).top) || 0);
    };

    const update = () => {
      ticking = false;
      const trigger = window.innerHeight * 0.6;

      timelines.forEach((tl) => {
        const r = tl.getBoundingClientRect();
        const progress = Math.min(1, Math.max(0, (trigger - r.top) / r.height));
        tl.style.setProperty('--progress', progress.toFixed(3));
        tl.querySelectorAll('.timeline__item').forEach((item) => {
          item.classList.toggle('is-active', item.getBoundingClientRect().top + 20 < trigger);
        });
      });

      // Cabeçalho "preso": a seção já passou do topo, mas ainda não acabou
      heads.forEach((h, i) => {
        const top = stickyTops[i];
        const box = h.parentElement.getBoundingClientRect();
        h.classList.toggle('is-stuck', box.top < top - 1 && box.bottom > top + h.offsetHeight);
      });
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    measure();
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => {
      measure();
      onScroll();
    });
  }

  /* Typewriter do cargo -------------------------------------------------- */
  function initTypewriter() {
    const el = document.querySelector('[data-typewriter]');
    if (!el || reduceMotion.matches) return;

    let phrases;
    try {
      phrases = JSON.parse(el.dataset.typewriter);
    } catch (e) {
      return;
    }
    if (!Array.isArray(phrases) || phrases.length < 2) return;

    let index = 0;
    let length = phrases[0].length;
    let deleting = true;

    const step = () => {
      const phrase = phrases[index];

      if (deleting) {
        length -= 1;
        el.textContent = phrase.slice(0, length);
        if (length === 0) {
          deleting = false;
          index = (index + 1) % phrases.length;
          return setTimeout(step, 450);
        }
        return setTimeout(step, 35);
      }

      length += 1;
      el.textContent = phrase.slice(0, length);
      if (length === phrase.length) {
        deleting = true;
        return setTimeout(step, 2400);
      }
      return setTimeout(step, 70);
    };

    // A primeira frase já está no HTML; espera a leitura antes de apagar
    setTimeout(step, 3000);
  }

  /* Tilt 3D do cartão de perfil ------------------------------------------ */
  function initTilt() {
    const wrap = document.querySelector('[data-tilt]');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (!wrap || !finePointer.matches || reduceMotion.matches) return;

    const card = wrap.querySelector('.profile-card');
    const MAX_DEG = 6;

    wrap.addEventListener('pointermove', (e) => {
      const r = wrap.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty('--ry', `${(x * MAX_DEG * 2).toFixed(2)}deg`);
      card.style.setProperty('--rx', `${(-y * MAX_DEG * 2).toFixed(2)}deg`);
      card.classList.add('is-tilting');
    });

    wrap.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
      card.classList.remove('is-tilting');
    });
  }

  /* Copiar e-mail -------------------------------------------------------- */
  function initCopyEmail() {
    document.querySelectorAll('[data-copy]').forEach((btn) => {
      const label = btn.querySelector('[data-copy-label]');
      const status = document.querySelector(btn.dataset.copyStatus);
      const original = label.textContent;
      let timer;

      btn.addEventListener('click', async () => {
        let copied = false;
        try {
          await navigator.clipboard.writeText(btn.dataset.copy);
          copied = true;
        } catch (e) {
          copied = false;
        }

        if (copied) {
          label.textContent = 'Copiado!';
          btn.classList.add('is-done');
          if (status) status.textContent = 'E-mail copiado para a área de transferência.';
        } else {
          // Sem acesso à área de transferência: seleciona o texto para copiar manualmente
          const target = document.querySelector(btn.dataset.copyFallback);
          if (target) {
            const range = document.createRange();
            range.selectNodeContents(target);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
          }
          if (status) status.textContent = 'Não foi possível copiar. O e-mail foi selecionado: use Ctrl+C.';
        }

        clearTimeout(timer);
        timer = setTimeout(() => {
          label.textContent = original;
          btn.classList.remove('is-done');
          if (status) status.textContent = '';
        }, 3000);
      });
    });
  }

  /* Ano no rodapé -------------------------------------------------------- */
  function initYear() {
    const year = String(new Date().getFullYear());
    document.querySelectorAll('[data-year]').forEach((el) => {
      el.textContent = year;
    });
  }

  initTheme();
  initClocks();
  initReveal();
  initScrollSpy();
  initScrollEffects();
  initTypewriter();
  initTilt();
  initCopyEmail();
  initYear();
})();
