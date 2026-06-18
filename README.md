# 📧 AI Email Agent

A powerful and autonomous email marketing setup. This project allows you to extract leads from documents, manage them, and securely run automated email campaigns via a modern Next.js dashboard.

---

## 🚀 Quick Setup Guide

### 1. Prerequisites

- **Node.js** (v16 or higher)
- **Python** (3.9 or higher)

### 2. Configure Environment (.env)

Create a `.env` file in the root directory and add your email credentials:

```env
# Google Gemini API (Required for AI Researcher/Rewriting)
GOOGLE_API_KEY=your_actual_gemini_api_key_here

# Base Configuration (For fallback settings & Python Scripts)
EMAIL_USER=your_main_email@gmail.com
EMAIL_PASS=your_main_app_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
IMAP_HOST=imap.gmail.com
IMAP_PORT=993

# Email Accounts for SMTP Rotation (Required by Backend)
EMAIL_USER_1=your_first_email@gmail.com
EMAIL_PASS_1=your_first_app_password

# Add more as needed for rotation:
# EMAIL_USER_2=your_second_email@gmail.com
# EMAIL_PASS_2=your_second_app_password
```

> **Note:** If you are using Gmail, make sure to generate an **App Password** for `EMAIL_PASS`.

### 3. Start the Backend Server

Open a terminal and run:

```bash
cd ai-email-agent
npm install
npm start
```

> The backend will run on `http://localhost:3001`

### 4. Start the Frontend UI

Open a **new** terminal and run:

```bash
cd ai-email-ui
npm install
npm run dev
```

> The UI will run on `http://localhost:3000`. Open this in your browser to launch your campaigns!

---

## 🛠️ Python Utility Scripts (Optional)

If you want to extract emails from a PDF or organize sent emails:

1. **Extract Emails:** `python Python_script/email_extractor.py`
2. **Generate Remaining Leads:** `python Python_script/Generating_Remaining_Leads.py`
3. **Migrate Sent Emails to Sent Folder:** `python src/script.py`
