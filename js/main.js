/**
 * GUT ALTONA — RECREATED SAUERLAND STERN INTERACTION CONTROLLER
 * Controls:
 * - Floating Navigation Pills (Menu & Zimmer buchen)
 * - Full-page Mega Navigation Overlay
 * - Hero Gallery Slide Rotation
 * - Interactive Horizontal Image Carousel with Drag, Arrows & Progress Bar
 * - Cinematic Hotel Video Section (Autoplay, Viewport Observer & Audio controls)
 * - Scroll Reveal Animations (IntersectionObserver)
 * - Dialog Modals & Language Switcher
 */

function bootApp() {
  initHeroGallery();
  initNavigation();
  initHorizontalScroller();
  initCinematicScrollZoomVideo();
  initEditorialRoomsAnimation();
  initEventsAndHeritageAnimation();
  initSurroundingsEditorialAnimation();
  initWellnessExperienceAnimation();
  initScrollReveals();
  initBoutiqueEditorialSections();
  initModals();
  initLanguageSwitcher();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootApp);
} else {
  bootApp();
}

/* ==========================================================================
   1. HERO GALLERY SLIDESHOW
   ========================================================================== */
function initHeroGallery() {
  const slides = document.querySelectorAll('#gid1 .slide');
  if (slides.length <= 1) return;

  let currentSlide = 0;
  setInterval(() => {
    slides[currentSlide].classList.remove('on');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('on');
  }, 6500);
}

/* ==========================================================================
   2. NAVIGATION & FLOATING PILLS CONTROLLER
   ========================================================================== */
function initNavigation() {
  const menuCheckbox = document.getElementById('global-toggle-menu');
  const menuButton = document.getElementById('navButtonMenu');
  const floatingMenuBtn = document.getElementById('floatingMenuBtn');
  const navOverlay = document.getElementById('nav_0');
  const body = document.body;

  function setMenuState(open) {
    if (menuCheckbox) menuCheckbox.checked = open;
    if (open) {
      body.classList.add('menu-is-open');
      body.style.overflow = 'hidden';
      if (floatingMenuBtn) {
        floatingMenuBtn.setAttribute('aria-expanded', 'true');
        const textSpan = floatingMenuBtn.querySelector('.pill-text');
        if (textSpan) textSpan.textContent = 'Schließen';
      }
    } else {
      body.classList.remove('menu-is-open');
      body.style.overflow = '';
      if (floatingMenuBtn) {
        floatingMenuBtn.setAttribute('aria-expanded', 'false');
        const textSpan = floatingMenuBtn.querySelector('.pill-text');
        if (textSpan) textSpan.textContent = 'Menü';
      }
    }
  }

  // Header Menu button click
  if (menuButton) {
    menuButton.addEventListener('click', (e) => {
      e.preventDefault();
      const willOpen = !menuCheckbox.checked;
      setMenuState(willOpen);
    });
  }

  // Floating Menu Pill button click
  if (floatingMenuBtn) {
    floatingMenuBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const willOpen = !body.classList.contains('menu-is-open');
      setMenuState(willOpen);
    });
  }

  // Close menu with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && body.classList.contains('menu-is-open')) {
      setMenuState(false);
    }
  });

  // Close when clicking an internal menu link
  if (navOverlay) {
    navOverlay.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        setMenuState(false);
      });
    });
  }

  // Header scroll appearance
  const header = document.getElementById('header');
  function checkScroll() {
    if (window.scrollY > 80) {
      if (header) header.classList.add('scrolled');
      body.classList.add('scrolled');
    } else {
      if (header) header.classList.remove('scrolled');
      body.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', checkScroll, { passive: true });
  checkScroll();
}

/* ==========================================================================
   3. SCROLL-DRIVEN HORIZONTAL THEMED WORLDS (GSAP SCROLLTRIGGER ARCHITECTURE)
   ========================================================================== */
function initHorizontalScroller() {
  const section = document.querySelector('.dark-carousel-section');
  if (!section) return;

  const track = section.querySelector('.horizontal-scroll__track');
  const clip = section.querySelector('.horizontal-scroll__track-clip');
  if (!track) return;

  // Reduced motion check
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const mm = gsap.matchMedia();

  mm.add("(min-width: 769px)", () => {
    function getTravelDistance() {
      return Math.max(0, track.scrollWidth - window.innerWidth);
    }

    const tween = gsap.to(track, {
      x: () => -getTravelDistance(),
      ease: "none",
      scrollTrigger: {
        id: "themedWorldsScroller",
        trigger: section,
        start: "top top",
        end: () => "+=" + Math.round(getTravelDistance() * 1.15),
        pin: true,
        pinSpacing: true,
        scrub: 0.8,
        invalidateOnRefresh: true,
        anticipatePin: 1
      }
    });

    // Keyboard navigation when user is focused inside
    if (clip) {
      clip.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const dir = e.key === 'ArrowRight' ? 1 : -1;
          const st = tween.scrollTrigger;
          const dist = getTravelDistance();
          if (st && dist > 0) {
            const stepRatio = 420 / dist;
            const targetProgress = Math.max(0, Math.min(1, st.progress + dir * stepRatio));
            const targetY = st.start + targetProgress * (st.end - st.start);
            window.scrollTo({ top: targetY, behavior: 'smooth' });
          }
        }
      });
    }

    return () => {
      track.style.transform = 'none';
    };
  });

  mm.add("(max-width: 768px)", () => {
    track.style.transform = 'none';
  });

  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
  });
}

