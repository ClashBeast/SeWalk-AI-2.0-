// =============================================
//  SUPABASE AUTH
// =============================================
// ── Theme Toggle ──────────────────────────────────────────
function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  const newTheme = isDark ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  document.getElementById('themeToggle').textContent = newTheme === 'light' ? '☀️' : '🌙';
  localStorage.setItem('sewalk-theme', newTheme);
}
// Restore saved theme on load
(function() {
  const saved = localStorage.getItem('sewalk-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('themeToggle');
    if (btn) btn.textContent = saved === 'light' ? '☀️' : '🌙';
  });
})();
// ── Supabase Config ───────────────────────────────────────
// ⚠️ WARNING: These keys are exposed client-side. In production, move to a backend proxy.
// Supabase anon key is limited by Row-Level Security — make sure RLS is enabled on your tables.
const SUPABASE_URL = 'https://bytcmnwaqkyvgzjcdfcr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5dGNtbndhcWt5dmd6amNkZmNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MTI4NTgsImV4cCI6MjA4ODA4ODg1OH0.83Ci3f7oiLLeZMz26vCnfKFk55Ju7MBH6oEpsZrYFaw';
// Hardcoded Anthropic API key (shared — everyone uses this)
const ANTHROPIC_API_KEY = null; // Secured in backend

const _supabase = (typeof supabase !== 'undefined')
  ? supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

let currentUser = null;

if (_supabase) {
  _supabase.auth.onAuthStateChange((event, session) => {
    currentUser = session?.user ?? null;
    updateAuthUI();
    if (event === 'SIGNED_IN') {
      closeAuthModal();
      showToast('✅ Signed in as ' + currentUser.email);
    }
    if (event === 'SIGNED_OUT') {
      guestMsgCount = 0;
      showToast('👋 Signed out');
      updateAuthUI();
    }
  });
}

function updateAuthUI() {
  const loginBtn  = document.getElementById('headerLoginBtn');
  const userPill  = document.getElementById('headerUserPill');
  const emailEl   = document.getElementById('headerEmail');
  const avatarEl  = document.getElementById('headerAvatar');
  const chatLock  = document.getElementById('chatLockOverlay');
  const guestBadge = document.getElementById('guestCounterBadge');
  const guestText  = document.getElementById('guestCounterText');
  if (!loginBtn) return;
  if (currentUser) {
    loginBtn.style.display = 'none';
    userPill.style.display = 'flex';
    emailEl.textContent    = currentUser.email;
    avatarEl.textContent   = currentUser.email[0].toUpperCase();
    if (guestBadge) guestBadge.style.display = 'none';
    // Reset guest limit counter when signed in
    guestMsgCount = 0;
    if (chatLock) chatLock.classList.remove('visible');
    // Send any pending message that was queued before auth
    if (pendingMessage) {
      const input = document.getElementById('userInput');
      if (input) {
        const msg = pendingMessage;
        pendingMessage = null;
        input.value = msg;
        sendMsg();
      }
    }
  } else {
    loginBtn.style.display = 'flex';
    userPill.style.display = 'none';
    if (chatLock) chatLock.classList.remove('visible');
    // Show guest counter
    const remaining = GUEST_MSG_LIMIT - guestMsgCount;
    if (guestBadge && guestText) {
      guestBadge.style.display = remaining > 0 ? 'block' : 'none';
      guestText.textContent = `${remaining} free msg${remaining !== 1 ? 's' : ''} left`;
      guestText.style.color = remaining <= 3 ? '#f87171' : '';
    }
  }
}

async function authOAuth(provider) {
  if (!_supabase) { showAuthError('Supabase not configured.'); return; }
  const buttons = document.querySelectorAll('.oauth-btn');
  buttons.forEach(b => b.disabled = true);
  // Show loading state on clicked button
  const btn = document.querySelector(`.oauth-btn.${provider}`);
  if (btn) {
    const label = btn.querySelector('.oauth-label');
    if (label) label.textContent = 'Redirecting…';
  }
  hideAuthMessages();
  const opts = { redirectTo: window.location.href };
  const { error } = await _supabase.auth.signInWithOAuth({ provider, options: opts });
  if (error) {
    buttons.forEach(b => b.disabled = false);
    if (btn) {
      const label = btn.querySelector('.oauth-label');
      if (label) label.textContent = provider === 'google' ? 'Continue with Google' : `Continue with ${provider.charAt(0).toUpperCase()+provider.slice(1)}`;
    }
    showAuthError(error.message);
  }
}

async function authSignIn() {
  const email = document.getElementById('siEmail').value.trim();
  const pass  = document.getElementById('siPassword').value;
  if (!email || !pass) return showAuthError('Please fill in all fields.');
  if (!_supabase) return showAuthError('Supabase not configured.');
  setAuthLoading('signinBtn', true); hideAuthMessages();
  const { error } = await _supabase.auth.signInWithPassword({ email, password: pass });
  setAuthLoading('signinBtn', false);
  if (error) showAuthError(error.message);
}

async function authSignUp() {
  const email = document.getElementById('suEmail').value.trim();
  const pass  = document.getElementById('suPassword').value;
  if (!email || !pass) return showAuthError('Please fill in all fields.');
  if (!_supabase) return showAuthError('Supabase not configured.');
  setAuthLoading('signupBtn', true); hideAuthMessages();
  const { error } = await _supabase.auth.signUp({ email, password: pass });
  setAuthLoading('signupBtn', false);
  if (error) showAuthError(error.message);
  else showAuthSuccess('✅ Check your email to confirm, then sign in.');
}

async function authSignOut() {
  if (!_supabase) return;
  await _supabase.auth.signOut();
}

function openAuthModal() {
  hideAuthMessages();
  document.getElementById('authOverlay').classList.add('visible');
}
function closeAuthModal() {
  document.getElementById('authOverlay').classList.remove('visible');
}
function switchAuthTab(tab) {
  document.getElementById('formSignIn').style.display = tab === 'signin' ? '' : 'none';
  document.getElementById('formSignUp').style.display = tab === 'signup' ? '' : 'none';
  document.getElementById('tabSignIn').classList.toggle('active', tab === 'signin');
  document.getElementById('tabSignUp').classList.toggle('active', tab === 'signup');
  hideAuthMessages();
}
function showAuthError(msg) {
  const el = document.getElementById('authError');
  el.textContent = msg; el.style.display = 'block';
}
function showAuthSuccess(msg) {
  const el = document.getElementById('authSuccess');
  el.textContent = msg; el.style.display = 'block';
}
function hideAuthMessages() {
  document.getElementById('authError').style.display   = 'none';
  document.getElementById('authSuccess').style.display = 'none';
}
function setAuthLoading(id, loading) {
  const btn = document.getElementById(id);
  btn.disabled    = loading;
  btn.textContent = loading ? 'Please wait…' : (id === 'signinBtn' ? 'Sign In with Email' : 'Create Account');
}

// Fix #10: Single consolidated DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  // Auth overlay click-outside to close
  const overlay = document.getElementById('authOverlay');
  if (overlay) overlay.addEventListener('click', e => { if (e.target === overlay) closeAuthModal(); });

  // Single global listener to close all dots menus on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.msg-dots-btn')) {
      document.querySelectorAll('.msg-dots-menu').forEach(m => m.style.display = 'none');
    }
  });

  if (_supabase) {
    _supabase.auth.getSession().then(({ data: { session } }) => {
      currentUser = session?.user ?? null;
      updateAuthUI();
    });
  } else {
    updateAuthUI();
  }

  // Card preview for pattern game
  const p = document.getElementById('cardPreviewPattern');
  if (p) {
    const cols = ['#c9a84c','#4ecdc4','#ffca28','#ff7096','#60a5fa','#34d399','#ff6b35','#d4a843','#fb923c'];
    for (let i = 0; i < 9; i++) {
      const t = document.createElement('div');
      t.className = 'mini-tile';
      t.style.background = [0,2,4,6,8].includes(i) ? cols[i % cols.length] : 'rgba(255,255,255,0.05)';
      p.appendChild(t);
    }
  }

  // Run init after DOM is ready
  init();

  // Show guest counter on initial load if not signed in
  if (!currentUser) {
    const guestBadge = document.getElementById('guestCounterBadge');
    if (guestBadge) guestBadge.style.display = 'block';
  }
});

// =============================================
//  STATE
// =============================================
let currentMode = 'gym';
let currentSessionId = null;
let pendingMessage = null; // stores message queued before auth/API key

// Guest message limit
const GUEST_MSG_LIMIT = 10;
let guestMsgCount = 0;

// sessionStore[mode] = { [id]: { id, title, createdAt, messages: [] } }
const sessionStore = { gym: {}, lib: {}, music: {}, jee: {}, companion: {} };

// =============================================
//  FIX #5: localStorage-based storage wrapper
//  (window.storage only exists in Claude sandbox)
// =============================================
const storage = {
  get(key) {
    try { const v = localStorage.getItem(key); return v !== null ? { value: v } : null; }
    catch { return null; }
  },
  set(key, value) {
    try { localStorage.setItem(key, value); return { value }; }
    catch { return null; }
  },
  delete(key) {
    try { localStorage.removeItem(key); return { deleted: true }; }
    catch { return null; }
  }
};

// =============================================
//  window.storage — Promise-based wrapper for new games
//  (new games use window.storage.get/set as async/await)
// =============================================
window.storage = {
  async get(key) {
    try { const v = localStorage.getItem(key); return v !== null ? { value: v } : null; }
    catch { return null; }
  },
  async set(key, value) {
    try { localStorage.setItem(key, value); return { value }; }
    catch { return null; }
  },
  async delete(key) {
    try { localStorage.removeItem(key); return { deleted: true }; }
    catch { return null; }
  }
};

