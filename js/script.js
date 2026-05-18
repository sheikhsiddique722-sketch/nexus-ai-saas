// ─── Theme toggle ─────────────────────────────
const themeBtn = document.getElementById('themeToggle');
const iconMoon = document.getElementById('iconMoon');
const iconSun  = document.getElementById('iconSun');
themeBtn.addEventListener('click', () => {
  const cur  = document.documentElement.getAttribute('data-theme');
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  iconMoon.style.display = next === 'dark' ? '' : 'none';
  iconSun.style.display  = next === 'dark' ? 'none' : '';
});

// ─── Mobile menu ───────────────────────────────
const mobileBtn = document.getElementById('mobileToggle');
const navLinks  = document.getElementById('navLinks');
mobileBtn.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

// ─── Cursor-tracking glow on feature cards ────
document.querySelectorAll('.feature').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
});

// ─── FAQ accordion ─────────────────────────────
document.querySelectorAll('.faq-item').forEach(item => {
  item.addEventListener('click', () => {
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!wasOpen) item.classList.add('open');
  });
});

// ─── Billing toggle ────────────────────────────
const billingButtons = document.querySelectorAll('.billing-toggle button');
const amounts = document.querySelectorAll('.amount');
billingButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    billingButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const mode = btn.dataset.billing;
    amounts.forEach(a => {
      const val = a.dataset[mode];
      if (val !== undefined) {
        const from = parseInt(a.textContent) || 0;
        const to   = parseInt(val);
        const dur  = 400; const start = performance.now();
        const tick = (t) => {
          const p = Math.min((t - start) / dur, 1);
          a.textContent = Math.round(from + (to - from) * p);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    });
  });
});

// ─── Scroll reveal ─────────────────────────────
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -80px 0px' });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// ─── Subtle parallax on ambient ────────────────
window.addEventListener('mousemove', e => {
  const x = (e.clientX / window.innerWidth - 0.5) * 10;
  const y = (e.clientY / window.innerHeight - 0.5) * 10;
  document.querySelector('.ambient').style.transform = `translate(${x}px, ${y}px)`;
});

// ─── Model tab selector ───────────────────────
document.querySelectorAll('.model-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.model-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
  });
});

// ─── Demo guest limit ─────────────────────────
let demoMessageCount = 0;
const DEMO_GUEST_LIMIT = 5;

function showDemoSignupPrompt() {
  const chat = document.getElementById('demoChat');
  const div  = document.createElement('div');
  div.style.cssText = 'text-align:center;padding:24px 20px;background:rgba(212,255,60,.06);border:1px solid rgba(212,255,60,.2);border-radius:16px;margin-top:8px';
  div.innerHTML = `
    <p style="font-size:14px;color:var(--text-dim);margin-bottom:6px">You've used your <strong style="color:var(--text)">${DEMO_GUEST_LIMIT} free demo messages</strong>.</p>
    <p style="font-size:13px;color:var(--text-mute);margin-bottom:14px">Sign up free — 1M tokens/month included, no credit card.</p>
    <a href="signup.html?next=demo" style="display:inline-block;padding:11px 28px;background:var(--text);color:var(--bg);border-radius:10px;font-size:14px;font-weight:600;text-decoration:none;letter-spacing:-.01em">Create free account →</a>`;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
  document.getElementById('demoSend').disabled = true;
  document.getElementById('demoInput').disabled = true;
  document.getElementById('demoInput').placeholder = 'Sign up for unlimited access';
}

// ─── Live Demo (Groq AI) ──────────────────────
const GROQ_API_KEY = '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';
const GROQ_MODEL   = 'llama-3.1-8b-instant';
const SYSTEM_PROMPT = `You are the AI assistant powering the Nexus platform live demo. Nexus is an AI infrastructure platform that gives developers a single unified API for 40+ frontier models (GPT-4, Claude, Gemini, Llama, etc.) with automatic failover, semantic caching (70% cost reduction), real-time evals, and 14 global edge regions. Be helpful, technically accurate, and concise. For code questions, give clean short examples. Keep responses under 150 words unless writing code.`;

