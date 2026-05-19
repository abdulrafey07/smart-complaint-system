import { STATUS_LABELS } from "./constants.js";

export const formatDate = (value) => {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
};

export const formatStatus = (status) => STATUS_LABELS[status] || status || "Unknown";

export const getErrorMessage = (error) => {
  const validationMessage = error.response?.data?.errors?.[0]?.message;
  return validationMessage || error.response?.data?.message || error.message || "Something went wrong";
};
