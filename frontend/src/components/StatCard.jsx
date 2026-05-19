const StatCard = ({ label, value, accent = "teal" }) => {
  const accentClasses = {
    teal: "border-l-teal-600",
    amber: "border-l-amber-500",
    emerald: "border-l-emerald-600",
    red: "border-l-red-600"
  };

  return (
    <div className={`panel border-l-4 p-5 ${accentClasses[accent] || accentClasses.teal}`}>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-950">{value ?? 0}</p>
    </div>
  );
};

export default StatCard;
