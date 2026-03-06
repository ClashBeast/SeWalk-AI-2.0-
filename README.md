<div align="center">

<!-- Animated Banner -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=20&height=200&section=header&text=SeWalk%20AI&fontSize=80&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Your%20Smartest%20Companion&descAlignY=60&descAlign=50&descSize=22" width="100%"/>

<!-- Logo -->
<img src="https://raw.githubusercontent.com/otedtalks-byte/sewalk-ai/main/public/icon.png" width="120px" style="border-radius:20px; margin: 20px 0;" onerror="this.style.display='none'"/>

<!-- Badges -->
<p>
  <img src="https://img.shields.io/badge/Built%20with-Gemini%20AI-4285F4?style=for-the-badge&logo=google&logoColor=white"/>
  <img src="https://img.shields.io/badge/Auth-Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white"/>
  <img src="https://img.shields.io/badge/Hosted-Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white"/>
  <img src="https://img.shields.io/badge/PWA-Installable-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white"/>
</p>

<p>
  <img src="https://img.shields.io/badge/License-MIT-gold?style=flat-square"/>
  <img src="https://img.shields.io/badge/Status-Live-brightgreen?style=flat-square"/>
  <img src="https://img.shields.io/badge/Made%20in-India%20🇮🇳-orange?style=flat-square"/>
  <img src="https://img.shields.io/badge/Age%20of%20Builder-16-red?style=flat-square"/>
</p>

<br/>

<!-- Live Demo Button -->
<a href="https://sewalk-ai-0e0188.netlify.app" target="_blank">
  <img src="https://img.shields.io/badge/🚀%20Live%20Demo-sewalk--ai.netlify.app-c9a84c?style=for-the-badge&labelColor=0a0800"/>
</a>

<br/><br/>

</div>

---

<div align="center">

## ✦ What is SeWalk AI?

</div>

**SeWalk AI** is a free, multi-persona AI assistant that gives you **5 specialized AI experts** in one app — each with its own personality, expertise, and memory. Built from scratch in 2 days by a 16-year-old with zero coding experience, zero budget, and pure passion.

> *"Not just another chatbot. Five distinct minds. One platform."*

---

<div align="center">

## 🤖 Meet the 5 Personas

</div>

<table align="center">
  <tr>
    <td align="center" width="20%">
      <h3>🏋️</h3>
      <b>Gym Trainer</b><br/>
      <sub>Personalized fitness coaching. Remembers your goals, splits & progress across sessions.</sub>
    </td>
    <td align="center" width="20%">
      <h3>📚</h3>
      <b>Librarian</b><br/>
      <sub>Book recommendations, summaries, reading lists. Your personal literary guide.</sub>
    </td>
    <td align="center" width="20%">
      <h3>🎵</h3>
      <b>Music Producer</b><br/>
      <sub>Beat advice, music theory, artist feedback. Your creative studio partner.</sub>
    </td>
    <td align="center" width="20%">
      <h3>🧮</h3>
      <b>JEE Tutor</b><br/>
      <sub>Indian competitive exam coaching. Physics, Chemistry, Maths — exam ready.</sub>
    </td>
    <td align="center" width="20%">
      <h3>🌙</h3>
      <b>Companion</b><br/>
      <sub>Emotional support & daily conversation. Always here, always listening.</sub>
    </td>
  </tr>
</table>

---

<div align="center">

## ⚡ Features

</div>

```
✦ Multi-persona AI chat          — Switch between 5 expert modes instantly
✦ Persistent session memory      — AI remembers your full history per mode  
✦ Google Sign In                 — One-click OAuth authentication
✦ Secure serverless backend      — API key hidden in Netlify Edge Functions
✦ Guest mode                     — 10 free messages, no sign-in required
✦ Cognitive Hub                  — Mental exercises & brain games
✦ PWA installable                — Add to home screen like a native app
✦ Markdown + Math rendering      — Beautiful responses with KaTeX support
✦ Auto session naming            — Sessions named from your first message
✦ Black & gold premium design    — Luxury UI that feels like a real product
```

---

<div align="center">

## 🏗️ Architecture

</div>

