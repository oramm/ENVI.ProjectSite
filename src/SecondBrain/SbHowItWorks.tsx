import React, { useEffect, useRef, useState } from "react";
import { Button } from "react-bootstrap";
import { HAND, INK, ROLE, SketchDefs } from "./SbInstallerComic";
import {
    DOORS, DoorId, EXAMPLE_FILTERS, EXAMPLES, Example, FLOWS, FlowText, GUIDE, MAP, MapNodeId, SCREENS, ScreenId, SYNC, SyncState,
} from "./sbGuideContent";

/**
 * Zakładka "Jak to działa" strony Second Brain: przewodnik z siedmiu ekranów (plan UZYCIE_SB,
 * SB.RDZEN.01). Pierwszy ekran to mapa ekosystemu, z której wchodzi się na pozostałe; rysunek niesie
 * treść, tekst tylko podpisuje. Cały tekst jest w `sbGuideContent.ts`, tu wygląd i geometria.
 */

type Art = { box: string; body: React.ReactNode };
type FlowNode = { id: string; x: number; y: number; w: number; h: number; fill: string; title: string; sub?: string; art: Art };
type FlowArrow = {
    id: string; d: string; color: string; dashed?: boolean; both?: boolean;
    label?: { x: number; y: number; lines: string[]; anchor?: "start" | "middle" | "end" };
};
type FlowStep = { id: string; label: string; text: string; arrows: string[]; nodes?: string[]; card?: Example };

/** Ruch wyłączamy, gdy system prosi o ograniczenie animacji. */
function motionAllowed() {
    return !(typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
}

/** Enter i spacja działają na klikanym elemencie rysunku tak jak na przycisku. */
function onActivate(action: () => void) {
    return (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); action(); }
    };
}

/** Kartka, która jedzie po strzałce - widać, że coś płynie i w którą stronę. */
function Courier({ path, reverse }: { path: string; reverse?: boolean }) {
    return (
        <g>
            <rect x={-7} y={-9} width={14} height={18} rx={2} fill="#fff" stroke={INK} strokeWidth={1.5} />
            <path d="M-3.5 -3.5h7M-3.5 0h7M-3.5 3.5h4" stroke="#9aa0a6" strokeWidth={1.2} />
            {/* Bez opóźnienia startu: kartka czekająca na start stałaby w rogu rysunku. */}
            <animateMotion dur="2.4s" repeatCount="indefinite"
                {...(reverse ? { keyPoints: "1;0", keyTimes: "0;1", calcMode: "linear" } : {})}>
                <mpath href={`#${path}`} />
            </animateMotion>
        </g>
    );
}

/** Kopiowanie jednym kliknięciem; gdy przeglądarka nie pozwala, mówi, co zrobić ręcznie. */
export function CopyButton({ text }: { text: string }) {
    const [label, setLabel] = useState(GUIDE.copy.idle);
    async function copy() {
        try {
            await navigator.clipboard.writeText(text);
            setLabel(GUIDE.copy.done);
        } catch {
            setLabel(GUIDE.copy.failed);
        }
        setTimeout(() => setLabel(GUIDE.copy.idle), 2500);
    }
    return (
        <Button variant="outline-dark" size="sm" onClick={copy} aria-live="polite"
            style={{ minHeight: 36, whiteSpace: "nowrap", alignSelf: "flex-start" }}>{label}</Button>
    );
}

const box = (extra: React.CSSProperties = {}): React.CSSProperties => ({
    background: "#fffdf8", border: `2px solid ${INK}`, borderRadius: "16px 16px 16px 3px", padding: "10px 14px", ...extra,
});

function KindTag({ kind }: { kind: "read" | "write" }) {
    return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, padding: "0 8px",
            border: `1.5px solid ${INK}`, borderRadius: 9, background: kind === "read" ? "#e5eef8" : "#fdf0e2" }}>
            <svg width="18" height="14" viewBox="0 0 24 18" fill="none" stroke={INK} strokeWidth={2} aria-hidden="true">
                {kind === "read"
                    ? <><path d="M1 9s4-7 11-7 11 7 11 7-4 7-11 7S1 9 1 9z" /><circle cx="12" cy="9" r="3" /></>
                    : <path d="M3 15l2-5L15 1l3 3-9 10zM5 10l3 3" />}
            </svg>
            {GUIDE.kinds[kind]}
        </span>
    );
}

/**
 * Jedna karta przykładu dla wszystkiego: zdań do agenta, przycisku Pomoc i analizy przez agenta.
 * Trzy pola idą po strzałkach od góry: co piszesz albo klikasz, co dostajesz, gdzie jest decyzja.
 */
