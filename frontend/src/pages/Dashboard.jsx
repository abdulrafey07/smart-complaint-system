import { AlertTriangle, ChartNoAxesColumnIncreasing, CheckCircle2, ClipboardList, PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import complaintApi from "../api/complaintApi.js";
import AnalyticsBarList from "../components/AnalyticsBarList.jsx";
import ComplaintCard from "../components/ComplaintCard.jsx";
import EmptyState from "../components/EmptyState.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import StatCard from "../components/StatCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { formatStatus, getErrorMessage } from "../utils/formatters.js";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadDashboard = async () => {
      try {
        const [statsResponse, complaintsResponse] = await Promise.all([
          complaintApi.getStats(),
          complaintApi.getComplaints({ limit: 5 })
        ]);

        if (!ignore) {
          setStats(statsResponse.data);
          setRecent(complaintsResponse.data.complaints);
        }
      } catch (err) {
        if (!ignore) setError(getErrorMessage(err));
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadDashboard();
    return () => {
      ignore = true;
    };
  }, []);

  if (loading) return <LoadingSpinner label="Loading dashboard" />;

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 rounded-lg border border-slate-200 bg-white px-5 py-5 shadow-soft md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase text-teal-700">Welcome, {user?.name}</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950 md:text-3xl">Complaint Operations Dashboard</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Register complaints, monitor status movement, and use AI recommendations for routing and response drafting.
          </p>
        </div>
        <Link to="/complaints/new" className="btn-primary">
          <PlusCircle className="h-4 w-4" aria-hidden="true" />
          Register Complaint
        </Link>
      </section>

      {error ? <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total complaints" value={stats?.total} />
        <StatCard label="Pending complaints" value={stats?.pending} accent="amber" />
        <StatCard label="Resolved complaints" value={stats?.resolved} accent="emerald" />
        <StatCard label="High priority complaints" value={stats?.highPriority} accent="red" />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel p-5">
          <div className="flex items-center gap-2">
            <ChartNoAxesColumnIncreasing className="h-5 w-5 text-teal-700" aria-hidden="true" />
            <h2 className="text-lg font-bold text-slate-950">Complaint Status Visualization</h2>
          </div>
          <div className="mt-5">
            <AnalyticsBarList
              items={stats?.byStatus}
              total={stats?.total}
              formatter={formatStatus}
              emptyLabel="No status data yet."
            />
          </div>
        </div>

        <div className="panel p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden="true" />
            <h2 className="text-lg font-bold text-slate-950">Category-wise Statistics</h2>
          </div>
          <div className="mt-5">
            <AnalyticsBarList items={stats?.byCategory} total={stats?.total} emptyLabel="No category data yet." />
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-950">Recent Complaints</h2>
            <Link to="/complaints" className="text-sm font-semibold text-teal-700 hover:text-teal-900">
              View all
            </Link>
          </div>

          {recent.length ? (
            recent.map((complaint) => <ComplaintCard key={complaint._id} complaint={complaint} />)
          ) : (
            <EmptyState
              title="No complaints registered"
              message="Create the first complaint to see AI urgency, department routing, and tracking here."
              actionLabel="Register Complaint"
              actionTo="/complaints/new"
            />
          )}
        </div>

        <aside className="space-y-4">
          <div className="panel p-5">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-teal-700" aria-hidden="true" />
              <h2 className="text-lg font-bold text-slate-950">Analytics Summary</h2>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
                <span className="text-sm font-medium text-slate-700">Open workload</span>
                <span className="text-sm font-bold text-slate-950">{stats?.open ?? 0}</span>
              </div>
              <div className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
                <span className="text-sm font-medium text-slate-700">Critical priority</span>
                <span className="text-sm font-bold text-slate-950">{stats?.critical ?? 0}</span>
              </div>
              <div className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
                <span className="text-sm font-medium text-slate-700">Resolution rate</span>
                <span className="text-sm font-bold text-slate-950">
                  {stats?.total ? Math.round(((stats?.resolved ?? 0) / stats.total) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>

          <div className="panel p-5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden="true" />
              <h2 className="text-lg font-bold text-slate-950">AI Coverage</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Every new complaint is analyzed for urgency, responsible department, citizen response, and summary. If no API key is configured, the app uses deterministic local routing.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default Dashboard;
