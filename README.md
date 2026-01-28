# UIT Hardware Specialist - Project Overview

## Introduction

The **UIT Hardware Specialist** is an AI-powered expert system designed to help University of Information Technology students validate PC builds and laptop choices for demanding coursework.

## Features

- ✅ **Desktop PC Build Validation**: Check compatibility of CPU, GPU, RAM, motherboard, storage, PSU, and case
- 💻 **Laptop Model Analysis**: Evaluate laptops for student workload suitability
- 🤖 **AI-Powered Recommendations**: Get detailed analysis from Mistral AI
- 🌍 **Bilingual Support**: English and Burmese (Myanmar) language support
- 📊 **Suitability Scoring**: 0-100 score based on UIT workload requirements
- ⚡ **Real-time Validation**: Instant compatibility checking

## Technology Stack

### Frontend
- **React** + **TypeScript**: UI framework
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Styling
- **Lucide React**: Icons

### Backend
- **Express.js**: API server
- **Mistral AI**: Large Language Model for analysis
- **Node.js**: Runtime environment

### Knowledge Engineering
- **Structured JSON Datasets**: Component specifications and compatibility rules
- **Knowledge Graph**: Component relationships and constraints
- **Expert System Rules**: Validation and scoring logic

## Project Structure

```
uit-hardware-specialist/
├── knowledge-base/          # Knowledge engineering assets
│   ├── datasets/            # Component data and compatibility rules
│   │   ├── components.json
│   │   ├── laptops.json
│   │   ├── compatibility-rules.json
│   │   └── performance-benchmarks.json
│   └── ontology/            # Knowledge graph
│       └── knowledge-graph.json
├── docs/                    # Documentation
│   ├── architecture/        # System architecture docs
│   │   ├── knowledge-engineering-overview.md
│   │   ├── ai-inference-flow.md
│   │   └── knowledge-graph-visualization.md
│   └── FUNCTIONS.md         # Function documentation
├── utils/                   # Utility functions
│   └── dataLoader.ts        # Knowledge base data loader
├── services/                # Service layer
│   └── mistralService.ts    # Mistral AI integration
├── components/              # React components
│   └── ChatMessage.tsx
├── App.tsx                  # Main application component
├── constants.ts             # App constants and UI text
├── types.ts                 # TypeScript type definitions
├── server.js                # Backend API server
└── package.json             # Dependencies
```

## Getting Started

> [!IMPORTANT]
> **First time setup?** Check out our detailed **[SETUP.md](SETUP.md)** guide for step-by-step instructions!

### Prerequisites
- **Node.js 18+** installed ([Download](https://nodejs.org/))
- **Mistral AI API key** (free tier available)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd uit-hardware-specialist-github
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Get your Mistral AI API key**
   
   - Visit [Mistral AI Console](https://console.mistral.ai/)
   - Sign up or log in
   - Go to [API Keys](https://console.mistral.ai/api-keys/) and create a new key
   - **Copy the key** (you won't see it again!)

4. **Configure environment variables**
   
   Copy the example file and add your API key:
   ```bash
   # Windows PowerShell
   Copy-Item .env.example .env
   
   # macOS/Linux
   cp .env.example .env
   ```
   
   Edit `.env` and add your key:
   ```env
   MISTRAL_API_KEY=your_actual_mistral_api_key_here
   PORT=3001
   ```
   
   > **⚠️ IMPORTANT**: The `.env` file contains your API key and is git-ignored. Never commit it!

5. **Run the application**
   ```bash
   npm run dev:all
   ```

   This starts:
   - Frontend dev server on `http://localhost:5173`
   - Backend API server on `http://localhost:3001`
   
   You should see: `✅ Mistral client initialized successfully`

### Available Scripts

- `npm run dev` - Start frontend only
- `npm run server` - Start backend only  
- `npm run dev:all` - Start both frontend and backend concurrently (recommended)
- `npm run build` - Build for production

## Usage

### Desktop Build Validation

1. Select **Desktop Build** tab
2. Choose components from dropdowns:
   - CPU (required)
   - Motherboard (required)
   - RAM (required)
   - GPU, Storage, PSU, Case (optional but recommended)
3. Click **VALIDATE & CHECK SUITABILITY**
4. View compatibility analysis and score

### Laptop Selection

1. Select **Laptop Model** tab
2. Choose a laptop from the dropdown
3. View battery life estimate
4. Click **VALIDATE & CHECK SUITABILITY**
5. Review analysis for campus usage suitability

## Knowledge Base

The expert system uses a comprehensive knowledge base:

### Components Database
- **60+ PC components** with full specifications
- **9 laptop models** from various price ranges
- Performance tier classifications
- Price range estimates

### Compatibility Rules
- Socket compatibility (Intel LGA1700, AMD AM5/AM4)
- RAM type matching (DDR4/DDR5)
- Form factor constraints
- Power supply requirements
- Bottleneck detection

### Workload Benchmarks
Performance requirements for:
- Visual Studio / VS Code (Software Engineering)
- Android Studio (Mobile Development)
- Unity / Unreal Engine (Game Development)
- Docker / Kubernetes (DevOps)
- Python / Jupyter / ML (Data Science)

## AI Integration

The system uses **Mistral Large** LLM for:
- Natural language analysis
- Detailed compatibility explanations
- Component pairing recommendations
- Bottleneck identification
- Student-specific advice (battery life, portability, thermal management)

### How it Works

1. User selects components or laptop
2. System validates hard constraints (socket, RAM type, power)
3. Build summary sent to Mistral AI with expert system prompt
4. AI analyzes against UIT workload requirements
5. Response parsed for score and formatted recommendations
6. Results displayed to user

## Documentation

Comprehensive documentation available in `docs/`:

- **[Knowledge Engineering Overview](docs/architecture/knowledge-engineering-overview.md)**: Expert system design principles
- **[AI Inference Flow](docs/architecture/ai-inference-flow.md)**: How the AI analysis works
- **[Knowledge Graph Visualization](docs/architecture/knowledge-graph-visualization.md)**: Visual diagrams of component relationships
- **[Function Documentation](docs/FUNCTIONS.md)**: Complete reference for all functions

## Contributing

### For Team Members

1. **Never commit your `.env` file** - It contains your API key!
2. Follow the setup guide in [SETUP.md](SETUP.md)
3. Test your changes with `npm run dev:all` before committing
4. Update documentation if you add new features

### Adding New Components

1. Edit `knowledge-base/datasets/components.json`
2. Add component with all required fields
3. Update compatibility rules if needed

### Adding New Workloads

1. Edit `knowledge-base/datasets/performance-benchmarks.json`
2. Define requirements and scoring weights
3. Update system instruction in `constants.ts`

### Where the API Key is Used

The Mistral API key is configured in **one secure location**:
- **File**: `server.js` (line 20)
- **Usage**: Backend server reads from environment variable `process.env.MISTRAL_API_KEY`
- **Security**: The key is never exposed to the frontend or browser

## License

This project is created for educational purposes at the University of Information Technology.

## Contact

For questions or issues, please contact the UIT IT department.

---

**Powered by Mistral AI** | **Built for UIT Students**
