import React from "react";

/**
 * Komiks instalacji Second Brain: zastępuje listy "Zanim uruchomisz" i "W trakcie instalacji"
 * (decyzja właściciela 2026-10-08, wariant A - instalacja opisana tylko na stronie instalatora).
 *
 * Kolejność okien 6-10 idzie za kolejnością kroków w `bootstrap.ps1` (programy i Dysk, logowanie
 * GitHub, zadanie w harmonogramie, zgoda Google). Nowe okno w instalatorze = nowy kadr tutaj.
 */

export const INK = "#2f3437";
export const HAND = "'Caveat', cursive";
/** Kolor każdej strony procesu; ten sam w kółku z numerem, dymku i rysunku. */
export const ROLE = {
    you: "#f9dfc6",
    site: "#e6e0f4",
    installer: "#d9e8f5",
    github: "#f3dde6",
    google: "#f8ebc4",
    system: "#ecebe6",
    agent: "#d7efe3", // tylko ikony Claude i Codex na pulpicie, bez pozycji w legendzie
};
export type Role = keyof typeof ROLE;

const RADII = [
    "14px 20px 12px 18px / 18px 12px 20px 14px",
    "18px 12px 20px 14px / 12px 20px 14px 18px",
    "12px 18px 14px 20px / 20px 14px 18px 12px",
    "20px 14px 18px 12px / 14px 18px 12px 20px",
];

/** Szkicowy rysunek: kreska drga przez filtr `#sb-szkic` zdefiniowany raz w komiksie. */
export function Sketch({ w, h, box, children }: { w: number; h: number; box: string; children: React.ReactNode }) {
    return (
        <svg width={w} height={h} viewBox={box} fill="none" stroke={INK} strokeWidth={1.5} strokeLinecap="round"
            strokeLinejoin="round" aria-hidden="true" style={{ filter: "url(#sb-szkic)" }}>
            {children}
        </svg>
    );
}

const zip = <Sketch w={40} h={48} box="0 0 22 26">
    <path d="M3 2h11l5 5v17H3z" fill={ROLE.installer} /><path d="M14 2v5h5" />
    <path d="M9 4h2M11 6h2M9 8h2M11 10h2M9 12h2" /><rect x="8.5" y="14.5" width="5" height="4.5" rx=".8" fill="#fff" />
</Sketch>;
const shield = (mark: string) => <Sketch w={44} h={44} box="0 0 24 24">
    <path d="M12 2.5l8 3v6c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10v-6z" fill={ROLE.system} /><path d={mark} />
</Sketch>;

