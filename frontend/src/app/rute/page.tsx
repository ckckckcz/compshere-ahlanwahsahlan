"use client";

import { useState, useEffect, useRef, useMemo } from "react";

import { Search, Filter, Layers, MapPin, RotateCcw, BarChart3, Train, Building, Route, Navigation, Clock, MapPinIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";

import { Badge } from "@/components/ui/badge";

import "leaflet/dist/leaflet.css";

import Image from "next/image";

import Logo from "../../../public/KAI-Logo.png";

let L: any = null;

let map: any = null;

let markerClusterGroup: any = null;

let routeLine: any = null;

interface Province {
  name: string;

  population?: number;

  area?: number;

  capital?: string;
}

interface Station {
  id: string;

  name: string;

  type: string;

  properties: any;

  coordinates: [number, number];
}

interface StationStats {
  totalStations: number;

  stationTypes: { [key: string]: number };

  railwayTypes: { [key: string]: number };

  elevationRange: { min: number; max: number };
}

interface RailwaySegment {
  id: string;

  coordinates: [number, number][];

  properties: any;

  length: number;
}

interface RouteInfo {
  fromStation: Station | null;

  toStation: Station | null;

  distance: number;

  estimatedTime: number;

  polyline?: any;

  railwayPath: [number, number][];

  stationsAlongPath: Station[];
}

interface RailGraphNode {
  id: number;

  coord: [number, number];
}

interface RailGraph {
  nodes: RailGraphNode[];

  adj: Array<Array<{ to: number; w: number }>>;

  components: number[];
}

export default function Rute() {
  const mapRef = useRef<HTMLDivElement>(null);

  // --- UI / Data states ---

  const [searchQuery, setSearchQuery] = useState("");

  const [selectedFilter, setSelectedFilter] = useState("all");

  const [provinces, setProvinces] = useState<Province[]>([]);

  const [stations, setStations] = useState<Station[]>([]);

  const [selectedItem, setSelectedItem] = useState<Province | Station | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [geoJsonLayer, setGeoJsonLayer] = useState<any>(null);

  const [stationStats, setStationStats] = useState<StationStats>({
    totalStations: 0,

    stationTypes: {},

    railwayTypes: {},

    elevationRange: { min: 0, max: 0 },
  });

  const [showStats, setShowStats] = useState(false);

  // Route Planner states

  const [routeSearch, setRouteSearch] = useState({
    from: "",

    to: "",

    fromStation: null as Station | null,

    toStation: null as Station | null,
  });

  const [showRouteSearch, setShowRouteSearch] = useState(false);

  const [filteredFromStations, setFilteredFromStations] = useState<Station[]>([]);

  const [filteredToStations, setFilteredToStations] = useState<Station[]>([]);

  const [currentRoute, setCurrentRoute] = useState<RouteInfo | null>(null);

  const [showFromDropdown, setShowFromDropdown] = useState(false);

  const [showToDropdown, setShowToDropdown] = useState(false);

  // Railway segmentation & graph

  const [railwaySegments, setRailwaySegments] = useState<RailwaySegment[]>([]);

  const [railwayGraph, setRailwayGraph] = useState<RailGraph | null>(null);

  // Original stations list backup

  const [originalStations, setOriginalStations] = useState<Station[]>([]);

  const [isRoutePlanning, setIsRoutePlanning] = useState(false);

  // NEW: route mode controls (hide base layers & show only route)

  const [isRouteMode, setIsRouteMode] = useState(false);

  const routeStationsLayerRef = useRef<any>(null); // LayerGroup for route markers (from/to + waypoints)

  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // centroid

  const calculateCentroid = (geometry: any): [number, number] => {
    if (geometry.type === "Point") {
      return [geometry.coordinates[1], geometry.coordinates[0]];
    }

    let coords: number[][] = [];

    if (geometry.type === "Polygon") coords = geometry.coordinates[0];
    else if (geometry.type === "LineString") coords = geometry.coordinates;

    const lat = coords.reduce((s, c) => s + c[1], 0) / coords.length;

    const lng = coords.reduce((s, c) => s + c[0], 0) / coords.length;

    return [lat, lng];
  };

  const getStationIcon = (properties: any) => {
    const railway = properties.railway || "";

    let iconHtml = "";

    let iconClass = "station-marker";

    if (railway === "station") {
      iconHtml = "🚉";
      iconClass += " major-station";
    } else if (railway === "halt") {
      iconHtml = "🚏";
      iconClass += " halt-station";
    } else if (railway === "subway_entrance") {
      iconHtml = "🚇";
      iconClass += " subway-station";
    } else {
      iconHtml = "🚂";
      iconClass += " railway-point";
    }

    return L.divIcon({
      className: iconClass,

      html: `<div style="font-size:16px;text-shadow:1px 1px 2px rgba(0,0,0,0.5);">${iconHtml}</div>`,

      iconSize: [24, 24],

      iconAnchor: [12, 12],
    });
  };

  const createPopupContent = (feature: any) => {
    const props = feature.properties;

    const name = props.name || props["name:id"] || "Unnamed Station";

    const railway = props.railway || "N/A";

    const ref = props["railway:ref"] || props.ref || "N/A";

    const operator = props.operator || "N/A";

    const elevation = props.ele || "N/A";

    const wikidata = props.wikidata;

    return `

      <div class="station-popup" style="min-width:200px;">

        <h3 style="margin:0 0 8px 0;color:#1f2937;font-weight:bold;">${name}</h3>

        <div style="font-size:12px;color:#6b7280;line-height:1.4;">

          <p><strong>Type:</strong> ${railway}</p>

          ${ref !== "N/A" ? `<p><strong>Reference:</strong> ${ref}</p>` : ""}

          ${operator !== "N/A" ? `<p><strong>Operator:</strong> ${operator}</p>` : ""}

          ${elevation !== "N/A" ? `<p><strong>Elevation:</strong> ${elevation}m</p>` : ""}

          ${wikidata ? `<p><a href="https://www.wikidata.org/wiki/${wikidata}" target="_blank" style="color:#3b82f6;">More Info</a></p>` : ""}

        </div>

      </div>

    `;
  };

  const calculateStats = (features: any[]) => {
    const stats: StationStats = {
      totalStations: 0,

      stationTypes: {},

      railwayTypes: {},

      elevationRange: { min: Infinity, max: -Infinity },
    };

    const pointStations = features.filter((f) => f.geometry.type === "Point" && f.properties.name);

    pointStations.forEach((f) => {
      stats.totalStations++;

      const railway = f.properties.railway || "unknown";

      stats.railwayTypes[railway] = (stats.railwayTypes[railway] || 0) + 1;

      const type = f.geometry.type;

      stats.stationTypes[type] = (stats.stationTypes[type] || 0) + 1;

      const elevation = parseFloat(f.properties.ele);

      if (!isNaN(elevation)) {
        stats.elevationRange.min = Math.min(stats.elevationRange.min, elevation);

        stats.elevationRange.max = Math.max(stats.elevationRange.max, elevation);
      }
    });

    if (stats.elevationRange.min === Infinity) stats.elevationRange = { min: 0, max: 0 };

    return stats;
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;

    const dLat = ((lat2 - lat1) * Math.PI) / 180;

    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  // --- Search handlers ---

  const searchStations = (query: string, excludeId?: string) => {
    if (!query.trim()) return [];

    const lower = query.toLowerCase();

    return stations

      .filter((s) => s.name.toLowerCase().includes(lower) && s.id !== excludeId)

      .slice(0, 6);
  };

  const handleFromSearch = (v: string) => {
    setRouteSearch((p) => ({ ...p, from: v }));

    if (searchTimeout) clearTimeout(searchTimeout);

    if (v.length > 0) {
      const t = setTimeout(() => {
        const filtered = searchStations(v);

        setFilteredFromStations(filtered);

        setShowFromDropdown(filtered.length > 0);
      }, 250);

      setSearchTimeout(t);
    } else {
      setFilteredFromStations([]);

      setShowFromDropdown(false);
    }
  };

  const handleToSearch = (v: string) => {
    setRouteSearch((p) => ({ ...p, to: v }));

    if (searchTimeout) clearTimeout(searchTimeout);

    if (v.length > 0) {
      const t = setTimeout(() => {
        const filtered = searchStations(v, routeSearch.fromStation?.id);

        setFilteredToStations(filtered);

        setShowToDropdown(filtered.length > 0);
      }, 250);

      setSearchTimeout(t);
    } else {
      setFilteredToStations([]);

      setShowToDropdown(false);
    }
  };

  const selectFromStation = (station: Station) => {
    setRouteSearch((p) => ({ ...p, from: station.name, fromStation: station }));

    setFilteredFromStations([]);

    setShowFromDropdown(false);
  };

  const selectToStation = (station: Station) => {
    setRouteSearch((p) => ({ ...p, to: station.name, toStation: station }));

    setFilteredToStations([]);

    setShowToDropdown(false);
  };

  // --- Build Segments ---

  const buildRailwayNetwork = (features: any[]) => {
    const segments: RailwaySegment[] = [];

    const railwayLines = features.filter((f) => {
      if (f.geometry.type !== "LineString" || !f.geometry.coordinates || f.geometry.coordinates.length < 2) return false;

      const railway = f.properties.railway;

      return ["rail", "light_rail", "subway", "monorail", "tram", "narrow_gauge"].includes(railway);
    });

    railwayLines.forEach((feature: any, idx: number) => {
      const coords = feature.geometry.coordinates.map((c: number[]) => [c[1], c[0]]);

      const length = calculatePathLength(coords);

      if (length > 0.003) {
        segments.push({
          id: feature.id || feature.properties["@id"] || `segment_${idx}`,

          coordinates: coords,

          properties: feature.properties,

          length,
        });
      }
    });

    return segments;
  };

  /* ===== Graph building (improved for long distance) ===== */

  const buildRailwayGraph = (segments: RailwaySegment[]): RailGraph => {
    const keyToIndex = new Map<string, number>();

    const nodes: RailGraphNode[] = [];

    const adj: Array<Array<{ to: number; w: number }>> = [];

    const addNode = (coord: [number, number]) => {
      const key = coord[0].toFixed(6) + "," + coord[1].toFixed(6);

      let idx = keyToIndex.get(key);

      if (idx === undefined) {
        idx = nodes.length;

        keyToIndex.set(key, idx);

        nodes.push({ id: idx, coord });

        adj[idx] = [];
      }

      return idx;
    };

    // 1. Add nodes & edges from each segment (adaptive sampling)

    segments.forEach((seg) => {
      if (!seg.coordinates || seg.coordinates.length < 2) return;

      const lengthKm = seg.length;

      const idealSpacingKm = 0.05;

      const targetPoints = Math.min(1500, Math.max(2, Math.round(lengthKm / idealSpacingKm)));

      let coords = seg.coordinates;

      if (coords.length > targetPoints) {
        const step = coords.length / targetPoints;

        const sampled: [number, number][] = [];

        for (let i = 0; i < coords.length; i += step) {
          sampled.push(coords[Math.min(Math.round(i), coords.length - 1)] as [number, number]);
        }

        if (sampled[sampled.length - 1] !== coords[coords.length - 1]) {
          sampled.push(coords[coords.length - 1] as [number, number]);
        }

        coords = sampled;
      }

      let prev: number | null = null;

      for (const c of coords) {
        const idx = addNode(c as [number, number]);

        if (prev !== null && prev !== idx) {
          const w = calculateDistance(
            nodes[prev].coord[0],
            nodes[prev].coord[1],

            nodes[idx].coord[0],
            nodes[idx].coord[1]
          );

          if (w > 0) {
            adj[prev].push({ to: idx, w });

            adj[idx].push({ to: prev, w });
          }
        }

        prev = idx;
      }
    });

    // 2. Connect nearby nodes (snap)

    const linkThresholdKm = 0.09;

    const cellDeg = linkThresholdKm / 111;

    const grid = new Map<string, number[]>();

    const cellKey = (lat: number, lng: number) => `${Math.floor(lat / cellDeg)},${Math.floor(lng / cellDeg)}`;

    nodes.forEach((n) => {
      const ck = cellKey(n.coord[0], n.coord[1]);

      if (!grid.has(ck)) grid.set(ck, []);

      grid.get(ck)!.push(n.id);
    });

    const tryLink = (a: number, b: number) => {
      if (a === b) return;

      const d = calculateDistance(
        nodes[a].coord[0],
        nodes[a].coord[1],

        nodes[b].coord[0],
        nodes[b].coord[1]
      );

      if (d > 0 && d <= linkThresholdKm) {
        if (!adj[a].some((e) => e.to === b)) adj[a].push({ to: b, w: d });

        if (!adj[b].some((e) => e.to === a)) adj[b].push({ to: a, w: d });
      }
    };

    nodes.forEach((n) => {
      const [lat, lng] = n.coord;

      const bi = Math.floor(lat / cellDeg);

      const bj = Math.floor(lng / cellDeg);

      for (let di = -1; di <= 1; di++) {
        for (let dj = -1; dj <= 1; dj++) {
          const key = `${bi + di},${bj + dj}`;

          const arr = grid.get(key);

          if (arr) arr.forEach((id2) => tryLink(n.id, id2));
        }
      }
    });

    // 3. Component labeling

    const components = new Array(nodes.length).fill(-1);

    let compId = 0;

    for (let i = 0; i < nodes.length; i++) {
      if (components[i] !== -1) continue;

      const q = [i];

      components[i] = compId;

      while (q.length) {
        const v = q.shift()!;

        adj[v].forEach((e) => {
          if (components[e.to] === -1) {
            components[e.to] = compId;

            q.push(e.to);
          }
        });
      }

      compId++;
    }

    console.log(`Graph built: nodes=${nodes.length}, components=${compId}`);

    return { nodes, adj, components };
  };

  const getCandidateGraphNodesForStation = (
    station: Station,

    graph: RailGraph,

    maxCandidates = 6,

    searchRadiusKm = 6
  ): Array<{ node: number; dist: number }> => {
    const cands: Array<{ node: number; dist: number }> = [];

    for (const n of graph.nodes) {
      const d = calculateDistance(station.coordinates[0], station.coordinates[1], n.coord[0], n.coord[1]);

      if (d <= searchRadiusKm) cands.push({ node: n.id, dist: d });
    }

    cands.sort((a, b) => a.dist - b.dist);

    return cands.slice(0, maxCandidates);
  };

  const dijkstraPath = (
    graph: RailGraph,

    start: number,

    goal: number,

    maxDistanceKm = 6000
  ): { path: number[]; distance: number } | null => {
    const dist = new Array(graph.nodes.length).fill(Infinity);

    const prev = new Array<number | null>(graph.nodes.length).fill(null);

    dist[start] = 0;

    const heap: Array<{ n: number; d: number }> = [{ n: start, d: 0 }];

    const push = (o: { n: number; d: number }) => {
      heap.push(o);

      let i = heap.length - 1;

      while (i > 0) {
        const p = Math.floor((i - 1) / 2);

        if (heap[p].d <= heap[i].d) break;

        [heap[p], heap[i]] = [heap[i], heap[p]];

        i = p;
      }
    };

    const pop = () => {
      if (!heap.length) return null;

      const top = heap[0];

      const last = heap.pop()!;

      if (heap.length) {
        heap[0] = last;

        let i = 0;

        while (true) {
          let l = 2 * i + 1,
            r = l + 1,
            s = i;

          if (l < heap.length && heap[l].d < heap[s].d) s = l;

          if (r < heap.length && heap[r].d < heap[s].d) s = r;

          if (s === i) break;

          [heap[i], heap[s]] = [heap[s], heap[i]];

          i = s;
        }
      }

      return top;
    };

    while (heap.length) {
      const cur = pop();

      if (!cur) break;

      if (cur.d !== dist[cur.n]) continue;

      if (cur.n === goal) break;

      if (cur.d > maxDistanceKm) return null;

      for (const e of graph.adj[cur.n]) {
        const nd = cur.d + e.w;

        if (nd < dist[e.to]) {
          dist[e.to] = nd;

          prev[e.to] = cur.n;

          push({ n: e.to, d: nd });
        }
      }
    }

    if (dist[goal] === Infinity) return null;

    const path: number[] = [];

    let c: number | null = goal;

    while (c !== null) {
      path.push(c);
      c = prev[c];
    }

    path.reverse();

    return { path, distance: dist[goal] };
  };

  const attemptBridgeComponents = (
    from: Station,

    to: Station,

    graph: RailGraph,

    fromCandidates: Array<{ node: number; dist: number }>,

    toCandidates: Array<{ node: number; dist: number }>
  ): [number, number][] | null => {
    const bridgeMaxKm = 4;

    let best: { a: number; b: number; d: number } | null = null;

    for (const fc of fromCandidates) {
      for (const tc of toCandidates) {
        if (graph.components[fc.node] === graph.components[tc.node]) continue;

        const d = calculateDistance(
          graph.nodes[fc.node].coord[0],
          graph.nodes[fc.node].coord[1],

          graph.nodes[tc.node].coord[0],
          graph.nodes[tc.node].coord[1]
        );

        if (d <= bridgeMaxKm && (!best || d < best.d)) {
          best = { a: fc.node, b: tc.node, d };
        }
      }
    }

    if (!best) return null;

    console.warn("Using artificial bridge gap:", best.d.toFixed(3), "km");

    const coords: [number, number][] = [from.coordinates, graph.nodes[best.a].coord, graph.nodes[best.b].coord, to.coordinates];

    return simplifyRailPath(coords, 0.002);
  };

  const buildGraphPathBetweenStations = (
    from: Station,

    to: Station,

    graph: RailGraph
  ): [number, number][] | null => {
    const fromC = getCandidateGraphNodesForStation(from, graph);

    const toC = getCandidateGraphNodesForStation(to, graph);

    if (!fromC.length || !toC.length) return null;

    let best: { coords: [number, number][]; total: number } | null = null;

    for (const fc of fromC) {
      for (const tc of toC) {
        const h = calculateDistance(
          graph.nodes[fc.node].coord[0],
          graph.nodes[fc.node].coord[1],

          graph.nodes[tc.node].coord[0],
          graph.nodes[tc.node].coord[1]
        );

        if (h > 5500) continue;

        const res = dijkstraPath(graph, fc.node, tc.node);

        if (res) {
          const coords = res.path.map((i) => graph.nodes[i].coord);

          if (fc.dist > 0.02) coords.unshift(from.coordinates);
          else coords[0] = from.coordinates;

          if (tc.dist > 0.02) coords.push(to.coordinates);
          else coords[coords.length - 1] = to.coordinates;

          const total = res.distance + fc.dist + tc.dist;

          if (!best || total < best.total) best = { coords, total };
        }
      }
    }

    if (!best) {
      // bridging attempt

      const fromComps = new Set(fromC.map((c) => graph.components[c.node]));

      const toComps = new Set(toC.map((c) => graph.components[c.node]));

      let separated = true;

      fromComps.forEach((c) => {
        if (toComps.has(c)) separated = false;
      });

      if (separated) {
        const bridged = attemptBridgeComponents(from, to, graph, fromC, toC);

        if (bridged) return bridged;
      }

      return null;
    }

    return simplifyRailPath(best.coords, 0.003);
  };

  const simplifyRailPath = (path: [number, number][], minDistKm = 0.005): [number, number][] => {
    if (path.length <= 2) return path;

    const out: [number, number][] = [path[0]];

    let last = path[0];

    for (let i = 1; i < path.length - 1; i++) {
      const d = calculateDistance(last[0], last[1], path[i][0], path[i][1]);

      if (d >= minDistKm) {
        out.push(path[i]);

        last = path[i];
      }
    }

    out.push(path[path.length - 1]);

    return out;
  };

  const fallbackDirectPath = (from: Station, to: Station) => [from.coordinates, to.coordinates];

  const findStationsAlongPath = (path: [number, number][], allStations: Station[]): Station[] => {
    const toleranceKm = 1.0;

    const sampled = path.length > 180 ? path.filter((_, i) => i % Math.ceil(path.length / 180) === 0) : path;

    const relevant = allStations.filter((s) => s.id !== routeSearch.fromStation?.id && s.id !== routeSearch.toStation?.id && (s.properties.railway === "station" || s.properties.railway === "halt"));

    const stationsAlong: Station[] = [];

    for (const st of relevant) {
      for (const p of sampled) {
        if (calculateDistance(st.coordinates[0], st.coordinates[1], p[0], p[1]) <= toleranceKm) {
          stationsAlong.push(st);

          break;
        }
      }
    }

    return stationsAlong.sort((a, b) => pathIndex(a.coordinates, path) - pathIndex(b.coordinates, path));
  };

  const pathIndex = (point: [number, number], path: [number, number][]) => {
    let best = 0,
      bestD = Infinity;

    for (let i = 0; i < path.length; i++) {
      const d = calculateDistance(point[0], point[1], path[i][0], path[i][1]);

      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }

    return best;
  };

  // --- ROUTE CALCULATION ---

  const calculateRoute = async () => {
    if (!routeSearch.fromStation || !routeSearch.toStation || !map) return;

    setIsRoutePlanning(true);

    const connectedStations = filterConnectedStations(stations, railwaySegments);

    setStations(connectedStations);

    // Remove old route station markers layer

    if (routeStationsLayerRef.current) {
      map.removeLayer(routeStationsLayerRef.current);

      routeStationsLayerRef.current = null;
    }

    let railwayPath: [number, number][] | null = null;

    if (railwayGraph) {
      railwayPath = buildGraphPathBetweenStations(routeSearch.fromStation, routeSearch.toStation, railwayGraph);
    }

    if (!railwayPath || railwayPath.length < 2) {
      console.warn("Graph path failed. Fallback to direct line.");

      railwayPath = fallbackDirectPath(routeSearch.fromStation, routeSearch.toStation);
    }

    const stationsAlongPath = findStationsAlongPath(railwayPath, connectedStations);

    const distance = calculatePathLength(railwayPath);

    const estimatedTime = Math.round((distance / 60) * 60);

    // Clear previous route visuals

    if (routeLine) map.removeLayer(routeLine);

    map.eachLayer((layer: any) => {
      if (
        layer.options &&
        layer.options.icon &&
        (layer.options.icon.options.className?.includes("route-marker") || layer.options.icon.options.className?.includes("train-animation") || layer.options.icon.options.className?.includes("waypoint-marker"))
      ) {
        map.removeLayer(layer);
      }
    });

    // Draw route polyline

    routeLine = L.polyline(railwayPath, {
      color: "#ef4444",

      weight: 5,

      opacity: 0.9,

      lineCap: "round",

      lineJoin: "round",
    }).addTo(map);

    // Create layer group for route markers

    routeStationsLayerRef.current = L.layerGroup().addTo(map);

    // Endpoints

    const fromMarker = L.marker(routeSearch.fromStation.coordinates, {
      icon: L.divIcon({
        className: "route-marker from-marker",

        html: '<div style="background:#10b981;color:#fff;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-weight:bold;border:3px solid #fff;box-shadow:0 3px 6px rgba(0,0,0,0.3);font-size:16px;">🚉</div>',

        iconSize: [32, 32],

        iconAnchor: [16, 16],
      }),
    }).addTo(routeStationsLayerRef.current);

    const toMarker = L.marker(routeSearch.toStation.coordinates, {
      icon: L.divIcon({
        className: "route-marker to-marker",

        html: '<div style="background:#ef4444;color:#fff;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-weight:bold;border:3px solid #fff;box-shadow:0 3px 6px rgba(0,0,0,0.3);font-size:16px;">🏁</div>',

        iconSize: [32, 32],

        iconAnchor: [16, 16],
      }),
    }).addTo(routeStationsLayerRef.current);

    fromMarker.bindPopup(`<div style="text-align:center;padding:8px;">

      <h3 style="margin:0 0 8px 0;color:#10b981;font-weight:bold;">🚉 Departure</h3>

      <p style="margin:0;font-weight:bold;">${routeSearch.fromStation.name}</p>

      <p style="margin:4px 0 0 0;font-size:12px;color:#666;">Track-following route</p>

    </div>`);

    toMarker.bindPopup(`<div style="text-align:center;padding:8px;">

      <h3 style="margin:0 0 8px 0;color:#ef4444;font-weight:bold;">🏁 Destination</h3>

      <p style="margin:0;font-weight:bold;">${routeSearch.toStation.name}</p>

      <p style="margin:4px 0 0 0;font-size:12px;color:#666;">Via rail network</p>

    </div>`);

    // Waypoints markers (intermediate stations)

    stationsAlongPath.forEach((st, i) => {
      const waypoint = L.marker(st.coordinates, {
        icon: L.divIcon({
          className: "waypoint-marker",

          html: `<div style="background:#3b82f6;color:#fff;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-weight:bold;border:2px solid #fff;box-shadow:0 2px 4px rgba(0,0,0,0.2);font-size:12px;">${
            i + 1
          }</div>`,

          iconSize: [24, 24],

          iconAnchor: [12, 12],
        }),
      }).addTo(routeStationsLayerRef.current);

      waypoint.bindPopup(`

        <div style="text-align:center;padding:8px;">

          <h3 style="margin:0 0 8px 0;color:#3b82f6;font-weight:bold;">🚉 Waypoint ${i + 1}</h3>

          <p style="margin:0;font-weight:bold;">${st.name}</p>

          <p style="margin:4px 0 0 0;font-size:12px;color:#666;">${st.properties.railway || "Station"}</p>

        </div>

      `);
    });

    // Train animation

    if (railwayPath.length > 3) {
      const sampled = railwayPath.filter((_, i) => i % Math.ceil(railwayPath.length / 60) === 0);

      if (sampled[sampled.length - 1] !== railwayPath[railwayPath.length - 1]) {
        sampled.push(railwayPath[railwayPath.length - 1]);
      }

      const trainMarker = L.marker(sampled[0], {
        icon: L.divIcon({
          className: "train-animation",

          html: '<div style="background:#f59e0b;color:#fff;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-weight:bold;border:2px solid #fff;box-shadow:0 2px 4px rgba(0,0,0,0.2);font-size:12px;">🚂</div>',

          iconSize: [24, 24],

          iconAnchor: [12, 12],
        }),
      }).addTo(routeStationsLayerRef.current);

      let idx = 0;

      const step = () => {
        idx++;

        if (idx >= sampled.length) {
          setTimeout(() => routeStationsLayerRef.current && routeStationsLayerRef.current.removeLayer(trainMarker), 1000);

          return;
        }

        trainMarker.setLatLng(sampled[idx]);

        setTimeout(step, 250);
      };

      setTimeout(step, 400);
    }

    map.fitBounds(L.latLngBounds(railwayPath), { padding: [30, 30] });

    setCurrentRoute({
      fromStation: routeSearch.fromStation,

      toStation: routeSearch.toStation,

      distance: Math.round(distance * 10) / 10,

      estimatedTime,

      polyline: routeLine,

      railwayPath,

      stationsAlongPath,
    });
  };

  const calculatePathLength = (path: [number, number][]): number => {
    let total = 0;

    for (let i = 1; i < path.length; i++) {
      total += calculateDistance(path[i - 1][0], path[i - 1][1], path[i][0], path[i][1]);
    }

    return total;
  };

  const filterConnectedStations = (allStations: Station[], segments: RailwaySegment[]): Station[] => {
    const connected: Station[] = [];

    const threshold = 4;

    for (const st of allStations) {
      let ok = false;

      for (const seg of segments) {
        const minD = Math.min(...seg.coordinates.map((c) => calculateDistance(st.coordinates[0], st.coordinates[1], c[0], c[1])));

        if (minD <= threshold) {
          ok = true;
          break;
        }
      }

      if (ok) connected.push(st);
    }

    return connected;
  };

  const clearRoute = () => {
    if (routeLine && map) {
      map.removeLayer(routeLine);

      routeLine = null;
    }

    if (routeStationsLayerRef.current && map) {
      map.removeLayer(routeStationsLayerRef.current);

      routeStationsLayerRef.current = null;
    }

    // Remove stray route markers if any

    if (map) {
      map.eachLayer((layer: any) => {
        if (
          layer.options &&
          layer.options.icon &&
          (layer.options.icon.options.className?.includes("route-marker") || layer.options.icon.options.className?.includes("train-animation") || layer.options.icon.options.className?.includes("waypoint-marker"))
        ) {
          map.removeLayer(layer);
        }
      });
    }

    if (searchTimeout) {
      clearTimeout(searchTimeout);

      setSearchTimeout(null);
    }

    if (isRoutePlanning && originalStations.length > 0) {
      setStations(originalStations);

      setIsRoutePlanning(false);
    }

    setCurrentRoute(null);

    setRouteSearch({ from: "", to: "", fromStation: null, toStation: null });
  };

  const resetView = () => {
    if (map) map.setView([-2.5, 118], 5);

    clearRoute();

    setSearchQuery("");

    setSelectedFilter("all");

    setSelectedItem(null);
  };

  // Filtered lists (sidebar)

  const filteredProvinces = provinces.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const filteredStations = useMemo(() => {
    if (!searchQuery && selectedFilter === "all") return [];

    const lower = searchQuery.toLowerCase();

    return stations
      .filter((st) => {
        const match = st.name.toLowerCase().includes(lower);

        const filterOk = selectedFilter === "all" || st.properties.railway === selectedFilter || (selectedFilter === "platform" && st.type === "LineString" && st.properties.railway === "platform");

        return match && filterOk;
      })
      .slice(0, 50);
  }, [stations, searchQuery, selectedFilter]);

  const handleProvinceClick = (p: Province) => setSelectedItem(p);

  const handleStationClick = (s: Station) => {
    if (map) map.flyTo(s.coordinates, 15);

    setSelectedItem(s);
  };

  // --- Show/hide base layers depending on route mode ---

  const hideBaseLayers = () => {
    if (geoJsonLayer?.railLayer && map.hasLayer(geoJsonLayer.railLayer)) {
      map.removeLayer(geoJsonLayer.railLayer);
    }

    if (markerClusterGroup && map.hasLayer(markerClusterGroup)) {
      map.removeLayer(markerClusterGroup);
    }
  };

  const showBaseLayers = () => {
    if (geoJsonLayer?.railLayer && !map.hasLayer(geoJsonLayer.railLayer)) {
      map.addLayer(geoJsonLayer.railLayer);
    }

    if (markerClusterGroup && !map.hasLayer(markerClusterGroup)) {
      map.addLayer(markerClusterGroup);
    }
  };

  useEffect(() => {
    // toggle route mode when user opens/closes route planner

    setIsRouteMode(showRouteSearch);

    if (showRouteSearch) {
      // entering route mode: hide base layers & clear route remnants

      hideBaseLayers();
    } else {
      // leaving route mode: clear route and restore base

      clearRoute();

      showBaseLayers();
    }
  }, [showRouteSearch, geoJsonLayer]);

  // INIT MAP
  useEffect(() => {
    const init = async () => {
      if (!mapRef.current || map) return;

      // Clear any existing map instance and container
      if ((mapRef.current as any)._leaflet_id) {
        delete (mapRef.current as any)._leaflet_id;
      }

      const leaflet = await import("leaflet");
      await import("leaflet.markercluster");

      L = leaflet.default;

      const indoBounds: [[number, number], [number, number]] = [
        [-11, 95],
        [6, 141],
      ];

      map = L.map(mapRef.current, {
        minZoom: 4,
        maxZoom: 18,
        maxBounds: indoBounds,
        maxBoundsViscosity: 1.0,
      }).setView([-2.5, 118], 5);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",

        maxZoom: 18,
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      markerClusterGroup = L.markerClusterGroup({
        chunkedLoading: true,

        spiderfyOnMaxZoom: false,

        showCoverageOnHover: false,

        zoomToBoundsOnClick: true,

        maxClusterRadius: 50,

        iconCreateFunction: (cluster: any) =>
          L.divIcon({
            html: `<div style="background:#3b82f6;color:#fff;border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-weight:bold;border:2px solid #fff;box-shadow:0 2px 4px rgba(0,0,0,0.2);">${cluster.getChildCount()}</div>`,

            className: "custom-cluster-icon",

            iconSize: L.point(40, 40, true),
          }),
      });

      const loadData = async () => {
        try {
          const res = await fetch("/data/daftar_stasiun_jalur.geojson");

          const data = await res.json();

          const segments = buildRailwayNetwork(data.features);

          setRailwaySegments(segments);

          const graph = buildRailwayGraph(segments);

          setRailwayGraph(graph);

          const stats = calculateStats(data.features);

          setStationStats(stats);

          const railLayer = L.geoJSON(data, {
            style: {
              color: "#2563eb",

              weight: 2,

              opacity: 0.7,

              lineCap: "round",

              lineJoin: "round",
            },

            filter: (f: any) => f.geometry && f.geometry.type === "LineString",
          }).addTo(map);

          const stationMarkers: any[] = [];

          const stationLayer = L.geoJSON(data, {
            style: (f: any) => {
              if (f?.geometry.type === "Polygon") return { color: "#10b981", weight: 2, fillOpacity: 0.3, fillColor: "#d1fae5" };
              else if (f?.geometry.type === "LineString") {
                const r = f.properties?.railway;

                if (r === "platform") return { color: "#f59e0b", weight: 4, opacity: 0.8 };

                return { color: "#1f2937", weight: 3, opacity: 0.9 };
              }

              return {};
            },

            pointToLayer: (feature: any, latlng: L.LatLngExpression) => {
              if (feature.geometry.type !== "Point") return null;

              const marker = L.marker(latlng, { icon: getStationIcon(feature.properties) });

              marker.bindPopup(createPopupContent(feature));

              marker.on("click", () => {
                const centroid = calculateCentroid(feature.geometry);

                map.flyTo(centroid, 15);

                setSelectedItem({
                  id: feature.id || feature.properties["@id"] || "",

                  name: feature.properties.name || "Unknown",

                  type: feature.geometry.type,

                  properties: feature.properties,

                  coordinates: centroid,
                });
              });

              stationMarkers.push(marker);

              return marker;
            },

            onEachFeature: (feature: any, layer: any) => {
              if (feature.geometry.type === "LineString") {
                layer.bindPopup(createPopupContent(feature));

                layer.on("click", () => {
                  const centroid = calculateCentroid(feature.geometry);

                  map.flyTo(centroid, 15);

                  setSelectedItem({
                    id: feature.id || feature.properties["@id"] || "",

                    name: feature.properties.name || "Unknown",

                    type: feature.geometry.type,

                    properties: feature.properties,

                    coordinates: centroid,
                  });
                });
              }
            },
          });

          stationMarkers.forEach((m) => markerClusterGroup.addLayer(m));

          map.addLayer(markerClusterGroup);

          setGeoJsonLayer({ stationLayer, railLayer });

          const extractedStations: Station[] = data.features

            .filter((f: any) => f.properties.name && f.geometry.type === "Point")

            .map((f: any) => ({
              id: f.id || f.properties["@id"] || "",

              name: f.properties.name,

              type: f.geometry.type,

              properties: f.properties,

              coordinates: calculateCentroid(f.geometry),
            }));

          setStations(extractedStations);

          setOriginalStations(extractedStations);
        } catch (e) {
          console.error("Error loading geojson:", e);
        }
      };

      await loadData();

      const sampleProvinces = [
        { name: "DKI Jakarta", population: 10562088, area: 664, capital: "Jakarta" },

        { name: "Jawa Barat", population: 48037859, area: 35377, capital: "Bandung" },

        { name: "Jawa Tengah", population: 34257565, area: 32800, capital: "Semarang" },

        { name: "Jawa Timur", population: 39293191, area: 47799, capital: "Surabaya" },

        { name: "Sumatera Utara", population: 14799361, area: 72981, capital: "Medan" },

        { name: "Sumatera Barat", population: 5534472, area: 42012, capital: "Padang" },

        { name: "Riau", population: 6394087, area: 87023, capital: "Pekanbaru" },

        { name: "Sumatera Selatan", population: 8467432, area: 91592, capital: "Palembang" },

        { name: "Lampung", population: 9007848, area: 34623, capital: "Bandar Lampung" },

        { name: "Kalimantan Barat", population: 5414390, area: 147307, capital: "Pontianak" },

        { name: "Kalimantan Tengah", population: 2669969, area: 153564, capital: "Palangka Raya" },

        { name: "Kalimantan Selatan", population: 4073584, area: 38744, capital: "Banjarmasin" },

        { name: "Kalimantan Timur", population: 3766039, area: 129066, capital: "Samarinda" },

        { name: "Sulawesi Utara", population: 2621923, area: 13851, capital: "Manado" },

        { name: "Sulawesi Tengah", population: 2985734, area: 61841, capital: "Palu" },

        { name: "Sulawesi Selatan", population: 9073509, area: 46717, capital: "Makassar" },

        { name: "Sulawesi Tenggara", population: 2624875, area: 38067, capital: "Kendari" },

        { name: "Bali", population: 4317404, area: 5780, capital: "Denpasar" },

        { name: "Nusa Tenggara Barat", population: 5320092, area: 18572, capital: "Mataram" },

        { name: "Nusa Tenggara Timur", population: 5325566, area: 48718, capital: "Kupang" },

        { name: "Papua", population: 4303707, area: 319036, capital: "Jayapura" },

        { name: "Papua Barat", population: 1134068, area: 99671, capital: "Manokwari" },
      ];

      setProvinces(sampleProvinces);

      setIsLoading(false);
    };

    init();

    return () => {
      if (map) {
        map.remove();

        map = null;
      }

      if (searchTimeout) clearTimeout(searchTimeout);
    };
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
      <div ref={mapRef} className="h-full w-full" />

      {/* Top Navbar */}

      <div className="absolute top-4 left-4 right-4 z-[1000] max-w-7xl mx-auto">
        <Card className="p-4 backdrop-blur-md bg-card/90 border-border/50 shadow-lg">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <Image src={Logo} alt="" className="h-full w-12 text-primary" />
            </div>

            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <Button variant={showRouteSearch ? "default" : "outline"} onClick={() => setShowRouteSearch(!showRouteSearch)} className="gap-2">
                <Navigation className="h-4 w-4" />
                Route Planner
              </Button>

              <Button variant="outline" onClick={() => setShowStats(!showStats)} className="gap-2 bg-transparent">
                <BarChart3 className="h-4 w-4" />
                Stats
              </Button>

              {!isRouteMode && (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="gap-2 bg-transparent">
                        <Filter className="h-4 w-4" />
                        Filter
                        {selectedFilter !== "all" && (
                          <Badge variant="secondary" className="ml-1">
                            1
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem onClick={() => setSelectedFilter("all")}>
                        <Layers className="mr-2 h-4 w-4" />
                        All
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => setSelectedFilter("station")}>
                        <Train className="mr-2 h-4 w-4" />
                        Main Stations
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => setSelectedFilter("halt")}>
                        <MapPin className="mr-2 h-4 w-4" />
                        Halts
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => setSelectedFilter("platform")}>
                        <Building className="mr-2 h-4 w-4" />
                        Platforms
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <Input placeholder="Cari stasiun..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 w-full md:w-64" />
                  </div>
                </>
              )}

              <Button variant="outline" onClick={resetView} className="gap-2 bg-transparent">
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </Card>

        {/* Route Planner Panel */}

        {showRouteSearch && (
          <div className="absolute top-20 left-0 w-96 z-[1000]">
            <Card className="backdrop-blur-md bg-card/90 border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Route className="h-5 w-5" />
                  Plan Your Route
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="relative">
                  <label className="text-sm font-medium mb-1 block">From</label>

                  <div className="relative">
                    <MapPinIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />

                    <Input placeholder="Select departure station..." value={routeSearch.from} onChange={(e) => handleFromSearch(e.target.value)} className="pl-10" />
                  </div>

                  {showFromDropdown && filteredFromStations.length > 0 && (
                    <div className="absolute top-full mt-1 w-full bg-card border border-border rounded-md shadow-lg max-h-60 overflow-y-auto z-[1001]">
                      {filteredFromStations.map((st) => (
                        <div key={st.id} onClick={() => selectFromStation(st)} className="p-3 hover:bg-accent cursor-pointer border-b border-border last:border-b-0">
                          <div className="font-medium">{st.name}</div>

                          <div className="text-xs text-muted-foreground">
                            {st.properties.railway || "Station"} • {st.properties.operator || "Unknown"}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <label className="text-sm font-medium mb-1 block">To</label>

                  <div className="relative">
                    <MapPinIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-red-500" />

                    <Input placeholder="Select destination station..." value={routeSearch.to} onChange={(e) => handleToSearch(e.target.value)} className="pl-10" />
                  </div>

                  {showToDropdown && filteredToStations.length > 0 && (
                    <div className="absolute top-full mt-1 w-full bg-card border border-border rounded-md shadow-lg max-h-60 overflow-y-auto z-[1001]">
                      {filteredToStations.map((st) => (
                        <div key={st.id} onClick={() => selectToStation(st)} className="p-3 hover:bg-accent cursor-pointer border-b border-border last:border-b-0">
                          <div className="font-medium">{st.name}</div>

                          <div className="text-xs text-muted-foreground">
                            {st.properties.railway || "Station"} • {st.properties.operator || "Unknown"}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={calculateRoute} disabled={!routeSearch.fromStation || !routeSearch.toStation} className="flex-1">
                    <Navigation className="h-4 w-4 mr-2" />
                    Find Railway Route
                  </Button>

                  {currentRoute && (
                    <Button variant="outline" onClick={clearRoute}>
                      Clear
                    </Button>
                  )}
                </div>

                {currentRoute && (
                  <div className="bg-accent/50 p-3 rounded-lg space-y-2">
                    <h4 className="font-semibold">Railway Route Information</h4>

                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <Route className="h-4 w-4 text-muted-foreground" />

                        <span>
                          <strong>Distance:</strong> {currentRoute.distance} km (via railway)
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />

                        <span>
                          <strong>Est. Time:</strong> {Math.floor(currentRoute.estimatedTime / 60)}h {currentRoute.estimatedTime % 60}m
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Train className="h-4 w-4 text-muted-foreground" />

                        <span>
                          <strong>Route Type:</strong> Track-following
                        </span>
                      </div>

                      <div className="pt-2 text-xs text-muted-foreground">
                        * Mode Route Planner menyembunyikan semua layer lain.
                        <br />
                        * Jika garis pernah lurus: kemungkinan data antar segmen terputus (fallback).
                        <br />* Kecepatan asumsi 60 km/h.
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Stats Panel */}

        {showStats && !isRouteMode && (
          <div className="absolute top-20 right-0 w-80 z-[1000]">
            <Card className="backdrop-blur-md bg-card/90 border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Railway Statistics
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Overview</h4>

                  <p className="text-sm text-muted-foreground">
                    Total Stations: <span className="font-medium">{stationStats.totalStations}</span>
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Elevation Range:{" "}
                    <span className="font-medium">
                      {stationStats.elevationRange.min}m - {stationStats.elevationRange.max}m
                    </span>
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Railway Types</h4>

                  {Object.entries(stationStats.railwayTypes).map(([t, c]) => (
                    <div key={t} className="flex justify-between text-sm">
                      <span className="capitalize">{t}</span>

                      <span className="font-medium">{c}</span>
                    </div>
                  ))}
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Geometry Types</h4>

                  {Object.entries(stationStats.stationTypes).map(([t, c]) => (
                    <div key={t} className="flex justify-between text-sm">
                      <span className="capitalize">{t}</span>

                      <span className="font-medium">{c}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Sidebar: normal mode (search/filter) */}

        {!isRouteMode && (searchQuery || selectedFilter !== "all") && (
          <div className="absolute top-20 left-0 w-80 z-[1000]">
            <Card className="backdrop-blur-md bg-card/90 border-border/50 shadow-lg">
              <div className="p-4">
                {filteredProvinces.length > 0 && (
                  <>
                    <h3 className="font-semibold mb-3">Provinsi ({filteredProvinces.length})</h3>

                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {filteredProvinces.map((p) => (
                        <div key={p.name} onClick={() => handleProvinceClick(p)} className="p-3 rounded-lg border border-border hover:bg-accent cursor-pointer transition-colors">
                          <h4 className="font-medium">{p.name}</h4>

                          <p className="text-sm text-muted-foreground">
                            {p.capital} • {p.population?.toLocaleString()} jiwa
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {filteredStations.length > 0 && (
                  <>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Train className="h-4 w-4" />
                      Stations ({filteredStations.length})
                    </h3>

                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {filteredStations.map((st) => (
                        <div key={st.id} onClick={() => handleStationClick(st)} className="p-3 rounded-lg border border-border hover:bg-accent cursor-pointer transition-colors">
                          <h4 className="font-medium flex items-center gap-2">
                            {st.properties.railway === "station" ? "🚉" : st.properties.railway === "halt" ? "🚏" : "🚂"}

                            {st.name}
                          </h4>

                          <p className="text-sm text-muted-foreground">
                            {st.properties.railway || "Railway"} • {st.properties.operator || "Unknown operator"}
                          </p>

                          {st.properties.ele && <p className="text-xs text-muted-foreground">Elevation: {st.properties.ele}m</p>}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Sidebar: route mode (show route stations even without search) */}

        {isRouteMode && currentRoute && (
          <div className="absolute top-20 left-[400px] w-80 z-[1000]">
            <Card className="backdrop-blur-md bg-card/90 border-border/50 shadow-lg">
              <div className="p-4 space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Train className="h-4 w-4" /> Jalur & Stasiun Rute
                </h3>

                <div className="space-y-2">
                  {/* From */}

                  {currentRoute.fromStation && (
                    <div className="p-3 rounded-lg border border-border bg-green-50/40 dark:bg-green-500/10">
                      <h4 className="font-medium flex items-center gap-2">🚉 {currentRoute.fromStation.name}</h4>

                      <p className="text-xs text-muted-foreground">Departure</p>
                    </div>
                  )}

                  {/* Waypoints */}

                  {currentRoute.stationsAlongPath.length > 0 && (
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {currentRoute.stationsAlongPath.map((st, i) => (
                        <div key={st.id} className="p-3 rounded-lg border border-border hover:bg-accent/60 cursor-pointer transition-colors" onClick={() => map && map.flyTo(st.coordinates, 13)}>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-500 text-white text-xs font-bold">{i + 1}</div>

                            <h4 className="font-medium flex-1">
                              {st.properties.railway === "station" ? "🚉" : st.properties.railway === "halt" ? "🚏" : "🚂"} {st.name}
                            </h4>
                          </div>

                          <p className="text-xs text-muted-foreground mt-1">
                            {st.properties.railway || "Station"} • {st.properties.operator || "KAI"}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* To */}

                  {currentRoute.toStation && (
                    <div className="p-3 rounded-lg border border-border bg-red-50/40 dark:bg-red-500/10">
                      <h4 className="font-medium flex items-center gap-2">🏁 {currentRoute.toStation.name}</h4>

                      <p className="text-xs text-muted-foreground">Destination</p>
                    </div>
                  )}
                </div>

                <div className="text-xs text-muted-foreground">Menampilkan hanya stasiun yang dilewati rute saat ini. Tutup Route Planner untuk melihat semua layer kembali.</div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>

              <span className="text-foreground">Memuat peta dan data...</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

/* ===== Legacy helpers retained ===== */

function findNearbyRailwaySegments(
  station: Station,

  segments: RailwaySegment[],

  radiusKm: number
): Array<{ segment: RailwaySegment; point: [number, number]; index: number; distance: number }> {
  const nearby: Array<{ segment: RailwaySegment; point: [number, number]; index: number; distance: number }> = [];

  for (const segment of segments) {
    let closestDistance = Infinity;

    let closestPoint: [number, number] | null = null;

    let closestIndex = -1;

    const step = Math.max(1, Math.floor(segment.coordinates.length / 20));

    for (let i = 0; i < segment.coordinates.length; i += step) {
      const coord = segment.coordinates[i];

      const d = calculateDistance(station.coordinates[0], station.coordinates[1], coord[0], coord[1]);

      if (d < closestDistance) {
        closestDistance = d;

        closestPoint = coord;

        closestIndex = i;
      }
    }

    if (closestPoint && closestDistance <= radiusKm) {
      nearby.push({ segment, point: closestPoint, index: closestIndex, distance: closestDistance });
    }
  }

  return nearby.sort((a, b) => a.distance - b.distance).slice(0, 3);
}

function cleanupPath(path: [number, number][]): [number, number][] {
  if (path.length <= 2) return path;

  const cleaned: [number, number][] = [path[0]];

  for (let i = 1; i < path.length - 1; i++) {
    const prev = cleaned[cleaned.length - 1];

    const current = path[i];

    const next = path[i + 1];

    const distToPrev = calculateDistance(prev[0], prev[1], current[0], current[1]);

    if (distToPrev < 0.05) continue;

    const angle1 = Math.atan2(current[1] - prev[1], current[0] - prev[0]);

    const angle2 = Math.atan2(next[1] - current[1], next[0] - current[0]);

    const angleDiff = Math.abs(angle1 - angle2);

    if (angleDiff > 0.26) cleaned.push(current);
  }

  cleaned.push(path[path.length - 1]);

  return cleaned;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;

  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
