import './styles.css';

const eventDetails = {
  title: 'Noor & Zayn — Mehendi',
  start: '20261017T143000Z',
  end: '20261017T180000Z',
  location: 'Beach Luxury Hotel, M. T. Khan Road, Karachi, Pakistan',
  description: 'An evening of mehendi, music, colour and celebration.'
};

const opener = document.querySelector('#opener');
const enterButton = document.querySelector('#enter-button');

function openInvitation() {
  opener.classList.add('is-opening');
  document.body.classList.remove('is-locked');
  window.setTimeout(() => {
    opener.hidden = true;
    document.querySelector('#main').focus({ preventScroll: true });
  }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 30 : 1050);
}

enterButton.addEventListener('click', openInvitation);

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

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

const dialog = document.querySelector('#rsvp-dialog');
const form = document.querySelector('#rsvp-form');
document.querySelector('#rsvp-button').addEventListener('click', () => dialog.showModal());
document.querySelector('#dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
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

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('.reveal').forEach((element) => element.classList.add('is-visible'));
}
