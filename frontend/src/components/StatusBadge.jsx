import { PRIORITY_LABELS } from "../utils/constants.js";
import { formatStatus } from "../utils/formatters.js";

const statusClasses = {
  Pending: "border-amber-200 bg-amber-50 text-amber-800",
  submitted: "border-slate-200 bg-slate-100 text-slate-700",
  under_review: "border-blue-200 bg-blue-50 text-blue-700",
  assigned: "border-violet-200 bg-violet-50 text-violet-700",
  in_progress: "border-amber-200 bg-amber-50 text-amber-800",
  resolved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected: "border-red-200 bg-red-50 text-red-700",
  closed: "border-stone-200 bg-stone-100 text-stone-700"
};

const priorityClasses = {
  low: "border-emerald-200 bg-emerald-50 text-emerald-700",
  medium: "border-sky-200 bg-sky-50 text-sky-700",
  high: "border-amber-200 bg-amber-50 text-amber-800",
  critical: "border-red-200 bg-red-50 text-red-700"
};

const StatusBadge = ({ value, type = "status" }) => {
  const classes = type === "priority" ? priorityClasses[value] : statusClasses[value];
  const label = type === "priority" ? PRIORITY_LABELS[value] || value : formatStatus(value);

  return (
    <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${classes || statusClasses.submitted}`}>
      {label}
    </span>
  );
};

export default StatusBadge;
