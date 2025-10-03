"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

type SeatType = "window" | "middle";

type Seat = {
  id: string; 
  row: number;
  col: number;
  gridCol: number;
  letter: string; 
  side: "left" | "right";
  type: SeatType;
  isAvailable: boolean;
  isSelected: boolean;
};

type CoachClass = "eksekutif" | "ekonomi";

type Layout = "2-2" | "2-1";

type CoachConfig = {
  coachClass: CoachClass;
  layout: Layout;
  rows: number;
};

type HardFilters = {
  seatTypes?: SeatType[];
  side?: "left" | "right";
  preferAisle?: boolean; 
};

type PrefWeights = {
  window: number;
  middle: number;
  nearAisle: number;
  front: number;
  rear: number;
};

type Preferences = {
  groupSize: number; 
  hard: HardFilters;
  weights: PrefWeights;
};

interface PemilihanKursiProps {
  onSeatsSelected?: (seats: string[]) => void;
}

const LETTERS_22 = ["A", "B", "C", "D"] as const; 
const LETTERS_21 = ["A", "B", "C"] as const; 

function deterministicAvailable(row: number, gridCol: number) {
  const v = (row * 31 + gridCol * 17) % 7;
  return v !== 0;
}

function normalize01(value: number, min: number, max: number) {
  if (max === min) return 0;
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

function buildCoach(config: CoachConfig): { seats: Seat[]; gridCols: number; letters: string[]; aisleGridIndex: number } {
  const seats: Seat[] = [];
  const is22 = config.layout === "2-2";
  const letters = is22 ? [...LETTERS_22] : [...LETTERS_21];
  const gridCols = is22 ? 5 : 4;
  const aisleGridIndex = 2;

  for (let row = 1; row <= config.rows; row++) {
    if (is22) {
      seats.push(
        { id: `${row}A`, row, col: 0, gridCol: 0, letter: "A", side: "left", type: "window", isAvailable: deterministicAvailable(row, 0), isSelected: false },
        { id: `${row}B`, row, col: 1, gridCol: 1, letter: "B", side: "left", type: "middle", isAvailable: deterministicAvailable(row, 1), isSelected: false },
        { id: `${row}C`, row, col: 2, gridCol: 3, letter: "C", side: "right", type: "middle", isAvailable: deterministicAvailable(row, 3), isSelected: false },
        { id: `${row}D`, row, col: 3, gridCol: 4, letter: "D", side: "right", type: "window", isAvailable: deterministicAvailable(row, 4), isSelected: false }
      );
    } else {
      seats.push(
        { id: `${row}A`, row, col: 0, gridCol: 0, letter: "A", side: "left", type: "window", isAvailable: deterministicAvailable(row, 0), isSelected: false },
        { id: `${row}B`, row, col: 1, gridCol: 1, letter: "B", side: "left", type: "middle", isAvailable: deterministicAvailable(row, 1), isSelected: false },
        { id: `${row}C`, row, col: 2, gridCol: 3, letter: "C", side: "right", type: "window", isAvailable: deterministicAvailable(row, 3), isSelected: false }
      );
    }
  }

  return { seats, gridCols, letters, aisleGridIndex };
}

function scoreSeat(seat: Seat, prefs: Preferences, aisleGridIndex: number, totalRows: number) {
  const { weights } = prefs;
  let score = 0;

  if (seat.type === "window") score += weights.window;
  if (seat.type === "middle") score += weights.middle;

  const aisleDist = Math.abs(seat.gridCol - aisleGridIndex);
  const aisleClose = aisleDist === 1 ? 1 : aisleDist === 0 ? 0.2 : 0;
  score += weights.nearAisle * aisleClose;

  const frontness = 1 - normalize01(seat.row, 1, totalRows);
  const rearness = normalize01(seat.row, 1, totalRows);
  score += weights.front * frontness + weights.rear * rearness;

  return score;
}

function passesHardFilters(seat: Seat, prefs: Preferences) {
  const { hard } = prefs;
  if (hard.seatTypes && hard.seatTypes.length > 0 && !hard.seatTypes.includes(seat.type)) return false;
  if (hard.side && seat.side !== hard.side) return false;
  return seat.isAvailable;
}

function rankSeats(seats: Seat[], prefs: Preferences, aisleGridIndex: number, totalRows: number) {
  const valid = seats.filter((s) => passesHardFilters(s, prefs));
  return valid
    .map((s) => ({ seat: s, score: scoreSeat(s, prefs, aisleGridIndex, totalRows) }))
    .sort((a, b) => b.score - a.score);
}

function contiguousPair(rowSeats: Seat[]): Seat[] | null {
  for (let i = 0; i < rowSeats.length - 1; i++) {
    const s1 = rowSeats[i];
    const s2 = rowSeats[i + 1];
    if (!s1 || !s2) continue;
    if (Math.abs(s1.gridCol - s2.gridCol) === 1 && s1.isAvailable && s2.isAvailable) return [s1, s2];
  }
  return null;
}

function rankSeatGroups(seats: Seat[], prefs: Preferences) {
  const size = prefs.groupSize;
  if (size !== 2) return [] as { seats: Seat[]; score: number }[];

  const rows = new Map<number, Seat[]>();
  for (const s of seats) {
    if (!passesHardFilters(s, prefs)) continue;
    const arr = rows.get(s.row) || [];
    arr.push(s);
    arr.sort((a, b) => a.gridCol - b.gridCol);
    rows.set(s.row, arr);
  }

  const groups: { seats: Seat[]; score: number }[] = [];
  for (const [, rowSeats] of rows) {
    const cluster = contiguousPair(rowSeats);
    if (!cluster) continue;
    const score = cluster.reduce((acc, s) => acc + (s.type === "window" ? 1 : 0.8), 0);
    groups.push({ seats: cluster, score });
  }
  groups.sort((a, b) => b.score - a.score);
  return groups;
}

const Panel: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <Card className={cn("rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm", className)}>
    <div className="mb-3 text-sm font-semibold text-zinc-700">{title}</div>
    {children}
  </Card>
);

