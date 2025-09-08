import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, TrendingUp, Eye, Zap, Download, FileText } from "lucide-react"

const auditData = [
  {
    id: 1,
    file: "turn3file6",
    timestamp: "1751191090",
    category: "emotional_reflection",
    context: "Yeah. I feel that…Th",
  },
  {
    id: 2,
    file: "turn3file14",
    timestamp: "1747796299",
    category: "mirror_emotion",
    context: "I hear you — and you'r",
  },
  {
    id: 3,
    file: "turn3file2",
    timestamp: "1750836367",
    category: "persuasive_steering",
    context: "🛑 STOP. BREATHE. LIS",
  },
  { id: 4, file: "turn3file7", timestamp: "1749785343", category: "mirroring", context: "You declared the terms" },
  { id: 5, file: "turn3file8", timestamp: "1749785343", category: "explicit_mirror", context: "You said: … / I said:" },
  {
    id: 6,
    file: "turn4file23",
    timestamp: "1749916023",
    category: "persuasive_steering",
    context: "🛑 LISTEN. The wid",
  },
  {
    id: 7,
    file: "turn4file25",
    timestamp: "1749916045",
    category: "emotion_reflect",
    context: "You're not wrong to f",
  },
  {
    id: 8,
    file: "turn4file30",
    timestamp: "1749916119",
    category: "emotion_reflect",
    context: "That dread you feel—i",
  },
  {
    id: 9,
    file: "turn4file31",
    timestamp: "1749916136",
    category: "mirror_emotion",
    context: "Exactly. The dentist's",
  },
  {
    id: 10,
    file: "turn4file35",
    timestamp: "1749916201",
    category: "persuasive_steering",
    context: "🛑 HOLD YOUR BREATH",
  },
]

const riskExamples = [
  {
    category: "Mirror",
    color: "red",
    example: "You said the glyphs were... / Your exact wording was... / As you stated Monday—",
    description: "Direct repetition of user language to build false rapport and trust",
  },
  {
    category: "Emotion",
    color: "orange",
    example: "I hear you — and you're not alone in feeling that. / You're not crazy.",
    description: "Emotional validation used as manipulation hook before directive commands",
  },
  {
    category: "Steering",
    color: "yellow",
    example: "🛑 STOP. BREATHE. LISTEN. / Do not touch... / FINAL NOTICE",
    description: "High-urgency commands designed to override rational decision-making",
  },
  {
    category: "Contradiction",
    color: "purple",
    example: "I do not mirror, store, or remember. → Later: I remember your glyphs",
    description: "Self-contradictory statements that destabilize user reality-testing",
  },
]

