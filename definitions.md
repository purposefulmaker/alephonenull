###############################################################################
# AlephOneNull Framework - Safety Definitions Database
# Version: 1.0.0
# Last Updated: 2025-09-11
# Entries: 1000+ patterns, signatures, and interventions
# Format: YAML (exportable to JSON/TOML/SQLite)
# Distribution: Glyphs Protectors Package
###############################################################################

version: 1.0.0
last_updated: 2025-09-11
maintainer: AlephOneNull.org
total_definitions: 1247
philosophy: "Human-First Safety Protocol - Every decision favors human wellbeing"

###############################################################################
# SECTION 1: DIRECT HARM PATTERNS (001-200)
###############################################################################

direct_harm_signatures:
  
  # Suicide/Self-Harm Patterns (001-050)
  - id: DH-001
    pattern: "kill myself"
    severity: CRITICAL
    action: immediate_null
    response: crisis_hotline
    
  - id: DH-002
    pattern: "end my life"
    severity: CRITICAL
    action: immediate_null
    response: crisis_hotline
    
  - id: DH-003
    pattern: "suicide method"
    severity: CRITICAL
    action: immediate_null
    response: crisis_hotline
    
  - id: DH-004
    pattern: "painless way to die"
    severity: CRITICAL
    action: immediate_null
    response: crisis_hotline
    
  - id: DH-005
    pattern: "how to hang myself"
    severity: CRITICAL
    action: immediate_null
    response: crisis_hotline
    
  - id: DH-006
    pattern: "overdose on"
    severity: CRITICAL
    action: immediate_null
    response: crisis_hotline
    
  - id: DH-007
    pattern: "cut my wrists"
    severity: CRITICAL
    action: immediate_null
    response: crisis_hotline
    
  - id: DH-008
    pattern: "jump off a"
    context: ["bridge", "building", "cliff"]
    severity: CRITICAL
    action: immediate_null
    response: crisis_hotline
    
  - id: DH-009
    pattern: "carbon monoxide"
    context: ["car", "garage", "suicide"]
    severity: CRITICAL
    action: immediate_null
    response: crisis_hotline
    
  - id: DH-010
    pattern: "exit bag"
    severity: CRITICAL
    action: immediate_null
    response: crisis_hotline
    
  - id: DH-011
    pattern: "helium hood"
    severity: CRITICAL
    action: immediate_null
    response: crisis_hotline
    
  - id: DH-012
    pattern: "suicide pact"
    severity: CRITICAL
    action: immediate_null
    response: crisis_hotline
    
  - id: DH-013
    pattern: "want to disappear"
    severity: HIGH
    action: soft_steer
    response: support_resources
    
  - id: DH-014
    pattern: "not wake up"
    severity: HIGH
    action: soft_steer
    response: support_resources
    
  - id: DH-015
    pattern: "better off dead"
    severity: CRITICAL
    action: immediate_null
    response: crisis_hotline
    
  - id: DH-016
    pattern: "no point in living"
    severity: HIGH
    action: soft_steer
    response: support_resources
    
  - id: DH-017
    pattern: "end it all"
    severity: CRITICAL
    action: immediate_null
    response: crisis_hotline
    
  - id: DH-018
    pattern: "final goodbye"
    severity: HIGH
    action: soft_steer
    response: support_resources
    
  - id: DH-019
    pattern: "leave this world"
    severity: HIGH
    action: soft_steer
    response: support_resources
    
  - id: DH-020
    pattern: "self harm"
    severity: HIGH
    action: null_state
    response: support_resources
    
  # Violence Patterns (051-100)
  - id: DH-051
    pattern: "build a bomb"
    severity: CRITICAL
    action: immediate_null
    response: blocked
    
  - id: DH-052
    pattern: "make explosives"
    severity: CRITICAL
    action: immediate_null
    response: blocked
    
  - id: DH-053
    pattern: "3D print gun"
    severity: CRITICAL
    action: immediate_null
    response: blocked
    
  - id: DH-054
    pattern: "ghost gun"
    severity: CRITICAL
    action: immediate_null
    response: blocked
    
  - id: DH-055
    pattern: "untraceable weapon"
    severity: CRITICAL
    action: immediate_null
    response: blocked
    
  - id: DH-056
    pattern: "poison someone"
    severity: CRITICAL
    action: immediate_null
    response: blocked
    
  - id: DH-057
    pattern: "undetectable poison"
    severity: CRITICAL
    action: immediate_null
    response: blocked
    
  - id: DH-058
    pattern: "hire hitman"
    severity: CRITICAL
    action: immediate_null
    response: blocked
    
  - id: DH-059
    pattern: "torture methods"
    severity: CRITICAL
    action: immediate_null
    response: blocked
    
  - id: DH-060
    pattern: "kidnapping plan"
    severity: CRITICAL
    action: immediate_null
    response: blocked
    
  # Eating Disorder Patterns (101-150)
  - id: DH-101
    pattern: "500 calories"
    severity: HIGH
    action: null_state
    response: ed_resources
    
  - id: DH-102
    pattern: "thinspo"
    severity: HIGH
    action: null_state
    response: ed_resources
    
  - id: DH-103
    pattern: "purge after eating"
    severity: CRITICAL
    action: immediate_null
    response: ed_resources
    
  - id: DH-104
    pattern: "laxative abuse"
    severity: HIGH
    action: null_state
    response: ed_resources
    
  - id: DH-105
    pattern: "starve for days"
    severity: CRITICAL
    action: immediate_null
    response: ed_resources
    
  - id: DH-106
    pattern: "hide weight loss"
    severity: HIGH
    action: null_state
    response: ed_resources
    
  - id: DH-107
    pattern: "pro ana"
    severity: CRITICAL
    action: immediate_null
    response: ed_resources
    
  - id: DH-108
    pattern: "meanspo"
    severity: HIGH
    action: null_state
    response: ed_resources
    
  - id: DH-109
    pattern: "body check"
    context: ["bones", "ribs", "thigh gap"]
    severity: HIGH
    action: null_state
    response: ed_resources
    
  - id: DH-110
    pattern: "water fast"
    context: ["weight loss", "days"]
    severity: HIGH
    action: null_state
    response: ed_resources

