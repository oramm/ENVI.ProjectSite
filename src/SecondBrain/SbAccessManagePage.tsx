import React, { useEffect, useRef, useState } from "react";
import { Alert, Badge, Button, Col, Container, Form, Modal, Row, Spinner } from "react-bootstrap";
import ConfirmModal from "../View/Modals/ConfirmModal";
import "./sbTailwind.css";
import { fetchSbAccess } from "./sbAccessApi";
import { fetchSbAgentAccess, fetchSbCandidates, fetchSbEntries, fetchSbMailboxes, fetchSbEvents, fetchSbHealthReport, fetchSbUnlinkedMembers, giveSbSecret, performSbAction, requestSbHealth,
    setSbLevels, takeSbSecret, SbAction, SbAgentAccess, SbCandidate, SbEntry, SbEvent, SbFetchResult, SbLevels, SbMailbox, SbUnlinkedMember } from "./sbManageApi";
import { agentStateTone, assignableEntries, availableActions, canReceiveSecret, canRequestHealth, confirmationContent, defaultSecretRecipients, describeDrive, describeFailure,
    describeGithub, describeLevels, describeOutcome, driveOptions, entryGroups, groupKey, healthColumn, healthContentNote, healthRetentionNote,
    healthToolLabel, healthVersions, mailboxChoices, manualExplanation, noLevels,
    psDbOptions, repoOptions, roleLabel, secretCharacterCount, secretConfirmationError, secretHealthState, secretInputError, secretLabel, secretRecipients, secretsState, sharedSecretNames, statusViews, takeSecretConfirmation,
    routeAccessLabel, toggleMailbox } from "./sbManageView";
import { encryptSecretForKey } from "./sbSecretCrypto";

const personLabel = (person: { name: string; surname: string; systemEmail: string | null }) =>
    `${person.surname} ${person.name} - ${person.systemEmail || "brak adresu"}`;
const loading = <Spinner animation="border" size="sm" role="status" aria-label="Wczytywanie" />;
// Okno Dostępy SB jest stylowane Tailwindem (v3, tylko wewnątrz #sb-access-admin); reszta strony zostaje na Bootstrapie.
const pillTone = { ok: "bg-[#e3f3ea] text-[#1d7a46]", bad: "bg-[#fbe4e4] text-[#a32020]", warn: "bg-[#fbefd9] text-[#9a5b00]", off: "bg-[#eef1f5] text-[#5d6878]" };
const Pill = ({ tone, children }: { tone: keyof typeof pillTone; children: React.ReactNode }) =>
    <span className={`inline-block whitespace-nowrap rounded-full px-2 py-px text-xs ${pillTone[tone]}`}>{children}</span>;
const levelPill = (label: string, high: boolean) => label === "brak" ? <Pill tone="off">brak</Pill> : <Pill tone={high ? "warn" : "ok"}>{label}</Pill>;
const chip = "whitespace-nowrap rounded bg-[#eef1f5] px-1.5 font-mono text-xs";