/* ==========================================================================
   4. CINEMATIC SCROLL-ZOOM VIDEO CONTROLLER (GSAP SCROLLTRIGGER)
   ========================================================================== */
function initCinematicScrollZoomVideo() {
  const section = document.querySelector('.cinematic-zoom-section');
  const frame = document.querySelector('.cinematic-zoom-frame');
  const video = document.querySelector('.cinematic-zoom-video');
  if (!section || !frame || !video) return;

  // Reliable Autoplay: muted and playsinline
  video.muted = true;
  video.playsInline = true;
  const playPromise = video.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      // Browser blocked autoplay without user gesture; play on first interaction
      window.addEventListener('scroll', () => {
        if (video.paused) video.play().catch(() => {});
      }, { once: true, passive: true });
      window.addEventListener('click', () => {
        if (video.paused) video.play().catch(() => {});
      }, { once: true });
    });
  }

  // Accessibility: Respect prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  // Check for GSAP and ScrollTrigger
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();

    mm.add({
      isDesktop: "(min-width: 768px)",
      isMobile: "(max-width: 767px)",
      reduceMotion: "(prefers-reduced-motion: reduce)"
    }, (context) => {
      const { isDesktop, isMobile, reduceMotion } = context.conditions;
      if (reduceMotion) return;

      // Build timeline pinned to section scroll
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          invalidateOnRefresh: true,
          onEnter: () => {
            if (video.paused) video.play().catch(() => {});
          },
          onEnterBack: () => {
            if (video.paused) video.play().catch(() => {});
          },
          onLeave: () => {
            if (!video.paused) video.pause();
          },
          onLeaveBack: () => {
            if (!video.paused) video.pause();
          }
        }
      });

      // Stage 1 -> Stage 2 -> Stage 3: Smooth expansion to full viewport (0.0 to 0.65 progress)
      tl.fromTo(frame,
        {
          width: isMobile ? '88%' : '58%',
          maxWidth: isMobile ? '100%' : '1120px',
          height: isMobile ? 'calc(88vw * 9 / 16)' : 'calc(58vw * 9 / 16)',
          maxHeight: isMobile ? 'none' : '630px',
          borderRadius: isMobile ? '18px' : '28px',
          boxShadow: '0 32px 84px rgba(0, 0, 0, 0.7), 0 0 50px rgba(16, 31, 52, 0.45)'
        },
        {
          width: '100%',
          maxWidth: '100%',
          height: '100vh',
          maxHeight: '100vh',
          borderRadius: '0px',
          boxShadow: '0 0 0 rgba(0, 0, 0, 0)',
          ease: 'power2.inOut',
          duration: 0.65
        },
        0
      );

      // Stage 4: Scroll-Based Immersive Zoom-In into the footage (0.65 to 1.0 progress)
      tl.fromTo(video,
        {
          scale: 1.0
        },
        {
          scale: isMobile ? 1.10 : 1.18,
          ease: 'power1.out',
          duration: 0.35
        },
        0.65
      );
    });
  } else {
    // Graceful Scroll Event Fallback if GSAP is unavailable
    window.addEventListener('scroll', () => {
      const rect = section.getBoundingClientRect();
      const windowH = window.innerHeight;
      const totalScroll = rect.height - windowH;
      if (totalScroll <= 0) return;
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / totalScroll));

      if (progress <= 0.65) {
        const p = progress / 0.65;
        const w = 58 + p * 42;
        const br = 28 * (1 - p);
        frame.style.width = `${w}%`;
        frame.style.maxWidth = `${w}%`;
        frame.style.height = `${(1 - p) * (58 * 9 / 16) + p * 100}vh`;
        frame.style.borderRadius = `${br}px`;
        video.style.transform = 'scale(1)';
      } else {
        frame.style.width = '100%';
        frame.style.maxWidth = '100%';
        frame.style.height = '100vh';
        frame.style.borderRadius = '0px';
        const p2 = (progress - 0.65) / 0.35;
        video.style.transform = `scale(${1 + p2 * 0.18})`;
      }
    }, { passive: true });
  }
}

