"use client";
import { useEffect, useId, useRef, useState } from "react";
import {
  Bar,
  BarChart,
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
  Wallet,
  X,
} from "lucide-react";
import { Shell } from "./shell";
import { Button } from "./ui/button";
import {
  allAreas,
  areaMetrics,
  areaRanking,
  billions,
  exportCsv,
  market,
  number,
  reportingPeriod,
  snapshotFor,
} from "@/lib/market-data";
function Delta({ value }: { value: number | null }) {
  return value === null ? (
    <span className="delta neutral">Comparison not supplied</span>
  ) : (
    <span className={`delta ${value < 0 ? "negative" : ""}`}>
      {value < 0 ? <ArrowDown size={12} /> : <ArrowUp size={12} />}{" "}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}
function Select({
  label,
  value,
  options,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  options: string[];
  onChange?: (value: string) => void;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className={`filter-field ${disabled ? "filter-disabled" : ""}`}>
      <label htmlFor={id}>{label}</label>
      <div className="select-wrap">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          disabled={disabled}
          title={disabled ? "This breakdown was not supplied." : ""}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown size={14} />
      </div>
    </div>
  );
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
  value: string | null;
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
        {value !== null && prefix && <span>{prefix}</span>}
        {value ?? "—"}
        {value !== null && suffix && <em>{suffix}</em>}
      </div>
      <p>{value === null ? "Area metric not supplied" : subtitle}</p>
      <div className="kpi-bottom">
        <Delta value={delta} />
        {delta !== null && <span>vs. August 2026</span>}
      </div>
    </article>
  );
}
export function Dashboard() {
  const [area, setArea] = useState(allAreas),
    [metric, setMetric] = useState<"transactions" | "salesValue">(
      "transactions",
    ),
    [rankBy, setRankBy] = useState<"volume" | "value">("volume");
  const [report, setReport] = useState(false),
    [email, setEmail] = useState(""),
    [subscribed, setSubscribed] = useState(false);
  const reportTrigger = useRef<HTMLButtonElement>(null),
    modalRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!report) return;
    const prior = reportTrigger.current,
      oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handle = (event: KeyboardEvent) => {
      if (event.key === "Escape") setReport(false);
      if (event.key === "Tab") {
        const items = modalRef.current?.querySelectorAll<HTMLElement>(
          'button,a,input,select,[tabindex="0"]',
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
    document.addEventListener("keydown", handle);
    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener("keydown", handle);
      prior?.focus();
    };
  }, [report]);
  const stats = snapshotFor(area),
    rankings = areaRanking(rankBy, area),
    isCity = area === allAreas;
  const chartValue = stats[metric],
    chartMom =
      metric === "transactions" ? stats.transactionsMom : stats.salesValueMom;
  const chartData =
    chartValue === null ? [] : [{ month: "September", value: chartValue }];
  const selected = areaMetrics.find((row) => row.name === area);
  function download() {
    const url = URL.createObjectURL(
      new Blob([exportCsv(area)], { type: "text/csv;charset=utf-8;" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `propwise-september-2026-${isCity ? "dubai" : area.toLowerCase().replaceAll(" ", "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
  const insight = isCity
    ? "September recorded fewer transactions but higher total sales value and stronger median property pricing than August."
    : selected?.name === "Al Hebiah 1"
      ? "Al Hebiah 1 recorded 408 sales, with transaction activity up 113.6% versus August — the strongest supplied increase among the busiest areas."
      : selected?.name === "Palm Jumeirah"
        ? "Palm Jumeirah recorded 72 transactions worth AED 1.37bn, reflecting its premium pricing."
        : selected?.name === "Madinat Al Mataar"
          ? "Madinat Al Mataar led the supplied transaction-volume ranking with 928 sales."
          : selected?.name === "Business Bay"
            ? "Business Bay led the supplied sales-value ranking with AED 1.50bn across 437 transactions."
            : `${area} has ${selected?.transactions !== null && selected?.transactions !== undefined ? number(selected.transactions) + " supplied sales transactions" : "no supplied transaction count"}${selected?.salesValue ? " and AED " + billions(selected.salesValue) + "bn in sales value" : ""}. Additional price and historical breakdowns were not supplied.`;
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
              September 2026. Fewer sales. Higher-value activity. A clearer
              perspective.
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
        <div className="source-banner">
          <Info size={16} />
          <span>
            <strong>DLD-registered sales · 1–30 September 2026.</strong> Figures
            supplied by Propwise; data available through 6 October 2026.
          </span>
          <span className="banner-tag">SUPPLIED DATA</span>
        </div>
        <section className="filter-bar" aria-label="Market filters">
          <div className="filter-icon">
            <SlidersHorizontal size={18} />
          </div>
          <Select
            label="REPORTING MONTH"
            value={reportingPeriod.label}
            options={[reportingPeriod.label]}
          />
          <Select
            label="LOCATION"
            value={area}
            options={[allAreas, ...areaMetrics.map((row) => row.name).sort()]}
            onChange={setArea}
          />
          <Select
            label="DEVELOPER"
            value="Not supplied"
            options={["Not supplied"]}
            disabled
          />
          <Select
            label="PROPERTY TYPE"
            value="Dubai-wide shares"
            options={["Dubai-wide shares"]}
            disabled
          />
          <Select
            label="TRANSACTION"
            value="All registered sales"
            options={["All registered sales"]}
            disabled
          />
          <Button
            variant="ghost"
            size="icon"
            aria-label="Reset all filters"
            onClick={() => setArea(allAreas)}
          >
            <RotateCcw size={16} />
          </Button>
        </section>
        <p className="filter-help">
          Select an area to explore supplied metrics. Developer and segmented
          transaction datasets are not yet available; missing figures are shown
          as —.
        </p>
        <div className="section-heading">
          <h2>
            Market at a glance <span className="period-pill">Sept 2026</span>
          </h2>
          <span className="section-caption">
            <span className="status-dot" />
            {isCity ? "Dubai-wide overview" : area}
          </span>
        </div>
        <section className="kpi-grid" aria-label="Market key metrics">
          <Kpi
            title="Registered sales"
            value={
              stats.transactions === null ? null : number(stats.transactions)
            }
            icon={<Building2 size={18} />}
            delta={stats.transactionsMom}
            subtitle="DLD-registered transactions"
          />
          <Kpi
            title="Total sales value"
            value={
              stats.salesValue === null ? null : billions(stats.salesValue)
            }
            prefix="AED"
            suffix="bn"
            icon={<Wallet size={18} />}
            delta={stats.salesValueMom}
            subtitle="registered transaction value"
          />
          <Kpi
            title="Median property price"
            value={
              stats.medianPrice === null
                ? null
                : (stats.medianPrice / 1e6).toFixed(3)
            }
            prefix="AED"
            suffix="m"
            icon={<Layers3 size={18} />}
            delta={stats.medianPriceMom}
            subtitle="median sale price, not an average"
          />
          <Kpi
            title="Median price / sq ft"
            value={
              stats.medianPriceSqft === null
                ? null
                : number(stats.medianPriceSqft)
            }
            prefix="AED"
            icon={<ChartNoAxesCombined size={18} />}
            delta={null}
            subtitle="median price per square foot"
          />
        </section>
        <div className="chart-grid">
          <section className="panel trend-panel">
            <div className="panel-heading">
              <div>
                <h2>September market activity</h2>
                <p>
                  {isCity ? "Dubai-wide registered sales" : area} · one supplied
                  reporting month
                </p>
              </div>
              <span className="small-badge">September snapshot</span>
            </div>
            <div className="trend-toolbar">
              <div className="segmented" aria-label="Chart metric">
                <button
                  aria-pressed={metric === "transactions"}
                  className={metric === "transactions" ? "selected" : ""}
                  onClick={() => setMetric("transactions")}
                >
                  Transactions
                </button>
                <button
                  aria-pressed={metric === "salesValue"}
                  className={metric === "salesValue" ? "selected" : ""}
                  onClick={() => setMetric("salesValue")}
                >
                  Sales value
                </button>
              </div>
              <span className="legend-dot">
                <i />
                {metric === "transactions"
                  ? "Registered sales"
                  : "Sales value (AED)"}
              </span>
            </div>
            <div
              className="trend-chart"
              role={chartValue === null ? "status" : "img"}
              aria-label={
                chartValue === null
                  ? undefined
                  : `September 2026 ${metric === "transactions" ? "transactions" : "sales value"} for ${area}: ${metric === "transactions" ? number(chartValue) : "AED " + billions(chartValue) + " billion"}`
              }
            >
              {chartValue === null ? (
                <div className="empty-chart">
                  <ChartNoAxesCombined size={26} />
                  <strong>This area metric was not supplied.</strong>
                  <p>Try another area or switch the chart metric.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 15, right: 24, left: 4, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="activityFill"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#4166F6" />
                        <stop offset="100%" stopColor="#98ACFE" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 5"
                      vertical={false}
                      stroke="#e9edf7"
                    />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#748298", fontSize: 11 }}
                      dy={10}
                    />
                    <YAxis
                      domain={[0, "auto"]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#748298", fontSize: 11 }}
                      tickFormatter={(value) =>
                        metric === "transactions"
                          ? `${value / 1000}k`
                          : `${value / 1e9}bn`
                      }
                      width={50}
                    />
                    <Tooltip
                      cursor={{ fill: "#f5f7ff" }}
                      formatter={(value) => [
                        metric === "transactions"
                          ? number(Number(value))
                          : `AED ${billions(Number(value))}bn`,
                        metric === "transactions"
                          ? "Registered sales"
                          : "Sales value",
                      ]}
                      labelFormatter={() => `September 2026 · ${area}`}
                      contentStyle={{
                        borderRadius: 10,
                        border: "1px solid #e1e7f5",
                        fontSize: 12,
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill="url(#activityFill)"
                      radius={[7, 7, 0, 0]}
                      maxBarSize={100}
                      isAnimationActive={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="chart-footer">
              <Delta value={chartMom} />
              {chartMom !== null && <span>vs. August 2026</span>}
              <span className="ml-auto">
                Absolute August figures not supplied
              </span>
            </div>
          </section>
          <section className="panel mix-panel">
            <div className="panel-heading">
              <div>
                <h2>Off-plan vs. ready</h2>
                <p>Dubai-wide shares · not filtered by area</p>
              </div>
              <Layers3 size={17} className="text-slate-400" />
            </div>
            <div
              className="donut-wrap"
              role="img"
              aria-label={`Dubai-wide transaction shares: off-plan ${market.offPlanShare} percent; ready ${market.readyShare} percent`}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Off-plan", value: market.offPlanShare },
                      { name: "Ready", value: market.readyShare },
                    ]}
                    innerRadius={72}
                    outerRadius={92}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                    startAngle={90}
                    endAngle={-270}
                    isAnimationActive={false}
                  >
                    <Cell fill="#4166F6" />
                    <Cell fill="#B5C4FF" />
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center">
                <span>
                  {market.offPlanShare}
                  <small className="donut-percent">%</small>
                </span>
                <small>off-plan share</small>
              </div>
            </div>
            <div className="mix-legend">
              <div>
                <i />
                <span>Off-plan</span>
                <strong>{market.offPlanShare}%</strong>
                <small>of registered sales</small>
              </div>
              <div>
                <i />
                <span>Ready</span>
                <strong>{market.readyShare}%</strong>
                <small>of registered sales</small>
              </div>
            </div>
            <div className="mix-note">
              <Info size={13} /> Exact category counts were not supplied
            </div>
          </section>
        </div>
        <div className="detail-grid">
          <section className="panel" id="areas">
            <div className="panel-heading">
              <div>
                <h2>Where Dubai is moving</h2>
                <p>
                  {isCity
                    ? rankBy === "volume"
                      ? "Top 10 by registered transaction count"
                      : "Top 5 by total transaction value"
                    : `Supplied figures for ${area}`}
                </p>
              </div>
              <MapPin size={18} className="text-slate-400" />
            </div>
            <div className="area-toolbar">
              <div className="segmented">
                <button
                  aria-pressed={rankBy === "volume"}
                  className={rankBy === "volume" ? "selected" : ""}
                  onClick={() => setRankBy("volume")}
                >
                  Sales count
                </button>
                <button
                  aria-pressed={rankBy === "value"}
                  className={rankBy === "value" ? "selected" : ""}
                  onClick={() => setRankBy("value")}
                >
                  Sales value ranking
                </button>
              </div>
            </div>
            <div className="table-wrap">
              <table>
                <caption className="sr-only">
                  Supplied September 2026 area data, ranked by{" "}
                  {rankBy === "volume" ? "transaction count" : "sales value"}
                </caption>
                <thead>
                  <tr>
                    <th>AREA / COMMUNITY</th>
                    <th>SALES</th>
                    <th>VALUE (AED)</th>
                    <th>COUNT MoM</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.map((row) => (
                    <tr key={row.name}>
                      <td>
                        <button
                          className="area-name"
                          onClick={() => setArea(row.name)}
                        >
                          <span className="row-number">
                            {(rankBy === "volume"
                              ? row.volumeRank
                              : row.valueRank
                            )
                              ?.toString()
                              .padStart(2, "0") ?? "—"}
                          </span>
                          {row.name}
                          <ArrowUpRight size={12} />
                        </button>
                      </td>
                      <td>
                        {row.transactions === null ? (
                          <span
                            className="missing-value"
                            title="Transaction count not supplied"
                          >
                            —
                          </span>
                        ) : (
                          number(row.transactions)
                        )}
                        {row.transactions !== null && (
                          <div className="table-bar">
                            <span
                              style={{
                                width: `${(row.transactions / 928) * 100}%`,
                              }}
                            />
                          </div>
                        )}
                      </td>
                      <td>
                        {row.salesValue === null ? (
                          <span
                            className="missing-value"
                            title="Sales value not supplied"
                          >
                            —
                          </span>
                        ) : (
                          `${billions(row.salesValue)}bn`
                        )}
                      </td>
                      <td>
                        {row.transactionsMom === null ? (
                          <span
                            className="missing-value"
                            title="Monthly comparison not supplied"
                          >
                            —
                          </span>
                        ) : (
                          <Delta value={row.transactionsMom} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="panel-bottom">
              Partial area dataset · — means not supplied
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setArea(allAreas)}
              >
                All Dubai <ArrowRight size={14} />
              </Button>
            </div>
          </section>
          <div className="context-column">
            <section className="panel property-panel">
              <div className="panel-heading">
                <div>
                  <h2>Property &amp; income</h2>
                  <p>Dubai-wide context · not filtered by area</p>
                </div>
                <Building2 size={18} className="text-slate-400" />
              </div>
              <div className="property-share">
                <span>Apartment transaction share</span>
                <strong>
                  {market.apartmentShare}
                  <small>%</small>
                </strong>
                <div className="property-share-bar">
                  <span style={{ width: `${market.apartmentShare}%` }} />
                </div>
                <p>
                  Remaining {100 - market.apartmentShare}% is the derived share
                  of other property types.
                </p>
              </div>
              <div className="property-movement">
                <span>Villas &amp; townhouses</span>
                <strong>
                  <ArrowUpRight size={15} />
                  {market.villasTownhousesMom}%
                </strong>
                <small>month-on-month increase in transactions</small>
              </div>
              <div className="yield-block">
                <span className="eyebrow">APPROXIMATE GROSS RENTAL YIELD</span>
                <div>
                  <p>
                    <strong>~{market.apartmentYield.toFixed(1)}%</strong>
                    <span>Apartments</span>
                  </p>
                  <p>
                    <strong>~{market.villaYield.toFixed(1)}%</strong>
                    <span>Villas</span>
                  </p>
                </div>
                <small>
                  Gross yields; net yields and area-level estimates were not
                  supplied.
                </small>
              </div>
            </section>
            <section className="panel developer-empty" id="developers">
              <ChartNoAxesCombined size={22} />
              <div>
                <h2>Developer spotlight</h2>
                <p>
                  Developer performance data has not been supplied. Rankings
                  will appear when source figures are available.
                </p>
              </div>
            </section>
          </div>
        </div>
        <section className="insight-strip">
          <div className="insight-icon">
            <Sparkles size={20} />
          </div>
          <div>
            <span className="eyebrow">
              THE PROPWISE PERSPECTIVE · SEPTEMBER 2026
            </span>
            <p>{insight}</p>
            <small>
              Based on the supplied DLD-based summary · 1–30 September 2026 ·
              Data through 6 October 2026
            </small>
          </div>
        </section>
        <section className="panel source-notes">
          <div>
            <Info size={19} />
            <h2>Know the scope behind the numbers.</h2>
          </div>
          <p>
            Figures cover DLD-registered sales from 1–30 September 2026, using
            data available through 6 October 2026. Supplied by Propwise; this
            application has not independently retrieved or verified the DLD
            source.
          </p>
          <p>
            Area rankings are partial. Median prices are not averages. No
            absolute August series, year-over-year comparisons, developer
            breakdown, or area-level median prices were supplied. Small-area
            price-per-square-foot rankings should be treated cautiously where
            only one to four transactions are recorded; those rankings are not
            displayed here.
          </p>
        </section>
        <section className="newsletter" id="decode">
          <div className="newsletter-content">
            <span className="eyebrow">ONE CITY AT A TIME</span>
            <h2>
              A clearer perspective.
              <br />A more informed decision.
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
              onSubmit={(event) => {
                event.preventDefault();
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
                onChange={(event) => {
                  setEmail(event.target.value);
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
                ? "Preview signup received in this session. No email was stored or sent."
                : "Subscription preview only. Email delivery will be added in a later phase."}
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
            onClick={(event) => event.stopPropagation()}
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
              September 2026
              <br />
              {isCity ? "Dubai" : "Area"} market snapshot
            </h2>
            <p>
              {area} · DLD-registered sales, 1–30 September. Data through 6
              October 2026, supplied by Propwise.
            </p>
            <div className="report-summary">
              <span>
                Registered sales:{" "}
                {stats.transactions === null
                  ? "Not supplied"
                  : number(stats.transactions)}
              </span>
              <span>
                Sales value:{" "}
                {stats.salesValue === null
                  ? "Not supplied"
                  : `AED ${billions(stats.salesValue)}bn`}
              </span>
              <span>
                Median price / sq ft:{" "}
                {stats.medianPriceSqft === null
                  ? "Not supplied"
                  : `AED ${number(stats.medianPriceSqft)}`}
              </span>
            </div>
            <p>
              The CSV contains supplied metrics and source dates. Missing
              metrics are omitted, and Dubai-wide figures are excluded from
              area-only exports.
            </p>
            <Button onClick={download}>
              <ArrowDownToLine size={16} /> Download supplied data (CSV)
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
