import { useState, useEffect, useRef } from "react";
import { motion, useInView, useAnimation } from "framer-motion";
import { 
  Building2, HardHat, ShieldCheck, Factory, ChevronRight, MapPin, Mail, Phone, 
  ArrowUpRight, Ruler, Layers, ClipboardList, Microscope, Home as HomeIcon, 
  Warehouse, Hammer, Route, CheckCircle2, Clock, Award, Users, Headset, 
  Menu, X, Quote, ArrowRight
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// @ts-ignore
import logoImg from "@/assets/logo.png";
// @ts-ignore
import heroImg from "@/assets/images/hero.png";
// @ts-ignore
import project1Img from "@/assets/images/project-1.png";
// @ts-ignore
import project2Img from "@/assets/images/project-2.png";
// @ts-ignore
import project3Img from "@/assets/images/project-3.png";
// @ts-ignore
import aboutImg from "@/assets/images/about.png";

const FADE_UP = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const STAGGER = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

function AnimatedCounter({ from, to, duration = 2, suffix = "" }: { from: number, to: number, duration?: number, suffix?: string }) {
  const [count, setCount] = useState(from);
  const nodeRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(nodeRef, { once: true });

  useEffect(() => {
    if (inView) {
      let startTime: number;
      const animateCount = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = (timestamp - startTime) / (duration * 1000);
        if (progress < 1) {
          setCount(Math.floor(from + (to - from) * progress));
          requestAnimationFrame(animateCount);
        } else {
          setCount(to);
        }
      };
      requestAnimationFrame(animateCount);
    }
  }, [inView, from, to, duration]);

  return <span ref={nodeRef}>{count}{suffix}</span>;
}

// ─── Nepal Land & Measurement Calculator ────────────────────────────────────

const ROPANI_TO_SQM = 508.72;
const ROPANI_TO_SQFT = 5476;
const AANA_TO_SQM = ROPANI_TO_SQM / 16;
const PAISA_TO_SQM = AANA_TO_SQM / 4;
const DAAM_TO_SQM = PAISA_TO_SQM / 4;

const BIGHA_TO_SQM = 6772.63;
const KATTHA_TO_SQM = BIGHA_TO_SQM / 20;
const DHUR_TO_SQM = KATTHA_TO_SQM / 20;

interface LandResult { label: string; value: string }

const LENGTH_UNITS: { label: string; toMeter: number }[] = [
  { label: "Meter (m)", toMeter: 1 },
  { label: "Centimeter (cm)", toMeter: 0.01 },
  { label: "Millimeter (mm)", toMeter: 0.001 },
  { label: "Kilometer (km)", toMeter: 1000 },
  { label: "Foot (ft)", toMeter: 0.3048 },
  { label: "Inch (in)", toMeter: 0.0254 },
  { label: "Yard (yd)", toMeter: 0.9144 },
  { label: "Mile (mi)", toMeter: 1609.344 },
  { label: "Haat (हात)", toMeter: 0.4572 },
  { label: "Dhanusha (धनुषा)", toMeter: 1.8288 },
];

const AREA_UNITS: { label: string; toSqm: number }[] = [
  { label: "Square Meter (sq.m)", toSqm: 1 },
  { label: "Square Foot (sq.ft)", toSqm: 0.092903 },
  { label: "Square Kilometer (sq.km)", toSqm: 1e6 },
  { label: "Hectare (ha)", toSqm: 10000 },
  { label: "Acre", toSqm: 4046.86 },
  { label: "Ropani", toSqm: ROPANI_TO_SQM },
  { label: "Aana", toSqm: AANA_TO_SQM },
  { label: "Bigha", toSqm: BIGHA_TO_SQM },
  { label: "Kattha", toSqm: KATTHA_TO_SQM },
];

// ─── Cost Estimator Data ─────────────────────────────────────────────────────

const COST_RATES: Record<string, Record<string, number>> = {
  residential: { basic: 1800, standard: 2600, premium: 3800, luxury: 6000 },
  commercial:  { basic: 2400, standard: 3400, premium: 5000, luxury: 7500 },
  industrial:  { basic: 1500, standard: 2100, premium: 3000, luxury: 4000 },
};

const COST_BREAKDOWN = [
  { label: "Civil / Structure",      pct: 0.40, color: "bg-primary" },
  { label: "Finishing & Interior",   pct: 0.22, color: "bg-accent" },
  { label: "Electrical Works",       pct: 0.10, color: "bg-yellow-500" },
  { label: "Plumbing & Sanitary",    pct: 0.08, color: "bg-green-500" },
  { label: "Doors & Windows",        pct: 0.08, color: "bg-purple-500" },
  { label: "Misc / Contingency",     pct: 0.12, color: "bg-orange-500" },
];

const AREA_INPUT_UNITS: { label: string; toSqft: number }[] = [
  { label: "Square Feet (sq.ft)", toSqft: 1 },
  { label: "Square Meter (sq.m)", toSqft: 10.7639 },
  { label: "Ropani", toSqft: ROPANI_TO_SQFT },
  { label: "Aana", toSqft: ROPANI_TO_SQFT / 16 },
  { label: "Paisa", toSqft: ROPANI_TO_SQFT / 64 },
  { label: "Kattha", toSqft: 3645 },
  { label: "Dhur", toSqft: 182.25 },
];

function fmtNPR(n: number) {
  if (n >= 10_000_000) return `Rs. ${(n / 10_000_000).toFixed(2)} Crore`;
  if (n >= 100_000)    return `Rs. ${(n / 100_000).toFixed(2)} Lakh`;
  return `Rs. ${Math.round(n).toLocaleString("en-IN")}`;
}

// ─── Plot Area Calculator ─────────────────────────────────────────────────────

interface PlotResult {
  sqm: number;
  sqft: number;
  ropani: number;
  aana: number;
  paisa: number;
  dam: number;
}

function heronArea(a: number, b: number, c: number): number {
  const s = (a + b + c) / 2;
  const val = s * (s - a) * (s - b) * (s - c);
  return val > 0 ? Math.sqrt(val) : 0;
}

function sqmToRapd(sqm: number) {
  const totalDam = sqm / DAAM_TO_SQM;
  const ropani = Math.floor(totalDam / 256);
  const rem1 = totalDam % 256;
  const aana = Math.floor(rem1 / 16);
  const rem2 = rem1 % 16;
  const paisa = Math.floor(rem2 / 4);
  const dam = Math.round(rem2 % 4);
  return { ropani, aana, paisa, dam };
}

// ─────────────────────────────────────────────────────────────────────────────

