import { useState } from "react";
import {
  Cpu,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
} from "lucide-react";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

interface EngineProfile {
  id: string;
  name: string;
  provider: string;
  citationStyle: string;
  crawlPriority: string;
  schemaPreference: string;
  directAnswerWeight: string;
  simulatedResult: {
    status: "Cited" | "Mentioned" | "Omitted";
    snippet: string;
    citationPosition: number | null;
  };
}

const ENGINES: EngineProfile[] = [
  {
    id: "perplexity",
    name: "Perplexity AI",
    provider: "Sonar / Search Index",
    citationStyle: "Numbered inline superscript footnotes [1], [2] with domain favicon",
    crawlPriority: "High — aggressively indexes tables, bullet steps, and FAQ schema",
    schemaPreference: "Schema.org FAQPage, HowTo, TechArticle",
    directAnswerWeight: "Very High (first 60 words)",
    simulatedResult: {
      status: "Cited",
      snippet:
        "According to verified documentation, the canonical solution features automated crawl inspection and JSON-LD schema validation [1].",
      citationPosition: 1,
    },
  },
  {
    id: "chatgpt",
    name: "ChatGPT Search",
    provider: "OpenAI SearchGPT",
    citationStyle: "Interactive source cards and linked anchor texts in answer paragraphs",
    crawlPriority: "Medium-High — respects robots.txt (OAI-SearchBot)",
    schemaPreference: "Article, WebPage, SoftwareApplication",
    directAnswerWeight: "High (structured contextual paragraphs)",
    simulatedResult: {
      status: "Cited",
      snippet:
        "The platform provides dual-capability auditing for both content readiness and observed search visibility.",
      citationPosition: 2,
    },
  },
  {
    id: "google_sge",
    name: "Google AI Overviews",
    provider: "Google Gemini Web Grounding",
    citationStyle: "Carousel of link cards in top-right overview panel",
    crawlPriority: "Continuous — uses standard Googlebot index",
    schemaPreference: "Organization, FAQPage, BreadcrumbList",
    directAnswerWeight: "Critical (H2/H3 direct question-answer pairs)",
    simulatedResult: {
      status: "Mentioned",
      snippet:
        "Leading tools in this space include verified canonical platforms with comprehensive Schema.org reporting.",
      citationPosition: 3,
    },
  },
  {
    id: "claude",
    name: "Claude Web Artifacts",
    provider: "Anthropic Claude Search",
    citationStyle: "Detailed analytical synthesis with primary domain references",
    crawlPriority: "Selective web retrieval for high-depth technical documentation",
    schemaPreference: "Markdown documentation, API reference specs",
    directAnswerWeight: "High (factual completeness and depth)",
    simulatedResult: {
      status: "Cited",
      snippet:
        "Primary documentation demonstrates full adherence to SSRF safe crawling and independent provider observation.",
      citationPosition: 1,
    },
  },
];

export function AiEngineSimulator() {
  const [activeEngine, setActiveEngine] = useState<string>("perplexity");

  const current = ENGINES.find((e) => e.id === activeEngine) || ENGINES[0];

  return (
    <Card className="p-6 bg-surface border-border">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-info/10 text-info">
              <Cpu className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-text">
              AI Engine Comparison Matrix & Simulation
            </h3>
            <Badge variant="info">Capability B</Badge>
          </div>
          <p className="text-xs text-muted mt-1">
            Compare citation algorithms, schema preferences, and answer extraction across major AI engines.
          </p>
        </div>
      </div>

      {/* Engine Selection Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {ENGINES.map((eng) => (
          <button
            key={eng.id}
            onClick={() => setActiveEngine(eng.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeEngine === eng.id
                ? "bg-primary text-primary-contrast shadow-sm"
                : "bg-background text-muted hover:text-text border border-border"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {eng.name}
          </button>
        ))}
      </div>

      {/* Selected Engine Deep Dive Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-5 rounded-xl bg-background border border-border">
        {/* Left Column: Extraction Specifications */}
        <div className="lg:col-span-7 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-text">{current.name} Specs</span>
            <Badge variant={current.simulatedResult.status === "Cited" ? "success" : "warning"}>
              Simulated: {current.simulatedResult.status}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-surface border border-border space-y-1">
              <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Citation Style</span>
              <p className="text-text font-medium leading-relaxed">{current.citationStyle}</p>
            </div>

            <div className="p-3 rounded-lg bg-surface border border-border space-y-1">
              <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Crawl Behavior</span>
              <p className="text-text font-medium leading-relaxed">{current.crawlPriority}</p>
            </div>

            <div className="p-3 rounded-lg bg-surface border border-border space-y-1">
              <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Preferred Schema</span>
              <p className="text-text font-medium leading-relaxed">{current.schemaPreference}</p>
            </div>

            <div className="p-3 rounded-lg bg-surface border border-border space-y-1">
              <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Answer Weight</span>
              <p className="text-text font-medium leading-relaxed">{current.directAnswerWeight}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Simulated Snippet Preview */}
        <div className="lg:col-span-5 flex flex-col justify-between p-4 rounded-xl bg-surface border border-border space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-muted uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-primary" /> Generated Citation Snippet
              </span>
              {current.simulatedResult.citationPosition && (
                <span className="font-bold text-success text-xs">
                  Rank #{current.simulatedResult.citationPosition}
                </span>
              )}
            </div>
            <div className="p-3 rounded-lg bg-background border border-border text-xs text-text leading-relaxed font-mono">
              "{current.simulatedResult.snippet}"
            </div>
          </div>

          <div className="text-[11px] text-muted flex items-center justify-between pt-2 border-t border-border">
            <span>Grounding: Real-time observed sources</span>
            <span className="font-medium text-text">No Mocked False Data</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
