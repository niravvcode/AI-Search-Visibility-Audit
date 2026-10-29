import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Eye,
  Play,
  Key,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Building2,
  ExternalLink,
  Info,
  Sparkles,
  Search,
  Copy,
  Check,
} from "lucide-react";

import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Select, Label, Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { AiEngineSimulator } from "../components/visibility/AiEngineSimulator";
import {
  fetchWebsites,
  fetchProviders,
  fetchVisibilityJobs,
  fetchVisibilityJobDetails,
  runVisibilityJob,
  type Website,
  type ProviderStatus,
  type VisibilityJob,
} from "../services/api";

export function VisibilityView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlWebsiteId = searchParams.get("website_id") || "";

  const [websites, setWebsites] = useState<Website[]>([]);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string>(urlWebsiteId);
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>("test_fixture");
  const [jobs, setJobs] = useState<VisibilityJob[]>([]);
  const [currentJob, setCurrentJob] = useState<VisibilityJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [filterMode, setFilterMode] = useState<"all" | "brand" | "competitor" | "gap">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedSummary, setCopiedSummary] = useState(false);

  useEffect(() => {
    loadInitial();
  }, []);

  useEffect(() => {
    if (selectedWebsiteId) {
      loadJobsForSite(selectedWebsiteId);
    }
  }, [selectedWebsiteId]);

  async function loadInitial() {
    try {
      const [siteList, provList] = await Promise.all([
        fetchWebsites(),
        fetchProviders(),
      ]);
      setWebsites(siteList);
      setProviders(provList);
      if (siteList.length > 0) {
        const activeSite = selectedWebsiteId || siteList[0].id;
        setSelectedWebsiteId(activeSite);
        await loadJobsForSite(activeSite);
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadJobsForSite(siteId: string) {
    try {
      const jobList = await fetchVisibilityJobs(siteId);
      setJobs(jobList);
      if (jobList.length > 0) {
        const details = await fetchVisibilityJobDetails(jobList[0].id);
        setCurrentJob(details);
      } else {
        setCurrentJob(null);
      }
    } catch {
      setCurrentJob(null);
    }
  }

  async function handleRunJob() {
    if (!selectedWebsiteId) return;
    setRunning(true);
    try {
      const isFixture = selectedProvider === "test_fixture";
      const newJob = await runVisibilityJob(selectedWebsiteId, selectedProvider, isFixture);
      const full = await fetchVisibilityJobDetails(newJob.id);
      setCurrentJob(full);
      setJobs((prev) => [newJob, ...prev]);
    } catch (err: any) {
      alert(`Visibility run failed: ${err?.response?.data?.detail || err.message}`);
    } finally {
      setRunning(false);
    }
  }

  async function selectJob(jobId: string) {
    try {
      setLoading(true);
      const full = await fetchVisibilityJobDetails(jobId);
      setCurrentJob(full);
    } finally {
      setLoading(false);
    }
  }

  const copySummary = () => {
    if (!currentJob) return;
    const summary = `### AI Search Visibility Audit Summary\n**Provider:** ${currentJob.provider_name}\n**Brand Mention Rate:** ${currentJob.brand_mention_rate.toFixed(1)}%\n**Citations Logged:** ${currentJob.citations_count}\n**Competitor References:** ${currentJob.competitor_mentions_count}\n**Competitor-Only Gaps:** ${currentJob.questions_with_competitor_without_brand}\n\nObserved Queries:\n` +
      (currentJob.observations || [])
        .map(
          (o, i) =>
            `${i + 1}. **${o.query_text}** - Brand Mentioned: ${o.brand_mentioned ? "Yes" : "No"}`
        )
        .join("\n");
    navigator.clipboard.writeText(summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const filteredObservations = (currentJob?.observations || []).filter((obs) => {
    const matchesSearch = obs.query_text.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterMode === "brand") return obs.brand_mentioned;
    if (filterMode === "competitor") return obs.competitor_mentions.length > 0;
    if (filterMode === "gap") return !obs.brand_mentioned && obs.competitor_mentions.length > 0;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-info/10 text-info border border-info/20">
              Capability B
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text">AI Search & Engine Visibility</h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Measures whether your brand is mentioned or cited in real external search and AI engine queries.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {currentJob && (
            <Button
              variant="secondary"
              onClick={copySummary}
              className="text-xs flex items-center gap-1.5"
            >
              {copiedSummary ? (
                <>
                  <Check className="w-3.5 h-3.5 text-success" /> Copied Summary!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy Summary
                </>
              )}
            </Button>
          )}
          <Button
            variant="primary"
            onClick={handleRunJob}
            disabled={running || !selectedWebsiteId}
            className="flex items-center gap-1.5 text-xs shadow-sm"
          >
            {running ? <LoadingSpinner className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{running ? "Querying Providers..." : "Run Visibility Audit"}</span>
          </Button>
        </div>
      </div>

      {/* Provider Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {providers.map((p) => (
          <Card key={p.provider_name} className="p-4 bg-surface border-border hover:border-primary/20 transition shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold uppercase tracking-wider text-text">
                {p.provider_name.replace("_", " ")}
              </span>
              <Badge variant={p.is_configured ? "success" : "secondary"}>
                {p.is_configured ? "Live Configured" : "Fixture / Off"}
              </Badge>
            </div>
            <p className="text-xs text-muted mt-2 leading-relaxed">{p.description}</p>
            <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted">
              <span>Required Key:</span>
              <code className="text-text font-mono text-[11px] px-1 py-0.5 rounded bg-muted/10">
                {p.requires_key}
              </code>
            </div>
          </Card>
        ))}
      </div>

      {/* Controls Card */}
      <Card className="p-4 bg-surface border-border">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label>Website</Label>
            <Select
              value={selectedWebsiteId}
              onChange={(e) => {
                setSelectedWebsiteId(e.target.value);
                setSearchParams({ website_id: e.target.value });
              }}
            >
              {websites.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.domain})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label>Data Provider</Label>
            <Select value={selectedProvider} onChange={(e) => setSelectedProvider(e.target.value)}>
              <option value="test_fixture">Test Fixture (Built-in Demo / Verification)</option>
              <option value="tavily">Tavily Search API (Live)</option>
              <option value="serpapi">SerpAPI Google Search (Live)</option>
            </Select>
          </div>

          <div>
            <Label>Observation History</Label>
            <Select
              value={currentJob?.id || ""}
              onChange={(e) => selectJob(e.target.value)}
              disabled={jobs.length === 0}
            >
              {jobs.length === 0 && <option value="">No previous records</option>}
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {new Date(j.created_at).toLocaleString()} — {j.provider_name} ({j.brand_mention_rate}% mentions)
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {/* Visibility Job Results */}
      {loading ? (
        <div className="flex flex-col justify-center items-center p-12 gap-3">
          <LoadingSpinner className="w-8 h-8 text-primary" />
          <span className="text-xs text-muted">Loading observation records...</span>
        </div>
      ) : !currentJob ? (
        <Card className="p-8 text-center bg-surface border-border">
          <EmptyState
            title="No Visibility Observations Recorded"
            description="Select a provider and click 'Run Visibility Audit' to query external search and answer providers."
            icon={<Eye className="w-10 h-10 text-secondary" />}
            action={
              <Button variant="primary" onClick={handleRunJob} disabled={running}>
                Record Initial Observations
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Synthetic Fixture Notice */}
          {!currentJob.is_live_provider && (
            <div className="p-3.5 rounded-xl border border-accent/30 bg-accent/10 text-text text-xs flex items-center gap-2.5 shadow-sm">
              <Info className="w-4 h-4 text-accent shrink-0" />
              <span>
                <b className="text-accent">Deterministic Verification Fixture:</b> These observations are generated by the verification fixture for testing. Live external API credentials were not used for this recording.
              </span>
            </div>
          )}

          {/* Metric Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 bg-surface border-border hover:border-primary/30 transition shadow-sm">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">Brand Mention Rate</span>
              <div className="mt-2 text-3xl font-bold text-text">
                {currentJob.brand_mention_rate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted mt-2">
                {currentJob.brand_mentions_count} of {currentJob.total_questions} questions
              </p>
            </Card>

            <Card className="p-5 bg-surface border-border hover:border-accent/30 transition shadow-sm">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">Citations Logged</span>
              <div className="mt-2 text-3xl font-bold text-accent">{currentJob.citations_count}</div>
              <p className="text-xs text-muted mt-2">Direct source references</p>
            </Card>

            <Card className="p-5 bg-surface border-border hover:border-warning/30 transition shadow-sm">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">Competitor References</span>
              <div className="mt-2 text-3xl font-bold text-warning">{currentJob.competitor_mentions_count}</div>
              <p className="text-xs text-muted mt-2">Competitor brands mentioned</p>
            </Card>

            <Card className="p-5 bg-surface border-border hover:border-danger/30 transition shadow-sm">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">Competitor Only Mentions</span>
              <div className="mt-2 text-3xl font-bold text-danger">
                {currentJob.questions_with_competitor_without_brand}
              </div>
              <p className="text-xs text-muted mt-2">Questions where rival appeared alone</p>
            </Card>
          </div>

          {/* AI Engine Comparison Simulator */}
          <AiEngineSimulator />

          {/* Observations List with Search & Filter Tabs */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-lg font-bold text-text">
                  Query Observations ({currentJob.observations?.length || 0})
                </h2>
                <p className="text-xs text-muted">Audited search engine responses and source citations</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-44">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-muted" />
                  <Input
                    placeholder="Search queries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 text-xs py-1.5"
                  />
                </div>
                <div className="flex items-center gap-1 border border-border rounded-lg p-0.5 bg-background text-xs">
                  <button
                    onClick={() => setFilterMode("all")}
                    className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition ${
                      filterMode === "all" ? "bg-primary text-primary-contrast" : "text-muted hover:text-text"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterMode("brand")}
                    className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition ${
                      filterMode === "brand" ? "bg-primary text-primary-contrast" : "text-muted hover:text-text"
                    }`}
                  >
                    Brand
                  </button>
                  <button
                    onClick={() => setFilterMode("gap")}
                    className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition ${
                      filterMode === "gap" ? "bg-danger text-primary-contrast" : "text-muted hover:text-text"
                    }`}
                  >
                    Gap (Rival Only)
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {filteredObservations.length === 0 ? (
                <Card className="p-6 text-center text-xs text-muted">
                  No observations match the selected filter.
                </Card>
              ) : (
                filteredObservations.map((obs, idx) => (
                  <Card key={obs.id || idx} className="p-5 bg-surface border-border hover:border-primary/20 transition shadow-sm space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted">Q{idx + 1}:</span>
                        <h3 className="text-sm font-bold text-text">{obs.query_text}</h3>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge variant={obs.brand_mentioned ? "success" : "danger"}>
                          {obs.brand_mentioned ? "Brand Mentioned" : "No Brand Mention"}
                        </Badge>
                        <Badge variant="secondary">{obs.provider_name}</Badge>
                      </div>
                    </div>

                    {obs.raw_response_snippet && (
                      <div className="p-3 rounded-lg bg-background border border-border text-xs text-muted">
                        <span className="font-semibold text-text block mb-1">Answer Summary / Overview:</span>
                        <p className="leading-relaxed font-sans">{obs.raw_response_snippet}</p>
                      </div>
                    )}

                    {/* Mentions & Citations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                      <div>
                        <span className="font-semibold text-text block mb-1">Competitor Mentions:</span>
                        {obs.competitor_mentions.length > 0 ? (
                          <div className="space-y-1">
                            {obs.competitor_mentions.map((c, i) => (
                              <div key={i} className="flex items-center gap-1.5 text-warning">
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                <span>
                                  <b className="text-text">{c.competitor}:</b> {c.snippet}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted">None detected in response</p>
                        )}
                      </div>

                      <div>
                        <span className="font-semibold text-text block mb-1">Cited Domains & Sources:</span>
                        {obs.citations.length > 0 ? (
                          <ul className="space-y-1">
                            {obs.citations.map((cit, i) => (
                              <li key={i} className="flex items-center justify-between text-muted">
                                <span className="truncate max-w-[200px] font-mono text-[11px]">
                                  #{cit.position} {cit.cited_domain}
                                </span>
                                <Badge variant={cit.matches_brand_domain ? "success" : "secondary"}>
                                  {cit.matches_brand_domain ? "Brand Link" : "Third Party"}
                                </Badge>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-muted">No citations recorded</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