export function ExampleCard({ example }: { example: Example }) {
    const arrow = <div aria-hidden="true" style={{ textAlign: "center", fontSize: 20, lineHeight: 1, margin: "2px 0" }}>↓</div>;
    const field = (name: string, body: React.ReactNode, fill: string) => (
        <div style={{ background: fill, border: `2px solid ${INK}`, borderRadius: 12, padding: "8px 12px" }}>
            <div style={{ fontFamily: HAND, fontSize: 21, fontWeight: 700, lineHeight: 1.1 }}>{name}</div>
            {body}
        </div>
    );
    return (
        <article aria-label={example.says ?? example.action} style={box({ display: "flex", flexDirection: "column", borderRadius: 16 })}>
            <div className="d-flex flex-wrap align-items-center mb-2" style={{ gap: 8, fontSize: 14 }}>
                <span className="text-muted">{example.where}</span>
                {example.kind && <KindTag kind={example.kind} />}
            </div>
            {field(example.says && !example.action ? GUIDE.cardFields.says : GUIDE.cardFields.action, <>
                {example.action && <div>{example.action}</div>}
                {example.says && <div className="d-flex flex-wrap align-items-start justify-content-between" style={{ gap: 8 }}>
                    <span style={{ fontFamily: HAND, fontSize: 23, lineHeight: 1.15 }}>„{example.says}”</span>
                    <CopyButton text={example.says} />
                </div>}
            </>, ROLE.you)}
            {arrow}
            {field(GUIDE.cardFields.gets, <div>{example.gets}</div>, ROLE.agent)}
            {arrow}
            {field(GUIDE.cardFields.decision, <div>{example.decision}</div>, "#fff")}
            {example.note && <div className="text-muted mt-2" style={{ fontSize: 14 }}>{example.note}</div>}
        </article>
    );
}

/**
 * Schemat krok po kroku: przyciski pod rysunkiem podświetlają jedną strzałkę naraz, a po niej
 * jadą kartki. Krok 0 pokazuje całość. Krok może nieść kartę przykładu.
 */
