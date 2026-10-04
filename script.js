(() => {
  const root = document.documentElement;
  const storedScale = Number(localStorage.getItem('sravani-font-scale'));
  let fontScale = Number.isFinite(storedScale) && storedScale ? storedScale : 1;
  const applyScale = () => root.style.setProperty('--base', `${16 * fontScale}px`);
  applyScale();

  document.querySelectorAll('[data-font-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.fontAction;
      if (action === 'increase') fontScale = Math.min(1.25, fontScale + 0.05);
      if (action === 'decrease') fontScale = Math.max(0.9, fontScale - 0.05);
      if (action === 'reset') fontScale = 1;
      localStorage.setItem('sravani-font-scale', String(fontScale));
      applyScale();
    });
  });

  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.main-nav');
  if (menuButton && navigation) {
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') !== 'true';
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      menuButton.textContent = open ? '×' : '☰';
      navigation.classList.toggle('is-open', open);
    });
    navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open navigation');
      menuButton.textContent = '☰';
      navigation.classList.remove('is-open');
    }));
  }

  document.querySelectorAll('[data-appointment-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const name = String(data.get('fullName') || '').trim();
      const mobile = String(data.get('mobile') || '').trim();
      const service = String(data.get('service') || '').trim();
      const message = `Hello, I would like to request an eye care appointment.\nName: ${name}\nMobile: ${mobile}\nService: ${service}`;
      const status = form.querySelector('[data-form-message]');
      if (status) status.textContent = 'Opening WhatsApp with your appointment request…';
      window.open(`https://wa.me/918143062562?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    });
  });

  const symptomTabs = [...document.querySelectorAll('[data-symptom]')];
  symptomTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      symptomTabs.forEach((item) => {
        const selected = item === tab;
        item.setAttribute('aria-selected', String(selected));
        item.tabIndex = selected ? 0 : -1;
        const panel = document.getElementById(item.getAttribute('aria-controls'));
        if (panel) panel.hidden = !selected;
      });
    });
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      const offset = event.key === 'ArrowRight' ? 1 : -1;
      const next = symptomTabs[(index + offset + symptomTabs.length) % symptomTabs.length];
      next.focus();
      next.click();
    });
  });

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-carousel]').forEach((carousel) => {
    const track = carousel.querySelector('[data-carousel-track]');
    if (!track) return;
    const slides = [...track.querySelectorAll('.carousel-slide')];
    if (slides.length <= 1) return;
    const autoplayEnabled = carousel.getAttribute('data-carousel-autoplay') !== 'false';
    const prevButton = carousel.querySelector('[data-carousel-control="prev"]');
    const nextButton = carousel.querySelector('[data-carousel-control="next"]');
    const dots = [...carousel.querySelectorAll('[data-carousel-to]')];
    let activeIndex = 0;
    let autoplayTimer = null;

    const sync = (index) => {
      activeIndex = (index + slides.length) % slides.length;
      track.style.transform = `translateX(-${activeIndex * 100}%)`;
      slides.forEach((slide, slideIndex) => slide.classList.toggle('is-active', slideIndex === activeIndex));
      dots.forEach((dot, dotIndex) => {
        const selected = dotIndex === activeIndex;
        dot.classList.toggle('is-active', selected);
        dot.setAttribute('aria-selected', String(selected));
      });
    };

    const clearAutoplay = () => {
      if (!autoplayTimer) return;
      window.clearInterval(autoplayTimer);
      autoplayTimer = null;
    };

    const startAutoplay = () => {
      if (prefersReducedMotion || !autoplayEnabled) return;
      clearAutoplay();
      autoplayTimer = window.setInterval(() => {
        sync(activeIndex + 1);
      }, 4500);
    };

    if (prevButton) prevButton.addEventListener('click', () => sync(activeIndex - 1));
    if (nextButton) nextButton.addEventListener('click', () => sync(activeIndex + 1));
    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const index = Number(dot.getAttribute('data-carousel-to'));
        if (Number.isInteger(index)) sync(index);
      });
    });

    carousel.addEventListener('mouseenter', clearAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);
    carousel.addEventListener('focusin', clearAutoplay);
    carousel.addEventListener('focusout', (event) => {
      if (carousel.contains(event.relatedTarget)) return;
      startAutoplay();
    });

    sync(0);
    startAutoplay();
  });

  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    reveals.forEach((item) => observer.observe(item));
  } else {
    reveals.forEach((item) => item.classList.add('is-visible'));
  }

  document.querySelectorAll('[data-year]').forEach((node) => { node.textContent = new Date().getFullYear(); });
  const testimonialsSection = document.getElementById('testimonials');
  if (testimonialsSection) {
    const title = testimonialsSection.querySelector('.section-title');
    const intro = testimonialsSection.querySelector('.section-intro');
    if (title) title.textContent = 'Testimonials from our community';
    if (intro) intro.textContent = 'Slide and press play.';
  }
})();
