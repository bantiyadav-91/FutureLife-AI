# FutureLife AI

A beginner-friendly personal future-planning dashboard built with React, Vite, Express, and Google's Gemini API.

## What it does

- Collects user-entered personal context such as goals, habits, skills, study time, and monthly money figures.
- Lets the user write a custom analysis prompt.
- Sends the profile and prompt to the Express backend.
- Calls Gemini from the backend and displays a report with possible scenarios, risks, and practical next steps.
- Includes a sample report so the dashboard is usable before an API key is added.
- Allows exporting the current report to a `.txt` file.

The report describes possible outcomes, not guaranteed predictions.

## Requirements

- Node.js 20.19+ or a supported current LTS release
- npm
- Visual Studio Code
- Internet access for installing packages and using Gemini
- A Gemini API key from https://aistudio.google.com/apikey

## Setup on Windows / VS Code

1. Download and extract the `FutureLife-AI.zip` file.
2. Open VS Code.
3. Select **File → Open Folder** and choose the extracted `FutureLife-AI` folder.
4. Open **Terminal → New Terminal**.
5. Confirm Node and npm work:

   ```powershell
   node -v
   npm -v
   ```

6. Install packages:

   ```powershell
   npm install
   ```

7. Copy `.env.example` and name the copy `.env` in the project root. In VS Code, right-click `.env.example`, choose Copy, then paste and rename the copy to `.env`.
8. Open `.env` and replace `your_gemini_api_key_here` with your actual Gemini API key. Do not share this key or upload `.env` to GitHub.
9. Start both the backend and frontend:

   ```powershell
   npm run dev
   ```

10. Open **http://127.0.0.1:5173** in your browser.

Keep the terminal open while using the app. Press `Ctrl + C` in the terminal to stop it.

## Get a Gemini API key

1. Open https://aistudio.google.com/apikey
2. Sign in with your Google account.
3. Create an API key and copy it.
4. Paste it into `.env` after `GEMINI_API_KEY=`.
5. Restart `npm run dev` if the server was already running.

API access, model availability, and free usage limits can change. If you see an API error, check Google AI Studio and the model name in `.env`.

## Folder structure

```text
FutureLife-AI/
├── index.html
├── package.json
├── vite.config.js
├── .env.example
├── .gitignore
├── README.md
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   └── styles.css
└── server/
    └── index.js
```

## How the app works

1. React collects the profile and prompt.
2. `fetch("/api/analyze")` sends them to Express.
3. Express validates the input and reads `GEMINI_API_KEY` from `.env`.
4. The Google Gen AI SDK calls Gemini on the server.
5. The server sends the AI report back to React.
6. React displays the report and lets the user export it.

## Common problems

**`npm` is not recognized**  
Install Node.js from https://nodejs.org, close VS Code, reopen it, and try `node -v` again.

**`Missing script: dev`**  
Make sure the VS Code terminal is inside the extracted `FutureLife-AI` project folder, where `package.json` exists.

**Gemini is not connected yet**  
Make sure `.env` is in the top-level project folder, the key is on the same line as `GEMINI_API_KEY=`, and you restarted the server. Do not put the key in a React file.

**The AI request failed**  
Check your internet, key validity, available model name, and API usage limits. The server terminal may show the underlying error.

**Port 3001 is already in use**  
Change `PORT=3001` in `.env` to another free port and update the Vite proxy in `vite.config.js` to match it.

## Security and privacy notes

- The sample profile is example data. Change it before running your own analysis.
- Do not enter passwords, government ID numbers, bank details, or other sensitive personal information.
- The API key belongs only in the backend `.env` file. Never add it to `src/`.
- This starter does not have login, a database, or report history. Do not treat it as a production-ready service for multiple users.
- Before deploying publicly, add authentication where needed, rate limits, stronger validation, secure hosting, and clear privacy terms.
- AI output can be wrong. Treat future scenarios as planning ideas, not facts or guarantees.

## Build for production

```powershell
npm run build
npm start
```

Then open `http://localhost:3001`. The production server serves the generated `dist` folder.
