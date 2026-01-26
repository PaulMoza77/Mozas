export default function Expenses() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-6">
        {/* Header */}
        <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
              Admin Panel / Expenses
            </p>
            <h1 className="mt-2 text-3xl md:text-4xl font-semibold leading-tight">
              Expenses
            </h1>
            <p className="mt-2 text-sm text-slate-500 max-w-2xl">
              Track business, personal, investments and saved money in one place.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-xs rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
              Last 30 days
            </button>
            <button className="px-3 py-1.5 text-xs rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
              This month
            </button>
            <button className="px-3 py-1.5 text-xs rounded-full border border-emerald-600 bg-emerald-600 text-white font-medium hover:bg-emerald-700">
              Add new
            </button>
          </div>
        </header>

        {/* Mode switch */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <button className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left">
              <p className="font-medium">Business</p>
              <p className="text-[11px] text-slate-500">Volocar / TDG / etc.</p>
            </button>
            <button className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-left hover:bg-slate-50">
              <p className="font-medium">Personal</p>
              <p className="text-[11px] text-slate-500">Your living costs</p>
            </button>
            <button className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-left hover:bg-slate-50">
              <p className="font-medium">Investments</p>
              <p className="text-[11px] text-slate-500">Assets & capital</p>
            </button>
            <button className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-left hover:bg-slate-50">
              <p className="font-medium">Saved money</p>
              <p className="text-[11px] text-slate-500">Cash reserves</p>
            </button>
          </div>
        </div>

        {/* Placeholder content */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[320px,1fr]">
          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
              <h2 className="text-sm font-semibold">Filters</h2>
              <p className="mt-1 text-[11px] text-slate-500">
                Next step: business selector, categories, payment method, recurring, etc.
              </p>

              <div className="mt-4 space-y-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                  Mode: <span className="font-medium">Business</span>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                  Business: <span className="font-medium">Volocar</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
              <h3 className="text-sm font-semibold">Quick totals</h3>
              <div className="mt-3 grid gap-2 text-[11px] text-slate-600">
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <span>Total expenses</span>
                  <span className="font-medium">—</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <span>Recurring</span>
                  <span className="font-medium">—</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <span>One-time</span>
                  <span className="font-medium">—</span>
                </div>
              </div>
            </div>
          </aside>

          <main className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold">Transactions</h2>
                  <p className="text-[11px] text-slate-500">
                    Next step: table + add expense modal.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
                <p className="text-sm font-medium text-slate-700">Empty state</p>
                <p className="mt-1 text-[11px] text-slate-500">
                  We’ll plug in your expenses data + add form in the next step.
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