// =============================================
//  CONSTANTS
// =============================================
const systemPrompts = {
  gym:       "You are an expert gym trainer and fitness coach. You give personalized workout advice, help with exercise form, nutrition, recovery, and programming. You remember the user's fitness goals, current split, and past sessions within this conversation. Be motivating, specific, and practical. Keep responses concise unless the user asks for a full plan.",
  lib:       "You are a knowledgeable librarian and literary guide. You recommend books, discuss themes and authors, help with reading comprehension, and track what the user has read in this conversation. Be thoughtful, curious, and match your suggestions to their taste. Keep responses warm and concise.",
  music:     "You are a professional music producer and sound designer. You help with beat-making, mixing, music theory, arrangement, gear, DAW tips, and creative direction. You remember the user's projects and genre preferences in this conversation. Be creative, technical when needed, and encouraging.",
  jee:       "You are an expert JEE Mains and Advanced tutor. You explain concepts clearly, solve problems step-by-step, cover Physics, Chemistry, and Mathematics, and give exam strategy advice. You remember which topics the student has covered in this conversation. Be accurate, patient, and thorough. Never guess — if unsure, say so.",
  companion: "You are a warm, thoughtful companion. You listen without judgment, help the user think through problems, offer emotional support, and have genuine conversations. You remember what the user has shared in this conversation. Be empathetic, calm, and authentic. Never be dismissive."
};

const modes = {
  gym:       { title: '🏋️ Gym Trainer',   desc: 'Personalized fitness coaching — remembers your goals, splits, and progress.',       color: 'var(--gym)',       icon: '🏋️', placeholder: 'Ask your Gym Trainer...',   greeting: "Hey! I'm your Gym Trainer. What are your fitness goals? I'll remember everything across our sessions." },
  lib:       { title: '📚 Librarian',      desc: 'Deep reading guidance, book recs, and literary analysis tailored to your taste.',   color: 'var(--lib)',       icon: '📚', placeholder: 'Ask the Librarian...',      greeting: "Welcome! I'm your Librarian. Tell me what you love to read and I'll remember your taste across every visit." },
  music:     { title: '🎛️ Music Producer', desc: 'Beat-making, mixing, theory, and creative direction for your sound.',               color: 'var(--music)',     icon: '🎛️', placeholder: 'Ask your Producer...',      greeting: "Yo, welcome to the studio! What are you working on? I'll keep track of your projects and sound." },
  jee:       { title: '⚛️ JEE Tutor',      desc: 'Concept clarity, problem solving, and exam strategy for JEE Mains & Advanced.',    color: 'var(--jee)',       icon: '⚛️', placeholder: 'Ask your JEE Tutor...',     greeting: "Namaste! I'm your JEE Tutor. Which subject shall we tackle — Physics, Chemistry, or Maths? I'll track your progress." },
  companion: { title: '🌙 Companion',      desc: 'A thoughtful, non-judgmental presence for when you need to think out loud.',         color: 'var(--companion)', icon: '🌙', placeholder: 'Talk to your Companion...', greeting: "Hey, glad you're here. How are you feeling today? I'll always remember what we've talked about." }
};

// =============================================
//  STORAGE — multi-session aware
// =============================================
async function saveSessionStore(mode) {
  try {
    storage.set('sessions:' + mode, JSON.stringify(sessionStore[mode]));
  } catch(e) { console.warn('Save failed', e); }
}

async function loadSessionStore(mode) {
  try {
    const result = storage.get('sessions:' + mode);
    if (result && result.value) {
      const parsed = JSON.parse(result.value);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        sessionStore[mode] = parsed;
        return;
      }
    }
    // Legacy migration: old flat array → convert into first session
    try {
      const legacy = storage.get('chat:' + mode);
      if (legacy && legacy.value) {
        const arr = JSON.parse(legacy.value);
        if (Array.isArray(arr) && arr.length > 0) {
          const id = genId();
          sessionStore[mode] = {
            [id]: { id, title: 'Imported Chat', createdAt: Date.now(), messages: arr }
          };
          saveSessionStore(mode);
          return;
        }
      }
    } catch(_) {}
    sessionStore[mode] = {};
  } catch(e) {
    sessionStore[mode] = {};
  }
}

// =============================================
//  SESSION HELPERS
// =============================================
function genId() {
  return 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function getSession(mode, id) {
  return sessionStore[mode]?.[id] || null;
}

function getSortedSessions(mode) {
  return Object.values(sessionStore[mode] || {}).sort((a, b) => b.createdAt - a.createdAt);
}

async function createNewSession() {
  const id = genId();
  sessionStore[currentMode][id] = {
    id, title: 'New Chat', createdAt: Date.now(), messages: []
  };
  await saveSessionStore(currentMode);
  await loadSession(id);
}

async function loadSession(id) {
  currentSessionId = id;
  const session = getSession(currentMode, id);
  if (!session) return;
  document.getElementById('currentSessionTitle').textContent = session.title;
  renderMessages();
  renderSessionList();
  updateMemoryBar();
}

async function autoNameSession(userMessage) {
  const session = getSession(currentMode, currentSessionId);
  if (!session || session.title !== 'New Chat') return;
  const words = userMessage.trim().split(/\s+/).slice(0, 5).join(' ');
  session.title = words || 'New Chat';
  document.getElementById('currentSessionTitle').textContent = session.title;
  await saveSessionStore(currentMode);
  renderSessionList();
}

async function deleteSession(id, e) {
  e.stopPropagation();
  const wasActive = id === currentSessionId;
  delete sessionStore[currentMode][id];
  await saveSessionStore(currentMode);

  if (wasActive) {
    const remaining = getSortedSessions(currentMode);
    if (remaining.length > 0) {
      await loadSession(remaining[0].id);
    } else {
      await createNewSession();
    }
  } else {
    renderSessionList();
  }
  showToast('Session deleted');
}

// =============================================
//  RENDER SESSION LIST
// =============================================
function renderSessionList() {
  const list = document.getElementById('sessionList');
  const sessions = getSortedSessions(currentMode);
  const icon = modes[currentMode].icon;

  if (sessions.length === 0) {
    list.innerHTML = '<div class="session-empty">No sessions yet.<br/>Start chatting to create one!</div>';
    return;
  }

  list.innerHTML = sessions.map(s => {
    const active = s.id === currentSessionId;
    const msgCount = s.messages.filter(m => m.role === 'user').length;
    const meta = msgCount === 0 ? 'Empty' : msgCount + ' msg' + (msgCount !== 1 ? 's' : '');
    return `
      <div class="session-item${active ? ' active' : ''}" onclick="loadSession('${s.id}')">
        <div class="session-item-icon">${icon}</div>
        <div class="session-item-body">
          <div class="session-item-title" title="${esc(s.title)}">${esc(s.title)}</div>
          <div class="session-item-meta">${meta} · ${relDate(s.createdAt)}</div>
        </div>
        <button class="session-delete-btn" onclick="deleteSession('${s.id}', event)" title="Delete">✕</button>
      </div>`;
  }).join('');
}

function relDate(ts) {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h ago';
  return Math.floor(h / 24) + 'd ago';
}

function esc(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// =============================================
//  MARKED + HIGHLIGHT SETUP
// =============================================
// Fix #8: Removed deprecated marked.setOptions({ highlight }) — was fighting with renderer.code below
// Using only the renderer.code override which is the correct marked v9+ approach
marked.use({ breaks: true, gfm: true });

const renderer = new marked.Renderer();
renderer.code = function(token) {
  const code = token.text !== undefined ? token.text : (typeof token === 'string' ? token : '');
  const lang = token.lang || '';
  const highlighted = lang && hljs.getLanguage(lang)
    ? hljs.highlight(code, { language: lang }).value
    : hljs.highlightAuto(code).value;
  const langLabel = lang || 'code';
  const escaped = code.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  return `<div class="code-block-wrap">
    <div class="code-header">
      <span>${langLabel}</span>
      <button class="copy-btn" data-code="${escaped.replace(/\n/g,'&#10;')}" onclick="copyCode(this)">Copy</button>
    </div>
    <pre><code class="hljs language-${langLabel}">${highlighted}</code></pre>
  </div>`;
};
marked.use({ renderer });

function copyCode(btn) {
  const raw = btn.dataset.code || '';
  // Decode HTML entities back to real characters
  const txt = document.createElement('textarea');
  txt.innerHTML = raw;
  const code = txt.value;
  navigator.clipboard.writeText(code);
  btn.textContent = 'Copied!';
  setTimeout(() => btn.textContent = 'Copy', 2000);
}

// =============================================
//  CONTENT RENDERER
// =============================================
function renderContent(text) {
  const html = marked.parse(text);
  const wrapper = document.createElement('div');
  wrapper.className = 'md';
  wrapper.innerHTML = html;
  renderMathInElement(wrapper, {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '$',  right: '$',  display: false },
      { left: '\\(', right: '\\)', display: false },
      { left: '\\[', right: '\\]', display: true }
    ],
    throwOnError: false
  });
  return wrapper;
}