```
┌─────────────────────────────────────────────────────────┐
│                     USER BROWSER                        │
│                   sewalk-ai.netlify.app                 │
│              HTML + CSS + Vanilla JavaScript            │
└──────────────────────┬──────────────────────────────────┘
                       │ fetch('/api/chat')
                       ▼
┌─────────────────────────────────────────────────────────┐
│              NETLIFY EDGE FUNCTION                      │
│                   chat.js (Deno)                        │
│         API key secured — never exposed to browser      │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS POST
                       ▼
┌─────────────────────────────────────────────────────────┐
│               GOOGLE GEMINI API                         │
│            gemini-3.1-flash-lite-preview                │
│                  Free tier ✓                            │
└─────────────────────────────────────────────────────────┘
                       
┌─────────────────────────────────────────────────────────┐
│                    SUPABASE                             │
│         Auth (Google OAuth + Email/Password)            │
│         Database (chat sessions + user data)            │
│         Row Level Security (users own their data)       │
└─────────────────────────────────────────────────────────┘
```

---

<div align="center">

## 🛠️ Tech Stack

</div>

<div align="center">

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla HTML, CSS, JavaScript |
| AI Engine | Google Gemini API (Free tier) |
| Backend | Netlify Edge Functions (Deno) |
| Database & Auth | Supabase (PostgreSQL + Auth) |
| Hosting | Netlify (Auto-deploy from GitHub) |
| Version Control | GitHub |
| Math Rendering | KaTeX |
| Markdown | Marked.js |
| PWA | Service Worker + Web Manifest |

</div>

---

<div align="center">

## 🚀 Deploy Your Own

</div>

**1. Clone the repo**
```bash
git clone https://github.com/otedtalks-byte/sewalk-ai.git
cd sewalk-ai
```

**2. Set up Supabase**
- Create a free project at [supabase.com](https://supabase.com)
- Copy your Project URL and Anon Key
- Enable Google OAuth in Authentication → Providers

**3. Set up Gemini API**
- Get a free API key at [aistudio.google.com](https://aistudio.google.com)

**4. Deploy to Netlify**
- Connect your GitHub repo to Netlify
- Set publish directory to `public`
- Add environment variable: `GEMINI_API_KEY=your_key_here`
- Deploy!

**5. Update `public/index.html`**
```javascript
const SUPABASE_URL = 'your-supabase-url';
const SUPABASE_KEY = 'your-supabase-anon-key';
```

---

<div align="center">

## 📁 Project Structure

</div>

```
sewalk-ai/
├── netlify/
│   └── edge-functions/
│       └── chat.js          ← Secure AI proxy (Gemini API key hidden here)
├── public/
│   ├── index.html           ← Entire frontend (2197 lines)
│   ├── privacy.html         ← Privacy Policy
│   └── terms.html           ← Terms of Service
├── netlify.toml             ← Netlify config (edge function routing)
└── README.md
```

---

<div align="center">

## 🔒 Security

</div>

- ✅ **API key never exposed** — stored in Netlify environment variables, accessed only server-side
- ✅ **CORS protection** — only whitelisted domains can call the API
- ✅ **Supabase RLS** — Row Level Security ensures users only access their own data
- ✅ **Google OAuth** — verified app, no passwords stored
- ✅ **HTTPS everywhere** — all traffic encrypted

---

<div align="center">

## 📜 Legal

</div>

- [Privacy Policy](https://sewalk-ai-0e0188.netlify.app/privacy.html)
- [Terms of Service](https://sewalk-ai-0e0188.netlify.app/terms.html)

---

<div align="center">

## 👨‍💻 Builder

</div>

<div align="center">

Built with 💛 by **Soumyadip Bhatt**

16 years old · India 🇮🇳 · Zero coding background · Zero budget · 2 days

*"I built this alone, with curiosity, patience, and passion."*

<br/>

<a href="mailto:otedtalks@gmail.com">
  <img src="https://img.shields.io/badge/Contact-otedtalks@gmail.com-c9a84c?style=for-the-badge&logo=gmail&logoColor=white"/>
</a>

<br/><br/>

⭐ **If you found this useful, drop a star!** ⭐

</div>

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=20&height=100&section=footer&animation=fadeIn" width="100%"/>

<sub>© 2026 SeWalk AI · Operated by Soumyadip Bhatt · India</sub>

</div>
