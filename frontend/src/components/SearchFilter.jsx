import { RotateCcw, Search } from "lucide-react";
import { CATEGORIES, STATUSES, STATUS_LABELS } from "../utils/constants.js";

const SearchFilter = ({ filters, onChange, onSubmit, onClear }) => (
  <form onSubmit={onSubmit} className="panel p-5">
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <label className="lg:col-span-2">
        <span className="form-label">Keyword</span>
        <span className="relative mt-1 block">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" aria-hidden="true" />
          <input
            className="form-input pl-10"
            name="q"
            value={filters.q}
            onChange={onChange}
            placeholder="Search title or description"
          />
        </span>
      </label>

      <label>
        <span className="form-label">Location</span>
        <input
          className="form-input mt-1"
          name="location"
          value={filters.location}
          onChange={onChange}
          placeholder="City, state, pincode"
        />
      </label>

      <label>
        <span className="form-label">Category</span>
        <select className="form-input mt-1" name="category" value={filters.category} onChange={onChange}>
          <option value="">All categories</option>
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className="form-label">Status</span>
        <select className="form-input mt-1" name="status" value={filters.status} onChange={onChange}>
          <option value="">All statuses</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </label>
    </div>

    <div className="mt-4 flex flex-wrap gap-2">
      <button type="button" className="btn-secondary" onClick={onClear}>
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        Clear
      </button>
    </div>
  </form>
);

export default SearchFilter;
