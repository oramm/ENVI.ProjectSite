/**
 * Zawartość wiersza listy faktur sprzedażowych.
 *
 * Układ z makiety `tmp/makieta-lista-faktur-v1.html`, wariant A („drzewko stron”), wybrany przez
 * właściciela z poprawką: bez nazwy kontraktu — wystarczy górna linia kontekstu (oznaczenie,
 * projekt, alias, typ umowy).
 *
 * Wiersz mówi tym samym językiem co rejestr pism i rejestr kontraktów:
 *  - kontekst na górze: plakietka oznaczenia kontraktu, projekt, alias, typ (jak w pismach);
 *  - podmioty trzecie schodzą pod nabywcę drzewkiem `├ └` — tym samym znakiem co sprawy w pismach;
 *  - daty stoją w jednej kolumnie bocznej (jak terminy w kontraktach), więc się nie zawijają;
 *  - stopka z właścicielem i aktualizacją siedzi POD treścią w lewej kolumnie, nie pod całym
 *    wierszem: pod kolumną kwot robiła pusty pas przy krótkich fakturach.
 *
 * Numer faktury nie zawija się nigdy: korekty mają numery w rodzaju `FV-K_1/175/2026` i łamały się
 * w kolumnie na dwie linie.
 *
 * Uwaga do stopki: `LastUpdated` stempluje baza przy każdym zapisie, ale `EditorId` wpisuje front
 * przy zapisie z modalu. Zapisy idące inną drogą (kopia faktury, aktualizacje statusów KSeF po
 * stronie serwera) potrafią zostawić poprzednie nazwisko — dlatego pole podpisane jest „aktualizacja”,
 * a nie „zmienił”. Puste pola (658 faktur bez edytora w bazie z 16.06) wychodzą jako „—”.
 */
import React from "react";
import { Badge } from "react-bootstrap";
import { EntityData, Invoice, InvoiceThirdParty, PersonData } from "../../../Typings/bussinesTypes";
import Tools from "../../React/Tools/Tools";
import ToolsDate from "../../React/Tools/ToolsDate";
import { InvoiceStatusBadge } from "../../View/Resultsets/CommonComponents";
import { formatDate, isOverdue } from "../../Letters/LettersList/LetterRowContent";
import { thirdPartyRoleName } from "./thirdPartyRoles";

/** Paleta wspólna z rejestrem pism i kontraktów; `tpInk` to kolor ról podmiotów trzecich. */
const C = {
    ink: "#16211c",
    inkSoft: "#3c4c44",
    muted: "#6b7c73",
    faint: "#94a49b",
    line: "#c2d1c9",
    accent: "#166243",
    warn: "#8f5406",
    rowLine: "#e6ece9",
    tpInk: "#4b5a90",
};