const conversationHistory = [];

function renderBubble(text) {
  return text
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre style="background:var(--bg-elev);padding:10px;border-radius:8px;margin-top:8px;overflow-x:auto;font-size:12px;font-family:var(--mono);white-space:pre-wrap">$2</pre>')
    .replace(/`([^`]+)`/g, '<code style="font-family:var(--mono);font-size:.88em;background:var(--bg-elev);padding:2px 5px;border-radius:4px">$1</code>')
    .replace(/\n/g,'<br>');
}

function usePrompt(btn) {
  const input = document.getElementById('demoInput');
  input.value = btn.textContent;
  input.focus();
  sendDemo();
}

function clearEmpty() {
  document.getElementById('demoChat').querySelector('.demo-empty')?.remove();
}

function addMessage(text, role) {
  const chat = document.getElementById('demoChat');
  const msg  = document.createElement('div');
  msg.className = `msg ${role}`;
  msg.innerHTML = `<div class="msg-avatar">${role === 'user' ? 'U' : 'N'}</div><div class="msg-bubble">${renderBubble(text)}</div>`;
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

function addTyping() {
  const chat = document.getElementById('demoChat');
  const msg  = document.createElement('div');
  msg.className = 'msg ai'; msg.id = 'typingMsg';
  msg.innerHTML = `<div class="msg-avatar">N</div><div class="msg-bubble"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div>`;
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

async function sendDemo() {
  const input   = document.getElementById('demoInput');
  const sendBtn = document.getElementById('demoSend');
  const prompt  = input.value.trim();
  if (!prompt || sendBtn.disabled) return;

  clearEmpty();
  addMessage(prompt, 'user');
  input.value = '';
  sendBtn.disabled = true;

  const statusEl  = document.getElementById('metaStatus');
  const latencyEl = document.getElementById('metaLatency');
  const tokensEl  = document.getElementById('metaTokens');
  statusEl.textContent = 'Processing…';
  statusEl.className   = 'meta-pill loading';
  addTyping();

  if (!GROQ_API_KEY || GROQ_API_KEY === 'YOUR_GROQ_API_KEY') {
    setTimeout(() => {
      document.getElementById('typingMsg')?.remove();
      addMessage('⚠ Demo not connected. Add your Groq API key in script.js.', 'ai');
      statusEl.textContent = 'No key'; statusEl.className = 'meta-pill loading';
      sendBtn.disabled = false;
    }, 600);
    return;
  }

  conversationHistory.push({ role: 'user', content: prompt });
  const startTime = Date.now();

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...conversationHistory],
        stream: true, max_tokens: 512, temperature: 0.7
      })
    });

    document.getElementById('typingMsg')?.remove();

    if (!res.ok) {
      const err = await res.json();
      addMessage('⚠ ' + (err.error?.message || 'API error. Check your key.'), 'ai');
      statusEl.textContent = 'Error'; statusEl.className = 'meta-pill loading';
      conversationHistory.pop();
      sendBtn.disabled = false; input.focus(); return;
    }

    const chat    = document.getElementById('demoChat');
    const msgEl   = document.createElement('div');
    msgEl.className = 'msg ai';
    const bubble  = document.createElement('div');
    bubble.className = 'msg-bubble';
    msgEl.innerHTML  = '<div class="msg-avatar">N</div>';
    msgEl.appendChild(bubble);
    chat.appendChild(msgEl);

    const reader  = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText   = '';
    let tokenCount = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      for (const line of decoder.decode(value, { stream: true }).split('\n')) {
        if (!line.startsWith('data: ') || line === 'data: [DONE]') continue;
        try {
          const json = JSON.parse(line.slice(6));
          fullText += json.choices?.[0]?.delta?.content || '';
          if (json.x_groq?.usage) tokenCount = json.x_groq.usage.total_tokens;
          bubble.innerHTML = renderBubble(fullText);
          chat.scrollTop = chat.scrollHeight;
        } catch {}
      }
    }

    conversationHistory.push({ role: 'assistant', content: fullText });
    const approxTokens    = tokenCount || Math.round(fullText.split(' ').length * 1.3);
    latencyEl.textContent = (Date.now() - startTime) + ' ms';
    tokensEl.textContent  = approxTokens + ' tokens';
    statusEl.textContent  = '✓ Complete';
    statusEl.className    = 'meta-pill green';

    if (window.trackDemoUsage) window.trackDemoUsage(approxTokens);

    demoMessageCount++;
    if (!window._currentUser && demoMessageCount >= DEMO_GUEST_LIMIT) {
      showDemoSignupPrompt(); return;
    }

  } catch (err) {
    document.getElementById('typingMsg')?.remove();
    addMessage('⚠ Connection error. Check your API key and try again.', 'ai');
    statusEl.textContent = 'Error'; statusEl.className = 'meta-pill loading';
    conversationHistory.pop();
  }

  sendBtn.disabled = false;
  input.focus();
}

document.getElementById('demoInput').addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendDemo(); }
});

// ─── Plan modal ────────────────────────────────
const PLANS = {
  hobby: {
    tag: 'Free tier', tagColor: '#a1a1aa',
    heading: 'Start building <em>for free.</em>',
    price: '0', per: '/mo',
    desc: 'For prototyping and side projects. No credit card required, ever.',
    features: ['1M tokens / month included','Access to 8 open models','Community Discord support','Rate-limited at 60 RPM'],
    type: 'email', cta: 'Get started free →', note: 'No credit card · No time limit'
  },
  pro: {
    tag: 'Most popular', tagColor: '#d4ff3c',
    heading: 'Start your <em>14-day trial.</em>',
    price: '49', per: '/mo',
    desc: 'For teams shipping production AI. Full access, cancel anytime.',
    features: ['50M tokens / month included','All 40+ models, including frontier','Semantic caching + edge routing','Real-time evals & A/B testing','Priority support, 4hr response','SOC 2 Type II reports'],
    type: 'email', cta: 'Start free trial →', note: 'Free for 14 days · No credit card needed'
  },
  enterprise: {
    tag: 'Enterprise', tagColor: '#7cc4ff',
    heading: 'Talk to <em>our team.</em>',
    price: null, per: '',
    desc: 'Custom pricing, dedicated capacity, bespoke compliance. We reply within 2 hours.',
    features: ['Unlimited tokens + dedicated GPUs','Private VPC + on-prem deployment','HIPAA, FedRAMP, ISO 27001','Custom SLAs up to 99.999%','Named engineer + 24/7 hotline'],
    type: 'contact', cta: 'Send message →', note: 'We reply within 2 business hours'
  }
};

function openModal(key) {
  const plan = PLANS[key];
  if (!plan) return;
  const el = document.getElementById('modalContent');
  const priceHTML = plan.price !== null
    ? `<div class="modal-price-row"><span class="modal-price-curr">$</span><span class="modal-price-num">${plan.price}</span><span class="modal-price-per">&thinsp;${plan.per}</span></div>`
    : `<div class="modal-price-row"><span class="modal-price-num" style="font-size:40px;letter-spacing:-.02em">Custom</span></div>`;

  const feats = plan.features.map(f => `<li>${f}</li>`).join('');
  let form = '';
  if (plan.type === 'email') {
    form = `
      <div class="modal-email-row">
        <input type="email" class="modal-input" id="mEmail" placeholder="you@company.com" autocomplete="email"/>
        <button class="modal-submit" onclick="submitEmail('${key}',this)">${plan.cta}</button>
      </div>
      <p class="modal-note">${plan.note}</p>`;
  } else {
    form = `
      <div style="display:flex;gap:8px;margin-bottom:10px">
        <input type="text" class="modal-input" id="mName" placeholder="Your name" style="flex:1"/>
        <input type="text" class="modal-input" id="mCompany" placeholder="Company" style="flex:1"/>
      </div>
      <input type="email" class="modal-input modal-input-block" id="mEmail" placeholder="work@company.com"/>
      <textarea class="modal-textarea" id="mMsg" placeholder="Tell us about your scale, compliance requirements, and timeline…"></textarea>
      <button class="modal-full-btn" onclick="submitContact(this)">${plan.cta}</button>
      <p class="modal-note">${plan.note}</p>`;
  }

  el.innerHTML = `
    <div class="modal-plan-tag">
      <span class="modal-tag-dot" style="background:${plan.tagColor}"></span>${plan.tag}
    </div>
    <h3 class="modal-heading">${plan.heading}</h3>
    ${priceHTML}
    <p class="modal-desc">${plan.desc}</p>
    <ul class="modal-features">${feats}</ul>
    ${form}`;

  document.getElementById('modalOverlay').classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('show');
  document.body.style.overflow = '';
}

function submitEmail(plan, btn) {
  const inp = document.getElementById('mEmail');
  if (!inp || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value.trim())) {
    if (inp) { inp.style.borderColor = '#ff5e5e'; inp.focus(); }
    return;
  }
  const email = inp.value.trim();
  btn.textContent = 'Setting up…';
  btn.disabled = true;
  if (window.saveToWaitlist) window.saveToWaitlist(email, plan);
  setTimeout(() => {
    window.location.href = `signup.html?plan=${plan}&email=${encodeURIComponent(email)}`;
  }, 700);
}

async function submitContact(btn) {
  const emailEl = document.getElementById('mEmail');
  const nameEl  = document.getElementById('mName');
  const compEl  = document.getElementById('mCompany');
  const msgEl   = document.getElementById('mMsg');
  if (!emailEl || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim())) {
    if (emailEl) { emailEl.style.borderColor = '#ff5e5e'; emailEl.focus(); }
    return;
  }
  btn.textContent = 'Sending…';
  btn.disabled = true;
  if (window.saveContact) {
    await window.saveContact(
      nameEl?.value.trim() || '',
      compEl?.value.trim() || '',
      emailEl.value.trim(),
      msgEl?.value.trim() || ''
    );
  }
  btn.textContent = '✓ Message sent — we\'ll reply soon!';
  btn.style.background = '#22c55e';
  btn.style.color = '#fff';
}

document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalOverlay').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ─── Auth-aware navbar (localStorage) ─────────
(function() {
  const session   = JSON.parse(localStorage.getItem('nx_session') || 'null');
  window._currentUser = session || null;

  const signIn    = document.getElementById('navSignIn');
  const startFree = document.getElementById('navStartFree');
  const dashboard = document.getElementById('navDashboard');

  if (session) {
    if (signIn)    signIn.style.display    = 'none';
    if (startFree) startFree.style.display = 'none';
    if (dashboard) dashboard.style.display = '';
  } else {
    if (signIn)    signIn.style.display    = '';
    if (startFree) startFree.style.display = '';
    if (dashboard) dashboard.style.display = 'none';
  }
})();

// ─── Stubs ─────────────────────────────────────
window.trackDemoUsage = function() {};
window.saveToWaitlist = async function(email, plan) {
  try {
    const list = JSON.parse(localStorage.getItem('nx_waitlist') || '[]');
    list.push({ email, plan, at: new Date().toISOString() });
    localStorage.setItem('nx_waitlist', JSON.stringify(list));
  } catch {}
};
window.saveContact = async function(name, company, email, message) {
  try {
    const list = JSON.parse(localStorage.getItem('nx_contacts') || '[]');
    list.push({ name, company, email, message, at: new Date().toISOString() });
    localStorage.setItem('nx_contacts', JSON.stringify(list));
  } catch {}
};
