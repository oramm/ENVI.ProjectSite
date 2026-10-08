import React, { useState } from "react";
import { Button } from "react-bootstrap";
import { ComicPanel, HAND, INK, Panel, ROLE, Sketch, SketchDefs } from "./SbInstallerComic";

/**
 * Zakładka "Jak to działa" strony Second Brain: zasady, które się nie zmieniają (przepływ wiedzy,
 * źródła agenta, rola człowieka), narysowane jak komiks instalacji. Szczegóły celowo zostają
 * u agenta - opis kroków na stronie zestarzałby się po cichu (makieta "SB onboarding" z 2026-10-08).
 */

type Art = { box: string; body: React.ReactNode };
type FlowNode = { id: string; x: number; y: number; w: number; h: number; fill: string; title: string; art: Art };
type FlowArrow = {
    id: string; d: string; color: string; dashed?: boolean; both?: boolean;
    label?: { x: number; y: number; lines: string[]; anchor?: "start" | "middle" };
};
type FlowStep = { label: string; text: React.ReactNode; arrows: string[]; nodes?: string[] };
type Flow = { nodes: FlowNode[]; arrows: FlowArrow[]; steps: FlowStep[] };

/** Ruch wyłączamy, gdy system prosi o ograniczenie animacji. */
function motionAllowed() {
    return !(typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
}

/** Kartka, która jedzie po strzałce - widać, że coś płynie i w którą stronę. */
function Courier({ path, reverse }: { path: string; reverse?: boolean }) {
    return (
        <g>
            <rect x={-7} y={-9} width={14} height={18} rx={2} fill="#fff" stroke={INK} strokeWidth={1.5} />
            <path d="M-3.5 -3.5h7M-3.5 0h7M-3.5 3.5h4" stroke="#9aa0a6" strokeWidth={1.2} />
            <animateMotion dur="2.4s" repeatCount="indefinite" begin={reverse ? "1.2s" : "0s"}
                {...(reverse ? { keyPoints: "1;0", keyTimes: "0;1", calcMode: "linear" } : {})}>
                <mpath href={`#${path}`} />
            </animateMotion>
        </g>
    );
}

/**
 * Schemat krok po kroku: przyciski pod rysunkiem podświetlają jedną strzałkę naraz, a po niej
 * jadą kartki. Krok 0 pokazuje całość. Przyciski są sterowaniem dostępnym z klawiatury;
 * sam rysunek ma tylko etykietę.
 */
function FlowDiagram({ id, title, box, nodes, arrows, steps }: {
    id: string; title: string; box: string; nodes: FlowNode[]; arrows: FlowArrow[]; steps: FlowStep[];
}) {
    const [index, setIndex] = useState(0);
    const step = steps[index];
    const motion = motionAllowed();
    const lit = (arrow: string) => step.arrows.includes(arrow);
    const nodeLit = (node: string) => !step.nodes || step.nodes.includes(node);
    const [, , boxW, boxH] = box.split(" ").map(Number);

    return (
        <figure className="mb-5" style={{ color: INK }}>
            <h5 style={{ fontFamily: HAND, fontSize: 32, fontWeight: 700, lineHeight: 1.1 }}>{title}</h5>
            <svg viewBox={box} role="img" aria-label={title} aria-describedby={`${id}-opis`}
                style={{ width: "100%", height: "auto", display: "block" }}>
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
                                    style={{ fontFamily: HAND, fontSize: 22 }}>
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
                        <svg x={n.x + 10} y={n.y + 10} width={n.w - 20} height={n.h - 48} viewBox={n.art.box} fill="none"
                            stroke={INK} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" style={{ filter: "url(#sb-szkic)" }}>
                            {n.art.body}
                        </svg>
                        <text x={n.x + n.w / 2} y={n.y + n.h - 14} textAnchor="middle" fill={INK}
                            style={{ fontFamily: HAND, fontSize: n.title.length > 16 ? 22 : 26, fontWeight: 700 }}>{n.title}</text>
                    </g>
                ))}
            </svg>
            <div role="group" aria-label={`Kroki: ${title}`} className="d-flex flex-wrap mt-3" style={{ gap: 8 }}>
                {steps.map((s, i) => (
                    <button key={s.label} type="button" aria-pressed={i === index} onClick={() => setIndex(i)} style={{
                        minHeight: 44, padding: "4px 14px", fontFamily: HAND, fontSize: 21, color: INK, cursor: "pointer",
                        background: i === index ? ROLE.you : "#fffdf8", border: `2px solid ${INK}`, borderRadius: "14px 10px 15px 11px",
                    }}>{s.label}</button>
                ))}
            </div>
            <figcaption id={`${id}-opis`} aria-live="polite" className="mt-3" style={{
                padding: "12px 16px", background: "#fffdf8", border: `2px solid ${INK}`, borderRadius: "16px 16px 16px 3px",
                boxShadow: "3px 4px 0 rgba(47,52,55,.10)", fontSize: 16, lineHeight: 1.5,
            }}>
                {step.text}
            </figcaption>
            {index < steps.length - 1 && <div className="mt-2 text-end">
                <Button variant="dark" size="sm" onClick={() => setIndex(index + 1)}>Dalej: {steps[index + 1].label} ›</Button>
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
    notes: { box: "0 0 20 24", body: <>
        <rect x="2.5" y="2.5" width="15" height="19" rx="1.5" fill="#fff" />
        <path d="M6 7.5h1M9 7.5h5.5M6 11.5h1M9 11.5h5.5M6 15.5h1M9 15.5h4" />
    </> },
    drive: { box: "0 0 24 22", body: <>
        <path d="M2.5 5A1.5 1.5 0 0 1 4 3.5h4.5l2 2.5H20A1.5 1.5 0 0 1 21.5 7.5v10A1.5 1.5 0 0 1 20 19H4a1.5 1.5 0 0 1-1.5-1.5z" fill={ROLE.google} />
        <path d="M7 10h7M7 13.5h10" stroke="#9aa0a6" />
    </> },
    site: { box: "0 0 24 24", body: <>
        <path d="M5 6v12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6" fill={ROLE.site} /><ellipse cx="12" cy="6" rx="7" ry="2.5" fill={ROLE.site} />
        <path d="M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5" />
    </> },
    skills: { box: "0 0 24 22", body: <>
        <rect x="2.5" y="7" width="19" height="12" rx="1.5" fill={ROLE.agent} /><path d="M8.5 7V4.5h7V7M2.5 12h19M11 11v3h2v-3" />
    </> },
} satisfies Record<string, Art>;

const knowledge: Flow = {
    nodes: [
        { id: "admin", x: 10, y: 20, w: 180, h: 140, fill: "#f6e3e7", title: "Administrator", art: ART.admin },
        { id: "canon", x: 270, y: 10, w: 180, h: 160, fill: "#e5eef8", title: "Kanon firmy", art: ART.canon },
        { id: "team", x: 530, y: 20, w: 180, h: 140, fill: "#ece7f6", title: "Projekty zespołu", art: ART.team },
        { id: "computer", x: 250, y: 290, w: 220, h: 150, fill: "#fdf0e2", title: "Twój komputer", art: ART.computer },
    ],
    arrows: [
        { id: "publish", d: "M192 90L262 90", color: INK, label: { x: 230, y: 118, lines: ["co kilka", "godzin"], anchor: "middle" } },
        { id: "copy", d: "M360 172L360 280", color: "#3d6a8f", label: { x: 374, y: 214, lines: ["odświeża się", "sama co 4 h"] } },
        { id: "team", d: "M620 162L620 365L480 365", color: "#6a5a92", both: true, label: { x: 632, y: 236, lines: ["w obie", "strony,", "co godzinę"] } },
        { id: "proposal", d: "M248 365L100 365L100 170", color: "#b0603a", dashed: true, label: { x: 112, y: 232, lines: ["propozycja:", "„to warto", "zapamiętać”"] } },
    ],
    steps: [
        {
            label: "Całość", arrows: ["publish", "copy", "team", "proposal"],
            text: "Kanon, czyli sprawdzona wiedza firmy, leży w jednym miejscu. Każdy ma u siebie jego kopię, która odświeża się sama. Kanon zmienia tylko administrator, a nową wiedzę zgłaszasz mu jako propozycję przez agenta.",
        },
        {
            label: "Administrator publikuje", arrows: ["publish"], nodes: ["admin", "canon"],
            text: "Administrator decyduje, co trafia do wiedzy firmy. Kanon leży w prywatnym miejscu firmy na GitHubie - dlatego przy instalacji przyjmujesz zaproszenie z GitHuba. Bez niego instalator nie pobierze wiedzy firmy.",
        },
        {
            label: "Kopia u Ciebie", arrows: ["copy"], nodes: ["canon", "computer"],
            text: "Na Twoim komputerze jest kopia kanonu, w folderze ENVI-Kanon. Odświeża się sama co 4 godziny, nic nie klikasz. Twoja kopia jest tylko do czytania, bo kanon jest wspólny dla wszystkich.",
        },
        {
            label: "Projekty zespołu", arrows: ["team"], nodes: ["team", "computer"],
            text: "Ty i koledzy pracujecie na tych samych projektach i wymieniacie się wiedzą. Projekty wymieniają się zmianami w obie strony co godzinę.",
        },
        {
            label: "Twoja propozycja", arrows: ["proposal"], nodes: ["computer", "admin"],
            text: <>Wiesz coś, co przyda się całej firmie? Powiedz agentowi: <i>„To warto zapamiętać dla całej firmy: …”</i>.
                Agent przygotuje propozycję, a administrator zdecyduje, czy trafi do kanonu.</>,
        },
    ],
};

const sources: Flow = {
    nodes: [
        { id: "canon", x: 10, y: 20, w: 170, h: 120, fill: "#e5eef8", title: "Kanon firmy", art: ART.canon },
        { id: "notes", x: 275, y: 0, w: 170, h: 120, fill: "#fdf0e2", title: "Twoje notatki", art: ART.notes },
        { id: "drive", x: 540, y: 20, w: 170, h: 120, fill: "#fbf3dc", title: "Dysk Google", art: ART.drive },
        { id: "skills", x: 10, y: 300, w: 170, h: 120, fill: "#e3f3ea", title: "Skille", art: ART.skills },
        { id: "site", x: 540, y: 300, w: 170, h: 120, fill: "#ece7f6", title: "Witryna Projektów", art: ART.site },
        { id: "agent", x: 250, y: 170, w: 220, h: 150, fill: ROLE.agent, title: "Twój agent", art: ART.agent },
    ],
    arrows: [
        { id: "canon", d: "M182 100L246 186", color: "#3d6a8f" },
        { id: "notes", d: "M360 122L360 164", color: "#b0603a" },
        { id: "drive", d: "M538 100L474 186", color: "#8a6d12" },
        { id: "skills", d: "M182 352L246 304", color: "#3d7a5a" },
        { id: "site", d: "M538 352L474 304", color: "#6a5a92" },
    ],
    steps: [
        {
            label: "Całość", arrows: ["canon", "notes", "drive", "skills", "site"],
            text: "Agent (Claude albo Codex) sam z siebie nic o firmie nie wie. Korzysta z kanonu, z Twoich notatek, z dokumentów na Dysku Google i z danych w Witrynie Projektów. Powtarzalne zadania wykonuje skillami, czyli gotowymi umiejętnościami.",
        },
        {
            label: "Kanon", arrows: ["canon"], nodes: ["canon", "agent"],
            text: "Kanon to wiedza sprawdzona i wspólna dla wszystkich. Agent czyta kanon, który jest na bieżąco poprawiany, więc odpowiada według stanu na dziś, a nie według kopii sprzed miesiąca.",
        },
        {
            label: "Twoje notatki", arrows: ["notes"], nodes: ["notes", "agent"],
            text: "Własne notatki trzymasz u siebie, w tym samym folderze, a agent z nich także korzysta.",
        },
        {
            label: "Dysk Google", arrows: ["drive"], nodes: ["drive", "agent"],
            text: "Dokumenty firmy, takie jak umowy, pisma i skany, leżą na Dysku Google. Na Dysku agent ma dokładnie Twoje uprawnienia, ani trochę więcej.",
        },
        {
            label: "Witryna Projektów", arrows: ["site"], nodes: ["site", "agent"],
            text: "Dane o kontraktach, projektach i sprawach są w Witrynie Projektów. Agent wie, gdzie szukać dokumentów, bo każdy kontrakt w Witrynie wskazuje swój folder na Dysku.",
        },
        {
            label: "Skille", arrows: ["skills"], nodes: ["skills", "agent"],
            text: <>Skille przychodzą z Dysku firmowego przy instalacji i przy każdej aktualizacji - niczego nie instalujesz sam.
                Zapytaj agenta: <i>„Jakie masz skille i do czego służą?”</i></>,
        },
    ],
};

const docIcon = (extra: React.ReactNode) => <Sketch w={96} h={74} box="0 0 60 46">
    <path d="M10 4h22l7 7v31H10z" fill="#fff" /><path d="M32 4v7h7" /><path d="M15 17h18M15 22h18M15 27h12" stroke="#9aa0a6" />{extra}
</Sketch>;

const documentPanels: Panel[] = [
    { title: "Zlecasz", role: "you", icon: "desk", bubbles: [{ who: "you", text: "„Zaplanuj opracowanie [dokument] z tych materiałów.”" }] },
    {
        title: "Agent planuje", role: "agent", caption: "plan",
        icon: <Sketch w={80} h={62} box="0 0 52 40"><rect x="8" y="4" width="36" height="24" rx="2" fill={ROLE.agent} />
            <path d="M3 35h46l-4-7H7z" fill="#fff" /><path d="M15 9h18v9H22l-5 4v-4h-2z" fill="#fff" /></Sketch>,
        bubbles: [{ who: "agent", text: "„Jednego załącznika brakuje, jeden skan jest nieczytelny. Proponuję układ według wzoru i pracę w kilku podejściach.”" }],
    },
    {
        title: "Akceptujesz", role: "you", icon: "desk", tag: "Twoja decyzja",
        bubbles: [{ who: "you", text: "„Plan zatwierdzam, zaczynamy.”" }],
        note: "Bez Twojej akceptacji pisanie się nie zaczyna.",
    },
    {
        title: "Porcja po porcji", role: "agent",
        icon: docIcon(<><path d="M40 44l12-20 4 2.5-12 20-5 2z" fill={ROLE.google} /></>),
        bubbles: [{ who: "agent", text: "„Każde ustalenie ze wskazaniem źródła.”" }],
        note: "Po każdej porcji agent zapisuje, co zrobione i co dalej, a pytania do Ciebie ma gotowe z opcjami.",
    },
    {
        title: "Kontrola", role: "agent",
        icon: docIcon(<><circle cx="42" cy="27" r="9" fill="#e5eef8" fillOpacity={0.7} /><path d="M48.5 33.5l9 9" strokeWidth={3} />
            <path d="M38 27l3 3 5.5-6" stroke="#3d7a5a" strokeWidth={2} /></>),
        bubbles: [{ who: "agent", text: "„Czytam sam dokument, nie raport z pracy. Sprawdzam cytaty w źródłach.”" }],
    },
    {
        title: "Dla klienta", role: "agent",
        icon: docIcon(<><circle cx="46" cy="36" r="7" fill={ROLE.github} /><path d="M42.5 36l2.5 2.5 4.5-5" strokeWidth={1.8} /></>),
        bubbles: [{ who: "agent", text: "„Gotowe: styl firmy, bez śladów pracy agenta, plik Word.”" }],
    },
];

/** Polecenia do skopiowania: tylko czytające albo zgłaszające, bez zapisów w Witrynie. */
const PROMPTS: [string, string][] = [
    ["Opowiedz mi, jak działa nasz Second Brain i od czego mam zacząć w mojej pracy.", "Dobre pierwsze zdanie."],
    ["Co wiemy o kontrakcie [numer albo nazwa]? Streść ustalenia i otwarte sprawy.", "Agent zbierze to, co jest w kanonie, w projekcie i w Witrynie Projektów."],
    ["Przeanalizuj ten przetarg: ryzyka i elementy kosztotwórcze.", "Agent przejdzie przez dokumenty przetargu według firmowego sposobu wyceny."],
    ["To warto zapamiętać dla całej firmy: …", "Agent przygotuje propozycję dla administratora."],
    ["Coś mi nie działa: [co widzisz]. Sprawdź, o co chodzi.", "Agent sprawdzi, co się dzieje, i powie, co zrobić albo komu to zgłosić."],
];

function CopyPrompt({ text, hint }: { text: string; hint: string }) {
    const [label, setLabel] = useState("Kopiuj");
    async function copy() {
        try {
            await navigator.clipboard.writeText(text);
            setLabel("Skopiowano");
        } catch {
            setLabel("Zaznacz i skopiuj ręcznie");
        }
        setTimeout(() => setLabel("Kopiuj"), 2500);
    }
    return (
        <li style={{ background: "#fffdf8", border: `2px solid ${INK}`, borderRadius: "16px 16px 3px 16px", padding: "10px 14px" }}>
            <div style={{ fontFamily: HAND, fontSize: 22, lineHeight: 1.2 }}>„{text}”</div>
            <div className="d-flex align-items-center justify-content-between gap-2 mt-1">
                <span className="text-muted" style={{ fontSize: 14 }}>{hint}</span>
                <Button variant="outline-dark" size="sm" onClick={copy} style={{ minHeight: 36, whiteSpace: "nowrap" }}>
                    {label}
                </Button>
            </div>
        </li>
    );
}

const FAQ: [string, React.ReactNode, string?][] = [
    ["Czym kanon różni się od moich notatek?",
        "Kanon to wiedza sprawdzona i wspólna dla wszystkich, dlatego Twoja kopia jest tylko do czytania. Własne notatki trzymasz u siebie, w tym samym folderze, a agent z nich także korzysta.",
        "Gdzie mam trzymać swoje notatki i co jest w kanonie na temat [temat]?"],
    ["Skąd agent bierze dokumenty i dane?",
        "Dokumenty firmy leżą na Dysku Google, a dane o kontraktach, projektach i sprawach są w Witrynie Projektów. Każdy kontrakt w Witrynie wskazuje swój folder na Dysku.",
        "Gdzie są dokumenty kontraktu [numer]?"],
    ["Coś nie działa. Co robię?",
        "Najpierw opisz agentowi, co widzisz. Jeśli to nie pomoże, wyślij administratorowi plik z przebiegiem instalacji - gdzie go znaleźć, mówi zakładka Instalator.",
        "Sprawdź, czy mój Second Brain jest aktualny i działa."],
    ["Dlaczego nie ma tu pełnej instrukcji?",
        "Instrukcja opisująca szczegóły rozjeżdża się z rzeczywistością już po kilku tygodniach, a nikt nie zauważa, że jest nieaktualna. Ta strona pokazuje tylko to, co się nie zmienia: jak płynie wiedza i kto za co odpowiada. Wszystko inne zna agent, bo czyta kanon, który jest na bieżąco poprawiany."],
];

export default function SbHowItWorks({ onShowPostInstall }: { onShowPostInstall: () => void }) {
    return (
        <section aria-label="Jak to działa" style={{ color: INK }}>
            <SketchDefs />
            <p style={{ fontSize: 18 }}>
                Second Brain to wspólna pamięć firmy. To, czego nauczyliśmy się przy kontraktach, przetargach i projektach,
                jest zapisane tak, żeby agent (Claude albo Codex) mógł z tego korzystać razem z Tobą.
            </p>
            <div className="mb-4" style={{
                padding: "12px 16px", background: "#f3f8ff", border: `2px solid ${INK}`, borderRadius: "14px 20px 12px 18px / 18px 12px 20px 14px",
            }}>
                <div style={{ fontFamily: HAND, fontSize: 26, fontWeight: 700, lineHeight: 1.1 }}>Tu są zasady, nie instrukcja obsługi</div>
                Szczegóły, takie jak nazwy folderów, kolejne kroki czy ustawienia, zmieniają się co kilka tygodni. O nie pytasz
                agenta: on czyta aktualną wiedzę firmy, a nie kopię sprzed miesiąca. Klikaj przyciski pod rysunkami.
            </div>

            <FlowDiagram id="sb-wiedza" title="Jedna wiedza, wiele komputerów" box="0 0 720 450" {...knowledge} />
            <FlowDiagram id="sb-agent" title="Z czym pracuje Twój agent" box="0 0 720 430" {...sources} />

            <h5 style={{ fontFamily: HAND, fontSize: 32, fontWeight: 700 }}>Pierwsze kroki</h5>
            <ol className="mb-3">
                <li>Otwórz agenta w folderze <code>ENVI-Kanon</code> - jak, mówi{" "}
                    <Button variant="link" className="p-0 align-baseline" onClick={onShowPostInstall}>„Po instalacji - co dalej”</Button>.</li>
                <li>Wpisz albo wklej jedno z poleceń niżej.</li>
                <li>Potem po prostu mów, czego potrzebujesz, własnymi słowami.</li>
            </ol>
            <ul className="list-unstyled d-grid mb-5" style={{ gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
                {PROMPTS.map(([text, hint]) => <CopyPrompt key={text} text={text} hint={hint} />)}
            </ul>

            <h5 style={{ fontFamily: HAND, fontSize: 32, fontWeight: 700, lineHeight: 1.1 }}>Przykład: duży dokument, porcja po porcji</h5>
            <p className="text-muted">
                To tylko przykład. Ty zlecasz i zatwierdzasz, agent wykonuje i sprawdza swoją pracę. Inne procesy działają podobnie.
            </p>
            <ol className="list-unstyled mb-5" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 22 }}>
                {documentPanels.map((p, i) => <ComicPanel key={p.title} panel={p} index={i} />)}
            </ol>

            <h5 style={{ fontFamily: HAND, fontSize: 32, fontWeight: 700 }}>Dostęp do Google w skrócie</h5>
            <div className="mb-5" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
                <div><strong>Logujesz się raz.</strong> Przy instalacji logujesz się do Google i zgadzasz się, żeby agent działał w Twoim
                    imieniu. Potem dostęp odnawia się sam, nie logujesz się ponownie.</div>
                <div><strong>Agent widzi to, co Ty.</strong> Na Dysku agent ma dokładnie Twoje uprawnienia. Dostęp jest zapisany zaszyfrowany na
                    Twoim koncie Windows i nigdy nie trafia do notatek ani do rozmowy.</div>
            </div>

            <h5 style={{ fontFamily: HAND, fontSize: 32, fontWeight: 700 }}>Chcesz wiedzieć więcej?</h5>
            {FAQ.map(([q, a, ask]) => (
                <details key={q} className="mb-2" style={{ border: `2px solid ${INK}`, borderRadius: 12, background: "#fffdf8" }}>
                    <summary style={{ padding: "10px 14px", fontWeight: 600, cursor: "pointer" }}>{q}</summary>
                    <div style={{ padding: "0 14px 12px" }}>
                        {a}
                        {ask && <div className="text-muted mt-2">Zapytaj agenta: <i>„{ask}”</i></div>}
                    </div>
                </details>
            ))}
        </section>
    );
}
