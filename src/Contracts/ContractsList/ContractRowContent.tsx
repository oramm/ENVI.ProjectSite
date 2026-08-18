/**
 * Wspólna zawartość wiersza rejestru kontraktów.
 *
 * Układ zatwierdzony przez właściciela na makiecie `tmp/makieta-lista-kontraktow-v3.html`,
 * zakładka „Wariant A — jak w Zadaniach". Lista straciła wszystkie kolumny poza jedną
 * (Projekt, Oznaczenie, Rozpoczęcie, Zakończenie, Gwarancja oraz kolumnę znaczników) na rzecz
 * jednego bloku typograficznego.
 *
 * Umowa ENVI i umowa wykonawcy różnią się WYŁĄCZNIE kształtem wiersza — bez kolorowych
 * plakietek roli i bez ikon. Wzorzec przeniesiony z widoku zadań (TasksGlobal.tsx,
 * makeOurContractTitleHeader / makeOtherContractTitleHeader), żeby oba widoki mówiły tym samym
 * językiem:
 *   - umowa ENVI prowadzi identyfikatorem `OurId | alias`, a nazwa kontraktu jest tytułem;
 *   - umowa wykonawcy odwraca hierarchię: prowadzi „hero" `alias · wykonawca` (kotwica
 *     pamięciowa), pod nim identyfikator `typ · numer ➔ NASZA.UMOWA`, a nazwa kontraktu
 *     schodzi na drugi plan.
 * Strzałka do naszej umowy jest tu jedynym nośnikiem relacji nadzoru — dokładnie jak
 * w zadaniach. Brak powiązania NIE jest chowany: wychodzi jako ostrzegawczy tekst w miejscu
 * oznaczenia.
 *
 * Pozostałe decyzje właściciela wbudowane w ten plik:
 *  - umowa ENVI pokazuje Zamawiającego, koordynatora i administratora;
 *  - umowa wykonawcy pokazuje wykonawcę, Zamawiającego i Inżyniera;
 *  - zakresy przy obu rodzajach, na dolnym pasku;
 *  - plakietka integracji z FIDmanem na tym samym pasku, wyrównana do prawej;
 *  - wartość kontraktu NIE wchodzi do wiersza (lista bywa oglądana przy ludziach);
 *  - terminy nieobowiązkowe pojawiają się tylko wtedy, gdy są wpisane.
 */
import React from "react";
import { Badge } from "react-bootstrap";
import { EntityData, OtherContract, OurContract, PersonData } from "../../../Typings/bussinesTypes";
import MainSetup from "../../React/MainSetupReact";
import {
    ContractStatusBadge,
    ContractTypeBadge,
    FidmanSyncBadge,
} from "../../View/Resultsets/CommonComponents";
import { formatDate, isOverdue } from "../../Letters/LettersList/LetterRowContent";

export type ContractRowContract = OurContract | OtherContract;

/** Paleta z zatwierdzonej makiety — ta sama co w rejestrze pism (LetterRowContent.tsx). */
const C = {
    ink: "#16211c",
    inkSoft: "#3c4c44",
    muted: "#6b7c73",
    faint: "#94a49b",
    accent: "#166243",
    warn: "#8f5406",
    demoted: "#495057",
    heroSep: "#c7ccd1",
    rangeBg: "#f1f4f2",
    rangeLine: "#e6ece9",
};