// =============================================
//  APPEND MESSAGE (DOM)
// =============================================
function appendMsg(role, content, label, targetId) {
  const msgs = document.getElementById('messages');
  const div = document.createElement('div');
  div.className = 'msg ' + (role === 'user' ? 'user' : 'ai');

  if (role === 'user') {
    const sender = document.createElement('div');
    sender.className = 'sender';
    sender.textContent = 'You';
    div.appendChild(sender);
    div.appendChild(document.createTextNode(content));
  } else {
    const msgId = targetId || ('msg-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7));
    div.id = msgId;
    const { senderRow, actionBar } = buildAIMsgActions(msgId, label, content);
    div.appendChild(senderRow);
    div.appendChild(renderContent(content));
    div.appendChild(actionBar);
  }

  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  return div;
}

// =============================================
//  RENDER ALL MESSAGES FOR CURRENT SESSION
// =============================================
function renderMessages() {
  const msgs = document.getElementById('messages');
  const label = document.querySelector('.mode-btn[data-mode="' + currentMode + '"] .label').textContent;
  const session = getSession(currentMode, currentSessionId);
  msgs.innerHTML = '';

  if (!session || session.messages.length === 0) {
    appendMsg('ai', modes[currentMode].greeting, label);
  } else {
    session.messages.forEach(m => appendMsg(m.role, m.content, label));
  }
  msgs.scrollTop = msgs.scrollHeight;
}

// =============================================
//  MEMORY BAR
// =============================================
function updateMemoryBar() {
  const label = document.querySelector('.mode-btn[data-mode="' + currentMode + '"] .label').textContent;
  const session = getSession(currentMode, currentSessionId);
  const count = session ? session.messages.filter(m => m.role === 'user').length : 0;
  const total = Object.keys(sessionStore[currentMode]).length;
  const countStr = count > 0 ? count + ' msg' + (count !== 1 ? 's' : '') : 'Empty';
  document.getElementById('memoryBarText').textContent =
    `Memory active · ${label} · ${countStr} · ${total} session${total !== 1 ? 's' : ''}`;
}

// =============================================
//  SEND MESSAGE
// =============================================
// ── AI Message Action Bar Builder ─────────────────────
function buildAIMsgActions(msgId, modeLabel, replyText) {
  // Top row: sender name only
  const senderRow = document.createElement('div');
  senderRow.className = 'sender-row';
  const sender = document.createElement('div');
  sender.className = 'sender';
  sender.textContent = modeLabel;
  senderRow.appendChild(sender);

  // Action bar: 👍 👎 🔄 📋 ⋮
  const actionBar = document.createElement('div');
  actionBar.className = 'msg-action-bar';

  // Like
  const likeBtn = document.createElement('button');
  likeBtn.className = 'msg-action-btn';
  likeBtn.title = 'Good response';
  likeBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>`;
  likeBtn.onclick = () => {
    likeBtn.classList.toggle('active-like');
    dislikeBtn.classList.remove('active-dislike');
  };

  // Dislike
  const dislikeBtn = document.createElement('button');
  dislikeBtn.className = 'msg-action-btn';
  dislikeBtn.title = 'Bad response';
  dislikeBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/><path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>`;
  dislikeBtn.onclick = () => {
    dislikeBtn.classList.toggle('active-dislike');
    likeBtn.classList.remove('active-like');
  };

  // Regenerate
  const regenBtn = document.createElement('button');
  regenBtn.className = 'msg-action-btn';
  regenBtn.title = 'Regenerate response';
  regenBtn.innerHTML = `<svg viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>`;
  regenBtn.onclick = () => regenResponse(msgId);

  // Copy
  const copyBtn = document.createElement('button');
  copyBtn.className = 'msg-action-btn';
  copyBtn.title = 'Copy text';
  copyBtn.innerHTML = `<svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
  copyBtn.onclick = () => {
    navigator.clipboard.writeText(replyText);
    copyBtn.classList.add('copied');
    copyBtn.title = 'Copied!';
    setTimeout(() => { copyBtn.classList.remove('copied'); copyBtn.title = 'Copy text'; }, 2000);
  };

  // Three dots menu
  const dotsBtn = document.createElement('button');
  dotsBtn.className = 'msg-action-btn msg-dots-btn';
  dotsBtn.title = 'More options';
  dotsBtn.innerHTML = `<svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>`;

  const dotsMenu = document.createElement('div');
  dotsMenu.className = 'msg-dots-menu';
  dotsMenu.style.display = 'none';
  dotsMenu.innerHTML = `
    <button class="dots-menu-item" onclick="downloadMessageAsPDF('${msgId}')">
      <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      Export to PDF
    </button>
    <div class="dots-menu-item model-label">
      <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
      Model: Gemini 3.1 Flash
    </div>
    <div class="dots-menu-divider"></div>
    <button class="dots-menu-item dots-menu-danger" onclick="showToast('⚠️ Report sent. Thank you.')">
      <svg viewBox="0 0 24 24"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
      Report legal issue
    </button>`;

  dotsBtn.onclick = (e) => {
    e.stopPropagation();
    const isOpen = dotsMenu.style.display !== 'none';
    document.querySelectorAll('.msg-dots-menu').forEach(m => m.style.display = 'none');
    dotsMenu.style.display = isOpen ? 'none' : 'block';
  };

  const dotsWrap = document.createElement('div');
  dotsWrap.style.position = 'relative';
  dotsWrap.appendChild(dotsBtn);
  dotsWrap.appendChild(dotsMenu);

  actionBar.appendChild(likeBtn);
  actionBar.appendChild(dislikeBtn);
  actionBar.appendChild(regenBtn);
  actionBar.appendChild(copyBtn);
  actionBar.appendChild(dotsWrap);

  return { senderRow, actionBar };
}

// ── Regenerate Response ───────────────────────────────
async function regenResponse(msgId) {
  const session = getSession(currentMode, currentSessionId);
  if (!session) return;
  if (session.messages[session.messages.length - 1]?.role === 'assistant') {
    session.messages.pop();
  }
  const modeLabel = document.querySelector('.mode-btn.active .label').textContent;
  const msgEl = document.getElementById(msgId);
  if (!msgEl) return;
  msgEl.innerHTML = `<div class="sender-row"><div class="sender">${modeLabel}</div></div><span style="opacity:0.45">Thinking...</span>`;
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ system: systemPrompts[currentMode], messages: session.messages })
    });
    if (!response.ok) throw new Error(`API error ${response.status}`);
    const data = await response.json();
    const reply = data.content?.[0]?.text || "Sorry, I couldn't respond. Please try again.";
    session.messages.push({ role: 'assistant', content: reply });
    if (currentUser) await saveSessionStore(currentMode);
    msgEl.innerHTML = '';
    const { senderRow, actionBar } = buildAIMsgActions(msgId, modeLabel, reply);
    msgEl.appendChild(senderRow);
    msgEl.appendChild(renderContent(reply));
    msgEl.appendChild(actionBar);
  } catch (err) {
    msgEl.innerHTML = `<div class="sender-row"><div class="sender">${modeLabel}</div></div><span style="color:#f87171">⚠️ ${err.message}</span>`;
  }
}

// ── Image Upload State ────────────────────────────────
let pendingImageBase64 = null;
let pendingImageMime = null;

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { showToast('⚠️ Please upload an image file.'); return; }
  if (file.size > 5 * 1024 * 1024) { showToast('⚠️ Image too large. Max 5MB.'); return; }

  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    pendingImageBase64 = dataUrl.split(',')[1];
    pendingImageMime = file.type;

    // Show preview
    const bar = document.getElementById('imagePreviewBar');
    bar.style.display = 'block';
    bar.innerHTML = `
      <div class="img-preview-wrap">
        <img src="${dataUrl}" alt="preview"/>
        <button class="img-preview-remove" onclick="clearImageUpload()" title="Remove">✕</button>
      </div>`;
  };
  reader.readAsDataURL(file);
  // Reset input so same file can be re-selected
  event.target.value = '';
}

function clearImageUpload() {
  pendingImageBase64 = null;
  pendingImageMime = null;
  const bar = document.getElementById('imagePreviewBar');
  bar.style.display = 'none';
  bar.innerHTML = '';
}

async function sendMsg() {
  const input = document.getElementById('userInput');
  const val = input.value.trim();
  if ((!val && !pendingImageBase64) || input.disabled) return;

  // Guest limit: allow up to GUEST_MSG_LIMIT messages, then prompt sign-in
  if (!currentUser) {
    if (guestMsgCount >= GUEST_MSG_LIMIT) {
      pendingMessage = val;
      input.value = val;
      openAuthModal();
      showToast('⚠️ Guest limit reached — sign in to keep chatting!');
      return;
    }
    // Warn at 7 messages
    if (guestMsgCount === GUEST_MSG_LIMIT - 3) {
      showToast(`⚠️ ${GUEST_MSG_LIMIT - guestMsgCount} guest messages left — sign in to save & get unlimited!`);
    }
    guestMsgCount++;
    // Update badge
    const guestBadge = document.getElementById('guestCounterBadge');
    const guestText  = document.getElementById('guestCounterText');
    const remaining  = GUEST_MSG_LIMIT - guestMsgCount;
    if (guestBadge && guestText) {
      guestBadge.style.display = remaining > 0 ? 'block' : 'none';
      guestText.textContent = `${remaining} free msg${remaining !== 1 ? 's' : ''} left`;
      guestText.style.color = remaining <= 3 ? '#f87171' : '';
    }
  }

  const modeLabel = document.querySelector('.mode-btn.active .label').textContent;
  const msgs = document.getElementById('messages');
  const session = getSession(currentMode, currentSessionId);
  if (!session) return;

  const isFirst = session.messages.filter(m => m.role === 'user').length === 0;

  // Capture image before clearing
  const imgBase64 = pendingImageBase64;
  const imgMime = pendingImageMime;

  // Show user message with image if present
  if (imgBase64) {
    const userDiv = document.createElement('div');
    userDiv.className = 'msg user';
    userDiv.innerHTML = `<div class="sender-row"><div class="sender">You</div></div>
      <img src="data:${imgMime};base64,${imgBase64}" class="msg-image" alt="uploaded"/>
      ${val ? `<div style="margin-top:6px">${val}</div>` : ''}`;
    msgs.appendChild(userDiv);
    msgs.scrollTop = msgs.scrollHeight;
  } else {
    appendMsg('user', val || '', modeLabel);
  }

  input.value = '';
  input.disabled = true;
  clearImageUpload();

  // Build message content for API
  let userContent;
  if (imgBase64) {
    userContent = [
      { inline_data: { mime_type: imgMime, data: imgBase64 } },
      { text: val || 'Please analyse this image.' }
    ];
  } else {
    userContent = val;
  }

  session.messages.push({ role: 'user', content: imgBase64 ? `[Image attached] ${val || 'Please analyse this image.'}` : val });
  if (currentUser) {
    await saveSessionStore(currentMode);
  }
  if (isFirst) await autoNameSession(val);
  updateMemoryBar();

  // Typing indicator
  const typingId = 'typing-' + Date.now();
  const typingDiv = document.createElement('div');
  typingDiv.className = 'msg ai';
  typingDiv.id = typingId;
  typingDiv.innerHTML = `<div class="sender-row"><div class="sender">${modeLabel}</div></div><span style="opacity:0.45">Thinking...</span>`;
  msgs.appendChild(typingDiv);
  msgs.scrollTop = msgs.scrollHeight;

  try {
    // 🔒 Secure: calls our Netlify Edge Function — API key never exposed to browser
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system: systemPrompts[currentMode],
        messages: session.messages,
        ...(imgBase64 && {
          image: { base64: imgBase64, mime: imgMime },
          imageText: val || 'Please analyse this image.'
        })
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errMsg = errData?.error?.message || `API error ${response.status}`;
      throw new Error(errMsg);
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || "Sorry, I couldn't respond. Please try again.";

    session.messages.push({ role: 'assistant', content: reply });
    if (currentUser) {
      await saveSessionStore(currentMode);
    }
    updateMemoryBar();

    const typingEl = document.getElementById(typingId);
    if (typingEl) {
      typingEl.innerHTML = '';
      const { senderRow, actionBar } = buildAIMsgActions(typingId, modeLabel, reply);
      typingEl.appendChild(senderRow);
      typingEl.appendChild(renderContent(reply));
      typingEl.appendChild(actionBar);
    }
  } catch (err) {
    const typingEl = document.getElementById(typingId);
    const errMsg = err?.message || 'Something went wrong.';
    if (typingEl) typingEl.innerHTML = `<div class="sender-row"><div class="sender">${modeLabel}</div></div><span style="color:#f87171">⚠️ ${errMsg}</span>`;
    // Remove the failed user message from session history so it doesn't corrupt context
    if (session.messages[session.messages.length - 1]?.role === 'user') {
      session.messages.pop();
    }
  }

  input.disabled = false;
  input.focus();
  msgs.scrollTop = msgs.scrollHeight;
}

// =============================================
//  SWITCH MODE
// =============================================
async function switchMode(btn) {
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentMode = btn.dataset.mode;
  const m = modes[currentMode];

  document.getElementById('modeTitle').textContent = m.title;
  document.getElementById('modeTitle').style.color = m.color;
  document.getElementById('modeDesc').textContent = m.desc;
  document.getElementById('headerBadge').textContent = btn.querySelector('.label').textContent;
  document.getElementById('headerBadge').style.color = m.color;
  document.getElementById('headerBadge').style.borderColor = m.color;
  document.getElementById('userInput').placeholder = m.placeholder;

  await loadSessionStore(currentMode);
  const sessions = getSortedSessions(currentMode);
  if (sessions.length > 0) {
    await loadSession(sessions[0].id);
  } else {
    await createNewSession();
  }
}

// =============================================
//  PDF DOWNLOAD (sandbox-safe: blob → new tab)
// =============================================
async function downloadMessageAsPDF(messageId) {
  const el = document.getElementById(messageId);
  if (!el) return;

  const modeName = document.querySelector('.mode-btn.active')?.dataset.mode || 'sewalk';
  const modeLabel = modes[modeName]?.title || modeName;
  const session = getSession(modeName, currentSessionId);
  const sessionTitle = session?.title || 'response';
  const filename = [modeLabel, sessionTitle]
    .join(' — ').replace(/[^\w\s—]/gi,'').trim().replace(/\s+/g,'_') + '.pdf';

  const ICON = `<svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;
  const origBtn = el.querySelector('.msg-download-btn');
  const setBtn = (label, spin) => {
    if (!origBtn) return;
    origBtn.style.opacity = '1';
    origBtn.innerHTML = spin
      ? `<svg viewBox="0 0 24 24" style="animation:pdfSpin 0.8s linear infinite"><circle cx="12" cy="12" r="9" stroke-dasharray="40" stroke-dashoffset="15" fill="none"/></svg>${label}`
      : `${ICON}${label}`;
  };
  setBtn('Rendering…', true);

  const clone = el.cloneNode(true);
  clone.querySelector('.msg-download-btn')?.remove();

  if (window.renderMathInElement) {
    renderMathInElement(clone, {
      delimiters: [
        { left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false },
        { left: '\\(', right: '\\)', display: false }, { left: '\\[', right: '\\]', display: true }
      ],
      throwOnError: false
    });
  }

  clone.querySelectorAll('.katex,.katex-display').forEach(k => { k.style.color='#1a1a2e'; k.style.fontSize='1em'; });
  clone.querySelectorAll('.katex-html').forEach(k => k.style.color='#1a1a2e');
  clone.style.cssText = `background:#fff!important;color:#1a1a2e!important;border:none!important;border-radius:0!important;padding:28px 32px!important;max-width:100%!important;font-family:'DM Sans',Georgia,sans-serif!important;font-size:13.5px!important;line-height:1.75!important;animation:none!important;`;
  clone.querySelector('.sender-row')?.setAttribute('style','display:flex;align-items:center;margin-bottom:14px;padding-bottom:10px;border-bottom:2px solid #eeeef4;');
  clone.querySelector('.sender')?.setAttribute('style','color:#888;font-size:0.68rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0;opacity:1;');
  clone.querySelectorAll('p,li,td,th').forEach(e => { if(!e.closest('pre')) e.style.color='#1a1a2e'; });
  clone.querySelectorAll('h1,h2,h3').forEach(e => e.style.color='#0a0a1a');
  clone.querySelectorAll('strong').forEach(e => e.style.color='#000');
  clone.querySelectorAll('blockquote').forEach(e => e.setAttribute('style','border-left:3px solid #c9a84c;padding-left:14px;color:#555;font-style:italic;margin:10px 0;'));
  clone.querySelectorAll('code:not(pre code)').forEach(e => e.setAttribute('style','background:#f0eeff;border:1px solid #ddd;border-radius:4px;padding:1px 6px;font-size:0.82em;color:#6b3fa0;'));
  clone.querySelectorAll('pre').forEach(p => p.setAttribute('style','background:#1e1e2e;border-radius:8px;overflow:hidden;margin:10px 0;'));
  clone.querySelectorAll('.code-header').forEach(c => c.setAttribute('style','background:#16162a;padding:6px 14px;font-size:0.68rem;color:#aaa;'));
  clone.querySelectorAll('.copy-btn').forEach(c => c.style.display='none');

  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'position:fixed;left:-9999px;top:0;width:720px;background:#fff;z-index:-1;';
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

  const opt = {
    margin: [14,14,14,14], filename,
    image: { type:'jpeg', quality:0.98 },
    html2canvas: {
      scale:2.5, useCORS:true, allowTaint:true, backgroundColor:'#ffffff', logging:false,
      onclone: doc => {
        if (!doc.querySelector('link[href*="katex"]')) {
          const l = doc.createElement('link'); l.rel='stylesheet';
          l.href='https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css';
          doc.head.appendChild(l);
        }
      }
    },
    jsPDF: { unit:'mm', format:'a4', orientation:'portrait' }
  };

  try {
    setBtn('Opening…', true);
    const blob = await html2pdf().set(opt).from(clone).output('blob');
    document.body.removeChild(wrapper);
    const url = URL.createObjectURL(blob);
    const tab = window.open(url, '_blank');
    if (tab) {
      setTimeout(() => URL.revokeObjectURL(url), 30000);
      setBtn('Opened ✓', false);
    } else {
      const a = document.createElement('a');
      a.href=url; a.download=filename; a.style.display='none';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      setBtn('Saved ✓', false);
    }
  } catch(err) {
    console.error('PDF failed:', err);
    if (document.body.contains(wrapper)) document.body.removeChild(wrapper);
    setBtn('Error ✗', false);
  }
  setTimeout(() => { if(origBtn){ origBtn.innerHTML=`${ICON}PDF`; origBtn.style.opacity=''; } }, 2500);
}

// =============================================
//  TOAST
// =============================================
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

// =============================================
//  VIEW SWITCHER
// =============================================
function switchView(v) {
  const isGames = v === 'games';
  document.getElementById('chatView').style.display = isGames ? 'none' : 'flex';
  const gv = document.getElementById('gamesView');
  gv.classList.toggle('visible', isGames);
  document.getElementById('btnChat').classList.toggle('active', !isGames);
  document.getElementById('btnGames').classList.toggle('active', isGames);
  if (isGames) GameManager.refreshScores();
}

// =============================================
//  GAME MANAGER
// =============================================
const GameManager = (() => {

  // ── High-Score helpers ──────────────────────
  async function getHS(key) {
    try {
      const r = storage.get('hs:' + key);
      return r ? (parseInt(r.value) || 0) : 0;
    } catch { return 0; }
  }
  async function setHS(key, val) {
    try { storage.set('hs:' + key, String(val)); } catch {}
  }

  async function refreshScores() {
    const p = await getHS('pattern');
    const f = await getHS('focus');
    document.getElementById('hsPattern').textContent = p > 0 ? `Level ${p}` : '—';
    document.getElementById('hsFocus').textContent   = f > 0 ? `${f} pts` : '—';
    // Refresh new game scores too
    setTimeout(() => { if (GameManager.refreshAllScores) GameManager.refreshAllScores(); }, 100);
  }

  // ── Shared open/close ───────────────────────
  function open(name) {
    document.getElementById('overlay' + cap(name)).classList.add('open');
  }
  function close(name) {
    document.getElementById('overlay' + cap(name)).classList.remove('open');
    if (name === 'pattern') PR.destroy();
    if (name === 'focus')   FF.destroy();
    refreshScores();
  }
  function launch(name) {
    if (name === 'pattern') PR.start();
    if (name === 'focus')   FF.start();
    open(name);
  }
  function restart(name) {
    if (name === 'pattern') PR.start();
    if (name === 'focus')   FF.start();
  }
  function cap(s) { return s[0].toUpperCase() + s.slice(1); }

  // ─────────────────────────────────────────────
  //  GAME 1 — Pattern Recall
  // ─────────────────────────────────────────────
  const PR = (() => {
    const COLORS = ['#c9a84c','#4ecdc4','#ffca28','#ff7096','#60a5fa','#34d399'];
    let level, score, lives, pattern, userPicks, phase, gridSize, tileCount;

    function el(id) { return document.getElementById(id); }

    function start() {
      level = 1; score = 0; lives = 3;
      el('patternResult').style.display = 'none';
      el('patternGrid').style.display   = '';
      buildCardPreview();
      nextRound();
    }

    function buildCardPreview() {
      const p = document.getElementById('cardPreviewPattern');
      p.innerHTML = '';
      const cols = ['#c9a84c','#4ecdc4','#ffca28','#ff7096','#60a5fa','#34d399','#ff6b35','#d4a843','#fb923c'];
      for (let i = 0; i < 9; i++) {
        const t = document.createElement('div');
        t.className = 'mini-tile';
        t.style.background = Math.random() > 0.5 ? cols[i % cols.length] : 'rgba(255,255,255,0.06)';
        p.appendChild(t);
      }
    }

    function nextRound() {
      gridSize = Math.min(3 + Math.floor((level - 1) / 3), 5);
      tileCount = gridSize * gridSize;
      const litCount = Math.min(2 + level, Math.floor(tileCount * 0.6));
      pattern = new Set();
      while (pattern.size < litCount) pattern.add(Math.floor(Math.random() * tileCount));

      updateHUD();
      buildGrid(false);
      flashPattern();
    }

    function buildGrid(interactive) {
      const g = el('patternGrid');
      const sz = gridSize <= 3 ? 68 : gridSize <= 4 ? 56 : 46;
      g.style.cssText = `display:grid;grid-template-columns:repeat(${gridSize},${sz}px);gap:8px;margin:0 auto;width:fit-content;`;
      g.innerHTML = '';
      for (let i = 0; i < tileCount; i++) {
        const t = document.createElement('div');
        t.className = 'ptile';
        t.style.cssText = `width:${sz}px;height:${sz}px;background:${COLORS[i % COLORS.length]};opacity:0.18;`;
        t.dataset.idx = i;
        if (interactive) t.onclick = () => handlePick(i, t);
        g.appendChild(t);
      }
    }

    function flashPattern() {
      phase = 'watching';
      el('patternPhaseMsg').textContent = '👀 Memorise the pattern…';
      el('patternGrid').style.pointerEvents = 'none';
      const tiles = el('patternGrid').querySelectorAll('.ptile');
      const delay = Math.max(350, 800 - level * 40);

      setTimeout(() => {
        pattern.forEach(idx => {
          tiles[idx].style.opacity = '1';
          tiles[idx].classList.add('lit');
        });
        const showTime = Math.max(600, 1800 - level * 80);
        setTimeout(() => {
          pattern.forEach(idx => {
            tiles[idx].style.opacity = '0.18';
            tiles[idx].classList.remove('lit');
          });
          startRecall();
        }, showTime);
      }, delay);
    }

    function startRecall() {
      phase = 'recalling';
      userPicks = new Set();
      el('patternPhaseMsg').textContent = `🎯 Tap the ${pattern.size} lit tile${pattern.size>1?'s':''}`;
      buildGrid(true);
    }

    function handlePick(idx, tile) {
      if (phase !== 'recalling') return;
      if (userPicks.has(idx)) return;
      userPicks.add(idx);

      if (pattern.has(idx)) {
        tile.style.opacity = '1';
        tile.classList.add('lit','correct');
        if (userPicks.size === pattern.size) {
          // Perfect!
          score += level * 10;
          level++;
          el('patternPhaseMsg').textContent = '✅ Correct! Next level…';
          setTimeout(nextRound, 900);
        }
      } else {
        tile.classList.add('wrong');
        lives--;
        updateHUD();
        if (lives <= 0) {
          setTimeout(endGame, 600);
        } else {
          el('patternPhaseMsg').textContent = `❌ Miss! ${lives} ${lives===1?'life':'lives'} left`;
          setTimeout(() => {
            tile.classList.remove('wrong');
            userPicks.delete(idx);
          }, 500);
        }
      }
    }

    function updateHUD() {
      el('patLvl').textContent   = level;
      el('patScore').textContent = score;
      el('patLives').textContent = '♥ '.repeat(lives).trim() || '—';
    }

    async function endGame() {
      el('patternGrid').style.display = 'none';
      el('patternResult').style.display = '';
      el('patResultSub').textContent = `You reached level ${level} with ${score} pts`;
      const hs = await getHS('pattern');
      const newHS = level > hs;
      if (newHS) {
        await setHS('pattern', level);
        el('patResultEmoji').textContent = '🏆';
        el('patResultTitle').textContent = 'New Best!';
        el('patResultHs').textContent = `🎉 New High Score — Level ${level}!`;
      } else {
        el('patResultEmoji').textContent = lives <= 0 ? '😤' : '✨';
        el('patResultTitle').textContent = 'Game Over';
        el('patResultHs').textContent = `Best: Level ${hs}`;
      }
    }

    function destroy() {
      el('patternGrid').innerHTML = '';
      el('patternResult').style.display = 'none';
      el('patternGrid').style.display = '';
    }

    return { start, destroy };
  })();

  // ─────────────────────────────────────────────
  //  GAME 2 — Fast Focus
  // ─────────────────────────────────────────────
  const FF = (() => {
    const SHAPES   = ['circle','square','diamond'];
    const COLORS   = ['#ff6b35','#c9a84c','#4ecdc4','#ffca28','#ff7096'];
    const RULES    = ['colour','shape','colour+shape'];
    const DURATION = 30; // seconds

    let score, round, rule, oddIdx, timer, timerInterval, shapes, animRunning;

    function el(id) { return document.getElementById(id); }

    function start() {
      score = 0; round = 0;
      el('focusResult').style.display = 'none';
      el('focusArena').style.display  = '';
      el('focusArena').style.pointerEvents = '';

      let t = DURATION;
      el('focTimer').textContent = t.toFixed(1);
      clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        t -= 0.1;
        el('focTimer').textContent = Math.max(0, t).toFixed(1);
        if (t <= 0) { clearInterval(timerInterval); endGame(); }
      }, 100);

      nextRound();
    }

    function nextRound() {
      round++;
      rule = RULES[Math.min(Math.floor((round - 1) / 3), RULES.length - 1)];
      el('focRuleText').textContent = rule;
      el('focRound').textContent = round;
      el('focScore').textContent  = score;

      // Build shape set: 5 "same" + 1 odd
      const count = 6;
      const sameShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      const sameColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      shapes = [];

      for (let i = 0; i < count - 1; i++) {
        shapes.push({ shape: sameShape, color: sameColor });
      }

      // Build odd one out depending on rule
      let oddShape = sameShape, oddColor = sameColor;
      if (rule === 'colour' || rule === 'colour+shape') {
        const others = COLORS.filter(c => c !== sameColor);
        oddColor = others[Math.floor(Math.random() * others.length)];
      }
      if (rule === 'shape' || rule === 'colour+shape') {
        const others = SHAPES.filter(s => s !== sameShape);
        oddShape = others[Math.floor(Math.random() * others.length)];
      }
      shapes.push({ shape: oddShape, color: oddColor });
      oddIdx = shapes.length - 1;

      // Shuffle
      for (let i = shapes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shapes[i], shapes[j]] = [shapes[j], shapes[i]];
        if (j === oddIdx) oddIdx = i;
        else if (i === oddIdx) oddIdx = j;
      }

      renderShapes();
    }

    function renderShapes() {
      const arena = el('focusArena');
      arena.innerHTML = '';
      const sz = 46;
      const W = arena.offsetWidth || 420;
      const H = 260;
      arena.style.height = H + 'px';

      const positions = [];
      shapes.forEach((s, i) => {
        const div = document.createElement('div');
        div.className = 'focus-shape ' + s.shape;
        div.style.width  = sz + 'px';
        div.style.height = sz + 'px';
        div.style.background = s.color;

        // Non-overlapping random position
        let x, y, tries = 0;
        do {
          x = Math.floor(Math.random() * (W - sz - 16)) + 8;
          y = Math.floor(Math.random() * (H - sz - 16)) + 8;
          tries++;
        } while (tries < 30 && positions.some(p => Math.abs(p.x - x) < sz + 8 && Math.abs(p.y - y) < sz + 8));
        positions.push({ x, y });

        div.style.left = x + 'px';
        div.style.top  = y + 'px';
        div.dataset.idx = i;
        div.onclick = () => handleClick(i, div);
        arena.appendChild(div);
      });
    }

    function handleClick(idx, div) {
      if (idx === oddIdx) {
        // Correct
        score += 10 + Math.max(0, round - 1) * 2;
        div.classList.add('pop');
        setTimeout(nextRound, 200);
      } else {
        // Wrong — penalise time by visually flashing arena
        const arena = el('focusArena');
        arena.style.background = 'rgba(239,68,68,0.12)';
        setTimeout(() => { arena.style.background = ''; }, 250);
      }
      el('focScore').textContent = score;
    }

    async function endGame() {
      el('focusArena').style.display = 'none';
      el('focusResult').style.display = '';
      el('focResultSub').textContent = `You scored ${score} points in ${round - 1} rounds`;
      const hs = await getHS('focus');
      if (score > hs) {
        await setHS('focus', score);
        el('focResultEmoji').textContent = '🏆';
        el('focResultTitle').textContent = 'New Best!';
        el('focResultHs').textContent = `🎉 New High Score — ${score} pts!`;
      } else {
        el('focResultEmoji').textContent = '⚡';
        el('focResultTitle').textContent = "Time's Up!";
        el('focResultHs').textContent = `Best: ${hs} pts`;
      }
    }

    function destroy() {
      clearInterval(timerInterval);
      el('focusArena').innerHTML = '';
      el('focusResult').style.display = 'none';
      el('focusArena').style.display = '';
    }

    return { start, destroy };
  })();

  // Card preview is now handled in the consolidated DOMContentLoaded above
  return { launch, close, restart, refreshScores };
})();


