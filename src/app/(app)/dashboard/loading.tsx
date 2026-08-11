// OpenSloth — Dashboard Loading State
// T-805: Loading skeleton for dashboard page

export default function DashboardLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header skeleton */}
        <div>
          <div className="h-8 w-64 bg-muted rounded animate-pulse" />
          <div className="h-4 w-48 bg-muted rounded mt-2 animate-pulse" />
        </div>

        {/* Stats cards skeleton */}
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border p-6 space-y-3">
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              <div className="h-8 w-16 bg-muted rounded animate-pulse" />
              <div className="h-2 w-full bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Charts skeleton */}
        <div className="grid gap-6 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-xl border p-6 space-y-4">
              <div className="h-5 w-40 bg-muted rounded animate-pulse" />
              <div className="h-64 bg-muted/50 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