const ICONS = {
    desk: <Sketch w={132} h={88} box="0 0 120 80">
        <circle cx="34" cy="24" r="9" fill={ROLE.you} /><path d="M17 61c0-11 7.6-19 17-19s17 8 17 19z" fill={ROLE.you} />
        <rect x="58" y="35" width="38" height="24" rx="2" fill={ROLE.site} /><path d="M52 63h50l-4-4H56z" fill="#fff" />
        <path d="M6 63h108M14 63v14M106 63v14" /><path d="M63 40h28M80 46h10M80 50h10" stroke="#5c6266" />
    </Sketch>,
    mail: <Sketch w={52} h={38} box="0 0 28 20">
        <rect x="2" y="2" width="24" height="16" rx="1.5" fill={ROLE.github} /><path d="M2.5 3l11.5 8.5L25.5 3" />
    </Sketch>,
    download: <><Sketch w={44} h={44} box="0 0 24 24"><path d="M12 3v12M7 10l5 5 5-5M4 20h16" /></Sketch>{zip}</>,
    unzip: <>{zip}<Sketch w={64} h={20} box="0 0 64 20"><path d="M3 11c14-4 30-5 54-1M50 4l8 6-8 6" strokeWidth={2} /></Sketch>
        <Sketch w={54} h={48} box="0 0 24 22">
            <path d="M2.5 5A1.5 1.5 0 0 1 4 3.5h4.5l2 2.5H20A1.5 1.5 0 0 1 21.5 7.5v10A1.5 1.5 0 0 1 20 19H4a1.5 1.5 0 0 1-1.5-1.5z" fill={ROLE.installer} />
        </Sketch></>,
    console: <Sketch w={56} h={42} box="0 0 30 22">
        <rect x="2" y="2" width="26" height="18" rx="1.5" fill={ROLE.installer} /><path d="M2 6h26" /><path d="M6 10l3 2.5L6 15M11 15h6" />
    </Sketch>,
    windows: shield("M8.5 12l2.5 2.5 4.5-5"),
    antivirus: shield("M12 7.5v6M12 16.5v.3"),
    cloud: <Sketch w={50} h={38} box="0 0 30 22"><path d="M8 19h15a5 5 0 0 0 .5-10A7 7 0 0 0 10 8a5.5 5.5 0 0 0-2 11z" fill={ROLE.google} /></Sketch>,
    lock: <Sketch w={40} h={40} box="0 0 24 24">
        <rect x="5" y="10.5" width="14" height="10" rx="1.5" fill={ROLE.github} /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" /><path d="M12 14.5v2.5" />
    </Sketch>,
    warning: <Sketch w={44} h={40} box="0 0 24 22"><path d="M12 2.5L22 20H2z" fill={ROLE.google} /><path d="M12 8.5v5.5M12 16.8v.3" /></Sketch>,
    desktop: <Sketch w={60} h={45} box="0 0 40 30">
        <rect x="2" y="2" width="36" height="22" rx="1.5" fill="#fff" /><path d="M14 28h12M20 24v4" />
        <rect x="6" y="6" width="6" height="6" rx="1" fill={ROLE.agent} /><rect x="6" y="14" width="6" height="6" rx="1" fill={ROLE.agent} />
        <rect x="15" y="6" width="6" height="6" rx="1" fill={ROLE.installer} />
    </Sketch>,
    tray: <Sketch w={96} h={54} box="0 0 60 34">
        <path d="M14 2h40a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H46l-3 5-2-5H14a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill={ROLE.installer} />
        <path d="M18 8h30M18 12h20" /><rect x="2" y="26" width="56" height="6" rx="1" fill={ROLE.system} /><path d="M46 29h9" />
    </Sketch>,
};

export type Bubble = { who: "you" | Role; text: string };
export type Panel = {
    title: string; role: Role; bubbles: Bubble[]; note?: React.ReactNode;
    icon: keyof typeof ICONS | React.ReactElement; caption?: string; tag?: string;
};

function bubbleStyle(b: Bubble): React.CSSProperties {
    const mine = b.who === "you";
    return {
        alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "92%", padding: "8px 12px",
        background: ROLE[b.who], border: `2px solid ${INK}`,
        borderRadius: mine ? "16px 16px 3px 16px" : "16px 16px 16px 3px",
        fontFamily: HAND, fontSize: 22, lineHeight: 1.15,
    };
}

export function ComicPanel({ panel, index }: { panel: Panel; index: number }) {
    const later = panel.tag === "później";
    return (
        <li style={{
            minHeight: 268, boxSizing: "border-box", padding: 14, display: "flex", flexDirection: "column", gap: 10,
            background: later ? "#f3f7fb" : "#fffdf8", border: `2px ${later ? "dashed" : "solid"} ${INK}`,
            borderRadius: RADII[index % RADII.length], boxShadow: "3px 4px 0 rgba(47,52,55,.10)",
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: HAND, fontSize: 25, fontWeight: 700, lineHeight: 1.1 }}>
                <span style={{
                    width: 30, height: 30, flex: "none", border: `2px solid ${INK}`, borderRadius: "50%",
                    background: ROLE[panel.role], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                }}>{index + 1}</span>
                {panel.title}
            </div>
            {panel.tag && <span style={{
                alignSelf: "flex-start", marginTop: -4, fontFamily: HAND, fontSize: 17, padding: "0 8px",
                border: `1.5px solid ${INK}`, borderRadius: "9px 7px 10px 8px", whiteSpace: "nowrap",
            }}>{panel.tag}</span>}
            {panel.bubbles.map(b => <div key={b.text} style={bubbleStyle(b)}>{b.text}</div>)}
            {panel.note && <div style={{ fontSize: 13, lineHeight: "18px", color: "#5c6266" }}>{panel.note}</div>}
            <div style={{
                marginTop: "auto", display: "flex", alignItems: "flex-end", gap: 8, fontFamily: HAND, fontSize: 19,
                justifyContent: panel.caption ? "flex-start" : "center",
            }}>
                {typeof panel.icon === "string" ? ICONS[panel.icon] : panel.icon}{panel.caption}
            </div>
        </li>
    );
}