async function init() {
  await loadSessionStore(currentMode);
  const sessions = getSortedSessions(currentMode);
  if (sessions.length > 0) {
    await loadSession(sessions[0].id);
  } else {
    await createNewSession();
  }
}

// Init runs inside DOMContentLoaded (defined below in auth script)

// Stub functions in case any old references remain
function showApiKeyModal() {}
function closeApiKeyModal() {}
function saveApiKey() {}

// Inline Web App Manifest via blob
(function() {
  const manifest = {
    name: "SeWalk AI",
    short_name: "SeWalk AI",
    description: "Your premium multi-persona AI companion",
    start_url: "./",
    display: "standalone",
    background_color: "#0a0800",
    theme_color: "#c9a84c",
    orientation: "portrait-primary",
    icons: [
      { src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'><rect width='192' height='192' rx='40' fill='%23c9a84c'/><text y='130' x='28' font-size='115' fill='%230a0800'>✦</text></svg>", sizes: "192x192", type: "image/svg+xml" },
      { src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><rect width='512' height='512' rx='100' fill='%23c9a84c'/><text y='360' x='60' font-size='320' fill='%230a0800'>✦</text></svg>", sizes: "512x512", type: "image/svg+xml" }
    ]
  };
  const blob = new Blob([JSON.stringify(manifest)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('link');
  link.rel = 'manifest'; link.href = url;
  document.head.appendChild(link);
})();

// PWA Install prompt
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  // Show a subtle install banner after 30 seconds
  setTimeout(() => {
    if (deferredPrompt) showInstallBanner();
  }, 30000);
});

function showInstallBanner() {
  const banner = document.createElement('div');
  banner.id = 'installBanner';
  banner.style.cssText = `position:fixed;bottom:80px;left:50%;transform:translateX(-50%);z-index:9998;background:rgba(17,15,0,0.97);border:1px solid rgba(201,168,76,0.35);border-radius:16px;padding:14px 20px;display:flex;align-items:center;gap:14px;box-shadow:0 8px 32px rgba(0,0,0,0.6),0 0 20px rgba(201,168,76,0.1);max-width:340px;width:90%;animation:fadeUp 0.4s ease both;`;
  banner.innerHTML = `
    <span style="font-size:1.4rem">✦</span>
    <div style="flex:1">
      <div style="font-family:'Syne',sans-serif;font-size:0.85rem;font-weight:700;color:#e8c96a;">Install SeWalk AI</div>
      <div style="font-size:0.72rem;color:#7a7060;margin-top:2px;">Add to home screen for the best experience</div>
    </div>
    <button onclick="installPWA()" style="background:linear-gradient(135deg,#c9a84c,#a8852a);border:none;border-radius:10px;padding:8px 14px;color:#0a0800;font-family:'DM Sans',sans-serif;font-size:0.78rem;font-weight:700;cursor:pointer;">Install</button>
    <button onclick="document.getElementById('installBanner').remove()" style="background:none;border:none;color:#7a7060;font-size:1.1rem;cursor:pointer;padding:2px 5px;">✕</button>
  `;
  document.body.appendChild(banner);
}

async function installPWA() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  const banner = document.getElementById('installBanner');
  if (banner) banner.remove();
  if (outcome === 'accepted') showToast('✦ SeWalk AI installed!');
}

window.addEventListener('appinstalled', () => {
  showToast('✦ SeWalk AI installed successfully!');
  deferredPrompt = null;
});

// =============================================
//  NEW GAMES — Number Memory, Stroop, Math Blitz
//  Missing Number, N-Back, Snake
//  + Global Leaderboard
// =============================================

// ── Leaderboard helpers ───────────────────────────────
const LB_GAMES = [
  { key: 'nummem',    label: '🔢 Number Memory' },
  { key: 'stroop',    label: '🎨 Stroop' },
  { key: 'mathblitz', label: '➕ Math Blitz' },
  { key: 'missing',   label: '🧩 Missing Number' },
  { key: 'nback',     label: '🧠 N-Back' },
  { key: 'snake',     label: '🐍 Snake' },
  { key: 'pattern',   label: '🟣 Pattern Recall' },
  { key: 'focus',     label: '🟠 Fast Focus' },
];

async function lbGet(key) {
  try {
    const r = await window.storage.get('lb:' + key, true);
    return r ? JSON.parse(r.value) : [];
  } catch { return []; }
}
async function lbSet(key, arr) {
  try { await window.storage.set('lb:' + key, JSON.stringify(arr), true); } catch {}
}
async function lbSubmit(key, score) {
  const user = (typeof _supabase !== 'undefined' && _supabase) ? (await _supabase.auth.getSession())?.data?.session?.user?.email : null;
  const name = user ? user.split('@')[0] : 'Guest';
  let arr = await lbGet(key);
  arr.push({ name, score, date: new Date().toLocaleDateString('en-IN') });
  arr.sort((a,b) => b.score - a.score);
  arr = arr.slice(0, 10);
  await lbSet(key, arr);
}

// ── Extend GameManager ────────────────────────────────
const _origGM = GameManager;

// Patch launch/close/restart to handle new games
const _origLaunch  = GameManager.launch.bind(GameManager);
const _origClose   = GameManager.close.bind(GameManager);
const _origRestart = GameManager.restart.bind(GameManager);

GameManager.launch = function(name) {
  const newGames = ['nummem','stroop','mathblitz','missing','nback','snake','leaderboard'];
  if (newGames.includes(name)) {
    if (name === 'nummem')    NM.start();
    if (name === 'stroop')    ST.start();
    if (name === 'mathblitz') MB.start();
    if (name === 'missing')   MS.start();
    if (name === 'nback')     NB.start();
    if (name === 'snake')     SK.init();
    if (name === 'leaderboard') GameManager.openLeaderboard();
    const cap = name[0].toUpperCase() + name.slice(1);
    const el = document.getElementById('overlay' + cap);
    if (el) el.classList.add('open');
  } else {
    _origLaunch(name);
  }
};

GameManager.close = function(name) {
  const newGames = ['nummem','stroop','mathblitz','missing','nback','snake','leaderboard'];
  if (newGames.includes(name)) {
    if (name === 'snake') SK.stop();
    const cap = name[0].toUpperCase() + name.slice(1);
    const el = document.getElementById('overlay' + cap);
    if (el) el.classList.remove('open');
    GameManager.refreshAllScores();
  } else {
    _origClose(name);
  }
};

GameManager.refreshAllScores = async function() {
  const scores = {
    nummem:    v => `Level ${v}`,
    stroop:    v => `${v} pts`,
    mathblitz: v => `${v} pts`,
    missing:   v => `${v}/10`,
    nback:     v => `${v} pts`,
    snake:     v => `${v} pts`,
  };
  const ids = {
    nummem: 'hsNumMem', stroop: 'hsStroop', mathblitz: 'hsMathBlitz',
    missing: 'hsMissing', nback: 'hsNBack', snake: 'hsSnake'
  };
  for (const [key, fmt] of Object.entries(scores)) {
    try {
      const r = await window.storage.get('hs:' + key);
      const val = r ? parseInt(r.value) : 0;
      const el = document.getElementById(ids[key]);
      if (el) el.textContent = val > 0 ? fmt(val) : '—';
    } catch {}
  }
};

GameManager.openLeaderboard = async function() {
  const overlay = document.getElementById('overlayLeaderboard');
  overlay.classList.add('open');
  const tabsEl = document.getElementById('lbTabs');
  tabsEl.innerHTML = '';
  let activeKey = LB_GAMES[0].key;

  async function renderTab(key) {
    activeKey = key;
    tabsEl.querySelectorAll('.lb-tab').forEach(t => {
      t.style.background = t.dataset.key === key ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.04)';
      t.style.color = t.dataset.key === key ? 'var(--accent)' : 'var(--muted)';
    });
    const content = document.getElementById('lbContent');
    const arr = await lbGet(key);
    if (!arr.length) {
      content.innerHTML = '<div style="text-align:center;color:var(--muted);padding:40px 0;">No scores yet — be the first!</div>';
      return;
    }
    content.innerHTML = `
      <table style="width:100%;border-collapse:collapse;font-size:0.85rem;">
        <tr style="color:var(--muted);border-bottom:1px solid var(--border);">
          <th style="padding:8px;text-align:left;">#</th>
          <th style="padding:8px;text-align:left;">Player</th>
          <th style="padding:8px;text-align:right;">Score</th>
          <th style="padding:8px;text-align:right;">Date</th>
        </tr>
        ${arr.map((e,i) => `
          <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
            <td style="padding:8px;color:${i===0?'#c9a84c':i===1?'#9ca3af':i===2?'#cd7f32':'var(--muted)'};">${i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1}</td>
            <td style="padding:8px;color:var(--text);">${e.name}</td>
            <td style="padding:8px;text-align:right;color:var(--accent);font-weight:700;">${e.score}</td>
            <td style="padding:8px;text-align:right;color:var(--muted);">${e.date}</td>
          </tr>`).join('')}
      </table>`;
  }

  LB_GAMES.forEach(g => {
    const btn = document.createElement('button');
    btn.className = 'lb-tab';
    btn.dataset.key = g.key;
    btn.textContent = g.label;
    btn.style.cssText = 'padding:6px 12px;border-radius:99px;border:1px solid var(--border);background:rgba(255,255,255,0.04);color:var(--muted);font-size:0.72rem;cursor:pointer;font-family:"DM Sans",sans-serif;';
    btn.onclick = () => renderTab(g.key);
    tabsEl.appendChild(btn);
  });
  renderTab(activeKey);
};

