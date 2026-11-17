import React, { createContext, useContext, useState } from "react";
import { Alert, Button, Modal, Spinner } from "react-bootstrap";
import { MilestoneData, OtherContract, OurContract, RepositoryDataItem } from "../../Typings/bussinesTypes";
import MainSetup from "../React/MainSetupReact";
import ToolsFetch from "../React/Tools/ToolsFetch";
import { useFilterableTableContext } from "../View/Resultsets/FilterableTable/FilterableTableContext";
import { RowActionMenuItemProps } from "../View/Resultsets/FilterableTable/FilterableTableTypes";
import { milestoneTypesRepository } from "../Contracts/ContractsList/ContractsController";
import { ContractsWithChildren } from "./TasksGlobalTypes";

type Contract = OurContract | OtherContract;
type SharingLink = { contractId: number; shortcutStatus: "PENDING" | "READY" | "FAILED"; operationId: string | null };
type PendingRequest = { method: "PUT" | "DELETE"; contractId: number; body: { requestId: string; expectedRevision: string } };
type SharingState = { milestoneId: number; sourceContractId: number; revision: string; links: SharingLink[] };

export const MilestoneSharingContractsContext = createContext<ContractsWithChildren[]>([]);

class SharingApiError extends Error {
    constructor(public code: string, message: string, public status = 0) { super(message); }
}

