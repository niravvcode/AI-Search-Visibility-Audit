import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FileCheck2,
  Play,
  Download,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Copy,
  Check,
  Search,
  Filter,
} from "lucide-react";

import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Select, Label, Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { ScoreGauge } from "../components/ui/ScoreGauge";
import { ScoreSimulator } from "../components/audits/ScoreSimulator";
import {
  fetchWebsites,
  fetchAudits,
  fetchAuditDetails,
  runAudit,
  getExportCsvUrl,
  getExportPdfUrl,
  type Website,
  type AnswerReadinessAudit,
  type QuestionAuditResult,
} from "../services/api";

export function AuditView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlWebsiteId = searchParams.get("website_id") || "";

  const [websites, setWebsites] = useState<Website[]>([]);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string>(urlWebsiteId);
  const [audits, setAudits] = useState<AnswerReadinessAudit[]>([]);
  const [currentAudit, setCurrentAudit] = useState<AnswerReadinessAudit | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});
  const [copiedRecs, setCopiedRecs] = useState(false);
  const [questionFilter, setQuestionFilter] = useState("");
  const [intentFilter, setIntentFilter] = useState<string>("all");

  useEffect(() => {
    loadInitial();
  }, []);

  useEffect(() => {
    if (selectedWebsiteId) {
      loadAuditsForSite(selectedWebsiteId);
    }
  }, [selectedWebsiteId]);

  async function loadInitial() {
    try {
      const siteList = await fetchWebsites();
      setWebsites(siteList);
      if (siteList.length > 0) {
        const activeSite = selectedWebsiteId || siteList[0].id;
        setSelectedWebsiteId(activeSite);
        await loadAuditsForSite(activeSite);
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadAuditsForSite(siteId: string) {
    try {
      const auditList = await fetchAudits(siteId);
      setAudits(auditList);
      if (auditList.length > 0) {
        const fullDetails = await fetchAuditDetails(auditList[0].id);
        setCurrentAudit(fullDetails);
      } else {
        setCurrentAudit(null);
      }
    } catch {
      setCurrentAudit(null);
    }
  }

  async function handleRunAudit() {
    if (!selectedWebsiteId || running) return;
    setRunning(true);
    try {
      const newAudit = await runAudit(selectedWebsiteId);
      const fullDetails = await fetchAuditDetails(newAudit.id);
      setCurrentAudit(fullDetails);
      await loadAuditsForSite(selectedWebsiteId);
    } finally {
      setRunning(false);
    }
  }

  async function selectAudit(auditId: string) {
    if (!auditId) return;
    setLoading(true);
    try {
      const fullDetails = await fetchAuditDetails(auditId);
      setCurrentAudit(fullDetails);
    } finally {
      setLoading(false);
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedQuestions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyRecommendations = () => {
    if (!currentAudit?.recommendations) return;
    const text = currentAudit.recommendations
      .map(
        (r, i) =>
          `### ${i + 1}. [${r.priority.toUpperCase()}] ${r.issue}\n` +
          `- **Action:** ${r.suggested_action}\n` +
          `- **Why it helps:** ${r.why_it_helps}\n` +
          `- **Estimated Effort:** ${r.estimated_effort}\n` +
          (r.affected_page_url ? `- **URL:** ${r.affected_page_url}\n` : "")
      )
      .join("\n\n");
    navigator.clipboard.writeText(text);
    setCopiedRecs(true);
    setTimeout(() => setCopiedRecs(false), 2000);
  };

  const getScoreBadge = (score: number) => {
    if (score >= 75) return <Badge variant="success">READY ({score.toFixed(0)})</Badge>;
    if (score >= 45) return <Badge variant="warning">PARTIAL ({score.toFixed(0)})</Badge>;
    return <Badge variant="danger">GAP ({score.toFixed(0)})</Badge>;
  };

  const filteredQuestions = (currentAudit?.question_results || []).filter((qr) => {
    const text = qr.question_text || "";
    const matchesSearch = text.toLowerCase().includes(questionFilter.toLowerCase());
    const matchesIntent = intentFilter === "all" || qr.question_intent === intentFilter;
    return matchesSearch && matchesIntent;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              Capability A
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Website Answer-Readiness Audit</h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Crawl-based factual verification, direct answer extraction, and Schema.org JSON-LD audits.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {currentAudit && (
            <>
              <a href={getExportCsvUrl(currentAudit.id)} download>
                <Button variant="secondary" className="flex items-center gap-1.5 text-xs">
                  <Download className="w-3.5 h-3.5" /> CSV
                </Button>
              </a>
              <a href={getExportPdfUrl(currentAudit.id)} download>
                <Button variant="secondary" className="flex items-center gap-1.5 text-xs">
                  <Download className="w-3.5 h-3.5" /> PDF
                </Button>
              </a>
            </>
          )}

          <Button
            variant="primary"
            onClick={handleRunAudit}
            disabled={running || !selectedWebsiteId}
            className="flex items-center gap-1.5 text-xs shadow-sm"
          >
            {running ? <LoadingSpinner className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{running ? "Analyzing Content..." : "Run Audit"}</span>
          </Button>
        </div>
      </div>

      {/* Website & Audit Selector */}
      <Card className="p-4 bg-surface border-border">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Selected Website</Label>
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
            <Label>Audit History</Label>
            <Select
              value={currentAudit?.id || ""}
              onChange={(e) => selectAudit(e.target.value)}
              disabled={audits.length === 0}
            >
              {audits.length === 0 && <option value="">No previous audits</option>}
              {audits.map((a) => (
                <option key={a.id} value={a.id}>
                  {new Date(a.created_at).toLocaleString()} — Score: {a.overall_score.toFixed(1)} ({a.readiness_level})
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {/* Audit Results View */}
      {loading ? (
        <div className="flex flex-col justify-center items-center p-12 gap-3">
          <LoadingSpinner className="w-8 h-8 text-primary" />
          <span className="text-xs text-muted">Retrieving audit results...</span>
        </div>
      ) : !currentAudit ? (
        <Card className="p-8 text-center bg-surface border-border">
          <EmptyState
            title="No Audits Run Yet"
            description="Ensure the website has crawled pages and target questions, then click 'Run Audit'."
            icon={<FileCheck2 className="w-10 h-10 text-primary" />}
            action={
              <Button variant="primary" onClick={handleRunAudit} disabled={running}>
                Start First Audit
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Score Overview & Radar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left: Overall Score Radial Gauge Card */}
            <Card className="lg:col-span-4 p-6 bg-surface border-border flex flex-col items-center justify-center text-center shadow-sm">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                Overall Content Readiness
              </span>
              <ScoreGauge score={currentAudit.overall_score} size="lg" label="Verified Rubric Score" />
              <div className="mt-4 pt-4 border-t border-border w-full flex justify-between text-xs text-muted">
                <span>Confidence: {(currentAudit.confidence_score * 100).toFixed(0)}%</span>
                <span className="capitalize font-semibold text-text">{currentAudit.readiness_level} Tier</span>
              </div>
            </Card>

            {/* Right: Dimension Cards */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="p-5 bg-surface border-border flex flex-col justify-between hover:border-success/30 transition shadow-sm">
                <div>
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider">Directly Answered</span>
                  <div className="mt-2 text-3xl font-bold text-success">{currentAudit.answered_count}</div>
                </div>
                <p className="text-xs text-muted mt-2">Clear direct answers extracted in first 100 words</p>
              </Card>

              <Card className="p-5 bg-surface border-border flex flex-col justify-between hover:border-warning/30 transition shadow-sm">
                <div>
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider">Partially Answered</span>
                  <div className="mt-2 text-3xl font-bold text-warning">{currentAudit.partially_answered_count}</div>
                </div>
                <p className="text-xs text-muted mt-2">Missing structured data or comprehensive subtopics</p>
              </Card>

              <Card className="p-5 bg-surface border-border flex flex-col justify-between hover:border-danger/30 transition shadow-sm">
                <div>
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider">Unanswered Gaps</span>
                  <div className="mt-2 text-3xl font-bold text-danger">{currentAudit.unanswered_count}</div>
                </div>
                <p className="text-xs text-muted mt-2">No relevant crawled factual content found</p>
              </Card>
            </div>
          </div>

          {/* Interactive What-If Simulator Component */}
          <ScoreSimulator currentScore={Math.round(currentAudit.overall_score)} />

          {/* Question Breakdown with Search and Intent Filters */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-lg font-bold text-text">Target Question Evaluations</h2>
                <p className="text-xs text-muted">Detailed scoring breakdown per target search intent</p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-48">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-muted" />
                  <Input
                    placeholder="Search question..."
                    value={questionFilter}
                    onChange={(e) => setQuestionFilter(e.target.value)}
                    className="pl-8 text-xs py-1.5"
                  />
                </div>
                <Select
                  value={intentFilter}
                  onChange={(e) => setIntentFilter(e.target.value)}
                  className="text-xs py-1.5 w-auto"
                >
                  <option value="all">All Intents</option>
                  <option value="informational">Informational</option>
                  <option value="commercial_investigation">Commercial</option>
                  <option value="transactional">Transactional</option>
                  <option value="navigational">Navigational</option>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              {filteredQuestions.length === 0 ? (
                <Card className="p-6 text-center text-xs text-muted">
                  No questions match your current filter.
                </Card>
              ) : (
                filteredQuestions.map((qr) => {
                  const isExpanded = !!expandedQuestions[qr.id];
                  return (
                    <Card key={qr.id} className="p-4 bg-surface border-border hover:border-primary/30 transition shadow-sm">
                      <div
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 cursor-pointer"
                        onClick={() => toggleExpand(qr.id)}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-text">{qr.question_text}</h3>
                            {getScoreBadge(qr.readiness_score)}
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs text-muted">
                            <span>
                              Intent: <b className="text-text">{qr.question_intent || "unknown"}</b>
                            </span>
                            <span className="text-border">•</span>
                            <span>
                              Status: <b className="capitalize text-text">{qr.status.replace("_", " ")}</b>
                            </span>
                            <span className="text-border">•</span>
                            <span>
                              Schema JSON-LD:{" "}
                              <b className={qr.structured_data_present ? "text-success" : "text-muted"}>
                                {qr.structured_data_present ? "Detected" : "None"}
                              </b>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <Button variant="secondary" className="text-xs px-2.5 py-1">
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </Button>
                        </div>
                      </div>

                      {/* Expanded Evidence & Explanation */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-border space-y-3 text-xs">
                          {qr.direct_answer_snippet && (
                            <div className="p-3 rounded-lg bg-background border border-border">
                              <span className="font-semibold text-text block mb-1">Direct Answer Evidence:</span>
                              <p className="text-muted italic leading-relaxed">"{qr.direct_answer_snippet}"</p>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <span className="font-semibold text-text block mb-1">Relevant Page URLs:</span>
                              {qr.relevant_page_urls.length > 0 ? (
                                <ul className="list-disc list-inside text-muted space-y-0.5">
                                  {qr.relevant_page_urls.map((u, i) => (
                                    <li key={i} className="truncate">
                                      <a
                                        href={u}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-primary hover:underline"
                                      >
                                        {u}
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-muted">No relevant page crawled.</p>
                              )}
                            </div>

                            <div>
                              <span className="font-semibold text-text block mb-1">Missing Subtopics:</span>
                              {qr.missing_subtopics.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {qr.missing_subtopics.map((st, i) => (
                                    <Badge key={i} variant="secondary">
                                      {st}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-success font-medium">Comprehensive coverage</p>
                              )}
                            </div>
                          </div>

                          {qr.explanation && (
                            <p className="text-muted text-xs leading-relaxed pt-1">
                              <b className="text-text">Diagnostic Note:</b> {qr.explanation}
                            </p>
                          )}
                        </div>
                      )}
                    </Card>
                  );
                })
              )}
            </div>
          </div>

          {/* Actionable Recommendations */}
          {currentAudit.recommendations && currentAudit.recommendations.length > 0 && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-text">Prioritized Content Recommendations</h2>
                  <p className="text-xs text-muted">Concrete fixes to maximize AI engine answer readiness</p>
                </div>
                <Button
                  variant="secondary"
                  onClick={copyRecommendations}
                  className="text-xs flex items-center gap-1.5"
                >
                  {copiedRecs ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-success" /> Copied Markdown!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Recommendations
                    </>
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {currentAudit.recommendations.map((rec) => (
                  <Card key={rec.id} className="p-4 bg-surface border-border hover:border-primary/20 transition shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5 w-full">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              rec.priority === "critical"
                                ? "danger"
                                : rec.priority === "high"
                                ? "warning"
                                : "info"
                            }
                          >
                            {rec.priority.toUpperCase()} PRIORITY
                          </Badge>
                          <span className="text-xs text-muted">
                            Effort: <b className="text-text">{rec.estimated_effort}</b>
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-text pt-0.5">{rec.issue}</h4>
                        <p className="text-xs text-muted">
                          <b className="text-text">Suggested Action:</b> {rec.suggested_action}
                        </p>
                        <p className="text-xs text-muted">
                          <b className="text-text">Why it helps:</b> {rec.why_it_helps}
                        </p>
                        {rec.affected_page_url && (
                          <p className="text-xs text-primary font-mono truncate pt-1">
                            Target: {rec.affected_page_url}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
