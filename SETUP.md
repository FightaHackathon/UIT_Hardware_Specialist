# Setup Guide for Team Members

Welcome to the **UIT Hardware Specialist** project! This guide will help you set up the project on your local machine.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** version 18 or higher ([Download here](https://nodejs.org/))
- **npm** (comes with Node.js)
- A **Mistral AI API key** (we'll get this in the next step)

## 🔑 Getting Your Mistral AI API Key

The application uses Mistral AI for hardware analysis. You need to get your own API key:

1. **Visit Mistral AI Console**: Go to [https://console.mistral.ai/](https://console.mistral.ai/)

2. **Create an account** (if you don't have one):
   - Click "Sign Up"
   - Visit [https://auth.mistral.ai/ui/registration](https://auth.mistral.ai/ui/registration)
   - Complete the registration process

3. **Get your API key**:
   - After logging in, navigate to [API Keys](https://console.mistral.ai/api-keys/)
   - Click "Create new key"
   - Copy the generated API key (you won't be able to see it again!)
   - **Important**: Keep this key secure and never commit it to Git

> [!IMPORTANT]
> Free tier limits: Mistral AI offers a free tier with limited API calls. For development and testing, this should be sufficient. Check their [pricing page](https://mistral.ai/technology/#pricing) for details.

## 🚀 Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd uit-hardware-specialist-github
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React, TypeScript, Vite (frontend)
- Express, Mistral AI SDK (backend)
- And other dependencies

### 3. Configure Environment Variables

**Create a `.env` file** in the project root:

```bash
# On Windows PowerShell
Copy-Item .env.example .env

# On macOS/Linux
cp .env.example .env
```

**Edit the `.env` file** and add your Mistral API key:

```env
MISTRAL_API_KEY=your_actual_api_key_here
PORT=3001
```

> [!WARNING]
> Replace `your_actual_api_key_here` with the API key you got from Mistral AI console. Do NOT commit this file to Git!

   **Example**:
   ```env
   MISTRAL_API_KEY=sk_1a2b3c4d5e6f7g8h9i0j
   PORT=3001
   ```

### 4. Verify Configuration

Your project structure should look like this:

```
uit-hardware-specialist-github/
├── .env                    ← Your file with actual API key (git-ignored)
├── .env.example            ← Template file (tracked in Git)
├── server.js               ← Backend server (reads from .env)
├── package.json
└── ... other files
```

## ▶️ Running the Application

### Start Both Frontend and Backend

```bash
npm run dev:all
```

This command starts:
- **Backend server** on `http://localhost:3001`
- **Frontend dev server** on `http://localhost:5173`

### Or Run Them Separately

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## ✅ Verify Everything Works

1. **Check the terminal output**:
   - You should see `✅ Mistral client initialized successfully`
   - Backend server: `🚀 Server running on http://localhost:3001`
   - Frontend: `➜  Local:   http://localhost:5173/`

2. **Open your browser**: Navigate to `http://localhost:5173`

3. **Test the AI bot**:
   - Click the chat button
   - The bot indicator should show "Online" (green dot)
   - Try analyzing a build or asking a question

## 🐛 Troubleshooting

### Problem: `MISTRAL_API_KEY is not set in environment variables`

**Solution**: 
- Make sure you created the `.env` file in the project root
- Verify the file is named exactly `.env` (not `.env.txt`)
- Check that you added your API key: `MISTRAL_API_KEY=your_key_here`
- Restart the server after creating/editing `.env`

### Problem: `Mistral client not initialized`

**Solution**:
- Verify your API key is valid
- Check you haven't exceeded your API quota
- Try creating a new API key in the Mistral console

### Problem: Bot shows "Offline"

**Solution**:
- Ensure the backend server is running (`npm run server`)
- Check the console for error messages
- Verify the backend is accessible at `http://localhost:3001/api/health`

### Problem: `npm install` fails

**Solution**:
- Make sure you're using Node.js 18 or higher: `node --version`
- Delete `node_modules` folder and `package-lock.json`, then run `npm install` again
- Check your internet connection

### Problem: Port already in use

**Solution**:
- Change the PORT in your `.env` file to a different number (e.g., `3002`)
- Or kill the process using that port

## 📚 Additional Information

### Project Structure
- `server.js` - Express backend that proxies requests to Mistral AI
- `App.tsx` - Main React application
- `services/mistralService.ts` - Frontend service for API communication
- `knowledge-base/` - Hardware components and compatibility data
- `docs/` - Detailed documentation

### Available Scripts
- `npm run dev` - Start frontend only
- `npm run server` - Start backend only
- `npm run dev:all` - Start both (recommended)
- `npm run build` - Build for production

### Where API Key is Used

The API key is used in **one place only**: `server.js` line 20

```javascript
const apiKey = process.env.MISTRAL_API_KEY;
```

The server reads it from environment variables and initializes the Mistral client. The frontend never sees the API key (for security).

## 🤝 Contributing

When making changes:
1. Never commit your `.env` file
2. Update the documentation if you add new features
3. Test your changes with `npm run dev:all`
4. Keep the `.env.example` updated if you add new environment variables

## 🆘 Need Help?

If you're still having issues:
1. Check the console logs for detailed error messages
2. Review the main [README.md](README.md) for project overview
3. Check the [docs/FUNCTIONS.md](docs/FUNCTIONS.md) for technical details
4. Ask your teammates or project lead

---

**Happy coding! 🚀**
