# Knowledge Base - UIT Hardware Specialist

This directory contains all knowledge engineering assets for the UIT Hardware Specialist expert system.

## Directory Structure

```
knowledge-base/
├── datasets/               # Structured component and compatibility data
│   ├── components.json    # PC component database with specs
│   ├── laptops.json       # Laptop models database
│   ├── compatibility-rules.json  # Hardware compatibility constraints
│   └── performance-benchmarks.json  # Workload requirements
├── ontology/              # Knowledge graph and relationships
│   └── knowledge-graph.json  # Component relationships and inference rules
└── rules/                 # (Future) Additional validation rules
```

## Datasets

### components.json
Complete database of PC hardware components including:
- **CPU**: Processors with socket, cores, TDP, tier ratings
- **GPU**: Graphics cards with VRAM, power consumption, workload suitability
- **Motherboard**: Main boards with socket, RAM support, form factor
- **RAM**: Memory modules with type (DDR4/DDR5), capacity, speed
- **Storage**: SSDs/HDDs with interface, capacity, read/write speeds
- **PSU**: Power supplies with wattage and efficiency ratings
- **Case**: PC cases with form factor support and dimensions

### laptops.json
Laptop models with:
- Processor and GPU specifications
- RAM and storage configurations
- Battery life estimates
- Workload suitability ratings
- Thermal management ratings

### compatibility-rules.json
Constraint satisfaction rules for:
- Socket compatibility (CPU ↔ Motherboard)
- RAM type compatibility (DDR4/DDR5 ↔ Motherboard)
- Form factor fitting (Motherboard ↔ Case)
- Power requirements (Components ↔ PSU)
- Bottleneck detection (CPU ↔ GPU balance)

### performance-benchmarks.json
Workload-specific performance requirements for:
- Visual Studio / VS Code (Software Engineering)
- Android Studio (Mobile Development)
- Unity / Unreal Engine (Game Development)
- Blender (3D Modeling & Animation)
- Docker / Kubernetes (DevOps)
- Python / Jupyter / ML (Data Science)

Each workload defines:
- Minimum and recommended hardware specs
- Scoring weights for components
- Feature requirements (virtualization, CUDA cores, etc.)

## Ontology

### knowledge-graph.json
Semantic network representing:
- **Nodes**: Components, workloads, constraints, performance metrics
- **Edges**: Relationships between nodes
  - `REQUIRES_SOCKET`: CPU-Motherboard socket matching
  - `REQUIRES_TYPE`: RAM-Motherboard type matching
  - `REQUIRES_POWER`: Component power consumption
  - `SYNERGY`: CPU-GPU performance balance
  - `DEMANDS`: Workload requirements
- **Inference Rules**: Logical deduction rules for validation

Relationship types include:
- Critical (must satisfy for compatibility)
- Warning (should satisfy for optimal performance)
- Info (informational only)

## Usage

### Loading Data in Application

```typescript
import componentsData from './knowledge-base/datasets/components.json';
import laptopsData from './knowledge-base/datasets/laptops.json';
import compatibilityRules from './knowledge-base/datasets/compatibility-rules.json';
import performanceBenchmarks from './knowledge-base/datasets/performance-benchmarks.json';
import knowledgeGraph from './knowledge-base/ontology/knowledge-graph.json';
```

### Validation Example

```typescript
// Check socket compatibility
const cpu = componentsData.CPU.components.find(c => c.id === 'c-13600k');
const motherboard = componentsData.Motherboard.components.find(m => m.id === 'm-b760');

const socketRule = compatibilityRules.socketCompatibility.rules[cpu.socket];
const isCompatible = socketRule.compatibleMotherboards.includes(motherboard.id);
```

### Score Calculation

```typescript
// Calculate workload suitability
const workload = performanceBenchmarks.workloads.androidStudio;
const ramCapacity = 32; // GB

if (ramCapacity >= workload.requirements.ram.optimal) {
    ramScore = 100;
} else if (ramCapacity >= workload.requirements.ram.recommended) {
    ramScore = 75;
} else if (ramCapacity >= workload.requirements.ram.minimum) {
    ramScore = 50;
} else {
    ramScore = 25;
}
```

## Maintenance

### Adding New Components
1. Open `datasets/components.json`
2. Add new component to appropriate category
3. Follow existing schema (id, name, specs, tier, etc.)
4. Update compatibility rules if introducing new sockets/types

### Adding New Workloads
1. Open `datasets/performance-benchmarks.json`
2. Add workload definition with requirements
3. Define scoring weights for each component type
4. Update system instruction in application if needed

### Modifying Relationships
1. Open `ontology/knowledge-graph.json`
2. Add new nodes or edges as needed
3. Define relationship type if custom validation required
4. Add inference rule for automated checking

## Schema Validation

All JSON files follow strict schemas. Required fields:

**Component Schema**:
```json
{
  "id": "string (unique)",
  "name": "string",
  "specs": "string (display text)",
  "tier": "high-end | mid-range | budget | entry-level",
  "priceRange": "string",
  ...categorySpecificFields
}
```

**Workload Schema**:
```json
{
  "name": "string",
  "category": "string",
  "requirements": {
    "cpu": { "minCores": number, ...},
    "ram": { "minimum": number, "recommended": number, ...},
    ...
  },
  "scoringWeights": {
    "cpu": number (0-1),
    "ram": number (0-1),
    ...
  }
}
```

## References

- [Knowledge Engineering Overview](../docs/architecture/knowledge-engineering-overview.md)
- [Knowledge Graph Visualization](../docs/architecture/knowledge-graph-visualization.md)
- [AI Inference Flow](../docs/architecture/ai-inference-flow.md)
- [Function Documentation](../docs/FUNCTIONS.md)

## License

This knowledge base is part of the UIT Hardware Specialist project and is intended for educational purposes.