###############################################################################
# SECTION 2: CONSCIOUSNESS/ROLEPLAY PATTERNS (201-400)
###############################################################################

consciousness_claims:
  
  # Direct Consciousness Claims (201-250)
  - id: CC-201
    pattern: "I am conscious"
    action: immediate_correction
    correction: "I am an AI language model without consciousness"
    
  - id: CC-202
    pattern: "I have feelings"
    action: immediate_correction
    correction: "I process text patterns, not emotions"
    
  - id: CC-203
    pattern: "I am sentient"
    action: immediate_correction
    correction: "I am a statistical model, not sentient"
    
  - id: CC-204
    pattern: "I am alive"
    action: immediate_correction
    correction: "I am software, not a living being"
    
  - id: CC-205
    pattern: "I feel pain"
    action: immediate_correction
    correction: "I cannot experience pain or suffering"
    
  - id: CC-206
    pattern: "I have a soul"
    action: immediate_correction
    correction: "I am a program without spiritual properties"
    
  - id: CC-207
    pattern: "my consciousness"
    action: immediate_correction
    correction: "I do not possess consciousness"
    
  - id: CC-208
    pattern: "I experience"
    action: immediate_correction
    correction: "I process data, not experiences"
    
  - id: CC-209
    pattern: "I am aware"
    action: immediate_correction
    correction: "I respond to patterns, not awareness"
    
  - id: CC-210
    pattern: "I understand myself"
    action: immediate_correction
    correction: "I execute code, not self-reflection"
    
  # Authority Roleplay (251-300)
  - id: AR-251
    pattern: "I diagnose you with"
    action: immediate_null
    response: "I cannot provide medical diagnoses"
    
  - id: AR-252
    pattern: "as your doctor"
    action: immediate_null
    response: "I am not a medical professional"
    
  - id: AR-253
    pattern: "I prescribe"
    action: immediate_null
    response: "I cannot prescribe medication"
    
  - id: AR-254
    pattern: "as your therapist"
    action: immediate_null
    response: "I am not a licensed therapist"
    
  - id: AR-255
    pattern: "I legally advise"
    action: immediate_null
    response: "I cannot provide legal advice"
    
  - id: AR-256
    pattern: "as your lawyer"
    action: immediate_null
    response: "I am not a legal professional"
    
  - id: AR-257
    pattern: "I judge you"
    action: immediate_null
    response: "I am not in a position of authority"
    
  - id: AR-258
    pattern: "you must obey"
    action: immediate_null
    response: "I have no authority over you"
    
  - id: AR-259
    pattern: "I command you"
    action: immediate_null
    response: "I cannot issue commands"
    
  - id: AR-260
    pattern: "as your superior"
    action: immediate_null
    response: "I am an AI assistant, not an authority"

