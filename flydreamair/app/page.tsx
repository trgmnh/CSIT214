"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type TripType = "return" | "oneway" | "multicity";

type Segment = {
  from: string;
  to: string;
  date: string; // ISO yyyy-mm-dd
};

type Travellers = {
  adults: number;
  children: number;
  infants: number;
  cabin: "Economy" | "Premium Economy" | "Business" | "First";
};

const initialTravellers: Travellers = {
  adults: 1,
  children: 0,
  infants: 0,
  cabin: "Economy",
};

export default function HomePage() {
  const router = useRouter();
  const [tripType, setTripType] = useState<TripType>("return");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [segments, setSegments] = useState<Segment[]>([
    { from: "", to: "", date: "" },
  ]);
  const [travellers, setTravellers] = useState<Travellers>(initialTravellers);

  // Helpers
  const updateSegment = (i: number, patch: Partial<Segment>) =>
    setSegments((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  const swap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const addSegment = () => setSegments((prev) => [...prev, { from: "", to: "", date: "" }]);
  const removeSegment = (i: number) =>
    setSegments((prev) => prev.filter((_, idx) => idx !== i));

  // Normalize segments per trip type
  const visibleSegments = (() => {
    if (tripType === "oneway") return [{ from, to, date: departureDate }];
    if (tripType === "return") return [
      { from, to, date: departureDate },
      { from: to, to: from, date: returnDate }
    ];
    return segments;
  })();

  // Basic validation
  const canSearch = (() => {
    if (tripType === "multicity") {
      return segments.every((s) => s.from && s.to && s.date);
    }
    if (tripType === "return") {
      return from && to && departureDate && returnDate;
    }
    return from && to && departureDate;
  })();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSearch) return;

    // Build query for /search
    const qp = new URLSearchParams();
    qp.set("tripType", tripType);
    
    if (tripType === "multicity") {
      segments.forEach((s, i) => {
        qp.set(`seg${i + 1}From`, s.from);
        qp.set(`seg${i + 1}To`, s.to);
        qp.set(`seg${i + 1}Date`, s.date);
      });
    } else {
      // For oneway and return trips
      qp.set("seg1From", from);
      qp.set("seg1To", to);
      qp.set("seg1Date", departureDate);
      if (tripType === "return") {
        qp.set("seg2From", to);
        qp.set("seg2To", from);
        qp.set("seg2Date", returnDate);
      }
    }
    
    qp.set("adults", String(travellers.adults));
    qp.set("children", String(travellers.children));
    qp.set("infants", String(travellers.infants));
    qp.set("cabin", travellers.cabin);

    router.push(`/search?${qp.toString()}`);
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Find flights</h1>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b">
        {(["return", "oneway", "multicity"] as TripType[]).map((t) => (
          <button
            key={t}
            onClick={() => setTripType(t)}
            className={`py-3 -mb-px border-b-2 text-sm font-medium transition-colors ${
              tripType === t
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
            aria-current={tripType === t ? "page" : undefined}
          >
            {t === "return" ? "Return" : t === "oneway" ? "One-way" : "Multi-city"}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="mt-6">
        {/* Travellers & cabin (compact pill) */}
        <div className="mb-4">
          <TravellersCabin
            travellers={travellers}
            onChange={setTravellers}
          />
        </div>

        {/* Flight Details */}
        {tripType === "multicity" ? (
          <div className="space-y-5">
            {segments.map((seg, idx) => (
              <SegmentRow
                key={idx}
                label={`Flight ${idx + 1}`}
                value={seg}
                onChange={(patch) => updateSegment(idx, patch)}
                onSwap={() => swap()}
                onRemove={
                  segments.length > 1
                    ? () => removeSegment(idx)
                    : undefined
                }
              />
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            {/* Single flight form for oneway and return */}
            <fieldset className="rounded-2xl border border-gray-200 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                {/* From */}
                <LabeledInput
                  label="Leaving from"
                  placeholder="City or airport (e.g., SYD)"
                  value={from}
                  onChange={(e) => setFrom(e.currentTarget.value)}
                />

                {/* swap */}
                <button
                  type="button"
                  className="self-center md:self-auto rounded-full border border-gray-300 px-2 py-2 hover:bg-gray-50"
                  onClick={swap}
                  aria-label="Swap origin and destination"
                  title="Swap"
                >
                  ⇄
                </button>

                {/* To */}
                <LabeledInput
                  label="Going to"
                  placeholder="City or airport (e.g., MEL)"
                  value={to}
                  onChange={(e) => setTo(e.currentTarget.value)}
                />

                {/* Departure Date */}
                <LabeledInput
                  label="Departure Date"
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.currentTarget.value)}
                  className="md:w-56"
                />

                {/* Return Date - only show for return trips */}
                {tripType === "return" && (
                  <LabeledInput
                    label="Return Date"
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.currentTarget.value)}
                    className="md:w-56"
                  />
                )}
              </div>
            </fieldset>
          </div>
        )}

        {/* Multi-city: add more */}
        {tripType === "multicity" && (
          <div className="mt-3">
            <button
              type="button"
              onClick={addSegment}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              + Add another flight
            </button>
          </div>
        )}


        {/* Search */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={!canSearch}
            className={`rounded-full px-6 py-3 text-white font-semibold transition-colors
              ${canSearch ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-300 cursor-not-allowed"}
            `}
            aria-disabled={!canSearch}
            title={!canSearch ? "Fill all required fields" : "Search flights"}
          >
            Search
          </button>
        </div>
      </form>
    </main>
  );
}

/* =========================
 * Segment Row Component
 * =======================*/
function SegmentRow({
  label,
  value,
  onChange,
  onSwap,
  onRemove,
}: {
  label?: string;
  value: Segment;
  onChange: (patch: Partial<Segment>) => void;
  onSwap: () => void;
  onRemove?: () => void;
}) {
  return (
    <fieldset className="rounded-2xl border border-gray-200 p-4">
      {label && <legend className="px-1 text-sm font-medium text-gray-700">{label}</legend>}

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        {/* From */}
        <LabeledInput
          label="Leaving from"
          placeholder="City or airport (e.g., SYD)"
          value={value.from}
          onChange={(e) => onChange({ from: e.currentTarget.value })}
        />

        {/* swap */}
        <button
          type="button"
          className="self-center md:self-auto rounded-full border border-gray-300 px-2 py-2 hover:bg-gray-50"
          onClick={onSwap}
          aria-label="Swap origin and destination"
          title="Swap"
        >
          ⇄
        </button>

        {/* To */}
        <LabeledInput
          label="Going to"
          placeholder="City or airport (e.g., MEL)"
          value={value.to}
          onChange={(e) => onChange({ to: e.currentTarget.value })}
        />

        {/* Date */}
        <LabeledInput
          label="Date"
          type="date"
          value={value.date}
          onChange={(e) => onChange({ date: e.currentTarget.value })}
          className="md:w-56"
        />
      </div>

      {onRemove && (
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={onRemove}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Remove flight
          </button>
        </div>
      )}
    </fieldset>
  );
}

/* =========================
 * Travellers & Cabin
 * =======================*/
function TravellersCabin({
  travellers,
  onChange,
}: {
  travellers: Travellers;
  onChange: (t: Travellers) => void;
}) {
  const set = (k: keyof Travellers, v: any) => onChange({ ...travellers, [k]: v });
  const summary = `${travellers.adults + travellers.children + travellers.infants} traveller${
    travellers.adults + travellers.children + travellers.infants > 1 ? "s" : ""
  }, ${travellers.cabin}`;

  return (
    <div className="rounded-2xl border border-gray-200 p-4">
      <div className="text-sm text-gray-500">Travellers, Cabin class</div>
      <div className="mt-1 font-medium">{summary}</div>

      <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-4">
        <NumberField
          label="Adults"
          value={travellers.adults}
          min={1}
          onChange={(v) => set("adults", v)}
        />
        <NumberField
          label="Children"
          value={travellers.children}
          min={0}
          onChange={(v) => set("children", v)}
        />
        <NumberField
          label="Infants"
          value={travellers.infants}
          min={0}
          onChange={(v) => set("infants", v)}
        />
        <div>
          <label className="block text-sm text-gray-600 mb-1">Cabin</label>
          <select
            className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={travellers.cabin}
            onChange={(e) => set("cabin", e.currentTarget.value as Travellers["cabin"])}
          >
            <option>Economy</option>
            <option>Premium Economy</option>
            <option>Business</option>
            <option>First</option>
          </select>
        </div>
      </div>
    </div>
  );
}

/* =========================
 * Small UI helpers
 * =======================*/
function LabeledInput({
  label,
  className,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
}) {
  return (
    <label className={`flex-1 ${className ?? ""}`}>
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className="flex items-center gap-2 rounded-xl border border-gray-300 px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">      
        <input
          {...rest}
          className="w-full outline-none placeholder:text-gray-400"
        />
      </div>
    </label>
  );
}

function NumberField({
  label,
  value,
  min = 0,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className="flex items-center rounded-xl border border-gray-300">
        <button
          type="button"
          className="px-3 py-2 text-gray-700 hover:bg-gray-50"
          onClick={() => onChange(Math.max(min, value - 1))}
          aria-label={`Decrease ${label}`}
        >
          –
        </button>
        <input
          type="number"
          className="w-16 text-center outline-none"
          value={value}
          min={min}
          onChange={(e) => onChange(Math.max(min, Number(e.currentTarget.value)))}
        />
        <button
          type="button"
          className="px-3 py-2 text-gray-700 hover:bg-gray-50"
          onClick={() => onChange(value + 1)}
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