function CalculatorTool() {
  const [tab, setTab] = useState<"land" | "length" | "cost" | "plot">("land");
  const [landSubTab, setLandSubTab] = useState<"sqm" | "sqft" | "rapd" | "bkd">("sqm");
  const [landSqm, setLandSqm] = useState<number | null>(null);
  const [landFields, setLandFields] = useState({ sqm: "", sqft: "", ropani: "", aana: "", paisa: "", dam: "", bigha: "", kattha: "", dhur: "" });
  const [landResults, setLandResults] = useState<LandResult[]>([]);
  const activeLandField = useRef<string | null>(null);

  const [lengthValue, setLengthValue] = useState("");
  const [lengthFrom, setLengthFrom] = useState(0);
  const [lengthTo, setLengthTo] = useState(3);
  const [lengthResult, setLengthResult] = useState("");

  // Cost estimator state
  const [costArea, setCostArea] = useState("");
  const [costAreaUnit, setCostAreaUnit] = useState(0);
  const [costFloors, setCostFloors] = useState("1");
  const [costBuildingType, setCostBuildingType] = useState("residential");
  const [costGrade, setCostGrade] = useState("standard");
  const [costResult, setCostResult] = useState<{ total: number; perSqft: number; sqft: number; totalSqft: number } | null>(null);

  // Plot calculator state
  const [plotUnit, setPlotUnit] = useState<"ft" | "m">("ft");
  const [plotA, setPlotA] = useState("");
  const [plotB, setPlotB] = useState("");
  const [plotC, setPlotC] = useState("");
  const [plotD, setPlotD] = useState("");
  const [plotDiag, setPlotDiag] = useState("");
  const [plotResult, setPlotResult] = useState<PlotResult | null>(null);

  useEffect(() => {
    const v = parseFloat(costArea);
    const floors = parseFloat(costFloors) || 0;
    if (isNaN(v) || v <= 0 || floors <= 0) { setCostResult(null); return; }
    const totalSqft = v * AREA_INPUT_UNITS[costAreaUnit].toSqft * (floors + 1);
    const builtupRatio = costBuildingType === "residential" ? 0.70 : 0.60;
    const builtupSqft = totalSqft * builtupRatio;
    const perSqft = COST_RATES[costBuildingType][costGrade];
    setCostResult({ total: builtupSqft * perSqft, perSqft, sqft: builtupSqft, totalSqft });
  }, [costArea, costAreaUnit, costFloors, costBuildingType, costGrade]);

  const LAND_SQM_PER = { ropani: 508.72, aana: 508.72 / 16, paisa: 508.72 / 64, dam: 508.72 / 256, bigha: 6772.63, kattha: 6772.63 / 20, dhur: 6772.63 / 400 };
  const RAPD_FIELDS = ["ropani", "aana", "paisa", "dam"];
  const BKD_FIELDS  = ["bigha", "kattha", "dhur"];

  const handleLandField = (field: string, val: string) => {
    activeLandField.current = field;
    setLandFields(prev => {
      const next = { ...prev, [field]: val };
      let sqm = 0;
      if (field === "sqm") {
        sqm = parseFloat(val) || 0;
      } else if (field === "sqft") {
        sqm = (parseFloat(val) || 0) / 10.7639;
      } else if (RAPD_FIELDS.includes(field)) {
        sqm = (parseFloat(next.ropani) || 0) * LAND_SQM_PER.ropani
            + (parseFloat(next.aana)   || 0) * LAND_SQM_PER.aana
            + (parseFloat(next.paisa)  || 0) * LAND_SQM_PER.paisa
            + (parseFloat(next.dam)    || 0) * LAND_SQM_PER.dam;
      } else {
        sqm = (parseFloat(next.bigha)  || 0) * LAND_SQM_PER.bigha
            + (parseFloat(next.kattha) || 0) * LAND_SQM_PER.kattha
            + (parseFloat(next.dhur)   || 0) * LAND_SQM_PER.dhur;
      }
      setLandSqm(sqm > 0 ? sqm : null);
      return next;
    });
  };

  useEffect(() => {
    const fmt = (n: number, d = 4) => n.toFixed(d).replace(/\.?0+$/, "");
    if (landSqm === null) { setLandResults([]); return; }
    const sqm = landSqm;
    const sqft = sqm * 10.7639;
    const { ropani, aana, paisa, dam } = sqmToRapd(sqm);
    const bigha  = Math.floor(sqm / LAND_SQM_PER.bigha);
    const remAfterBigha = sqm - bigha * LAND_SQM_PER.bigha;
    const kattha = Math.floor(remAfterBigha / LAND_SQM_PER.kattha);
    const dhur   = Math.round((remAfterBigha - kattha * LAND_SQM_PER.kattha) / LAND_SQM_PER.dhur);
    const active = activeLandField.current ?? "";
    setLandFields(prev => {
      const next = { ...prev };
      if (active !== "sqm")  next.sqm  = fmt(sqm, 4);
      if (active !== "sqft") next.sqft = fmt(sqft, 2);
      if (!RAPD_FIELDS.includes(active)) {
        next.ropani = String(ropani); next.aana = String(aana);
        next.paisa  = String(paisa);  next.dam  = String(dam);
      }
      if (!BKD_FIELDS.includes(active)) {
        next.bigha = String(bigha); next.kattha = String(kattha); next.dhur = String(dhur);
      }
      return next;
    });
    setLandResults([
      { label: "Hectare (ha)", value: fmt(sqm / 10000, 6) },
      { label: "Acre",         value: fmt(sqm / 4046.86, 6) },
    ]);
  }, [landSqm]);

  useEffect(() => {
    const factor = plotUnit === "ft" ? 0.3048 : 1;
    const a = parseFloat(plotA) * factor;
    const b = parseFloat(plotB) * factor;
    const c = parseFloat(plotC) * factor;
    const d = parseFloat(plotD) * factor;
    const diag = parseFloat(plotDiag) * factor;
    if ([a, b, c, d, diag].some(v => isNaN(v) || v <= 0)) { setPlotResult(null); return; }
    const area1 = heronArea(a, b, diag);
    const area2 = heronArea(c, d, diag);
    if (area1 === 0 || area2 === 0) { setPlotResult(null); return; }
    const sqm = area1 + area2;
    const sqft = sqm * 10.7639;
    const { ropani, aana, paisa, dam } = sqmToRapd(sqm);
    setPlotResult({ sqm, sqft, ropani, aana, paisa, dam });
  }, [plotA, plotB, plotC, plotD, plotDiag, plotUnit]);

  useEffect(() => {
    const v = parseFloat(lengthValue);
    if (isNaN(v)) { setLengthResult(""); return; }
    const meters = v * LENGTH_UNITS[lengthFrom].toMeter;
    const result = meters / LENGTH_UNITS[lengthTo].toMeter;
    setLengthResult(result.toFixed(6).replace(/\.?0+$/, ""));
  }, [lengthValue, lengthFrom, lengthTo]);



  const inputCls = "bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-primary focus:outline-none rounded px-4 py-3 w-full text-sm";
  const selectCls = "bg-white/5 border border-white/10 text-white focus:border-primary focus:outline-none rounded px-4 py-3 w-full text-sm appearance-none cursor-pointer";

  return (
    <div className="max-w-4xl mx-auto">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {[
          { key: "land", label: "🏔 Land Units (Nepal)" },
          { key: "length", label: "📏 Length" },
          { key: "cost", label: "🏗 Cost Estimator" },
          { key: "plot", label: "📐 Plot Area" },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as typeof tab)}
            className={`px-5 py-2 text-sm font-semibold rounded transition-colors ${
              tab === t.key
                ? "bg-primary text-white"
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Land Tab */}
      {tab === "land" && (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left — 4 sub-tabs */}
          <div>
            {/* Sub-tab buttons */}
            <div className="flex gap-1 mb-5 bg-white/5 p-1 rounded-lg border border-white/10">
              {([
                { key: "sqm",  label: "1. sq.m" },
                { key: "sqft", label: "2. sq.ft" },
                { key: "rapd", label: "3. R-A-P-D" },
                { key: "bkd",  label: "4. B-K-D" },
              ] as const).map(s => (
                <button
                  key={s.key}
                  onClick={() => setLandSubTab(s.key)}
                  className={`flex-1 py-2 text-xs font-bold rounded transition-colors ${
                    landSubTab === s.key
                      ? "bg-primary text-white shadow"
                      : "text-white/50 hover:text-white/80"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Tab 1 — sq.m */}
            {landSubTab === "sqm" && (
              <div className="space-y-3">
                <label className="text-xs text-white/40 uppercase tracking-wider block">Square Meter</label>
                <input type="number" min="0" placeholder="e.g. 508.72" value={landFields.sqm} onChange={e => handleLandField("sqm", e.target.value)} className={inputCls} autoFocus />
              </div>
            )}

            {/* Tab 2 — sq.ft */}
            {landSubTab === "sqft" && (
              <div className="space-y-3">
                <label className="text-xs text-white/40 uppercase tracking-wider block">Square Feet</label>
                <input type="number" min="0" placeholder="e.g. 5476" value={landFields.sqft} onChange={e => handleLandField("sqft", e.target.value)} className={inputCls} autoFocus />
              </div>
            )}

            {/* Tab 3 — R-A-P-D */}
            {landSubTab === "rapd" && (
              <div className="space-y-3">
                <p className="text-xs text-white/40 uppercase tracking-wider">Ropani System — values add together</p>
                {[
                  { key: "ropani", label: "Ropani (रोपनी)" },
                  { key: "aana",   label: "Aana (आना)" },
                  { key: "paisa",  label: "Paisa (पैसा)" },
                  { key: "dam",    label: "Dam (दाम)" },
                ].map((f, i) => (
                  <div key={f.key}>
                    <label className="text-xs text-white/40 mb-1 block">{f.label}</label>
                    <input type="number" min="0" placeholder="0" value={landFields[f.key as keyof typeof landFields]} onChange={e => handleLandField(f.key, e.target.value)} className={inputCls} autoFocus={i === 0} />
                  </div>
                ))}
              </div>
            )}

            {/* Tab 4 — B-K-D */}
            {landSubTab === "bkd" && (
              <div className="space-y-3">
                <p className="text-xs text-white/40 uppercase tracking-wider">Bigha System — values add together</p>
                {[
                  { key: "bigha",  label: "Bigha (बिघा)" },
                  { key: "kattha", label: "Kattha (कट्ठा)" },
                  { key: "dhur",   label: "Dhur (धुर)" },
                ].map((f, i) => (
                  <div key={f.key}>
                    <label className="text-xs text-white/40 mb-1 block">{f.label}</label>
                    <input type="number" min="0" placeholder="0" value={landFields[f.key as keyof typeof landFields]} onChange={e => handleLandField(f.key, e.target.value)} className={inputCls} autoFocus={i === 0} />
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded text-xs text-white/35 leading-relaxed">
              <span className="text-primary/60">Hilly: </span>1 Ropani = 16 Aana = 64 Paisa = 256 Dam = 508.72 sq.m<br />
              <span className="text-accent/60">Terai: </span>1 Bigha = 20 Kattha = 400 Dhur = 6,772.63 sq.m
            </div>
          </div>

          {/* Right — all conversions */}
          <div>
            <p className="text-xs text-white/50 uppercase tracking-wider mb-3">All Conversions</p>
            {!landSqm ? (
              <div className="flex items-center justify-center h-48 border border-white/10 rounded text-white/30 text-sm">
                Enter a value in any tab
              </div>
            ) : (
              <div className="space-y-1">
                {[
                  { label: "Square Meter",   value: landFields.sqm,    hi: landSubTab === "sqm" },
                  { label: "Square Feet",    value: landFields.sqft,   hi: landSubTab === "sqft" },
                  { label: "Ropani",         value: landFields.ropani, hi: landSubTab === "rapd" },
                  { label: "Aana",           value: landFields.aana,   hi: landSubTab === "rapd" },
                  { label: "Paisa",          value: landFields.paisa,  hi: landSubTab === "rapd" },
                  { label: "Dam",            value: landFields.dam,    hi: landSubTab === "rapd" },
                  { label: "Bigha",          value: landFields.bigha,  hi: landSubTab === "bkd" },
                  { label: "Kattha",         value: landFields.kattha, hi: landSubTab === "bkd" },
                  { label: "Dhur",           value: landFields.dhur,   hi: landSubTab === "bkd" },
                  ...landResults.map(r => ({ label: r.label, value: r.value, hi: false })),
                ].map((r, i) => (
                  <div key={i} className={`flex justify-between items-center px-3 py-2 rounded border text-sm ${r.hi ? "border-primary/30 bg-primary/5" : "border-white/10 bg-white/5"}`}>
                    <span className={r.hi ? "text-white/70" : "text-white/50"}>{r.label}</span>
                    <span className={`font-mono font-bold ${r.hi ? "text-primary" : "text-white/80"}`}>{r.value || "0"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Length Tab */}
      {tab === "length" && (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">Value</label>
              <input type="number" placeholder="Enter value" value={lengthValue} onChange={e => setLengthValue(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">From</label>
              <select value={lengthFrom} onChange={e => setLengthFrom(Number(e.target.value))} className={selectCls}>
                {LENGTH_UNITS.map((u, i) => <option key={i} value={i} className="bg-gray-900">{u.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">To</label>
              <select value={lengthTo} onChange={e => setLengthTo(Number(e.target.value))} className={selectCls}>
                {LENGTH_UNITS.map((u, i) => <option key={i} value={i} className="bg-gray-900">{u.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-xs text-white/50 uppercase tracking-wider mb-3">Result</p>
            <div className="p-8 border border-white/10 rounded bg-white/5 text-center">
              {lengthResult ? (
                <>
                  <p className="text-4xl font-mono font-black text-primary mb-2">{lengthResult}</p>
                  <p className="text-white/50 text-sm">{LENGTH_UNITS[lengthTo].label}</p>
                </>
              ) : (
                <p className="text-white/30 text-sm">Enter a value to convert</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cost Estimator Tab */}
      {tab === "cost" && (
        <div>
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Inputs */}
            <div className="space-y-5">
              {/* Building Type */}
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Building Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "residential", icon: "🏠", label: "Residential" },
                    { key: "commercial",  icon: "🏢", label: "Commercial" },
                    { key: "industrial",  icon: "🏭", label: "Industrial" },
                  ].map(bt => (
                    <button
                      key={bt.key}
                      onClick={() => setCostBuildingType(bt.key)}
                      className={`py-3 px-2 rounded text-xs font-bold flex flex-col items-center gap-1 transition-colors border ${
                        costBuildingType === bt.key
                          ? "bg-primary border-primary text-white"
                          : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span className="text-xl">{bt.icon}</span>
                      {bt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality Grade */}
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Construction Quality</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { key: "basic",    label: "Basic",    sub: "Economy" },
                    { key: "standard", label: "Standard", sub: "Mid-range" },
                    { key: "premium",  label: "Premium",  sub: "High-end" },
                    { key: "luxury",   label: "Luxury",   sub: "Top-tier" },
                  ].map(g => (
                    <button
                      key={g.key}
                      onClick={() => setCostGrade(g.key)}
                      className={`py-3 rounded text-xs font-bold flex flex-col items-center gap-0.5 transition-colors border ${
                        costGrade === g.key
                          ? "bg-accent border-accent text-white"
                          : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span>{g.label}</span>
                      <span className="font-normal opacity-70">{g.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Plot Area */}
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Total Plot Area (per floor)</label>
                <div className="flex flex-col gap-2">
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={costArea}
                      onChange={e => setCostArea(e.target.value)}
                      className={inputCls + " pr-16"}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-sm font-medium pointer-events-none select-none">
                      {costAreaUnit === 0 ? "sq.ft" : "sq.m"}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {[{ label: "sq.ft", val: 0 }, { label: "sq.m", val: 1 }].map(u => (
                      <button
                        key={u.val}
                        onClick={() => setCostAreaUnit(u.val)}
                        className={`px-3 py-1 rounded text-xs font-semibold border transition-colors ${
                          costAreaUnit === u.val
                            ? "bg-primary border-primary text-white"
                            : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                        }`}
                      >{u.label}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Number of Floors */}
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">Number of Floors</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  placeholder=""
                  value={costFloors}
                  onChange={e => setCostFloors(e.target.value)}
                  className={inputCls}
                />
                <p className="text-xs text-white/30 mt-1">Decimals allowed — e.g. 2.5 for ground + 2 full + half floor</p>
              </div>

              {/* Rate info */}
              <div className="p-3 bg-white/5 border border-white/10 rounded text-xs text-white/40">
                Current rate: <span className="text-white/70 font-bold">
                  Rs. {COST_RATES[costBuildingType][costGrade].toLocaleString("en-IN")} / sq.ft
                </span> · Rates are indicative estimates for Kathmandu Valley (2025)
              </div>
            </div>

            {/* Results Panel */}
            <div className="flex flex-col gap-4">
              {/* Area breakdown */}
              {costResult && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white/5 border border-white/10 rounded text-center">
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Total Area</p>
                    <p className="text-lg font-mono font-bold text-white">{Math.round(costResult.totalSqft).toLocaleString("en-IN")}</p>
                    <p className="text-xs text-white/30">sq.ft ({costFloors} floor{parseFloat(costFloors) > 1 ? "s" : ""} + 1 foundation)</p>
                  </div>
                  <div className="p-3 bg-accent/10 border border-accent/30 rounded text-center">
                    <p className="text-xs text-accent/70 uppercase tracking-wider mb-1">Built-up Area</p>
                    <p className="text-lg font-mono font-bold text-accent">{Math.round(costResult.sqft).toLocaleString("en-IN")}</p>
                    <p className="text-xs text-white/30">sq.ft ({costBuildingType === "residential" ? "70%" : "60%"} of total)</p>
                  </div>
                </div>
              )}

              {/* Total Cost */}
              <div className="p-6 border-2 border-primary/40 rounded bg-primary/5 text-center">
                <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Estimated Total Cost</p>
                {costResult ? (
                  <>
                    <p className="text-4xl font-mono font-black text-primary leading-tight">
                      {fmtNPR(costResult.total)}
                    </p>
                    <p className="text-white/40 text-xs mt-1">
                      Based on {Math.round(costResult.sqft).toLocaleString("en-IN")} sq.ft built-up × Rs. {costResult.perSqft.toLocaleString("en-IN")}/sq.ft
                    </p>
                    <p className="text-white/30 text-xs mt-2 leading-relaxed">
                      Includes civil structure, finishing, electrical, plumbing, doors &amp; windows, and a contingency allowance. Foundation slab area (1 extra floor) is added to account for excavation, footing, and substructure costs.
                    </p>
                  </>
                ) : (
                  <p className="text-white/30 text-sm py-4">Fill in the details to see estimate</p>
                )}
              </div>

              {/* Breakdown */}
              {costResult && (
                <div className="border border-white/10 rounded overflow-hidden">
                  <p className="text-xs text-white/50 uppercase tracking-wider px-4 py-3 border-b border-white/10 bg-white/5">
                    Cost Breakdown
                  </p>
                  {COST_BREAKDOWN.map((item, i) => {
                    const amt = costResult.total * item.pct;
                    const barW = Math.round(item.pct * 100);
                    return (
                      <div key={i} className="px-4 py-3 border-b border-white/5 last:border-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-white/70">{item.label}</span>
                          <span className="text-sm font-mono font-bold text-white">{fmtNPR(amt)}</span>
                        </div>
                        <div className="h-1 bg-white/10 rounded overflow-hidden">
                          <div className={`h-full ${item.color} rounded`} style={{ width: `${barW}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {costResult && (
                <div className="p-3 bg-white/5 border border-white/10 rounded text-xs text-white/40 leading-relaxed">
                  ⚠ This is a rough estimate only. Actual costs vary based on site conditions, material prices, design complexity, and labour rates. Contact Mahakali Engineers for a detailed quote.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Plot Area Tab */}
      {tab === "plot" && (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Inputs */}
          <div className="space-y-4">
            {/* Unit toggle */}
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Measurement Unit</label>
              <div className="flex gap-2">
                {(["ft", "m"] as const).map(u => (
                  <button
                    key={u}
                    onClick={() => setPlotUnit(u)}
                    className={`flex-1 py-2.5 rounded text-sm font-bold transition-colors border ${
                      plotUnit === u
                        ? "bg-primary border-primary text-white"
                        : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {u === "ft" ? "Feet (ft)" : "Meter (m)"}
                  </button>
                ))}
              </div>
            </div>

            {/* Diagram hint */}
            <div className="p-3 bg-white/5 border border-white/10 rounded text-xs text-white/50 leading-relaxed">
              <div className="font-bold text-white/70 mb-1">How to measure your plot:</div>
              Draw a diagonal across your plot to split it into 2 triangles.<br />
              Triangle 1 uses sides <span className="text-primary font-bold">A + B + Diagonal</span>.<br />
              Triangle 2 uses sides <span className="text-accent font-bold">C + D + Diagonal</span>.
            </div>

            {/* Side A & B */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">Side A ({plotUnit})</label>
                <input type="number" min="0" placeholder="e.g. 40" value={plotA} onChange={e => setPlotA(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">Side B ({plotUnit})</label>
                <input type="number" min="0" placeholder="e.g. 35" value={plotB} onChange={e => setPlotB(e.target.value)} className={inputCls} />
              </div>
            </div>

            {/* Diagonal */}
            <div>
              <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">Diagonal ({plotUnit})</label>
              <input type="number" min="0" placeholder="e.g. 53" value={plotDiag} onChange={e => setPlotDiag(e.target.value)} className={inputCls} />
            </div>

            {/* Side C & D */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">Side C ({plotUnit})</label>
                <input type="number" min="0" placeholder="e.g. 38" value={plotC} onChange={e => setPlotC(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block">Side D ({plotUnit})</label>
                <input type="number" min="0" placeholder="e.g. 42" value={plotD} onChange={e => setPlotD(e.target.value)} className={inputCls} />
              </div>
            </div>

            <button
              onClick={() => { setPlotA(""); setPlotB(""); setPlotC(""); setPlotD(""); setPlotDiag(""); }}
              className="w-full py-2 text-xs font-semibold text-white/40 hover:text-white/70 border border-white/10 rounded transition-colors"
            >
              Clear All
            </button>
          </div>

          {/* Results */}
          <div className="space-y-3">
            <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Plot Area Results</p>

            {!plotResult ? (
              <div className="flex flex-col items-center justify-center h-64 border border-white/10 rounded bg-white/5 text-white/30 text-sm gap-2">
                <span className="text-3xl">📐</span>
                Enter all 5 measurements to calculate area
              </div>
            ) : (
              <>
                {/* sq.m and sq.ft */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 border-2 border-primary/40 rounded bg-primary/5 text-center">
                    <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Sq. Meters</p>
                    <p className="text-2xl font-mono font-black text-primary">{plotResult.sqm.toFixed(2)}</p>
                    <p className="text-xs text-white/40">sq.m</p>
                  </div>
                  <div className="p-4 border-2 border-accent/40 rounded bg-accent/5 text-center">
                    <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Sq. Feet</p>
                    <p className="text-2xl font-mono font-black text-accent">{plotResult.sqft.toFixed(2)}</p>
                    <p className="text-xs text-white/40">sq.ft</p>
                  </div>
                </div>

                {/* Ropani breakdown */}
                <div className="border border-white/10 rounded overflow-hidden">
                  <p className="text-xs text-white/50 uppercase tracking-wider px-4 py-3 border-b border-white/10 bg-white/5">
                    Ropani System (Hilly Nepal — रोपनी)
                  </p>
                  <div className="grid grid-cols-4 divide-x divide-white/10">
                    {[
                      { label: "Ropani", nepali: "रोपनी", value: plotResult.ropani },
                      { label: "Aana", nepali: "आना", value: plotResult.aana },
                      { label: "Paisa", nepali: "पैसा", value: plotResult.paisa },
                      { label: "Dam", nepali: "दाम", value: plotResult.dam },
                    ].map((item, i) => (
                      <div key={i} className="p-4 text-center">
                        <p className="text-2xl font-mono font-black text-white">{item.value}</p>
                        <p className="text-xs text-white/60 font-semibold mt-0.5">{item.label}</p>
                        <p className="text-xs text-white/30">{item.nepali}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-white/5 border border-white/10 rounded text-xs text-white/40 leading-relaxed">
                  1 Ropani = 16 Aana = 64 Paisa = 256 Dam = 508.72 sq.m · Calculated using Heron's formula
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Contact Form Component ───────────────────────────────────────────────────

const PROJECT_TYPES = [
  "Residential Building",
  "Commercial Complex",
  "Industrial Facility",
  "Bridge / Infrastructure",
  "Road Construction",
  "Structural Consulting",
  "Architectural Design",
  "Other",
];

function ContactForm() {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", projectType: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.email || !form.message) return;
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json() as { success?: boolean; error?: string };
      if (!res.ok || !data.success) throw new Error(data.error || "Submission failed");
      setStatus("success");
      setForm({ firstName: "", lastName: "", email: "", phone: "", projectType: "", message: "" });
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  const inputCls = "w-full rounded-none border border-white/20 bg-white/5 h-12 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-primary text-sm transition-colors";
  const labelCls = "block text-sm font-semibold text-white/80 mb-1";

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center relative z-10">
        <div className="w-16 h-16 bg-green-500/10 border-2 border-green-500 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="h-8 w-8 text-green-400" />
        </div>
        <h4 className="text-2xl font-display font-bold text-white mb-3">Inquiry Sent!</h4>
        <p className="text-white/60 mb-2">Thank you! We've received your message and sent a confirmation to your email.</p>
        <p className="text-white/40 text-sm mb-8">Our team will get back to you within 24 hours.</p>
        <button onClick={() => setStatus("idle")} className="text-primary text-sm font-bold underline underline-offset-4 hover:text-primary/80 transition-colors">
          Send another inquiry
        </button>
      </div>
    );
  }

  return (
    <form className="space-y-5 relative z-10" onSubmit={handleSubmit}>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>First Name *</label>
          <input required value={form.firstName} onChange={set("firstName")} className={inputCls} placeholder="Ram" />
        </div>
        <div>
          <label className={labelCls}>Last Name</label>
          <input value={form.lastName} onChange={set("lastName")} className={inputCls} placeholder="Sharma" />
        </div>
      </div>
      <div>
        <label className={labelCls}>Email Address *</label>
        <input required type="email" value={form.email} onChange={set("email")} className={inputCls} placeholder="ram@example.com" />
      </div>
      <div>
        <label className={labelCls}>Phone Number</label>
        <input type="tel" value={form.phone} onChange={set("phone")} className={inputCls} placeholder="+977 98XXXXXXXX" />
      </div>
      <div>
        <label className={labelCls}>Project Type</label>
        <select value={form.projectType} onChange={set("projectType")} className={inputCls + " appearance-none cursor-pointer"}>
          <option value="" className="bg-gray-900">Select project type...</option>
          {PROJECT_TYPES.map(pt => <option key={pt} value={pt} className="bg-gray-900">{pt}</option>)}
        </select>
      </div>
      <div>
        <label className={labelCls}>Project Details *</label>
        <textarea
          required
          value={form.message}
          onChange={set("message")}
          rows={4}
          className={inputCls + " h-auto py-3 resize-none"}
          placeholder="Describe your project — location, size, timeline, budget range..."
        />
      </div>

      {status === "error" && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
          {errorMsg}
        </div>
      )}

      <Button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-none h-14 text-base font-bold bg-primary hover:bg-primary/90 text-white mt-2 disabled:opacity-60"
      >
        {status === "sending" ? (
          <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</span>
        ) : (
          <span className="flex items-center gap-2">Submit Inquiry <ArrowRight className="h-5 w-5" /></span>
        )}
      </Button>
      <p className="text-white/30 text-xs text-center">We'll reply within 24 hours. Your info is never shared.</p>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden font-sans">
      
      {/* Top Info Bar */}
      <div className="hidden lg:flex justify-between items-center bg-secondary text-white/60 text-xs px-6 py-2">
        <div className="flex items-center gap-2">
          <MapPin className="h-3 w-3 text-primary" />
          <span>Chabahil-07, Kathmandu, Nepal</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="mailto:mahakaliengineers885@gmail.com" className="flex items-center gap-2 hover:text-white transition-colors">
            <Mail className="h-3 w-3 text-primary" />
            mahakaliengineers885@gmail.com
          </a>
          <a href="tel:+9779851405916" className="flex items-center gap-2 hover:text-white transition-colors">
            <Phone className="h-3 w-3 text-primary" />
            +977 9851405916
          </a>
        </div>
      </div>

      {/* Navigation */}
      <nav className={`fixed left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "top-0 bg-background/95 backdrop-blur-md border-b border-border shadow-sm py-4" : "top-0 lg:top-8 bg-transparent py-6"}`}>
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center cursor-pointer" onClick={() => scrollTo("home")}>
            <img src={logoImg} alt="Mahakali Engineers and Developers" className="h-12 w-auto object-contain" style={{ filter: scrolled ? "none" : "brightness(0) invert(1)" }} />
          </div>
          
          <div className="hidden lg:flex items-center gap-8 text-sm font-semibold">
            <button onClick={() => scrollTo("about")} className={`hover:text-primary transition-colors ${scrolled ? "text-foreground" : "text-white/90 drop-shadow-md"}`}>About Us</button>
            <button onClick={() => scrollTo("services")} className={`hover:text-primary transition-colors ${scrolled ? "text-foreground" : "text-white/90 drop-shadow-md"}`}>Expertise</button>
            <button onClick={() => scrollTo("projects")} className={`hover:text-primary transition-colors ${scrolled ? "text-foreground" : "text-white/90 drop-shadow-md"}`}>Projects</button>
            <button onClick={() => scrollTo("process")} className={`hover:text-primary transition-colors ${scrolled ? "text-foreground" : "text-white/90 drop-shadow-md"}`}>Process</button>
            <button onClick={() => scrollTo("calculator")} className={`hover:text-primary transition-colors ${scrolled ? "text-foreground" : "text-white/90 drop-shadow-md"}`}>Calculator</button>
            <a href="/portal/" className={`hover:text-primary transition-colors ${scrolled ? "text-foreground" : "text-white/90 drop-shadow-md"}`}>
              Client Portal
            </a>
            <Button onClick={() => scrollTo("contact")} variant="default" className="rounded-none font-bold ml-4">
              Get a Quote
            </Button>
          </div>

          <button className="lg:hidden p-2 text-white bg-primary rounded-sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background pt-24 px-6 flex flex-col gap-6 lg:hidden shadow-2xl">
          <button onClick={() => scrollTo("about")} className="text-xl font-bold text-left border-b pb-4">About Us</button>
          <button onClick={() => scrollTo("services")} className="text-xl font-bold text-left border-b pb-4">Expertise</button>
          <button onClick={() => scrollTo("projects")} className="text-xl font-bold text-left border-b pb-4">Projects</button>
          <button onClick={() => scrollTo("process")} className="text-xl font-bold text-left border-b pb-4">Process</button>
          <button onClick={() => scrollTo("calculator")} className="text-xl font-bold text-left border-b pb-4">Calculator</button>
          <a href="/portal/" className="text-xl font-bold text-left border-b pb-4 text-primary">Client Portal</a>
          <Button onClick={() => scrollTo("contact")} size="lg" className="rounded-none font-bold w-full mt-4">
            Get a Quote
          </Button>
        </div>
      )}

      {/* Hero Section */}
      <section id="home" className="relative h-[100dvh] flex items-center pt-20">
        <div className="absolute inset-0 z-0 bg-secondary">
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/90 via-secondary/70 to-transparent z-10" />
          <img src={heroImg} alt="Construction Site" className="w-full h-full object-cover opacity-60" />
        </div>
        <div className="container mx-auto px-6 relative z-20">
          <div className="flex items-stretch gap-6 max-w-5xl">
            <div className="w-2 bg-primary self-stretch hidden md:block rounded-full" />
            <motion.div initial="hidden" animate="visible" variants={STAGGER} className="flex-1">
              <motion.div variants={FADE_UP} className="inline-block bg-primary/20 backdrop-blur-sm border border-primary/50 text-white px-4 py-1.5 rounded-full mb-6 text-sm font-semibold tracking-wider uppercase">
                Premier Construction in Nepal
              </motion.div>
              <motion.h1 variants={FADE_UP} className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white leading-[1.1] mb-6">
                Engineering <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">Excellence</span> <br/>
                For Future Generations.
              </motion.h1>
              <motion.p variants={FADE_UP} className="text-lg md:text-xl text-white/80 max-w-2xl mb-10 leading-relaxed">
                Mahakali Engineers and Developers delivers massive infrastructure, commercial structures, and robust civil works with uncompromising precision.
              </motion.p>
              <motion.div variants={FADE_UP} className="flex flex-wrap gap-4 items-center">
                <Button size="lg" className="rounded-none text-base h-14 px-8 bg-primary hover:bg-primary/90" onClick={() => scrollTo("projects")}>
                  Our Projects <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
                <div className="hidden sm:flex items-center gap-6 ml-6 border-l border-white/20 pl-6">
                  <div>
                    <div className="text-3xl font-display font-bold text-white"><AnimatedCounter from={0} to={25} suffix="+" /></div>
                    <div className="text-xs text-white/60 uppercase tracking-widest">Years Exp</div>
                  </div>
                  <div>
                    <div className="text-3xl font-display font-bold text-white"><AnimatedCounter from={0} to={450} suffix="+" /></div>
                    <div className="text-xs text-white/60 uppercase tracking-widest">Projects</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-secondary text-white py-12 relative z-30 -mt-10 mx-6 md:mx-12 lg:mx-24 shadow-2xl border-b-4 border-primary">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/10 text-center">
            {[
              { label: "Years Experience", value: "25", suffix: "+" },
              { label: "Projects Completed", value: "450", suffix: "+" },
              { label: "Active Sites", value: "32", suffix: "" },
              { label: "Skilled Professionals", value: "1200", suffix: "+" }
            ].map((stat, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP} className="flex flex-col gap-1 px-4">
                <div className="text-4xl md:text-5xl font-display font-bold text-primary">
                  <AnimatedCounter from={0} to={parseInt(stat.value)} suffix={stat.suffix} />
                </div>
                <div className="text-xs md:text-sm text-white/70 font-semibold uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Clients & Partners Strip */}
      <section className="py-14 bg-muted/40 border-y border-border overflow-hidden">
        <div className="container mx-auto px-6 mb-8">
          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-center text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground"
          >
            Trusted By Leading Organizations Across Nepal
          </motion.p>
        </div>
        <div className="relative overflow-hidden">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-muted/40 to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-muted/40 to-transparent pointer-events-none" />
          <div className="animate-marquee">
            {[
              { name: "Nepal Electricity Authority", abbr: "NEA" },
              { name: "Department of Roads", abbr: "DoR" },
              { name: "Kathmandu Metropolitan City", abbr: "KMC" },
              { name: "Nepal Infrastructure Bank", abbr: "NIFRA" },
              { name: "Tribhuvan University", abbr: "TU" },
              { name: "Civil Bank Ltd.", abbr: "CBL" },
              { name: "Hetauda Cement Industry", abbr: "HCI" },
              { name: "Nepal Telecom", abbr: "NT" },
              { name: "Department of Urban Development", abbr: "DUDBC" },
              { name: "Shangrila Development Bank", abbr: "SDB" },
              /* duplicate set for seamless loop */
              { name: "Nepal Electricity Authority", abbr: "NEA" },
              { name: "Department of Roads", abbr: "DoR" },
              { name: "Kathmandu Metropolitan City", abbr: "KMC" },
              { name: "Nepal Infrastructure Bank", abbr: "NIFRA" },
              { name: "Tribhuvan University", abbr: "TU" },
              { name: "Civil Bank Ltd.", abbr: "CBL" },
              { name: "Hetauda Cement Industry", abbr: "HCI" },
              { name: "Nepal Telecom", abbr: "NT" },
              { name: "Department of Urban Development", abbr: "DUDBC" },
              { name: "Shangrila Development Bank", abbr: "SDB" },
            ].map((partner, i) => (
              <div
                key={i}
                className="flex-shrink-0 mx-10 flex flex-col items-center gap-2 group"
                data-testid={`partner-logo-${i}`}
              >
                <div className="w-16 h-16 rounded-full border-2 border-border bg-background group-hover:border-primary transition-colors duration-300 flex items-center justify-center">
                  <span className="text-xs font-black text-muted-foreground group-hover:text-primary transition-colors duration-300 tracking-tight text-center leading-tight px-1">
                    {partner.abbr}
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground font-medium text-center max-w-[90px] leading-tight group-hover:text-foreground transition-colors duration-300">
                  {partner.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4 Pillars Section */}
      <section className="py-24 md:py-32 bg-secondary text-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={STAGGER}
            className="text-center mb-16"
          >
            <motion.p variants={FADE_UP} className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-3">Our Core Divisions</motion.p>
            <motion.h2 variants={FADE_UP} className="text-3xl md:text-5xl font-display font-bold text-white">
              Four Pillars of Excellence
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-0 border border-white/10">
            {[
              {
                num: "01",
                title: "Construction",
                color: "bg-primary",
                desc: "From ground-breaking to handover — residential, commercial, and industrial structures built to last with precision and care.",
                icon: HardHat,
                items: ["Residential Buildings", "Commercial Complexes", "Industrial Facilities", "Government Contracts"]
              },
              {
                num: "02",
                title: "Engineering",
                color: "bg-accent",
                desc: "Structural integrity starts with rigorous engineering. Our licensed engineers handle design, analysis, and site supervision.",
                icon: Ruler,
                items: ["Structural Design", "Civil Engineering", "Soil Investigation", "Safety Audits"]
              },
              {
                num: "03",
                title: "Consulting",
                color: "bg-primary",
                desc: "Expert guidance at every stage — from feasibility studies and project planning to cost estimation and regulatory compliance.",
                icon: ClipboardList,
                items: ["Feasibility Studies", "Project Management", "Cost Estimation", "Regulatory Approvals"]
              },
              {
                num: "04",
                title: "Designs",
                color: "bg-accent",
                desc: "Architecture that speaks and spaces that inspire. We create functional, aesthetic designs tailored to every client's vision.",
                icon: Layers,
                items: ["Architectural Design", "Interior Planning", "3D Visualization", "Master Planning"]
              }
            ].map((pillar, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP}
                className="group relative p-10 border-r border-white/10 last:border-r-0 hover:bg-white/5 transition-colors duration-300 cursor-default overflow-hidden"
                data-testid={`pillar-${pillar.title.toLowerCase()}`}
              >
                {/* Background number */}
                <span className="absolute -right-4 top-4 text-[8rem] font-black text-white/5 leading-none select-none pointer-events-none group-hover:text-white/[0.07] transition-colors">
                  {pillar.num}
                </span>

                {/* Top accent line */}
                <div className={`h-1 w-12 ${pillar.color} mb-8`} />

                {/* Icon */}
                <div className={`w-14 h-14 ${pillar.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <pillar.icon className="h-7 w-7 text-white" strokeWidth={1.5} />
                </div>

                <h3 className="text-2xl font-display font-bold text-white mb-4">{pillar.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed mb-8">{pillar.desc}</p>

                <ul className="space-y-2">
                  {pillar.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-white/50 group-hover:text-white/70 transition-colors">
                      <ChevronRight className="h-3 w-3 text-primary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 md:py-32 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="relative">
              <div className="aspect-[4/5] md:aspect-square lg:aspect-[4/5] relative z-10 overflow-hidden">
                <img src={aboutImg} alt="Engineers reviewing blueprints" className="w-full h-full object-cover filter grayscale-[10%]" />
              </div>
              <div className="absolute -bottom-8 -right-8 md:-right-12 z-20 bg-primary p-8 md:p-10 text-white shadow-2xl max-w-[280px]">
                <div className="text-5xl md:text-6xl font-display font-bold mb-2">25+</div>
                <div className="text-lg font-semibold leading-tight">Years of building trust in Nepal.</div>
              </div>
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-[radial-gradient(circle,hsl(var(--muted))_2px,transparent_2px)] [background-size:12px_12px] z-0 opacity-50" />
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={STAGGER} className="pt-8 lg:pt-0">
              <motion.div variants={FADE_UP} className="flex items-center gap-3 mb-6">
                <div className="h-[2px] w-10 bg-primary" />
                <span className="text-primary font-bold uppercase tracking-widest text-sm">About The Company</span>
              </motion.div>
              <motion.h2 variants={FADE_UP} className="text-3xl md:text-5xl font-display font-bold mb-6 leading-[1.1]">
                We construct the foundations of modern Nepal.
              </motion.h2>
              <motion.p variants={FADE_UP} className="text-muted-foreground text-lg mb-6 leading-relaxed">
                Mahakali Engineers and Developers Pvt. Ltd. is a leading force in Nepal's construction sector. We blend heavy engineering capability with meticulous project management to deliver infrastructure that stands the test of time.
              </motion.p>
              
              <motion.ul variants={FADE_UP} className="space-y-4 mb-10">
                {[
                  "Government-certified Class 'A' Construction Company",
                  "Specialized in high-altitude and complex terrain engineering",
                  "Commitment to sustainable and seismic-resistant design",
                  "In-house fleet of heavy machinery and testing equipment"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                    <span className="text-foreground font-medium">{item}</span>
                  </li>
                ))}
              </motion.ul>

              <motion.div variants={FADE_UP}>
                <Button className="rounded-none text-base h-14 px-8" onClick={() => scrollTo("contact")}>
                  Partner With Us
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP} className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Why Choose Mahakali?</h2>
            <p className="text-muted-foreground text-lg">We bring reliability, scale, and uncompromising standards to every site we manage.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Clock, title: "On-Time Delivery", desc: "Rigorous project scheduling ensures your project hits milestones and completion dates without excuses." },
              { icon: Award, title: "ISO-Certified Quality", desc: "Our materials and methodologies comply with international quality and safety standards." },
              { icon: Layers, title: "End-to-End Services", desc: "From soil testing to final handover, we handle the entire lifecycle of construction." },
              { icon: Users, title: "Expert Engineering Team", desc: "Led by veteran civil and structural engineers with decades of experience in complex terrains." },
              { icon: Headset, title: "24/7 Site Support", desc: "Continuous monitoring and immediate response teams deployed across all active project sites." },
              { icon: ShieldCheck, title: "Government Registered", desc: "Fully licensed and recognized for handling major public infrastructure works in Nepal." }
            ].map((item, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP} className="bg-background p-8 border border-border hover:border-primary/50 transition-colors group">
                <div className="w-14 h-14 bg-muted flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  <item.icon className="h-7 w-7 text-secondary group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="pt-24 pb-0 bg-background">
        <div className="container mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP} className="text-center max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 mb-4 justify-center">
              <div className="h-[2px] w-8 bg-primary" />
              <span className="text-primary font-bold uppercase tracking-widest text-sm">Our Expertise</span>
              <div className="h-[2px] w-8 bg-primary" />
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">Dual Divisions. One Standard.</h2>
            <p className="text-lg text-muted-foreground">Operating through two specialized divisions, we cover the full spectrum of structural analysis and heavy construction.</p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 min-h-[600px]">
          {/* Engineering Side */}
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-secondary text-secondary-foreground p-10 md:p-20 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-5 mix-blend-overlay group-hover:opacity-10 transition-opacity duration-700" />
            <div className="relative z-10 max-w-lg ml-auto">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-16 h-16 bg-primary flex items-center justify-center shrink-0 shadow-lg">
                  <Ruler className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-primary text-sm font-bold uppercase tracking-widest mb-1">Division 01</p>
                  <h3 className="text-3xl md:text-4xl font-display font-bold text-white">Engineering</h3>
                </div>
              </div>
              <div className="space-y-8">
                {[
                  { icon: Layers, title: "Structural Design & Analysis", desc: "Detailed structural calculations, load analysis, and design of foundations, frames, and retaining systems." },
                  { icon: Microscope, title: "Soil & Site Investigation", desc: "Geotechnical surveys, soil testing, and site feasibility studies to ensure ground-safe foundations." },
                  { icon: ClipboardList, title: "Project Planning & Management", desc: "End-to-end project scheduling, resource allocation, cost estimation, and quality control oversight." },
                  { icon: ShieldCheck, title: "Civil & Infrastructure Engineering", desc: "Road alignment, drainage design, bridge engineering, and public infrastructure planning." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-5 group/item">
                    <div className="mt-1">
                      <item.icon className="h-6 w-6 text-white/50 group-hover/item:text-primary transition-colors duration-300" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                      <p className="text-white/60 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Construction Side */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-muted p-10 md:p-20 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541888086225-ee1ea4e1160a?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-5 mix-blend-multiply group-hover:opacity-10 transition-opacity duration-700" />
            <div className="relative z-10 max-w-lg mr-auto">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-16 h-16 bg-accent flex items-center justify-center shrink-0 shadow-lg">
                  <HardHat className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-accent text-sm font-bold uppercase tracking-widest mb-1">Division 02</p>
                  <h3 className="text-3xl md:text-4xl font-display font-bold text-secondary">Construction</h3>
                </div>
              </div>
              <div className="space-y-8">
                {[
                  { icon: HomeIcon, title: "Residential Buildings", desc: "Bungalows, apartment complexes, and gated housing projects built with premium materials and finish." },
                  { icon: Building2, title: "Commercial Structures", desc: "Office towers, shopping centres, hotels, and mixed-use complexes delivered on time and within budget." },
                  { icon: Factory, title: "Industrial Construction", desc: "Factories, warehouses, processing plants, and heavy-load facilities with specialized structural requirements." },
                  { icon: Route, title: "Roads & Bridges", desc: "Highway construction, suspension and girder bridges, culverts, and government civil works across Nepal." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-5 group/item">
                    <div className="mt-1">
                      <item.icon className="h-6 w-6 text-secondary/50 group-hover/item:text-accent transition-colors duration-300" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-secondary mb-2">{item.title}</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">How We Work</h2>
            <p className="text-muted-foreground text-lg">A systematic approach to turning blueprints into reality.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-[2px] bg-border z-0" />
            
            {[
              { num: "01", title: "Consultation", desc: "Initial meeting to understand project scope, budget, and timeline.", icon: Users },
              { num: "02", title: "Survey & Design", desc: "Site investigation, structural design, and approval acquisition.", icon: Microscope },
              { num: "03", title: "Execution", desc: "Mobilization of resources and phase-wise construction.", icon: Hammer },
              { num: "04", title: "Handover", desc: "Final quality checks, finishing, and project delivery.", icon: CheckCircle2 }
            ].map((step, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP} className="relative z-10 flex flex-col items-center text-center group">
                <div className="w-24 h-24 rounded-full bg-background border-4 border-muted flex items-center justify-center mb-6 group-hover:border-primary group-hover:shadow-lg transition-all duration-300 relative">
                  <step.icon className="h-8 w-8 text-secondary group-hover:text-primary transition-colors" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shadow-md">
                    {step.num}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section id="projects" className="py-24 md:py-32 bg-secondary text-white">
        <div className="container mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP} className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-[2px] w-10 bg-primary" />
                <span className="text-primary font-bold uppercase tracking-widest text-sm">Portfolio</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-6 text-white">Featured Projects</h2>
              <p className="text-lg text-white/70">A selection of our landmark developments shaping the future of Nepal.</p>
            </div>
            <Button variant="outline" className="rounded-none self-start md:self-auto border-white/20 text-white hover:bg-white hover:text-secondary h-12 px-6">
              View All Projects
            </Button>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { img: project1Img, title: "Bagmati Commercial Tower", category: "Commercial", location: "Kathmandu, Nepal" },
              { img: project2Img, title: "Trishuli River Bridge", category: "Infrastructure", location: "Nuwakot, Nepal" },
              { img: project3Img, title: "Hetauda Industrial Complex", category: "Industrial", location: "Hetauda, Nepal" }
            ].map((project, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP} className="group cursor-pointer block h-full">
                <div className="relative aspect-[3/4] overflow-hidden bg-background">
                  <img src={project.img} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary/95 via-secondary/50 to-transparent" />
                  
                  <div className="absolute top-6 left-6 z-20">
                    <span className="bg-primary text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-sm shadow-md">
                      {project.category}
                    </span>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-8 z-20 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-2xl font-display font-bold text-white mb-2 leading-tight">{project.title}</h3>
                    <div className="text-white/70 text-sm flex items-center gap-2 mb-6">
                      <MapPin className="h-4 w-4 text-primary" /> {project.location}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="inline-flex items-center text-sm font-bold text-primary">
                        View Project <ArrowRight className="ml-2 h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Client Testimonials</h2>
            <p className="text-muted-foreground text-lg">Don't just take our word for it. Hear from our partners.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { text: "Mahakali Engineers delivered our commercial complex 2 months ahead of schedule. Their attention to safety and quality is unmatched in the valley.", name: "Ramesh Sharma", role: "Director, Valley Holdings" },
              { text: "The structural integrity and sheer scale of the industrial warehouse they built for us proves they are leaders in heavy construction in Nepal.", name: "Sita Neupane", role: "Operations Manager, Nepal Logistics" },
              { text: "From the initial soil testing to the final concrete pour, their engineering division demonstrated extreme professionalism. Highly recommended.", name: "Prakash Shrestha", role: "CEO, Shrestha Developers" }
            ].map((t, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP} className="bg-background p-8 border border-border relative">
                <Quote className="absolute top-8 right-8 h-12 w-12 text-muted/50" />
                <div className="flex gap-1 text-yellow-500 mb-6">
                  {[1,2,3,4,5].map(star => <svg key={star} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}
                </div>
                <p className="text-muted-foreground italic mb-8 relative z-10">"{t.text}"</p>
                <div className="flex items-center gap-4 border-t pt-6">
                  <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-white font-bold font-display">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">{t.name}</h4>
                    <p className="text-sm text-primary">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Unit Conversion Calculator Section */}
      <section id="calculator" className="py-24 md:py-32 bg-secondary text-white">
        <div className="container mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={STAGGER} className="text-center mb-14">
            <motion.p variants={FADE_UP} className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-3">Free Tool</motion.p>
            <motion.h2 variants={FADE_UP} className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
              Nepal Land & Measurement Calculator
            </motion.h2>
            <motion.p variants={FADE_UP} className="text-white/60 max-w-xl mx-auto text-sm">
              Convert between traditional Nepali land units (Ropani, Aana, Paisa, Daam) and international measurements instantly.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP}>
            <CalculatorTool />
          </motion.div>
        </div>
      </section>

      {/* CTA / Contact Section */}
      <section id="contact" className="relative py-24 md:py-32 bg-background border-t border-border">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={STAGGER}>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-[2px] w-10 bg-primary" />
                <span className="text-primary font-bold uppercase tracking-widest text-sm">Get In Touch</span>
              </div>
              <motion.h2 variants={FADE_UP} className="text-3xl md:text-5xl font-display font-bold mb-6">
                Ready to build something monumental?
              </motion.h2>
              <motion.p variants={FADE_UP} className="text-muted-foreground text-lg mb-12">
                Contact our engineering team to discuss your next infrastructure, commercial, or residential project.
              </motion.p>
              
              <div className="space-y-8 bg-muted p-8 rounded-sm mb-8">
                <motion.div variants={FADE_UP} className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-background flex items-center justify-center shrink-0 shadow-sm">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold mb-1">Corporate Office</h4>
                    <p className="text-muted-foreground">Chabahil-07, Kathmandu, Nepal</p>
                  </div>
                </motion.div>
                
                <motion.div variants={FADE_UP} className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-background flex items-center justify-center shrink-0 shadow-sm">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold mb-1">Phone</h4>
                    <p className="text-muted-foreground"><a href="tel:+9779851405916" className="hover:text-primary transition-colors">+977 9851405916</a></p>
                  </div>
                </motion.div>
                
                <motion.div variants={FADE_UP} className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-background flex items-center justify-center shrink-0 shadow-sm">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold mb-1">Email</h4>
                    <p className="text-muted-foreground">
                      <a href="mailto:mahakaliengineers885@gmail.com" className="hover:text-primary transition-colors">mahakaliengineers885@gmail.com</a><br/>
                      <a href="https://mahakaliengineers.com.np" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">mahakaliengineers.com.np</a>
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Google Maps */}
              <motion.div variants={FADE_UP} className="w-full h-64 overflow-hidden border border-border shadow-md">
                <iframe
                  title="Mahakali Engineers Office Location"
                  src="https://maps.google.com/maps?q=Chabahil+Kathmandu+Nepal&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </motion.div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP} className="bg-secondary text-white p-8 md:p-12 shadow-2xl relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full" />
              <h3 className="text-2xl font-display font-bold mb-2">Request a Quote</h3>
              <p className="text-white/60 mb-8">Fill out the form below and our team will get back to you within 24 hours.</p>
              <ContactForm />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="bg-[#0a0a0a] text-white/60 pt-20 pb-8 border-t-4 border-primary">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="space-y-6">
              <img src={logoImg} alt="Mahakali Engineers" className="h-14 w-auto object-contain filter brightness-0 invert" />
              <p className="text-sm leading-relaxed max-w-xs">
                Premium civil, structural, and architectural construction services in Nepal. Building the nation's infrastructure with unyielding quality since our inception.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold font-display text-lg mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-primary" /> Quick Links
              </h4>
              <ul className="space-y-3">
                <li><button onClick={() => scrollTo("home")} className="hover:text-primary transition-colors text-sm">Home</button></li>
                <li><button onClick={() => scrollTo("about")} className="hover:text-primary transition-colors text-sm">About Us</button></li>
                <li><button onClick={() => scrollTo("projects")} className="hover:text-primary transition-colors text-sm">Our Portfolio</button></li>
                <li><button onClick={() => scrollTo("process")} className="hover:text-primary transition-colors text-sm">How We Work</button></li>
                <li><button onClick={() => scrollTo("contact")} className="hover:text-primary transition-colors text-sm">Contact</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold font-display text-lg mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-primary" /> Services
              </h4>
              <ul className="space-y-3 text-sm">
                <li>Commercial Construction</li>
                <li>Industrial Facilities</li>
                <li>Residential Complexes</li>
                <li>Infrastructure & Bridges</li>
                <li>Structural Engineering</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold font-display text-lg mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-primary" /> Contact Info
              </h4>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary shrink-0" />
                  <span>Chabahil-07, Kathmandu,<br/>Bagmati Province, Nepal</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary shrink-0" />
                  <a href="tel:+9779851405916" className="hover:text-white transition-colors">+977 9851405916</a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary shrink-0" />
                  <a href="mailto:mahakaliengineers885@gmail.com" className="hover:text-white transition-colors">mahakaliengineers885@gmail.com</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <p>
              &copy; {new Date().getFullYear()} Mahakali Engineers and Developers Pvt. Ltd. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="https://mahakaliengineers.com.np" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                mahakaliengineers.com.np
              </a>
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <motion.a
        href="https://wa.me/9779851405916"
        target="_blank"
        rel="noopener noreferrer"
        data-testid="link-whatsapp-float"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.5, type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:shadow-[#25D366]/50 transition-shadow flex items-center justify-center group"
      >
        <SiWhatsapp className="w-8 h-8" />
        <span className="absolute right-full mr-4 bg-white text-secondary text-sm font-bold px-3 py-1.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg pointer-events-none">
          Chat with us
        </span>
      </motion.a>
    </div>
  );
}