const S = {
    line1: {
        display: "flex",
        flexWrap: "wrap",
        alignItems: "baseline",
        gap: "8px",
        fontSize: ".8rem",
    } as React.CSSProperties,
    /** Identyfikator umowy — drobny, wersalikowy, na drugim planie wobec „hero". */
    cid: {
        fontSize: ".72rem",
        fontWeight: 700,
        color: C.muted,
        textTransform: "uppercase",
        letterSpacing: ".05em",
        fontVariantNumeric: "tabular-nums",
    } as React.CSSProperties,
    arrow: { color: C.accent, fontWeight: 700 } as React.CSSProperties,
    /** Oznaczenie naszej umowy w osobnym elemencie — nie tylko dla stylu: jako samodzielny
     *  węzeł daje się zaznaczyć i skopiować bez reszty identyfikatora. */
    related: { color: C.inkSoft } as React.CSSProperties,
    noRelation: { color: C.warn } as React.CSSProperties,
    hero: { fontSize: "1.12rem", fontWeight: 700, color: C.ink, lineHeight: 1.2 } as React.CSSProperties,
    heroSep: { color: C.heroSep, fontWeight: 400 } as React.CSSProperties,
    nameDemoted: { fontSize: ".92rem", fontWeight: 400, color: C.demoted } as React.CSSProperties,
    proj: {
        color: C.muted,
        fontSize: ".76rem",
        fontVariantNumeric: "tabular-nums",
        marginLeft: "auto",
    } as React.CSSProperties,
    under: { color: C.muted, fontSize: ".76rem" } as React.CSSProperties,
    underStrong: { color: C.inkSoft, fontWeight: 600 } as React.CSSProperties,
    bottom: {
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "8px",
        marginTop: "10px",
    } as React.CSSProperties,
    ranges: { display: "flex", flexWrap: "wrap", gap: "5px" } as React.CSSProperties,
    range: {
        display: "inline-block",
        borderRadius: "999px",
        padding: "1px 9px",
        fontSize: ".72rem",
        backgroundColor: C.rangeBg,
        color: C.inkSoft,
        border: `1px solid ${C.rangeLine}`,
    } as React.CSSProperties,
    sideBox: { borderLeft: `1px solid ${C.rangeLine}`, paddingLeft: "14px" } as React.CSSProperties,
    sideHead: {
        fontSize: ".66rem",
        textTransform: "uppercase",
        letterSpacing: ".08em",
        color: C.faint,
        fontWeight: 700,
        marginBottom: "3px",
    } as React.CSSProperties,
    sideRow: {
        display: "flex",
        justifyContent: "space-between",
        gap: "10px",
        fontSize: ".78rem",
        padding: "1px 0",
    } as React.CSSProperties,
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
};

function isOurContract(contract: ContractRowContract): contract is OurContract {
    return !!(contract as OurContract).ourId;
}

/** Skrócone nazwy podmiotów, oddzielone kropką — tak samo jak w rejestrze pism. */
function entitiesLabel(entities?: EntityData[]): string {
    if (!entities?.length) return "";
    return entities
        .map((entity) => entity.shortName || entity.name || "")
        .filter(Boolean)
        .join(" · ");
}

function personLabel(person?: PersonData): string {
    if (!person) return "";
    return [person.name, person.surname].filter(Boolean).join(" ").trim();
}

/**
 * Umowa jest po terminie, gdy data zakończenia minęła, a status nie mówi, że to już zamknięta
 * sprawa. Zakończona i archiwalna umowa Z DEFINICJI ma datę w przeszłości — podświetlanie jej
 * byłoby ostrzeżeniem przed stanem normalnym, czyli szumem.
 */
function isEndDateOverdue(contract: ContractRowContract): boolean {
    if (!contract.endDate) return false;
    const closed: string[] = [MainSetup.ContractStatuses.FINISHED, MainSetup.ContractStatuses.ARCHIVAL];
    if (closed.includes(contract.status)) return false;
    return isOverdue(contract.endDate);
}

/** Wspólny ogon obu wariantów wiersza: typ, status i projekt. */
function LineTail({ contract }: { contract: ContractRowContract }) {
    return (
        <>
            <ContractTypeBadge type={contract._type} settlementMethod={contract.settlementMethod} />
            <ContractStatusBadge status={contract.status} />
            {contract._project?.ourId && <span style={S.proj}>{contract._project.ourId}</span>}
        </>
    );
}

function OurContractBlock({ contract }: { contract: OurContract }) {
    const identifier = [contract.ourId, contract.alias].filter(Boolean).join(" | ");
    const employers = entitiesLabel(contract._employers);
    const coordinator = personLabel(contract._manager);
    const administrator = personLabel(contract._admin);

    return (
        <>
            <div style={S.line1}>
                <span style={S.cid}>{identifier}</span>
                <LineTail contract={contract} />
            </div>
            <div style={{ ...S.hero, whiteSpace: "pre-line" }}>{contract.name}</div>
            {(employers || coordinator || administrator) && (
                <div style={S.under}>
                    {employers && (
                        <>
                            <b style={S.underStrong}>{employers}</b> — Zamawiający
                        </>
                    )}
                    {(coordinator || administrator) && (
                        <>
                            {employers && <br />}
                            {coordinator && (
                                <>
                                    koordynator: <b style={S.underStrong}>{coordinator}</b>
                                </>
                            )}
                            {coordinator && administrator && " · "}
                            {administrator && (
                                <>
                                    administrator: <b style={S.underStrong}>{administrator}</b>
                                </>
                            )}
                        </>
                    )}
                </div>
            )}
        </>
    );
}