const S = {
    top: { display: "grid", gridTemplateColumns: "1fr 232px", gap: "18px", alignItems: "start" } as React.CSSProperties,
    stack: { display: "flex", flexDirection: "column", gap: "7px", minWidth: 0, wordBreak: "break-word" } as React.CSSProperties,
    ctx: { display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "7px", fontSize: ".8rem" } as React.CSSProperties,
    chip: {
        fontWeight: 700,
        borderRadius: "4px",
        padding: "1px 7px",
        fontSize: ".74rem",
        whiteSpace: "nowrap",
        fontVariantNumeric: "tabular-nums",
        color: "#fff",
        backgroundColor: C.accent,
    } as React.CSSProperties,
    proj: { color: C.muted, fontSize: ".76rem", fontVariantNumeric: "tabular-nums" } as React.CSSProperties,
    alias: { color: C.inkSoft, fontWeight: 600 } as React.CSSProperties,
    ctype: { color: C.faint } as React.CSSProperties,
    numLine: { display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "9px" } as React.CSSProperties,
    number: {
        fontSize: "1.06rem",
        fontWeight: 700,
        fontVariantNumeric: "tabular-nums",
        whiteSpace: "nowrap",
    } as React.CSSProperties,
    /** Numer korekty jest długi (`FV-K_1/175/2026`) — mniejszy stopień pisma zamiast zawijania. */
    numberCorrection: { fontSize: ".95rem" } as React.CSSProperties,
    buyer: { fontSize: ".98rem", fontWeight: 600, color: C.ink } as React.CSSProperties,
    buyerAddr: { color: C.muted, fontSize: ".76rem" } as React.CSSProperties,
    desc: { color: C.inkSoft, fontSize: ".88rem" } as React.CSSProperties,
    label: { color: C.faint } as React.CSSProperties,
    tpHead: {
        fontSize: ".66rem",
        textTransform: "uppercase",
        letterSpacing: ".08em",
        color: C.faint,
        fontWeight: 700,
        marginBottom: "3px",
    } as React.CSSProperties,
    tpRow: {
        fontSize: ".8rem",
        color: C.inkSoft,
        display: "grid",
        gridTemplateColumns: "15px 1fr",
    } as React.CSSProperties,
    tree: { color: C.line, fontFamily: 'ui-monospace, "Cascadia Mono", Consolas, monospace' } as React.CSSProperties,
    tpRole: {
        color: C.tpInk,
        fontSize: ".72rem",
        textTransform: "uppercase",
        letterSpacing: ".05em",
        fontWeight: 700,
    } as React.CSSProperties,
    tpName: { color: C.ink } as React.CSSProperties,
    tpNip: { color: C.faint, fontSize: ".72rem", fontVariantNumeric: "tabular-nums" } as React.CSSProperties,
    sideBox: { borderLeft: `1px solid ${C.rowLine}`, paddingLeft: "14px" } as React.CSSProperties,
    sideHead: {
        fontSize: ".66rem",
        textTransform: "uppercase",
        letterSpacing: ".08em",
        color: C.faint,
        fontWeight: 700,
        marginBottom: "3px",
    } as React.CSSProperties,
    sideRow: { display: "flex", justifyContent: "space-between", gap: "10px", fontSize: ".78rem", padding: "1px 0" } as React.CSSProperties,
    sideKey: {
        color: C.faint,
        textTransform: "uppercase",
        letterSpacing: ".06em",
        fontSize: ".66rem",
        fontWeight: 700,
    } as React.CSSProperties,
    sideValue: { color: C.inkSoft, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" } as React.CSSProperties,
    sideValueOverdue: {
        color: C.warn,
        fontWeight: 600,
        fontVariantNumeric: "tabular-nums",
        whiteSpace: "nowrap",
    } as React.CSSProperties,
    amount: {
        marginTop: "8px",
        paddingTop: "7px",
        borderTop: `1px solid ${C.rowLine}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: "10px",
    } as React.CSSProperties,
    amountValue: { fontSize: "1.02rem", fontWeight: 700, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" } as React.CSSProperties,
    amountGross: { color: C.muted, fontSize: ".72rem", fontVariantNumeric: "tabular-nums", textAlign: "right" } as React.CSSProperties,
    foot: { fontSize: ".76rem", color: C.muted, marginTop: "8px" } as React.CSSProperties,
    footStrong: { color: C.inkSoft, fontWeight: 600 } as React.CSSProperties,
    dot: { color: C.line } as React.CSSProperties,
};

function personLabel(person?: PersonData): string {
    if (!person) return "";
    return [person.name, person.surname].filter(Boolean).join(" ").trim();
}

function entityAddressLine(entity?: EntityData): string {
    if (!entity) return "";
    return [entity.address, entity.taxNumber ? `NIP ${entity.taxNumber}` : ""].filter(Boolean).join(" · ");
}

/**
 * Podmioty trzecie: nowa lista `_thirdParties`, a gdy pusta — stare pojedyncze pole `_thirdParty`
 * (faktury sprzed migracji na tabelę InvoiceThirdParties nadal je mają).
 */
function thirdPartiesOf(invoice: Invoice): InvoiceThirdParty[] {
    if (invoice._thirdParties?.length) return invoice._thirdParties.filter((item) => !!item._entity);
    if (invoice.includeThirdParty && invoice._thirdParty) return [{ role: null, _entity: invoice._thirdParty }];
    return [];
}

function InvoiceContext({ invoice }: { invoice: Invoice }) {
    const contract = invoice._contract;
    if (!contract) return null;
    return (
        <div style={S.ctx}>
            {contract.ourId && <span style={S.chip}>{contract.ourId}</span>}
            {contract._project?.ourId && <span style={S.proj}>{contract._project.ourId}</span>}
            {contract.alias && <span style={S.alias}>{contract.alias}</span>}
            {contract._type?.name && <span style={S.ctype}>{contract._type.name}</span>}
        </div>
    );
}

function ThirdParties({ invoice }: { invoice: Invoice }) {
    const thirdParties = thirdPartiesOf(invoice);
    if (!thirdParties.length) return null;

    return (
        <div>
            <div style={S.tpHead}>Podmioty trzecie</div>
            {thirdParties.map((thirdParty, index) => {
                const roleName = thirdPartyRoleName(thirdParty.role);
                return (
                    <div key={`${thirdParty._entity?.id}-${index}`} style={S.tpRow}>
                        <span style={S.tree}>{index === thirdParties.length - 1 ? "└" : "├"}</span>
                        <span>
                            {roleName && <span style={S.tpRole}>{roleName} </span>}
                            <span style={S.tpName}>{thirdParty._entity?.name}</span>{" "}
                            {thirdParty._entity?.taxNumber && <span style={S.tpNip}>{thirdParty._entity.taxNumber}</span>}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

/** Kolumna boczna: daty jedna pod drugą (koniec zawijania w wąskich kolumnach) i kwoty. */
function InvoiceDates({ invoice }: { invoice: Invoice }) {
    const deadline = invoice.paymentDeadline;
    const deadlineOverdue = !!deadline && isOverdue(deadline);

    return (
        <div style={S.sideBox}>
            <div style={S.sideHead}>Terminy</div>
            <div style={S.sideRow}>
                <span style={S.sideKey}>sprzedaż</span>
                <span style={S.sideValue}>{formatDate(invoice.issueDate)}</span>
            </div>
            <div style={S.sideRow}>
                <span style={S.sideKey}>wystawiono</span>
                <span style={S.sideValue}>{formatDate(invoice.sentDate)}</span>
            </div>
            <div style={S.sideRow}>
                <span style={S.sideKey}>płatność do</span>
                <span style={deadlineOverdue ? S.sideValueOverdue : S.sideValue}>{formatDate(deadline)}</span>
            </div>
            {invoice._totalNetValue !== undefined && invoice._totalNetValue !== null && (
                <>
                    <div style={S.amount}>
                        <span style={S.sideKey}>netto, zł</span>
                        <span style={S.amountValue}>{Tools.formatNumber(invoice._totalNetValue)}</span>
                    </div>
                    {invoice._totalGrossValue !== undefined && invoice._totalGrossValue !== null && (
                        <div style={S.amountGross}>brutto: {Tools.formatNumber(invoice._totalGrossValue)}</div>
                    )}
                </>
            )}
        </div>
    );
}

function InvoiceFooter({ invoice }: { invoice: Invoice }) {
    const owner = personLabel(invoice._owner);
    const editor = personLabel(invoice._editor);
    const lastUpdated = invoice._lastUpdated ? ToolsDate.dateToDDmmmYYYYHHMM(invoice._lastUpdated) : "";
    if (!owner && !editor && !lastUpdated) return null;

    return (
        <div style={S.foot}>
            <span>
                właściciel: <b style={S.footStrong}>{owner || "—"}</b>
            </span>{" "}
            <span style={S.dot}>·</span>{" "}
            <span title="Osoba i czas ostatniego zapisu faktury">
                aktualizacja: <b style={S.footStrong}>{editor || "—"}</b>
                {lastUpdated ? `, ${lastUpdated}` : ""}
            </span>
        </div>
    );
}

export function InvoiceRowContent({ invoice }: { invoice: Invoice }) {
    const isCorrection = !!invoice.correctedInvoiceId;

    return (
        <div className="d-flex flex-column" style={{ gap: "9px", wordBreak: "break-word" }}>
            <div style={S.top}>
                <div style={S.stack}>
                    <InvoiceContext invoice={invoice} />
                    <div style={S.numLine}>
                        {invoice.number && (
                            <span style={isCorrection ? { ...S.number, ...S.numberCorrection } : S.number}>
                                {invoice.number}
                            </span>
                        )}
                        <InvoiceStatusBadge status={invoice.status} />
                        {isCorrection && (
                            <Badge bg="warning" text="dark" style={{ fontSize: "0.7em" }}>
                                Korekta
                            </Badge>
                        )}
                        {invoice._corrections && invoice._corrections.length > 0 && (
                            <Badge bg="info" text="light" style={{ fontSize: "0.7em" }}>
                                Ma korekty ({invoice._corrections.length})
                            </Badge>
                        )}
                    </div>
                    {invoice._entity && (
                        <div>
                            <div style={S.buyer}>{invoice._entity.name}</div>
                            {entityAddressLine(invoice._entity) && (
                                <div style={S.buyerAddr}>{entityAddressLine(invoice._entity)}</div>
                            )}
                        </div>
                    )}
                    <ThirdParties invoice={invoice} />
                    {invoice.description && (
                        <div style={S.desc}>
                            <span style={S.label}>Opis:</span> {invoice.description}
                        </div>
                    )}
                    {isCorrection && invoice.correctionReason && (
                        <div style={S.desc}>
                            <span style={S.label}>Powód korekty:</span> {invoice.correctionReason}
                        </div>
                    )}
                    <InvoiceFooter invoice={invoice} />
                </div>
                <InvoiceDates invoice={invoice} />
            </div>
        </div>
    );
}
