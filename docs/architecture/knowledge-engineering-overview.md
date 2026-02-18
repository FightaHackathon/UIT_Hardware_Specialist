# UIT Hardware Specialist - Knowledge Engineering Overview

## Introduction

The UIT Hardware Specialist is an **Expert System** designed to validate PC builds and laptop selections for University of Information Technology students. It employs knowledge engineering principles to encode hardware compatibility rules, performance requirements, and constraint satisfaction logic.

## Knowledge Engineering Approach

### Expert System Architecture

This system follows a classical **rule-based expert system** architecture with the following components:

1. **Knowledge Base** - Structured datasets containing:
   - Component specifications
   - Compatibility rules
   - Performance benchmarks
   - Constraint satisfaction rules

2. **Inference Engine** - Combination of:
   - Rule-based validation (constraint checking)
   - AI-powered analysis (Mistral LLM integration)
   - Scoring algorithm

3. **User Interface** - React-based configurator allowing users to:
   - Select components
   - Request validation
   - View analysis and recommendations

### Knowledge Representation

The system uses multiple knowledge representation methods:

#### 1. **Semantic Networks (Knowledge Graph)**
- Components are nodes
- Relationships are edges
- Example: CPU → (REQUIRES_SOCKET) → Motherboard

#### 2. **Production Rules**
- IF-THEN rules for validation
- Example: `IF cpu.socket != motherboard.socket THEN incompatible`

#### 3. **Frames/Objects**
- Each component is a structured object with properties
- Example: CPU frame contains {socket, cores, tdp, tier, workloadSuitability}

#### 4. **Constraint Satisfaction Problem (CSP)**
- Variables: {CPU, Motherboard, GPU, RAM, Storage, PSU, Case}
- Domains: Available components for each category
- Constraints: Compatibility rules from knowledge base

## Knowledge Sources

### 1. Component Database
**Location**: `knowledge-base/datasets/components.json`, `laptops.json`

Contains comprehensive specifications for each hardware component:
- **CPU**: socket, cores, TDP, performance tier
- **GPU**: VRAM, power consumption, CUDA cores
- **Motherboard**: socket, RAM type, form factor
- **RAM**: type (DDR4/DDR5), capacity, speed
- **Storage**: interface, capacity, read/write speeds
- **PSU**: wattage, efficiency rating
- **Case**: form factor support, GPU clearance

### 2. Compatibility Rules
**Location**: `knowledge-base/datasets/compatibility-rules.json`

Encoded domain expert knowledge about hardware compatibility:
- **Socket compatibility**: CPU-Motherboard matching
- **RAM compatibility**: DDR4/DDR5 with motherboard support
- **Form factor**: Motherboard-Case physical fit
- **Power requirements**: PSU wattage sufficiency
- **Bottleneck detection**: CPU-GPU pairing balance

### 3. Performance Benchmarks
**Location**: `knowledge-base/datasets/performance-benchmarks.json`

Workload-specific performance requirements:
- Visual Studio (Coding): CPU + RAM focused
- Android Studio (Mobile Dev): RAM + CPU intensive
- Unity/Unreal (Graphics): GPU + RAM demanding
- Docker (DevOps): CPU cores + RAM intensive
- Data Science/ML: GPU (VRAM + CUDA) critical

### 4. Knowledge Graph (Ontology)
**Location**: `knowledge-base/ontology/knowledge-graph.json`

Defines the relationships and dependencies between components as a directed graph:
- Nodes: Components, workloads, constraints
- Edges: Relationships (REQUIRES_SOCKET, REQUIRES_POWER, DEMANDS, etc.)
- Inference rules: Logical deductions

## Constraint Satisfaction

The system solves a **Constraint Satisfaction Problem** where:

### Variables
- CPU, Motherboard, GPU, RAM, Storage, PSU, Case

### Domains
- Each variable has a domain of available components

### Constraints

#### Hard Constraints (Must be satisfied)
1. **Socket Match**: `cpu.socket == motherboard.socket`
2. **RAM Type Match**: `ram.type == motherboard.ramType`
3. **Form Factor Fit**: `motherboard.formFactor ⊆ case.supportedFormFactors`
4. **Power Sufficiency**: `(cpu.tdp + gpu.tdp + baseline) ≤ psu.wattage * 0.8`

#### Soft Constraints (Preferences)
1. **Tier Balance**: Avoid pairing entry-level CPU with high-end GPU
2. **RAM Capacity**: Meet workload recommended RAM
3. **Storage Speed**: NVMe preferred for demanding workloads

### Validation Algorithm