function OtherContractBlock({ contract }: { contract: OtherContract }) {
    const contractors = entitiesLabel(contract._contractors);
    const employers = entitiesLabel(contract._employers);
    const engineers = entitiesLabel(contract._engineers);
    const relatedOurId = contract.ourIdRelated || contract._ourContract?.ourId || "";
    // Kotwica pamięciowa: alias i wykonawca. Gdy nie ma ani jednego, „hero" przejmuje nazwa
    // kontraktu — i wtedy pomijamy jej powtórzenie niżej, żeby nie stała w wierszu dwa razy
    // (ta sama reguła co w widoku zadań, TasksGlobal.makeOtherContractTitleHeader).
    const heroParts = [contract.alias, contractors].filter(Boolean) as string[];
    const hasAnchor = heroParts.length > 0;

    return (
        <>
            <div style={S.line1}>
                <span style={S.hero}>
                    {hasAnchor
                        ? heroParts.map((part, index) => (
                              <React.Fragment key={index}>
                                  {index > 0 && <span style={S.heroSep}> · </span>}
                                  {part}
                              </React.Fragment>
                          ))
                        : contract.name}
                </span>
                <LineTail contract={contract} />
            </div>
            <div style={S.cid}>
                {[contract._type?.name, contract.number].filter(Boolean).join(" · ")}{" "}
                <span style={S.arrow}>➔</span>{" "}
                {relatedOurId ? (
                    <span style={S.related}>{relatedOurId}</span>
                ) : (
                    <span style={S.noRelation}>brak powiązania</span>
                )}
            </div>
            {hasAnchor && <div style={{ ...S.nameDemoted, whiteSpace: "pre-line" }}>{contract.name}</div>}
            {(employers || engineers) && (
                <div style={S.under}>
                    {employers && (
                        <>
                            Zamawiający: <b style={S.underStrong}>{employers}</b>
                        </>
                    )}
                    {employers && engineers && " · "}
                    {engineers && (
                        <>
                            Inżynier: <b style={S.underStrong}>{engineers}</b>
                        </>
                    )}
                </div>
            )}
        </>
    );
}

/**
 * Kolumna terminów. Rozpoczęcie i zakończenie stoją zawsze (są obowiązkowe), pozostałe
 * wyłącznie gdy wpisane. Kolejność chronologiczna: najpierw koniec robót, potem zgłaszanie
 * wad, na końcu okresy odpowiedzialności za wady.
 */
function ContractDates({ contract }: { contract: ContractRowContract }) {
    const optional: [string, string | null | undefined][] = [
        ["zgł. wad", contract.defectsNotificationEndDate],
        ["gwarancja", contract.guaranteeEndDate],
        ["rękojmia", contract.warrantyEndDate],
    ];
    const endOverdue = isEndDateOverdue(contract);

    return (
        <div style={S.sideBox}>
            <div style={S.sideHead}>Terminy</div>
            <div style={S.sideRow}>
                <span style={S.sideKey}>rozpoczęcie</span>
                <span style={S.sideValue}>{formatDate(contract.startDate)}</span>
            </div>
            <div style={S.sideRow}>
                <span style={S.sideKey}>zakończenie</span>
                <span
                    style={endOverdue ? S.sideValueOverdue : S.sideValue}
                    title={endOverdue ? "Termin zakończenia minął, a umowa nie jest zamknięta" : undefined}
                >
                    {formatDate(contract.endDate)}
                </span>
            </div>
            {optional
                .filter(([, value]) => !!value)
                .map(([label, value]) => (
                    <div key={label} style={S.sideRow}>
                        <span style={S.sideKey}>{label}</span>
                        <span style={S.sideValue}>{formatDate(value)}</span>
                    </div>
                ))}
        </div>
    );
}

/**
 * Dolny pasek: zakresy z lewej, plakietka integracji z prawej.
 *
 * Trzy stany `_isFidmanIntegrated` znaczą co innego i tylko jeden rysuje plakietkę:
 *   `undefined` — typ umowy nie podlega synchronizacji, plakietki nie ma wcale;
 *   `false`     — mógłby być zintegrowany, ale nie jest; też bez plakietki, bo to stan normalny
 *                 dla świeżej umowy, a nie wyróżnik (od szukania takich jest filtr w panelu);
 *   `true`      — plakietka.
 *
 * Plakietka to ten sam `FidmanSyncBadge`, co w karcie kontraktu (ContractMainHeader) — jeden
 * wygląd stanu integracji w całej aplikacji. Różni się ŹRÓDŁO odczytu i dlatego mapowanie jest
 * jawne: karta czyta stan kolejki wysyłkowej i przekazuje wszystkie pięć stanów, lista zna
 * wyłącznie trwały link `Contracts.FidmanContractId` i umie rozstrzygnąć tylko „jest w FIDmanie"
 * (`SENT`) albo „nie ma czego pokazać" (`NONE`). Lista NIE pokaże więc „do dopchnięcia" ani
 * „brakujące dane” — to widać w karcie kontraktu, gdzie jest też przycisk ponowienia.
 */
