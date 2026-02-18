/**
 * Data Loader Utilities
 *
 * This module provides functions to load datasets from the knowledge base.
 * It serves as the interface between the application and the structured JSON data.
 */

import componentsData from '../knowledge-base/datasets/components.json';
// import laptopsData from '../knowledge-base/datasets/laptops.json'; // Deprecated
import Papa from 'papaparse';
import laptopCsvContent from '../dataset/merged_laptop_data.csv?raw';
import compatibilityRulesData from '../knowledge-base/datasets/compatibility-rules.json';
import performanceBenchmarksData from '../knowledge-base/datasets/performance-benchmarks.json';
import knowledgeGraphData from '../knowledge-base/ontology/knowledge-graph.json';

import { ComponentCategory, ComponentPart, PCBuild } from '../types';

interface LaptopCSVRow {
    '': string; // Index
    model_name: string;
    brand: string;
    processor_name: string;
    'ram(GB)': string;
    'ssd(GB)': string;
    'Hard Disk(GB)': string;
    'Operating System': string;
    graphics: string;
    'screen_size(inches)': string;
    'resolution (pixels)': string; // Fixed typo in header access if needed
    no_of_cores: string;
    no_of_threads: string;
    spec_score: string;
    price: string;
    Major: string;
    Activities: string;
    ProgramList: string;
}

const parseLaptopsFromCSV = (): ComponentPart[] => {
    const { data } = Papa.parse<LaptopCSVRow>(laptopCsvContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false // Keep as strings to safely parse
    });

    return data.map((row, index) => {
        const ram = row['ram(GB)'] || '0';
        const ssd = row['ssd(GB)'] || '0';
        const hdd = row['Hard Disk(GB)'] || '0';
        const gpu = row['graphics'] || 'Integrated';
        const display = `${row['screen_size(inches)'] || '15.6'}" ${row['resolution (pixels)'] || '1920x1080'}`;
        const cpu = row['processor_name'] || 'Unknown Processor';

        // Construct a specs string
        // const specs = `${cpu}, ${ram}GB RAM, ${ssd}GB SSD, ${gpu}, ${display}`; // Original line, kept for reference

        // Improve specs display if HDD exists
        const storage = parseInt(hdd) > 0 ? `${ssd}GB SSD + ${hdd}GB HDD` : `${ssd}GB SSD`;
        const fullSpecs = `${cpu} | ${ram}GB RAM | ${storage} | ${gpu} | ${display}`;

        // Simple heuristic for battery life
        let battery = "6-9 Hrs (Standard)";
        const lowerName = (row.model_name || '').toLowerCase();
        const lowerGpu = gpu.toLowerCase();
        const os = (row['Operating System'] || '').toLowerCase();

        // 1. Gaming Laptops (High Power Consumption)
        if (lowerGpu.includes('rtx') || lowerGpu.includes('gtx') || lowerName.includes('gaming') || lowerName.includes('legion') || lowerName.includes('rog') || lowerName.includes('tuf')) {
            battery = "3-5 Hrs (Gaming Mode)";
        }

        // 2. Apple Silicon (High Efficiency)
        else if (os.includes('mac') || lowerName.includes('macbook') || row.brand === 'Apple') {
            battery = "15-18 Hrs (Apple Silicon)";
        }

        // 3. Ultrabooks (Good Battery Life)
        else if (lowerName.includes('zenbook') || lowerName.includes('swift') || lowerName.includes('xps') || lowerName.includes('gram') || lowerName.includes('yoga')) {
            battery = "10-12 Hrs (Ultrabook)";
        }

        return {
            id: row[''] || `csv-${index}`,
            name: row.model_name || 'Unknown Model',
            price: parseInt(row.price) || 0,
            specs: fullSpecs,
            battery: battery,
            major: row.Major,
            activities: row.Activities,
            programList: row.ProgramList
        };
    });
};

const parsedLaptops = parseLaptopsFromCSV();

/**
 * Load all component data from the knowledge base
 *
 * @param category - Component category (CPU, GPU, etc.) or 'Laptop'
 * @returns Array of ComponentPart objects for the given category
 * @example
 * const cpus = loadComponents('CPU');
 * const laptops = loadComponents('Laptop');
 */
export const loadComponents = (category: ComponentCategory): ComponentPart[] => {
    if (category === 'Laptop') {
        return parsedLaptops;
    }
    const categoryData = (componentsData as any)[category];
    return categoryData ? categoryData.components : [];
};

/**
 * Load laptop models from the knowledge base (now from CSV)
 *
 * @returns Array of laptop models with specifications
 * @example
 * const laptops = loadLaptops();
 * const macbookPro = laptops.find(l => l.id === 'l-mbp-m3');
 */
export const loadLaptops = (): ComponentPart[] => {
    return parsedLaptops;
};

/**
 * Load compatibility rules for constraint validation
 * 
 * @returns Object containing all compatibility constraint rules
 * @example
 * const rules = loadCompatibilityRules();
 * const socketRules = rules.socketCompatibility;
 */
export const loadCompatibilityRules = () => {
    return compatibilityRulesData;
};

/**
 * Load performance benchmarks and workload requirements
 * 
 * @returns Object containing workload definitions and performance ratings
 * @example
 * const benchmarks = loadPerformanceBenchmarks();
 * const androidStudioReqs = benchmarks.workloads.androidStudio;
 */
export const loadPerformanceBenchmarks = () => {
    return performanceBenchmarksData;
};