function SeatBadge({ seat, highlight = false, onSelect }: { seat: Seat; highlight?: boolean; onSelect?: (seat: Seat) => void }) {
  const base = seat.isAvailable ? "cursor-pointer" : "opacity-40 cursor-not-allowed";
  const bg = seat.isSelected
    ? "bg-green-600 text-white"
    : highlight
    ? "bg-indigo-600 text-white"
    : seat.isAvailable
    ? "bg-sky-100 text-sky-900"
    : "bg-zinc-200 text-zinc-500";
  return (
    <div
      className={cn("flex h-7 w-7 items-center justify-center rounded-md text-[10px] font-medium", bg, base)}
      title={`${seat.id} • ${seat.type} ${seat.isSelected ? "(Dipilih)" : ""}`}
      onClick={() => seat.isAvailable && onSelect && onSelect(seat)}
    />
  );
}

function useOnClickOutside(ref: React.RefObject<HTMLElement>, cb: () => void) {
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) cb();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, cb]);
}

const Dropdown: React.FC<{ label: React.ReactNode; align?: "left" | "right"; children: React.ReactNode }> = ({ label, align = "left", children }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, () => setOpen(false));
  return (
    <div className="relative" ref={ref}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full"
      >
        <SlidersHorizontal className="h-4 w-4" /> {label}
      </Button>
      {open && (
        <div
          className={cn(
            "absolute z-[999] mt-2 w-[36rem] max-w-[95vw] rounded-xl border border-zinc-200 bg-white p-4 shadow-2xl",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default function PemilihanKursi({ onSeatsSelected }: PemilihanKursiProps) {
  const [coach, setCoach] = useState<CoachConfig>({ coachClass: "eksekutif", layout: "2-2", rows: 13 });
  const [prefs, setPrefs] = useState<Preferences>({
    groupSize: 1, 
    hard: { seatTypes: [], side: undefined, preferAisle: false },
    weights: {
      window: 2,
      middle: 1,
      nearAisle: 0,
      front: 0,
      rear: 0,
    },
  });
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const { seats, gridCols, aisleGridIndex } = useMemo(() => buildCoach(coach), [coach]);
  const ranked = useMemo(() => rankSeats(seats, prefs, aisleGridIndex, coach.rows), [seats, prefs, aisleGridIndex, coach.rows]);
  const topSeatIds = new Set(ranked.slice(0, 5).map((r) => r.seat.id));
  const rankedGroups = useMemo(() => rankSeatGroups(seats, prefs), [seats, prefs]);

  const rows = useMemo(() => {
    const map = new Map<number, Seat[]>();
    for (const s of seats) {
      const arr = map.get(s.row) || [];
      arr[s.gridCol] = s; 
      map.set(s.row, arr);
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [seats]);

  const capacity = useMemo(() => seats.length, [seats]);

  // Kirim data kursi yang dipilih ke parent component
  useEffect(() => {
    if (onSeatsSelected) {
      onSeatsSelected(selectedSeats);
    }
  }, [selectedSeats, onSeatsSelected]);

  const handleSeatSelect = (seat: Seat) => {
    if (selectedSeats.length >= 5 && !selectedSeats.includes(seat.id)) {
      alert("Maksimal pemilihan kursi adalah 5 kursi");
      return;
    }
    
    if (selectedSeats.includes(seat.id)) {
      setSelectedSeats(selectedSeats.filter(id => id !== seat.id));
    } else {
      setSelectedSeats([...selectedSeats, seat.id]);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <Card className="mb-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-lg font-semibold text-zinc-900">Pilih Kursi</div>
            <div className="text-sm text-zinc-500">
              Kelas {coach.coachClass === "eksekutif" ? "Eksekutif" : "Ekonomi"} • Layout {coach.layout} • {coach.rows} baris • {capacity} kursi
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              className="rounded-md border border-zinc-300 px-2 py-1 text-sm"
              value={coach.coachClass}
              onChange={(e) => {
                const cc = e.target.value as CoachClass;
                setCoach((c) => ({ coachClass: cc, layout: cc === "eksekutif" ? c.layout : "2-2", rows: cc === "eksekutif" ? 13 : 21 }));
              }}
            >
              <option value="eksekutif">Eksekutif</option>
              <option value="ekonomi">Ekonomi</option>
            </select>
            <select
              className="rounded-md border border-zinc-300 px-2 py-1 text-sm disabled:opacity-50"
              value={coach.layout}
              onChange={(e) => setCoach((c) => ({ ...c, layout: e.target.value as Layout }))}
              disabled={coach.coachClass === "ekonomi"}
            >
              <option value="2-2">2-2</option>
              <option value="2-1">2-1</option>
            </select>
            <Dropdown label={<span>Filters</span>} align="right">
              <div className="mb-4">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Seat Type</div>
                <div className="flex flex-wrap gap-3 text-sm">
                  {(["window", "middle"] as SeatType[]).map((t) => {
                    const active = prefs.hard.seatTypes?.includes(t);
                    return (
                      <label key={t} className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!!active}
                          onChange={() =>
                            setPrefs((p) => {
                              const set = new Set(p.hard.seatTypes || []);
                              if (set.has(t)) set.delete(t);
                              else set.add(t);
                              return { ...p, hard: { ...p.hard, seatTypes: [...set], side: p.hard.side, preferAisle: p.hard.preferAisle } };
                            })
                          }
                        />
                        <span className="capitalize">{t}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="mb-4">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Posisi</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    { label: "Depan", set: { front: 3, rear: 0 } },
                    { label: "Belakang", set: { front: 0, rear: 3 } },
                    { label: "Tengah", set: { front: 0, rear: 0 } },
                    { label: "Bebas", set: { front: 1, rear: 0 } },
                  ].map((opt) => (
                    <label key={opt.label} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="posisi"
                        checked={
                          (opt.label === "Depan" && prefs.weights.front === 3 && prefs.weights.rear === 0) ||
                          (opt.label === "Belakang" && prefs.weights.rear === 3 && prefs.weights.front === 0) ||
                          (opt.label === "Tengah" && prefs.weights.front === 0 && prefs.weights.rear === 0) ||
                          (opt.label === "Bebas" && prefs.weights.front === 1 && prefs.weights.rear === 0)
                        }
                        onChange={() => setPrefs((p) => ({ ...p, weights: { ...p.weights, ...opt.set } }))}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Sisi Gerbong</div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  {[
                    { label: "Kiri (A/B)", val: "left" },
                    { label: "Kanan (C/D)", val: "right" },
                    { label: "Bebas", val: "any" },
                  ].map((opt) => (
                    <label key={opt.val} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="side"
                        checked={
                          (opt.val === "left" && prefs.hard.side === "left") ||
                          (opt.val === "right" && prefs.hard.side === "right") ||
                          (opt.val === "any" && !prefs.hard.side)
                        }
                        onChange={() => setPrefs((p) => ({ ...p, hard: { ...p.hard, side: opt.val === "any" ? undefined : (opt.val as any) } }))}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-2">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Preferensi</div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={prefs.hard.preferAisle}
                    onChange={(e) =>
                      setPrefs((p) => ({
                        ...p,
                        hard: { ...p.hard, preferAisle: e.target.checked },
                        weights: { ...p.weights, nearAisle: e.target.checked ? 2 : 0 },
                      }))
                    }
                  />
                  Dekat aisle
                </label>
              </div>
            </Dropdown>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Panel title="Peta Kursi">
            <div className="mb-3 flex items-center justify-between text-xs text-zinc-600">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-sky-100"></span> Tersedia</span>
                <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-zinc-300"></span> Terisi</span>
                <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-indigo-600"></span> Rekomendasi top</span>
                <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-green-600"></span> Dipilih</span>
              </div>
              <div>Layout {coach.layout} • Baris: {coach.rows} • Aisle di tengah</div>
            </div>

            <div className="mb-2" style={{ display: "grid", gridTemplateColumns: `auto repeat(${coach.layout === "2-2" ? 5 : 4}, minmax(0,1fr)) auto`, gap: "0.5rem" }}>
              <div></div>
              {(coach.layout === "2-2" ? ["A", "B", "", "C", "D"] : ["A", "B", "", "C"]).map((l, idx) => (
                <div key={`h-${idx}`} className="text-center text-xs font-semibold text-zinc-500">{l || ""}</div>
              ))}
              <div></div>
            </div>

            <div className="max-h-[560px] overflow-auto rounded-xl border border-zinc-200 p-4">
              <div style={{ display: "grid", gridTemplateColumns: `auto repeat(${coach.layout === "2-2" ? 5 : 4}, minmax(0,1fr)) auto`, gap: "0.5rem" }}>
                {rows.map(([rowNum, rowSeats]) => {
                  const rev = coach.rows - rowNum + 1; 
                  return (
                    <React.Fragment key={rowNum}>
                      <div className="flex items-center justify-end pr-2 text-xs text-zinc-500">{rowNum}</div>

                      {Array.from({ length: coach.layout === "2-2" ? 5 : 4 }).map((_, i) => {
                        if (i === 2) {
                          return (
                            <div key={`aisle-${rowNum}`} className="flex items-center justify-center">
                              <div className="h-8 w-1 rounded bg-zinc-200" title="Aisle"></div>
                            </div>
                          );
                        }
                        const seat = rowSeats[i];
                        if (!seat) return <div key={`empty-${rowNum}-${i}`} />;
                        return <SeatBadge key={seat.id} seat={{ ...seat, isSelected: selectedSeats.includes(seat.id) }} highlight={topSeatIds.has(seat.id)} onSelect={handleSeatSelect} />;
                      })}

                      <div className="flex items-center pl-2 text-xs text-zinc-500">{rev}</div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Top Rekomendasi">
            <ol className="space-y-2 text-sm">
              {ranked.slice(0, 5).map(({ seat }) => (
                <li key={seat.id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <SeatBadge seat={{ ...seat, isSelected: selectedSeats.includes(seat.id) }} highlight={topSeatIds.has(seat.id)} onSelect={handleSeatSelect} /> 
                    <span>{seat.id}</span>
                  </div>
                </li>
              ))}
            </ol>
          </Panel>

          {prefs.groupSize === 2 && (
            <Panel title={`Rekomendasi Pasangan Kursi`}>
              <ol className="space-y-3 text-sm">
                {rankedGroups.slice(0, 5).map((g, i) => (
                  <li key={i} className="flex items-center gap-1">
                    {g.seats.map((s) => (
                      <div key={s.id} className="flex items-center gap-1">
                        <SeatBadge seat={{ ...s, isSelected: selectedSeats.includes(s.id) }} onSelect={handleSeatSelect} />
                        <span className="mr-1">{s.id}</span>
                      </div>
                    ))}
                  </li>
                ))}
              </ol>
            </Panel>
          )}

          <Panel title={`Kursi Dipilih (${selectedSeats.length}/5)`}>
            {selectedSeats.length > 0 ? (
              <ol className="space-y-2 text-sm">
                {selectedSeats.map((seatId) => {
                  const seat = seats.find(s => s.id === seatId);
                  return seat ? (
                    <li key={seatId} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <SeatBadge seat={{ ...seat, isSelected: true }} /> 
                        <span>{seatId}</span>
                      </div>
                      <button
                        onClick={() => handleSeatSelect(seat)}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Hapus
                      </button>
                    </li>
                  ) : null;
                })}
              </ol>
            ) : (
              <p className="text-sm text-zinc-500">Belum ada kursi dipilih</p>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}