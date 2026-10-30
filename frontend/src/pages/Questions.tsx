import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  HelpCircle,
  Plus,
  Trash2,
  Search,
  Filter,
  Sparkles,
  Layers,
  ArrowRight,
  Tag,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input, Select, Label, Textarea } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import {
  fetchWebsites,
  fetchQuestions,
  createQuestion,
  createQuestionsBatch,
  deleteQuestion,
  type Website,
  type TargetQuestion,
} from "../services/api";

export function Questions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlWebsiteId = searchParams.get("website_id") || "";

  const [websites, setWebsites] = useState<Website[]>([]);
  const [questions, setQuestions] = useState<TargetQuestion[]>([]);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string>(urlWebsiteId);
  const [intentFilter, setIntentFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Modal / Form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [batchMode, setBatchMode] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [batchTexts, setBatchTexts] = useState("");
  const [questionIntent, setQuestionIntent] = useState("unknown");
  const [questionPriority, setQuestionPriority] = useState<"critical" | "high" | "medium" | "low">("medium");
  const [topic, setTopic] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedWebsiteId]);

  async function loadData() {
    setLoading(true);
    try {
      const [wList, qList] = await Promise.all([
        fetchWebsites(),
        fetchQuestions(selectedWebsiteId || undefined),
      ]);
      setWebsites(wList);
      setQuestions(qList);
      if (!selectedWebsiteId && wList.length > 0) {
        setSelectedWebsiteId(wList[0].id);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleAddQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedWebsiteId) {
      alert("Please select or add a website first.");
      return;
    }
    setSubmitting(true);

    try {
      if (batchMode) {
        const lines = batchTexts
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);
        await createQuestionsBatch({
          website_id: selectedWebsiteId,
          questions: lines,
          topic: topic || undefined,
        });
        setBatchTexts("");
      } else {
        await createQuestion({
          website_id: selectedWebsiteId,
          text: questionText,
          intent: questionIntent as any,
          priority: questionPriority,
          topic: topic || undefined,
        });
        setQuestionText("");
      }
      setShowAddModal(false);
      await loadData();
    } catch (err: any) {
      alert(`Error saving question: ${err?.response?.data?.detail || err.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to remove this target question?")) return;
    try {
      await deleteQuestion(id);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch {
      alert("Failed to delete question");
    }
  }

  // Filtered list
  const filteredQuestions = questions.filter((q) => {
    if (intentFilter && q.intent !== intentFilter) return false;
    if (priorityFilter && q.priority !== priorityFilter) return false;
    if (searchQuery && !q.text.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const intentBadgeVariant = (intent: string): "primary" | "info" | "warning" | "success" | "secondary" => {
    switch (intent) {
      case "informational":
        return "info";
      case "commercial_investigation":
        return "primary";
      case "transactional":
        return "success";
      case "navigational":
        return "warning";
      default:
        return "secondary";
    }
  };

  const criticalCount = questions.filter((q) => q.priority === "critical").length;
  const informationalCount = questions.filter((q) => q.intent === "informational").length;
  const commercialCount = questions.filter((q) => q.intent === "commercial_investigation").length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              Query Intelligence
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text">Target Questions</h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Questions potential customers ask search and answer engines that your content should answer directly.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 text-xs shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Questions
        </Button>
      </div>

      {/* Quick Intent Stat Strip */}
      {questions.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl border border-border bg-surface flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Total Questions</span>
              <div className="text-xl font-extrabold text-text mt-0.5">{questions.length}</div>
            </div>
            <HelpCircle className="w-5 h-5 text-primary opacity-60" />
          </div>

          <div className="p-3.5 rounded-xl border border-border bg-surface flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Critical Priority</span>
              <div className="text-xl font-extrabold text-danger mt-0.5">{criticalCount}</div>
            </div>
            <AlertTriangle className="w-5 h-5 text-danger opacity-60" />
          </div>

          <div className="p-3.5 rounded-xl border border-border bg-surface flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Informational</span>
              <div className="text-xl font-extrabold text-info mt-0.5">{informationalCount}</div>
            </div>
            <Tag className="w-5 h-5 text-info opacity-60" />
          </div>

          <div className="p-3.5 rounded-xl border border-border bg-surface flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Commercial</span>
              <div className="text-xl font-extrabold text-primary mt-0.5">{commercialCount}</div>
            </div>
            <Sparkles className="w-5 h-5 text-primary opacity-60" />
          </div>
        </div>
      )}

      {/* Filter Toolbar Card */}
      <Card className="p-4 bg-surface border-border shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div>
            <Label>Associated Website</Label>
            <Select
              value={selectedWebsiteId}
              onChange={(e) => {
                setSelectedWebsiteId(e.target.value);
                setSearchParams(e.target.value ? { website_id: e.target.value } : {});
              }}
            >
              <option value="">All Websites</option>
              {websites.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.domain})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label>Search Intent</Label>
            <Select value={intentFilter} onChange={(e) => setIntentFilter(e.target.value)}>
              <option value="">All Intents</option>
              <option value="informational">Informational</option>
              <option value="commercial_investigation">Commercial Investigation</option>
              <option value="transactional">Transactional</option>
              <option value="navigational">Navigational</option>
              <option value="unknown">Unknown</option>
            </Select>
          </div>

          <div>
            <Label>Priority</Label>
            <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Select>
          </div>

          <div>
            <Label>Search Query</Label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted pointer-events-none" />
              <Input
                className="pl-9 text-xs"
                placeholder="Filter questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Add Questions Modal */}
      {showAddModal && (
        <Card className="p-6 md:p-8 bg-surface border-border shadow-elevated">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4 mb-5">
            <div>
              <h2 className="text-base font-bold text-text">
                {batchMode ? "Batch Import Target Questions" : "Add Target User Query"}
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Questions are evaluated against crawled website content for direct answers and schema.
              </p>
            </div>
            <button
              onClick={() => setBatchMode(!batchMode)}
              className="text-xs text-primary font-semibold hover:underline flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>{batchMode ? "Switch to Single Entry" : "Switch to Batch Import"}</span>
            </button>
          </div>

          <form onSubmit={handleAddQuestion} className="space-y-4">
            <div>
              <Label>Target Website</Label>
              <Select
                required
                value={selectedWebsiteId}
                onChange={(e) => setSelectedWebsiteId(e.target.value)}
              >
                <option value="" disabled>
                  Select a website
                </option>
                {websites.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.domain})
                  </option>
                ))}
              </Select>
            </div>

            {batchMode ? (
              <div>
                <Label>Question List (one query per line)</Label>
                <Textarea
                  required
                  rows={6}
                  placeholder={`What is the pricing model for your product?\nHow does the API integration work?\nWhat are the top alternatives?`}
                  value={batchTexts}
                  onChange={(e) => setBatchTexts(e.target.value)}
                />
                <p className="text-[11px] text-muted mt-1.5">
                  Search intent will be automatically categorized by our classification engine.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <Label>Question Text</Label>
                  <Input
                    required
                    placeholder="e.g. How does Answer Engine Optimization improve brand visibility?"
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Search Intent</Label>
                    <Select value={questionIntent} onChange={(e) => setQuestionIntent(e.target.value)}>
                      <option value="unknown">Auto-Classify / Unknown</option>
                      <option value="informational">Informational</option>
                      <option value="commercial_investigation">Commercial Investigation</option>
                      <option value="transactional">Transactional</option>
                      <option value="navigational">Navigational</option>
                    </Select>
                  </div>

                  <div>
                    <Label>Priority</Label>
                    <Select
                      value={questionPriority}
                      onChange={(e) => setQuestionPriority(e.target.value as any)}
                    >
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </Select>
                  </div>
                </div>
              </>
            )}

            <div>
              <Label>Topic or Category (Optional)</Label>
              <Input
                placeholder="e.g. Pricing, Security, Integration"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
              <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? "Saving..." : "Save Questions"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Questions Data Table */}
      {loading ? (
        <div className="flex flex-col justify-center items-center p-16 gap-3">
          <LoadingSpinner className="w-8 h-8 text-primary" />
          <span className="text-xs text-muted uppercase font-semibold">Loading Target Questions...</span>
        </div>
      ) : filteredQuestions.length === 0 ? (
        <Card className="p-10 text-center bg-surface border-border">
          <EmptyState
            title="No Questions Match Current Filters"
            description="Add questions your target audience might ask, or adjust your active filters above."
            icon={<HelpCircle className="w-10 h-10 text-primary" />}
            action={
              <Button variant="primary" onClick={() => setShowAddModal(true)}>
                Add Question
              </Button>
            }
          />
        </Card>
      ) : (
        <Card className="overflow-hidden bg-surface border-border shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface-hover/70 text-[11px] font-bold uppercase tracking-wider text-muted">
                  <th className="py-3 px-5">Target Query</th>
                  <th className="py-3 px-4">Search Intent</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredQuestions.map((q) => (
                  <tr key={q.id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-text max-w-md">
                      {q.text}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={intentBadgeVariant(q.intent)}>
                        {q.intent.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-muted font-medium">
                      {q.topic || "General"}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          q.priority === "critical"
                            ? "danger"
                            : q.priority === "high"
                            ? "warning"
                            : "secondary"
                        }
                      >
                        {q.priority}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="text-muted hover:text-danger p-1.5 rounded-lg hover:bg-surface-hover transition cursor-pointer"
                        title="Delete question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3.5 border-t border-border bg-surface text-xs text-muted font-medium flex justify-between items-center">
            <span>Showing {filteredQuestions.length} of {questions.length} questions</span>
            <span className="text-[11px] text-muted">Ready for Answer-Readiness Audit</span>
          </div>
        </Card>
      )}
    </div>
  );
}
