import { ArrowLeft, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import complaintApi from "../api/complaintApi.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { STATUSES, STATUS_LABELS } from "../utils/constants.js";
import { getErrorMessage } from "../utils/formatters.js";

const StatusUpdate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [form, setForm] = useState({ status: "under_review", note: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadComplaint = async () => {
      try {
        const { data } = await complaintApi.getComplaintById(id);
        if (!ignore) {
          setComplaint(data.complaint);
          setForm((current) => ({ ...current, status: data.complaint.status }));
        }
      } catch (err) {
        if (!ignore) setError(getErrorMessage(err));
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadComplaint();
    return () => {
      ignore = true;
    };
  }, [id]);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await complaintApi.updateComplaintStatus(id, form);
      navigate(`/complaints/${id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading status form" />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to={`/complaints/${id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-teal-700">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to complaint
      </Link>

      <section className="rounded-lg border border-slate-200 bg-white px-5 py-5 shadow-soft">
        <h1 className="text-2xl font-bold text-slate-950 md:text-3xl">Update Complaint Status</h1>
        {complaint ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <StatusBadge value={complaint.status} />
            <span className="text-sm font-semibold text-slate-700">{complaint.title}</span>
          </div>
        ) : null}
      </section>

      <form onSubmit={handleSubmit} className="panel p-5">
        {error ? <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

        <div className="space-y-5">
          <label className="block">
            <span className="form-label">Status</span>
            <select className="form-input mt-1" name="status" value={form.status} onChange={handleChange}>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="form-label">Status note</span>
            <textarea
              className="form-input mt-1 min-h-32 resize-y"
              name="note"
              value={form.note}
              onChange={handleChange}
              maxLength={800}
              placeholder="Add an update for the complaint timeline"
            />
          </label>
        </div>

        <button type="submit" className="btn-primary mt-6" disabled={submitting}>
          <Save className="h-4 w-4" aria-hidden="true" />
          {submitting ? "Saving..." : "Save Status"}
        </button>
      </form>
    </div>
  );
};

export default StatusUpdate;
