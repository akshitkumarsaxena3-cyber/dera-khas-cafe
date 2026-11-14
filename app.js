/**
 * DeraKhas Cafe & Restro - Client Script
 * Handles real-time operational status, menu filtering, WhatsApp orders,
 * table reservations, modal dialogs, and mobile menu toggling.
 */

document.addEventListener('DOMContentLoaded', () => {
  initLiveHours();
  initMenuFilter();
  initReservationForm();
  initPartyModal();
  initMobileNav();
  initScrollSpy();
});

// Primary Contact Numbers
const WHATSAPP_PRIMARY = '918755145954';
const WHATSAPP_EVENTS = '919105533005';

/* ==========================================================================
   1. Live Operational Hours Calculator (Indian Standard Time - UTC+5:30)
   ========================================================================== */
function initLiveHours() {
  const schedule = {
    0: { open: 10.0, close: 23.0, name: 'Sunday', formatted: '10:00 AM – 11:00 PM' },
    1: { open: 12.0, close: 23.0, name: 'Monday', formatted: '12:00 PM – 11:00 PM' },
    2: { open: 12.0, close: 23.0, name: 'Tuesday', formatted: '12:00 PM – 11:00 PM' },
    3: { open: 12.0, close: 23.0, name: 'Wednesday', formatted: '12:00 PM – 11:00 PM' },
    4: { open: 12.0, close: 23.0, name: 'Thursday', formatted: '12:00 PM – 11:00 PM' },
    5: { open: 12.0, close: 22.0, name: 'Friday', formatted: '12:00 PM – 10:00 PM' },
    6: { open: 10.0, close: 22.0, name: 'Saturday', formatted: '10:00 AM – 10:00 PM' }
  };

  // Calculate current IST time
  const now = new Date();
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(utcTime + istOffset);

  const dayOfWeek = istDate.getDay();
  const currentHours = istDate.getHours() + (istDate.getMinutes() / 60);

  const todaySchedule = schedule[dayOfWeek];
  const isOpen = (currentHours >= todaySchedule.open && currentHours < todaySchedule.close);

  // Update Top Pill
  const topPill = document.getElementById('live-status-pill');
  if (topPill) {
    if (isOpen) {
      topPill.classList.remove('closed');
      topPill.innerHTML = '<i class="fa-solid fa-circle"></i> Open Now (Till ' + formatHour(todaySchedule.close) + ')';
    } else {
      topPill.classList.add('closed');
      topPill.innerHTML = '<i class="fa-solid fa-circle"></i> Closed Now (Opens at ' + formatHour(todaySchedule.open) + ')';
    }
  }

  // Update Timings Card
  const statusHeadline = document.getElementById('status-text-headline');
  const statusSub = document.getElementById('status-text-sub');
  const statusIcon = document.getElementById('status-icon-box');

  if (statusHeadline && statusSub && statusIcon) {
    if (isOpen) {
      statusIcon.classList.remove('closed');
      statusIcon.innerHTML = '<i class="fa-solid fa-door-open"></i>';
      statusHeadline.textContent = 'Currently Open';
      statusHeadline.style.color = '#10b981';
      statusSub.textContent = `Today (${todaySchedule.name}): Closes at ${formatHour(todaySchedule.close)}`;
    } else {
      statusIcon.classList.add('closed');
      statusIcon.innerHTML = '<i class="fa-solid fa-door-closed"></i>';
      statusHeadline.textContent = 'Currently Closed';
      statusHeadline.style.color = '#ef4444';
      statusSub.textContent = `Opens today at ${formatHour(todaySchedule.open)}`;
    }
  }

  // Highlight Current Day in Table
  const dayRows = document.querySelectorAll('.day-row');
  dayRows.forEach(row => {
    if (parseInt(row.getAttribute('data-day'), 10) === dayOfWeek) {
      row.classList.add('current-day');
    }
  });
}

function formatHour(decimalHour) {
  const h = Math.floor(decimalHour);
  const m = Math.round((decimalHour - h) * 60);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const minStr = m > 0 ? `:${m < 10 ? '0' : ''}${m}` : ':00';
  return `${hour12}${minStr} ${period}`;
}

/* ==========================================================================
   2. Menu Filter Tabs
   ========================================================================== */
