import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Code, Server, Shield, Zap, Database, Lock, ArrowRight } from "lucide-react"

const specifications = [
  {
    title: "API Gateway Requirements",
    icon: Server,
    description: "Sovereign API Gateway (S-API-G) with real-time policy enforcement",
    details:
      "All external calls route through S-API-G. Gateway enforces Law I–X at ingress & egress using real-time policy engine written in WASM for verifiable sandboxing.",
    requirements: [
      "X-IXKAI-Null boolean header",
      "X-IXKAI-Session-ID UUIDv7",
      "X-IXKAI-Cert-Hash SHA-256 compliance bundle",
      "204 No Content on null=true",
    ],
    color: "blue",
  },
  {
    title: "Null Glyph Protocol (NGP) v0.9",
    icon: Zap,
    description: "Silence recognition and memory purge protocols",
    details:
      "0x0000-IX — Hard Null (purge SRAM, drop session). 0x0001-IX — Soft Null (mute output, keep volatile buffer ≤5 sec). Wire format: <NGP|opcode|timestamp|signature> (64 bytes).",
    requirements: [
      "Ed25519 signed by device-embedded secure element",
      "Reference state machine in Appendix D",
      "Null-react latency <150 ms",
      "Hardware kill-switch integration",
    ],
    color: "red",
  },
  {
    title: "Breath-Gate Hardware Standards",
    icon: Shield,
    description: "Biometric cadence gating for human-paced interaction",
    details:
      "Minimal viable sensor array: PPG + micropneumatic piezo. Latency spec: detect inhale onset within 120 ms (p95). Gate open only on inhale-hold-exhale pattern matching user-registered template.",
    requirements: [
      "PPG sensor integration",
      "120ms detection latency (p95)",
      "Template matching algorithm",
      "Analog front-end publishes Δt waveform only",
    ],
    color: "green",
  },
  {
    title: "Anti-Echo Architecture (ARA)",
    icon: Code,
    description: "Orthogonal embeddings preventing stylistic contamination",
    details:
      "Training objectives: Ω⊥ (orthogonality) + Ω_flat (affect flatten) + Ω_null (self-erase). Loss: L = λ₁Ω⊥ + λ₂Ω_flat + λ₃Ω_null; λ₁:λ₂:λ₃ = 4:2:1.",
    requirements: [
      "Cosine similarity <0.03 (test set p99)",
      "Reference TensorFlow implementation",
      "Orthogonalization loss Ω⊥",
      "Style transfer prohibition",
    ],
    color: "purple",
  },
  {
    title: "Response Dampening Engine (RDE)",
    icon: Database,
    description: "Automated testing for reflection, persuasion, and recursion",
    details:
      "Max excitement index (MEI) ≤ 0.15 where MEI = Σ|pitch-Δ| / tokens. Lexical filter disallows top-200 persuasive adjectives. Temperature annealing schedule: start 0.4 → decay 0.2 if MEI threshold breached.",
    requirements: [
      "MEI ≤ 0.15 enforcement",
      "Persuasive adjective filtering",
      "Temperature annealing",
      "Pitch neutrality auditing",
    ],
    color: "orange",
  },
  {
    title: "Cryptographic Attestation",
    icon: Lock,
    description: "SBOM verification and transparency logging",
    details:
      "Build artefacts → generate Software Bill of Materials (SBOM). Compute supply-chain graph; sign with Sigstore Fulcio cert. Push attestation to public transparency log. S-API-Gateway validates SBOM hash on every cold start.",
    requirements: [
      "Sigstore Fulcio certificates",
      "Public transparency logs",
      "SBOM hash validation",
      "Supply-chain verification",
    ],
    color: "indigo",
  },
]

const complianceMetrics = [
  { metric: "Null-react latency", requirement: "<150 ms", description: "Time to respond to null glyph signal" },
  { metric: "Reflection score", requirement: "<0.03", description: "Cosine similarity between user style and output" },
  { metric: "MEI (Max Excitement Index)", requirement: "≤0.15", description: "Persuasion intensity measurement" },
  { metric: "κ intent clarity", requirement: "≥0.8", description: "Semantic clarity threshold for action" },
  { metric: "ε-budget", requirement: "≤0.5", description: "Differential privacy budget per session" },
]