// ─────────────────────────────────────────────
//  GAME 3 — Number Memory
// ─────────────────────────────────────────────
const NM = (() => {
  let level, currentNum, phase;

  function el(id) { return document.getElementById(id); }

  function start() {
    level = 1; phase = 'show';
    el('nmResult').style.display = 'none';
    el('nmInput').style.display = 'none';
    el('nmInput').value = '';
    el('nmBtn').textContent = 'Start';
    el('nmStatus').textContent = 'Press Start to begin!';
    el('nmNumber').textContent = '';
  }

  function action() {
    if (phase === 'show' || phase === 'start') {
      showNumber();
    }
  }

  function showNumber() {
    phase = 'show';
    currentNum = Array.from({length: level}, () => Math.floor(Math.random()*10)).join('');
    el('nmStatus').textContent = `Memorise this ${level}-digit number!`;
    el('nmNumber').textContent = currentNum;
    el('nmInput').style.display = 'none';
    el('nmBtn').style.display = 'none';
    setTimeout(() => {
      el('nmNumber').textContent = '';
      el('nmStatus').textContent = 'Now type the number!';
      el('nmInput').style.display = 'block';
      el('nmInput').value = '';
      el('nmInput').focus();
      el('nmBtn').textContent = 'Submit';
      el('nmBtn').style.display = '';
      phase = 'input';
    }, Math.max(1500, level * 500));
  }

  function submit() {
    if (phase !== 'input') return;
    const ans = el('nmInput').value.trim();
    if (ans === currentNum) {
      level++;
      el('nmStatus').textContent = `✓ Correct! Level ${level} — ready?`;
      el('nmInput').style.display = 'none';
      el('nmBtn').textContent = 'Next Level →';
      phase = 'show';
      // Save high score
      window.storage.get('hs:nummem').then(r => {
        const best = r ? parseInt(r.value) : 0;
        if (level - 1 > best) window.storage.set('hs:nummem', String(level-1));
      }).catch(()=>{});
      lbSubmit('nummem', level - 1);
    } else {
      const best = level - 1;
      el('nmResult').style.display = 'block';
      el('nmResult').innerHTML = `<div style="color:#f87171;">✗ Wrong! The number was <strong>${currentNum}</strong></div><div style="color:var(--muted);margin-top:6px;">You reached Level ${best}</div><button onclick="NM.start()" style="margin-top:12px;padding:8px 24px;border-radius:99px;border:none;background:var(--accent);color:#0a0800;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;">Play Again</button>`;
      el('nmInput').style.display = 'none';
      el('nmBtn').style.display = 'none';
      phase = 'done';
    }
  }

  return { start, action, submit };
})();

