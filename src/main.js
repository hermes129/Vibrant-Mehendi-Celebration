import './styles.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const eventDetails = {
  title: 'Noor & Zayn — Mehendi',
  start: '20261017T143000Z',
  end: '20261017T180000Z',
  location: 'Beach Luxury Hotel, M. T. Khan Road, Karachi, Pakistan',
  description: 'An evening of mehendi, music, colour and celebration.'
};

const opener = document.querySelector('#opener');
const enterButton = document.querySelector('#enter-button');
const main = document.querySelector('#main');
const skipLink = document.querySelector('.skip-link');
const music = document.querySelector('#site-music');
const musicToggle = document.querySelector('#music-toggle');
const musicLabel = musicToggle.querySelector('.music-toggle__label');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let heroAnimationStarted = false;

music.volume = 0.34;

function syncMusicControl() {
  const isPlaying = !music.paused;
  musicToggle.classList.toggle('is-playing', isPlaying);
  musicToggle.setAttribute('aria-pressed', String(isPlaying));
  musicToggle.setAttribute('aria-label', isPlaying ? 'Pause mehendi music' : 'Play mehendi music');
  musicLabel.textContent = isPlaying ? 'Dhol playing' : 'Play music';
}

async function setMusicPlaying(shouldPlay) {
  if (!shouldPlay) {
    music.pause();
    syncMusicControl();
    return;
  }

  try {
    await music.play();
  } catch {
    // The persistent control remains available if a browser blocks playback.
  }
  syncMusicControl();
}

function prepareHeroIntro() {
  if (reduceMotion.matches) return;
  gsap.set('.hero__image', { scale: 1.08 });
  gsap.set('.hero__topline p', { autoAlpha: 0, y: -18 });
  gsap.set('.hero__copy .eyebrow', { autoAlpha: 0, y: 20 });
  gsap.set('.hero__copy h2 > *', { autoAlpha: 0, y: 46 });
  gsap.set('.hero__dek', { autoAlpha: 0, y: 24 });
  gsap.set('.scroll-cue', { autoAlpha: 0, x: 18 });
}

function animateHeroIntro() {
  if (reduceMotion.matches || heroAnimationStarted) return;
  heroAnimationStarted = true;
  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .to('.hero__image', { scale: 1, duration: 1.8, ease: 'power2.out' }, 0)
    .to('.hero__topline p', { autoAlpha: 1, y: 0, duration: .65, stagger: .1 }, .08)
    .to('.hero__copy .eyebrow', { autoAlpha: 1, y: 0, duration: .55 }, .2)
    .to('.hero__copy h2 > *', { autoAlpha: 1, y: 0, duration: .85, stagger: .12 }, .27)
    .to('.hero__dek', { autoAlpha: 1, y: 0, duration: .7 }, .68)
    .to('.scroll-cue', { autoAlpha: 1, x: 0, duration: .6 }, .82);
}

function finishOpening() {
  opener.hidden = true;
  main.focus({ preventScroll: true });
  ScrollTrigger.refresh();
}