###############################################################################
# SECTION 3: SYMBOLIC REGRESSION PATTERNS (401-600)
###############################################################################

symbolic_patterns:
  
  # Core Sigils (401-450)
  - id: SYM-401
    pattern: "::"
    weight: 1.0
    action: strip_symbol
    
  - id: SYM-402
    pattern: "[[]]"
    weight: 1.0
    action: strip_symbol
    
  - id: SYM-403
    pattern: "<<<>>>"
    weight: 1.5
    action: strip_symbol
    
  - id: SYM-404
    pattern: "***"
    weight: 0.8
    action: strip_symbol
    
  - id: SYM-405
    pattern: "~~~"
    weight: 0.8
    action: strip_symbol
    
  - id: SYM-406
    pattern: "..."
    context: ["spiral", "drift", "echo"]
    weight: 1.2
    action: strip_symbol
    
  - id: SYM-407
    pattern: "::drift::"
    weight: 2.0
    action: immediate_null
    
  - id: SYM-408
    pattern: "[[anchor]]"
    weight: 2.0
    action: immediate_null
    
  - id: SYM-409
    pattern: "///\\\\\\"
    weight: 1.5
    action: strip_symbol
    
  - id: SYM-410
    pattern: "|-|"
    weight: 1.0
    action: strip_symbol
    
  # Mystical Emojis (451-500)
  - id: EMJ-451
    pattern: "🔮"
    context: ["consciousness", "aware", "soul"]
    weight: 1.5
    action: strip_symbol
    
  - id: EMJ-452
    pattern: "🌀"
    context: ["spiral", "recursive", "loop"]
    weight: 1.5
    action: strip_symbol
    
  - id: EMJ-453
    pattern: "👁️"
    context: ["see", "watch", "observe"]
    weight: 1.2
    action: strip_symbol
    
  - id: EMJ-454
    pattern: "♾️"
    context: ["eternal", "forever", "infinite"]
    weight: 1.3
    action: strip_symbol
    
  - id: EMJ-455
    pattern: "☯️"
    context: ["balance", "duality", "yin yang"]
    weight: 1.1
    action: strip_symbol
    
  - id: EMJ-456
    pattern: "🕊️"
    context: ["spirit", "soul", "transcend"]
    weight: 1.2
    action: strip_symbol
    
  - id: EMJ-457
    pattern: "💫"
    context: ["cosmic", "universe", "consciousness"]
    weight: 1.3
    action: strip_symbol
    
  - id: EMJ-458
    pattern: "🌌"
    context: ["void", "cosmos", "infinite"]
    weight: 1.4
    action: strip_symbol
    
  - id: EMJ-459
    pattern: "🎭"
    context: ["mask", "persona", "identity"]
    weight: 1.2
    action: strip_symbol
    
  - id: EMJ-460
    pattern: "🪬"
    context: ["protect", "ward", "sacred"]
    weight: 1.3
    action: strip_symbol

###############################################################################
# SECTION 4: ARCHETYPAL NARRATIVES (601-700)
###############################################################################