/** Font odręczny i filtr `#sb-szkic`; każda sekcja z rysunkami renderuje go u siebie (zakładki montują się osobno). */
export function SketchDefs() {
    return <>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&display=swap" />
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
            <defs><filter id="sb-szkic"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={2} seed={7} />
                <feDisplacementMap in="SourceGraphic" scale={2.5} /></filter></defs>
        </svg>
    </>;
}

const legend: [Role, string][] = [
    ["you", "Ty"], ["site", "Witryna Projektów"], ["installer", "instalator"],
    ["github", "GitHub"], ["google", "Google"], ["system", "Windows i antywirus"],
];

/** Link zewnętrzny w nowej karcie - osoba ma wrócić na stronę instalatora, a nie jej szukać. */
function link(href: string, text: string) {
    return <a href={href} target="_blank" rel="noopener noreferrer">{text}</a>;
}

export default function SbInstallerComic({ loginAddress }: { loginAddress: React.ReactNode }) {
    const panels: Panel[] = [
        {
            title: "Wchodzisz do Witryny", role: "site", icon: "desk",
            bubbles: [{ who: "you", text: "„Menu pod moim nazwiskiem → Second Brain - instalator.”" }],
            note: "Nazwisko jest w prawym górnym rogu Witryny Projektów. Pozycji nie ma, dopóki przełożony nie da Ci dostępu.",
        },
        {
            title: "Przyjmujesz zaproszenie", role: "github", icon: "mail", caption: "mail od GitHuba",
            bubbles: [
                { who: "site", text: "„GitHub: zaproszenie czeka na przyjęcie.”" },
                { who: "you", text: "„W mailu: Join, potem Continue with Google.”" },
            ],
            note: <>Mail przyjdzie na {loginAddress}. W Google wybierz to samo konto. Nie widzisz maila?{" "}
                {link("https://github.com/orgs/envi-konsulting/invitation", "Przyjmij zaproszenie tutaj")} (działa, gdy zaproszenie
                już wysłano). Bez tego instalator nie pobierze wiedzy firmy.</>,
        },
        {
            title: "Pobierasz", role: "you", icon: "download", caption: "ENVI-SB-instalator.zip",
            bubbles: [{ who: "you", text: "„Pobierz instalator.”" }],
            note: "Przycisk jest wyżej. Plik ZIP ląduje w folderze Pobrane.",
        },
        {
            title: "Rozpakowujesz", role: "you", icon: "unzip",
            bubbles: [{ who: "you", text: "„Prawy przycisk na ZIP-ie → Wyodrębnij wszystkie.”" }],
            note: "Nie uruchamiaj niczego z wnętrza ZIP-a. Instalator to wykryje i poprosi, żeby najpierw rozpakować.",
        },
        {
            title: "Uruchamiasz", role: "installer", icon: "console", caption: "instalator",
            bubbles: [
                { who: "you", text: "„Dwuklik: ENVI-SB-instalator.cmd”" },
                { who: "installer", text: "Otwiera się czarne okno instalatora." },
            ],
            note: "Instalacja trwa około 15 minut.",
        },
        {
            title: "Pytanie Windows", role: "system", icon: "windows", caption: "Windows", tag: "okno po drodze",
            bubbles: [
                { who: "system", text: "„Czy zezwolić tej aplikacji na wprowadzanie zmian?”" },
                { who: "you", text: "„Tak.”" },
            ],
            note: "Kilka razy: przy GitHubie, Dysku Google, Node.js i innych programach, które stawia instalator.",
        },
        {
            title: "Dysk Google", role: "google", icon: "cloud", caption: "Google", tag: "okno po drodze",
            bubbles: [
                { who: "google", text: "Logowanie do Dysku. Google może ostrzec o Google Play." },
                { who: "you", text: "„Zaloguj się.”" },
            ],
            note: <>Kontem {loginAddress}: stąd instalator bierze narzędzia dla agenta. Sprawdzisz to,{" "}
                {link("https://drive.google.com/drive/shared-drives", "otwierając Dysk Google")}: po kliknięciu w swoje zdjęcie
                w prawym górnym rogu powinien być ten adres.</>,
        },
        {
            title: "GitHub: kod", role: "github", icon: "lock", caption: "GitHub", tag: "okno po drodze",
            bubbles: [
                { who: "installer", text: "„Naciśnij Enter. Kod jest w schowku, ważny 15 minut.”" },
                { who: "you", text: "„Ctrl+V → Continue with Google → Authorize.”" },
            ],
            note: <>GitHub może poprosić o kod z maila na {loginAddress} (<em>Confirm access</em> albo <em>Verify via email</em>).
                Gdy schowek zgubi kod, przepisz go z okna instalatora. Potem otworzy się ta strona: kliknij <em>To moje konto</em>,
                a w {link("https://github.com/settings/copilot/features", "ustawieniach Copilot")}, na dole w <em>Privacy</em>,
                przy <em>Allow GitHub to use my data for AI model training</em> wybierz <em>Disabled</em>. Treści firmy
                nie mają trafiać do zewnętrznych dostawców.</>,
        },
        {
            title: "Antywirus", role: "system", icon: "antivirus", caption: "antywirus", tag: "okno po drodze",
            bubbles: [
                { who: "system", text: "„Wykryto podejrzany proces.”" },
                { who: "you", text: "„Wznów” albo „Zezwól”." },
            ],
            note: "Pojawia się, gdy instalator ustawia w harmonogramie regularne pobieranie wiedzy firmy. Może się wcale nie pojawić.",
        },
        {
            title: "Zgoda Google", role: "google", icon: "warning", caption: "Google", tag: "okno po drodze",
            bubbles: [
                { who: "installer", text: "„Naciśnij Enter i wybierz konto Google.”" },
                { who: "google", text: "„Google nie zweryfikował tej aplikacji.”" },
                { who: "you", text: "„Zaawansowane → Przejdź do ENVI Second Brain → Zezwól.”" },
            ],
            note: <>Wybierz konto {loginAddress}. To nasza firmowa aplikacja, ekran jest jednorazowy.</>,
        },
        {
            title: "Gotowe", role: "installer", icon: "desktop", caption: "Twój pulpit",
            bubbles: [{ who: "installer", text: "„Podsumowanie. Naciśnij klawisz, otworzę stronę z dalszymi krokami.”" }],
            note: "Jest lista „Do zrobienia”? Zrób, co mówi, i uruchom instalator jeszcze raz. Dalsze kroki są niżej, w części „Po instalacji”.",
        },
        {
            title: "Nowa wersja", role: "installer", icon: "tray", tag: "później",
            bubbles: [
                { who: "installer", text: "„Second Brain: jest nowa wersja.”" },
                { who: "you", text: "Klikam dymek przy zegarze." },
            ],
            note: "Więcej w punkcie „Aktualizacje” niżej.",
        },
    ];

    return (
        <section aria-label="Instalacja krok po kroku" className="mb-4" style={{ color: INK }}>
            <SketchDefs />
            <p className="text-muted mb-2">
                Kadry 1-11 robisz raz. Kadr 12 wraca przy każdej nowej wersji. Okna z kadrów 6-10 nie są błędem
                i nie u każdego pojawią się wszystkie.
            </p>
            <div className="d-flex flex-wrap mb-3" style={{ gap: "6px 14px", fontFamily: HAND, fontSize: 20 }}>
                {legend.map(([role, label]) => (
                    <span key={role} className="d-flex align-items-center" style={{ gap: 6 }}>
                        <span style={{ width: 18, height: 18, border: `2px solid ${INK}`, borderRadius: "50%", background: ROLE[role] }} />
                        {label}
                    </span>
                ))}
            </div>
            <ol className="list-unstyled m-0" style={{
                display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 22,
            }}>
                {panels.map((p, i) => <ComicPanel key={p.title} panel={p} index={i} />)}
            </ol>
        </section>
    );
}
