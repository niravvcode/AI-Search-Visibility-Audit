import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FileText,
  Download,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  FileSpreadsheet,
  FileCheck2,
  Eye,
  Info,
} from "lucide-react";

import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Select, Label } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import {
  fetchWebsites,
  fetchReportSummary,
  getExportCsvUrl,
  getExportPdfUrl,
  type Website,
  type ReportSummary,
} from "../services/api";

export function ReportsView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlWebsiteId = searchParams.get("website_id") || "";

  const [websites, setWebsites] = useState<Website[]>([]);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string>(urlWebsiteId);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWebsites();
  }, []);

  useEffect(() => {
    if (selectedWebsiteId) {
      loadReport(selectedWebsiteId);
    }
  }, [selectedWebsiteId]);

  async function loadWebsites() {
    try {
      const siteList = await fetchWebsites();
      setWebsites(siteList);
      if (siteList.length > 0) {
        const active = selectedWebsiteId || siteList[0].id;
        setSelectedWebsiteId(active);
        await loadReport(active);
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadReport(siteId: string) {
    try {
      setLoading(true);
      const data = await fetchReportSummary(siteId);
      setSummary(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const activeWebsite = websites.find((w) => w.id === selectedWebsiteId);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              Executive Briefings
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text">
            Audit Reports &amp; Exports
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Download comprehensive audit reports in CSV and PDF formats containing verified evidence and recommendations.
          </p>
        </div>

        {summary?.latest_audit && (
          <div className="flex flex-wrap items-center gap-2.5">
            <a href={getExportCsvUrl(summary.latest_audit.id)} download>
              <Button variant="secondary" className="flex items-center gap-2 text-xs py-2 px-3.5">
                <FileSpreadsheet className="w-4 h-4 text-success" />
                <span>Export CSV</span>
              </Button>
            </a>
            <a href={getExportPdfUrl(summary.latest_audit.id)} download>
              <Button variant="primary" className="flex items-center gap-2 text-xs py-2 px-4 shadow-sm">
                <Download className="w-4 h-4" />
                <span>Export PDF</span>
              </Button>
            </a>
          </div>
        )}
      </div>

      {/* Website Selector */}
      <Card className="p-4 bg-surface border-border shadow-sm">
        <div className="max-w-md">
          <Label>Select Target Website</Label>
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
      </Card>

      {/* Report Summary */}
      {loading ? (
        <div className="flex flex-col justify-center items-center p-16 gap-3">
          <LoadingSpinner className="w-8 h-8 text-primary" />
          <span className="text-xs text-muted uppercase font-semibold">Generating Executive Summary...</span>
        </div>
      ) : !summary || (!summary.latest_audit && !summary.latest_visibility) ? (
        <Card className="p-10 text-center bg-surface border-border">
          <EmptyState
            title="No Completed Audits Found"
            description="Run a website answer-readiness audit or visibility check first to generate a full report."
            icon={<FileText className="w-10 h-10 text-primary" />}
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Executive Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Capability A card */}
            <Card hoverable className="p-6 bg-surface border-border shadow-card space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <Badge variant="primary" dot>Capability A</Badge>
                  <h3 className="text-base font-bold text-text">Website Answer-Readiness</h3>
                </div>
                {summary.latest_audit && (
                  <Badge
                    variant={
                      summary.latest_audit.overall_score >= 75
                        ? "success"
                        : summary.latest_audit.overall_score >= 50
                        ? "warning"
                        : "danger"
                    }
                  >
                    {summary.latest_audit.overall_score.toFixed(1)} / 100
                  </Badge>
                )}
              </div>

              {summary.latest_audit ? (
                <div className="space-y-3 text-xs text-muted">
                  <div className="p-3.5 rounded-xl bg-background border border-border space-y-1.5">
                    <div className="flex justify-between">
                      <span>Questions Analyzed:</span>
                      <b className="text-text">{summary.latest_audit.questions_analyzed}</b>
                    </div>
                    <div className="flex justify-between">
                      <span>Direct Answers Confirmed:</span>
                      <b className="text-success">{summary.latest_audit.answered_count}</b>
                    </div>
                    <div className="flex justify-between">
                      <span>Unanswered Gaps:</span>
                      <b className="text-danger">{summary.latest_audit.unanswered_count}</b>
                    </div>
                  </div>
                  <p className="leading-relaxed">
                    Evaluated tier status:{" "}
                    <b className="capitalize text-text">{summary.latest_audit.readiness_level}</b> with{" "}
                    {(summary.latest_audit.confidence_score * 100).toFixed(0)}% algorithm confidence.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted">No answer-readiness audit run yet.</p>
              )}
            </Card>

            {/* Capability B card */}
            <Card hoverable className="p-6 bg-surface border-border shadow-card space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <Badge variant="info" dot>Capability B</Badge>
                  <h3 className="text-base font-bold text-text">AI Search Visibility</h3>
                </div>
                {summary.latest_visibility && (
                  <Badge variant="secondary">
                    {summary.latest_visibility.brand_mention_rate.toFixed(1)}% Mentions
                  </Badge>
                )}
              </div>

              {summary.latest_visibility ? (
                <div className="space-y-3 text-xs text-muted">
                  <div className="p-3.5 rounded-xl bg-background border border-border space-y-1.5">
                    <div className="flex justify-between">
                      <span>Observed Questions:</span>
                      <b className="text-text">{summary.latest_visibility.total_questions}</b>
                    </div>
                    <div className="flex justify-between">
                      <span>Brand Mentions Logged:</span>
                      <b className="text-primary">{summary.latest_visibility.brand_mentions_count}</b>
                    </div>
                    <div className="flex justify-between">
                      <span>Citations Documented:</span>
                      <b className="text-accent">{summary.latest_visibility.citations_count}</b>
                    </div>
                  </div>
                  <p className="leading-relaxed">
                    Active Provider: <b className="text-text">{summary.latest_visibility.provider_name}</b> (
                    {summary.latest_visibility.is_live_provider ? "Live Provider" : "Deterministic Fixture"}).
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted">No visibility observations recorded yet.</p>
              )}
            </Card>
          </div>

          {/* Top Recommendations */}
          {summary.top_recommendations.length > 0 && (
            <Card className="p-6 bg-surface border-border shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-text">Top Content Priorities</h3>
                <span className="text-xs text-muted font-medium">Ranked by Expected Citation Impact</span>
              </div>
              <div className="space-y-3">
                {summary.top_recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-background border border-border flex items-start gap-3.5 hover:border-primary/20 transition"
                  >
                    <span className="font-mono text-xs font-bold text-muted p-1 px-2 rounded-lg bg-surface border border-border shrink-0">
                      #{i + 1}
                    </span>
                    <div className="space-y-1 text-xs flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="warning">{rec.priority.toUpperCase()}</Badge>
                        <span className="font-bold text-text">{rec.issue}</span>
                      </div>
                      <p className="text-muted leading-relaxed pt-0.5">
                        <b className="text-text">Action:</b> {rec.suggested_action}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Data Limitations & Disclosures */}
          <Card className="p-6 bg-surface border-border shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-muted">
              <ShieldAlert className="w-4 h-4 text-warning shrink-0" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-text">
                Audit Scope &amp; Methodological Disclosures
              </h3>
            </div>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-muted leading-relaxed">
              {summary.data_limitations.map((lim, i) => (
                <li key={i}>{lim}</li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}