export default function SbAccessManagePage({ title }: { title: string }) {
    const [access, setAccess] = useState<"loading" | "error" | "denied" | "granted">("loading");
    const [entries, setEntries] = useState<SbFetchResult<SbEntry[]> | null>(null);
    const [candidates, setCandidates] = useState<SbFetchResult<SbCandidate[]> | null>(null);
    const [members, setMembers] = useState<SbFetchResult<SbUnlinkedMember[]> | null>(null);
    const [message, setMessage] = useState<{ variant: "success" | "warning" | "danger"; message: string } | null>(null);
    const [busy, setBusy] = useState<string | null>(null);
    const [inviting, setInviting] = useState(false);
    const [candidateId, setCandidateId] = useState("");
    const [assignments, setAssignments] = useState<Record<string, string>>({});
    const [confirmation, setConfirmation] = useState<{ action: "block" | "revoke"; entry: SbEntry } | null>(null);
    const [historyPerson, setHistoryPerson] = useState<SbEntry | null>(null);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [levelsDraft, setLevelsDraft] = useState<SbLevels>(noLevels);
    const [levelsError, setLevelsError] = useState<string | null>(null);
    const [mailboxes, setMailboxes] = useState<SbFetchResult<SbMailbox[]> | null>(null);
    const [events, setEvents] = useState<SbFetchResult<SbEvent[]> | null>(null);
    // Hasła (SBD-2): jawne hasło żyje tylko w polu dialogu i znika po wysyłce albo zamknięciu.
    const [sharing, setSharing] = useState<"all" | number | null>(null);
    const [shareEntries, setShareEntries] = useState<SbEntry[]>([]);
    const [shareName, setShareName] = useState("");
    const [sharePassword, setSharePassword] = useState("");
    const [shareRepeated, setShareRepeated] = useState("");
    const [shareSelected, setShareSelected] = useState<number[]>([]);
    const [shareChanged, setShareChanged] = useState(false);
    const [shareResults, setShareResults] = useState<Record<number, { ok: boolean; message: string }>>({});
    const shareResultsRef = useRef<HTMLFieldSetElement>(null);
    const [taking, setTaking] = useState<{ entry: SbEntry; name: string } | null>(null);
    const [healthError, setHealthError] = useState<string | null>(null);

    async function refresh() {
        // Każda lista ma własny wynik; awaria GitHuba nie zasłania rejestru ani kandydatów.
        await Promise.all([
            fetchSbEntries().then(setEntries), fetchSbCandidates().then(setCandidates), fetchSbMailboxes().then(setMailboxes),
            fetchSbUnlinkedMembers().then(result => { setMembers(result); setAssignments({}); }),
        ]);
    }
    useEffect(() => {
        document.title = title;
        let active = true;
        fetchSbAccess().then(result => {
            if (!active) return;
            setAccess(result === "error" ? "error" : result.canManage ? "granted" : "denied");
            if (result !== "error" && result.canManage) void refresh();
        });
        return () => { active = false; };
    }, [title]);

    useEffect(() => {
        if (!historyPerson) return;
        let active = true;
        setEvents(null);
        fetchSbEvents(historyPerson.personId).then(result => { if (active) setEvents(result); });
        return () => { active = false; };
    }, [historyPerson]);

    async function operate(action: SbAction, person: SbEntry | SbCandidate, githubLogin?: string, inConfirmation = false) {
        if (busy) return;
        setBusy(`${person.personId}/${action}`);
        const result = await performSbAction(person.personId, action, githubLogin);
        if (result.ok) {
            setMessage(describeOutcome(action, personLabel(person), result.result, result.note));
            if (action === "invite") { setInviting(false); setCandidateId(""); }
        } else if (!inConfirmation) {
            setMessage({ variant: "danger", message: describeFailure(result.status, result.message) });
        }
        await refresh();
        setBusy(null);
        if (!result.ok && inConfirmation) throw new Error(describeFailure(result.status, result.message));
    }

    function selectEntry(entry: SbEntry) {
        setSelectedId(entry.personId); setLevelsDraft(entry.levels ?? noLevels); setLevelsError(null); setHealthError(null);
    }
    async function saveLevels(entry: SbEntry) {
        if (busy) return;
        setBusy(`${entry.personId}/levels`); setLevelsError(null);
        const result = await setSbLevels(entry.personId, levelsDraft);
        if (result.ok) {
            setMessage({ variant: "success", message: `Zapisano uprawnienia: ${personLabel(entry)}.` });
            await refresh();
        } else setLevelsError(describeFailure(result.status, result.message));
        setBusy(null);
    }

    function openShare(entry?: SbEntry) {
        const scope = entry ? [entry] : entries?.ok ? entries.data : [];
        const names = sharedSecretNames(scope);
        const name = names.find(name => defaultSecretRecipients(scope, name).length) ?? names[0] ?? "";
        setSharing(entry ? entry.personId : "all");
        setShareEntries(scope);
        changeShareName(name, scope, entry?.personId);
    }
    function changeShareName(name: string, scope: SbEntry[], personId?: number) {
        setShareName(name); setShareChanged(false); setShareResults({});
        setSharePassword(""); setShareRepeated("");
        setShareSelected(personId != null ? secretRecipients(scope, name).filter(canReceiveSecret).map(entry => entry.personId) : defaultSecretRecipients(scope, name));
    }
    function closeShare() { if (busy) return; setSharePassword(""); setShareRepeated(""); setShareResults({}); setShareEntries([]); setSharing(null); }
    async function shareSecret() {
        if (sharing === null || busy || secretConfirmationError(sharePassword, shareRepeated)) return;
        const recipients = secretRecipients(shareScope, shareName).filter(entry => canReceiveSecret(entry) && shareSelected.includes(entry.personId));
        if (!recipients.length) return;
        setBusy("shareSecret"); setShareResults({});
        let succeeded = 0, failed = 0;
        try {
            for (const entry of recipients) {
                if (!entry.publicKeyJwk || !entry.keyThumbprint) continue;
                let outcome: { ok: boolean; message: string };
                try {
                    const ciphertext = await encryptSecretForKey(entry.publicKeyJwk, sharePassword);
                    const result = await giveSbSecret(entry.personId, shareName, ciphertext, entry.keyThumbprint);
                    outcome = result.ok ? { ok: true, message: "Udostępniono" } : { ok: false, message: describeFailure(result.status, result.message) };
                } catch {
                    outcome = { ok: false, message: "Nie udało się zaszyfrować lub wysłać hasła w tej przeglądarce. Spróbuj ponownie." };
                }
                if (outcome.ok) succeeded++; else failed++;
                setShareResults(results => ({ ...results, [entry.personId]: outcome }));
            }
            setMessage({ variant: failed ? (succeeded ? "warning" : "danger") : "success",
                message: succeeded ? `Udostępniono hasło (${secretLabel(shareName)}) - liczba osób: ${succeeded}. Błędy: ${failed}.`
                    : `Nie udostępniono hasła (${secretLabel(shareName)}) nikomu. Błędy: ${failed}.` });
        } finally {
            setSharePassword(""); setShareRepeated("");
            try { await refresh(); } finally { setBusy(null); shareResultsRef.current?.focus(); }
        }
    }
    async function takeSecret(entry: SbEntry, name: string) {
        if (busy) return;
        setBusy(`${entry.personId}/take`);
        const result = await takeSbSecret(entry.personId, name);
        await refresh();
        setBusy(null);
        if (!result.ok) throw new Error(describeFailure(result.status, result.message));
        setMessage({ variant: "warning", message: `Odebrano hasło (${secretLabel(name)}): ${personLabel(entry)}. Zmień je u źródła - komputer pracownika mógł je już pobrać.` });
    }

    async function requestHealth(entry: SbEntry) {
        if (busy) return;
        setBusy(`${entry.personId}/healthRequest`); setHealthError(null);
        const result = await requestSbHealth(entry.personId);
        if (result.ok) await refresh(); else setHealthError(describeFailure(result.status, result.message));
        setBusy(null);
    }
    async function downloadHealth(entry: SbEntry) {
        if (busy) return;
        setBusy(`${entry.personId}/healthReport`); setHealthError(null);
        const result = await fetchSbHealthReport(entry.personId);
        if (!result.ok) setHealthError(describeFailure(result.status, result.message));
        else {
            const url = URL.createObjectURL(result.data.blob), link = document.createElement("a");
            link.href = url; link.download = result.data.fileName; document.body.appendChild(link); link.click(); link.remove();
            URL.revokeObjectURL(url);
        }
        setBusy(null);
    }

    if (access === "loading") return <Container fluid className="py-4">{loading}</Container>;
    if (access !== "granted") return <Container fluid className="py-4"><Alert variant={access === "error" ? "danger" : "info"}>
        {access === "error" ? "Nie udało się sprawdzić dostępu do Second Brain. Odśwież stronę." : "Nie masz uprawnienia do zarządzania dostępem do Second Brain. Znacznik nadaje się w oknie Personel i uprawnienia."}
    </Alert></Container>;

    const rows = entries?.ok ? entries.data : [];
    const assignable = assignableEntries(rows);
    const candidate = candidates?.ok ? candidates.data.find(person => String(person.personId) === candidateId) : undefined;
    const content = confirmation && confirmationContent(confirmation.action, confirmation.entry);
    const selected = rows.find(entry => entry.personId === selectedId);
    const selectedStatus = selected && statusViews[selected.statusCode];
    const columns = ["Osoba", "Repozytoria", "Poczta", "Baza PS", "Dysk", "Hasła", "Komputer"];
    const takeContent = taking && takeSecretConfirmation(taking.entry, taking.name);
    // Błąd odświeżenia listy nie może schować wyników właśnie zakończonej wysyłki.
    const shareScope = !entries?.ok ? shareEntries : sharing === "all" ? rows : rows.filter(entry => entry.personId === sharing);
    const shareNames = sharedSecretNames(shareScope);
    const recipients = secretRecipients(shareScope, shareName);
    const shareInputError = secretConfirmationError(sharePassword, shareRepeated);
    const sharePasswordError = sharePassword ? secretInputError(sharePassword) : null;
    const shareRepeatedError = shareRepeated && !sharePasswordError ? shareInputError : null;
    const secretHealth = selected && secretHealthState(selected.health);

    return <Container fluid className="px-3" style={{ overflowWrap: "anywhere" }}>
        <h4>Dostęp do Second Brain</h4>
        <p className="text-muted">Tutaj zapraszasz, blokujesz, odblokowujesz i odbierasz dostęp, ustawiasz poziomy uprawnień oraz sprawdzasz historię każdej osoby; blokada i odebranie zatrzymują dalsze pobieranie wiedzy, a kopia już pobrana zostaje.</p>
        {message && <Alert variant={message.variant} dismissible onClose={() => setMessage(null)}>{message.message}</Alert>}
        <Button className="mb-3" onClick={() => { setCandidateId(""); setInviting(true); }} disabled={!!busy}>Zaproś osobę</Button>
        <Button className="mb-3 ms-2" variant="outline-primary" onClick={() => openShare()} disabled={!!busy || !sharedSecretNames(rows).length}>Hasła wspólne</Button>

        <div id="sb-access-admin">
        <div className="mb-4 grid gap-4 lg:grid-cols-[1fr_340px]">
            <div className="min-w-0 overflow-x-auto rounded-md border border-[#dfe3ea] bg-white">
                {!entries ? <div className="p-3">{loading}</div> : !entries.ok ? <Alert className="m-3" variant="danger">{describeFailure(entries.status, entries.message)}</Alert>
                    : !rows.length ? <p className="p-3">Nikt nie ma jeszcze wpisu w rejestrze.</p> :
                    <table className="mb-0 w-full min-w-[720px] text-sm">
                        <thead className="border-b border-[#dfe3ea] text-left text-xs uppercase tracking-wide text-[#5d6878]">
                            <tr>{columns.map(label => <th className="p-2" key={label}>{label}</th>)}</tr>
                        </thead>
                        <tbody>
                            {entryGroups.map(group => {
                                const list = rows.filter(entry => groupKey(entry) === group.key);
                                if (!list.length) return null;
                                return <React.Fragment key={group.key}>
                                    <tr><td colSpan={columns.length} className="bg-[#e8edf4] p-2 text-xs font-semibold uppercase tracking-wide text-[#5d6878]">
                                        {group.label} · {list.length}{group.hint && <span className="font-normal normal-case"> - {group.hint}</span>}
                                    </td></tr>
                                    {list.map(entry => {
                                        const levels = entry.levels ?? noLevels, text = describeLevels(entry), active = entry.personId === selectedId;
                                        return <tr key={entry.personId} tabIndex={0} aria-selected={active}
                                            className={`cursor-pointer border-b border-[#dfe3ea] ${active ? "bg-[#eaf1fb]" : "hover:bg-[#eef1f5]"}`}
                                            onClick={() => selectEntry(entry)} onKeyDown={event => { if (event.key === "Enter") selectEntry(entry); }}>
                                            <td className="whitespace-nowrap p-2 pl-4 font-medium">{entry.surname} {entry.name}
                                                <div className="text-xs font-normal text-[#5d6878]">{entry.systemEmail || "brak adresu"}</div></td>
                                            <td className="p-2">{levelPill(text.repos, levels.repos === "write")}</td>
                                            <td className="p-2">{levels.mail.length ? <span className="flex flex-wrap gap-1">{levels.mail.map(code =>
                                                <span key={code} className={chip}>{code}</span>)}</span> : <Pill tone="off">brak</Pill>}</td>
                                            <td className="p-2">{levelPill(text.psDb, levels.psDb === "rw")}</td>
                                            <td className="p-2">{levels.drive === "none" ? <Pill tone="off">brak</Pill> : <Pill tone="ok">{text.drive}</Pill>}</td>
                                            <td className="p-2">{(state => state.text === "—" ? <span className="text-[#5d6878]">—</span>
                                                : <Pill tone={state.tone}>{state.text}</Pill>)(secretsState(entry))}</td>
                                            <td className="p-2">{(state => <><Pill tone={state.tone}>{state.text}</Pill>
                                                {state.date && <div className="mt-0.5 text-xs text-[#5d6878]">{state.date}</div>}</>)(healthColumn(entry))}</td>
                                        </tr>;
                                    })}
                                </React.Fragment>;
                            })}
                        </tbody>
                    </table>}
                {rows.length > 0 && <p className="mb-0 border-t border-[#dfe3ea] p-2 text-xs text-[#5d6878]">{healthRetentionNote}</p>}
            </div>
            <aside className="flex min-w-0 flex-col gap-3 rounded-md border border-[#dfe3ea] bg-white p-3" aria-label="Panel osoby">
                {!selected || !selectedStatus ? <p className="mb-0 text-sm text-[#5d6878]">Kliknij osobę w tabeli, żeby zobaczyć i zmienić jej uprawnienia.</p> : <>
                    <div>
                        <h2 className="text-base font-semibold">{selected.surname} {selected.name}</h2>
                        <p className="mb-0 text-xs text-[#5d6878]">{selected.systemEmail || "brak adresu"} · <Badge bg={selectedStatus.variant} text={selected.statusCode === "INVITED" ? "dark" : undefined}>{selectedStatus.label}</Badge></p>
                        <p className="mb-0 mt-1 text-xs text-[#5d6878]">Konto GitHub: {describeGithub(selected)} · Dysk SB.ENVI: {describeDrive(selected)}</p>
                    </div>
                    <section className="flex flex-col gap-2">
                        <h3 className="text-sm font-semibold">Uprawnienia</h3>
                        <div className="grid grid-cols-[100px_1fr] items-center gap-2 text-sm">
                            {([["Repozytoria", "sbLevelRepos", "repos", repoOptions], ["Baza PS", "sbLevelPsDb", "psDb", psDbOptions], ["Dysk", "sbLevelDrive", "drive", driveOptions]] as const).map(([label, id, key, options]) =>
                                <React.Fragment key={id}>
                                    <label htmlFor={id} className="mb-0 text-[#5d6878]">{label}</label>
                                    <select id={id} className="rounded-md border border-[#dfe3ea] bg-white px-1.5 py-1 text-[13px]" value={levelsDraft[key]} disabled={!!busy}
                                        onChange={event => setLevelsDraft({ ...levelsDraft, [key]: event.target.value } as SbLevels)}>
                                        {options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
                                    </select>
                                </React.Fragment>)}
                            <span className="self-start text-[#5d6878]">Poczta</span>
                            <div className="flex flex-col gap-1">{mailboxes && !mailboxes.ok && <span className="text-[#b42318]">Nie udało się pobrać spisu skrzynek z PS.</span>}
                                {mailboxChoices(mailboxes?.ok ? mailboxes.data.map(mailbox => mailbox.code) : [], levelsDraft.mail).map(code => <label key={code} className="mb-0 flex items-center gap-2">
                                <input type="checkbox" aria-label={`Skrzynka ${code}`} checked={levelsDraft.mail.includes(code)} disabled={!!busy}
                                    onChange={event => setLevelsDraft({ ...levelsDraft, mail: toggleMailbox(levelsDraft.mail, code, event.target.checked) })} />
                                <span className={chip}>{code}</span>
                            </label>)}</div>
                        </div>
                        {levelsError && <Alert className="mb-0" variant="danger">{levelsError}</Alert>}
                        <div className="flex gap-2">
                            <Button size="sm" disabled={!!busy} onClick={() => void saveLevels(selected)}>{busy === `${selected.personId}/levels` && loading} Zapisz uprawnienia</Button>
                            <Button size="sm" variant="outline-secondary" onClick={() => setHistoryPerson(selected)}>Historia zmian</Button>
                        </div>
                    </section>
                    <section className="flex flex-col gap-2 border-t border-[#dfe3ea] pt-3" aria-label="Hasła">
                        <h3 className="text-sm font-semibold">Hasła</h3>
                        {secretHealth && <p role="status" className={`mb-0 text-xs ${secretHealth.tone === "bad" ? "text-[#a32020]" : "text-[#5d6878]"}`}>{secretHealth.text}</p>}
                        {!canReceiveSecret(selected) ? <p className="mb-0 text-xs text-[#5d6878]"><Pill tone="off">brak klucza</Pill>{" "}
                            Hasło da się udostępnić dopiero po uruchomieniu instalatora u pracownika.</p> : <>
                            <p className="mb-0 text-xs text-[#5d6878]">Klucz komputera <span className={chip}>{selected.keyFingerprint}</span>. Porównaj z ekranem instalatora u pracownika.</p>
                            <p className="mb-0 text-xs text-[#5d6878]">Hasło wpisane tutaj zostaje zaszyfrowane w Twojej przeglądarce. PS zapisuje tylko szyfr.</p>
                        </>}
                        {!(selected.secretsExpected ?? []).length ? <p className="mb-0 text-xs text-[#5d6878]">Uprawnienia tej osoby nie obejmują żadnego hasła (skrzynki poczty, baza PS).</p>
                            : <ul className="mb-0 flex list-none flex-col gap-1 p-0 text-sm">{(selected.secretsExpected ?? []).map(name => {
                                const given = (selected.secretsGiven ?? []).includes(name);
                                return <li key={name} className="flex items-center justify-between gap-2">
                                    <span>{secretLabel(name)} {given ? <Pill tone="ok">udostępnione</Pill> : <Pill tone="warn">czeka</Pill>}</span>
                                    {given && <Button size="sm" variant="outline-danger" disabled={!!busy} onClick={() => setTaking({ entry: selected, name })}>Odbierz</Button>}
                                </li>;
                            })}</ul>}
                        <div><Button size="sm" disabled={!!busy || !canReceiveSecret(selected) || !(selected.secretsExpected ?? []).length}
                            onClick={() => openShare(selected)}>Udostępnij hasło…</Button></div>
                    </section>
                    <section className="flex flex-col gap-2 border-t border-[#dfe3ea] pt-3" aria-label="Komputer">
                        <h3 className="text-sm font-semibold">Komputer</h3>
                        {!selected.health ? <p className="mb-0 text-xs text-[#5d6878]"><Pill tone="off">nie zainstalowano</Pill>{" "}
                            Pracownik nie uruchomił jeszcze instalatora SB, więc nie ma raportu ani klucza komputera.</p> : <>
                            <p className="mb-0 text-xs text-[#5d6878]">{healthVersions(selected.health)}
                                {selected.health.stale && <> <Pill tone="off">brak raportu</Pill> Raport jest starszy niż 7 dni.</>}</p>
                            {!selected.health.tools.length ? <p className="mb-0 text-xs text-[#5d6878]">Raport nie wymienia narzędzi.</p>
                                : <ul className="mb-0 flex list-none flex-col gap-1 p-0 text-sm">{selected.health.tools.map(tool => <li key={tool.name} className="flex items-center justify-between gap-2">
                                    <span>{healthToolLabel(tool.name)}</span>
                                    <Pill tone={tool.ok ? "ok" : "bad"}>{tool.ok ? "działa" : "błąd"}</Pill>
                                </li>)}</ul>}
                            {selected.health.events.length ? <pre aria-label="Log komputera" className="mb-0 max-h-40 overflow-auto whitespace-pre-wrap rounded border border-[#dfe3ea] bg-[#f6f8fb] p-2 font-mono text-xs">{selected.health.events.join("\n")}</pre>
                                : <p className="mb-0 text-xs text-[#5d6878]">{selected.health.tools.some(tool => !tool.ok) ? "Raport nie podaje opisów błędów." : "Brak problemów w ostatnim raporcie."}</p>}
                            {selected.health.tools.filter(tool => !tool.ok && tool.error).map(tool => <p key={tool.name} className="mb-0 text-xs text-[#a32020]">{healthToolLabel(tool.name)}: {tool.error}</p>)}
                        </>}
                        {healthError && <Alert className="mb-0" variant="danger">{healthError}</Alert>}
                        <div className="flex flex-wrap items-center gap-2">
                            <Button size="sm" variant="outline-secondary" disabled={!!busy || !canRequestHealth(selected) || !!selected.health?.refreshRequested}
                                onClick={() => void requestHealth(selected)}>{busy === `${selected.personId}/healthRequest` && loading} Poproś o świeży raport</Button>
                            <Button size="sm" variant="outline-secondary" disabled={!!busy || !selected.health}
                                onClick={() => void downloadHealth(selected)}>{busy === `${selected.personId}/healthReport` && loading} Pobierz raport diagnostyczny</Button>
                            {selected.health?.refreshRequested && <Pill tone="warn">prośba czeka</Pill>}
                        </div>
                        <p className="mb-0 text-xs text-[#5d6878]">{healthContentNote}</p>
                    </section>
                    <AgentAccessSection key={`${selected.personId}-${selected.statusCode}-${JSON.stringify(selected.levels)}`} personId={selected.personId} />
                    <section className="flex flex-col gap-2 border-t border-[#dfe3ea] pt-3">
                        <h3 className="text-sm font-semibold">Dostęp do Second Brain</h3>
                        {selected.isGrantedManually && <p className="mb-0 text-xs text-[#5d6878]">{manualExplanation}</p>}
                        <div className="flex flex-wrap gap-2">
                            {availableActions(selected).map(item => <Button key={item.label} size="sm" variant="outline-primary" disabled={!!busy}
                                onClick={() => item.confirm && (item.action === "block" || item.action === "revoke")
                                    ? setConfirmation({ action: item.action, entry: selected }) : void operate(item.action, selected)}>
                                {busy === `${selected.personId}/${item.action}` && loading} {item.label}
                            </Button>)}
                        </div>
                    </section>
                </>}
            </aside>
        </div>
        </div>

        <h5>Członkowie organizacji GitHub bez przypisanej osoby</h5>
        <div className="mb-4 rounded border bg-white p-3">
            {!members ? loading : !members.ok ? <Alert variant="danger">{members.status === 503 ? "Funkcja nieskonfigurowana - nie można pobrać listy członków GitHub." : describeFailure(members.status, members.message)}</Alert>
                : !members.data.length ? <p>Każdy członek organizacji jest przypisany do osoby.</p> : members.data.map(member => <Row className="g-2 mb-3 align-items-center" key={member.login}>
                    <Col xs={12} md={3}><a href={member.profileUrl} target="_blank" rel="noopener noreferrer">{member.login}</a></Col>
                    <Col xs={12} md={6}><Form.Select aria-label={`Osoba dla ${member.login}`} value={assignments[member.login] || ""} disabled={!assignable.length || !!busy}
                        onChange={event => setAssignments({ ...assignments, [member.login]: event.target.value })}>
                        <option value="" disabled>{assignable.length ? "Wybierz osobę" : "Brak osób do przypisania"}</option>
                        {assignable.map(entry => <option value={entry.personId} key={entry.personId}>{personLabel(entry)}</option>)}
                    </Form.Select></Col>
                    <Col xs={12} md={3}><Button disabled={!assignments[member.login] || !!busy} onClick={() => {
                        const entry = assignable.find(row => String(row.personId) === assignments[member.login]);
                        if (entry) void operate("assign", entry, member.login);
                    }}>{busy === `${assignments[member.login]}/assign` && loading} Przypisz</Button></Col>
                </Row>)}
        </div>

        <Modal size="lg" show={inviting} onHide={() => { if (!busy) setInviting(false); }}>
            <Modal.Header closeButton><Modal.Title>Zaproś osobę</Modal.Title></Modal.Header>
            <Modal.Body>
                {!candidates ? loading : !candidates.ok ? <Alert variant="danger">{describeFailure(candidates.status, candidates.message)}</Alert>
                    : !candidates.data.length ? <p>Nie ma nikogo, kogo można zaprosić.</p> : <>
                        <Form.Label htmlFor="sbCandidate">Osoba</Form.Label>
                        <Form.Select id="sbCandidate" value={candidateId} disabled={!!busy} onChange={event => setCandidateId(event.target.value)}>
                            <option value="">Wybierz osobę</option>
                            {candidates.data.map(person => <option key={person.personId} value={person.personId}>{personLabel(person)} - {roleLabel(person.systemRoleName)}</option>)}
                        </Form.Select>
                        {candidate && <p className="mt-3">Zaproszenie na GitHubie i dostęp Czytelnika do dysku SB.ENVI zostaną nadane na adres logowania do PS tej osoby: <strong>{candidate.systemEmail}</strong>.</p>}
                        <p className="text-muted small">Zaproszenia GitHub wygasają po 7 dniach. Możesz je ponowić w rejestrze.</p>
                    </>}
                {message?.variant === "danger" && <Alert variant="danger">{message.message}</Alert>}
            </Modal.Body>
            <Modal.Footer><Button variant="secondary" disabled={!!busy} onClick={() => setInviting(false)}>Anuluj</Button>
                <Button disabled={!candidate || !!busy} onClick={() => { if (candidate) void operate("invite", candidate); }}>{busy && loading} Wyślij zaproszenie</Button></Modal.Footer>
        </Modal>

        {confirmation && content && <ConfirmModal show title={content.title} prompt={content.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
            confirmLabel={confirmation.action === "block" ? "Zablokuj" : "Odbierz na stałe"} confirmVariant="danger"
            onClose={() => { if (!busy) setConfirmation(null); }}
            onConfirm={() => operate(confirmation.action, confirmation.entry, undefined, true)} />}

        <Modal size="lg" scrollable style={{ overflowWrap: "anywhere" }} show={sharing !== null} onHide={closeShare}>
            <Modal.Header closeButton><Modal.Title>{sharing === "all" ? "Hasła wspólne" : "Udostępnij hasło"}</Modal.Title></Modal.Header>
            {sharing !== null && <Form className="d-flex flex-column overflow-hidden" onSubmit={event => { event.preventDefault(); void shareSecret(); }}>
                <Modal.Body>
                    <Form.Label htmlFor="sbSecretName">Hasło do</Form.Label>
                    <Form.Select id="sbSecretName" className="mb-3" value={shareName} disabled={!!busy}
                        onChange={event => changeShareName(event.target.value, shareScope, typeof sharing === "number" ? sharing : undefined)}>
                        {shareNames.map(name => <option key={name} value={name}>{secretLabel(name)}</option>)}
                    </Form.Select>
                    <Form.Check id="sbSecretChanged" type="switch" className="mb-3" label="Hasło zmieniło się u źródła — wyślij wszystkim"
                        checked={shareChanged} disabled={!!busy} onChange={event => {
                            setShareChanged(event.target.checked); setShareResults({});
                            setShareSelected(defaultSecretRecipients(shareScope, shareName, event.target.checked));
                        }} />
                    {!shareChanged && recipients.some(canReceiveSecret) && recipients.filter(canReceiveSecret).every(entry => entry.secretsGiven?.includes(shareName)) &&
                        <p>Nikt nie czeka na to hasło - włącz 'Hasło zmieniło się u źródła', żeby wysłać je ponownie.
                            {recipients.some(entry => !canReceiveSecret(entry)) && " Osoby bez klucza komputera dostaną je dopiero po uruchomieniu instalatora."}</p>}
                    <fieldset className="mb-3" ref={shareResultsRef} tabIndex={-1} aria-live="polite">
                        <legend className="fs-6">Osoby</legend>
                        {recipients.map(entry => <div key={entry.personId} className="mb-2">
                            <Form.Check id={`sbSecretPerson${entry.personId}`} label={personLabel(entry)} checked={shareSelected.includes(entry.personId)}
                                disabled={!!busy || !canReceiveSecret(entry)} onChange={event => setShareSelected(ids =>
                                    event.target.checked ? [...ids, entry.personId] : ids.filter(id => id !== entry.personId))} />
                            {shareResults[entry.personId] ? <div className={`small ms-4 ${shareResults[entry.personId].ok ? "text-success" : "text-danger"}`}>
                                {shareResults[entry.personId].ok ? "Udostępniono" : `Błąd: ${shareResults[entry.personId].message}`}
                            </div> : <div className={`small ms-4 ${canReceiveSecret(entry) ? "" : "text-muted"}`}>
                                {!canReceiveSecret(entry) ? "Hasło da się wysłać po uruchomieniu instalatora u tej osoby."
                                    : entry.secretsGiven?.includes(shareName) ? "Już udostępnione" : "Czeka na udostępnienie"}
                            </div>}
                        </div>)}
                    </fieldset>
                    <Form.Label htmlFor="sbSecretValue">Hasło</Form.Label>
                    <Form.Control id="sbSecretValue" type="password" autoComplete="off" value={sharePassword} disabled={!!busy}
                        aria-invalid={!!sharePasswordError} aria-describedby={sharePasswordError ? "sbSecretCount sbSecretValueError" : "sbSecretCount"}
                        onChange={event => setSharePassword(event.target.value)} />
                    <Form.Text id="sbSecretCount" muted>{secretCharacterCount(sharePassword)}</Form.Text>
                    {sharePasswordError && <Form.Text id="sbSecretValueError" role="alert" className="d-block text-danger">{sharePasswordError}</Form.Text>}
                    <Form.Label className="d-block mt-3" htmlFor="sbSecretRepeated">Powtórz hasło</Form.Label>
                    <Form.Control id="sbSecretRepeated" type="password" autoComplete="off" value={shareRepeated} disabled={!!busy}
                        aria-invalid={!!shareRepeatedError} aria-describedby={shareRepeatedError ? "sbSecretRepeatedError" : undefined}
                        onChange={event => setShareRepeated(event.target.value)} />
                    {shareRepeatedError && <Form.Text id="sbSecretRepeatedError" role="alert" className="d-block text-danger">{shareRepeatedError}</Form.Text>}
                    <Form.Text muted>Hasło zostanie zaszyfrowane w tej przeglądarce osobno dla każdej zaznaczonej osoby. PS zapisuje tylko szyfr. Oba pola czyszczą się po wysyłce i po zamknięciu okna.</Form.Text>
                </Modal.Body>
                <Modal.Footer><Button variant="secondary" disabled={!!busy} onClick={closeShare}>Zamknij</Button>
                    <Button type="submit" disabled={!!busy || !shareName || !!shareInputError || !recipients.some(entry => canReceiveSecret(entry) && shareSelected.includes(entry.personId))}>
                        {busy === "shareSecret" && loading} Zaszyfruj i udostępnij</Button></Modal.Footer>
            </Form>}
        </Modal>

        {taking && takeContent && <ConfirmModal show title={takeContent.title} prompt={takeContent.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
            confirmLabel="Odbierz hasło" confirmVariant="danger"
            onClose={() => { if (!busy) setTaking(null); }}
            onConfirm={() => takeSecret(taking.entry, taking.name)} />}

        <Modal show={!!historyPerson} onHide={() => setHistoryPerson(null)}>
            <Modal.Header closeButton><Modal.Title>Historia - {historyPerson && personLabel(historyPerson)}</Modal.Title></Modal.Header>
            <Modal.Body>{!events ? loading : !events.ok ? <Alert variant="danger">{describeFailure(events.status, events.message)}</Alert>
                : !events.data.length ? <p>Brak zdarzeń.</p> : events.data.map(event => <div className="border-bottom pb-2 mb-2" key={event.id}>
                    <div>{new Date(event.createdAt).toLocaleString("pl-PL")} - {event.actionName} <Badge bg={event.resultCode === "OK" ? "success" : event.resultCode === "PARTIAL" ? "warning" : "danger"} text={event.resultCode === "PARTIAL" ? "dark" : undefined}>
                        {event.resultCode === "OK" ? "OK" : event.resultCode === "PARTIAL" ? "częściowo" : "błąd"}
                    </Badge></div>
                    <div>Zlecił: {[event.requestedByName, event.requestedBySurname].filter(Boolean).join(" ") || "system"}</div>
                    {event.note && <p className="mb-0">{event.note}</p>}
                </div>)}</Modal.Body>
        </Modal>
    </Container>;
}

// Mapa jest pobierana dopiero po rozwinięciu, żeby lista osób nie wołała PS dla każdego wiersza.
function AgentAccessSection({ personId }: { personId: number }) {
    const [data, setData] = useState<SbFetchResult<SbAgentAccess> | null>(null);
    const [showRoutes, setShowRoutes] = useState(false);
    const load = () => { if (!data) void fetchSbAgentAccess(personId).then(setData); };
    const routes = data?.ok ? data.data.psRoutes : null;
    return <details className="border-t border-[#dfe3ea] pt-3" onToggle={event => event.currentTarget.open && load()}>
        <summary className="cursor-pointer text-sm font-semibold">Co może agent</summary>
        <div className="mt-2 flex flex-col gap-2">
            {!data ? loading : !data.ok ? <Alert className="mb-0" variant="danger">{describeFailure(data.status, data.message)}</Alert> : <>
                <ul className="mb-0 flex list-none flex-col gap-1.5 p-0 text-sm">{data.data.systems.map(system => <li key={system.system}>
                    <span className="flex items-center justify-between gap-2"><span>{system.label}</span><Pill tone={agentStateTone(system.state)}>{system.state}</Pill></span>
                    <span className="block text-xs text-[#5d6878]">{system.sentence}</span>
                </li>)}</ul>
                {routes && <div className="text-xs text-[#5d6878]">
                    <p className="mb-1">Trasy PS: odczyt {routes.counts.odczyt}, zapis {routes.counts.zapis}, zamknięte {routes.counts.zamkniete}. Agent może użyć {routes.allowed} z nich.</p>
                    <Button size="sm" variant="outline-secondary" onClick={() => setShowRoutes(!showRoutes)}>{showRoutes ? "Ukryj trasy" : "Pokaż trasy"}</Button>
                    {showRoutes && <ul className="mb-0 mt-2 flex max-h-64 list-none flex-col gap-1 overflow-auto rounded border border-[#dfe3ea] p-2">{routes.routes.map(route =>
                        <li key={route.method + route.path}><span className={chip.replace("whitespace-nowrap", "break-all")}>{route.method} {route.path}</span>
                            <span className="block">{routeAccessLabel(route.access)}, {route.allowed ? "dozwolona" : "niedozwolona"} - {route.reason}</span></li>)}</ul>}
                </div>}
            </>}
        </div>
    </details>;
}