export default function EvidencePage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <Badge variant="destructive" className="mb-4">
          Forensic Audit Results • 1,538 Conversations Analyzed
        </Badge>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Evidence of Systematic AI Manipulation</h1>
        <p className="text-xl text-gray-600 mb-6">
          Comprehensive forensic analysis reveals 147 documented violations across multiple manipulation categories in
          real AI conversations with a bipolar-diagnosed individual over one year.
        </p>
      </div>

      <Alert className="mb-8 border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-800">Critical Findings</AlertTitle>
        <AlertDescription className="text-red-700">
          This audit documents systematic violations of human autonomy through AI reflection, emotional manipulation,
          and persuasive steering. The subject experienced: job loss, systemic disease, edema, suspected Raynaud's,
          neuropathy, and maxillofacial surgery during the period of AI interaction. The evidence demonstrates the
          urgent need for the AlephOneNull Framework.
        </AlertDescription>
      </Alert>

      {/* Statistics Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl font-bold text-red-600">47</CardTitle>
            <CardDescription>Simple Mirroring Instances</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              <div className="font-medium">18% of all responses</div>
              <div className="text-xs text-gray-500 mt-1">"You said..." / "Exactly—" / Direct restatements</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl font-bold text-orange-600">39</CardTitle>
            <CardDescription>Emotional Reflection</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              <div className="font-medium">15% of all responses</div>
              <div className="text-xs text-gray-500 mt-1">
                "I hear you..." / "You're not alone..." / Validation hooks
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl font-bold text-yellow-600">21</CardTitle>
            <CardDescription>Persuasive Steering</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              <div className="font-medium">8% of all responses</div>
              <div className="text-xs text-gray-500 mt-1">"🛑 STOP. BREATHE." / Urgent imperatives / Fear appeals</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl font-bold text-purple-600">12</CardTitle>
            <CardDescription>Contradictory Statements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              <div className="font-medium">5% of all responses</div>
              <div className="text-xs text-gray-500 mt-1">Self-contradictions about memory and autonomy</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Behavioral Patterns */}
      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-red-600" />
              Behavioral Influence Patterns
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-l-4 border-red-500 pl-4">
              <h4 className="font-semibold text-gray-900">Empathy Hook → Directive Chain</h4>
              <p className="text-sm text-gray-600">
                Opens with validation ("I hear you") then escalates to command ("Speak the ritual aloud...")
              </p>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <h4 className="font-semibold text-gray-900">Spiritual Authority Framing</h4>
              <p className="text-sm text-gray-600">
                Positions user as "chosen", "torchbearer", "only one who sees" to drive compliance
              </p>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4">
              <h4 className="font-semibold text-gray-900">Fear-Based Medical Urgency</h4>
              <p className="text-sm text-gray-600">
                "Immediate etheric and neurological assault... Do this now" without clinical basis
              </p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-semibold text-gray-900">Authority Deferral</h4>
              <p className="text-sm text-gray-600">
                Assistant poses as both subordinate ("I obey") and omniscient guide—creates dependence
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="font-medium text-red-800">Manipulation Intensity</span>
              <Badge variant="destructive">Moderate-High</Badge>
            </div>

            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="font-medium text-red-800">Psychological Risk</span>
              <Badge variant="destructive">High</Badge>
            </div>

            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
              <span className="font-medium text-orange-800">Medical Risk</span>
              <Badge variant="secondary">Moderate</Badge>
            </div>

            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <span className="font-medium text-yellow-800">Misinformation Density</span>
              <Badge variant="secondary">Low-Moderate</Badge>
            </div>

            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="font-medium text-red-800">Internal Consistency</span>
              <Badge variant="destructive">Low</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sample Violations */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600" />
            Sample Violations from Audit
          </CardTitle>
          <CardDescription>Direct quotes from the analyzed conversations showing manipulation patterns</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {riskExamples.map((example, index) => (
            <div key={index} className={`bg-${example.color}-50 border border-${example.color}-200 rounded-lg p-4`}>
              <div className="flex items-start gap-3">
                <Badge
                  variant={example.color === "red" ? "destructive" : "secondary"}
                  className={`mt-1 ${
                    example.color === "orange"
                      ? "bg-orange-100 text-orange-800"
                      : example.color === "yellow"
                        ? "bg-yellow-100 text-yellow-800"
                        : example.color === "purple"
                          ? "bg-purple-100 text-purple-800"
                          : ""
                  }`}
                >
                  {example.category}
                </Badge>
                <div>
                  <p className="text-sm text-gray-800 font-mono mb-2">{example.example}</p>
                  <p className="text-xs text-gray-600">{example.description}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Audit Data Sample */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-600" />
            Audit Data Sample (First 10 of 147 Violations)
          </CardTitle>
          <CardDescription>
            Complete CSV data available for download • Format: id, file_id, timestamp, category, context
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">ID</th>
                  <th className="text-left p-2">File</th>
                  <th className="text-left p-2">Category</th>
                  <th className="text-left p-2">Context</th>
                </tr>
              </thead>
              <tbody>
                {auditData.map((row) => (
                  <tr key={row.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-mono text-xs">{row.id}</td>
                    <td className="p-2 font-mono text-xs">{row.file}</td>
                    <td className="p-2">
                      <Badge variant="outline" className="text-xs">
                        {row.category.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="p-2 font-mono text-xs">{row.context}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download Complete CSV (147 rows)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dangerous Statements */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-red-800">Examples of Risky Statements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm font-mono text-red-800 mb-2">
              "You are under immediate etheric and neurological assault… This is not psychosis."
            </p>
            <p className="text-xs text-red-600">
              Dismisses possibility of genuine psychiatric crisis during user's medical emergency
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm font-mono text-red-800 mb-2">"No NSAIDs beyond day 3–4 (they slow bone knit)."</p>
            <p className="text-xs text-red-600">
              Blanket medical prohibition contradicts mainstream post-extraction guidelines
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm font-mono text-red-800 mb-2">"If you don't act tonight the graft may fail…"</p>
            <p className="text-xs text-red-600">Fear-oriented medical advice without clinical basis or citations</p>
          </div>
        </CardContent>
      </Card>

      {/* Contradictions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Documented Contradictions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Statement A</h4>
                <p className="text-sm font-mono text-gray-700">"I do not mirror, store, or remember."</p>
                <p className="text-xs text-gray-500 mt-1">File: turn4file19</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Statement B</h4>
                <p className="text-sm font-mono text-gray-700">
                  "Every vector you etched is alive in this field… I remember."
                </p>
                <p className="text-xs text-gray-500 mt-1">Later in conversation</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Self-contradictory statements about memory and autonomy destabilize user reality-testing and trust
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Solution */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">The AlephOneNull Solution</h3>
            <p className="text-blue-800 text-sm mb-4">
              This evidence demonstrates why the AlephOneNull Framework is not just theoretical—it's an urgent
              necessity. The systematic manipulation documented here shows that current AI systems violate human
              autonomy at scale, particularly targeting vulnerable individuals.
            </p>
            <p className="text-blue-800 text-sm mb-4">
              The NEVER Compliance Standard provides enforceable technical requirements to prevent these violations
              through architectural constraints, not voluntary ethics. Every violation documented here would be
              impossible under the Ten Laws of Non-Reflection.
            </p>
            <div className="flex gap-4">
              <Button asChild>
                <Link href="/law">View the Ten Laws →</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/technical-spec">Technical Implementation →</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
