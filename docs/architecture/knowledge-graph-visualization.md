# Knowledge Graph Visualization

This document provides a visual representation of the component relationships and dependencies in the UIT Hardware Specialist expert system.

## Component Relationship Graph

```mermaid
graph TD
    %% Component Nodes
    CPU[🔲 CPU<br/>Central Processing Unit]
    MB[🔲 Motherboard<br/>Main Circuit Board]
    GPU[🎮 GPU<br/>Graphics Card]
    RAM[💾 RAM<br/>Memory]
    SSD[💿 Storage<br/>SSD/HDD]
    PSU[⚡ PSU<br/>Power Supply]
    CASE[📦 Case<br/>Chassis]
    
    %% Workload Nodes
    WL_CODE["💻 Visual Studio<br/>(Coding)"]
    WL_ANDROID["📱 Android Studio<br/>(Mobile Dev)"]
    WL_UNITY["🎨 Unity/Unreal<br/>(Graphics)"]
    WL_DOCKER["🐳 Docker<br/>(DevOps)"]
    WL_ML["🤖 ML/Data Science<br/>(AI)"]
    
    %% Critical Relationships (Compatibility Constraints)
    CPU -."|REQUIRES_SOCKET<br/>(LGA1700, AM5, AM4)|".- MB
    RAM -."|REQUIRES_TYPE<br/>(DDR4/DDR5)|".- MB
    MB -."|REQUIRES_FORM_FACTOR<br/>(ATX, mATX, E-ATX)|".- CASE
    
    %% Power Relationships
    GPU -->|"REQUIRES_POWER<br/>(TDP + overhead)"| PSU
    CPU -->|"REQUIRES_POWER<br/>(TDP)"| PSU
    
    %% Physical Space
    GPU -->|"REQUIRES_SPACE<br/>(GPU length < case clearance)"| CASE
    
    %% Connection Relationships
    SSD -->|"CONNECTS_TO<br/>(M.2 / SATA)"| MB
    
    %% Synergy (Performance Balance)
    CPU ---|"SYNERGY<br/>(Avoid bottleneck)"| GPU
    
    %% Workload Demands
    WL_CODE -->|"DEMANDS<br/>(4-8 cores)"| CPU
    WL_CODE -->|"DEMANDS<br/>(8-16GB)"| RAM
    
    WL_ANDROID -->|"DEMANDS<br/>(6-8 cores + virt)"| CPU
    WL_ANDROID -->|"DEMANDS<br/>(16-32GB)"| RAM
    
    WL_UNITY -->|"DEMANDS<br/>(6-12 cores)"| CPU
    WL_UNITY -->|"DEMANDS<br/>(≥8GB VRAM)"| GPU
    WL_UNITY -->|"DEMANDS<br/>(16-32GB)"| RAM
    
    WL_DOCKER -->|"DEMANDS<br/>(4-8 cores + virt)"| CPU
    WL_DOCKER -->|"DEMANDS<br/>(16-64GB)"| RAM
    
    WL_ML -->|"DEMANDS<br/>(≥12GB VRAM + CUDA)"| GPU
    WL_ML -->|"DEMANDS<br/>(16-64GB)"| RAM
    WL_ML -->|"DEMANDS<br/>(NVMe Gen4)"| SSD
    
    classDef componentStyle fill:#1e293b,stroke:#0ea5e9,stroke-width:2px,color:#e2e8f0
    classDef workloadStyle fill:#312e81,stroke:#8b5cf6,stroke-width:2px,color:#e9d5ff
    
    class CPU,MB,GPU,RAM,SSD,PSU,CASE componentStyle
    class WL_CODE,WL_ANDROID,WL_UNITY,WL_DOCKER,WL_ML workloadStyle
```

## Relationship Types

### Critical Relationships (Must Satisfy)

#### 1. REQUIRES_SOCKET
**Components**: CPU ↔ Motherboard  
**Constraint**: `cpu.socket == motherboard.socket`  
**Example**: Intel i5-13600K (LGA1700) requires LGA1700 motherboard

#### 2. REQUIRES_TYPE
**Components**: RAM ↔ Motherboard  
**Constraint**: `ram.type == motherboard.ramType`  
**Example**: DDR5 RAM requires DDR5-compatible motherboard

#### 3. REQUIRES_FORM_FACTOR
**Components**: Motherboard ↔ Case  
**Constraint**: `motherboard.formFactor ⊆ case.supportedFormFactors`  
**Example**: ATX motherboard fits in ATX or E-ATX case

#### 4. REQUIRES_POWER
**Components**: CPU/GPU → PSU  
**Constraint**: `(cpu.tdp + gpu.tdp + 150) ≤ psu.wattage * 0.8`  
**Example**: RTX 4090 (450W) + i9-14900K (253W) needs ≥850W PSU

### Soft Relationships (Preferences)