/**
 * Load knowledge graph (ontology) with component relationships
 * 
 * @returns Object containing nodes, edges, and inference rules
 * @example
 * const graph = loadKnowledgeGraph();
 * const relationships = graph.edges;
 */
export const loadKnowledgeGraph = () => {
    return knowledgeGraphData;
};

/**
 * Get component by ID from a specific category
 * 
 * @param category - Component category (CPU, GPU, etc.)
 * @param id - Component ID
 * @returns Component object or null if not found
 * @example
 * const cpu = getComponentById('CPU', 'c-13600k');
 */
export const getComponentById = (category: ComponentCategory, id: string) => {
    const components = componentsData[category];
    if (!components || !components.components) return null;
    return components.components.find((c: any) => c.id === id) || null;
};

/**
 * Get laptop by ID
 * 
 * @param id - Laptop ID
 * @returns Laptop object or null if not found
 * @example
 * const laptop = getLaptopById('l-mbp-m3');
 */
export const getLaptopById = (id: string) => {
    return parsedLaptops.find((l: any) => l.id === id) || null;
};

/**
 * Check if CPU socket matches motherboard socket
 * 
 * @param cpuId - CPU component ID
 * @param motherboardId - Motherboard component ID
 * @returns true if compatible, false otherwise
 * @example
 * const compatible = checkSocketCompatibility('c-13600k', 'm-b760');
 */
export const checkSocketCompatibility = (cpuId: string, motherboardId: string): boolean => {
    const cpu = getComponentById('CPU', cpuId) as any;
    const motherboard = getComponentById('Motherboard', motherboardId) as any;

    if (!cpu || !motherboard) return false;

    const rules = compatibilityRulesData.socketCompatibility.rules;
    const socketRule = rules[cpu.socket as keyof typeof rules];

    if (!socketRule) return false;

    return socketRule.compatibleMotherboards.includes(motherboardId);
};

/**
 * Check if RAM type matches motherboard RAM support
 * 
 * @param ramId - RAM component ID
 * @param motherboardId - Motherboard component ID
 * @returns true if compatible, false otherwise
 * @example
 * const compatible = checkRAMCompatibility('r-32-d5', 'm-b760');
 */
export const checkRAMCompatibility = (ramId: string, motherboardId: string): boolean => {
    const ram = getComponentById('RAM', ramId) as any;
    const motherboard = getComponentById('Motherboard', motherboardId) as any;

    if (!ram || !motherboard) return false;

    const rules = compatibilityRulesData.ramCompatibility.rules;
    const ramTypeRule = rules[ram.type as keyof typeof rules];

    if (!ramTypeRule) return false;

    return ramTypeRule.compatibleMotherboards.includes(motherboardId);
};

/**
 * Check if PSU wattage is sufficient for the build
 * 
 * @param cpuId - CPU component ID (optional)
 * @param gpuId - GPU component ID (optional)
 * @param psuId - PSU component ID
 * @returns Object with isCompatible flag and details
 * @example
 * const result = checkPSUCapacity('c-14900k', 'g-4090', 'p-1000');
 * console.log(result.isCompatible, result.totalPower, result.psuWattage);
 */
export const checkPSUCapacity = (
    cpuId: string | null,
    gpuId: string | null,
    psuId: string
): { isCompatible: boolean; totalPower: number; psuWattage: number; details: string } => {
    const cpu = cpuId ? getComponentById('CPU', cpuId) as any : null;
    const gpu = gpuId ? getComponentById('GPU', gpuId) as any : null;
    const psu = getComponentById('PSU', psuId) as any;

    if (!psu) {
        return {
            isCompatible: false,
            totalPower: 0,
            psuWattage: 0,
            details: 'PSU not found'
        };
    }

    const cpuPower = cpu?.maxTdp || cpu?.tdp || 0;
    const gpuPower = gpu?.tdp || 0;
    const baseline = compatibilityRulesData.powerRequirements.systemBaselineWattage.typical;

    const totalPower = cpuPower + gpuPower + baseline;
    const psuWattage = psu.wattage;
    const safeThreshold = psuWattage * 0.8; // 80% safety margin

    return {
        isCompatible: totalPower <= safeThreshold,
        totalPower,
        psuWattage,
        details: totalPower <= safeThreshold
            ? `${totalPower}W ≤ ${safeThreshold}W (80% of ${psuWattage}W)`
            : `${totalPower}W > ${safeThreshold}W (80% of ${psuWattage}W) - Insufficient!`
    };
};

/**
 * Format component data for backward compatibility with existing UI
 * Converts new JSON structure to the format expected by constants.ts
 * 
 * @returns Object in COMPONENT_DB format
 */
export const formatComponentsForUI = () => {
    const formatted: Record<string, Array<{ id: string, name: string, specs: string, battery?: string }>> = {};

    // Format regular components
    Object.keys(componentsData).forEach((category) => {
        if (category === 'metadata') return;

        const categoryData = componentsData[category as ComponentCategory];
        formatted[category] = categoryData.components.map((c: any) => ({
            id: c.id,
            name: c.name,
            specs: c.specs,
        }));
    });

    // Format laptops
    // Format laptops
    formatted['Laptop'] = parsedLaptops.map((l: any) => ({
        id: l.id,
        name: l.name,
        specs: l.specs,
        battery: l.battery,
    }));

    return formatted;
};

// Export all data for direct access if needed
export {
    componentsData,
    // laptopsData, // Removed
    compatibilityRulesData,
    performanceBenchmarksData,
    knowledgeGraphData
};