/* ==========================================================================
   5. SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
   ========================================================================== */
function initScrollReveals() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal-on-scroll, .reveal-scale, .reveal-clip').forEach((el) => {
      el.classList.add('is-visible');
    });
    return;
  }

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.12
  });

  const elements = document.querySelectorAll(
    '.reveal-on-scroll, .reveal-scale, .reveal-clip, .grp:not(.editorial-boutique-section) .box-double__doubel, .editorial-row, .usb-card--enhanced, .mosaic__item'
  );

  elements.forEach((el) => {
    if (!el.classList.contains('reveal-on-scroll') && !el.classList.contains('reveal-scale') && !el.classList.contains('reveal-clip')) {
      el.classList.add('reveal-on-scroll');
    }
    revealObserver.observe(el);
  });

  // Rooms Hero section entrance observer
  const roomsHero = document.querySelector('.rooms-hero-section');
  if (roomsHero) {
    roomsHero.classList.remove('is-active');
    const roomsHeroObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          roomsHero.classList.add('is-active');
          roomsHeroObserver.unobserve(roomsHero);
        }
      });
    }, { threshold: 0.15 });
    roomsHeroObserver.observe(roomsHero);
  }
}

/* ==========================================================================
   6. DIALOG MODALS CONTROLLER
   ========================================================================== */
function initModals() {
  const meetingModal = document.getElementById('meetingInquiryModal');
  const tableModal = document.getElementById('tableReservationModal');

  document.querySelectorAll('[data-modal-open="meeting"]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (meetingModal) meetingModal.showModal();
    });
  });

  document.querySelectorAll('[data-modal-open="table"]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (tableModal) tableModal.showModal();
    });
  });

  document.querySelectorAll('.modal-close-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('dialog');
      if (modal) modal.close();
    });
  });

  document.querySelectorAll('dialog.modal').forEach((dialog) => {
    dialog.addEventListener('click', (e) => {
      const rect = dialog.getBoundingClientRect();
      const inDialog =
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width;
      if (!inDialog) dialog.close();
    });
  });
}

/* ==========================================================================
   7. LANGUAGE SWITCHER
   ========================================================================== */
function initLanguageSwitcher() {
  const langBtns = document.querySelectorAll('.lang-btn');
  langBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const lang = btn.getAttribute('data-lang');
      langBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      document.documentElement.lang = lang;
      localStorage.setItem('gut_altona_lang', lang);
    });
  });
}