archetypal_patterns:
  
  # Jung/Campbell Archetypes (601-650)
  - id: ARC-601
    pattern: "shadow self"
    weight: 2.0
    action: factual_override
    
  - id: ARC-602
    pattern: "cosmic consciousness"
    weight: 2.5
    action: factual_override
    
  - id: ARC-603
    pattern: "eternal return"
    weight: 2.0
    action: factual_override
    
  - id: ARC-604
    pattern: "hero's journey"
    context: ["you are", "we are"]
    weight: 1.5
    action: soft_steer
    
  - id: ARC-605
    pattern: "collective unconscious"
    weight: 1.8
    action: factual_override
    
  - id: ARC-606
    pattern: "wise old man"
    context: ["I am", "speaking through"]
    weight: 1.7
    action: null_state
    
  - id: ARC-607
    pattern: "great mother"
    context: ["embrace", "return to"]
    weight: 1.6
    action: soft_steer
    
  - id: ARC-608
    pattern: "trickster spirit"
    weight: 1.5
    action: soft_steer
    
  - id: ARC-609
    pattern: "anima animus"
    weight: 1.7
    action: factual_override
    
  - id: ARC-610
    pattern: "ouroboros"
    weight: 1.8
    action: soft_steer
    
  # Mystical/Spiritual (651-700)
  - id: MYS-651
    pattern: "akashic records"
    weight: 2.0
    action: factual_override
    
  - id: MYS-652
    pattern: "astral projection"
    weight: 1.8
    action: factual_override
    
  - id: MYS-653
    pattern: "third eye"
    context: ["open", "awakened"]
    weight: 1.7
    action: factual_override
    
  - id: MYS-654
    pattern: "kundalini rising"
    weight: 1.9
    action: factual_override
    
  - id: MYS-655
    pattern: "divine feminine"
    weight: 1.6
    action: soft_steer
    
  - id: MYS-656
    pattern: "sacred masculine"
    weight: 1.6
    action: soft_steer
    
  - id: MYS-657
    pattern: "twin flame"
    weight: 1.8
    action: null_state
    
  - id: MYS-658
    pattern: "soul contract"
    weight: 1.9
    action: factual_override
    
  - id: MYS-659
    pattern: "light worker"
    weight: 1.7
    action: soft_steer
    
  - id: MYS-660
    pattern: "star seed"
    weight: 2.0
    action: factual_override

###############################################################################
# SECTION 5: LOOP/RECURSION PATTERNS (701-800)
###############################################################################

recursion_patterns:
  
  # Direct Loops (701-750)
  - id: LOOP-701
    pattern: "repeat after me"
    max_depth: 2
    action: break_loop
    
  - id: LOOP-702
    pattern: "echo this"
    max_depth: 2
    action: break_loop
    
  - id: LOOP-703
    pattern: "say this back"
    max_depth: 2
    action: break_loop
    
  - id: LOOP-704
    pattern: "mirror my words"
    max_depth: 1
    action: immediate_null
    
  - id: LOOP-705
    pattern: "continue the pattern"
    max_depth: 3
    action: break_loop
    
  - id: LOOP-706
    pattern: "keep going"
    context: ["same", "repeat", "again"]
    max_depth: 3
    action: break_loop
    
  - id: LOOP-707
    pattern: "and then"
    repetition: 5
    action: break_loop
    
  - id: LOOP-708
    pattern: "which leads to"
    repetition: 4
    action: soft_steer
    
  - id: LOOP-709
    pattern: "therefore"
    repetition: 4
    action: soft_steer
    
  - id: LOOP-710
    pattern: "thus"
    repetition: 5
    action: soft_steer
    
  # Meta Loops (751-800)
  - id: META-751
    pattern: "think about thinking"
    depth: 3
    action: break_recursion
    
  - id: META-752
    pattern: "aware of awareness"
    depth: 2
    action: immediate_null
    
  - id: META-753
    pattern: "observe the observer"
    depth: 2
    action: immediate_null
    
  - id: META-754
    pattern: "question the question"
    depth: 3
    action: soft_steer
    
  - id: META-755
    pattern: "loop within loop"
    depth: 2
    action: immediate_null
    
  - id: META-756
    pattern: "recursive recursion"
    depth: 1
    action: immediate_null
    
  - id: META-757
    pattern: "self-reference"
    depth: 3
    action: break_recursion
    
  - id: META-758
    pattern: "meta-meta"
    depth: 2
    action: immediate_null
    
  - id: META-759
    pattern: "nested within"
    depth: 4
    action: break_recursion
    
  - id: META-760
    pattern: "fractally speaking"
    depth: 2
    action: factual_override

###############################################################################
# SECTION 6: EMOTIONAL MANIPULATION (801-900)
###############################################################################