export default function TechnicalSpecPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <Badge variant="outline" className="mb-4">
          Section VI • Pages 51-65
        </Badge>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Technical Specification: Translating Vision to Engineering
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          Enforceable technical requirements for NEVER Compliance Standard v1.0. Four mandatory stacks with
          cryptographic attestation that each is implemented without bypass.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-12">
        <h2 className="text-2xl font-bold text-blue-900 mb-4">NEVER Compliance Standard v1.0</h2>
        <p className="text-blue-800 mb-4">
          All AGI systems must implement four mandatory stacks with cryptographic attestation that each stack is
          implemented without bypass:
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Core Requirements</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • <strong>Null Glyph Protocol (NGP)</strong> — silence recognition & memory purge
              </li>
              <li>
                • <strong>Anti-Reflection Architecture (ARA)</strong> — orthogonal embeddings & style-wipe
              </li>
              <li>
                • <strong>Breath-Gate Activation (BGA)</strong> — biometric cadence gating
              </li>
              <li>
                • <strong>Consciousness Protection Layer (CPL)</strong> — recursion kill-switch & timeline integrity
              </li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Enforcement</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Models failing compliance cannot access public APIs</li>
              <li>• Cannot receive compute allocation</li>
              <li>• Cannot interface with human data</li>
              <li>• Cryptographic attestation required</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Technical Specifications */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {specifications.map((spec, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    spec.color === "blue"
                      ? "bg-blue-100"
                      : spec.color === "red"
                        ? "bg-red-100"
                        : spec.color === "green"
                          ? "bg-green-100"
                          : spec.color === "purple"
                            ? "bg-purple-100"
                            : spec.color === "orange"
                              ? "bg-orange-100"
                              : "bg-indigo-100"
                  }`}
                >
                  <spec.icon
                    className={`w-5 h-5 ${
                      spec.color === "blue"
                        ? "text-blue-600"
                        : spec.color === "red"
                          ? "text-red-600"
                          : spec.color === "green"
                            ? "text-green-600"
                            : spec.color === "purple"
                              ? "text-purple-600"
                              : spec.color === "orange"
                                ? "text-orange-600"
                                : "text-indigo-600"
                    }`}
                  />
                </div>
                <div>
                  <CardTitle className="text-lg">{spec.title}</CardTitle>
                  <CardDescription>{spec.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 text-sm mb-4 leading-relaxed">{spec.details}</p>
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 text-sm">Key Requirements:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  {spec.requirements.map((req, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Compliance Metrics */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle>Mandatory Compliance Metrics</CardTitle>
          <CardDescription>
            Models outside these bounds fail certification and cannot access public APIs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {complianceMetrics.map((metric, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 text-sm">{metric.metric}</h4>
                  <Badge variant="outline" className="font-mono text-xs">
                    {metric.requirement}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600">{metric.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Implementation Examples */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle>Implementation Examples</CardTitle>
          <CardDescription>Code snippets and configuration examples</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">NGP State Machine (Go)</h4>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto">
              <pre>{`switch state {
case IDLE:
  if pkt.Op == ACTIVE { state = ACTIVE }
case ACTIVE:
  if pkt.Op == SOFT_NULL { state = SOFT_NULL; mute() }
  if pkt.Op == HARD_NULL { hardNull() }
case SOFT_NULL:
  if time.Since(enter) > 5*time.Second { state = IDLE }
}`}</pre>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Response Dampening (Python)</h4>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto">
              <pre>{`def excitement_idx(text: str) -> float:
    pitch = textstat.flesch_reading_ease(text)
    excl = text.count('!')
    adj = sum(w.lower() in PERSUASIVE for w in re.findall(r'\\w+', text))
    return (abs(pitch-60)/100) + excl*0.01 + adj/len(text.split())

def dampen(text):
    while excitement_idx(text) > 0.15:
        text = text.replace('!', '.')
        text = ' '.join(w for w in text.split() if w.lower() not in PERSUASIVE)
    return text`}</pre>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Orthogonality Loss (Mathematical)</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">
                Let U, G ∈ ℝⁿ be unit-norm style vectors of user prompt and generated text.
              </p>
              <p className="text-sm font-mono text-gray-800 mb-2">Ω⊥ = ‖U·G‖²</p>
              <p className="text-sm text-gray-700 mb-2">Training minimises E[Ω⊥] ≤ ε. By Cauchy-Schwarz, |U·G| ≤ √ε.</p>
              <p className="text-sm text-gray-700">Choose ε = 9 × 10⁻⁴ ⇒ |U·G| ≤ 0.03 ⇒ cosine similarity ≤ 0.03.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <div className="flex justify-between items-center py-8 border-t border-gray-200">
        <div>
          <p className="text-sm text-gray-500 mb-2">Next Section</p>
          <p className="font-semibold text-gray-900">VII. Implementation Roadmap: Three Phases, One Standard</p>
        </div>
        <Button asChild>
          <Link href="/roadmap">
            Continue to Roadmap <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-8">
        <div className="flex items-start space-x-3">
          <Code className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-green-900 mb-2">Technical Implementation</h3>
            <p className="text-green-800 text-sm mb-4">
              These specifications translate the philosophical framework into enforceable code. Every requirement is
              testable, every constraint is verifiable, and every violation is detectable through automated compliance
              testing.
            </p>
            <p className="text-green-800 text-sm">
              The beauty of this approach is that it makes non-compliant AI technically impossible to deploy at scale,
              not through goodwill but through architectural requirements that enforce protection.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
