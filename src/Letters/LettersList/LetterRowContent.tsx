/**
 * Wspólna zawartość wiersza rejestru pism (PS.APP.01, pack PIS, checkpoint PIS-2).
 *
 * Układ zatwierdzony przez właściciela na makiecie `makieta-rejestr-pism-v1.html`,
 * zakładka „Hybryda” z poprawką „kamień milowy raz, gdy wspólny”. Decyzje i ich powody:
 * `20_projects/Aplikacje/PS.APP.01/decisions/2026-07-31-pis-uklad-rejestru-pism.md`.
 *
 * Komponent mieszka w module pism, a moduł ofert go importuje (nie odwrotnie) — stąd dwa
 * konteksty: kontraktowy (`contract`) i ofertowy (`offer`).
 */
import {
    faCalendarPlus,
    faClipboardCheck,
    faClock,
    faEnvelope,
    faInbox,
    faPaperPlane,
    faRobot,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import {
    Case,
    EntityData,
    ExternalOffer,
    IncomingLetterContract,
    IncomingLetterOffer,
    MilestoneData,
    OtherContract,
    OurContract,
    OurLetterContract,
    OurLetterOffer,
    OurOffer,
} from "../../../Typings/bussinesTypes";
import MainSetup from "../../React/MainSetupReact";
import Tools from "../../React/Tools/Tools";
import ToolsDate from "../../React/Tools/ToolsDate";

export type LetterRowLetter = OurLetterContract | IncomingLetterContract | OurLetterOffer | IncomingLetterOffer;

/** Rejestr pism kontraktowych albo rejestr pism ofertowych. */
export type LetterRowContextKind = "contract" | "offer";

/** Paleta z zatwierdzonej makiety. Kolor agenta (`bot`) stoi POZA paletą statusów pisma —
 *  znacznik mówi o pochodzeniu wpisu, nie o stanie pisma. */
const C = {
    ink: "#16211c",
    inkSoft: "#3c4c44",
    muted: "#6b7c73",
    faint: "#94a49b",
    line: "#c2d1c9",
    accent: "#166243",
    chipOtherBg: "#edf1ee",
    warn: "#8f5406",
    bot: "#4b5a90",
};

const S = {
    ctxTop: {
        display: "flex",
        flexWrap: "wrap",
        alignItems: "baseline",
        gap: "7px",
        fontSize: ".8rem",
    } as React.CSSProperties,
    chipBase: {
        fontWeight: 700,
        borderRadius: "4px",
        padding: "1px 7px",
        fontSize: ".74rem",
        whiteSpace: "nowrap",
        fontVariantNumeric: "tabular-nums",
    } as React.CSSProperties,
    who: { color: C.inkSoft, fontWeight: 600 } as React.CSSProperties,
    ctype: { color: C.faint } as React.CSSProperties,
    proj: { color: C.muted, fontSize: ".76rem", fontVariantNumeric: "tabular-nums" } as React.CSSProperties,
    under: { color: C.muted, fontSize: ".76rem" } as React.CSSProperties,
    underStrong: { color: C.inkSoft, fontWeight: 600 } as React.CSSProperties,
    caseRow: {
        fontSize: ".8rem",
        color: C.inkSoft,
        display: "grid",
        gridTemplateColumns: "15px 1fr",
    } as React.CSSProperties,
    tree: { color: C.line, fontFamily: 'ui-monospace, "Cascadia Mono", Consolas, monospace' } as React.CSSProperties,
    caseNumber: { fontWeight: 700, fontVariantNumeric: "tabular-nums", color: C.ink } as React.CSSProperties,
    caseType: { color: C.muted } as React.CSSProperties,
    milestone: { color: C.faint } as React.CSSProperties,
    separator: { color: C.line } as React.CSSProperties,
    msHead: { fontSize: ".8rem", color: C.faint, paddingLeft: "15px" } as React.CSSProperties,
    number: { fontSize: "1.06rem", fontWeight: 700, fontVariantNumeric: "tabular-nums" } as React.CSSProperties,
    subject: { color: C.inkSoft } as React.CSSProperties,
    label: { color: C.faint } as React.CSSProperties,
    meta: {
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "4px 16px",
        fontSize: ".76rem",
        color: C.muted,
    } as React.CSSProperties,
    metaItem: { display: "inline-flex", alignItems: "center", gap: "5px" } as React.CSSProperties,
    metaKey: {
        textTransform: "uppercase",
        letterSpacing: ".08em",
        fontSize: ".66rem",
        color: C.faint,
        fontWeight: 700,
    } as React.CSSProperties,
    metaValue: { color: C.inkSoft, fontVariantNumeric: "tabular-nums" } as React.CSSProperties,
    metaValueOverdue: { color: C.warn, fontWeight: 600, fontVariantNumeric: "tabular-nums" } as React.CSSProperties,
    event: { fontSize: ".76rem", color: C.muted } as React.CSSProperties,
    eventType: { color: C.inkSoft, fontWeight: 600 } as React.CSSProperties,
    bot: { color: C.bot },
};

/** „2026-07-30” albo ISO -> „30-07-2026”. Nie rzuca na pustej ani niespodziewanej wartości —
 *  wiersz rejestru nie ma prawa wywalić listy przez złą datę. */
function formatDate(value?: string | null): string {
    if (!value) return "—";
    const parts = value.slice(0, 10).split("-");
    if (parts.length !== 3 || parts[0].length !== 4) return String(value);
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

function isOverdue(dueDate: string): boolean {
    const due = new Date(dueDate.slice(0, 10));
    if (Number.isNaN(due.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due.getTime() < today.getTime();
}

function isOurContract(contract: OurContract | OtherContract): contract is OurContract {
    return !!(contract as OurContract).ourId;
}

function entitiesLabel(entities?: EntityData[]): string {
    if (!entities?.length) return "";
    return entities.map((entity) => entity.shortName || entity.name || "").filter(Boolean).join(" · ");
}

/** Nazwa kamienia milowego. Kamienie unikalne w kontrakcie mają puste `name`, więc niosą je
 *  wyłącznie typy; śmieciowe nazwy jednoznakowe („.”, „-”) pomijamy. */
function milestoneLabel(milestone?: MilestoneData): string {
    if (!milestone) return "";
    const typeName = milestone._type?.name?.trim() || "";
    const ownName = milestone.name?.trim() || "";
    if (ownName.length > 1) return typeName ? `${typeName} - ${ownName}` : ownName;
    return typeName;
}

/** Sprawy jednego pisma potrafią wisieć na różnych kontraktach — grupujemy, żeby każdy
 *  kontrakt dostał swój nagłówek kontekstu zamiast mieszać sprawy pod jednym. */
type ContextGroup = {
    key: string;
    contract?: OurContract | OtherContract;
    offer?: OurOffer | ExternalOffer;
    cases: Case[];
};

function groupCasesByContext(cases: Case[] | undefined, kind: LetterRowContextKind): ContextGroup[] {
    const groups: ContextGroup[] = [];
    for (const singleCase of cases || []) {
        const parent = singleCase._parent;
        const contract = kind === "contract" ? parent?._contract : undefined;
        const offer = kind === "offer" ? parent?._offer : undefined;
        const key = `${contract?.id ?? ""}|${offer?.id ?? ""}`;
        const existing = groups.find((group) => group.key === key);
        if (existing) existing.cases.push(singleCase);
        else groups.push({ key, contract, offer, cases: [singleCase] });
    }
    return groups;
}

function ContractHeader({ contract, projectOurId }: { contract: OurContract | OtherContract; projectOurId?: string }) {
    const ours = isOurContract(contract);
    const chipLabel = ours ? contract.ourId : contract.number || contract._ourIdOrNumber_Alias || "—";
    const chipStyle: React.CSSProperties = ours
        ? { ...S.chipBase, color: "#fff", backgroundColor: C.accent }
        : { ...S.chipBase, color: C.ink, backgroundColor: C.chipOtherBg, border: `1px solid ${C.line}` };
    const contractors = entitiesLabel(contract._contractors);
    const relatedOurId = ours ? "" : (contract as OtherContract).ourIdRelated || "";

    return (
        <>
            <div style={S.ctxTop}>
                <span style={chipStyle} title={ours ? "Nasz kontrakt" : "Kontrakt wykonawcy"}>
                    {chipLabel}
                </span>
                {projectOurId && <span style={S.proj}>{projectOurId}</span>}
                <span style={S.who}>{ours ? "nasz kontrakt" : contractors}</span>
                {contract._type?.name && <span style={S.ctype}>{contract._type.name}</span>}
            </div>
            {relatedOurId && (
                <div style={S.under}>
                    nasz nadzór: <b style={S.underStrong}>{relatedOurId}</b>
                </div>
            )}
        </>
    );
}

function OfferHeader({ offer }: { offer: OurOffer | ExternalOffer }) {
    const chipStyle: React.CSSProperties = {
        ...S.chipBase,
        color: C.ink,
        backgroundColor: C.chipOtherBg,
        border: `1px solid ${C.line}`,
    };
    return (
        <div style={S.ctxTop}>
            <span style={chipStyle} title="Oferta">
                {offer.alias || "—"}
            </span>
            {offer.employerName && <span style={S.who}>{offer.employerName}</span>}
            {offer._type?.name && <span style={S.ctype}>{offer._type.name}</span>}
        </div>
    );
}

function CasesTree({ cases }: { cases: Case[] }) {
    const labels = cases.map((singleCase) => milestoneLabel(singleCase._parent));
    // Kamień milowy raz nad drzewkiem, gdy wspólny dla wszystkich spraw; przy każdej, gdy różny.
    const sharedMilestone = labels.every((label) => label === labels[0]) ? labels[0] : "";

    return (
        <>
            {sharedMilestone && <div style={S.msHead}>{sharedMilestone}</div>}
            {cases.map((singleCase, index) => (
                <div key={singleCase.id} style={S.caseRow}>
                    <span style={S.tree}>{index === cases.length - 1 ? "└" : "├"}</span>
                    <span>
                        {!sharedMilestone && labels[index] && (
                            <>
                                <span style={S.milestone}>{labels[index]}</span> <span style={S.separator}>›</span>{" "}
                            </>
                        )}
                        <span style={S.caseNumber}>{singleCase._displayNumber}</span>{" "}
                        {singleCase._type?.name && <span style={S.caseType}>{singleCase._type.name}</span>}
                        {singleCase.name?.trim() ? ` — ${singleCase.name.trim()}` : ""}
                    </span>
                </div>
            ))}
        </>
    );
}

/** Nagłówek kontekstu wiersza: gdzie to pismo wisi. */
export function LetterContext({ letter, context }: { letter: LetterRowLetter; context: LetterRowContextKind }) {
    const groups = groupCasesByContext(letter._cases, context);
    if (!groups.length) return null;
    const projectOurId = context === "contract" ? (letter as OurLetterContract)._project?.ourId : undefined;

    return (
        <div className="d-flex flex-column" style={{ gap: "3px" }}>
            {groups.map((group) => (
                <React.Fragment key={group.key}>
                    {group.contract && <ContractHeader contract={group.contract} projectOurId={projectOurId} />}
                    {group.offer && <OfferHeader offer={group.offer} />}
                    <CasesTree cases={group.cases} />
                </React.Fragment>
            ))}
        </div>
    );
}

/** Pasek meta: daty schodzą tu z kolumn. Etykieta drugiej daty zależy od kierunku pisma. */
export function LetterMetaStrip({ letter }: { letter: LetterRowLetter }) {
    const dueDate = letter.responseDueDate;
    return (
        <div style={S.meta}>
            <span style={S.metaItem}>
                <FontAwesomeIcon icon={faCalendarPlus} />
                <span style={S.metaKey}>utworzono</span>
                <span style={S.metaValue}>{formatDate(letter.creationDate)}</span>
            </span>
            <span style={S.metaItem}>
                <FontAwesomeIcon icon={letter.isOur ? faPaperPlane : faInbox} />
                <span style={S.metaKey}>{letter.isOur ? "wysłano" : "wpłynęło"}</span>
                <span style={S.metaValue}>{formatDate(letter.registrationDate)}</span>
            </span>
            {dueDate && (
                <span style={S.metaItem}>
                    <FontAwesomeIcon icon={faClock} />
                    <span style={S.metaKey}>odpowiedź do</span>
                    <span style={isOverdue(dueDate) ? S.metaValueOverdue : S.metaValue}>{formatDate(dueDate)}</span>
                </span>
            )}
        </div>
    );
}

function LetterLastEvent({ letter }: { letter: LetterRowLetter }) {
    const event = letter._lastEvent;
    if (!event) return null;
    // Znacznik agenta przy autorze pokazujemy tylko przy zdarzeniu utworzenia — po zatwierdzeniu
    // autorstwo przechodzi na człowieka i to jego nazwisko stoi w linii ostatniego zdarzenia.
    const showAgentMark = !!letter._isCreatedByAgent && event.eventType === "CREATED";
    return (
        <div style={S.event}>
            <span style={S.eventType}>{Tools.getLabelFromKey(event.eventType, MainSetup.LetterEventType)}</span>{" "}
            {ToolsDate.dateToDDmmmYYYYHHMM(event._lastUpdated!)} ·{" "}
            {showAgentMark && (
                <>
                    <span title="Wpis założony przez agenta" style={S.bot}>
                        <FontAwesomeIcon icon={faRobot} />
                    </span>{" "}
                </>
            )}
            {event._editor?.name} {event._editor?.surname}
        </div>
    );
}

/** Kolumna znaczników: kierunek pisma, dokumentacja zatwierdzona, znacznik agenta. */
export function LetterRowMarkers({ letter }: { letter: LetterRowLetter }) {
    return (
        <div className="d-flex flex-column align-items-center gap-2">
            <FontAwesomeIcon icon={letter.isOur ? faPaperPlane : faEnvelope} size="lg" />
            {letter.addedToApprovedDocumentation && (
                // `title` na FontAwesomeIcon nie trafia do DOM (idzie do <title> w SVG), więc
                // podpowiedź musi wisieć na opakowaniu — tak samo jak przy znaczniku agenta.
                <span title="Dokumentacja zatwierdzona" className="text-success">
                    <FontAwesomeIcon icon={faClipboardCheck} size="lg" />
                </span>
            )}
            {letter._isCreatedByAgent && (
                <span title="Zarejestrowane przez agenta" style={S.bot}>
                    <FontAwesomeIcon icon={faRobot} size="lg" />
                </span>
            )}
        </div>
    );
}

export type LetterRowContentProps = {
    letter: LetterRowLetter;
    context: LetterRowContextKind;
    /** Odznaka statusu; w rejestrze kontraktowym klikalna (edycja statusu), w ofertowym nie ma jej wcale. */
    renderStatus?: (letter: LetterRowLetter) => React.ReactNode;
};

export function LetterRowContent({ letter, context, renderStatus }: LetterRowContentProps) {
    return (
        <div className="d-flex flex-column" style={{ gap: "9px", wordBreak: "break-word" }}>
            <LetterContext letter={letter} context={context} />
            <div className="d-flex flex-wrap align-items-baseline" style={{ gap: "9px" }}>
                {letter.number !== undefined && letter.number !== null && letter.number !== "" && (
                    <span style={S.number}>{letter.number}</span>
                )}
                {renderStatus?.(letter)}
            </div>
            <div style={{ ...S.subject, whiteSpace: "pre-line" }}>
                <span style={S.label}>Dotyczy:</span> {letter.description}
                {letter.relatedLetterNumber && (
                    <>
                        <br />
                        <span style={S.label}>W odpowiedzi na pismo nr:</span> {letter.relatedLetterNumber}
                    </>
                )}
                {letter.responseIKNumber && (
                    <>
                        <br />
                        <span style={S.label}>Odpowiedź IK:</span> {letter.responseIKNumber}
                    </>
                )}
            </div>
            <LetterMetaStrip letter={letter} />
            <LetterLastEvent letter={letter} />
        </div>
    );
}
