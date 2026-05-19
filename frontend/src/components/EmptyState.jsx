import { Inbox } from "lucide-react";
import { Link } from "react-router-dom";

const EmptyState = ({ title, message, actionLabel, actionTo }) => (
  <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
    <Inbox className="mx-auto h-10 w-10 text-slate-400" aria-hidden="true" />
    <h2 className="mt-4 text-lg font-semibold text-slate-900">{title}</h2>
    <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600">{message}</p>
    {actionLabel && actionTo ? (
      <Link to={actionTo} className="btn-primary mt-5">
        {actionLabel}
      </Link>
    ) : null}
  </div>
);

export default EmptyState;
