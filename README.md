# UIT Hardware Specialist 🖥️🤖

An AI-powered expert system designed to help University of Information Technology (UIT) students validate PC builds and laptop choices for demanding coursework.

![License](https://img.shields.io/badge/license-Educational-blue.svg)
![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)
![Mistral AI](https://img.shields.io/badge/AI-Mistral-orange)

## 📋 Project Description

**UIT Hardware Specialist** is an intelligent assistant that helps students make informed decisions about computer hardware purchases and builds. The system combines:

- **Knowledge Engineering**: Structured datasets containing component specifications, compatibility rules, and performance benchmarks
- **AI Analysis**: Mistral Large LLM for natural language explanations and recommendations
- **Expert System Rules**: Automated validation of socket compatibility, RAM types, power requirements, and bottleneck detection
- **Bilingual Support**: Full support for English and Burmese (Myanmar) languages

### Key Capabilities

✅ **Desktop PC Build Validation**
- Component compatibility checking (CPU, GPU, RAM, motherboard, storage, PSU, case)
- Physical and electrical compatibility verification
- Performance bottleneck detection
- Suitability scoring (0-100) for UIT workloads

💻 **Laptop Model Analysis**
- Pre-configured laptop evaluation
- Battery life assessment for campus usage
- Performance analysis for student workloads
- Portability and thermal management considerations

🎯 **Workload Profiling**
- Visual Studio / VS Code (Software Engineering)
- Android Studio (Mobile Development)
- Unity / Unreal Engine (Game Development)
- Docker / Kubernetes (DevOps)
- Python / Jupyter / ML Libraries (Data Science)

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│  • Component Selection UI                                   │
│  • Real-time Validation                                     │
│  • Bilingual Interface (EN/MM)                              │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTP API Calls
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                  Backend (Express.js)                        │
│  • API Proxy Server                                         │
│  • Mistral AI Integration                                   │
│  • Environment Configuration                                │
└──────────────────┬──────────────────────────────────────────┘
                   │ Mistral SDK
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    Mistral AI API                            │
│  • Natural Language Analysis                                │
│  • Component Recommendations                                │
│  • Suitability Scoring                                      │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Features

- **🔍 Real-time Compatibility Checking**: Instant validation as you build
- **🤖 AI-Powered Recommendations**: Detailed analysis from Mistral Large LLM
- **📊 Suitability Scoring**: 0-100 score based on UIT coursework requirements
- **🌍 Bilingual Support**: Switch between English and Burmese seamlessly
- **⚡ Knowledge Base**: 60+ PC components, 9 laptop models, comprehensive compatibility rules
- **🔒 Secure API Handling**: Backend proxy keeps API keys safe from frontend exposure

## 🛠️ Technology Stack

### Frontend
- **React 19** + **TypeScript 5.8**: Modern UI framework with type safety
- **Vite 6**: Fast build tool and development server
- **Lucide React**: Beautiful iconography
- **CSS**: Custom styling for dark theme UI

### Backend
- **Express.js 4**: Backend API server
- **Mistral AI SDK**: Integration with Mistral Large LLM
- **Node.js 18+**: JavaScript runtime
- **dotenv**: Secure environment variable management

### Knowledge Engineering
- **JSON Datasets**: Component specifications and compatibility rules
- **Knowledge Graph**: Component relationships and constraints
- **Expert System Logic**: Validation and scoring algorithms

## 📦 Installation

### Prerequisites

- **Node.js 18+** ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Mistral AI API Key** ([Get one free](https://console.mistral.ai/))

### Setup Instructions

1. **Clone or navigate to the project**
   ```bash
   cd "c:\Users\user\Downloads\uit-hardware-specialist (1)"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the project root:
   ```env
   MISTRAL_API_KEY=your_actual_mistral_api_key_here
   PORT=3001
   ```
   
   > ⚠️ **Security Note**: Never commit your `.env` file. It's already in `.gitignore`.

4. **Get your Mistral AI API Key**
   - Visit [Mistral AI Console](https://console.mistral.ai/)
   - Sign up or log in
   - Go to [API Keys](https://console.mistral.ai/api-keys/)
   - Create a new key and copy it to your `.env` file

5. **Start the application**
   ```bash
   npm run dev:all
   ```

   This command starts both:
   - **Frontend**: http://localhost:5173
   - **Backend**: http://localhost:3001

   You should see: `✅ Mistral client initialized successfully`

## 📖 Usage

### Desktop Build Validation

1. Open http://localhost:5173 in your browser
2. Select the **Desktop Build** tab
3. Choose components from dropdowns (CPU, Motherboard, RAM are required)
4. Click **VALIDATE & CHECK SUITABILITY**
5. Review the AI-powered analysis and suitability score

### Laptop Analysis

1. Select the **Laptop Model** tab
2. Choose a laptop from the dropdown
3. View battery life estimate
4. Click **VALIDATE & CHECK SUITABILITY**
5. Review analysis for campus usage suitability

### Language Toggle

Click the **Globe icon** in the header to switch between English and Burmese (Myanmar).

## 📁 Project Structure

```
uit-hardware-specialist/
├── knowledge-base/              # Knowledge engineering assets
│   ├── datasets/                # Component data and compatibility rules
│   │   ├── components.json      # PC components database
│   │   ├── laptops.json         # Laptop models database
│   │   ├── compatibility-rules.json
│   │   └── performance-benchmarks.json
│   ├── ontology/                # Knowledge graph
│   │   └── knowledge-graph.json
│   └── README.md                # Knowledge base documentation
├── docs/                        # Documentation
│   ├── architecture/            # System architecture docs
│   │   ├── knowledge-engineering-overview.md
│   │   ├── ai-inference-flow.md
│   │   └── knowledge-graph-visualization.md
│   └── FUNCTIONS.md             # Function documentation
├── components/                  # React components
│   └── ChatMessage.tsx          # Chat message component
├── services/                    # Service layer
│   └── mistralService.ts        # Mistral AI integration
├── utils/                       # Utility functions
│   └── dataLoader.ts            # Knowledge base data loader
├── uit-hardware-specialist-github/  # Additional project documentation
│   ├── README.md                # Detailed feature documentation
│   └── SETUP.md                 # Setup guide
├── App.tsx                      # Main React application
├── constants.ts                 # App constants and UI text
├── types.ts                     # TypeScript type definitions
├── server.js                    # Backend Express API server
├── package.json                 # Dependencies and scripts
├── vite.config.ts               # Vite configuration
└── tsconfig.json                # TypeScript configuration
```

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend development server only |
| `npm run server` | Start backend API server only |
| `npm run dev:all` | **Start both frontend and backend** (recommended) |
| `npm run build` | Build frontend for production |
| `npm run preview` | Preview production build |

## 📚 Knowledge Base

The system includes a comprehensive knowledge base:

### Components Database (60+ items)
- **CPUs**: Intel i3/i5/i7/i9 (12th-14th gen), AMD Ryzen 5/7/9
- **GPUs**: NVIDIA RTX 3050-4090, AMD RX 6000/7000 series
- **Motherboards**: Socket compatibility (LGA1700, AM5, AM4)
- **RAM**: DDR4/DDR5 modules with speed ratings
- **Storage**: NVMe SSDs, SATA SSDs, HDDs
- **PSUs**: 450W-1000W power supplies
- **Cases**: ATX, mATX, ITX form factors

### Laptop Database (9 models)
- Budget options (ThinkPad E14, Acer Aspire)
- Mid-range (Dell XPS 13, ASUS VivoBook)
- High-performance (MacBook Pro M3, ROG Zephyrus)

### Compatibility Rules
- Socket type matching (LGA1700, AM5, AM4)
- RAM type compatibility (DDR4/DDR5)
- Form factor constraints (ATX, mATX, ITX)
- Power supply requirements
- PCIe generation compatibility

## 🤖 AI Integration

**Mistral Large** powers the intelligent analysis:

- **Natural Language Explanations**: Human-readable compatibility reports
- **Component Pairing**: Optimal CPU-GPU pairing recommendations
- **Bottleneck Detection**: Identifies performance mismatches
- **Student-Specific Advice**: Battery life, portability, thermal considerations
- **Workload Scoring**: 0-100 suitability score for UIT coursework

### How It Works

1. User selects components or laptop
2. Frontend validates basic requirements
3. Build summary sent to backend API
4. Backend calls Mistral API with expert system prompt
5. AI analyzes against UIT workload requirements
6. Response parsed and displayed with score

## 🔒 Security

- **API Key Protection**: Mistral API key stored in `.env` (backend only)
- **Backend Proxy**: Frontend never accesses API key directly
- **CORS Enabled**: Configured for local development
- **.gitignore**: Ensures `.env` is never committed

## 📄 License

This project is created for educational purposes at the University of Information Technology.

## 🤝 Contributing

### For Team Members

1. **Never commit `.env`** - Contains sensitive API keys
2. Follow the setup guide before making changes
3. Test with `npm run dev:all` before committing
4. Update documentation for new features

### Adding New Components

1. Edit `knowledge-base/datasets/components.json`
2. Add component with all required fields:
   ```json
   {
     "id": "cpu-001",
     "name": "Intel Core i5-13400F",
     "type": "CPU",
     "specs": "10C/16T, 4.6GHz, LGA1700",
     "price_range": "$200-$250",
     "tier": "mid"
   }
   ```
3. Update compatibility rules if needed

### Adding New Workloads

1. Edit `knowledge-base/datasets/performance-benchmarks.json`
2. Define requirements and scoring weights
3. Update system instruction in `constants.ts`

## 📞 Support

For questions, issues, or contributions:
- Check the [detailed documentation](./uit-hardware-specialist-github/README.md)
- Review [setup guide](./uit-hardware-specialist-github/SETUP.md)
- Contact the UIT IT department

---

**🚀 Powered by Mistral AI | Built for UIT Students | Made with ❤️ in Myanmar**