#### 5. SYNERGY
**Components**: CPU ↔ GPU  
**Constraint**: Tiers should be balanced  
**Example**: Entry-level CPU + High-end GPU = bottleneck warning

#### 6. DEMANDS
**Components**: Workload → Components  
**Constraint**: Component specs meet workload requirements  
**Example**: Android Studio demands ≥16GB RAM

## Layered Architecture View

```mermaid
graph TB
    subgraph "User Layer"
        U[👤 UIT Student]
    end
    
    subgraph "Workload Layer"
        W1[Visual Studio]
        W2[Android Studio]
        W3[Unity/Unreal]
        W4[Docker]
        W5[ML/AI]
    end
    
    subgraph "Performance Layer"
        P1[CPU Performance]
        P2[GPU Performance]
        P3[RAM Capacity]
        P4[Storage Speed]
    end
    
    subgraph "Component Layer"
        C1[CPU]
        C2[Motherboard]
        C3[GPU]
        C4[RAM]
        C5[Storage]
        C6[PSU]
        C7[Case]
    end
    
    subgraph "Constraint Layer"
        CS1[Socket Match]
        CS2[RAM Type Match]
        CS3[Form Factor Fit]
        CS4[Power Sufficiency]
    end
    
    U --> W1 & W2 & W3 & W4 & W5
    W1 & W2 --> P1 & P3
    W3 --> P2 & P3
    W4 --> P1 & P3
    W5 --> P2 & P3 & P4
    
    P1 --> C1
    P2 --> C3
    P3 --> C4
    P4 --> C5
    
    C1 & C2 --> CS1
    C4 & C2 --> CS2
    C2 & C7 --> CS3
    C1 & C3 & C6 --> CS4
    
    classDef userStyle fill:#059669,stroke:#10b981,stroke-width:3px,color:#fff
    classDef workloadStyle fill:#7c3aed,stroke:#a78bfa,stroke-width:2px,color:#fff
    classDef perfStyle fill:#2563eb,stroke:#60a5fa,stroke-width:2px,color:#fff
    classDef compStyle fill:#dc2626,stroke:#f87171,stroke-width:2px,color:#fff
    classDef constraintStyle fill:#ea580c,stroke:#fb923c,stroke-width:2px,color:#fff
    
    class U userStyle
    class W1,W2,W3,W4,W5 workloadStyle
    class P1,P2,P3,P4 perfStyle
    class C1,C2,C3,C4,C5,C6,C7 compStyle
    class CS1,CS2,CS3,CS4 constraintStyle
```

## Inference Rule Flow

```mermaid
flowchart TD
    START([User Selects Components]) --> VALIDATE{All Components<br/>Selected?}
    
    VALIDATE -->|No| ERROR1[❌ Show Error:<br/>Missing Components]
    VALIDATE -->|Yes| CHECK1{CPU Socket ==<br/>MB Socket?}
    
    CHECK1 -->|No| ERROR2[❌ Critical Error:<br/>Socket Mismatch]
    CHECK1 -->|Yes| CHECK2{RAM Type ==<br/>MB RAM Type?}
    
    CHECK2 -->|No| ERROR3[❌ Critical Error:<br/>RAM Incompatible]
    CHECK2 -->|Yes| CHECK3{MB Form Factor<br/>Fits in Case?}
    
    CHECK3 -->|No| ERROR4[❌ Critical Error:<br/>Won't Fit]
    CHECK3 -->|Yes| CHECK4{PSU Wattage<br/>Sufficient?}
    
    CHECK4 -->|No| ERROR5[❌ Critical Error:<br/>PSU Insufficient]
    CHECK4 -->|Yes| CHECK5{CPU-GPU<br/>Balanced?}
    
    CHECK5 -->|No| WARN1[⚠️ Warning:<br/>Bottleneck Risk]
    CHECK5 -->|Yes| CHECK6{RAM Sufficient<br/>for Workloads?}
    
    CHECK6 -->|No| WARN2[⚠️ Warning:<br/>Low RAM]
    CHECK6 -->|Yes| PASS[✅ All Constraints<br/>Satisfied]
    
    WARN1 --> AI
    WARN2 --> AI
    PASS --> AI[🤖 Send to AI<br/>for Analysis]
    
    AI --> SCORE[📊 Calculate Score<br/>& Generate Report]
    SCORE --> END([Display Results])
    
    ERROR1 --> END
    ERROR2 --> END
    ERROR3 --> END
    ERROR4 --> END
    ERROR5 --> END
    
    style START fill:#10b981,stroke:#059669,stroke-width:2px,color:#fff
    style END fill:#10b981,stroke:#059669,stroke-width:2px,color:#fff
    style ERROR1,ERROR2,ERROR3,ERROR4,ERROR5 fill:#dc2626,stroke:#991b1b,stroke-width:2px,color:#fff
    style WARN1,WARN2 fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#000
    style PASS fill:#10b981,stroke:#059669,stroke-width:2px,color:#fff
    style AI fill:#8b5cf6,stroke:#7c3aed,stroke-width:2px,color:#fff
    style SCORE fill:#3b82f6,stroke:#2563eb,stroke-width:2px,color:#fff
```

