import React, { useEffect, useState } from "react";
import { Alert, Button, Form, Modal, Spinner } from "react-bootstrap";
import { OurContract } from "../../../../Typings/bussinesTypes";
import ConfirmModal from "../../../View/Modals/ConfirmModal";
import {
    CHAT_SPACE_NAME_MAX,
    ChatSpaceListItem,
    ChatSpaceScope,
    CreateChatSpaceResult,
    attachContractChatSpace,
    createContractChatSpace,
    describeMemberState,
    detachContractChatSpace,
    fetchContractChatSpaces,
    suggestChatSpaceName,
} from "../Modals/chatSpacesService";
import { useContractDetails } from "./ContractDetailsContext";

type Dialog = "none" | "create" | "attach" | "change" | "detach";

/**
 * Pokój Google Chat w widoku kontraktu ENVI: link „Otwórz czat", założenie albo podpięcie
 * pokoju, a gdy pokój jest - zmiana i odpięcie. Inne typy kontraktów: nic.
 * Stan pokoju serwer trzyma w `contract.chatSpaceId`; nazwę i link do pokoju czytamy
 * z listy `GET /contract/:id/chatSpaces`.
 */
export function ContractChatSpaceSection() {
    const { contract, setContract, contractsRepository } = useContractDetails();
    const [dialog, setDialog] = useState<Dialog>("none");
    const [attached, setAttached] = useState<ChatSpaceListItem | null>(null);

    const ourContract = contract && "ourId" in contract ? (contract as OurContract) : null;
    const chatSpaceId = ourContract?.chatSpaceId ?? null;

    useEffect(() => {
        setAttached(null);
        if (!ourContract?.id || !chatSpaceId) return;
        let cancelled = false;
        fetchContractChatSpaces(ourContract.id)
            .then((list) => {
                if (!cancelled) setAttached(list.find((space) => space.id === chatSpaceId) ?? null);
            })
            .catch(() => {
                // Brak odczytu nazwy nie może blokować nagłówka kontraktu.
            });
        return () => {
            cancelled = true;
        };
    }, [ourContract?.id, chatSpaceId]);

    if (!ourContract || !setContract) return null;
    const current = ourContract;
    const setCurrent = setContract;

    function applyChatSpaceId(nextId: number | null) {
        const updated = { ...current, chatSpaceId: nextId } as OurContract;
        setCurrent(updated);
        if (contractsRepository) {
            contractsRepository.items = contractsRepository.items.map((o) => (o.id === updated.id ? updated : o));
        }
    }

    return (
        <>
            {chatSpaceId ? (
                <>
                    {attached?.uri ? (
                        <Button
                            as="a"
                            variant="outline-primary"
                            size="sm"
                            href={attached.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Otwórz czat
                        </Button>
                    ) : (
                        <span className="text-muted small">{attached ? "Pokój bez zapisanego linku" : "Czat"}</span>
                    )}
                    {attached && <span className="text-muted small">{attached.displayName}</span>}
                    <Button variant="outline-secondary" size="sm" onClick={() => setDialog("change")}>
                        Zmień pokój
                    </Button>
                    <Button variant="outline-secondary" size="sm" onClick={() => setDialog("detach")}>
                        Odepnij pokój
                    </Button>
                </>
            ) : (
                <>
                    <Button variant="outline-secondary" size="sm" onClick={() => setDialog("create")}>
                        Załóż pokój czatu
                    </Button>
                    <Button variant="outline-secondary" size="sm" onClick={() => setDialog("attach")}>
                        Podepnij pokój czatu
                    </Button>
                </>
            )}

            {dialog === "create" && (
                <CreateChatSpaceModal
                    contract={current}
                    onClose={() => setDialog("none")}
                    onCreated={(result) => applyChatSpaceId(result.chatSpace.id)}
                />
            )}
            {(dialog === "attach" || dialog === "change") && (
                <PickChatSpaceModal
                    contract={current}
                    replacing={dialog === "change"}
                    onClose={() => setDialog("none")}
                    onChanged={applyChatSpaceId}
                />
            )}
            <ConfirmModal
                show={dialog === "detach"}
                onClose={() => setDialog("none")}
                title="Odepnij pokój czatu"
                prompt={
                    <>
                        Kontrakt przestanie być powiązany z pokojem{attached ? ` „${attached.displayName}"` : ""}. Sam
                        pokój w Google Chat zostaje, nikt z niego nie jest usuwany.
                    </>
                }
                confirmLabel="Odepnij"
                onConfirm={async () => {
                    await detachContractChatSpace(current.id);
                    applyChatSpaceId(null);
                }}
            />
        </>
    );
}

function CreateChatSpaceModal({
    contract,
    onClose,
    onCreated,
}: {
    contract: OurContract;
    onClose: () => void;
    onCreated: (result: CreateChatSpaceResult) => void;
}) {
    const [scope, setScope] = useState<ChatSpaceScope>("contract");
    const [typedName, setTypedName] = useState<string | null>(null);
    const [isWaiting, setIsWaiting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<CreateChatSpaceResult | null>(null);

    const suggestion =
        scope === "project"
            ? suggestChatSpaceName(contract._project?.ourId, contract._project?.alias, contract._project?.name)
            : suggestChatSpaceName(contract.ourId, contract.alias, contract.name);
    const shownName = typedName ?? suggestion;

    async function handleCreate() {
        setIsWaiting(true);
        setError(null);
        try {
            const created = await createContractChatSpace(contract.id, scope, shownName);
            setResult(created);
            onCreated(created);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Nie udało się założyć pokoju");
        } finally {
            setIsWaiting(false);
        }
    }

    return (
        <Modal show onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>Załóż pokój czatu</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {result ? (
                    <>
                        <p>Pokój „{result.chatSpace.displayName}" został założony.</p>
                        <ul className="mb-0">
                            {result.members.map((member) => (
                                <li key={member.email}>
                                    {member.email}: {describeMemberState(member)}
                                </li>
                            ))}
                        </ul>
                    </>
                ) : (
                    <>
                        <Form.Group>
                            <Form.Check
                                type="radio"
                                inline
                                name="createScope"
                                id="createScope-contract"
                                label="Dla kontraktu"
                                checked={scope === "contract"}
                                onChange={() => setScope("contract")}
                            />
                            <Form.Check
                                type="radio"
                                inline
                                name="createScope"
                                id="createScope-project"
                                label="Dla projektu"
                                checked={scope === "project"}
                                onChange={() => setScope("project")}
                            />
                        </Form.Group>
                        <Form.Group className="mt-2" controlId="createChatSpaceName">
                            <Form.Label>Nazwa pokoju</Form.Label>
                            <Form.Control
                                type="text"
                                maxLength={CHAT_SPACE_NAME_MAX}
                                value={shownName}
                                onChange={(e) => setTypedName(e.target.value)}
                            />
                        </Form.Group>
                        <div className="text-muted small mt-1">
                            Do pokoju zostaną zaproszeni koordynator, administrator kontraktu i Ty.
                        </div>
                        {error && (
                            <Alert variant="danger" className="mt-2 mb-0">
                                {error}
                            </Alert>
                        )}
                    </>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    {result ? "Zamknij" : "Anuluj"}
                </Button>
                {!result && (
                    <Button variant="primary" onClick={handleCreate} disabled={isWaiting || !shownName.trim()}>
                        {isWaiting ? <Spinner size="sm" animation="border" /> : "Załóż pokój"}
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
}

/** Podpięcie istniejącego pokoju; przy zmianie najpierw odpina stary (serwer odmawia podpięcia drugiego). */
function PickChatSpaceModal({
    contract,
    replacing,
    onClose,
    onChanged,
}: {
    contract: OurContract;
    replacing: boolean;
    onClose: () => void;
    onChanged: (chatSpaceId: number | null) => void;
}) {
    const [spaces, setSpaces] = useState<ChatSpaceListItem[] | null>(null);
    const [selectedId, setSelectedId] = useState<number>(0);
    const [isWaiting, setIsWaiting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        fetchContractChatSpaces(contract.id)
            .then((list) => {
                if (cancelled) return;
                const candidates = list.filter((space) => !space.isAttachedToContract);
                setSpaces(candidates);
                setSelectedId(candidates[0]?.id ?? 0);
            })
            .catch((e: unknown) => {
                if (!cancelled) setError(e instanceof Error ? e.message : "Nie udało się wczytać pokoi");
            });
        return () => {
            cancelled = true;
        };
    }, [contract.id]);

    async function handleConfirm() {
        setIsWaiting(true);
        setError(null);
        let detached = false;
        try {
            if (replacing) {
                await detachContractChatSpace(contract.id);
                detached = true;
            }
            const space = await attachContractChatSpace(contract.id, selectedId);
            onChanged(space.id);
            onClose();
        } catch (e) {
            const message = e instanceof Error ? e.message : "Nie udało się podpiąć pokoju";
            if (detached) {
                onChanged(null);
                setError(`Poprzedni pokój odpięto, ale nie udało się podpiąć nowego: ${message}`);
            } else {
                setError(message);
            }
        } finally {
            setIsWaiting(false);
        }
    }

    return (
        <Modal show onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>{replacing ? "Zmień pokój czatu" : "Podepnij pokój czatu"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {spaces === null && !error && (
                    <div className="text-muted small d-flex align-items-center gap-1">
                        <Spinner animation="border" size="sm" />
                        <span>Wczytuję pokoje…</span>
                    </div>
                )}
                {spaces !== null && spaces.length === 0 && (
                    <div className="text-muted">Nie ma innych pokoi do podpięcia.</div>
                )}
                {spaces !== null && spaces.length > 0 && (
                    <Form.Group controlId="pickChatSpace">
                        <Form.Label>Pokój</Form.Label>
                        <Form.Select value={selectedId} onChange={(e) => setSelectedId(Number(e.target.value))}>
                            {spaces.map((space) => (
                                <option key={space.id} value={space.id}>
                                    {space.displayName}
                                </option>
                            ))}
                        </Form.Select>
                        {replacing && (
                            <div className="text-muted small mt-1">
                                Obecny pokój zostanie odpięty od kontraktu; sam pokój w Google Chat zostaje.
                            </div>
                        )}
                    </Form.Group>
                )}
                {error && (
                    <Alert variant="danger" className="mt-2 mb-0">
                        {error}
                    </Alert>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Anuluj
                </Button>
                <Button
                    variant="primary"
                    onClick={handleConfirm}
                    disabled={isWaiting || !spaces || spaces.length === 0 || !selectedId}
                >
                    {isWaiting ? <Spinner size="sm" animation="border" /> : replacing ? "Zmień" : "Podepnij"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
