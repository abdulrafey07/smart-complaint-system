const palette = ["bg-teal-600", "bg-amber-500", "bg-emerald-600", "bg-sky-600", "bg-red-600", "bg-violet-600"];

const AnalyticsBarList = ({ items = [], total = 0, formatter = (value) => value, emptyLabel = "No data yet." }) => {
  if (!items.length) {
    return <p className="text-sm text-slate-500">{emptyLabel}</p>;
  }

  const denominator = total || items.reduce((sum, item) => sum + item.count, 0) || 1;

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const percent = Math.round((item.count / denominator) * 100);

        return (
          <div key={item._id || item.label || index} className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <span className="truncate text-sm font-semibold text-slate-700">{formatter(item._id)}</span>
              <span className="shrink-0 text-sm font-bold text-slate-950">
                {item.count} <span className="font-medium text-slate-500">({percent}%)</span>
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${palette[index % palette.length]}`}
                style={{ width: `${Math.max(percent, item.count > 0 ? 3 : 0)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AnalyticsBarList;