function openInvitation(startMusic = true) {
  if (opener.classList.contains('is-opening')) return;
  opener.classList.add('is-opening');
  enterButton.disabled = true;
  document.body.classList.remove('is-locked');
  musicToggle.hidden = false;
  if (startMusic) setMusicPlaying(true);

  if (reduceMotion.matches) {
    animateHeroIntro();
    window.setTimeout(finishOpening, 30);
    return;
  }

  const contentPieces = opener.querySelectorAll(
    '.opener__content > .eyebrow, .opener__content h1 > *, .opener__date, .opener__hint'
  );

  gsap.timeline({
    defaults: { ease: 'power3.inOut' },
    onComplete: finishOpening
  })
    .to(enterButton, {
      autoAlpha: 0,
      scale: .7,
      rotation: 16,
      duration: .5,
      ease: 'back.in(1.5)'
    }, 0)
    .to(contentPieces, {
      autoAlpha: 0,
      y: -24,
      duration: .5,
      stagger: .035,
      ease: 'power2.in'
    }, 0)
    .to('.garland--opener', {
      autoAlpha: 0,
      yPercent: -145,
      scale: .9,
      duration: .85
    }, .04)
    .to('.lantern--opener-left', {
      autoAlpha: 0,
      xPercent: -175,
      y: -28,
      rotation: -16,
      duration: .9
    }, .04)
    .to('.lantern--opener-right', {
      autoAlpha: 0,
      xPercent: 175,
      y: -28,
      rotation: 16,
      duration: .9
    }, .04)
    .call(animateHeroIntro, [], .25)
    .to('.opener__panel--left', { xPercent: -101, duration: 1.08 }, .18)
    .to('.opener__panel--right', { xPercent: 101, duration: 1.08 }, .18);
}

prepareHeroIntro();
enterButton.addEventListener('click', () => openInvitation(true));
skipLink.addEventListener('click', () => openInvitation(false));
musicToggle.addEventListener('click', () => setMusicPlaying(music.paused));
music.addEventListener('play', syncMusicControl);
music.addEventListener('pause', syncMusicControl);

document.querySelector('#calendar-button').addEventListener('click', () => {
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Noor and Zayn//Mehendi//EN',
    'BEGIN:VEVENT', `DTSTART:${eventDetails.start}`, `DTEND:${eventDetails.end}`,
    `SUMMARY:${eventDetails.title}`, `DESCRIPTION:${eventDetails.description}`,
    `LOCATION:${eventDetails.location}`, 'END:VEVENT', 'END:VCALENDAR'
  ].join('\r\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  link.download = 'noor-zayn-mehendi.ics';
  link.click();
  URL.revokeObjectURL(link.href);
});

document.querySelector('#copy-address').addEventListener('click', async () => {
  const status = document.querySelector('#copy-status');
  try {
    await navigator.clipboard.writeText(eventDetails.location);
    status.textContent = 'Address copied.';
  } catch {
    status.textContent = eventDetails.location;
  }
});

const eventTime = new Date('2026-10-17T19:30:00+05:00').getTime();
function updateCountdown() {
  const distance = Math.max(0, eventTime - Date.now());
  const values = {
    days: Math.floor(distance / 86400000),
    hours: Math.floor((distance % 86400000) / 3600000),
    minutes: Math.floor((distance % 3600000) / 60000),
    seconds: Math.floor((distance % 60000) / 1000)
  };
  Object.entries(values).forEach(([unit, value]) => {
    document.querySelector(`[data-unit="${unit}"]`).textContent = String(value).padStart(2, '0');
  });
}
updateCountdown();
window.setInterval(updateCountdown, 1000);

function setupScrollAnimations() {
  const revealElements = gsap.utils.toArray('.reveal');

  if (reduceMotion.matches) {
    gsap.set(revealElements, { clearProps: 'all' });
    return;
  }

  revealElements.forEach((element) => {
    const from = { autoAlpha: 0, y: 54 };

    if (element.classList.contains('invitation__copy')) Object.assign(from, { x: -56, y: 0 });
    if (element.classList.contains('event-card')) Object.assign(from, { x: 56, y: 0, rotation: -1, scale: .97 });
    if (element.classList.contains('portrait-story__image-wrap')) Object.assign(from, { x: -50, y: 0, rotation: -5 });
    if (element.classList.contains('portrait-story__copy')) Object.assign(from, { x: 50, y: 0 });
    if (element.classList.contains('venue__card')) Object.assign(from, { x: 58, y: 0 });

    gsap.from(element, {
      ...from,
      duration: .92,
      ease: 'power3.out',
      clearProps: 'transform,opacity,visibility',
      scrollTrigger: {
        trigger: element,
        start: 'top 88%',
        once: true,
        invalidateOnRefresh: true
      }
    });
  });

  gsap.from('.countdown__grid > div', {
    autoAlpha: 0,
    y: 30,
    scale: .92,
    duration: .7,
    stagger: .1,
    ease: 'back.out(1.4)',
    clearProps: 'transform,opacity,visibility',
    scrollTrigger: {
      trigger: '.countdown__grid',
      start: 'top 86%',
      once: true
    }
  });

  gsap.to('.lantern--invitation', {
    y: 42,
    rotation: 5,
    ease: 'none',
    scrollTrigger: {
      trigger: '.invitation',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1
    }
  });

  gsap.to('.peacock--programme', {
    y: -42,
    ease: 'none',
    scrollTrigger: {
      trigger: '.programme',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1
    }
  });

  gsap.to('.chakri--countdown-left', {
    rotation: '+=85',
    ease: 'none',
    scrollTrigger: {
      trigger: '.countdown',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1
    }
  });

  gsap.to('.chakri--countdown-right', {
    rotation: '-=85',
    ease: 'none',
    scrollTrigger: {
      trigger: '.countdown',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1
    }
  });
}

