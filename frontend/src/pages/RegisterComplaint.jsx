import { Bot, MapPin, Send } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import complaintApi from "../api/complaintApi.js";
import { CATEGORIES } from "../utils/constants.js";
import { getErrorMessage } from "../utils/formatters.js";

const initialForm = {
  title: "",
  description: "",
  category: "Sanitation",
  location: {
    address: "",
    city: "",
    state: "",
    pincode: ""
  }
};

const RegisterComplaint = () => {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name.startsWith("location.")) {
      const key = name.split(".")[1];
      setForm((current) => ({
        ...current,
        location: { ...current.location, [key]: value }
      }));
      return;
    }
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const { data } = await complaintApi.createComplaint(form);
      navigate(`/complaints/${data.complaint._id}/ai`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white px-5 py-5 shadow-soft">
        <h1 className="text-2xl font-bold text-slate-950 md:text-3xl">Register Complaint</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Submit a complaint with clear location details. AI analysis runs immediately after registration.
        </p>
      </section>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="panel p-5">
          {error ? <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

          <div className="grid gap-5">
            <label>
              <span className="form-label">Complaint title</span>
              <input className="form-input mt-1" name="title" value={form.title} onChange={handleChange} required minLength={5} maxLength={140} />
            </label>

            <label>
              <span className="form-label">Category</span>
              <select className="form-input mt-1" name="category" value={form.category} onChange={handleChange}>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="form-label">Description</span>
              <textarea
                className="form-input mt-1 min-h-40 resize-y"
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                minLength={20}
                maxLength={3000}
              />
            </label>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="panel p-5">
            <div className="mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-teal-700" aria-hidden="true" />
              <h2 className="text-lg font-bold text-slate-950">Location</h2>
            </div>

            <div className="space-y-4">
              <label>
                <span className="form-label">Address</span>
                <input className="form-input mt-1" name="location.address" value={form.location.address} onChange={handleChange} required />
              </label>

              <label>
                <span className="form-label">City</span>
                <input className="form-input mt-1" name="location.city" value={form.location.city} onChange={handleChange} required />
              </label>

              <label>
                <span className="form-label">State</span>
                <input className="form-input mt-1" name="location.state" value={form.location.state} onChange={handleChange} required />
              </label>

              <label>
                <span className="form-label">Pincode</span>
                <input className="form-input mt-1" name="location.pincode" value={form.location.pincode} onChange={handleChange} />
              </label>
            </div>
          </section>

          <section className="panel p-5">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-teal-700" aria-hidden="true" />
              <h2 className="text-lg font-bold text-slate-950">AI Analysis</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              The system detects urgency, recommends a department, drafts a response, and summarizes the issue after submission.
            </p>
            <button type="submit" className="btn-primary mt-5 w-full" disabled={submitting}>
              <Send className="h-4 w-4" aria-hidden="true" />
              {submitting ? "Submitting..." : "Submit Complaint"}
            </button>
          </section>
        </aside>
      </form>
    </div>
  );
};

export default RegisterComplaint;
