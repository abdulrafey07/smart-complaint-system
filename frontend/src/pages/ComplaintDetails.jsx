import { Bot, Calendar, MapPin, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import complaintApi from "../api/complaintApi.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { formatDate, formatStatus, getErrorMessage } from "../utils/formatters.js";

const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const loadComplaint = async () => {
      try {
        const { data } = await complaintApi.getComplaintById(id);
        if (!ignore) setComplaint(data.complaint);
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

  const handleDelete = async () => {
    if (!window.confirm("Delete this complaint?")) return;
    try {
      await complaintApi.deleteComplaint(id);
      navigate("/complaints");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) return <LoadingSpinner label="Loading complaint" />;

  if (!complaint) {
    return <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error || "Complaint not found"}</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white px-5 py-5 shadow-soft">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge value={complaint.status} />
              <StatusBadge value={complaint.priority} type="priority" />
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{complaint.category}</span>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-slate-950 md:text-3xl">{complaint.title}</h1>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" aria-hidden="true" />
                {formatDate(complaint.createdAt)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                {complaint.location?.city}, {complaint.location?.state}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link to={`/complaints/${id}/status`} className="btn-secondary">
              <Pencil className="h-4 w-4" aria-hidden="true" />
              Update Status
            </Link>
            <Link to={`/complaints/${id}/ai`} className="btn-primary">
              <Bot className="h-4 w-4" aria-hidden="true" />
              AI Result
            </Link>
            <button type="button" onClick={handleDelete} className="btn-danger">
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Delete
            </button>
          </div>
        </div>
      </section>

      {error ? <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <article className="panel p-5">
          <h2 className="text-lg font-bold text-slate-950">Complaint Description</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{complaint.description}</p>
        </article>

        <aside className="space-y-6">
          <section className="panel p-5">
            <h2 className="text-lg font-bold text-slate-950">Tracking</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="font-medium text-slate-500">Department</dt>
                <dd className="text-right font-semibold text-slate-900">{complaint.department}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="font-medium text-slate-500">Current status</dt>
                <dd className="text-right font-semibold text-slate-900">{formatStatus(complaint.status)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="font-medium text-slate-500">Complaint ID</dt>
                <dd className="text-right font-mono text-xs text-slate-700">{complaint._id}</dd>
              </div>
            </dl>
          </section>

          <section className="panel p-5">
            <h2 className="text-lg font-bold text-slate-950">Location</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              {complaint.location?.address}
              <br />
              {complaint.location?.city}, {complaint.location?.state}
              {complaint.location?.pincode ? ` - ${complaint.location.pincode}` : ""}
            </p>
          </section>
        </aside>
      </section>

      <section className="panel p-5">
        <h2 className="text-lg font-bold text-slate-950">Status History</h2>
        <div className="mt-5 space-y-4">
          {complaint.statusHistory?.map((item, index) => (
            <div key={`${item.status}-${item.timestamp}-${index}`} className="border-l-2 border-teal-600 pl-4">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge value={item.status} />
                <span className="text-xs font-medium text-slate-500">{formatDate(item.timestamp)}</span>
              </div>
              {item.note ? <p className="mt-2 text-sm text-slate-700">{item.note}</p> : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ComplaintDetails;