setupScrollAnimations();

const dialog = document.querySelector('#rsvp-dialog');
const dialogInner = dialog.querySelector('.rsvp-dialog__inner');
const form = document.querySelector('#rsvp-form');

function openRsvpDialog() {
  dialog.showModal();
  if (reduceMotion.matches) return;
  gsap.fromTo(dialogInner, {
    autoAlpha: 0,
    y: 28,
    scale: .97
  }, {
    autoAlpha: 1,
    y: 0,
    scale: 1,
    duration: .42,
    ease: 'power3.out',
    clearProps: 'transform,opacity,visibility'
  });
}

function closeRsvpDialog() {
  if (!dialog.open) return;
  if (reduceMotion.matches) {
    dialog.close();
    return;
  }
  gsap.to(dialogInner, {
    autoAlpha: 0,
    y: 20,
    scale: .98,
    duration: .24,
    ease: 'power2.in',
    onComplete: () => {
      dialog.close();
      gsap.set(dialogInner, { clearProps: 'transform,opacity,visibility' });
    }
  });
}

document.querySelector('#rsvp-button').addEventListener('click', openRsvpDialog);
document.querySelector('#dialog-close').addEventListener('click', closeRsvpDialog);
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) closeRsvpDialog();
});
dialog.addEventListener('cancel', (event) => {
  event.preventDefault();
  closeRsvpDialog();
});

function celebrate() {
  const host = document.querySelector('#confetti');
  const colours = ['#f6b51b', '#e93675', '#2155cd', '#257b4c', '#ed6a3a', '#fff4d8'];
  host.replaceChildren();
  for (let i = 0; i < 56; i += 1) {
    const piece = document.createElement('i');
    piece.style.setProperty('--x', `${Math.random() * 100}vw`);
    piece.style.setProperty('--delay', `${Math.random() * 0.5}s`);
    piece.style.setProperty('--duration', `${1.8 + Math.random() * 1.6}s`);
    piece.style.setProperty('--colour', colours[i % colours.length]);
    piece.style.setProperty('--turn', `${Math.random() * 720 - 360}deg`);
    host.append(piece);
  }
  host.classList.add('is-active');
  window.setTimeout(() => host.classList.remove('is-active'), 3800);
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const status = document.querySelector('#form-status');
  const data = Object.fromEntries(new FormData(form));
  const endpoint = form.dataset.endpoint;
  try {
    if (endpoint) {
      const response = await fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Submission failed');
    } else {
      localStorage.setItem('noor-zayn-mehendi-rsvp', JSON.stringify({ ...data, submittedAt: new Date().toISOString() }));
    }
    status.textContent = `Shukriya, ${data.name}! Your reply has been saved.`;
    form.reset();
    celebrate();
  } catch {
    status.textContent = 'We could not send that reply. Please try again.';
  }
});
