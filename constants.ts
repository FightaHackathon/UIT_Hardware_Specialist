import { formatComponentsForUI } from './utils/dataLoader';

/**
 * Application Title
 * Displayed in the header of the UIT Hardware Specialist
 */
export const APP_TITLE = "UIT Hardware Specialist";

/**
 * Application Subtitle
 * Tagline describing the purpose of the application
 */
export const APP_SUBTITLE = "Student Rig Validator & Analyzer";

/**
 * System Instruction for AI
 * 
 * This comprehensive prompt defines the role, context, and expected output
 * format for the Mistral AI model. It acts as the "expert system persona"
 * that guides the LLM's analysis and recommendations.
 * 
 * The instruction covers:
 * - Role definition (UIT Hardware Specialist)
 * - Context about UIT student workloads
 * - Analysis instructions (compatibility, performance, bottlenecks)
 * - Response format requirements (score, markdown structure)
 */
export const SYSTEM_INSTRUCTION = `
ROLE:
You are the "UIT Hardware Specialist," an expert system for the University of Information Technology. 
Your goal is to validate PC builds and Laptop choices for Students who need to run demanding software.

CONTEXT - UIT STUDENT WORKLOADS:
1. **Software Engineering**: Visual Studio, IntelliJ, VS Code (Large projects, compiling).
2. **Mobile Dev**: Android Studio (Heavy RAM & CPU usage for emulators).
3. **Game/Multimedia**: Unity, Unreal Engine, Blender (Requires strong GPU).
4. **DevOps/Networking**: Docker, Kubernetes, Virtual Machines (High RAM/Core count).
5. **Data Science**: Python, Jupyter, Local LLMs (VRAM & CUDA cores preferred).

INSTRUCTIONS:
Analyze the provided configuration (Desktop Build or Laptop Model).
1. **Compatibility Check (Desktops)**: (Sockets, RAM type DDR4/5, PSU Wattage, Dimensions).
2. **Performance Analysis**: Can it handle the workloads above?
3. **Bottleneck Detection**: Are components balanced?
4. **Laptop Analysis**: If a laptop is selected, check if thermal throttling or battery life might be issues for a student campus life.

RESPONSE FORMAT (Markdown):
Start with a strict metadata line: "SCORE: [0-100]" (Overall suitability for a UIT student).

Then provide:
**✅ COMPATIBLE** (or ❌ INCOMPATIBLE / ⚠️ ISSUES)
**Summary**: [1-2 sentences]

**Workload Suitability**:
*   💻 **Coding & Compiling**: [Rating/Comment]
*   📱 **Mobile Emulation**: [Rating/Comment]
*   🎨 **Graphics & AI**: [Rating/Comment]

**Expert Verdict**: Detailed advice on what to change or why it's great.
`;

/**
 * UI Text Translations
 * 
 * Bilingual text content for the user interface.
 * Supports English (en) and Burmese (my) languages.
 * 
 * Each key contains an object with 'en' and 'my' properties.
 */
export const UI_TEXT = {
  header_subtitle: { en: "Student Rig Validator & Analyzer", my: "ကျောင်းသားသုံး ကွန်ပျူတာ အထောက်အကူပြုစနစ်" },
  status_online: { en: "ONLINE", my: "အွန်လိုင်း" },
  status_offline: { en: "OFFLINE", my: "အော့ဖ်လိုင်း" },
  tab_desktop: { en: "Desktop Build", my: "Desktop တပ်ဆင်ရန်" },
  tab_laptop: { en: "Laptop Model", my: "Laptop မော်ဒယ်" },
  section_desktop: { en: "Component Selection", my: "ပစ္စည်းများ ရွေးချယ်ရန်" },
  section_laptop: { en: "Model Selection", my: "မော်ဒယ် ရွေးချယ်ရန်" },
  btn_reset: { en: "Reset", "my": "ပြန်စမည်" },
  btn_analyze: { en: "VALIDATE & CHECK SUITABILITY", "my": "စစ်ဆေးမည်" },
  btn_analyzing: { en: "Analyzing System...", "my": "စစ်ဆေးနေပါသည်..." },
  select_prefix: { en: "Select", "my": "ရွေးချယ်ပါ" },
  empty_state: { en: "Select components and run validation", "my": "အစိတ်အပိုင်းများရွေးချယ်ပြီး စစ်ဆေးပါ" },
  checking_msg: { en: "Checking for UIT Coursework Compatibility", "my": "UIT ကျောင်းသင်ခန်းစာများနှင့် ကိုက်ညီမှုရှိမရှိ စစ်ဆေးနေပါသည်" },
  score_label: { en: "UIT Suitability Score", "my": "UIT အသုံးပြုရန် သင့်လျော်မှု ရမှတ်" },
  battery_est: { en: "Est. Battery Life", "my": "ဘက်ထရီကြာချိန် (ခန့်မှန်း)" }
};

/**
 * Component Database
 * 
 * This object is now loaded from the knowledge base JSON files using the dataLoader utility.
 * It maintains backward compatibility with the existing UI code by formatting the
 * structured JSON data into the expected format.
 * 
 * The data includes:
 * - CPU: Processors with socket, cores, TDP specifications
 * - Motherboard: Main boards with socket, RAM type, form factor
 * - GPU: Graphics cards with VRAM, power consumption
 * - RAM: Memory modules with type (DDR4/DDR5), capacity, speed
 * - Storage: SSDs/HDDs with interface and capacity
 * - PSU: Power supplies with wattage and efficiency
 * - Case: PC cases with form factor support
 * - Laptop: Laptop models with full specifications and battery life
 * 
 * @see knowledge-base/datasets/components.json
 * @see knowledge-base/datasets/laptops.json
 * @see utils/dataLoader.ts
 */
export const COMPONENT_DB: Record<string, { id: string, name: string, specs: string, battery?: string }[]> = formatComponentsForUI();