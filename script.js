/* POSHOMA ADVENTURES — self-contained progressive enhancements.
 * Works without build tools. All contact requests open WhatsApp or the visitor's mail app.
 */
(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const header = $('#siteHeader');
  const nav = $('#siteNav');
  const menu = $('#menuButton');
  const progress = $('#pageProgress');
  const backToTop = $('#backToTop');
  const hero = $('#heroVisual');
  const statement = $('[data-parallax-bg]');
  const introImage = $('[data-parallax]');
  const film = $('#showreelVideo');
  const filmSound = $('#filmSound');
  const videoAssets = {
    'safari-experience': 'assets/videos/safari-experience.mp4',
    'elephants': 'assets/videos/elephants.mp4',
    'lions': 'assets/videos/lions.mp4',
    'leopard': 'assets/videos/leopard.mp4',
    'rhino': 'assets/videos/rhino.mp4'
  };

  // Local image fallback if an optional open-licensed Unsplash image cannot load.
  $$('img[data-fallback]').forEach(img => {
    img.addEventListener('error', () => {
      if (img.dataset.fallback && !img.dataset.didFallback) {
        img.dataset.didFallback = 'true';
        img.src = img.dataset.fallback;
      }
    });
    if (img.complete && img.naturalWidth === 0) {
      img.src = img.dataset.fallback;
      img.dataset.didFallback = 'true';
    }
  });

  // Mobile navigation & keyboard support.
  function closeMenu() {
    nav?.classList.remove('open');
    menu?.classList.remove('open');
    menu?.setAttribute('aria-expanded', 'false');
    menu?.setAttribute('aria-label', 'Open navigation menu');
  }
  menu?.addEventListener('click', () => {
    const open = !nav.classList.contains('open');
    nav.classList.toggle('open', open);
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
  });
  $$('.site-nav a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  document.addEventListener('click', e => {
    if (nav?.classList.contains('open') && !header.contains(e.target)) closeMenu();
  });

  // Scroll-driven motion with requestAnimationFrame and IntersectionObserver.
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const scroll = window.scrollY || 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progress) progress.style.width = `${max > 0 ? Math.min(100, scroll / max * 100) : 0}%`;
      header?.classList.toggle('scrolled', scroll > 50);
      backToTop?.classList.toggle('visible', scroll > 630);
      if (!reduceMotion.matches && innerWidth > 720) {
        if (hero && scroll < innerHeight * 1.4) {
          hero.style.transform = `translate3d(0,${Math.min(115,scroll * .16)}px,0) scale(1.08)`;
        }
        if (statement) {
          const rect = statement.parentElement.getBoundingClientRect();
          if (rect.bottom > 0 && rect.top < innerHeight) {
            const offset = (innerHeight / 2 - (rect.top + rect.height / 2)) * .13;
            statement.style.transform = `translate3d(0,${offset}px,0)`;
          }
        }
        if (introImage) {
          const section = introImage.closest('[data-parallax-container]');
          const rect = section.getBoundingClientRect();
          if (rect.bottom > 0 && rect.top < innerHeight) {
            const offset = (innerHeight / 2 - (rect.top + rect.height / 2)) * .11;
            introImage.style.transform = `translate3d(0,${offset}px,0)`;
          }
        }
      }
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();
  backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'instant' : 'smooth' }));
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -30px 0px', threshold: .085 });
    $$('.reveal').forEach((el, i) => {
      // Subtle staggering of repeated cards in their own rows.
      if (el.matches('.destination-card,.journey-card,.experience-card,.gallery-item')) {
        el.style.transitionDelay = `${(i % 4) * 65}ms`;
      }
      revealObserver.observe(el);
    });
    const navLinks = $$('.nav-link');
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
        }
      });
    }, { rootMargin: '-15% 0px -65% 0px' });
    $$('section[id]').forEach(el => sectionObserver.observe(el));
  } else {
    $$('.reveal').forEach(el => el.classList.add('is-visible'));
  }
  if (reduceMotion.matches) {
    $('#heroVideo')?.pause();
    film?.pause();
  }

  // Film switcher: real locally bundled footage, works without any external video service.
  const filmTabs = $$('.film-tab');
  let selectedFilm = 'safari-experience';
  filmTabs.forEach(tab => tab.addEventListener('click', () => {
    const chosen = tab.dataset.film;
    if (!chosen || !videoAssets[chosen]) return;
    filmTabs.forEach(b => {
      const active = b === tab;
      b.classList.toggle('active', active);
      b.setAttribute('aria-pressed', String(active));
    });
    if (chosen !== selectedFilm) {
      selectedFilm = chosen;
      film.pause();
      film.src = videoAssets[chosen];
      film.load();
      if (!reduceMotion.matches) film.play().catch(() => {});
    } else if (film.paused) {
      film.play().catch(() => {});
    }
  }));
  filmSound?.addEventListener('click', () => {
    film.muted = !film.muted;
    const unmuted = !film.muted;
    filmSound.setAttribute('aria-pressed', String(unmuted));
    filmSound.setAttribute('aria-label', unmuted ? 'Mute safari video' : 'Unmute safari video');
    filmSound.innerHTML = `<span class="sound-icon">♪</span> SOUND ${unmuted ? 'ON' : 'OFF'}`;
    if (unmuted && film.paused) film.play().catch(() => {});
  });

  // Gallery fullscreen modal with arrows, Escape and keyboard left/right navigation.
  const lb = $('#lightbox');
  const lbImage = $('#lightboxImage');
  const lbCaption = $('#lightboxCaption');
  const lbIndex = $('#lightboxIndex');
  const gallery = $$('.gallery-item');
  let currentImage = 0;
  let opener = null;
  function showImage(index) {
    currentImage = (index + gallery.length) % gallery.length;
    const item = gallery[currentImage];
    const img = $('img', item);
    lbImage.src = img.currentSrc || img.src;
    lbImage.alt = img.alt;
    lbCaption.textContent = item.dataset.caption || img.alt;
    lbIndex.textContent = `${currentImage + 1} / ${gallery.length}`;
  }
  function openLightbox(index) {
    opener = document.activeElement;
    showImage(index);
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    $('#lightboxClose')?.focus();
  }
  function closeLightbox() {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
    if (opener && typeof opener.focus === 'function') opener.focus();
  }
  gallery.forEach((item, i) => item.addEventListener('click', () => openLightbox(i)));
  $('[data-close-lightbox]')?.addEventListener('click', closeLightbox);
  $('#lightboxClose')?.addEventListener('click', closeLightbox);
  $('#lightboxPrev')?.addEventListener('click', () => showImage(currentImage - 1));
  $('#lightboxNext')?.addEventListener('click', () => showImage(currentImage + 1));
  document.addEventListener('keydown', e => {
    if (!lb?.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showImage(currentImage + 1);
    if (e.key === 'ArrowLeft') showImage(currentImage - 1);
    if (e.key === 'Tab') {
      const focusable = $$('#lightbox button');
      if (focusable.length) {
        const index = focusable.indexOf(document.activeElement);
        if (e.shiftKey && index <= 0) { e.preventDefault(); focusable[focusable.length - 1].focus(); }
        else if (!e.shiftKey && index === focusable.length - 1) { e.preventDefault(); focusable[0].focus(); }
      }
    }
  });

  // Enquiry form: no fictional backend, uses WhatsApp or user's email client.
  const enquiry = $('#enquiryForm');
  const errorBox = $('#formError');
  const interest = $('#tripInterest');
  const validEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  function enquiryText() {
    const data = new FormData(enquiry);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    if (!name) {
      errorBox.textContent = 'Please enter your name.';
      $('#guestName').focus();
      return null;
    }
    if (!validEmail(email)) {
      errorBox.textContent = 'Please enter a valid email address.';
      $('#guestEmail').focus();
      return null;
    }
    errorBox.textContent = '';
    return `Hello Poshoma Adventures! I'd like to enquire about a Kenya safari.\n\nName: ${name}\nEmail: ${email}\nTravel dates: ${data.get('dates') || 'Flexible / to be confirmed'}\nTravellers: ${data.get('travelers')}\nInterested in: ${data.get('interest')}\n\nAdditional details: ${data.get('message') || 'Please advise me on the options and available rates.'}\n\nThank you!`;
  }
  enquiry?.addEventListener('submit', e => {
    e.preventDefault();
    const text = enquiryText();
    if (text) window.open(`https://wa.me/254700752267?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  });
  $('#emailEnquiry')?.addEventListener('click', () => {
    const text = enquiryText();
    if (text) window.location.href = `mailto:poshomaadventures@gmail.com?subject=${encodeURIComponent('Kenya safari enquiry — Poshoma Adventures')}&body=${encodeURIComponent(text)}`;
  });
  $$('[data-destination]').forEach(el => el.addEventListener('click', () => {
    if (interest) {
      const name = el.dataset.destination || '';
      const found = [...interest.options].find(o => o.text.toLowerCase().includes(name.toLowerCase().replace(' coast', '')));
      interest.value = found?.value || 'Something tailor-made / not sure yet';
    }
  }));
  $$('[data-interest]').forEach(el => el.addEventListener('click', () => {
    const choice = el.dataset.interest;
    if (!choice || !interest) return;
    const found = [...interest.options].find(o => o.text.toLowerCase().includes(choice.toLowerCase()) || choice.toLowerCase().includes(o.text.toLowerCase()));
    if (found) interest.value = found.value;
    else $('#message').value = `I'm interested in: ${choice}. ` + ($('#message').value || '');
  }));
  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  // Let visitors who want quieter browsing pause background footage in power-save mode.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      $('#heroVideo')?.pause();
      film?.pause();
    } else if (!reduceMotion.matches) {
      $('#heroVideo')?.play().catch(() => {});
      film?.play().catch(() => {});
    }
  });
})();