function ContractRowBottomBar({ contract }: { contract: ContractRowContract }) {
    const names = contract._contractRangesNames ?? [];
    const isIntegrated = contract._isFidmanIntegrated === true;
    const isDocumentMissing = contract._isContractDocumentMissing === true;
    if (!names.length && !isIntegrated && !isDocumentMissing) return null;

    return (
        <div style={S.bottom}>
            <div style={S.ranges}>
                {names.map((name, index) => (
                    <span key={index} style={S.range}>
                        {name}
                    </span>
                ))}
            </div>
            {/* ponytail: bez opakowania i bez `margin-left:auto` — pusty div zakresów zostaje
                pierwszym dzieckiem, więc `space-between` sam dosuwa plakietki do prawej. */}
            <span className="d-flex flex-wrap align-items-center gap-2">
                <ContractDocumentBadge contract={contract} />
                {isIntegrated && <FidmanSyncBadge status="SENT" />}
            </span>
        </div>
    );
}

/**
 * Plakietka braku umowy na Dysku — wynik kontroli z zadania cyklicznego
 * (PS-nodeJS: contractDocuments/ContractDocumentsCheck).
 *
 * Rysowana WYŁĄCZNIE przy `true`. `false` znaczy „sprawdzono, umowa jest" — nie ma czego
 * pokazywać. `undefined` znaczy „NIE sprawdzano", bo umowa nie ma sprawy „umowa" (starsza
 * struktura folderów, ok. 166 z 785) albo kontrola tam jeszcze nie dotarła; oznaczanie takiej
 * umowy byłoby zarzutem bez pokrycia.
 *
 * Jest odnośnikiem otwierającym dokładnie ten folder, w którym pliku brakuje — komunikat
 * o braku ma być drogą do jego usunięcia, a nie samym zarzutem. Gdy backend nie oddał adresu
 * folderu, zostaje sama plakietka bez odnośnika.
 *
 * Kolor: `danger`, a nie `warning`. Obok stoi zielona plakietka FIDmana o odwrotnej wymowie
 * („wszystko w porządku") — dwie plakietki w jednej linii muszą się różnić na tyle, żeby nikt
 * nie odczytał ich jako dwóch stopni tego samego stanu.
 */
export function ContractDocumentBadge({ contract }: { contract: ContractRowContract }) {
    if (contract._isContractDocumentMissing !== true) return null;

    const checkedAt = contract._contractDocumentCheckedAt;
    const badge = (
        <Badge bg="danger" text="light" title={checkedAt ? `Sprawdzono ${formatDate(checkedAt)}` : undefined}>
            Uzupełnij umowę na dysku
        </Badge>
    );
    if (!contract._contractDocumentFolderUrl) return badge;

    return (
        <a
            href={contract._contractDocumentFolderUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none" }}
        >
            {badge}
        </a>
    );
}

export function ContractRowContent({ contract }: { contract: ContractRowContract }) {
    return (
        <div style={{ wordBreak: "break-word" }}>
            {/* 250px na terminy, reszta na treść; poniżej ~820px terminy schodzą pod treść.
                Grid wewnątrz JEDNEJ komórki tabeli, a nie druga kolumna FilterableTable —
                dzięki temu na wąskim ekranie terminy się zwijają, zamiast ściskać nazwę umowy. */}
            <div
                className="d-flex flex-wrap"
                style={{ gap: "18px", alignItems: "flex-start" }}
            >
                <div className="d-flex flex-column" style={{ gap: "8px", flex: "1 1 340px", minWidth: 0 }}>
                    {isOurContract(contract) ? (
                        <OurContractBlock contract={contract} />
                    ) : (
                        <OtherContractBlock contract={contract as OtherContract} />
                    )}
                </div>
                <div style={{ flex: "0 1 250px", minWidth: "200px" }}>
                    <ContractDates contract={contract} />
                </div>
            </div>
            <ContractRowBottomBar contract={contract} />
        </div>
    );
}
