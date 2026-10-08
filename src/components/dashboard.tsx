"use client";
import { useEffect, useId, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Building2,
  ChartNoAxesCombined,
  ChevronDown,
  Info,
  Layers3,
  Mail,
  MapPin,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { Shell } from "./shell";
import { Button } from "./ui/button";
import {
  areas,
  categories,
  change,
  defaultFilters,
  developers,
  Filters,
  monthLabel,
  periods,
  propertyTypes,
  ranking,
  selectRecords,
  summarize,
  trend,
} from "@/lib/demo-data";
const number = (n: number) =>
  new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 }).format(n);
const billions = (n: number) => (n / 1e9).toFixed(2);
function Delta({ value }: { value: number | null }) {
  return (
    <span
      className={`delta ${value === null ? "neutral" : value < 0 ? "negative" : ""}`}
    >
      {value === null ? (
        "No prior month"
      ) : (
        <>
          {value < 0 ? <ArrowDown size={12} /> : <ArrowUp size={12} />}{" "}
          {Math.abs(value).toFixed(1)}%
        </>
      )}
    </span>
  );
}
function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  const id = useId();
  return (
    <div className="filter-field">
      <label htmlFor={id}>{label}</label>
      <div className="select-wrap">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown size={14} />
      </div>
    </div>
  );
}
export function Dashboard() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [chart, setChart] = useState<"transactions" | "sales">("transactions");
  const [report, setReport] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const reportTrigger = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!report) return;
    const prior = reportTrigger.current;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const keyHandler = (event: KeyboardEvent) => {
      if (event.key === "Escape") setReport(false);
      if (event.key === "Tab") {
        const items = modalRef.current?.querySelectorAll<HTMLElement>(
          'button, a, input, select, [tabindex="0"]',
        );
        if (!items?.length) return;
        const first = items[0],
          last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", keyHandler);
    return () => {
      document.removeEventListener("keydown", keyHandler);
      document.body.style.overflow = oldOverflow;
      prior?.focus();
    };
  }, [report]);
  const rows = selectRecords(filters),
    stats = summarize(rows),
    previousIndex = periods.indexOf(filters.month) - 1,
    previous =
      previousIndex >= 0
        ? summarize(selectRecords(filters, periods[previousIndex]))
        : null;
  const areaRows = ranking(rows, "area"),
    developerRows = ranking(rows, "developer"),
    history = trend(filters),
    share = stats.transactions ? (stats.offPlan / stats.transactions) * 100 : 0;
  const activeFilters = Object.entries(filters).filter(
    ([key, v]) => key !== "month" && v !== defaultFilters[key as keyof Filters],
  ).length;
  const update = (key: keyof Filters) => (value: string) =>
    setFilters((f) => ({ ...f, [key]: value }));
  const options = (list: string[], all: string) =>
    [all, ...list].map((value) => ({ value, label: value }));
  function download() {
    const csv = [
      "Demo data — fictional; not Dubai market statistics",
      "Reporting period,Area,Developer,Property type,Category,Transactions,Sales AED,Total area sqft",
      ...rows.map((r) =>
        [
          r.month,
          r.area,
          r.developer,
          r.propertyType,
          r.category,
          r.transactions,
          r.sales,
          r.areaSqft,
        ].join(","),
      ),
    ].join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `propwise-demo-${filters.month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <Shell>
      <main className="dashboard">
        <div className="page-heading">
          <div>
            <div className="eyebrow heading-eyebrow">
              <span /> DUBAI MARKET INTELLIGENCE
            </div>
            <h1>
              A pulse on the property market<span>.</span>
            </h1>
            <p>
              The bigger picture. The finer details. Your next informed
              decision.
            </p>
          </div>
          <Button
            ref={reportTrigger}
            variant="outline"
            onClick={() => setReport(true)}
          >
            <ArrowDownToLine size={16} /> Monthly report
          </Button>
        </div>
        <div className="demo-banner">
          <Info size={16} />
          <span>
            <strong>You’re exploring a demo.</strong> All figures are fictional
            and illustrate the dashboard experience.
          </span>
          <span className="banner-tag">PHASE 1</span>
        </div>
        <section className="filter-bar" aria-label="Market filters">
          <div className="filter-icon">
            <SlidersHorizontal size={18} />
          </div>
          <Select
            label="REPORTING MONTH"
            value={filters.month}
            options={[...periods]
              .reverse()
              .map((value) => ({ value, label: monthLabel(value, true) }))}
            onChange={update("month")}
          />
          <Select
            label="LOCATION"
            value={filters.area}
            options={options(areas, "All areas")}
            onChange={update("area")}
          />
          <Select
            label="DEVELOPER"
            value={filters.developer}
            options={options(developers, "All developers")}
            onChange={update("developer")}
          />
          <Select
            label="PROPERTY TYPE"
            value={filters.propertyType}
            options={options(propertyTypes, "All types")}
            onChange={update("propertyType")}
          />
          <Select
            label="TRANSACTION"
            value={filters.category}
            options={options(categories, "All transactions")}
            onChange={update("category")}
          />
          <Button
            variant="ghost"
            size="icon"
            aria-label="Reset all filters"
            onClick={() => setFilters(defaultFilters)}
          >
            <RotateCcw size={16} />
          </Button>
        </section>
        <div className="section-heading">
          <h2>
            Market at a glance{" "}
            <span className="period-pill">{monthLabel(filters.month)}</span>
          </h2>
          <span className="section-caption">
            <span className="status-dot" />
            {activeFilters
              ? `${activeFilters} active filter${activeFilters > 1 ? "s" : ""}`
              : "All market segments"}{" "}
            · Demo dataset
          </span>
        </div>
        <section className="kpi-grid" aria-label="Market key metrics">
          <Kpi
            title="Total transactions"
            value={number(stats.transactions)}
            icon={<Building2 size={18} />}
            delta={
              previous
                ? change(stats.transactions, previous.transactions)
                : null
            }
            subtitle="property sales"
          />
          <Kpi
            title="Total sales value"
            value={billions(stats.sales)}
            prefix="AED"
            suffix="B"
            icon={<Wallet size={18} />}
            delta={previous ? change(stats.sales, previous.sales) : null}
            subtitle="total transaction value"
          />
          <Kpi
            title="Average price / sq ft"
            value={number(stats.price)}
            prefix="AED"
            icon={<ChartNoAxesCombined size={18} />}
            delta={previous ? change(stats.price, previous.price) : null}
            subtitle="weighted by property size"
          />
          <Kpi
            title="Off-plan market share"
            value={share.toFixed(1)}
            suffix="%"
            icon={<Layers3 size={18} />}
            delta={
              previous
                ? change(
                    share,
                    previous.transactions
                      ? (previous.offPlan / previous.transactions) * 100
                      : 0,
                  )
                : null
            }
            subtitle="of total transactions"
          />
        </section>
        <div className="chart-grid">
          <section className="panel trend-panel">
            <div className="panel-heading">
              <div>
                <h2>Market momentum</h2>
                <p>How the market is moving, month by month</p>
              </div>
              <span className="small-badge">{history.length}-month view</span>
            </div>
            <div className="trend-toolbar">
              <div className="segmented" aria-label="Trend metric">
                <button
                  aria-pressed={chart === "transactions"}
                  onClick={() => setChart("transactions")}
                  className={chart === "transactions" ? "selected" : ""}
                >
                  Transactions
                </button>
                <button
                  aria-pressed={chart === "sales"}
                  onClick={() => setChart("sales")}
                  className={chart === "sales" ? "selected" : ""}
                >
                  Sales value
                </button>
              </div>
              <span className="legend-dot">
                <i />
                {chart === "transactions"
                  ? "Property transactions"
                  : "Sales value (AED)"}
              </span>
            </div>
            <div
              className="trend-chart"
              role="img"
              aria-label={`${chart === "transactions" ? "Monthly transaction" : "Sales value"} trend for selected filters, ${history.map((r) => `${r.month}: ${chart === "transactions" ? number(r.transactions) : "AED " + billions(r.sales) + " billion"}`).join("; ")} same year 2026`}
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={history}
                  margin={{ top: 15, right: 18, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0d9689" stopOpacity={0.2} />
                      <stop
                        offset="100%"
                        stopColor="#0d9689"
                        stopOpacity={0.01}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 5"
                    vertical={false}
                    stroke="#e9eef1"
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#84909e", fontSize: 11 }}
                    dy={12}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#84909e", fontSize: 11 }}
                    tickFormatter={(v) =>
                      chart === "transactions" ? `${v / 1000}k` : `${v / 1e9}B`
                    }
                    width={47}
                  />
                  <Tooltip
                    formatter={(v) =>
                      chart === "transactions"
                        ? [number(Number(v)), "Transactions"]
                        : [`AED ${billions(Number(v))}B`, "Sales value"]
                    }
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                      fontSize: 12,
                    }}
                    labelFormatter={(label) => `${label} 2026 · Fictional demo`}
                  />
                  <Area
                    type="monotone"
                    dataKey={chart}
                    stroke="#0c9487"
                    strokeWidth={3}
                    fill="url(#trendFill)"
                    dot={{ r: 3, fill: "#fff", strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-footer">
              <TrendingUp size={14} />
              <span>
                {previous
                  ? `${Math.abs(change(stats[chart], previous[chart]) ?? 0).toFixed(1)}% ${stats[chart] >= previous[chart] ? "increase" : "decrease"} from ${monthLabel(periods[previousIndex])}`
                  : "First available demo month; no comparable prior period."}
              </span>
              <span className="ml-auto">2026 · Fictional data</span>
            </div>
          </section>
          <section className="panel mix-panel">
            <div className="panel-heading">
              <div>
                <h2>Off-plan vs. ready</h2>
                <p>Where transactions are happening</p>
              </div>
              <Layers3 size={17} className="text-slate-400" />
            </div>
            <div
              className="donut-wrap"
              role="img"
              aria-label={`Off-plan ${number(stats.offPlan)} transactions; Ready ${number(stats.ready)} transactions`}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Off-plan", value: stats.offPlan },
                      { name: "Ready", value: stats.ready },
                    ]}
                    innerRadius={72}
                    outerRadius={92}
                    paddingAngle={stats.offPlan && stats.ready ? 4 : 0}
                    dataKey="value"
                    stroke="none"
                    startAngle={90}
                    endAngle={-270}
                    isAnimationActive={false}
                  >
                    <Cell fill="#0c9688" />
                    <Cell fill="#b7dcd6" />
                  </Pie>
                  <Tooltip formatter={(v) => number(Number(v))} />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center">
                <span>{number(stats.transactions)}</span>
                <small>transactions</small>
              </div>
            </div>
            <div className="mix-legend">
              <div>
                <i />
                <span>Off-plan</span>
                <strong>{share.toFixed(1)}%</strong>
                <small>{number(stats.offPlan)} sales</small>
              </div>
              <div>
                <i />
                <span>Ready</span>
                <strong>{(100 - share).toFixed(1)}%</strong>
                <small>{number(stats.ready)} sales</small>
              </div>
            </div>
            <div className="mix-note">
              <Info size={13} /> Share of selected demo transactions
            </div>
          </section>
        </div>
        <div className="detail-grid">
          <section className="panel" id="areas">
            <div className="panel-heading">
              <div>
                <h2>Where Dubai is moving</h2>
                <p>Top areas by transaction activity</p>
              </div>
              <MapPin size={18} className="text-slate-400" />
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>AREA / COMMUNITY</th>
                    <th>TRANSACTIONS</th>
                    <th>VALUE (AED)</th>
                    <th>MoM</th>
                  </tr>
                </thead>
                <tbody>
                  {areaRows.map((r, i) => {
                    const p =
                      previousIndex >= 0
                        ? ranking(
                            selectRecords(filters, periods[previousIndex]),
                            "area",
                          ).find((v) => v.name === r.name)
                        : null;
                    return (
                      <tr key={r.name}>
                        <td>
                          <button
                            className="area-name"
                            onClick={() => update("area")(r.name)}
                          >
                            <span className="row-number">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            {r.name}
                            <ArrowUpRight size={12} />
                          </button>
                        </td>
                        <td>
                          {number(r.transactions)}
                          <div className="table-bar">
                            <span
                              style={{
                                width: `${(r.transactions / areaRows[0].transactions) * 100}%`,
                              }}
                            />
                          </div>
                        </td>
                        <td>{billions(r.sales)}B</td>
                        <td>
                          <Delta
                            value={
                              p ? change(r.transactions, p.transactions) : null
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="panel-bottom">
              Click a community to explore its performance
              <Button
                variant="ghost"
                size="sm"
                onClick={() => update("area")("All areas")}
              >
                All areas <ArrowRight size={14} />
              </Button>
            </div>
          </section>
          <section className="panel" id="developers">
            <div className="panel-heading">
              <div>
                <h2>Developer spotlight</h2>
                <p>Leaders in the selected market segment</p>
              </div>
              <BarIcon />
            </div>
            <div className="developer-list">
              {developerRows.map((r, i) => (
                <button
                  key={r.name}
                  onClick={() => update("developer")(r.name)}
                  className="developer-row"
                >
                  <span className={`developer-logo logo-${i}`}>
                    {r.name.substring(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <strong>{r.name}</strong>
                    <span>{number(r.transactions)} transactions</span>
                  </div>
                  <div className="developer-share">
                    <strong>
                      {((r.transactions / stats.transactions) * 100).toFixed(1)}
                      <small>%</small>
                    </strong>
                    <span>market share</span>
                  </div>
                  <ChevronDown
                    size={12}
                    className="-rotate-90 text-slate-400"
                  />
                </button>
              ))}
            </div>
            <div className="panel-bottom">
              Based on fictional sales activity
              <Button
                variant="ghost"
                size="sm"
                onClick={() => update("developer")("All developers")}
              >
                Reset <RotateCcw size={13} />
              </Button>
            </div>
          </section>
        </div>
        <section className="insight-strip">
          <div className="insight-icon">
            <Sparkles size={20} />
          </div>
          <div>
            <span className="eyebrow">THE PROPWISE PERSPECTIVE · DEMO</span>
            <p>
              <strong>{areaRows[0]?.name}</strong> leads this selection with{" "}
              {number(areaRows[0]?.transactions ?? 0)} transactions. Off-plan
              properties account for <strong>{share.toFixed(1)}%</strong> of
              activity.
            </p>
            <small>
              Calculated from the selected fictional dataset ·{" "}
              {monthLabel(filters.month, true)} · No year-over-year data
              available.
            </small>
          </div>
        </section>
        <section className="newsletter" id="decode">
          <div className="newsletter-content">
            <span className="eyebrow">YOUR MONTHLY MARKET ADVANTAGE</span>
            <h2>
              A little less noise.
              <br />A lot more perspective.
            </h2>
            <p>
              Meet <strong>Propwise | Dubai Market Decode.</strong>
              <br />
              The market’s biggest moves, decoded for your inbox.
            </p>
            <span className="newsletter-foot">
              <Mail size={13} /> Monthly insights. Meaningful context.
            </span>
          </div>
          <div className="newsletter-form">
            <span className="newsletter-label">STAY AHEAD OF THE CURVE</span>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubscribed(true);
              }}
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSubscribed(false);
                }}
                required
              />
              <Button type="submit">
                Join the list <ArrowRight size={15} />
              </Button>
            </form>
            <p role="status">
              {subscribed
                ? "Demo signup received in this session. No email was stored or sent."
                : "Preview only. Subscriptions and email delivery arrive in a later phase."}
            </p>
            <div className="newsletter-decoration" aria-hidden="true">
              PW<span>DECODE</span>
            </div>
          </div>
        </section>
      </main>
      {report && (
        <div className="modal-backdrop" onClick={() => setReport(false)}>
          <section
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-title"
            className="report-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              className="modal-close"
              variant="ghost"
              size="icon"
              aria-label="Close report"
              autoFocus
              onClick={() => setReport(false)}
            >
              <X size={18} />
            </Button>
            <span className="eyebrow">PROPWISE | MARKET DECODE</span>
            <h2 id="report-title">
              {monthLabel(filters.month, true)}
              <br />
              Demo market snapshot
            </h2>
            <p>
              Fictional data for interface review. Your current filters apply to
              this export.
            </p>
            <div className="report-summary">
              <span>{number(stats.transactions)} transactions</span>
              <span>AED {billions(stats.sales)}B sales value</span>
              <span>AED {number(stats.price)} / sq ft</span>
            </div>
            <p>
              Formal reports and publication workflows are planned for later
              phases.
            </p>
            <Button onClick={download}>
              <ArrowDownToLine size={16} /> Download demo dataset (CSV)
            </Button>
            <Button variant="ghost" onClick={() => setReport(false)}>
              Close
            </Button>
          </section>
        </div>
      )}
    </Shell>
  );
}
function BarIcon() {
  return <ChartNoAxesCombined size={18} className="text-slate-400" />;
}
function Kpi({
  title,
  value,
  prefix,
  suffix,
  icon,
  delta,
  subtitle,
}: {
  title: string;
  value: string;
  prefix?: string;
  suffix?: string;
  icon: React.ReactNode;
  delta: number | null;
  subtitle: string;
}) {
  return (
    <article className="kpi">
      <div className="kpi-top">
        <span>{title}</span>
        <div className="kpi-icon">{icon}</div>
      </div>
      <div className="kpi-value">
        {prefix && <span>{prefix}</span>}
        {value}
        {suffix && <em>{suffix}</em>}
      </div>
      <p>{subtitle}</p>
      <div className="kpi-bottom">
        <Delta value={delta} />
        {delta !== null && <span>vs. previous month</span>}
      </div>
    </article>
  );
}
