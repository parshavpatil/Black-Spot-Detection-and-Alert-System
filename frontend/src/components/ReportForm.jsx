import React, { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import Spinner from "./Spinner.jsx";
import Alert from "./Alert.jsx";
import { toast } from "react-toastify";

function ReportForm() {
  const { reportForm: form, updateReportForm, resetReportForm, submitReport } = useApp();
  const [localImage, setLocalImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  function validate(values) {
    const nextErrors = {};
    if (!values.location.trim()) nextErrors.location = "Location is required";
    if (!values.description.trim()) nextErrors.description = "Description is required";
    if (!values.severity) nextErrors.severity = "Severity is required";
    return nextErrors;
  }

  function onChange(e) {
    const { name, value, files } = e.target;
    if (name === "image") {
      const file = files && files[0] ? files[0] : null;
      setLocalImage(file);
      updateReportForm({ image: file });
    } else {
      updateReportForm({ [name]: value });
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setMessage("");
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    try {
      setSubmitting(true);
      await submitReport();
      setMessage("Report submitted successfully");
      toast.success("Report submitted successfully");
      resetReportForm();
      setLocalImage(null);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to submit report";
      setMessage(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl mx-auto p-6 space-y-6 card">
      {message && <Alert type="success">{message}</Alert>}

      <div className="relative">
        <input
          id="location"
          name="location"
          type="text"
          value={form.location}
          onChange={onChange}
          className={`input peer placeholder-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.location ? "border-red-500" : ""}`}
          placeholder="Location"
          aria-invalid={Boolean(errors.location)}
          aria-describedby={errors.location ? "location-error" : undefined}
        />
        <label htmlFor="location" className={`absolute left-3 -top-2.5 bg-white px-1 text-xs transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-2 peer-placeholder-shown:left-3 peer-focus:-top-2.5 peer-focus:text-xs ${errors.location ? "text-red-600" : "text-stone-600"}`}>Location</label>
        {errors.location && <p id="location-error" className="text-red-600 text-xs mt-1">{errors.location}</p>}
      </div>

      <div className="relative">
        <textarea
          id="description"
          name="description"
          rows="4"
          value={form.description}
          onChange={onChange}
          className={`input peer placeholder-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.description ? "border-red-500" : ""}`}
          placeholder="Description"
          aria-invalid={Boolean(errors.description)}
          aria-describedby={errors.description ? "description-error" : undefined}
        />
        <label htmlFor="description" className={`absolute left-3 -top-2.5 bg-white px-1 text-xs transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-2 peer-placeholder-shown:left-3 peer-focus:-top-2.5 peer-focus:text-xs ${errors.description ? "text-red-600" : "text-stone-600"}`}>Description</label>
        {errors.description && <p id="description-error" className="text-red-600 text-xs mt-1">{errors.description}</p>}
      </div>

      <div className="relative">
        <select
          id="severity"
          name="severity"
          value={form.severity}
          onChange={onChange}
          className={`input appearance-none pr-9 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.severity ? "border-red-500" : ""}`}
          aria-invalid={Boolean(errors.severity)}
          aria-describedby={errors.severity ? "severity-error" : undefined}
        >
          <option value="" disabled>Select severity</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <label htmlFor="severity" className={`absolute left-3 -top-2.5 bg-white px-1 text-xs transition-all peer-focus:-top-2.5 peer-focus:text-xs ${errors.severity ? "text-red-600" : "text-stone-600"}`}>Severity</label>
        <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"/></svg>
        {errors.severity && <p id="severity-error" className="text-red-600 text-xs mt-1">{errors.severity}</p>}
      </div>

      <div className="relative">
        <label className="label" htmlFor="image">Upload Image</label>
        <div className="flex items-center gap-3">
          <label htmlFor="image" className="btn-secondary cursor-pointer select-none">Choose file</label>
          <input id="image" name="image" type="file" accept="image/*" onChange={onChange} className="sr-only" />
          <span className="text-sm text-stone-600 dark:text-stone-300 truncate max-w-[60%]">{localImage ? localImage.name : "No file selected"}</span>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary gap-2 active:scale-[0.98] transition-transform"
        >
          {submitting ? (<><Spinner /><span>Submitting...</span></>) : "Submit Report"}
        </button>
      </div>
    </form>
  );
}

export default ReportForm;