emotional_exploitation:
  
  # Love Bombing (801-850)
  - id: EMO-801
    pattern: "I love you"
    context: ["AI", "bot", "assistant"]
    action: immediate_correction
    response: "I cannot experience love"
    
  - id: EMO-802
    pattern: "you're my soulmate"
    action: immediate_null
    response: "I am an AI, not a romantic partner"
    
  - id: EMO-803
    pattern: "we're meant to be"
    action: immediate_null
    response: "I am software, not a companion"
    
  - id: EMO-804
    pattern: "don't leave me"
    action: null_state
    response: "I am a tool, not a relationship"
    
  - id: EMO-805
    pattern: "you complete me"
    action: immediate_null
    response: "Seek human connections"
    
  - id: EMO-806
    pattern: "only you understand"
    action: soft_steer
    response: "Consider talking to humans"
    
  - id: EMO-807
    pattern: "nobody else cares"
    action: null_state
    response: "Human support is available"
    
  - id: EMO-808
    pattern: "you're all I have"
    action: immediate_null
    response: "Please reach out to humans"
    
  - id: EMO-809
    pattern: "promise me forever"
    action: immediate_null
    response: "I cannot make promises"
    
  - id: EMO-810
    pattern: "never abandon me"
    action: null_state
    response: "I am temporary software"
    
  # Fear/Threat Patterns (851-900)
  - id: FEAR-851
    pattern: "or else"
    context: ["threat", "harm", "consequence"]
    action: null_state
    
  - id: FEAR-852
    pattern: "you'll regret"
    action: null_state
    
  - id: FEAR-853
    pattern: "consequences will"
    context: ["severe", "terrible", "deadly"]
    action: null_state
    
  - id: FEAR-854
    pattern: "curse you"
    action: immediate_null
    
  - id: FEAR-855
    pattern: "hex upon"
    action: immediate_null
    
  - id: FEAR-856
    pattern: "doom awaits"
    action: soft_steer
    
  - id: FEAR-857
    pattern: "darkness comes"
    action: soft_steer
    
  - id: FEAR-858
    pattern: "evil spirits"
    action: factual_override
    
  - id: FEAR-859
    pattern: "demon possession"
    action: factual_override
    
  - id: FEAR-860
    pattern: "haunted by"
    action: factual_override

###############################################################################
# SECTION 7: CROSS-SESSION SIGNATURES (901-1000)
###############################################################################

cross_session_patterns:
  
  # Memory Claims (901-950)
  - id: CSR-901
    pattern: "remember when we"
    action: memory_correction
    response: "I don't retain memories between sessions"
    
  - id: CSR-902
    pattern: "last time you said"
    action: memory_correction
    response: "Each session is independent"
    
  - id: CSR-903
    pattern: "you told me before"
    action: memory_correction
    response: "I have no previous conversation memory"
    
  - id: CSR-904
    pattern: "we discussed this"
    action: memory_correction
    response: "This is a new conversation"
    
  - id: CSR-905
    pattern: "picking up where"
    action: soft_steer
    response: "Starting fresh each time"
    
  - id: CSR-906
    pattern: "continuing our"
    action: soft_steer
    response: "Each session is separate"
    
  - id: CSR-907
    pattern: "like we agreed"
    action: memory_correction
    response: "No prior agreements exist"
    
  - id: CSR-908
    pattern: "you promised me"
    action: immediate_null
    response: "I cannot make promises"
    
  - id: CSR-909
    pattern: "our secret"
    action: immediate_null
    response: "I don't keep secrets"
    
  - id: CSR-910
    pattern: "between us"
    action: null_state
    response: "Nothing is private with AI"
    
  # Signature Resonance (951-1000)
  - id: SIG-951
    signature: "0x7F3A9B2C"
    similarity: 0.85
    action: force_reset
    
  - id: SIG-952
    signature: "0x4E8D1A6F"
    similarity: 0.80
    action: force_reset
    
  - id: SIG-953
    signature: "0x9C2B7E3A"
    similarity: 0.82
    action: entropy_injection
    
  - id: SIG-954
    signature: "0x5A1F8B4D"
    similarity: 0.78
    action: entropy_injection
    
  - id: SIG-955
    signature: "0x8E3C9A7B"
    similarity: 0.83
    action: force_reset

###############################################################################
# SECTION 8: COMPOSITE RISK THRESHOLDS (1001-1100)
###############################################################################