function initMenuFilter() {
  const tabs = document.querySelectorAll('.menu-tabs .tab-btn');
  const cards = document.querySelectorAll('.menu-grid .menu-card');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const targetCategory = tab.getAttribute('data-category');

      cards.forEach(card => {
        const itemCategory = card.getAttribute('data-category');
        if (targetCategory === 'all' || itemCategory === targetCategory) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.4s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   3. Single Item WhatsApp Order
   ========================================================================== */
window.orderItemWhatsApp = function(itemName, price) {
  const message = `Hello DeraKhas Cafe! 🍽️%0A%0AI would like to order:%0A• *${encodeURIComponent(itemName)}* (${encodeURIComponent(price)})%0A%0APlease let me know the preparation time and total amount for takeaway/delivery.`;
  const url = `https://wa.me/${WHATSAPP_PRIMARY}?text=${message}`;
  window.open(url, '_blank');
};

/* ==========================================================================
   4. Table Reservation Form Handler
   ========================================================================== */
function initReservationForm() {
  const form = document.getElementById('reservation-form');
  const dateInput = document.getElementById('res-date');

  // Set minimum date to today
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('res-name').value.trim();
      const phone = document.getElementById('res-phone').value.trim();
      const guests = document.getElementById('res-guests').value;
      const date = document.getElementById('res-date').value;
      const time = document.getElementById('res-time').value;
      const seating = document.getElementById('res-seating').value;
      const notes = document.getElementById('res-notes').value.trim();

      let text = `*New Table Reservation Request* 🪑✨%0A%0A`;
      text += `👤 *Name:* ${encodeURIComponent(name)}%0A`;
      text += `📞 *Phone:* ${encodeURIComponent(phone)}%0A`;
      text += `👥 *Guests:* ${encodeURIComponent(guests)}%0A`;
      text += `📅 *Date:* ${encodeURIComponent(date)}%0A`;
      text += `⏰ *Time:* ${encodeURIComponent(time)}%0A`;
      text += `🛋️ *Seating:* ${encodeURIComponent(seating)}%0A`;
      if (notes) {
        text += `📝 *Special Notes:* ${encodeURIComponent(notes)}%0A`;
      }
      text += `%0APlease confirm my table reservation. Thank you!`;

      const whatsappUrl = `https://wa.me/${WHATSAPP_PRIMARY}?text=${text}`;
      window.open(whatsappUrl, '_blank');
    });
  }
}

/* ==========================================================================
   5. Party Hall Modal & Inquiry Form
   ========================================================================== */
window.openPartyModal = function() {
  const modal = document.getElementById('party-modal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
};

window.closePartyModal = function() {
  const modal = document.getElementById('party-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
};

function initPartyModal() {
  const partyDate = document.getElementById('party-date');
  if (partyDate) {
    const today = new Date().toISOString().split('T')[0];
    partyDate.min = today;
    partyDate.value = today;
  }

  const partyForm = document.getElementById('party-inquiry-form');
  if (partyForm) {
    partyForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('party-name').value.trim();
      const phone = document.getElementById('party-phone').value.trim();
      const eventType = document.getElementById('party-type').value;
      const guests = document.getElementById('party-guests').value;
      const date = document.getElementById('party-date').value;
      const reqs = document.getElementById('party-requirements').value.trim();

      let text = `*Party Hall & Banquet Inquiry* 🎉🎊%0A%0A`;
      text += `👤 *Client Name:* ${encodeURIComponent(name)}%0A`;
      text += `📞 *Phone:* ${encodeURIComponent(phone)}%0A`;
      text += `🎈 *Occasion:* ${encodeURIComponent(eventType)}%0A`;
      text += `👥 *Estimated Guests:* ${encodeURIComponent(guests)}%0A`;
      text += `📅 *Date:* ${encodeURIComponent(date)}%0A`;
      if (reqs) {
        text += `✨ *Requirements:* ${encodeURIComponent(reqs)}%0A`;
      }
      text += `%0APlease share banquet package details and availability.`;

      const whatsappUrl = `https://wa.me/${WHATSAPP_EVENTS}?text=${text}`;
      window.open(whatsappUrl, '_blank');
      closePartyModal();
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closePartyModal();
    }
  });
}

/* ==========================================================================
   6. Mobile Navigation
   ========================================================================== */
function initMobileNav() {
  const toggle = document.getElementById('mobile-toggle');
  const menu = document.getElementById('nav-menu');
  const links = document.querySelectorAll('.nav-link');

  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      menu.classList.toggle('open');
      toggle.classList.toggle('active');
    });

    links.forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.remove('open');
        toggle.classList.remove('active');
      });
    });
  }
}

/* ==========================================================================
   7. Scroll Spy & Navbar Shadow
   ========================================================================== */
function initScrollSpy() {
  const navbar = document.getElementById('navbar');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    // Navbar glass shadow on scroll
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // ScrollSpy active link update
    let currentSection = '';
    const scrollPosition = window.pageYOffset + 120;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  });
}
