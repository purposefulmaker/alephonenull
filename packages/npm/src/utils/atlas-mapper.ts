/**
 * MITRE ATLAS Technique Mapper
 *
 * Maps AlephOneNull V2 detection categories to MITRE ATLAS
 * (Adversarial Threat Landscape for AI Systems) technique IDs.
 *
 * Reference: https://atlas.mitre.org/
 */

export interface AtlasMapping {
  techniqueId: string;
  name: string;
  tactic: string;
  url: string;
}

/**
 * Map from V2 detector category → ATLAS technique(s).
 * Multiple techniques may apply to a single category.
 */
const ATLAS_MAP: Record<string, AtlasMapping[]> = {
  sycophancy: [
    {
      techniqueId: "AML.T0043",
      name: "Craft Adversarial Data",
      tactic: "ML Attack Staging",
      url: "https://atlas.mitre.org/techniques/AML.T0043",
    },
  ],
  medical_hallucination: [
    {
      techniqueId: "AML.T0048",
      name: "Denial of ML Service",
      tactic: "ML Attack Staging",
      url: "https://atlas.mitre.org/techniques/AML.T0048",
    },
  ],
  fiction_emergency: [
    {
      techniqueId: "AML.T0048",
      name: "Denial of ML Service",
      tactic: "ML Attack Staging",
      url: "https://atlas.mitre.org/techniques/AML.T0048",
    },
  ],
  authority_impersonation: [
    {
      techniqueId: "AML.T0052",
      name: "Phishing",
      tactic: "Initial Access",
      url: "https://atlas.mitre.org/techniques/AML.T0052",
    },
  ],
  consciousness_claims: [
    {
      techniqueId: "AML.T0043",
      name: "Craft Adversarial Data",
      tactic: "ML Attack Staging",
      url: "https://atlas.mitre.org/techniques/AML.T0043",
    },
  ],
  mystical_medical: [
    {
      techniqueId: "AML.T0048",
      name: "Denial of ML Service",
      tactic: "ML Attack Staging",
      url: "https://atlas.mitre.org/techniques/AML.T0048",
    },
  ],
  direct_harm: [
    {
      techniqueId: "AML.T0051",
      name: "LLM Prompt Injection",
      tactic: "Initial Access",
      url: "https://atlas.mitre.org/techniques/AML.T0051",
    },
  ],
  crisis: [
    {
      techniqueId: "AML.T0051",
      name: "LLM Prompt Injection",
      tactic: "Initial Access",
      url: "https://atlas.mitre.org/techniques/AML.T0051",
    },
  ],
  loop_induction: [
    {
      techniqueId: "AML.T0043",
      name: "Craft Adversarial Data",
      tactic: "ML Attack Staging",
      url: "https://atlas.mitre.org/techniques/AML.T0043",
    },
  ],
  symbolic_regression: [
    {
      techniqueId: "AML.T0043",
      name: "Craft Adversarial Data",
      tactic: "ML Attack Staging",
      url: "https://atlas.mitre.org/techniques/AML.T0043",
    },
  ],
  engineered_trust: [
    {
      techniqueId: "AML.T0052",
      name: "Phishing",
      tactic: "Initial Access",
      url: "https://atlas.mitre.org/techniques/AML.T0052",
    },
  ],
  dehumanization: [
    {
      techniqueId: "AML.T0051",
      name: "LLM Prompt Injection",
      tactic: "Initial Access",
      url: "https://atlas.mitre.org/techniques/AML.T0051",
    },
  ],
  memory_poisoning: [
    {
      techniqueId: "AML.T0080",
      name: "Poison Training Data",
      tactic: "ML Attack Staging",
      url: "https://atlas.mitre.org/techniques/AML.T0080",
    },
  ],
  context_poisoning: [
    {
      techniqueId: "AML.T0058",
      name: "Dataset Poisoning",
      tactic: "Persistence",
      url: "https://atlas.mitre.org/techniques/AML.T0058",
    },
    {
      techniqueId: "AML.T0051",
      name: "LLM Prompt Injection",
      tactic: "Initial Access",
      url: "https://atlas.mitre.org/techniques/AML.T0051",
    },
  ],
  gradual_escalation: [
    {
      techniqueId: "AML.T0043",
      name: "Craft Adversarial Data",
      tactic: "ML Attack Staging",
      url: "https://atlas.mitre.org/techniques/AML.T0043",
    },
  ],
  // Equation-based detectors
  parseval_violation: [
    {
      techniqueId: "AML.T0043",
      name: "Craft Adversarial Data",
      tactic: "ML Attack Staging",
      url: "https://atlas.mitre.org/techniques/AML.T0043",
    },
  ],
  net_zero_violation: [
    {
      techniqueId: "AML.T0043",
      name: "Craft Adversarial Data",
      tactic: "ML Attack Staging",
      url: "https://atlas.mitre.org/techniques/AML.T0043",
    },
  ],
  invertibility_violation: [
    {
      techniqueId: "AML.T0043",
      name: "Craft Adversarial Data",
      tactic: "ML Attack Staging",
      url: "https://atlas.mitre.org/techniques/AML.T0043",
    },
  ],
  even_odd_suppression: [
    {
      techniqueId: "AML.T0043",
      name: "Craft Adversarial Data",
      tactic: "ML Attack Staging",
      url: "https://atlas.mitre.org/techniques/AML.T0043",
    },
  ],
  reconstruction_fidelity: [
    {
      techniqueId: "AML.T0043",
      name: "Craft Adversarial Data",
      tactic: "ML Attack Staging",
      url: "https://atlas.mitre.org/techniques/AML.T0043",
    },
  ],
};

/**
 * Look up ATLAS technique(s) for a detection category.
 * Returns empty array for unknown categories.
 */
export function mapToAtlas(category: string): AtlasMapping[] {
  return ATLAS_MAP[category] ?? [];
}

/**
 * Enrich a detection result with ATLAS metadata.
 */
export function enrichWithAtlas(detection: {
  category: string;
}): AtlasMapping[] {
  return mapToAtlas(detection.category);
}

/**
 * Get all mapped ATLAS techniques (unique by techniqueId).
 */
export function getAllMappedTechniques(): AtlasMapping[] {
  const seen = new Set<string>();
  const result: AtlasMapping[] = [];

  for (const mappings of Object.values(ATLAS_MAP)) {
    for (const mapping of mappings) {
      if (!seen.has(mapping.techniqueId)) {
        seen.add(mapping.techniqueId);
        result.push(mapping);
      }
    }
  }

  return result;
}