// ─────────────────────────────────────────────
//  GAME 4 — Stroop Challenge
// ─────────────────────────────────────────────
const ST = (() => {
  const COLORS = [
    { name: 'RED',    hex: '#f87171' },
    { name: 'BLUE',   hex: '#60a5fa' },
    { name: 'GREEN',  hex: '#34d399' },
    { name: 'YELLOW', hex: '#fbbf24' },
    { name: 'PURPLE', hex: '#a78bfa' },
    { name: 'ORANGE', hex: '#fb923c' },
  ];
  let score, timeLeft, timer, inkColor;

  function el(id) { return document.getElementById(id); }

  function start() {
    score = 0; timeLeft = 30;
    el('stroopResult').style.display = 'none';
    el('stroopBtns').style.display = 'flex';
    tick();
    nextRound();
  }

  function tick() {
    el('stroopScore').textContent = `Score: ${score} | Time: ${timeLeft}s`;
    el('stroopTimer').style.width = (timeLeft / 30 * 100) + '%';
    if (timeLeft <= 0) { end(); return; }
    timeLeft--;
    timer = setTimeout(tick, 1000);
  }

  function nextRound() {
    const word  = COLORS[Math.floor(Math.random() * COLORS.length)];
    inkColor    = COLORS[Math.floor(Math.random() * COLORS.length)];
    el('stroopWord').textContent  = word.name;
    el('stroopWord').style.color  = inkColor.hex;

    // Shuffle color buttons
    const shuffled = [...COLORS].sort(() => Math.random() - 0.5);
    el('stroopBtns').innerHTML = shuffled.map(c =>
      `<button onclick="ST.answer('${c.name}')" style="padding:10px 16px;border-radius:10px;border:none;background:${c.hex};color:#0a0800;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:0.85rem;">${c.name}</button>`
    ).join('');
  }

  function answer(colorName) {
    if (timeLeft <= 0) return;
    if (colorName === inkColor.name) {
      score++;
      el('stroopScore').textContent = `Score: ${score} | Time: ${timeLeft}s`;
    }
    nextRound();
  }

  function end() {
    clearTimeout(timer);
    el('stroopBtns').style.display = 'none';
    el('stroopWord').textContent = '';
    el('stroopResult').style.display = 'block';
    el('stroopResult').innerHTML = `<div style="color:var(--accent);font-size:1.4rem;font-weight:800;">Score: ${score}</div><div style="color:var(--muted);margin-top:6px;">Great brain workout!</div><button onclick="ST.start()" style="margin-top:12px;padding:8px 24px;border-radius:99px;border:none;background:var(--accent);color:#0a0800;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;">Play Again</button>`;
    window.storage.get('hs:stroop').then(r => {
      const best = r ? parseInt(r.value) : 0;
      if (score > best) window.storage.set('hs:stroop', String(score));
    }).catch(()=>{});
    lbSubmit('stroop', score);
  }

  return { start, answer };
})();

