const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.site-nav');
const mobileCta = document.querySelector('.mobile-cta');
const footer = document.querySelector('.site-footer');

const setMenuState = (open) => {
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  menu.classList.toggle('is-open', open);
  document.body.classList.toggle('menu-open', open);

  if (open) {
    menu.querySelector('a')?.focus();
  } else {
    menuToggle.focus();
  }
};

menuToggle?.addEventListener('click', () => {
  setMenuState(menuToggle.getAttribute('aria-expanded') !== 'true');
});

menu?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    if (menuToggle.getAttribute('aria-expanded') === 'true') {
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open menu');
      menu.classList.remove('is-open');
      document.body.classList.remove('menu-open');
    }
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuToggle?.getAttribute('aria-expanded') === 'true') {
    setMenuState(false);
  }
});

const updateHeader = () => {
  header?.classList.toggle('is-scrolled', window.scrollY > 24);
};

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -50px' },
);

document.querySelectorAll('[data-reveal]').forEach((element) => revealObserver.observe(element));

const tabs = [...document.querySelectorAll('[role="tab"]')];

const activateTab = (nextTab) => {
  tabs.forEach((tab) => {
    const active = tab === nextTab;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    const panel = document.getElementById(tab.getAttribute('aria-controls'));
    panel.hidden = !active;
  });
};

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateTab(tab));
  tab.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    let nextIndex = index;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = tabs.length - 1;
    activateTab(tabs[nextIndex]);
    tabs[nextIndex].focus();
  });
});

const copyText = async (value) => {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch {
      // Some browsers expose the API but still deny access. Use the local fallback below.
    }
  }

  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.append(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  textarea.remove();
  if (!copied) throw new Error('Copy failed');
};

const enquiryForm = document.querySelector('[data-enquiry-form]');
const formStatus = document.querySelector('[data-form-status]');

enquiryForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!enquiryForm.reportValidity()) return;

  const formData = new FormData(enquiryForm);
  const vehicle = formData.get('vehicle');
  const focus = formData.get('focus');
  const postcode = String(formData.get('postcode') || '').trim().toUpperCase();
  const locationLine = postcode ? ` My postcode area is ${postcode}.` : '';
  const message = `Hi Studio Zhuravel, I'd like a mobile valeting quote for my ${vehicle}. The main focus is ${String(focus).toLowerCase()}.${locationLine} Please let me know what details or photos you need.`;

  try {
    await copyText(message);
    formStatus.textContent = 'Enquiry copied — open Instagram and paste it into your message.';
  } catch {
    formStatus.textContent = `Copy this message: ${message}`;
  }
});

document.querySelector('[data-year]').textContent = new Date().getFullYear();

if (mobileCta && footer) {
  const footerObserver = new IntersectionObserver((entries) => {
    mobileCta.classList.toggle('is-hidden', entries[0].isIntersecting);
  });
  footerObserver.observe(footer);
}