async function sharingRequest<T>(path: string, method = "GET", body?: unknown): Promise<T> {
    const response = await fetch(`${MainSetup.serverUrl}${path}`, {
        method,
        credentials: "include",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
        if (response.status === 401) ToolsFetch.notifySessionExpired();
        throw new SharingApiError(data?.error?.code ?? "REQUEST_FAILED", data?.error?.message ?? "Serwer nie zwrócił szczegółów błędu.", response.status);
    }
    return data as T;
}

export function sharingErrorMessage(error: unknown): string {
    const code = error instanceof SharingApiError ? error.code : "REQUEST_FAILED";
    const messages: Record<string, string> = {
        DESTINATION_OCCUPIED: "Ten kontrakt ma już własny kamień „Przetarg – obsługa”. Połączenie danych będzie dostępne w osobnym kroku.",
        UNIQUE_TYPE_CONFLICT: "W tym kontrakcie jest już kamień tego typu. Przypięcie nie zostało zapisane.",
        TYPE_UNAVAILABLE: "Ten typ kamienia nie jest dostępny w wybranym kontrakcie.",
        CROSS_PROJECT: "Kontrakty muszą należeć do tego samego projektu.",
        ROLE_DENIED: "Nie masz uprawnienia do zarządzania przypięciami.",
        SCOPE_DENIED: "Nie masz dostępu do wszystkich kontraktów tej wspólnej pracy.",
        STALE_REVISION: "Lista przypięć się zmieniła. Odświeżono ją; sprawdź stan przed ponowieniem.",
        OPERATION_IN_PROGRESS: "Trwa niedokończona operacja. Wznów pierwotne żądanie; pozostałe zmiany przypięć są wstrzymane.",
        SHORTCUT_NOT_READY: "Nie potwierdzono usunięcia skrótu. Powiązanie pozostaje. Ponów to samo odpięcie; brak dostępu lub odpowiedź 404 nie dowodzą usunięcia.",
        SELF_LINK: "Nie można przypiąć kamienia do jego kontraktu źródłowego.",
        OBJECT_NOT_FOUND: "Kamień lub kontrakt nie jest już dostępny.",
        TYPE_MISMATCH: "Ten kamień nie kwalifikuje się do przypięcia.",
    };
    return messages[code] ?? "Nie udało się zmienić przypięcia. Odśwież stan i spróbuj ponownie.";
}

function contractLabel(contract?: Contract, missingId?: number): string {
    if (!contract) return `Kontrakt ${missingId ?? "?"} (poza bieżącą listą)`;
    const identifier = "ourId" in contract ? contract.ourId : `${contract._type?.name ?? "Kontrakt"} ${contract.number ?? ""}`;
    return [identifier, contract.alias, contract.name].filter(Boolean).join(" · ");
}

function shortcutLabel(status: SharingLink["shortcutStatus"]): string {
    switch (status) {
        case "READY": return "skrót i folder zweryfikowane przez serwer; uprawnienia użytkowników Google są odrębne";
        case "FAILED": return "gotowość niepotwierdzona — wymaga ponowienia";
        default: return "oczekuje na przygotowanie i weryfikację";
    }
}

export default function MilestoneSharingAction({ dataObject }: RowActionMenuItemProps<RepositoryDataItem>) {
    const milestone = dataObject as MilestoneData;
    const contracts = useContext(MilestoneSharingContractsContext);
    const { refreshSectionsAfterMutation } = useFilterableTableContext();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [busy, setBusy] = useState(false);
    const [state, setState] = useState<SharingState | null>(null);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [pending, setPending] = useState<PendingRequest | null>(null);
    const pendingKey = `milestone-sharing-request:${MainSetup.currentUserOrNull?.googleId}:${milestone.id}`;
    const [confirmDetachId, setConfirmDetachId] = useState<number | null>(null);
    const allowed = [1, 2, 3].includes(MainSetup.currentUserOrNull?.systemRoleId ?? 0);
    if (!allowed || milestone._type?.id !== 5 || milestone.offerId != null || milestone._offer) return null;

    const byId = new Map<number, Contract>(contracts.map(({ contract }) => [contract.id, contract]));
    if (milestone._contract) byId.set(milestone._contract.id, milestone._contract);
    const source = state ? byId.get(state.sourceContractId) : milestone._contract;
    const linkedIds = new Set(state?.links.map(link => link.contractId) ?? []);
    const candidates = contracts.filter(({ contract }) => contract.id !== (state?.sourceContractId ?? milestone._contract?.id) && !linkedIds.has(contract.id));

    function remember(request: PendingRequest | null) {
        if (request) sessionStorage.setItem(pendingKey, JSON.stringify(request));
        else sessionStorage.removeItem(pendingKey);
        setPending(request);
    }

    async function load() {
        const latest = await sharingRequest<SharingState>(`milestones/${milestone.id}/sharing`);
        setState(latest);
        return latest;
    }

    async function show() {
        try { setPending(JSON.parse(sessionStorage.getItem(pendingKey) || "null")); }
        catch { setError("Nie można odczytać poprzedniego żądania. Wyjaśnij stan operacji przed ponowieniem."); return; }
        setOpen(true);
        setState(null);
        setConfirmDetachId(null);
        setError("");
        setNotice("");
        setLoading(true);
        try { await load(); }
        catch (reason) { setError(sharingErrorMessage(reason)); }
        finally { setLoading(false); }
    }

    async function change(method: "PUT" | "DELETE", contractId: number, retry?: PendingRequest) {
        if (!state || busy || (pending && !retry)) return;
        setBusy(true);
        setError("");
        setNotice("");
        try {
            const request = retry ?? { method, contractId, body: {
                requestId: window.crypto.randomUUID(), expectedRevision: state.revision,
            } };
            // Persist before sending: a failed read-back must not replace the original revision/UUID.
            remember(request);
            await sharingRequest<{ shortcutStatus?: string }>(
                `milestones/${milestone.id}/sharing/contracts/${request.contractId}`, request.method, request.body);
            remember(null);
            setConfirmDetachId(null);
            const [list, tree] = await Promise.allSettled([load(), refreshSectionsAfterMutation()]);
            if (list.status === "rejected" || tree.status === "rejected" || (tree.status === "fulfilled" && !tree.value))
                setError("Zmiana została zapisana, ale widok nie odświeżył się w pełni. Odśwież stronę.");
            else if (request.method === "PUT" && list.value.links.find(link => link.contractId === request.contractId)?.shortcutStatus !== "READY")
                setError("Przypięcie zapisane, ale gotowość dokumentów nie jest potwierdzona. Ponów przygotowanie skrótu.");
            else setNotice(request.method === "PUT"
                ? "Przypięcie zapisane. Skrót i folder zweryfikowane przez serwer; uprawnienia użytkowników Google są odrębne."
                : "Odpięto kontrakt i usunięto jego zarządzany skrót. Oryginalne dokumenty pozostały u źródła.");
        } catch (reason) {
            // Deterministic precondition refusals do not reserve a detach intent.
            if (reason instanceof SharingApiError && ["STALE_REVISION", "INVALID_REQUEST", "DESTINATION_OCCUPIED",
                "UNIQUE_TYPE_CONFLICT", "TYPE_UNAVAILABLE", "SELF_LINK", "CROSS_PROJECT"].includes(reason.code)) remember(null);
            setError(sharingErrorMessage(reason));
            try { await load(); } catch { /* Preserve the original failure and pending request. */ }
        } finally { setBusy(false); }
    }

    return <>
        <Button size="sm" variant="outline-secondary" onClick={(event) => { event.stopPropagation(); void show(); }}>
            Przypięcia
        </Button>
        <Modal show={open} onHide={() => { if (!busy) setOpen(false); }} size="lg" onClick={(event: React.MouseEvent) => event.stopPropagation()}>
            <Modal.Header closeButton={!busy}><Modal.Title>Przypięcia kamienia</Modal.Title></Modal.Header>
            <Modal.Body>
                {loading && <Spinner animation="border" size="sm" aria-label="Ładowanie przypięć" />}
                {error && <Alert variant="danger" role="alert">{error}</Alert>}
                {notice && <Alert variant="success" role="status">{notice}</Alert>}
                {pending && <Alert variant="warning">
                    Poprzednia próba nie ma potwierdzonego wyniku. Ponowienie zachowa to samo żądanie.
                    <Button className="ms-2" size="sm" disabled={busy || !state} onClick={() => void change(pending.method, pending.contractId, pending)}>
                        {pending.method === "DELETE" ? "Ponów odpięcie" : "Ponów przypięcie"}
                    </Button>
                </Alert>}
                {state && <>
                    <p><strong>Kontrakt źródłowy:</strong> {contractLabel(source)}</p>
                    <p className="text-muted">Kamień i jego dane pozostają u źródła. Odpięcie usuwa dodatkowe powiązanie i jego zarządzany skrót, zachowując oryginalne dokumenty.</p>
                    <h6>Kontrakty przypięte</h6>
                    {state.links.length === 0 && <p>Brak dodatkowych przypięć.</p>}
                    {state.links.map(link => <div key={link.contractId} className="border rounded p-2 mb-2">
                        <div>{contractLabel(byId.get(link.contractId), link.contractId)}</div>
                        <small>Skrót: {shortcutLabel(link.shortcutStatus)}</small>
                        {link.operationId && <div className="text-muted small">Operacja nie została zakończona. Wznów pierwotne żądanie z tej sesji; jeśli nie jest dostępne, poproś administratora o wyjaśnienie stanu.</div>}
                        {!link.operationId && link.shortcutStatus !== "READY" && <Button className="ms-2" size="sm" variant="outline-primary"
                            disabled={busy || !!pending || state.links.some(item => !!item.operationId)} onClick={() => void change("PUT", link.contractId)}>Ponów przygotowanie skrótu</Button>}
                        {!link.operationId && <div className="mt-2">
                            {confirmDetachId === link.contractId ? <>
                                <span className="me-2">Odpiąć tylko ten kontrakt?</span>
                                <Button size="sm" variant="danger" disabled={busy || !!pending || state.links.some(item => !!item.operationId)} onClick={() => void change("DELETE", link.contractId)}>Potwierdź odpięcie</Button>{" "}
                                <Button size="sm" variant="outline-secondary" disabled={busy} onClick={() => setConfirmDetachId(null)}>Anuluj</Button>
                            </> : <Button size="sm" variant="outline-danger" disabled={busy || !!pending || state.links.some(item => !!item.operationId)} onClick={() => setConfirmDetachId(link.contractId)}>Odepnij kontrakt</Button>}
                        </div>}
                    </div>)}
                    <h6 className="mt-3">Dodaj przypięcie</h6>
                    {candidates.length === 0 && <p>Brak innych kontraktów na bieżącej liście projektu.</p>}
                    {candidates.map(({ contract, milestonesWithCases }) => {
                        const occupied = milestonesWithCases.some(({ milestone: own }) => own._contract?.id === contract.id && own._type?.id === 5 && own.id !== milestone.id);
                        const available = milestoneTypesRepository.items.some(type =>
                            type.id === milestone._type.id && type._contractType?.id === contract._type?.id);
                        return <div key={contract.id} className="border rounded p-2 mb-2 d-flex justify-content-between align-items-center gap-2">
                            <div>{contractLabel(contract)}
                                {occupied && <div className="text-muted small">Ten kontrakt ma własny kamień tego typu. Połączenie danych będzie dostępne w osobnym kroku.</div>}
                                {!available && <div className="text-muted small">Ten typ kamienia nie jest dostępny w tym kontrakcie.</div>}
                            </div>
                            <Button size="sm" variant="outline-primary" disabled={busy || !!pending || state.links.some(item => !!item.operationId) || occupied || !available} onClick={() => void change("PUT", contract.id)}>Przypnij</Button>
                        </div>;
                    })}
                    <p className="text-muted small">Serwer sprawdza uprawnienia, zgodność projektu i dostępność typu. Samo przypięcie nie potwierdza dostępu do dokumentów na Dysku Google.</p>
                </>}
            </Modal.Body>
            <Modal.Footer><Button variant="outline-secondary" disabled={busy || loading} onClick={() => { setLoading(true); void load().catch(reason => setError(sharingErrorMessage(reason))).finally(() => setLoading(false)); }}>Odśwież stan</Button><Button variant="secondary" disabled={busy} onClick={() => setOpen(false)}>Zamknij</Button></Modal.Footer>
        </Modal>
    </>;
}