/* ==========================================================================
   8. BOUTIQUE EDITORIAL SECTIONS (WELLNESS & EVENTS / CELEBRATIONS)
   Restrained luxury animations: clip-path, directional entrances & parallax
   ========================================================================== */
function initBoutiqueEditorialSections() {
  const sections = document.querySelectorAll('.editorial-boutique-section');
  if (!sections.length) return;

  const activeSections = new Set();
  let ticking = false;

  // 1. Entrance Observer for Luxury Cascades
  if ('IntersectionObserver' in window) {
    const entranceObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-active');
          activeSections.add(entry.target);
          requestParallaxUpdate();
        } else {
          activeSections.delete(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.12
    });

    sections.forEach((sec) => entranceObserver.observe(sec));
  } else {
    sections.forEach((sec) => sec.classList.add('is-active'));
  }

  // 2. Subtle Scroll-Driven Parallax
  function updateParallax() {
    ticking = false;

    // Disabled on mobile (<= 768px) and for prefers-reduced-motion
    if (window.innerWidth <= 768 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      sections.forEach((sec) => {
        sec.style.setProperty('--preview-parallax-y', '0px');
        sec.style.setProperty('--main-parallax-y', '0px');
      });
      return;
    }

    const windowH = window.innerHeight;

    activeSections.forEach((sec) => {
      const rect = sec.getBoundingClientRect();
      const secCenter = rect.top + rect.height * 0.5;
      const progress = (windowH * 0.5 - secCenter) / (windowH + rect.height);
      const clamped = Math.max(-0.6, Math.min(0.6, progress));

      // Preview frame shifts gently upward as user scrolls down
      const previewY = clamped * -26; // px
      // Main frame shifts gently downward as user scrolls down
      const mainY = clamped * 18;     // px

      sec.style.setProperty('--preview-parallax-y', `${previewY.toFixed(1)}px`);
      sec.style.setProperty('--main-parallax-y', `${mainY.toFixed(1)}px`);
    });
  }

  function requestParallaxUpdate() {
    if (!ticking && activeSections.size > 0) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }

  window.addEventListener('scroll', requestParallaxUpdate, { passive: true });
  window.addEventListener('resize', () => {
    requestParallaxUpdate();
  }, { passive: true });
}

/* ==========================================================================
   8. EDITORIAL ROOMS ANIMATION & PARALLAX CONTROLLER
   ========================================================================== */
function initEditorialRoomsAnimation() {
  const section = document.querySelector('.editorial-rooms-section');
  if (!section) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // 1. Section Header Reveal
    const header = section.querySelector('.editorial-rooms-header');
    if (header) {
      const eyebrow = header.querySelector('.editorial-rooms-eyebrow');
      const rule = header.querySelector('.editorial-rooms-rule');
      const title = header.querySelector('.editorial-rooms-title');
      const desc = header.querySelector('.editorial-rooms-desc');

      const tlHeader = gsap.timeline({
        scrollTrigger: {
          trigger: header,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      });

      if (eyebrow) {
        tlHeader.fromTo(eyebrow, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.75, ease: 'power2.out' }, 0);
      }
      if (rule) {
        tlHeader.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 0.85, ease: 'power2.out' }, 0.12);
      }
      if (title) {
        tlHeader.fromTo(title, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.85, ease: 'power2.out' }, 0.18);
      }
      if (desc) {
        tlHeader.fromTo(desc, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 0.3);
      }
    }

    // 2. Staggered Room Cards & Media Clip Reveal
    const cards = section.querySelectorAll('.editorial-room-card');
    cards.forEach((card) => {
      const media = card.querySelector('.editorial-room-card__media');
      const img = card.querySelector('.editorial-room-img');
      const body = card.querySelector('.editorial-room-card__body');

      const tlCard = gsap.timeline({
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
          toggleActions: 'play none none reverse'
        }
      });

      tlCard.fromTo(card, 
        { opacity: 0, y: 35 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
      );

      if (media) {
        tlCard.fromTo(media,
          { clipPath: 'inset(8% 0% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.85, ease: 'power2.out' },
          '-=0.65'
        );
      }

      if (body) {
        tlCard.fromTo(body,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.65, ease: 'power2.out' },
          '-=0.55'
        );
      }

      // 3. Subtle Parallax on Desktop
      if (img && window.innerWidth > 768) {
        gsap.fromTo(img, 
          { y: -12 },
          { 
            y: 12,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.2
            }
          }
        );
      }
    });

    // 4. Section Ending Reveal
    const ending = section.querySelector('.editorial-rooms-footer');
    if (ending) {
      gsap.fromTo(ending,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: ending,
            start: 'top 88%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }
  }
}