```
FUNCTION validateBuild(build):
    violations = []
    
    // Check hard constraints
    IF cpu.socket != motherboard.socket:
        violations.add(CRITICAL: "Socket mismatch")
    
    IF ram.type != motherboard.ramType:
        violations.add(CRITICAL: "RAM type incompatible")
    
    IF motherboard.formFactor NOT IN case.supportedFormFactors:
        violations.add(CRITICAL: "Motherboard won't fit in case")
    
    totalPower = cpu.maxTdp + gpu.tdp + 150
    IF totalPower > psu.wattage * 0.8:
        violations.add(CRITICAL: "PSU insufficient")
    
    // Check soft constraints
    IF cpuTier == "entry-level" AND gpuTier == "high-end":
        violations.add(WARNING: "CPU bottleneck likely")
    
    IF ram.capacity < workload.recommendedRAM:
        violations.add(WARNING: "RAM may be insufficient")
    
    RETURN violations
```

## Scoring Algorithm

The system calculates a **UIT Suitability Score (0-100)** based on:

### Scoring Factors

1. **Compatibility** (30%)
   - Hard constraint violations: -30 points
   - Soft constraint violations: -10 points each

2. **Workload Performance** (50%)
   - Weighted average across all UIT workloads
   - Weights: Visual Studio (0.3), Android Studio (0.25), Unity (0.2), Docker (0.15), Data Science (0.1)

3. **Component Balance** (10%)
   - No severe bottlenecks
   - Appropriate tier matching

4. **Future-Proofing** (10%)
   - Upgrade path availability
   - Modern standards (DDR5, PCIe Gen4, etc.)

### Score Calculation Example

```
score = 100

// Deduct for compatibility issues
score -= criticalViolations * 30
score -= warnings * 10

// Calculate workload performance
workloadScore = 0
FOR each workload IN [visualStudio, androidStudio, unity, docker, dataScience]:
    componentScores = {
        cpu: componentTierRating[build.cpu.tier],
        ram: ramCapacityRating[build.ram.capacity],
        gpu: componentTierRating[build.gpu.tier],
        storage: storageTypeRating[build.storage.type]
    }
    
    workloadScore += weightedAverage(componentScores, workload.scoringWeights) * workload.weight

score = score * 0.5 + workloadScore * 0.5

RETURN min(max(score, 0), 100)
```

## AI Integration (Neural Network / LLM)

While the system uses structured rule-based reasoning, it also incorporates **Mistral AI** for natural language analysis and recommendations.

### Hybrid Approach

1. **Rule-Based Validation** (Fast, Deterministic)
   - Check hard constraints
   - Calculate compatibility scores
   - Run locally in browser/backend

2. **AI-Powered Analysis** (Contextual, Explanatory)
   - Generate natural language explanations
   - Provide specific recommendations
   - Explain bottlenecks and compatibility issues
   - Consider nuanced factors (thermal management, noise, aesthetics)

### System Prompt Engineering

The AI is provided with:
- **Role**: UIT Hardware Specialist expert system
- **Context**: UIT student workloads and requirements
- **Task**: Analyze build for compatibility, performance, and suitability
- **Output Format**: Structured markdown with score, compatibility status, and recommendations

See `constants.ts` for the complete system instruction.

### Knowledge Graph → AI Context

Before sending to AI, the system:
1. Serializes selected components
2. Looks up compatibility rules
3. Formats workload requirements
4. Sends as structured prompt

Example prompt:
```
Analyze this Desktop PC Build for a UIT Student:

CPU: Intel Core i5-13600K (LGA1700, 14 Cores)
MOTHERBOARD: MSI B760 Gaming Plus (LGA1700, DDR5, ATX)
GPU: NVIDIA RTX 4060 Ti (8GB VRAM, 160W)
RAM: G.Skill Trident Z5 32GB (DDR5-6000MHz)
STORAGE: WD Black SN770 1TB (NVMe Gen4)
PSU: Corsair RM750e (750W, 80+ Gold)
CASE: Corsair 4000D Airflow (ATX)

Check for physical compatibility and performance for:
Visual Studio, Android Studio, Docker, Unity.
Provide the Suitability Score first.
```

## Advantages of This Approach

1. **Explainability**: Every decision is traceable to rules or component specs
2. **Maintainability**: Add new components by updating JSON datasets
3. **Extensibility**: Add new workloads, rules, or compatibility checks easily
4. **Hybrid Intelligence**: Combines deterministic rules with AI reasoning
5. **Educational**: Students learn hardware requirements for their field

## Future Enhancements

1. **Machine Learning Component**:
   - Train models on historical build ratings
   - Predict optimal configurations
   - Learn from user feedback

2. **Fuzzy Logic**:
   - Handle "close enough" matches
   - Gradual scoring instead of binary pass/fail

3. **Case-Based Reasoning**:
   - Store successful student builds
   - Recommend similar builds for similar needs

4. **Multi-Objective Optimization**:
   - Balance performance, cost, power consumption, noise
   - Pareto-optimal solutions

## References

- Component specifications: Manufacturer websites and tech reviews
- Compatibility rules: PC building community standards
- Performance benchmarks: Software vendor requirements and user testing
- Knowledge engineering: Russell & Norvig, "Artificial Intelligence: A Modern Approach"