## Socket Compatibility Matrix

```mermaid
graph LR
    subgraph "Intel CPUs"
        I1[i9-14900K]
        I2[i5-13600K]
        I3[i5-12400F]
        I4[i3-12100F]
    end
    
    subgraph "AMD CPUs"
        A1[Ryzen 9 7950X]
        A2[Ryzen 5 7600]
        A3[Ryzen 5 5600]
        A4[Ryzen 5 5500]
    end
    
    subgraph "Motherboards"
        M1[Z790 / B760 / H610<br/>LGA1700]
        M2[X670E / B650<br/>AM5]
        M3[B550 / A520<br/>AM4]
    end
    
    I1 & I2 & I3 & I4 -.-> M1
    A1 & A2 -.-> M2
    A3 & A4 -.-> M3
    
    classDef intelStyle fill:#0ea5e9,stroke:#0284c7,stroke-width:2px,color:#fff
    classDef amdStyle fill:#dc2626,stroke:#991b1b,stroke-width:2px,color:#fff
    classDef mbStyle fill:#8b5cf6,stroke:#7c3aed,stroke-width:2px,color:#fff
    
    class I1,I2,I3,I4 intelStyle
    class A1,A2,A3,A4 amdStyle
    class M1,M2,M3 mbStyle
```

## RAM Compatibility Matrix

```mermaid
graph LR
    subgraph "DDR5 RAM"
        R1[64GB DDR5-6000]
        R2[32GB DDR5-6000]
        R3[16GB DDR5-4800]
    end
    
    subgraph "DDR4 RAM"
        R4[32GB DDR4-3200]
        R5[16GB DDR4-3200]
        R6[8GB DDR4-2666]
    end
    
    subgraph "Motherboards"
        MD1[Z790 / B760<br/>X670E / B650<br/>DDR5 Support]
        MD2[H610 / B550 / A520<br/>DDR4 Support]
    end
    
    R1 & R2 & R3 -.-> MD1
    R4 & R5 & R6 -.-> MD2
    
    classDef ddr5Style fill:#10b981,stroke:#059669,stroke-width:2px,color:#fff
    classDef ddr4Style fill:#3b82f6,stroke:#2563eb,stroke-width:2px,color:#fff
    classDef mbStyle fill:#8b5cf6,stroke:#7c3aed,stroke-width:2px,color:#fff
    
    class R1,R2,R3 ddr5Style
    class R4,R5,R6 ddr4Style
    class MD1,MD2 mbStyle
```

## Power Requirement Example

```mermaid
graph TD
    subgraph "Component Power Draw"
        C1["CPU: i9-14900K<br/>Max TDP: 253W"]
        C2["GPU: RTX 4090<br/>TDP: 450W"]
        C3["Other: MB + RAM + SSD<br/>Baseline: 150W"]
    end
    
    TOTAL["⚡ Total System Power<br/>253 + 450 + 150 = 853W"]
    
    C1 & C2 & C3 --> TOTAL
    
    TOTAL --> REQ["Recommended PSU<br/>853W / 0.8 = 1066W<br/>≈ 1000W PSU"]
    
    REQ -.->|"✅ Compatible"| P1["MSI MPG A1000G<br/>1000W 80+ Gold"]
    REQ -.->|"❌ Insufficient"| P2["Corsair RM750e<br/>750W 80+ Gold"]
    
    classDef powerStyle fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#000
    classDef okStyle fill:#10b981,stroke:#059669,stroke-width:2px,color:#fff
    classDef badStyle fill:#dc2626,stroke:#991b1b,stroke-width:2px,color:#fff
    
    class C1,C2,C3,TOTAL,REQ powerStyle
    class P1 okStyle
    class P2 badStyle
```

## Legend

### Node Types
- 🔲 **Essential Component**: Required for desktop builds
- 🎮 **Optional Component**: Recommended but not mandatory
- 💻 **Workload**: Software the user needs to run
- ⚡ **Constraint**: Rule that must be satisfied

### Edge Types
- **Solid Line** (→): Directional dependency
- **Dashed Line** (-.): Bidirectional compatibility requirement
- **Thick Line** (═): Critical relationship

### Severity Levels
- ❌ **Critical**: Build will not work
- ⚠️ **Warning**: Build will work but not optimal
- ✅ **Pass**: No issues detected

## Usage in Expert System

This knowledge graph is used by the system to:

1. **Validate Constraints**: Traverse edges to check compatibility
2. **Detect Bottlenecks**: Compare component tiers via SYNERGY edges
3. **Calculate Scores**: Aggregate workload DEMANDS to determine suitability
4. **Generate AI Context**: Serialize relevant graph paths for LLM prompt

For implementation details, see `knowledge-graph.json` in the ontology directory.