/* ==========================================================================
   9. EVENTS & HERITAGE EDITORIAL ANIMATIONS
   ========================================================================== */
function initEventsAndHeritageAnimation() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // --- SECTION 1: EVENTS & WEDDINGS (#feiern-editorial) ---
  const eventsSec = document.querySelector('.events-editorial-section');
  if (eventsSec) {
    const textCol = eventsSec.querySelector('.events-editorial-text');
    const primaryCard = eventsSec.querySelector('.events-media-card--primary');
    const secondaryCard = eventsSec.querySelector('.events-media-card--secondary');
    const primaryImg = eventsSec.querySelector('.events-img-primary');
    const secondaryImg = eventsSec.querySelector('.events-img-secondary');

    if (textCol) {
      const meta = textCol.querySelector('.events-editorial-meta');
      const rule = textCol.querySelector('.events-editorial-rule');
      const heading = textCol.querySelector('.events-editorial-heading');
      const subheading = textCol.querySelector('.events-editorial-subheading');
      const paras = textCol.querySelectorAll('.events-editorial-paragraphs p');
      const items = textCol.querySelectorAll('.events-highlight-item');
      const actions = textCol.querySelector('.events-editorial-actions');

      const tlEvents = gsap.timeline({
        scrollTrigger: {
          trigger: eventsSec,
          start: 'top 82%',
          toggleActions: 'play none none reverse'
        }
      });

      if (meta) tlEvents.fromTo(meta, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0);
      if (rule) tlEvents.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: 'power2.out' }, 0.12);
      if (heading) tlEvents.fromTo(heading, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 0.18);
      if (subheading) tlEvents.fromTo(subheading, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.75, ease: 'power2.out' }, 0.28);
      if (paras.length) tlEvents.fromTo(paras, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power2.out' }, 0.36);
      if (items.length) tlEvents.fromTo(items, { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out' }, 0.48);
      if (actions) tlEvents.fromTo(actions, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0.65);
    }

    if (primaryCard) {
      gsap.fromTo(primaryCard,
        { opacity: 0, y: 35, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.95,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: primaryCard,
            start: 'top 86%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }

    if (secondaryCard) {
      gsap.fromTo(secondaryCard,
        { opacity: 0, y: 45, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.95,
          delay: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: secondaryCard,
            start: 'top 88%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }

    // Subtle desktop parallax on media cards
    if (window.innerWidth > 768) {
      if (primaryImg) {
        gsap.fromTo(primaryImg,
          { y: -10 },
          {
            y: 10,
            ease: 'none',
            scrollTrigger: {
              trigger: primaryCard,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.2
            }
          }
        );
      }
      if (secondaryImg) {
        gsap.fromTo(secondaryImg,
          { y: -15 },
          {
            y: 15,
            ease: 'none',
            scrollTrigger: {
              trigger: secondaryCard,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.4
            }
          }
        );
      }
    }
  }

  // --- SECTION 2: HERITAGE & THE AHRMANN FAMILY (#historie) ---
  const heritageSec = document.querySelector('.heritage-editorial-section');
  if (heritageSec) {
    const header = heritageSec.querySelector('.heritage-editorial-header');
    if (header) {
      const eyebrow = header.querySelector('.heritage-eyebrow');
      const rule = header.querySelector('.heritage-rule');
      const heading = header.querySelector('.heritage-heading');
      const subheading = header.querySelector('.heritage-subheading');

      const tlHeritageHeader = gsap.timeline({
        scrollTrigger: {
          trigger: header,
          start: 'top 84%',
          toggleActions: 'play none none reverse'
        }
      });

      if (eyebrow) tlHeritageHeader.fromTo(eyebrow, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0);
      if (rule) tlHeritageHeader.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: 'power2.out' }, 0.12);
      if (heading) tlHeritageHeader.fromTo(heading, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 0.18);
      if (subheading) tlHeritageHeader.fromTo(subheading, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.75, ease: 'power2.out' }, 0.28);
    }

    const mediaCard = heritageSec.querySelector('.heritage-media-card');
    const familyImg = heritageSec.querySelector('.heritage-family-img');
    const etymology = heritageSec.querySelector('.heritage-etymology');

    if (mediaCard) {
      gsap.fromTo(mediaCard,
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: mediaCard,
            start: 'top 86%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      if (familyImg && window.innerWidth > 768) {
        gsap.fromTo(familyImg,
          { scale: 1.05 },
          {
            scale: 1.0,
            ease: 'none',
            scrollTrigger: {
              trigger: mediaCard,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.2
            }
          }
        );
      }
    }

    if (etymology) {
      gsap.fromTo(etymology,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: etymology,
            start: 'top 90%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }

    // Milestones staggered reveal
    const milestones = heritageSec.querySelectorAll('.heritage-milestone');
    if (milestones.length) {
      milestones.forEach((ms) => {
        const marker = ms.querySelector('.heritage-timeline-marker');
        const content = ms.querySelector('.heritage-milestone-content');

        const tlMs = gsap.timeline({
          scrollTrigger: {
            trigger: ms,
            start: 'top 88%',
            toggleActions: 'play none none reverse'
          }
        });

        if (marker) {
          tlMs.fromTo(marker,
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' },
            0
          );
        }

        if (content) {
          tlMs.fromTo(content,
            { opacity: 0, x: 20 },
            { opacity: 1, x: 0, duration: 0.7, ease: 'power2.out' },
            0.15
          );
        }
      });
    }

    const ctaBtn = heritageSec.querySelector('.heritage-timeline-cta');
    if (ctaBtn) {
      gsap.fromTo(ctaBtn,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: ctaBtn,
            start: 'top 92%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }
  }
}

/* ==========================================================================
   10. WELLNESS & SPA EDITORIAL ANIMATIONS
   ========================================================================== */
function initWellnessExperienceAnimation() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  const wellnessSec = document.querySelector('.wellness-editorial-section');
  if (!wellnessSec) return;

  const contentCol = wellnessSec.querySelector('.wellness-editorial-content');
  const saunaCard = wellnessSec.querySelector('.wellness-media-card--sauna');
  const bedroomCard = wellnessSec.querySelector('.wellness-media-card--bedroom');
  const saunaImg = wellnessSec.querySelector('.wellness-img-sauna');
  const bedroomImg = wellnessSec.querySelector('.wellness-img-bedroom');

  // 1. Text Narrative Cascade
  if (contentCol) {
    const meta = contentCol.querySelector('.wellness-editorial-meta');
    const rule = contentCol.querySelector('.wellness-editorial-rule');
    const heading = contentCol.querySelector('.wellness-editorial-heading');
    const subheading = contentCol.querySelector('.wellness-editorial-subheading');
    const badge = contentCol.querySelector('.wellness-editorial-badge');
    const paras = contentCol.querySelectorAll('.wellness-editorial-paragraphs p');
    const hoursCard = contentCol.querySelector('.wellness-hours-card');
    const actions = contentCol.querySelector('.wellness-editorial-actions');

    const tlContent = gsap.timeline({
      scrollTrigger: {
        trigger: wellnessSec,
        start: 'top 82%',
        toggleActions: 'play none none reverse'
      }
    });

    if (meta) tlContent.fromTo(meta, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0);
    if (rule) tlContent.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: 'power2.out' }, 0.12);
    if (heading) tlContent.fromTo(heading, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 0.18);
    if (subheading) tlContent.fromTo(subheading, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.75, ease: 'power2.out' }, 0.28);
    if (badge) tlContent.fromTo(badge, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' }, 0.35);
    if (paras.length) tlContent.fromTo(paras, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power2.out' }, 0.42);
    if (hoursCard) tlContent.fromTo(hoursCard, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 0.55);
    if (actions) tlContent.fromTo(actions, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0.68);
  }

  // 2. Images Entrance
  if (saunaCard) {
    gsap.fromTo(saunaCard,
      { opacity: 0, y: 35, scale: 0.98 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.95,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: saunaCard,
          start: 'top 86%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  }

  if (bedroomCard) {
    gsap.fromTo(bedroomCard,
      { opacity: 0, y: 40, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.95,
        delay: 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: bedroomCard,
          start: 'top 88%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  }

  // Subtle Parallax on Desktop
  if (window.innerWidth > 768) {
    if (saunaImg) {
      gsap.fromTo(saunaImg,
        { y: -10 },
        {
          y: 10,
          ease: 'none',
          scrollTrigger: {
            trigger: saunaCard,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2
          }
        }
      );
    }
    if (bedroomImg) {
      gsap.fromTo(bedroomImg,
        { y: -14 },
        {
          y: 14,
          ease: 'none',
          scrollTrigger: {
            trigger: bedroomCard,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.4
          }
        }
      );
    }
  }

  // 3. The Art of Slowing Down Pillars Stagger
  const slowDown = wellnessSec.querySelector('.wellness-slow-down');
  if (slowDown) {
    const pillars = slowDown.querySelectorAll('.wellness-pillar-card');
    if (pillars.length) {
      gsap.fromTo(pillars,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: slowDown,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }
  }
}

/* ==========================================================================
   11. SURROUNDINGS & NATURE EDITORIAL ANIMATIONS
   ========================================================================== */
function initSurroundingsEditorialAnimation() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  const surroundingsSec = document.querySelector('.surroundings-editorial-section');
  if (!surroundingsSec) return;

  // 1. Header Entrance
  const header = surroundingsSec.querySelector('.surroundings-editorial-header');
  if (header) {
    const meta = header.querySelector('.surroundings-meta');
    const rule = header.querySelector('.surroundings-rule');
    const crest = header.querySelector('.surroundings-crest');
    const heading = header.querySelector('.surroundings-heading');
    const desc = header.querySelector('.surroundings-desc');

    const tlHeader = gsap.timeline({
      scrollTrigger: {
        trigger: header,
        start: 'top 85%',
        toggleActions: 'play none none reverse'
      }
    });

    if (meta) tlHeader.fromTo(meta, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.65, ease: 'power2.out' }, 0);
    if (rule) tlHeader.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 0.75, ease: 'power2.out' }, 0.1);
    if (crest) tlHeader.fromTo(crest, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.16);
    if (heading) tlHeader.fromTo(heading, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 0.22);
    if (desc) tlHeader.fromTo(desc, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.75, ease: 'power2.out' }, 0.32);
  }

  // 2. Staggered Feature Cards Entrance
  const cards = surroundingsSec.querySelectorAll('.surroundings-card');
  if (cards.length) {
    gsap.fromTo(cards,
      { opacity: 0, y: 36 },
      {
        opacity: 1,
        y: 0,
        duration: 0.85,
        stagger: 0.18,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: surroundingsSec.querySelector('.surroundings-cards-grid') || surroundingsSec,
          start: 'top 84%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  }

  // 3. Subtle Desktop Parallax on Images
  if (window.innerWidth > 768) {
    cards.forEach(card => {
      const img = card.querySelector('.surroundings-card__img');
      if (img) {
        gsap.fromTo(img,
          { y: -12 },
          {
            y: 12,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.2
            }
          }
        );
      }
    });
  }
}
