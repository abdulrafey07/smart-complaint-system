import { useEffect, useState } from "react";
import complaintApi from "../api/complaintApi.js";
import ComplaintCard from "../components/ComplaintCard.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Loader from "../components/Loader.jsx";
import SearchFilter from "../components/SearchFilter.jsx";
import { getErrorMessage } from "../utils/formatters.js";

const ComplaintList = () => {
  const [complaints, setComplaints] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({ location: "", category: "", status: "", q: "" });
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadComplaints = async (page = 1, activeFilters = debouncedFilters) => {
    setLoading(true);
    setError("");

    try {
      const params = Object.fromEntries(
        Object.entries({ ...activeFilters, page, limit: 10 }).filter(([, value]) => value !== "")
      );
      const { data } = await complaintApi.getComplaints(params);
      setComplaints(data.complaints);
      setPagination(data.pagination);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedFilters(filters);
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [filters]);

  useEffect(() => {
    loadComplaints(1, debouncedFilters);
  }, [debouncedFilters]);

  const handleFilterChange = (event) => {
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const applyFilters = (event) => {
    event.preventDefault();
    setDebouncedFilters(filters);
  };

  const clearFilters = () => {
    const next = { location: "", category: "", status: "", q: "" };
    setFilters(next);
    setDebouncedFilters(next);
  };

  const handleDelete = async (complaint) => {
    if (!window.confirm(`Delete complaint "${complaint.title}"?`)) return;
    try {
      await complaintApi.deleteComplaint(complaint._id);
      await loadComplaints(pagination.page, debouncedFilters);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white px-5 py-5 shadow-soft">
        <h1 className="text-2xl font-bold text-slate-950 md:text-3xl">Complaint List</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Search by location, filter by category or status, and open each complaint for tracking or AI analysis.
        </p>
      </section>

      <SearchFilter filters={filters} onChange={handleFilterChange} onSubmit={applyFilters} onClear={clearFilters} />

      {error ? <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      {loading ? (
        <Loader label="Loading complaints" />
      ) : complaints.length ? (
        <section className="space-y-4">
          {complaints.map((complaint) => (
            <ComplaintCard key={complaint._id} complaint={complaint} onDelete={handleDelete} />
          ))}
        </section>
      ) : (
        <EmptyState
          title="No matching complaints"
          message="Try changing the search or filter values, or register a new complaint."
          actionLabel="Register Complaint"
          actionTo="/complaints/new"
        />
      )}

      {pagination.pages > 1 ? (
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
          <p className="text-sm text-slate-600">
            Page {pagination.page} of {pagination.pages} ({pagination.total} complaints)
          </p>
          <div className="flex gap-2">
            <button className="btn-secondary" disabled={pagination.page <= 1} onClick={() => loadComplaints(pagination.page - 1, debouncedFilters)}>
              Previous
            </button>
            <button className="btn-secondary" disabled={pagination.page >= pagination.pages} onClick={() => loadComplaints(pagination.page + 1, debouncedFilters)}>
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ComplaintList;
