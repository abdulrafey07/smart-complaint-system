import { Bot, Calendar, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge.jsx";
import { formatDate } from "../utils/formatters.js";

const ComplaintCard = ({ complaint, onDelete }) => (
  <article className="panel p-5">
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge value={complaint.status} />
          <StatusBadge value={complaint.priority} type="priority" />
          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
            {complaint.category}
          </span>
        </div>
        <Link to={`/complaints/${complaint._id}`} className="mt-3 block text-lg font-semibold text-slate-950 hover:text-teal-700">
          {complaint.title}
        </Link>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{complaint.description}</p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            {complaint.location?.city}, {complaint.location?.state}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-4 w-4" aria-hidden="true" />
            {formatDate(complaint.createdAt)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Bot className="h-4 w-4" aria-hidden="true" />
            {complaint.department}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <Link to={`/complaints/${complaint._id}/status`} className="btn-secondary">
          Update
        </Link>
        <Link to={`/complaints/${complaint._id}/ai`} className="btn-secondary">
          AI Result
        </Link>
        <button type="button" onClick={() => onDelete?.(complaint)} className="btn-danger">
          Delete
        </button>
      </div>
    </div>
  </article>
);

export default ComplaintCard;
