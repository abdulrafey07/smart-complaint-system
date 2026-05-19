import { ArrowLeft, Bot, Building2, FileText, RefreshCw, Siren, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import aiApi from "../api/aiApi.js";
import complaintApi from "../api/complaintApi.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { getErrorMessage } from "../utils/formatters.js";

const AnalysisBlock = ({ icon: Icon, title, children }) => (
  <section className="panel p-5">
    <div className="flex items-center gap-2">
      <Icon className="h-5 w-5 text-teal-700" aria-hidden="true" />
      <h2 className="text-lg font-bold text-slate-950">{title}</h2>
    </div>
    <div className="mt-4 text-sm leading-6 text-slate-700">{children}</div>
  </section>
);

const AIAnalysis = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const loadComplaint = async () => {
    setError("");
    try {
      const { data } = await complaintApi.getComplaintById(id);
      setComplaint(data.complaint);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaint();
  }, [id]);

  const rerunAnalysis = async () => {
    setAnalyzing(true);
    setError("");

    try {
      const { data } = await aiApi.analyzeComplaint({
        title: complaint.title,
        description: complaint.description,
        category: complaint.category,
        location: complaint.location
      });
      setComplaint((current) => ({
        ...current,
        priority: data.analysis.urgency,
        department: data.analysis.responsibleDepartment,
        aiAnalysis: {
          urgency: data.analysis.urgency,
          urgencyScore: data.analysis.urgencyScore,
          department: data.analysis.responsibleDepartment,
          summary: data.analysis.summary,
          autoResponse: data.analysis.responseMessage,
          model: data.analysis.model,
          source: data.analysis.source,
          analyzedAt: data.analysis.analyzedAt
        }
      }));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading AI analysis" />;

  if (!complaint) {
    return <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error || "Complaint not found"}</div>;
  }

  const analysis = complaint.aiAnalysis;

  return (
    <div className="space-y-6">
      <Link to={`/complaints/${id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-teal-700">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to complaint
      </Link>

      <section className="rounded-lg border border-slate-200 bg-white px-5 py-5 shadow-soft">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <div className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-teal-700" aria-hidden="true" />
              <p className="text-sm font-semibold uppercase text-teal-700">AI Analysis Result</p>
            </div>
            <h1 className="mt-2 text-2xl font-bold text-slate-950 md:text-3xl">{complaint.title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Urgency detection, department recommendation, automatic response, and summary generated from complaint content.
            </p>
          </div>
          <button type="button" onClick={rerunAnalysis} className="btn-primary" disabled={analyzing}>
            <RefreshCw className={`h-4 w-4 ${analyzing ? "animate-spin" : ""}`} aria-hidden="true" />
            {analyzing ? "Analyzing..." : "Run Analysis"}
          </button>
        </div>
      </section>

      {error ? <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <section className="grid gap-4 md:grid-cols-3">
        <div className="panel p-5">
          <div className="flex items-center gap-2">
            <Siren className="h-5 w-5 text-red-600" aria-hidden="true" />
            <p className="text-sm font-semibold text-slate-500">Urgency</p>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <StatusBadge value={analysis?.urgency || complaint.priority} type="priority" />
            <span className="text-2xl font-bold text-slate-950">{analysis?.urgencyScore ?? 0}/100</span>
          </div>
        </div>

        <div className="panel p-5">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-teal-700" aria-hidden="true" />
            <p className="text-sm font-semibold text-slate-500">Department</p>
          </div>
          <p className="mt-4 text-lg font-bold text-slate-950">{analysis?.department || complaint.department}</p>
        </div>

        <div className="panel p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-600" aria-hidden="true" />
            <p className="text-sm font-semibold text-slate-500">Analysis Source</p>
          </div>
          <p className="mt-4 text-lg font-bold text-slate-950">{analysis?.source === "ai" ? analysis.model : "Local fallback"}</p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <AnalysisBlock icon={FileText} title="Complaint Summary">
          <p>{analysis?.summary || "No summary has been generated yet."}</p>
        </AnalysisBlock>

        <AnalysisBlock icon={Bot} title="Automatic Response">
          <p>{analysis?.autoResponse || "Run analysis to generate a response."}</p>
        </AnalysisBlock>
      </section>
    </div>
  );
};

export default AIAnalysis;