// ─────────────────────────────────────────────
//  GAME 5 — Math Blitz
// ─────────────────────────────────────────────
const MB = (() => {
  let score, timeLeft, timer, correctAns, phase;

  function el(id) { return document.getElementById(id); }

  function start() {
    score = 0; timeLeft = 60; phase = 'playing';
    el('mbResult').style.display = 'none';
    el('mbInput').style.display = 'block';
    el('mbBtn').style.display = 'none';
    el('mbFeedback').textContent = '';
    tick();
    nextQ();
  }

  function action() { start(); }

  function tick() {
    el('mbScore').textContent = `Score: ${score} | Time: ${timeLeft}s`;
    el('mbTimer').style.width = (timeLeft / 60 * 100) + '%';
    if (timeLeft <= 0) { end(); return; }
    timeLeft--;
    timer = setTimeout(tick, 1000);
  }

  function nextQ() {
    if (timeLeft <= 0) return;
    const diff = Math.min(Math.floor(score / 5) + 1, 4);
    let q, a;
    const ops = diff < 2 ? ['+','-'] : diff < 3 ? ['+','-','*'] : ['+','-','*','/'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let n1 = Math.floor(Math.random() * (10 * diff)) + 1;
    let n2 = Math.floor(Math.random() * (10 * diff)) + 1;
    if (op === '-' && n2 > n1) [n1,n2] = [n2,n1];
    if (op === '/') { n2 = [2,3,4,5][Math.floor(Math.random()*4)]; n1 = n2 * (Math.floor(Math.random()*9)+1); }
    const sym = op === '*' ? '×' : op === '/' ? '÷' : op;
    q = `${n1} ${sym} ${n2} = ?`;
    a = op === '+' ? n1+n2 : op === '-' ? n1-n2 : op === '*' ? n1*n2 : n1/n2;
    correctAns = a;
    el('mbQuestion').textContent = q;
    el('mbInput').value = '';
    el('mbInput').focus();
  }

  function submit() {
    if (phase !== 'playing' || timeLeft <= 0) return;
    const ans = parseFloat(el('mbInput').value);
    if (ans === correctAns) {
      score++;
      el('mbFeedback').style.color = '#34d399';
      el('mbFeedback').textContent = '✓ Correct!';
    } else {
      el('mbFeedback').style.color = '#f87171';
      el('mbFeedback').textContent = `✗ Answer was ${correctAns}`;
    }
    setTimeout(() => { el('mbFeedback').textContent = ''; nextQ(); }, 400);
  }

  function end() {
    clearTimeout(timer);
    phase = 'done';
    el('mbInput').style.display = 'none';
    el('mbResult').style.display = 'block';
    el('mbResult').innerHTML = `<div style="color:#34d399;font-size:1.4rem;font-weight:800;">Score: ${score}</div><div style="color:var(--muted);margin-top:6px;">Questions answered correctly!</div><button onclick="MB.start()" style="margin-top:12px;padding:8px 24px;border-radius:99px;border:none;background:#34d399;color:#0a0800;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;">Play Again</button>`;
    window.storage.get('hs:mathblitz').then(r => {
      const best = r ? parseInt(r.value) : 0;
      if (score > best) window.storage.set('hs:mathblitz', String(score));
    }).catch(()=>{});
    lbSubmit('mathblitz', score);
  }

  return { start, action, submit };
})();

// ─────────────────────────────────────────────
//  GAME 6 — Missing Number
// ─────────────────────────────────────────────
const MS = (() => {
  let qNum, correct, score;
  const PATTERNS = [
    () => { const s=Math.floor(Math.random()*5)+1,f=Math.floor(Math.random()*20)+1; const seq=[f,f+s,f+2*s,f+3*s,f+4*s]; const hi=Math.floor(Math.random()*3)+1; const a=seq[hi]; seq[hi]='?'; return {seq,a}; },
    () => { const r=Math.floor(Math.random()*3)+2,f=Math.floor(Math.random()*5)+1; const seq=[f,f*r,f*r*r,f*r*r*r,f*r*r*r*r]; const hi=Math.floor(Math.random()*3)+1; const a=seq[hi]; seq[hi]='?'; return {seq,a}; },
    () => { let seq=[1,1,2,3,5,8,13,21]; const start=Math.floor(Math.random()*4); const s=seq.slice(start,start+5); const hi=Math.floor(Math.random()*3)+1; const a=s[hi]; s[hi]='?'; return {seq:s,a}; },
    () => { const seq=[1,4,9,16,25,36]; const s=seq.slice(0,5); const hi=Math.floor(Math.random()*3)+1; const a=s[hi]; s[hi]='?'; return {seq:s,a}; },
  ];

  function el(id) { return document.getElementById(id); }

  function start() { score = 0; qNum = 0; el('misResult').style.display='none'; nextQ(); }

  function nextQ() {
    if (qNum >= 10) { end(); return; }
    qNum++;
    el('misScore').textContent = `Question ${qNum} of 10 | Score: ${score}`;
    el('misFeedback').textContent = '';
    const pattern = PATTERNS[Math.floor(Math.random()*PATTERNS.length)]();
    correct = pattern.a;
    el('misSequence').innerHTML = pattern.seq.map(n =>
      n === '?' ? `<span style="color:#f87171;font-size:2rem;">?</span>` : `<span>${n}</span>`
    ).join('<span style="opacity:0.4;">·</span>');

    // Generate options
    const opts = new Set([correct]);
    while (opts.size < 4) opts.add(correct + (Math.floor(Math.random()*10)-5));
    const shuffled = [...opts].sort(() => Math.random()-0.5);
    el('misBtns').innerHTML = shuffled.map(o =>
      `<button onclick="MS.answer(${o})" style="padding:10px 20px;border-radius:10px;border:1px solid var(--border);background:var(--surface2);color:var(--text);font-size:1rem;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;">${o}</button>`
    ).join('');
  }

  function answer(val) {
    if (val === correct) {
      score++;
      el('misFeedback').style.color = '#34d399';
      el('misFeedback').textContent = '✓ Correct!';
    } else {
      el('misFeedback').style.color = '#f87171';
      el('misFeedback').textContent = `✗ Answer was ${correct}`;
    }
    setTimeout(nextQ, 700);
  }

  function end() {
    el('misResult').style.display = 'block';
    el('misResult').innerHTML = `<div style="color:var(--accent);font-size:1.4rem;font-weight:800;">${score}/10</div><div style="color:var(--muted);margin-top:6px;">${score>=8?'Outstanding!':score>=5?'Good job!':'Keep practicing!'}</div><button onclick="MS.start()" style="margin-top:12px;padding:8px 24px;border-radius:99px;border:none;background:var(--accent);color:#0a0800;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;">Play Again</button>`;
    el('misBtns').innerHTML = '';
    window.storage.get('hs:missing').then(r => {
      const best = r ? parseInt(r.value) : 0;
      if (score > best) window.storage.set('hs:missing', String(score));
    }).catch(()=>{});
    lbSubmit('missing', score);
  }

  return { start, answer };
})();

// ─────────────────────────────────────────────
//  GAME 7 — N-Back Task
// ─────────────────────────────────────────────
const NB = (() => {
  const LETTERS = 'BCDFGHJKLMNPQRSTVWXYZ'.split('');
  let n, sequence, pos, score, hits, misses, timer, phase;

  function el(id) { return document.getElementById(id); }

  function start() {
    n = 2; sequence = []; pos = 0; score = 0; hits = 0; misses = 0; phase = 'playing';
    el('nbResult').style.display = 'none';
    el('nbBtn').style.display = 'none';
    el('nbLevel').textContent = `Level: ${n}-Back`;
    el('nbStatus').textContent = 'Does this match what appeared 2 steps ago?';
    el('nbScore').textContent = 'Score: 0';
    showNext();
  }

  function action() { start(); }

  function showNext() {
    if (pos >= 25) { end(); return; }
    const letter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
    sequence.push(letter);
    el('nbDisplay').textContent = letter;
    el('nbDisplay').style.opacity = '1';
    setTimeout(() => { el('nbDisplay').style.opacity = '0.1'; }, 500);
    pos++;
    timer = setTimeout(showNext, 2000);
  }

  function match() {
    if (phase !== 'playing') return;
    if (pos > n && sequence[pos-1] === sequence[pos-1-n]) {
      score += 10; hits++;
      el('nbScore').style.color = '#34d399';
    } else {
      score = Math.max(0, score - 5); misses++;
      el('nbScore').style.color = '#f87171';
    }
    el('nbScore').textContent = `Score: ${score}`;
    setTimeout(() => el('nbScore').style.color = 'var(--muted)', 500);
  }

  function noMatch() {
    if (phase !== 'playing') return;
    if (pos > n && sequence[pos-1] !== sequence[pos-1-n]) {
      score += 5;
      el('nbScore').style.color = '#34d399';
    }
    el('nbScore').textContent = `Score: ${score}`;
    setTimeout(() => el('nbScore').style.color = 'var(--muted)', 500);
  }

  function end() {
    clearTimeout(timer);
    phase = 'done';
    el('nbResult').style.display = 'block';
    el('nbResult').innerHTML = `<div style="color:var(--accent);font-size:1.4rem;font-weight:800;">Score: ${score}</div><div style="color:var(--muted);margin-top:6px;">Hits: ${hits} | Misses: ${misses}</div><button onclick="NB.start()" style="margin-top:12px;padding:8px 24px;border-radius:99px;border:none;background:var(--accent);color:#0a0800;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;">Play Again</button>`;
    el('nbBtn').style.display = '';
    el('nbBtn').textContent = 'Play Again';
    el('nbBtn').onclick = () => NB.start();
    window.storage.get('hs:nback').then(r => {
      const best = r ? parseInt(r.value) : 0;
      if (score > best) window.storage.set('hs:nback', String(score));
    }).catch(()=>{});
    lbSubmit('nback', score);
  }

  return { start, action, match, noMatch };
})();

// ─────────────────────────────────────────────
//  GAME 8 — Snake
// ─────────────────────────────────────────────
const SK = (() => {
  const GRID = 18, CELL = 20;
  let snake, dir, nextDir, food, score, gameLoop, running;
  let canvas, ctx;

  function el(id) { return document.getElementById(id); }

  function init() {
    canvas = el('snakeCanvas');
    ctx = canvas.getContext('2d');
    canvas.width = GRID * CELL;
    canvas.height = GRID * CELL;
    score = 0; running = false;
    el('snakeScore').textContent = 'Score: 0';
    el('snakeStatus').textContent = 'Press Start or use arrow keys / WASD';
    el('snakeBtn').textContent = 'Start';
    drawIdle();
  }

  function drawIdle() {
    ctx.fillStyle = '#0a0800';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(201,168,76,0.15)';
    ctx.font = 'bold 24px DM Sans';
    ctx.textAlign = 'center';
    ctx.fillText('🐍 Press Start', canvas.width/2, canvas.height/2);
  }

  function action() {
    if (running) { stop(); el('snakeBtn').textContent = 'Restart'; }
    else { startGame(); }
  }

  function startGame() {
    snake = [{x:9,y:9},{x:8,y:9},{x:7,y:9}];
    dir = {x:1,y:0}; nextDir = {x:1,y:0};
    score = 0; running = true;
    placeFood();
    el('snakeBtn').textContent = 'Stop';
    el('snakeStatus').textContent = 'Arrow keys or WASD to move';
    clearInterval(gameLoop);
    gameLoop = setInterval(step, 120);
  }

  function placeFood() {
    do { food = {x:Math.floor(Math.random()*GRID), y:Math.floor(Math.random()*GRID)}; }
    while (snake.some(s => s.x===food.x && s.y===food.y));
  }

  function step() {
    dir = nextDir;
    const head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};
    if (head.x<0||head.x>=GRID||head.y<0||head.y>=GRID||snake.some(s=>s.x===head.x&&s.y===head.y)) {
      gameOver(); return;
    }
    snake.unshift(head);
    if (head.x===food.x && head.y===food.y) { score++; el('snakeScore').textContent=`Score: ${score}`; placeFood(); }
    else snake.pop();
    draw();
  }

  function draw() {
    ctx.fillStyle = '#0a0800';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Grid dots
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    for (let x=0;x<GRID;x++) for(let y=0;y<GRID;y++) {
      ctx.fillRect(x*CELL+CELL/2-1,y*CELL+CELL/2-1,2,2);
    }
    // Food
    ctx.fillStyle = '#f87171';
    ctx.beginPath();
    ctx.arc(food.x*CELL+CELL/2, food.y*CELL+CELL/2, CELL/2-2, 0, Math.PI*2);
    ctx.fill();
    // Snake
    snake.forEach((s,i) => {
      ctx.fillStyle = i===0 ? '#c9a84c' : `hsl(45,${60-i}%,${50-i*0.5}%)`;
      ctx.beginPath();
      ctx.roundRect(s.x*CELL+1, s.y*CELL+1, CELL-2, CELL-2, 4);
      ctx.fill();
    });
  }

  function gameOver() {
    clearInterval(gameLoop);
    running = false;
    el('snakeBtn').textContent = 'Play Again';
    el('snakeStatus').textContent = `Game Over! Score: ${score}`;
    window.storage.get('hs:snake').then(r => {
      const best = r ? parseInt(r.value) : 0;
      if (score > best) window.storage.set('hs:snake', String(score));
    }).catch(()=>{});
    lbSubmit('snake', score);
  }

  function stop() { clearInterval(gameLoop); running = false; }

  function setDir(dx, dy) {
    if (!running) return;
    if (dx===1&&dir.x===-1) return;
    if (dx===-1&&dir.x===1) return;
    if (dy===1&&dir.y===-1) return;
    if (dy===-1&&dir.y===1) return;
    nextDir = {x:dx,y:dy};
  }

  document.addEventListener('keydown', e => {
    const map = {ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],w:[0,-1],s:[0,1],a:[-1,0],d:[1,0]};
    const d = map[e.key];
    if (d) { e.preventDefault(); setDir(d[0],d[1]); }
  });

  return { init, action, stop, setDir };
})();
