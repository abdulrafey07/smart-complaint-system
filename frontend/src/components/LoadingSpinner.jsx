import { Loader2 } from "lucide-react";

const LoadingSpinner = ({ label = "Loading" }) => (
  <div className="flex min-h-52 items-center justify-center text-slate-600">
    <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
    <span className="text-sm font-medium">{label}</span>
  </div>
);

export default LoadingSpinner;
