# Function Documentation - UIT Hardware Specialist

This document provides comprehensive documentation for all functions and components in the UIT Hardware Specialist system.

## Table of Contents

- [Frontend Components](#frontend-components)
- [Services](#services)
- [Backend API](#backend-api)
- [Utility Functions](#utility-functions)

---

## Frontend Components

### App.tsx

Main application component managing the entire user interface and state.

#### `App()`

**Purpose**: Root component rendering the entire application interface.

**State Management**:
- `deviceType`: Current device mode ('Desktop' | 'Laptop')
- `language`: UI language ('en' | 'my')
- `build`: Selected component configuration
- `analysis`: AI-generated analysis text
- `score`: Suitability score (0-100)
- `status`: Connection status to backend
- `isAnalyzing`: Loading state during analysis

**Key Functions**:

##### `handleDeviceToggle(type: DeviceType)`
- **Purpose**: Switch between Desktop and Laptop modes
- **Parameters**: `type` - The device type to switch to
- **Side Effects**: Resets build configuration and analysis
- **Algorithm**:
  ```typescript
  1. Set deviceType to new type
  2. Update build.type
  3. Clear analysis and score
  4. Re-render UI for selected device type
  ```

##### `handleSelect(category, partId, dbKey)`
- **Purpose**: Update a component selection in the build
- **Parameters**:
  - `category`: Component category (cpu, gpu, ram, etc.)
  - `partId`: ID of selected component
  - `dbKey`: Database key to look up component
- **Algorithm**:
  ```typescript
  1. Find component in COMPONENT_DB by partId and dbKey
  2. Update build state with selected component
  3. Clear previous analysis (build changed)
  ```

##### `handleReset()`
- **Purpose**: Reset all component selections
- **Side Effects**: Clears entire build and analysis
- **Algorithm**:
  ```typescript
  1. Create fresh build object with all null values
  2. Clear analysis text
  3. Reset score to 0
  ```

##### `handleAnalyze()`
- **Purpose**: Validate build and request AI analysis
- **Returns**: Async function, updates state with analysis
- **Algorithm**:
  ```typescript
  1. Validate mandatory components are selected
  2. Build prompt string from selected components
  3. Add language preference if Burmese selected
  4. Set isAnalyzing = true
  5. Call sendMessageToMistral(prompt)
  6. Parse response for SCORE: value
  7. Update state with score and analysis
  8. Scroll to results section
  9. Handle errors gracefully
  10. Set isAnalyzing = false
  ```
- **Error Handling**: Catches errors and displays user-friendly message

#### `SelectionCard({ label, icon, field, dbKey })`

**Purpose**: Reusable component for component selection dropdowns.

**Props**:
- `label`: Display label for component category
- `icon`: Lucide icon component
- `field`: Build object key to update
- `dbKey`: Database key to fetch components from

**Rendering**:
```typescript
1. Display icon and label
2. Render dropdown with all components from COMPONENT_DB[dbKey]
3. Show selected component specs below dropdown
4. Handle selection via handleSelect callback
```

#### `getBatteryColor(batteryText: string)`

**Purpose**: Determine color coding for laptop battery life display.

**Returns**: Tailwind CSS color class

**Algorithm**:
```typescript
IF batteryText includes "Excellent" → return 'text-green-400'
ELSE IF includes "Good" → return 'text-cyan-400'
ELSE IF includes "Poor" → return 'text-red-400'
ELSE → return 'text-yellow-400'
```

### ChatMessage.tsx

Component for rendering AI-generated markdown analysis.

#### `ChatMessage({ message })`

**Purpose**: Render message with markdown formatting.

**Props**:
- `message`: Message object with role, text, timestamp

**Features**:
- Markdown rendering (headings, lists, bold, italics)
- Code syntax highlighting
- Emoji support
- Responsive design

**Rendering Algorithm**:
```typescript
1. Parse message.text as markdown
2. Apply Tailwind styling to markdown elements
3. Render with appropriate role styling (user vs model)
```

---

## Services

### mistralService.ts

Service layer for communicating with the Mistral AI backend.

#### `initializeMistral()`

**Purpose**: Check backend server availability.

**Returns**: `boolean` - Always returns true (optimistic)

**Side Effects**: Updates `isConnected` variable

**Algorithm**:
```typescript
1. Fetch /api/health endpoint
2. Parse JSON response
3. Check if status == 'ok' AND mistralConnected == true
4. Update isConnected flag
5. Log connection status
6. Catch errors and set isConnected = false
7. Return true optimistically (errors handled in actual request)
```

**Why Optimistic Return?**
- UI doesn't block on initial load
- Actual errors surface when user tries to analyze
- Health check runs asynchronously in background

#### `sendMessageToMistral(message: string)`

**Purpose**: Send a user message to the AI and get analysis.

**Parameters**:
- `message`: The prompt/question to send

**Returns**: `Promise<string>` - AI-generated response text

**Algorithm**:
```typescript
1. POST to /api/chat endpoint with:
   - message: user prompt
   - systemInstruction: role definition
2. Check if response.ok
3. If error: parse error message, throw descriptive error
4. Parse JSON response
5. Validate response has valid text
6. Update isConnected = true
7. Return response text
8. CATCH errors:
   - If "Failed to fetch" → user-friendly message about backend
   - Otherwise → return original error message
```

**Error Messages**:
- Backend unavailable: "Cannot connect to server. Please make sure the backend is running."
- Empty response: "Received an empty response from the server."
- Other: Propagate original error message

---

## Backend API

### server.js

Express server providing API proxy to Mistral AI.

#### `initializeMistral()`

**Purpose**: Initialize the Mistral AI client with API key.

**Returns**: `boolean` - Success status

**Algorithm**:
```typescript
1. Read MISTRAL_API_KEY from environment variables
2. If missing → log error, return false
3. Try to create new Mistral({ apiKey })
4. If success → log success, return true
5. If error → log error message, return false
```

**Environment Variables**:
- `MISTRAL_API_KEY`: Required API key for Mistral AI

#### `GET /api/health`

**Purpose**: Health check endpoint for frontend to verify backend status.

**Response**:
```json
{
  "status": "ok",
  "mistralConnected": true/false,
  "timestamp": "ISO 8601 timestamp"
}
```

**Algorithm**:
```typescript
1. Check if mistralClient != null
2. Return JSON with status and connection state
```

#### `POST /api/chat`

**Purpose**: Proxy endpoint for AI chat completion requests.

**Request Body**:
```json
{
  "message": "User prompt text",
  "systemInstruction": "AI role definition"
}
```

**Response**:
```json
{
  "response": "AI-generated text"
}
```

**Algorithm**:
```typescript
1. Validate mistralClient exists (initialize if needed)
2. Extract message and systemInstruction from request body
3. Validate message is provided
4. Log incoming request
5. Call mistralClient.chat.complete({
     model: 'mistral-large-latest',
     messages: [
       { role: 'system', content: systemInstruction },
       { role: 'user', content: message }
     ]
   })
6. Extract response text from chatResponse.choices[0].message.content
7. Log success
8. Return JSON response
9. CATCH errors:
   - Log error
   - Return 500 status with error details
```

**Error Handling**:
- 500: Mistral client not initialized
- 400: Missing message parameter
- 500: Mistral API error
- 500: Empty response from Mistral

---

## Utility Functions

### Data Loading Utilities

(Future implementation in `utils/dataLoader.ts`)

#### `loadComponents()`

**Purpose**: Load component database from JSON file.

**Returns**: `Promise<ComponentDatabase>`

**Algorithm**:
```typescript
1. Fetch knowledge-base/datasets/components.json
2. Parse JSON
3. Validate schema
4. Return component database object
```

#### `loadCompatibilityRules()`

**Purpose**: Load compatibility constraint rules.

**Returns**: `Promise<CompatibilityRules>`

**Algorithm**:
```typescript
1. Fetch knowledge-base/datasets/compatibility-rules.json
2. Parse JSON
3. Return rules object
```

#### `loadKnowledgeGraph()`

**Purpose**: Load knowledge graph ontology.

**Returns**: `Promise<KnowledgeGraph>`

**Algorithm**:
```typescript
1. Fetch knowledge-base/ontology/knowledge-graph.json
2. Parse JSON
3. Return graph structure (nodes + edges)
```

---

## Algorithm Explanations

### Constraint Validation Algorithm

**Purpose**: Check if a build satisfies all compatibility constraints.

**Pseudocode**:
```
FUNCTION validateConstraints(build):
    violations = []
    
    // Socket compatibility
    IF build.cpu AND build.motherboard:
        IF cpu.socket != motherboard.socket:
            violations.add({
                type: 'critical',
                message: `CPU socket ${cpu.socket} incompatible with motherboard socket ${motherboard.socket}`
            })
    
    // RAM type compatibility
    IF build.ram AND build.motherboard:
        IF ram.type != motherboard.ramType:
            violations.add({
                type: 'critical',
                message: `${ram.type} RAM incompatible with ${motherboard.ramType} motherboard`
            })
    
    // Power supply sufficiency
    IF build.psu AND (build.cpu OR build.gpu):
        totalPower = (cpu?.maxTdp || 0) + (gpu?.tdp || 0) + 150
        IF totalPower > psu.wattage * 0.8:  // 80% safety margin
            violations.add({
                type: 'critical',
                message: `PSU insufficient: ${totalPower}W needed, ${psu.wattage}W available`
            })
    
    // Form factor compatibility
    IF build.motherboard AND build.pcCase:
        IF motherboard.formFactor NOT IN case.supportedFormFactors:
            violations.add({
                type: 'critical',
                message: `${motherboard.formFactor} motherboard won't fit in ${case.formFactor} case`
            })
    
    // Bottleneck detection (soft constraint)
    IF build.cpu AND build.gpu:
        IF cpu.tier == 'entry-level' AND gpu.tier == 'high-end':
            violations.add({
                type: 'warning',
                message: 'CPU may bottleneck high-end GPU'
            })
    
    RETURN violations
```

### Score Calculation Algorithm

**Purpose**: Calculate UIT Suitability Score (0-100).

**Pseudocode**:
```
FUNCTION calculateScore(build, constraints):
    score = 100
    
    // Deduct for constraint violations
    FOR each violation IN constraints:
        IF violation.type == 'critical':
            score -= 30
        ELSE IF violation.type == 'warning':
            score -= 10
    
    // Calculate workload performance
    workloadScores = []
    
    FOR each workload IN [visualStudio, androidStudio, unity, docker]:
        componentRatings = {
            cpu: getTierRating(build.cpu.tier),
            ram: getCapacityRating(build.ram.capacity),
            gpu: getTierRating(build.gpu.tier),
            storage: getTypeRating(build.storage.interface)
        }
        
        weightedScore = 0
        FOR each component, rating IN componentRatings:
            weight = workload.scoringWeights[component]
            weightedScore += rating * weight
        
        workloadScores.add(weightedScore)
    
    avgWorkloadScore = average(workloadScores)
    
    // Combine compatibility and performance scores
    finalScore = score * 0.3 + avgWorkloadScore * 0.7
    
    RETURN clamp(finalScore, 0, 100)
```

---

## Component Interaction Flow

```
User Action (Select Component)
    ↓
handleSelect(category, partId, dbKey)
    ↓
Update build state
    ↓
Re-render UI with new selection
    ↓
User clicks "VALIDATE & CHECK SUITABILITY"
    ↓
handleAnalyze()
    ↓
buildPrompt(build)
    ↓
sendMessageToMistral(prompt) [Frontend Service]
    ↓
POST /api/chat [Backend API]
    ↓
mistral.chat.complete() [Mistral AI]
    ↓
Parse response
    ↓
Extract score
    ↓
Update UI with analysis and score
```

---

## Testing Strategies

### Unit Testing

**Components to Test**:
- `getBatteryColor()`: Test all battery rating cases
- `handleSelect()`: Verify state updates correctly
- `handleReset()`: Verify complete state clearing

### Integration Testing

**Scenarios**:
1. Select components → Verify build state
2. Analyze build → Verify API call and response handling
3. Language toggle → Verify UI text updates

### End-to-End Testing

**User Flows**:
1. Desktop build creation and analysis
2. Laptop selection and analysis
3. Error handling (incomplete build, backend offline)

---

## Maintenance Guidelines

### Adding New Components

1. Update `knowledge-base/datasets/components.json`
2. Follow existing schema structure
3. Include all required fields (id, name, specs, tier, etc.)
4. No code changes required (data-driven)

### Adding New Workloads

1. Update `knowledge-base/datasets/performance-benchmarks.json`
2. Define requirements (cpu, ram, gpu, storage)
3. Set scoring weights
4. Update system instruction in `constants.ts` to include new workload

### Modifying Compatibility Rules

1. Update `knowledge-base/datasets/compatibility-rules.json`
2. Add new constraint types if needed
3. Update validation logic if custom validation required

---

## Performance Optimization

### Frontend
- **Lazy Loading**: Load datasets on demand
- **Memoization**: Cache computed values (tier ratings, compatibility checks)
- **Debouncing**: Debounce dropdown changes if needed

### Backend
- **Request Caching**: Cache common build analyses
- **Connection Pooling**: Reuse Mistral client connections
- **Response Streaming**: Stream AI responses token-by-token

### Network
- **Compression**: Enable gzip compression on API responses
- **CDN**: Serve static datasets from CDN if deployed
- **HTTP/2**: Use HTTP/2 for multiplexing

---

## Conclusion

This function documentation provides a comprehensive reference for all components, services, and algorithms in the UIT Hardware Specialist system. For architecture-level understanding, refer to `knowledge-engineering-overview.md` and `ai-inference-flow.md`.
