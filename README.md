<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=20&height=200&section=header&text=SeWalk%20AI&fontSize=80&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Your%20Smartest%20Companion&descAlignY=60&descAlign=50&descSize=22" width="100%"/>

<img src="https://raw.githubusercontent.com/otedtalks-byte/sewalk-ai/main/public/icon.png" width="120px" style="border-radius:20px; margin: 20px 0;" onerror="this.style.display='none'"/>

<p>
  <img src="https://img.shields.io/badge/Built%20with-Gemini%20AI-4285F4?style=for-the-badge&logo=google&logoColor=white"/>
  <img src="https://img.shields.io/badge/Auth-Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white"/>
  <img src="https://img.shields.io/badge/Hosted-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white"/>
  <img src="https://img.shields.io/badge/PWA-Installable-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white"/>
</p>

<p>
  <img src="https://img.shields.io/badge/License-MIT-gold?style=flat-square"/>
  <img src="https://img.shields.io/badge/Status-Live-brightgreen?style=flat-square"/>
  <img src="https://img.shields.io/badge/Made%20in-India%20🇮🇳-orange?style=flat-square"/>
  <img src="https://img.shields.io/badge/Age%20of%20Builder-16-red?style=flat-square"/>
  <img src="https://img.shields.io/badge/Version-2.0-c9a84c?style=flat-square"/>
</p>

<br/>

<a href="https://se-walk-ai-2-0.vercel.app" target="_blank">
  <img src="https://img.shields.io/badge/🚀%20Live%20Demo-se--walk--ai--2--0.vercel.app-c9a84c?style=for-the-badge&labelColor=0a0800"/>
</a>

<br/><br/>

</div>

---

<div align="center">

## ✦ What is SeWalk AI?

</div>

**SeWalk AI** is a free, multi-persona AI assistant that gives you **5 specialized AI experts** in one app — each with its own personality, expertise, and persistent memory. Also features a full **Cognitive Hub** with 8 brain-training games, an on-device **Neural digit recognizer**, image analysis, dark/light theme, and a global leaderboard.

Built from scratch by a 16-year-old with zero coding background, zero budget, and pure passion.

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
✦ Image analysis                 — Upload images for AI to analyse (multimodal)
✦ Google Sign In                 — One-click OAuth authentication
✦ Secure serverless backend      — API key hidden in Vercel Serverless Functions
✦ Guest mode                     — 10 free messages, no sign-in required
✦ Cognitive Hub                  — 8 brain-training games with global leaderboard
✦ SeWalk Neural                  — On-device handwritten digit recognizer (ML)
✦ Dark / Light theme             — Toggle between premium black-gold & light mode
✦ PWA installable                — Add to home screen like a native app
✦ Markdown + Math rendering      — Beautiful responses with KaTeX & highlight.js
✦ Auto session naming            — Sessions named from your first message
✦ Critical Analysis panel        — Built-in product roadmap & market analysis view
✦ Black & gold premium design    — Luxury UI that feels like a real product
```

---

<div align="center">

## 🧠 Cognitive Hub — 8 Games

</div>

| Game | Skill Trained |
|------|--------------|
| Pattern Memory | Working Memory |
| Focus Filter | Processing Speed |
| Number Memory | Short Term Memory |
| Stroop Challenge | Cognitive Flexibility |
| Math Blitz | Processing Speed |
| Missing Number | Logic & IQ |
| N-Back Task | Working Memory |
| Snake | Spatial Planning |

🏆 Global leaderboard tracks your best scores across all games.

---

<div align="center">

## 🏗️ Architecture

</div>

```
┌─────────────────────────────────────────────────────────┐
│                     USER BROWSER                        │
│                se-walk-ai-2-0.vercel.app                │
│              HTML + CSS + Vanilla JavaScript            │
└──────────────────────┬──────────────────────────────────┘
                       │ fetch('/api/chat')
                       ▼
┌─────────────────────────────────────────────────────────┐
│            VERCEL SERVERLESS FUNCTION                   │
│                  api/chat.js (Node.js)                  │
│         API key secured — never exposed to browser      │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS POST
                       ▼
┌─────────────────────────────────────────────────────────┐
│               GOOGLE GEMINI API                         │
│            gemini-3.1-flash-lite-preview                │
│              Free tier ✓  Multimodal ✓                  │
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
| AI Engine | Google Gemini API — gemini-3.1-flash-lite-preview |
| Backend | Vercel Serverless Functions (Node.js) |
| Database & Auth | Supabase (PostgreSQL + Auth) |
| Hosting | Vercel (Auto-deploy from GitHub) |
| Version Control | GitHub |
| Math Rendering | KaTeX |
| Markdown | Marked.js |
| Code Highlighting | highlight.js |
| On-device ML | Custom Neural Network (weights_tiny.json) |
| PWA | Service Worker + Web Manifest |

</div>

---

<div align="center">

## 🚀 Deploy Your Own

</div>

**1. Clone the repo**
```bash
git clone https://github.com/ClashBeast/SeWalk-AI-2.0-.git
cd SeWalk-AI-2.0-
```

**2. Set up Supabase**
- Create a free project at [supabase.com](https://supabase.com)
- Copy your Project URL and Anon Key
- Enable Google OAuth in Authentication → Providers

**3. Set up Gemini API**
- Get a free API key at [aistudio.google.com](https://aistudio.google.com)

**4. Deploy to Vercel**
- Connect your GitHub repo to Vercel
- Set output directory to `public`
- Add environment variable: `GEMINI_API_KEY=your_key_here`
- Deploy!

**5. Add your Vercel domain to `api/chat.js`**
```javascript
const ALLOWED_ORIGINS = [
  'https://your-project.vercel.app', // ← add your URL here
  ...
];
```

**6. Update `public/index.html`**
```javascript
const SUPABASE_URL = 'your-supabase-url';
const SUPABASE_KEY = 'your-supabase-anon-key';
```

---

<div align="center">

## 📁 Project Structure

</div>

```
SeWalk-AI-2.0/
├── api/
│   └── chat.js              ← Secure AI proxy (Vercel Serverless, Node.js)
├── public/
│   ├── index.html           ← Entire frontend
│   ├── app.js               ← App logic
│   ├── style.css            ← Styles
│   ├── neural.html          ← On-device digit recognizer
│   ├── weights_tiny.json    ← Neural network weights (runs in browser)
│   ├── privacy.html         ← Privacy Policy
│   └── terms.html           ← Terms of Service
├── vercel.json              ← Vercel config
└── README.md
```

---

<div align="center">

## 🔒 Security

</div>

- ✅ **API key never exposed** — stored in Vercel environment variables, accessed only server-side
- ✅ **CORS protection** — only whitelisted domains can call the API
- ✅ **Supabase RLS** — Row Level Security ensures users only access their own data
- ✅ **Google OAuth** — verified app, no passwords stored
- ✅ **HTTPS everywhere** — all traffic encrypted

---

<div align="center">

## 📜 Legal

</div>

- [Privacy Policy](https://se-walk-ai-2-0.vercel.app/privacy.html)
- [Terms of Service](https://se-walk-ai-2-0.vercel.app/terms.html)

---

<div align="center">

## 👨‍💻 Builder

Built with 💛 by **Soumyadip Bhatt**

16 years old · India 🇮🇳 · Zero coding background · Zero budget

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

<sub>© 2026 SeWalk AI 2.0 · Operated by Soumyadip Bhatt · India</sub>

</div>