function FlowDiagram({ id, title, box: viewBox, nodes, arrows, steps }: {
    id: string; title: string; box: string; nodes: FlowNode[]; arrows: FlowArrow[]; steps: FlowStep[];
}) {
    const [index, setIndex] = useState(0);
    const step = steps[index];
    const motion = motionAllowed();
    const lit = (arrow: string) => step.arrows.includes(arrow);
    const nodeLit = (node: string) => !step.nodes || step.nodes.includes(node);
    const [, , boxW, boxH] = viewBox.split(" ").map(Number);

    return (
        <figure className="mb-4" style={{ color: INK }}>
            <svg viewBox={viewBox} role="img" aria-label={title} aria-describedby={`${id}-opis`}
                style={{ width: "100%", maxWidth: 640, height: "auto", display: "block", margin: "0 auto" }}>
                <defs>
                    {/* Własny obszar filtra: prosta pozioma albo pionowa kreska ma zerową ramkę i bez tego znika. */}
                    <filter id={`${id}-szkic`} filterUnits="userSpaceOnUse" x={0} y={0} width={boxW} height={boxH}>
                        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={2} seed={7} />
                        <feDisplacementMap in="SourceGraphic" scale={2.5} />
                    </filter>
                    {arrows.map(a => (
                        <marker key={a.id} id={`${id}-grot-${a.id}`} orient="auto-start-reverse" markerWidth={8} markerHeight={8}
                            refX={5} refY={4}>
                            <path d="M0 0L8 4L0 8z" fill={a.color} />
                        </marker>
                    ))}
                </defs>
                {arrows.map(a => {
                    const on = lit(a.id);
                    const pathId = `${id}-${a.id}`;
                    return (
                        <g key={a.id} style={{ opacity: on ? 1 : 0.15, transition: "opacity .4s" }}>
                            <path id={pathId} d={a.d} fill="none" stroke={a.color} strokeWidth={on ? 3 : 2}
                                strokeLinecap="round" strokeLinejoin="round" strokeDasharray={a.dashed ? "8 8" : undefined}
                                markerEnd={`url(#${id}-grot-${a.id})`} markerStart={a.both ? `url(#${id}-grot-${a.id})` : undefined}
                                style={{ filter: `url(#${id}-szkic)` }} />
                            {a.label && (
                                <text x={a.label.x} y={a.label.y} textAnchor={a.label.anchor ?? "start"} fill={a.color}
                                    style={{ fontFamily: HAND, fontSize: 22, fontWeight: 700 }}>
                                    {a.label.lines.map((line, i) => <tspan key={line} x={a.label!.x} dy={i ? 22 : 0}>{line}</tspan>)}
                                </text>
                            )}
                            {motion && on && <Courier path={pathId} />}
                            {motion && on && a.both && <Courier path={pathId} reverse />}
                        </g>
                    );
                })}
                {nodes.map(n => (
                    <g key={n.id} style={{ opacity: nodeLit(n.id) ? 1 : 0.4, transition: "opacity .4s" }}>
                        <rect x={n.x} y={n.y} width={n.w} height={n.h} rx={16} fill={n.fill} stroke={INK} strokeWidth={2}
                            style={{ filter: "url(#sb-szkic)" }} />
                        <svg x={n.x + 10} y={n.y + 8} width={n.w - 20} height={n.h - (n.sub ? 64 : 44)} viewBox={n.art.box} fill="none"
                            stroke={INK} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" style={{ filter: "url(#sb-szkic)" }}>
                            {n.art.body}
                        </svg>
                        <text x={n.x + n.w / 2} y={n.y + n.h - (n.sub ? 32 : 12)} textAnchor="middle" fill={INK}
                            style={{ fontFamily: HAND, fontSize: n.title.length > 14 ? 23 : 27, fontWeight: 700 }}>{n.title}</text>
                        {n.sub && <text x={n.x + n.w / 2} y={n.y + n.h - 10} textAnchor="middle" fill={INK}
                            style={{ fontFamily: HAND, fontSize: 20 }}>{n.sub}</text>}
                    </g>
                ))}
            </svg>
            <div role="group" aria-label={`Kroki: ${title}`} className="d-flex flex-wrap mt-3" style={{ gap: 8 }}>
                {steps.map((s, i) => (
                    <button key={s.id} type="button" aria-pressed={i === index} onClick={() => setIndex(i)} style={{
                        minHeight: 44, padding: "4px 14px", fontFamily: HAND, fontSize: 21, color: INK, cursor: "pointer",
                        background: i === index ? ROLE.you : "#fffdf8", border: `${i === index ? 3 : 2}px solid ${INK}`,
                        borderRadius: "14px 10px 15px 11px", fontWeight: i === index ? 700 : 400,
                    }}>{s.label}</button>
                ))}
            </div>
            <figcaption id={`${id}-opis`} aria-live="polite" className="mt-3"
                style={box({ boxShadow: "3px 4px 0 rgba(47,52,55,.10)", fontSize: 17, lineHeight: 1.5 })}>
                {step.text}
            </figcaption>
            {step.card && <div className="mt-3"><ExampleCard example={step.card} /></div>}
            {index < steps.length - 1 && <div className="mt-2 text-end">
                <Button variant="dark" size="sm" onClick={() => setIndex(index + 1)}>{GUIDE.next}: {steps[index + 1].label} ›</Button>
            </div>}
        </figure>
    );
}

const ART = {
    admin: { box: "0 0 50 28", body: <>
        <circle cx="11" cy="8" r="4.5" fill={ROLE.you} /><path d="M3 26c0-5.5 3.6-9.5 8-9.5s8 4 8 9.5z" fill={ROLE.you} />
        <rect x="24" y="3" width="23" height="16" rx="1.5" fill="#fff" /><path d="M32 25h7M35.5 19v6" /><path d="M28 8h14M28 12h9" stroke="#9aa0a6" />
    </> },
    canon: { box: "0 0 44 30", body: <>
        <path d="M11 27h22a7 7 0 0 0 1-13.9A10 10 0 0 0 15.2 11 8 8 0 0 0 11 27z" fill="#fff" />
        <path d="M16 16.5h5.5c1 0 1.5.6 1.5 1.5v6c0-.8-.6-1.4-1.5-1.4H16zM29 16.5h-5.5c-1 0-1.5.6-1.5 1.5v6c0-.8.6-1.4 1.5-1.4H29z" stroke="#3d6a8f" />
    </> },
    team: { box: "0 0 60 30", body: <>
        <circle cx="12" cy="7" r="3.6" fill={ROLE.agent} /><path d="M5 19c0-4 3.1-7 7-7s7 3 7 7z" fill={ROLE.agent} />
        <circle cx="48" cy="7" r="3.6" fill={ROLE.github} /><path d="M41 19c0-4 3.1-7 7-7s7 3 7 7z" fill={ROLE.github} />
        <circle cx="30" cy="5.5" r="3.6" fill={ROLE.you} /><path d="M23 17.5c0-4 3.1-7 7-7s7 3 7 7z" fill={ROLE.you} />
        <path d="M14 18h12l2.5 2.5H46v8.5H14z" fill="#d9d0ee" />
    </> },
    computer: { box: "0 0 120 72", body: <>
        <circle cx="34" cy="20" r="9" fill={ROLE.you} /><path d="M17 57c0-11 7.6-19 17-19s17 8 17 19z" fill={ROLE.you} />
        <rect x="58" y="31" width="38" height="24" rx="2" fill={ROLE.agent} /><path d="M52 59h50l-4-4H56z" fill="#fff" />
        <path d="M6 59h108M14 59v12M106 59v12" /><path d="M65 37h16v7h-9l-4 3v-3h-3z" fill="#fff" />
    </> },
    agent: { box: "0 0 52 40", body: <>
        <rect x="8" y="4" width="36" height="24" rx="2" fill={ROLE.agent} /><path d="M3 35h46l-4-7H7z" fill="#fff" />
        <path d="M15 9h18v9H22l-5 4v-4h-2z" fill="#fff" />
    </> },
    person: { box: "0 0 30 30", body: <>
        <circle cx="15" cy="9" r="5.5" fill={ROLE.you} /><path d="M5 28c0-7 4.5-12 10-12s10 5 10 12z" fill={ROLE.you} />
    </> },
    colleague: { box: "0 0 30 30", body: <>
        <circle cx="15" cy="9" r="5.5" fill="#e3f3ea" /><path d="M5 28c0-7 4.5-12 10-12s10 5 10 12z" fill="#e3f3ea" />
    </> },
    notes: { box: "0 0 20 24", body: <>
        <rect x="2.5" y="2.5" width="15" height="19" rx="1.5" fill="#fff" />
        <path d="M6 7.5h1M9 7.5h5.5M6 11.5h1M9 11.5h5.5M6 15.5h1M9 15.5h4" />
    </> },
    drive: { box: "0 0 24 22", body: <>
        <path d="M2.5 5A1.5 1.5 0 0 1 4 3.5h4.5l2 2.5H20A1.5 1.5 0 0 1 21.5 7.5v10A1.5 1.5 0 0 1 20 19H4a1.5 1.5 0 0 1-1.5-1.5z" fill={ROLE.google} />
        <path d="M7 10h7M7 13.5h10" stroke="#9aa0a6" />
    </> },
    folder: { box: "0 0 24 22", body: <>
        <path d="M2.5 5A1.5 1.5 0 0 1 4 3.5h4.5l2 2.5H20A1.5 1.5 0 0 1 21.5 7.5v10A1.5 1.5 0 0 1 20 19H4a1.5 1.5 0 0 1-1.5-1.5z" fill="#d9d0ee" />
        <path d="M7 10h7M7 13.5h10" stroke="#5c6266" />
    </> },
    site: { box: "0 0 24 24", body: <>
        <path d="M5 6v12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6" fill={ROLE.site} /><ellipse cx="12" cy="6" rx="7" ry="2.5" fill={ROLE.site} />
        <path d="M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5" />
    </> },
    skills: { box: "0 0 24 22", body: <>
        <rect x="2.5" y="7" width="19" height="12" rx="1.5" fill={ROLE.agent} /><path d="M8.5 7V4.5h7V7M2.5 12h19M11 11v3h2v-3" />
    </> },
    chat: { box: "0 0 28 24", body: <>
        <path d="M3 3h22v13H12l-5 5v-5H3z" fill={ROLE.github} /><path d="M8 8h12M8 11.5h8" />
    </> },
} satisfies Record<string, Art>;

type NodeGeo = Omit<FlowNode, "id" | "title" | "sub">;
type ArrowGeo = Omit<FlowArrow, "id" | "label"> & { label?: Omit<NonNullable<FlowArrow["label"]>, "lines"> };
type StepGeo = { arrows: string[]; nodes?: string[] };

/** Skleja tekst z pliku danych z geometrią rysunku po wspólnych identyfikatorach. */
function flow<T extends FlowText>(text: T, geo: {
    nodes: Record<keyof T["nodes"], NodeGeo>; arrows: Record<keyof T["arrows"], ArrowGeo>; steps: Record<keyof T["steps"], StepGeo>;
}) {
    const ids = <K extends string>(o: Record<K, unknown>) => Object.keys(o) as K[];
    return {
        title: text.title,
        nodes: ids(geo.nodes).map(id => ({ id, ...text.nodes[id], ...geo.nodes[id] })) as FlowNode[],
        arrows: ids(geo.arrows).map(id => {
            const g = geo.arrows[id];
            return { id, ...g, label: g.label && { ...g.label, lines: text.arrows[id] } };
        }) as FlowArrow[],
        steps: ids(geo.steps).map(id => ({ id, ...text.steps[id], ...geo.steps[id] })) as FlowStep[],
    };
}

const W = 190, H = 130;
const uSiebie = flow(FLOWS.uSiebie, {
    nodes: {
        admin: { x: 10, y: 10, w: W, h: H, fill: "#f6e3e7", art: ART.admin },
        kanon: { x: 280, y: 10, w: W, h: H, fill: "#e5eef8", art: ART.canon },
        teczki: { x: 10, y: 200, w: W, h: H, fill: "#ece7f6", art: ART.team },
        ty: { x: 280, y: 200, w: W, h: H, fill: "#fdf0e2", art: ART.computer },
        dysk: { x: 10, y: 390, w: W, h: H, fill: "#fbf3dc", art: ART.drive },
        ps: { x: 280, y: 390, w: W, h: H, fill: ROLE.site, art: ART.site },
    },
    arrows: {
        read: { d: "M375 142L375 194", color: "#3d6a8f", label: { x: 387, y: 176 } },
        write: { d: "M276 265L204 265", color: "#6a5a92", both: true, label: { x: 240, y: 252, anchor: "middle" } },
        drive: { d: "M105 388L105 336", color: "#8a6d12", label: { x: 117, y: 368 } },
        ps: { d: "M375 388L375 336", color: "#3d7a5a", label: { x: 387, y: 368 } },
        promote: { d: "M105 198L105 146", color: "#b0603a", label: { x: 117, y: 178 } },
        publish: { d: "M202 75L274 75", color: "#b0603a" },
        report: { d: "M282 205L198 142", color: INK, dashed: true, label: { x: 252, y: 156 } },
    },
    steps: {
        calosc: { arrows: ["read", "write", "drive", "ps", "promote", "publish", "report"] },
        czytasz: { arrows: ["read"], nodes: ["kanon", "ty"] },
        piszesz: { arrows: ["write"], nodes: ["ty", "teczki"] },
        dysk: { arrows: ["drive", "ps"], nodes: ["dysk", "teczki", "ps", "ty"] },
        kanon: { arrows: ["promote", "publish"], nodes: ["teczki", "admin", "kanon"] },
        blad: { arrows: ["report"], nodes: ["ty", "admin"] },
    },
});

const skille = flow(FLOWS.skille, {
    nodes: {
        ty: { x: 10, y: 10, w: 180, h: H, fill: "#fdf0e2", art: ART.person },
        agent: { x: 290, y: 10, w: 180, h: H, fill: ROLE.agent, art: ART.agent },
        skille: { x: 10, y: 300, w: 180, h: H, fill: "#e3f3ea", art: ART.skills },
        wynik: { x: 290, y: 300, w: 180, h: H, fill: "#fffdf8", art: ART.notes },
    },
    arrows: {
        ask: { d: "M192 50L286 50", color: INK, label: { x: 240, y: 38, anchor: "middle" } },
        confirm: { d: "M286 105L194 105", color: "#b0603a", dashed: true, label: { x: 240, y: 132, anchor: "middle" } },
        recipe: { d: "M150 296L300 146", color: "#3d7a5a", label: { x: 244, y: 250 } },
        work: { d: "M380 144L380 296", color: "#3d6a8f", label: { x: 368, y: 210, anchor: "end" } },
        request: { d: "M100 144L100 296", color: "#6a5a92", dashed: true, label: { x: 112, y: 200 } },
    },
    steps: {
        calosc: { arrows: ["ask", "confirm", "recipe", "work", "request"] },
        prosba: { arrows: ["ask"], nodes: ["ty", "agent"] },
        dobor: { arrows: ["recipe"], nodes: ["skille", "agent"] },
        kroki: { arrows: ["work"], nodes: ["agent", "wynik"] },
        decyzja: { arrows: ["confirm"], nodes: ["agent", "ty"] },
        zgloszenie: { arrows: ["request"], nodes: ["ty", "skille"] },
    },
});

const dwieStrony = flow(FLOWS.dwieStrony, {
    nodes: {
        rozmowa: { x: 10, y: 10, w: 180, h: 140, fill: "#fdf0e2", art: ART.computer },
        app: { x: 290, y: 10, w: 180, h: 140, fill: ROLE.site, art: ART.site },
        program: { x: 140, y: 270, w: 190, h: 140, fill: ROLE.agent, art: ART.agent },
    },
    arrows: {
        zapis: { d: "M192 70L286 70", color: "#b0603a", label: { x: 240, y: 100, anchor: "middle" } },
        analiza: { d: "M380 154L300 266", color: "#3d6a8f", both: true, label: { x: 348, y: 226 } },
    },
    steps: {
        calosc: { arrows: ["zapis", "analiza"] },
        rozmowa: { arrows: ["zapis"], nodes: ["rozmowa", "app"] },
        aplikacja: { arrows: ["analiza"], nodes: ["app", "program"] },
    },
});

const zespol = flow(FLOWS.zespol, {
    nodes: {
        chat: { x: 160, y: 10, w: 160, h: 120, fill: ROLE.github, art: ART.chat },
        ty: { x: 10, y: 160, w: 140, h: 120, fill: "#fdf0e2", art: ART.person },
        kolega: { x: 330, y: 160, w: 140, h: 120, fill: "#e3f3ea", art: ART.colleague },
        teczka: { x: 160, y: 300, w: 160, h: 120, fill: "#ece7f6", art: ART.folder },
    },
    arrows: {
        tyChat: { d: "M100 156L172 120", color: "#b0603a", label: { x: 30, y: 148 } },
        chatKolega: { d: "M308 120L380 156", color: "#b0603a" },
        tyTeczka: { d: "M80 284L156 340", color: "#6a5a92", both: true },
        kolegaTeczka: { d: "M400 284L324 340", color: "#6a5a92", both: true },
    },
    steps: {
        calosc: { arrows: ["tyChat", "chatKolega", "tyTeczka", "kolegaTeczka"] },
        biore: { arrows: ["tyChat", "chatKolega"], nodes: ["ty", "chat", "kolega"] },
        praca: { arrows: ["tyTeczka"], nodes: ["ty", "teczka", "kolega"] },
        zwalniam: { arrows: ["tyChat", "chatKolega", "kolegaTeczka"], nodes: ["ty", "chat", "kolega", "teczka"] },
    },
});

/** Klikany element rysunku: przycisk dostępny z klawiatury; wybrany ma grubą ramkę i znacznik, nie tylko kolor. */
function HotNode({ x, y, w, h, fill, title, sub, selected, onSelect }: {
    x: number; y: number; w: number; h: number; fill: string; title: string; sub?: string; selected: boolean; onSelect: () => void;
}) {
    return (
        <g role="button" tabIndex={0} aria-pressed={selected} aria-label={sub ? `${title} (${sub})` : title} className="sb-hot"
            onClick={onSelect} onKeyDown={onActivate(onSelect)} style={{ cursor: "pointer" }}>
            {selected && <rect x={x - 5} y={y - 5} width={w + 10} height={h + 10} rx={18} fill="none" stroke={INK} strokeWidth={2} strokeDasharray="6 5" />}
            <rect className="sb-hot-box" x={x} y={y} width={w} height={h} rx={14} fill={fill} stroke={INK} strokeWidth={selected ? 4 : 2} />
            <text x={x + w / 2} y={sub ? y + h / 2 - 2 : y + h / 2 + 8} textAnchor="middle" fill={INK}
                style={{ fontFamily: HAND, fontSize: 26, fontWeight: 700 }}>{selected ? `▸ ${title}` : title}</text>
            {sub && <text x={x + w / 2} y={y + h / 2 + 22} textAnchor="middle" fill={INK} style={{ fontFamily: HAND, fontSize: 21 }}>{sub}</text>}
        </g>
    );
}

const MAP_GEO: Record<MapNodeId, { x: number; y: number; w: number; h: number; fill: string }> = {
    zespol: { x: 10, y: 10, w: 130, h: 64, fill: "#e3f3ea" },
    ty: { x: 175, y: 10, w: 130, h: 64, fill: ROLE.you },
    agent: { x: 130, y: 118, w: 220, h: 84, fill: ROLE.agent },
    kanon: { x: 25, y: 296, w: 190, h: 80, fill: "#e5eef8" },
    teczki: { x: 25, y: 390, w: 190, h: 80, fill: "#ece7f6" },
    skille: { x: 25, y: 484, w: 190, h: 80, fill: "#e3f3ea" },
    ps: { x: 265, y: 296, w: 190, h: 46, fill: ROLE.site },
    fidman: { x: 265, y: 350, w: 190, h: 46, fill: ROLE.site },
    fin: { x: 265, y: 404, w: 190, h: 46, fill: ROLE.site },
    dysk: { x: 250, y: 478, w: 220, h: 50, fill: ROLE.google },
    poczta: { x: 250, y: 540, w: 220, h: 50, fill: ROLE.github },
};

function EcosystemMap({ selected, onSelect, onOpen }: {
    selected: MapNodeId; onSelect: (id: MapNodeId) => void; onOpen: (screen: ScreenId) => void;
}) {
    const node = MAP.nodes[selected];
    const target = SCREENS.find(s => s.id === node.screen)!;
    const line = { fill: "none", stroke: INK, strokeWidth: 2, strokeLinecap: "round" as const, markerEnd: "url(#sb-mapa-grot)" };
    return (
        <div>
            <svg viewBox="0 0 480 600" aria-label={MAP.title} role="group"
                style={{ width: "100%", maxWidth: 560, height: "auto", display: "block", margin: "0 auto", color: INK }}>
                <defs>
                    <marker id="sb-mapa-grot" orient="auto" markerWidth={8} markerHeight={8} refX={5} refY={4}>
                        <path d="M0 0L8 4L0 8z" fill={INK} />
                    </marker>
                </defs>
                <g aria-hidden="true">
                    <rect x={10} y={250} width={220} height={340} rx={18} fill="#fffdf8" stroke={INK} strokeWidth={2} strokeDasharray="10 6" />
                    <text x={120} y={282} textAnchor="middle" fill={INK} style={{ fontFamily: HAND, fontSize: 26, fontWeight: 700 }}>{MAP.groups.sb}</text>
                    <rect x={250} y={250} width={220} height={210} rx={18} fill="#fffdf8" stroke={INK} strokeWidth={2} strokeDasharray="10 6" />
                    <text x={360} y={282} textAnchor="middle" fill={INK} style={{ fontFamily: HAND, fontSize: 26, fontWeight: 700 }}>{MAP.groups.systems}</text>
                    <path d="M240 76V112" {...line} />
                    <text x={250} y={100} fill={INK} style={{ fontFamily: HAND, fontSize: 20 }}>{MAP.links.talk}</text>
                    <path d="M307 42H460V244" {...line} strokeDasharray="7 6" />
                    <text x={318} y={68} fill={INK} style={{ fontFamily: HAND, fontSize: 20 }}>{MAP.links.self}</text>
                    <path d="M18 76V430H20" {...line} strokeDasharray="7 6" />
                    <path d="M180 204L130 246" {...line} />
                    <path d="M300 204L350 246" {...line} />
                    <path d="M240 204V503H244" {...line} />
                    <path d="M240 503V565H244" {...line} />
                </g>
                {(Object.keys(MAP_GEO) as MapNodeId[]).map(id => (
                    <HotNode key={id} {...MAP_GEO[id]} title={MAP.nodes[id].title} sub={(MAP.nodes[id] as { sub?: string }).sub}
                        selected={id === selected} onSelect={() => onSelect(id)} />
                ))}
            </svg>
            <div aria-live="polite" className="mt-3" style={box({ boxShadow: "3px 4px 0 rgba(47,52,55,.10)" })}>
                <div style={{ fontFamily: HAND, fontSize: 26, fontWeight: 700, lineHeight: 1.1 }}>{node.title}</div>
                <div style={{ fontSize: 17, lineHeight: 1.5 }}>{node.text}</div>
                <Button variant="dark" size="sm" className="mt-2" onClick={() => onOpen(node.screen)}>
                    {GUIDE.goTo} {SCREENS.indexOf(target) + 1}: {target.short} ›
                </Button>
            </div>
        </div>
    );
}

const DOOR_ART: Record<DoorId, Art> = {
    agent: ART.agent,
    aplikacja: ART.site,
    pomoc: { box: "0 0 24 24", body: <><circle cx="12" cy="12" r="10" fill={ROLE.google} /><path d="M9 9.5a3 3 0 1 1 4 2.8c-.7.3-1 .8-1 1.5v.7M12 17.5v.3" strokeWidth={2} /></> },
};

/** Trzy drzwi: kliknięte się otwierają i pokazują, co za nimi, a pod rysunkiem stoi karta przykładu. */
function Doors() {
    const [open, setOpen] = useState<DoorId>("agent");
    const ids = Object.keys(DOORS) as DoorId[];
    return (
        <div>
            <svg viewBox="0 0 480 330" role="group" aria-label="Trzy drzwi: agent, aplikacja, Pomoc"
                style={{ width: "100%", maxWidth: 600, height: "auto", display: "block", margin: "0 auto" }}>
                {ids.map((id, i) => {
                    const x = 20 + i * 160, isOpen = id === open, door = DOORS[id], art = DOOR_ART[id];
                    const select = () => setOpen(id);
                    return (
                        <g key={id} role="button" tabIndex={0} aria-pressed={isOpen} aria-label={`Drzwi: ${door.title}`} className="sb-hot"
                            onClick={select} onKeyDown={onActivate(select)} style={{ cursor: "pointer" }}>
                            <rect x={x - 6} y={4} width={132} height={322} fill="transparent" />
                            <rect x={x} y={12} width={120} height={38} rx={8} fill="#fffdf8" stroke={INK} strokeWidth={isOpen ? 3 : 2} />
                            <text x={x + 60} y={40} textAnchor="middle" fill={INK} style={{ fontFamily: HAND, fontSize: 26, fontWeight: 700 }}>{door.title}</text>
                            <rect className="sb-hot-box" x={x} y={60} width={120} height={190} fill={isOpen ? "#fffdf8" : "#ecebe6"} stroke={INK} strokeWidth={isOpen ? 4 : 2} />
                            {isOpen ? <>
                                <svg x={x + 30} y={110} width={80} height={80} viewBox={art.box} fill="none" stroke={INK} strokeWidth={1.4}
                                    strokeLinecap="round" strokeLinejoin="round">{art.body}</svg>
                                <path d={`M${x} 60L${x + 26} 74V236L${x} 250z`} fill="#c9a77c" stroke={INK} strokeWidth={2} />
                            </> : <>
                                <rect x={x + 8} y={68} width={104} height={174} fill="#c9a77c" stroke={INK} strokeWidth={2} />
                                <circle cx={x + 98} cy={160} r={5} fill={INK} />
                            </>}
                            {door.lines.map((l, j) => (
                                <text key={l} x={x + 60} y={276 + j * 22} textAnchor="middle" fill={INK}
                                    style={{ fontFamily: HAND, fontSize: 20, fontWeight: isOpen ? 700 : 400 }}>{l}</text>
                            ))}
                        </g>
                    );
                })}
            </svg>
            <div className="mt-3"><ExampleCard example={DOORS[open].card} /></div>
        </div>
    );
}

const SYNC_FILL: Record<SyncState, string> = { ok: "#4f9d69", pracuje: "#4f9d69", czeka: "#e2b93b", stop: "#c45a4a", brak: "#a3a7ab" };

/** Znak przy zegarze w pięciu stanach; każdy stan ma własny kształt albo ruch i słowo w dymku, nie tylko kolor. */
function SyncIcon() {
    const [state, setState] = useState<SyncState>("ok");
    const s = SYNC.states[state];
    const spin = state === "pracuje" && motionAllowed();
    return (
        <figure className="mb-0">
            <svg viewBox="0 0 360 170" role="img" aria-label={`${SYNC.title}: ${s.word}, ${s.look}`}
                style={{ width: "100%", maxWidth: 480, height: "auto", display: "block", margin: "0 auto" }}>
                <path d="M190 10h150a8 8 0 0 1 8 8v40a8 8 0 0 1-8 8h-100l-10 14-10-14h-30a8 8 0 0 1-8-8V18a8 8 0 0 1 8-8z"
                    fill="#fffdf8" stroke={INK} strokeWidth={2} />
                <text x={265} y={46} textAnchor="middle" fill={INK} style={{ fontFamily: HAND, fontSize: 26, fontWeight: 700 }}>{s.word}</text>
                <rect x={0} y={100} width={360} height={64} rx={6} fill="#ecebe6" stroke={INK} strokeWidth={2} />
                <text x={16} y={138} fill="#5c6266" style={{ fontFamily: HAND, fontSize: 20 }}>{SYNC.tray}</text>
                <path d="M182 128l8-8 8 8" fill="none" stroke={INK} strokeWidth={2} />
                <g transform="translate(230 132)">
                    <circle r={22} fill={SYNC_FILL[state]} stroke={INK} strokeWidth={2} />
                    <g fill="#fff" stroke={INK} strokeWidth={1.2}>
                        {[0, 120, 240].map(a => <path key={a} transform={`rotate(${a})`} d="M0 -2C4 -8 4 -15 0 -18C-3 -12 -3 -6 0 -2z" />)}
                        <circle r={3} />
                        {spin && <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="1.6s" repeatCount="indefinite" />}
                    </g>
                    {state === "czeka" && <circle cx={16} cy={-16} r={7} fill={INK} stroke="#fff" strokeWidth={2} />}
                    {state === "stop" && <path d="M-20 20L20 -20" stroke={INK} strokeWidth={4} strokeLinecap="round" />}
                    {state === "brak" && <path d="M-15 0H15" stroke={INK} strokeWidth={5} strokeLinecap="round" />}
                </g>
                <g transform="translate(305 132)" fill="none" stroke={INK} strokeWidth={2}>
                    <circle r={16} fill="#fff" /><path d="M0 -9V0L7 4" />
                </g>
            </svg>
            <div role="group" aria-label={`Stany: ${SYNC.title}`} className="d-flex flex-wrap mt-3" style={{ gap: 8 }}>
                {(Object.keys(SYNC.states) as SyncState[]).map(k => (
                    <button key={k} type="button" aria-pressed={k === state} onClick={() => setState(k)} style={{
                        minHeight: 44, padding: "4px 12px", fontSize: 15, color: INK, cursor: "pointer",
                        background: k === state ? ROLE.you : "#fffdf8", border: `${k === state ? 3 : 2}px solid ${INK}`, borderRadius: 12,
                        fontWeight: k === state ? 700 : 400,
                    }}>{SYNC.states[k].word}</button>
                ))}
            </div>
            <figcaption aria-live="polite" className="mt-3" style={box({ fontSize: 17, lineHeight: 1.5 })}>
                <strong>{s.look}:</strong> {s.text}
                <div className="text-muted mt-1" style={{ fontSize: 14 }}>{SYNC.hint}</div>
            </figcaption>
        </figure>
    );
}

function Examples() {
    const [filter, setFilter] = useState<keyof typeof EXAMPLE_FILTERS>("all");
    const shown = EXAMPLES.filter(e => filter === "all" || e.kind === filter);
    return (
        <div>
            <div role="group" aria-label="Pokaż karty" className="d-flex flex-wrap mb-3" style={{ gap: 8 }}>
                {(Object.keys(EXAMPLE_FILTERS) as (keyof typeof EXAMPLE_FILTERS)[]).map(k => (
                    <button key={k} type="button" aria-pressed={k === filter} onClick={() => setFilter(k)} style={{
                        minHeight: 44, padding: "4px 14px", fontFamily: HAND, fontSize: 21, color: INK, cursor: "pointer",
                        background: k === filter ? ROLE.you : "#fffdf8", border: `${k === filter ? 3 : 2}px solid ${INK}`, borderRadius: 12,
                        fontWeight: k === filter ? 700 : 400,
                    }}>{EXAMPLE_FILTERS[k]}</button>
                ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))", gap: 16 }}>
                {shown.map(e => <ExampleCard key={e.says} example={e} />)}
            </div>
        </div>
    );
}

function ScreenBody({ id, mapSel, onMapSelect, onOpen }: {
    id: ScreenId; mapSel: MapNodeId; onMapSelect: (id: MapNodeId) => void; onOpen: (s: ScreenId) => void;
}) {
    switch (id) {
        case "mapa": return <EcosystemMap selected={mapSel} onSelect={onMapSelect} onOpen={onOpen} />;
        case "u-siebie": return <FlowDiagram id="sb-u-siebie" box="0 0 480 530" {...uSiebie} />;
        case "gdzie": return <Doors />;
        case "przyklady": return <Examples />;
        case "skille": return <FlowDiagram id="sb-skille" box="0 0 480 440" {...skille} />;
        case "dwie-strony": return <FlowDiagram id="sb-dwie-strony" box="0 0 480 420" {...dwieStrony} />;
        case "zespol": return <>
            <FlowDiagram id="sb-zespol" box="0 0 480 425" {...zespol} />
            <SyncIcon />
        </>;
    }
}

/** Pierwszy element mapy prowadzący na dany ekran - mapa pokazuje, skąd wracasz. */
function mapNodeFor(screen: ScreenId, current: MapNodeId): MapNodeId {
    if (MAP.nodes[current].screen === screen) return current;
    return (Object.keys(MAP.nodes) as MapNodeId[]).find(id => MAP.nodes[id].screen === screen) ?? current;
}

export default function SbHowItWorks({ onShowPostInstall }: { onShowPostInstall: () => void }) {
    const [screen, setScreen] = useState<ScreenId>("mapa");
    const [mapSel, setMapSel] = useState<MapNodeId>("agent");
    const heading = useRef<HTMLHeadingElement>(null);
    const moved = useRef(false);
    const index = SCREENS.findIndex(s => s.id === screen);
    const current = SCREENS[index];

    // Po zmianie ekranu fokus idzie na tytuł - czytnik ekranu i klawiatura zaczynają od początku ekranu.
    useEffect(() => {
        if (moved.current) heading.current?.focus();
        moved.current = true;
    }, [screen]);

    function goTo(next: ScreenId) {
        if (next !== "mapa") setMapSel(sel => mapNodeFor(next, sel));
        setScreen(next);
    }

    return (
        <section aria-label="Jak to działa" style={{ color: INK }}>
            <SketchDefs />
            <style>{`.sb-hot:focus{outline:none}.sb-hot:focus-visible .sb-hot-box{stroke:#1a5fb4;stroke-width:5px}`}</style>
            <nav aria-label={GUIDE.navLabel} className="mb-3">
                <ol className="list-unstyled d-flex flex-wrap m-0" style={{ gap: 6 }}>
                    {SCREENS.map((s, i) => {
                        const active = s.id === screen;
                        return (
                            <li key={s.id}>
                                <button type="button" aria-current={active ? "step" : undefined} onClick={() => goTo(s.id)} style={{
                                    minHeight: 40, padding: "2px 12px", fontSize: 15, color: active ? "#fff" : INK, cursor: "pointer",
                                    background: active ? INK : "#fffdf8", border: `2px solid ${INK}`, borderRadius: 20, fontWeight: active ? 700 : 400,
                                }}>{i + 1}. {s.short}</button>
                            </li>
                        );
                    })}
                </ol>
            </nav>

            <div className="d-flex flex-wrap align-items-center justify-content-between mb-2" style={{ gap: 8 }}>
                <span className="text-muted" style={{ fontSize: 14 }}>{GUIDE.screenOf(index + 1, SCREENS.length)}</span>
                {screen !== "mapa" && <Button variant="outline-dark" size="sm" onClick={() => goTo("mapa")}>‹ {GUIDE.backToMap}</Button>}
            </div>
            <h5 ref={heading} tabIndex={-1} style={{ fontFamily: HAND, fontSize: 34, fontWeight: 700, lineHeight: 1.1, outline: "none" }}>
                {current.title}
            </h5>
            <p style={{ fontSize: 17 }}>{current.lead.join(" ")}</p>

            <ScreenBody id={screen} mapSel={mapSel} onMapSelect={setMapSel} onOpen={goTo} />

            <div className="mt-4 d-flex flex-wrap align-items-center justify-content-between"
                style={box({ gap: 8, borderRadius: "16px 16px 3px 16px", background: "#f3f8ff" })}>
                <div>
                    <div className="text-muted" style={{ fontSize: 14 }}>{GUIDE.copySentence}</div>
                    <div style={{ fontFamily: HAND, fontSize: 23, lineHeight: 1.15 }}>„{current.copy}”</div>
                </div>
                <CopyButton text={current.copy} />
            </div>
            {screen === "mapa" && <p className="mt-3 mb-0">
                {GUIDE.postInstall.before}{" "}
                <Button variant="link" className="p-0 align-baseline" onClick={onShowPostInstall}>{GUIDE.postInstall.link}</Button>.
            </p>}
            {index < SCREENS.length - 1 && <div className="mt-3 text-end">
                <Button variant="dark" onClick={() => goTo(SCREENS[index + 1].id)}>
                    {GUIDE.next}: {index + 2}. {SCREENS[index + 1].short} ›
                </Button>
            </div>}
        </section>
    );
}
