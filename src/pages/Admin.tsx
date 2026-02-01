export default function MozasOverview() {
  return (
    <div className="min-h-screen bg-white text-slate-900 px-6 py-6">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Admin Panel / Mozas</p>
          <h1 className="mt-2 text-2xl md:text-3xl font-semibold">Mozas Overview</h1>
          <p className="mt-1 text-sm text-slate-500 max-w-xl">
            Central hub to monitor revenue, profit and performance across all your businesses.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
  <a
    href="/admin/brands"
    className="px-3 py-1.5 text-xs rounded-full border border-slate-900 bg-slate-900 text-white font-medium hover:bg-black"
  >
    Manage brands
  </a>

          <button className="px-3 py-1.5 text-xs rounded-full border border-slate-200 bg-slate-50 text-slate-700">
            Last 30 days
          </button>
          <button className="px-3 py-1.5 text-xs rounded-full border border-slate-200 text-slate-700">This month</button>
          <button className="px-3 py-1.5 text-xs rounded-full border border-slate-200 text-slate-700">
            Custom range
          </button>
          <button className="px-3 py-1.5 text-xs rounded-full border border-emerald-500 bg-emerald-500 text-white font-medium">
            Export report
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-6">
        {/* Left sidebar */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold">Businesses</h2>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">4 active</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <button className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left hover:bg-slate-100 transition">
                <div>
                  <p className="text-xs font-medium">Volocar</p>
                  <p className="text-[11px] text-slate-500">Mobility • Rentals & Subscriptions</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-emerald-600">€42.3k</p>
                  <p className="text-[10px] text-slate-400">MRR</p>
                </div>
              </button>

              <button className="w-full flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-left hover:bg-slate-50 transition">
                <div>
                  <p className="text-xs font-medium">TheDigitalGifter</p>
                  <p className="text-[11px] text-slate-500">AI Gifts • Global</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-emerald-600">€8.7k</p>
                  <p className="text-[10px] text-slate-400">MRR</p>
                </div>
              </button>

              <button className="w-full flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-left hover:bg-slate-50 transition">
                <div>
                  <p className="text-xs font-medium">Starscale</p>
                  <p className="text-[11px] text-slate-500">Growth • Funnels & Ads</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-emerald-600">€3.1k</p>
                  <p className="text-[10px] text-slate-400">MRR</p>
                </div>
              </button>

              <button className="w-full flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-left hover:bg-slate-50 transition">
                <div>
                  <p className="text-xs font-medium">BRNDLY</p>
                  <p className="text-[11px] text-slate-500">Branding • Assets</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-emerald-600">€1.4k</p>
                  <p className="text-[10px] text-slate-400">MRR</p>
                </div>
              </button>
            </div>
          </div>

          {/* Quick actions */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
            <h3 className="text-sm font-semibold mb-3">Quick actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              <button className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-left hover:bg-slate-50">Add new business</button>
              <button className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-left hover:bg-slate-50">Update targets</button>
              <button className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-left hover:bg-slate-50">Task board</button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="space-y-6">
          {/* Overview KPIs */}
          <section>
            <h2 className="text-sm font-semibold mb-3">Portfolio overview</h2>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
                <p className="text-xs text-slate-500">Total Revenue</p>
                <p className="mt-2 text-2xl font-semibold">€55,500</p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>vs last 30 days</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-medium text-[10px]">
                    ▲ 18.2%
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
                <p className="text-xs text-slate-500">Net Profit</p>
                <p className="mt-2 text-2xl font-semibold">€21,340</p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Profit margin</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-slate-50 text-slate-700 font-medium text-[10px]">
                    38.4%
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
                <p className="text-xs text-slate-500">Cash Flow (30d)</p>
                <p className="mt-2 text-2xl font-semibold">€12,900</p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Collected / Pending</span>
                  <span className="text-[11px]">
                    <span className="font-medium">€9.8k</span> / €3.1k
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
                <p className="text-xs text-slate-500">Total Expenses</p>
                <p className="mt-2 text-2xl font-semibold">€34,160</p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>All businesses • selected period</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-[10px]">
                    Fixed + Variable
                  </span>
                </div>
              </div>
            </div>

            {/* Focus Signals */}
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">Focus Signals</p>
                  <p className="mt-1 text-[11px] text-slate-500">Quick health indicators across the portfolio.</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 font-medium text-[10px]">Live</span>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-3 text-[11px] text-slate-600">
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <span>Volocar CAC</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium text-[10px]">
                    Slightly high
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <span>DigitalGifter ARPU</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium text-[10px]">
                    Improving
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <span>Starscale pipeline</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium text-[10px]">
                    Stable
                  </span>
                </div>
              </div>
            </div>

            {/* Growth & customer metrics (layout controlled with spacers) */}
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
                <p className="text-xs text-slate-500">Visitors per sites</p>
                <p className="mt-2 text-xl font-semibold">148,200</p>
                <p className="mt-1 text-[11px] text-slate-500">Last 30 days across all brands.</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
                <p className="text-xs text-slate-500">Total customers</p>
                <p className="mt-2 text-xl font-semibold">4,320</p>
                <p className="mt-1 text-[11px] text-slate-500">Unique paying customers in portfolio.</p>
              </div>

              {/* Spacer so Business Health can sit under Total customers on XL */}
              <div className="hidden xl:block" />

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">Avg spent / customer</p>
                  <span className="text-sm font-semibold">€182</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">Blended ARPU, with per-business breakdown.</p>

                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <p className="text-slate-600">Volocar</p>
                    <span className="mt-1 inline-flex px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-[10px]">
                      €205
                    </span>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <p className="text-slate-600">TheDigitalGifter</p>
                    <span className="mt-1 inline-flex px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-[10px]">
                      €149
                    </span>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <p className="text-slate-600">Starscale</p>
                    <span className="mt-1 inline-flex px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-[10px]">
                      €178
                    </span>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <p className="text-slate-600">BRNDLY</p>
                    <span className="mt-1 inline-flex px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-[10px]">
                      €121
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
                <p className="text-xs text-slate-500">Business Health</p>
                <p className="mt-1 text-[11px] text-slate-500">Overall portfolio status</p>

                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <p className="text-slate-600">Revenue trend</p>
                    <span className="mt-1 inline-flex px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium text-[10px]">
                      Growing
                    </span>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <p className="text-slate-600">Profitability</p>
                    <span className="mt-1 inline-flex px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium text-[10px]">
                      Healthy
                    </span>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <p className="text-slate-600">Cash position</p>
                    <span className="mt-1 inline-flex px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium text-[10px]">
                      Monitor
                    </span>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <p className="text-slate-600">Operational load</p>
                    <span className="mt-1 inline-flex px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium text-[10px]">
                      Stable
                    </span>
                  </div>
                </div>
              </div>

              {/* Spacer to keep grid balanced on XL */}
              <div className="hidden xl:block" />
            </div>
          </section>

          {/* Performance by business */}
          <section className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold">Revenue by business</h3>
                  <p className="text-[11px] text-slate-500">Distribution of revenue and profit across all active brands.</p>
                </div>
                <button className="text-[11px] text-slate-500 underline underline-offset-2">View detailed report</button>
              </div>

              <div className="mt-3 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-[11px] font-medium">Volocar</p>
                    <div className="mt-1 h-2 rounded-full bg-slate-100">
                      <div className="h-2 rounded-full bg-slate-900" style={{ width: "72%" }} />
                    </div>
                  </div>
                  <div className="ml-3 text-right text-[11px] text-slate-600">
                    <p>€39,900</p>
                    <p className="text-[10px] text-emerald-600">€15,400 profit</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-[11px] font-medium">TheDigitalGifter</p>
                    <div className="mt-1 h-2 rounded-full bg-slate-100">
                      <div className="h-2 rounded-full bg-slate-900" style={{ width: "16%" }} />
                    </div>
                  </div>
                  <div className="ml-3 text-right text-[11px] text-slate-600">
                    <p>€8,700</p>
                    <p className="text-[10px] text-emerald-600">€3,900 profit</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-[11px] font-medium">Starscale</p>
                    <div className="mt-1 h-2 rounded-full bg-slate-100">
                      <div className="h-2 rounded-full bg-slate-900" style={{ width: "8%" }} />
                    </div>
                  </div>
                  <div className="ml-3 text-right text-[11px] text-slate-600">
                    <p>€4,100</p>
                    <p className="text-[10px] text-emerald-600">€1,100 profit</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-[11px] font-medium">BRNDLY</p>
                    <div className="mt-1 h-2 rounded-full bg-slate-100">
                      <div className="h-2 rounded-full bg-slate-900" style={{ width: "4%" }} />
                    </div>
                  </div>
                  <div className="ml-3 text-right text-[11px] text-slate-600">
                    <p>€2,800</p>
                    <p className="text-[10px] text-emerald-600">€940 profit</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold">Control panel</h3>
                  <p className="text-[11px] text-slate-500">Owner-level snapshot & priorities.</p>
                </div>
              </div>

              <div className="space-y-3 text-xs flex-1">
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <div>
                    <p className="text-[11px] font-medium">Runway</p>
                    <p className="text-[11px] text-slate-500">Months of personal + business expenses covered</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">7.4</p>
                    <p className="text-[10px] text-slate-500">months</p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 px-3 py-2">
                  <p className="text-[11px] font-medium mb-1">Today&apos;s key moves</p>
                  <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-1">
                    <li>Review Volocar paid ads vs. CAC target.</li>
                    <li>Check new conversions & ARPU for TheDigitalGifter.</li>
                    <li>Assign Starscale outreach tasks for this week.</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-slate-200 px-3 py-2">
                  <p className="text-[11px] font-medium mb-1">Risk & Alerts</p>
                  <div className="space-y-1 text-[11px] text-slate-600">
                    <p>
                      <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1" />
                      Volocar refund rate slightly above target.
                    </p>
                    <p>
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1" />
                      DigitalGifter churn stable.
                    </p>
                    <p>
                      <span className="inline-block w-2 h-2 rounded-full bg-slate-300 mr-1" />
                      BRNDLY pipeline to be reviewed.
                    </p>
                  </div>
                </div>
              </div>

              <button className="mt-3 w-full rounded-xl border border-slate-900 bg-slate-900 text-white text-xs font-medium py-2">
                Open detailed Mozas reports
              </button>
            </div>
          </section>

          {/* Bottom row: Operations snapshot */}
          <section className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
              <h3 className="text-sm font-semibold mb-2">Operational KPIs</h3>
              <div className="space-y-2 text-[11px] text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Avg response time (support)</span>
                  <span className="font-medium">2.3 h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>On-time deliveries / bookings</span>
                  <span className="font-medium">96.4%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Recurring customers (30d)</span>
                  <span className="font-medium">31%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Active employees</span>
                  <span className="font-medium">7</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Net promoter score</span>
                  <span className="font-medium">8.7 / 10</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
              <h3 className="text-sm font-semibold mb-2">Owner schedule & focus</h3>
              <p className="text-[11px] text-slate-500 mb-2">High-impact time blocks you planned for this week.</p>
              <ul className="space-y-1.5 text-[11px] text-slate-600">
                <li>
                  <span className="font-medium">Mon:</span> Volocar EU expansion emails & partner calls.
                </li>
                <li>
                  <span className="font-medium">Tue:</span> TheDigitalGifter funnel + pricing tests.
                </li>
                <li>
                  <span className="font-medium">Wed:</span> Starscale client delivery & case studies.
                </li>
                <li>
                  <span className="font-medium">Thu:</span> BRNDLY brand kits & creative assets.
                </li>
                <li>
                  <span className="font-medium">Fri:</span> Mozas review + strategy.
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
              <h3 className="text-sm font-semibold mb-2">Finance snapshot</h3>
              <div className="space-y-2 text-[11px] text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Personal monthly burn</span>
                  <span className="font-medium">€5,200</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Business fixed costs</span>
                  <span className="font-medium">€9,600</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Ad spend (avg 30d)</span>
                  <span className="font-medium">€6,300</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Planned investments (next 90d)</span>
                  <span className="font-medium">€24,000</span>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
