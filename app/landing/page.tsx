const allocationCards = [
  { label: "Savings", amount: 7500, color: "from-cyan-500 to-blue-600" },
  { label: "Liabilities", amount: 7500, color: "from-fuchsia-500 to-violet-600" },
  { label: "Expenses", amount: 10000, color: "from-amber-400 to-orange-500" },
];

const categories = [
  { name: "Emergency Fund", digital: 3200, cash: 400, tag: "Savings" },
  { name: "Car Loan", digital: 1800, cash: 0, tag: "Liabilities" },
  { name: "Food", digital: 2000, cash: 500, tag: "Expenses" },
];

const quickActions = [
  { label: "Add Income", icon: "+" },
  { label: "Transfer", icon: "⇄" },
  { label: "Budget", icon: "◷" },
  { label: "Goals", icon: "★" },
];

const navItems = [
  { label: "Home", icon: "⌂", active: true },
  { label: "Stashes", icon: "◫" },
  { label: "Plan", icon: "◎" },
  { label: "Me", icon: "◌" },
];

export const revalidate = 300;

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.18),_transparent_35%),linear-gradient(145deg,_#020617,_#111827)] px-3 py-3 text-slate-100 sm:px-4 lg:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <header className="rounded-[28px] border border-white/10 bg-neutral-900/80 p-4 shadow-2xl shadow-black/40 backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-teal-300">Stash</p>
              <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Your money, made simple</h1>
            </div>
            <button className="rounded-full border border-teal-400/30 bg-teal-500/10 px-3 py-2 text-sm font-medium text-teal-200 transition hover:bg-teal-500/20">
              + Income
            </button>
          </div>

          <div className="mt-4 rounded-[24px] border border-white/10 bg-gradient-to-br from-teal-500/20 via-slate-800 to-slate-900 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-300">Monthly income</p>
                <p className="mt-1 text-3xl font-semibold sm:text-4xl">₱25,000</p>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <div className="rounded-[24px] border border-white/10 bg-neutral-900/80 p-4 shadow-lg shadow-black/20 backdrop-blur">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Auto allocation</h2>
                <span className="rounded-full bg-neutral-800 px-3 py-1 text-xs font-medium text-slate-300">
                  <button className="text-sm text-slate-400 transition hover:text-white">Edit</button>
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {allocationCards.map((card) => (
                  <div key={card.label} className="flex justify-between items-center rounded-2xl border border-white/10 bg-neutral-950/70 p-3">
                    <p className="text-sm text-slate-400">{card.label}</p>
                    <p className="text-xl font-semibold">₱{card.amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-neutral-900/80 p-4 shadow-lg shadow-black/20 backdrop-blur">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Stashes</h2>
                <button className="text-sm text-slate-400 transition hover:text-white">See all</button>
              </div>

              <div className="mt-4 space-y-3">
                {categories.map((category) => (
                  <div
                    key={category.name}
                    className="rounded-2xl border border-white/10 bg-neutral-950/70 p-3 transition hover:border-teal-400/40 hover:bg-neutral-800/70"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-500">{category.tag}</p>
                      </div>
                      <div className="rounded-full bg-neutral-800 px-2.5 py-1 text-xs text-slate-300">
                        Digital + Cash
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-slate-300">
                      <span>Digital: ₱{category.digital.toLocaleString()}</span>
                      <span>Cash: ₱{category.cash.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[24px] border border-white/10 bg-neutral-900/80 p-4 shadow-lg shadow-black/20 backdrop-blur">
              <h2 className="text-lg font-semibold">Quick actions</h2>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    className="rounded-2xl border border-white/10 bg-neutral-950/70 px-3 py-4 text-left text-sm font-medium text-slate-200 transition hover:border-teal-400/40 hover:bg-neutral-800"
                  >
                    <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-teal-500/10 text-lg text-teal-300">
                      {action.icon}
                    </span>
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <nav className="sticky bottom-3 flex items-center justify-between rounded-full border border-white/10 bg-neutral-900/90 px-2 py-2 shadow-2xl shadow-black/30 backdrop-blur lg:mx-auto lg:w-[440px]">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`flex min-w-[72px] flex-col items-center rounded-full px-3 py-2 text-xs transition ${
                item.active ? "bg-teal-500/20 text-teal-200" : "text-slate-400 hover:bg-neutral-800 hover:text-white"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span className="mt-1">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </main>
  );
}
