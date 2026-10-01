import React, { useEffect, useState } from "react";
import { Alert, Badge, Button, Card, Col, Container, Form, Modal, Row, Spinner } from "react-bootstrap";
import ConfirmModal from "../View/Modals/ConfirmModal";
import { fetchSbAccess } from "./sbAccessApi";
import { fetchSbCandidates, fetchSbEntries, fetchSbEvents, fetchSbUnlinkedMembers, performSbAction,
    SbAction, SbCandidate, SbEntry, SbEvent, SbFetchResult, SbUnlinkedMember } from "./sbManageApi";
import { assignableEntries, availableActions, confirmationContent, describeDrive, describeFailure,
    describeGithub, describeOutcome, manualExplanation, roleLabel, statusViews } from "./sbManageView";

const personLabel = (person: { name: string; surname: string; systemEmail: string | null }) =>
    `${person.surname} ${person.name} - ${person.systemEmail || "brak adresu"}`;
const loading = <Spinner animation="border" size="sm" role="status" aria-label="Wczytywanie" />;

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
    const [events, setEvents] = useState<SbFetchResult<SbEvent[]> | null>(null);

    async function refresh() {
        // Każda lista ma własny wynik; awaria GitHuba nie zasłania rejestru ani kandydatów.
        await Promise.all([
            fetchSbEntries().then(setEntries), fetchSbCandidates().then(setCandidates),
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

    if (access === "loading") return <Container fluid className="py-4">{loading}</Container>;
    if (access !== "granted") return <Container fluid className="py-4"><Alert variant={access === "error" ? "danger" : "info"}>
        {access === "error" ? "Nie udało się sprawdzić dostępu do Second Brain. Odśwież stronę." : "Nie masz uprawnienia do zarządzania dostępem do Second Brain. Znacznik nadaje się w oknie Personel i uprawnienia."}
    </Alert></Container>;

    const rows = entries?.ok ? entries.data : [];
    const assignable = assignableEntries(rows);
    const candidate = candidates?.ok ? candidates.data.find(person => String(person.personId) === candidateId) : undefined;
    const content = confirmation && confirmationContent(confirmation.action, confirmation.entry);
    const labels = ["Osoba", "Stan", "Konto GitHub", "Dysk", "Nadane ręcznie", "Akcje"];
    const widths = [3, 1, 2, 1, 1, 4];

    return <Container fluid className="px-3" style={{ overflowWrap: "anywhere" }}>
        <h4>Dostęp do Second Brain</h4>
        <p className="text-muted">Tutaj zapraszasz, blokujesz, odblokowujesz i odbierasz dostęp oraz sprawdzasz historię każdej osoby; blokada i odebranie zatrzymują dalsze pobieranie wiedzy, a kopia już pobrana zostaje.</p>
        {message && <Alert variant={message.variant} dismissible onClose={() => setMessage(null)}>{message.message}</Alert>}
        <Button className="mb-3" onClick={() => { setCandidateId(""); setInviting(true); }} disabled={!!busy}>Zaproś osobę</Button>
        <Card className="mb-4"><Card.Body>
            {!entries ? loading : !entries.ok ? <Alert variant="danger">{describeFailure(entries.status, entries.message)}</Alert> : !rows.length ? <p>Nikt nie ma jeszcze wpisu w rejestrze.</p> : <>
                <Row className="d-none d-md-flex fw-semibold border-bottom pb-2">{labels.map((label, i) => <Col md={widths[i]} key={label}>{label}</Col>)}</Row>
                {rows.map(entry => {
                    const status = statusViews[entry.statusCode];
                    const cells = [
                        <><strong>{entry.surname} {entry.name}</strong><div className="small text-muted">{entry.systemEmail || "brak adresu"}</div></>,
                        <Badge bg={status.variant} text={entry.statusCode === "INVITED" ? "dark" : undefined}>{status.label}</Badge>,
                        describeGithub(entry), describeDrive(entry), entry.isGrantedManually ? <Badge bg="secondary">ręcznie</Badge> : " - ",
                        <div className="d-flex flex-wrap gap-2">
                            {entry.isGrantedManually && <small className="text-muted">{manualExplanation}</small>}
                            {availableActions(entry).map(item => <Button key={item.label} size="sm" variant="outline-primary" disabled={!!busy}
                                onClick={() => item.confirm && (item.action === "block" || item.action === "revoke")
                                    ? setConfirmation({ action: item.action, entry }) : void operate(item.action, entry)}>
                                {busy === `${entry.personId}/${item.action}` && loading} {item.label}
                            </Button>)}
                            <Button size="sm" variant="outline-secondary" onClick={() => setHistoryPerson(entry)}>Historia</Button>
                        </div>,
                    ];
                    return <Row className="g-2 py-3 border-bottom" key={entry.personId}>{cells.map((cell, i) => <Col xs={12} md={widths[i]} key={labels[i]}>
                        <span className="d-md-none fw-semibold">{labels[i]}: </span>{cell}
                    </Col>)}</Row>;
                })}
            </>}
        </Card.Body></Card>

        <Card><Card.Header>Członkowie organizacji GitHub bez przypisanej osoby</Card.Header><Card.Body>
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
        </Card.Body></Card>

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
