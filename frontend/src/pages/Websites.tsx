import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Globe,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Search,
  ExternalLink,
  ShieldCheck,
  Building2,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";

import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input, Label } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import {
  fetchWebsites,
  createWebsite,
  deleteWebsite,
  startCrawl,
  type Website,
  type CrawlJob,
} from "../services/api";

export function Websites() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [crawlJobs, setCrawlJobs] = useState<Record<string, CrawlJob>>({});
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [brandAliases, setBrandAliases] = useState("");
  const [competitors, setCompetitors] = useState("");
  const [maxPages, setMaxPages] = useState(15);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadWebsites();
  }, []);

  async function loadWebsites() {
    try {
      setError(null);
      const data = await fetchWebsites();
      setWebsites(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to load websites");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddWebsite(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const aliases = brandAliases
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);
    const compDomains = competitors
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    try {
      await createWebsite({
        name,
        canonical_url: canonicalUrl,
        brand_aliases: aliases,
        competitor_domains: compDomains,
        max_crawl_pages: maxPages,
      });
      setName("");
      setCanonicalUrl("");
      setBrandAliases("");
      setCompetitors("");
      setShowAddForm(false);
      await loadWebsites();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to add website");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to remove this website? Associated audits and pages will be removed.")) {
      return;
    }
    try {
      await deleteWebsite(id);
      await loadWebsites();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to delete website");
    }
  }

  async function handleCrawl(site: Website) {
    try {
      const job = await startCrawl(site.id, site.max_crawl_pages);
      setCrawlJobs((prev) => ({ ...prev, [site.id]: job }));
      alert(`Crawl job started for ${site.domain}! Pages will be extracted in the background.`);
      setTimeout(() => loadWebsites(), 2000);
    } catch (err: any) {
      alert(`Could not start crawl: ${err?.response?.data?.detail || err.message}`);
    }
  }

  const copyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredWebsites = websites.filter(
    (w) =>
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.canonical_url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              Domains &amp; Targets
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text">
            Registered Websites
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Manage your verified domains, brand aliases, and competitor benchmarks for auditing.
          </p>
        </div>

        <Button
          variant={showAddForm ? "secondary" : "primary"}
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 text-xs shadow-sm"
        >
          {showAddForm ? (
            "Cancel"
          ) : (
            <>
              <Plus className="w-4 h-4" /> Add Website
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-danger/30 bg-danger/10 text-danger text-xs font-semibold flex items-center gap-2.5 shadow-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Add Website Form Modal / Panel */}
      {showAddForm && (
        <Card className="p-6 md:p-8 bg-surface border-border shadow-elevated">
          <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
            <div>
              <h2 className="text-base font-bold text-text">Register New Website Target</h2>
              <p className="text-xs text-muted mt-0.5">
                Configure your verified canonical domain, aliases, and competitor domains.
              </p>
            </div>
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <Globe className="w-5 h-5" />
            </span>
          </div>

          <form onSubmit={handleAddWebsite} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label>Brand / Website Name</Label>
                <Input
                  required
                  placeholder="e.g. Asana"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <Label>Canonical URL</Label>
                <Input
                  required
                  type="url"
                  placeholder="https://asana.com"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label>Brand Aliases (comma-separated)</Label>
                <Input
                  placeholder="Asana, Asana App, Asana Inc"
                  value={brandAliases}
                  onChange={(e) => setBrandAliases(e.target.value)}
                />
                <p className="text-[11px] text-muted mt-1.5 leading-normal">
                  Used by our AI observation parser to detect brand mentions in LLM answers.
                </p>
              </div>
              <div>
                <Label>Competitor Domains (comma-separated)</Label>
                <Input
                  placeholder="clickup.com, monday.com, trello.com"
                  value={competitors}
                  onChange={(e) => setCompetitors(e.target.value)}
                />
                <p className="text-[11px] text-muted mt-1.5 leading-normal">
                  Used for competitive content gap analysis and market visibility tracking.
                </p>
              </div>
            </div>

            <div className="w-full sm:w-64">
              <Label>Max Crawl Pages</Label>
              <Input
                type="number"
                min="1"
                max="50"
                value={maxPages}
                onChange={(e) => setMaxPages(parseInt(e.target.value) || 15)}
              />
              <p className="text-[11px] text-muted mt-1.5">
                Safe SSRF-validated crawler limit per audit.
              </p>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
              <Button type="button" variant="secondary" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? "Saving Domain..." : "Save Website"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Search Toolbar */}
      {websites.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted pointer-events-none" />
            <Input
              placeholder="Search websites or domains..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
          <span className="text-xs text-muted font-medium">
            Showing {filteredWebsites.length} of {websites.length} domains
          </span>
        </div>
      )}

      {/* Websites List */}
      {loading ? (
        <div className="flex flex-col justify-center items-center p-16 gap-3">
          <LoadingSpinner className="w-8 h-8 text-primary" />
          <span className="text-xs text-muted uppercase font-semibold">Loading Verified Sites...</span>
        </div>
      ) : websites.length === 0 ? (
        <Card className="p-10 text-center bg-surface border-border">
          <EmptyState
            title="No Websites Added Yet"
            description="Add your first website to start crawling pages and auditing answer readiness."
            icon={<Globe className="w-10 h-10 text-primary" />}
            action={
              <Button variant="primary" onClick={() => setShowAddForm(true)}>
                Add Website
              </Button>
            }
          />
        </Card>
      ) : filteredWebsites.length === 0 ? (
        <Card className="p-8 text-center text-xs text-muted">
          No websites match your search query "{searchQuery}".
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredWebsites.map((site) => (
            <Card key={site.id} hoverable className="p-6 bg-surface border-border shadow-card">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                      {site.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-text leading-tight">{site.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs text-muted font-mono">{site.canonical_url}</span>
                        <button
                          onClick={() => copyUrl(site.canonical_url, site.id)}
                          className="text-muted hover:text-text p-0.5 rounded transition"
                          title="Copy canonical URL"
                        >
                          {copiedId === site.id ? (
                            <Check className="w-3 h-3 text-success" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                    <Badge variant="primary">{site.domain}</Badge>
                  </div>

                  {/* Badges list */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {site.brand_aliases?.map((alias, idx) => (
                      <Badge key={idx} variant="secondary">
                        Alias: {alias}
                      </Badge>
                    ))}
                    {site.competitor_domains?.map((comp, idx) => (
                      <Badge key={idx} variant="warning">
                        Rival: {comp}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions Toolbar */}
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => handleCrawl(site)}
                    className="flex items-center gap-1.5 text-xs py-1.5 px-3"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-primary" />
                    <span>Crawl Pages</span>
                  </Button>

                  <Link to={`/questions?website_id=${site.id}`}>
                    <Button variant="secondary" className="text-xs py-1.5 px-3">
                      Questions
                    </Button>
                  </Link>

                  <Link to={`/audits?website_id=${site.id}`}>
                    <Button variant="primary" className="text-xs py-1.5 px-3.5 shadow-sm">
                      Run Audit
                    </Button>
                  </Link>

                  <button
                    onClick={() => handleDelete(site.id)}
                    className="p-2 text-muted hover:text-danger rounded-lg hover:bg-surface-hover transition cursor-pointer"
                    title="Delete Website"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {site.last_crawled_at && (
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                    <span>Last crawled: {new Date(site.last_crawled_at).toLocaleString()}</span>
                  </div>
                  <span className="text-[11px] font-mono text-muted">Limit: {site.max_crawl_pages} pages</span>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
