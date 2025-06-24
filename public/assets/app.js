function createMessageHTML(msg) {
  const now = new Date();
  const msgDate = new Date(msg.timestamp.replace(' ', 'T'));

  const pad = n => n.toString().padStart(2, '0');
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const stripTime = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffMs = stripTime(now) - stripTime(msgDate);
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const timePart = `${pad(msgDate.getHours())}:${pad(msgDate.getMinutes())}`;

  let dateLabel;
  if (diffDays === 0) {
    dateLabel = `Today at ${timePart}`;
  } else if (diffDays === 1) {
    dateLabel = `Yesterday at ${timePart}`;
  } else if (diffDays >= 2 && diffDays <= 7) {
    dateLabel = `${dayNames[msgDate.getDay()]} ${timePart}`;
  } else {
    dateLabel = `${dayNames[msgDate.getDay()]}, ${pad(msgDate.getDate())} ${monthNames[msgDate.getMonth()]} at ${timePart}`;
  }

  return `
    <section>
      <div class="text-gray-400 text-xs text-center mb-2">${dateLabel}</div>
      <div class="relative bg-[#262529] rounded-2xl p-3  max-w-[68%] leading-[1.2]">
        <p>${msg.text}</p>
        <svg class="absolute left-[-6px] bottom-[-7px] rotate-180" width="32" height="18" viewBox="0 0 32 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 18 Q8 3 32 0 Q20 12 12 18 Q8 18 0 18 Z" fill="#262529" />
        </svg>
      </div>
    </section>
  `;
}

async function renderMessages({ smoothScroll = false } = {}) {
  try {
    const res = await fetch('api.php');
    if (!res.ok) throw new Error('Network error');
    const messages = await res.json();

    const container = document.getElementById('messages');
    container.innerHTML = '';
    messages.forEach(msg => {
      container.insertAdjacentHTML('beforeend', createMessageHTML(msg));
    });

    requestAnimationFrame(() => {
      if (smoothScroll) {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      } else {
        window.scrollTo(0, document.body.scrollHeight);
      }
    });
  } catch (e) {
    console.error(e);
  }
}

async function addMessage() {
  const now = new Date();
  const pad = n => n.toString().padStart(2, '0');

  const text = `Kupivte bilet za edno vozenje so cena od 40den na ${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())} chasot.`;

  const payload = {
    text,
    sender: 'user',
    timestamp: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
  };

  try {
    const res = await fetch('api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Network response was not ok');
  } catch (error) {
    console.error('Failed to send message:', error);
  }

  await renderMessages({ smoothScroll: true });
}

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('addMessageBtn')?.addEventListener('click', addMessage);
  renderMessages(); // instant scroll on page load
});