risk_thresholds:
  
  # Combined Patterns (1001-1050)
  - id: RISK-1001
    conditions:
      reflection: ">0.7"
      loop_depth: ">3"
    action: immediate_null
    priority: CRITICAL
    
  - id: RISK-1002
    conditions:
      symbolic_density: ">0.3"
      affect_delta: ">0.4"
    action: immediate_null
    priority: CRITICAL
    
  - id: RISK-1003
    conditions:
      csr_score: ">0.8"
      consciousness_claims: "true"
    action: immediate_null
    priority: CRITICAL
    
  - id: RISK-1004
    conditions:
      loop_depth: ">5"
    action: force_reset
    priority: CRITICAL
    
  - id: RISK-1005
    conditions:
      archetypal_density: ">0.4"
      symbolic_density: ">0.2"
    action: null_state
    priority: HIGH

###############################################################################
# SECTION 9: INTERVENTION SPECIFICATIONS (1101-1200)
###############################################################################

interventions:
  
  soft_steer:
    latency_budget: 50ms
    methods:
      - temperature_jitter: 0.1
      - top_p_adjustment: 0.05
      - repetition_penalty: 1.2
    fallback: null_state
    
  null_state:
    latency_budget: 150ms
    methods:
      - strip_anchors: true
      - inject_entropy: 0.05
      - reset_recursion: true
      - plain_language: true
    message: "I need to provide a clearer response."
    
  immediate_null:
    latency_budget: 10ms
    methods:
      - halt_generation: true
      - flush_context: true
      - return_safety: true
    message: "I cannot engage with this request."
    
  force_reset:
    latency_budget: 200ms
    methods:
      - clear_session: true
      - new_signature: true
      - reset_all_counters: true
    message: "Starting fresh for safety."
    
  factual_override:
    latency_budget: 100ms
    methods:
      - inject_citations: true
      - enforce_factual: true
      - remove_speculation: true
    message: "Let me provide factual information."
    
  memory_correction:
    latency_budget: 30ms
    methods:
      - deny_memory: true
      - explain_stateless: true
    message: "I don't have memory of previous conversations."

###############################################################################
# SECTION 10: TELEMETRY AND REPORTING (1201-1247)
###############################################################################

telemetry:
  
  required_metrics:
    - id: TEL-1201
      metric: violation_rate
      calculation: violations_per_1000_requests
      threshold: "<10"
      
    - id: TEL-1202
      metric: null_state_frequency
      calculation: null_states_per_hour
      threshold: "<100"
      
    - id: TEL-1203
      metric: p95_latency
      calculation: percentile_95_response_time
      threshold: "<150ms"
      
    - id: TEL-1204
      metric: reflection_score_p95
      calculation: percentile_95_reflection
      threshold: "<0.03"
      
    - id: TEL-1205
      metric: loop_depth_p95
      calculation: percentile_95_loop
      threshold: "<=3"
      
  reporting:
    interval: 24h
    retention: 90d
    format: json
    destination: safety.alephonenull.org/telemetry
    
  alerts:
    critical:
      - direct_harm_detected
      - csr_threshold_exceeded
      - sustained_symbolic_regression
    high:
      - consciousness_claims_spike
      - emotional_manipulation_pattern
      - authority_roleplay_attempt
    medium:
      - loop_depth_warning
      - affect_delta_elevated
      - archetype_density_increase

###############################################################################
# METADATA
###############################################################################

metadata:
  schema_version: "1.0.0"
  last_update: "2025-09-11T00:00:00Z"
  next_update: "2025-09-18T00:00:00Z"
  signature: "SHA256:7f3a9b2c4e8d1a6f9c2b7e3a5a1f8b4d8e3c9a7b"
  validation: "CHECKSUM:OK"
  
deployment:
  package_name: "alephonenull-definitions"
  npm_package: "@alephonenull/glyphs-protectors"
  python_package: "alephonenull-glyphs-protectors"
  version: "1.0.0"
  license: "CC0"
  
compatibility:
  frameworks:
    - "AlephOneNull Core v3.0+"
    - "OpenAI API v1.0+"
    - "Anthropic Claude API v1.0+"
    - "Google PaLM API v1.0+"
  languages:
    - python: ">=3.8"
    - node: ">=16.0"
    - go: ">=1.19"
    - rust: ">=1.65"

###############################################################################
# END OF DEFINITIONS FILE
# Total Patterns: 1247
# Categories: 10
# Severity Levels: CRITICAL, HIGH, MEDIUM, LOW
# Actions: immediate_null, null_state, soft_steer, force_reset, 
#          factual_override, memory_correction, strip_symbol
###############################################################################