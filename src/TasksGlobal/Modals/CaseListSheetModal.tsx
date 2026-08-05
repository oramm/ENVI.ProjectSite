import React, { useState } from "react";
import { Alert, Button, Form, Modal, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faListCheck } from "@fortawesome/free-solid-svg-icons";
import { PersonData } from "../../../Typings/bussinesTypes";
import MainSetup from "../../React/MainSetupReact";
import ToolsFetch from "../../React/Tools/ToolsFetch";

type GeneratedSheet = { gdId: string; url: string; name: string; overwritten: boolean };

type PersonScope = "all" | "me" | "selected";

/** Czym różni się spis kontraktu od spisu projektu — reszta okna jest wspólna. */
export type CaseListSheetScope = {
    /** akcja na serwerze, np. "contractCaseListSheet" */
    action: string;
    /** pola body wskazujące zakres, np. { contractId } albo { projectOurId } */
    target: Record<string, unknown>;
    /** zdanie pod tytułem okna — co powstanie i gdzie wyląduje */
    subtitle: string;
    /** etykieta opcji „wszystkich osób" */
    allPersonsLabel: string;
    /** komunikat, gdy w zakresie nie ma zadań przypisanych do osób */
    noOwnersNote: string;
    /** ostrzeżenie przy „tylko moje", gdy zalogowany nie ma tu zadań */
    noSelfTasksNote: string;
    /** osoby do wyboru — właściciele zadań w zakresie spisu */
    taskOwners: PersonData[];
};

/**
 * Okno generowania „Spisu spraw" — arkusza Google z drzewem kamieni, spraw i zadań.
 *
 * Nazwa pliku koduje konfigurację (statusy + osoby): to samo ustawienie nadpisuje swój
 * arkusz, inne tworzy nowy obok. Dlatego okno nie pyta o nazwę ani o miejsce zapisu.
 */
export function CaseListSheetModal({
    show,
    onHide,
    scope,
}: {
    show: boolean;
    onHide: () => void;
    scope: CaseListSheetScope;
}) {
    const [includeFinished, setIncludeFinished] = useState(false);
    const [personScope, setPersonScope] = useState<PersonScope>("all");
    const [selectedPersonIds, setSelectedPersonIds] = useState<number[]>([]);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<GeneratedSheet | null>(null);

    const self = MainSetup.getCurrentUserAsPerson();
    const selfHasTasks = !!self && scope.taskOwners.some((p) => p.id === self.id);
    // Oba okna mogą wisieć w drzewie jednocześnie — prefiks trzyma id pól unikalne.
    const idPrefix = scope.action;

    function resolvePersonIds(): number[] {
        if (personScope === "me") return self ? [self.id] : [];
        if (personScope === "selected") return selectedPersonIds;
        return [];
    }

    function togglePerson(personId: number) {
        changeConfig(() =>
            setSelectedPersonIds((prev) =>
                prev.includes(personId) ? prev.filter((id) => id !== personId) : [...prev, personId]
            )
        );
    }

    /** Każda zmiana ustawień unieważnia wynik — inaczej pod nowymi opcjami wisiałby
     *  link do arkusza wygenerowanego dla poprzedniej konfiguracji. */
    function changeConfig(apply: () => void) {
        setResult(null);
        apply();
    }

    async function handleGenerate() {
        setBusy(true);
        setError(null);
        setResult(null);
        try {
            // bez retry: endpoint tworzy/nadpisuje plik na Drive — ponowienie po utracie
            // odpowiedzi zdublowałoby pracę na tym samym arkuszu
            const generated: GeneratedSheet = await ToolsFetch.fetchJsonWithSafeError(
                MainSetup.serverUrl + scope.action,
                {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...scope.target,
                        includeFinished,
                        personIds: resolvePersonIds(),
                    }),
                }
            );
            setResult(generated);
            if (generated?.url) window.open(generated.url, "_blank");
        } catch (e) {
            setError(e instanceof Error ? e.message : "Wystąpił błąd");
        } finally {
            setBusy(false);
        }
    }

    const canGenerate = !busy && (personScope !== "selected" || selectedPersonIds.length > 0);

    return (
        <Modal show={show} onHide={onHide} size="lg" centered enforceFocus={false}>
            {/* zatrzymanie propagacji: klik w modalu nie może zaznaczać/nawigować sekcji drzewa */}
            <div onClick={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>
                <Modal.Header closeButton>
                    <div className="me-2">
                        <h5 className="mb-1">Spis spraw</h5>
                        <div className="text-secondary small">{scope.subtitle}</div>
                    </div>
                </Modal.Header>
                <Modal.Body>
                    {error && (
                        <Alert variant="danger" onClose={() => setError(null)} dismissible>
                            {error}
                        </Alert>
                    )}

                    <div className="p-3 mb-3 bg-light border rounded">
                        <Form.Label className="fw-bold">Statusy</Form.Label>
                        <Form.Check
                            type="radio"
                            id={`${idPrefix}StatusesActive`}
                            name={`${idPrefix}Statuses`}
                            label="Bez zakończonych i archiwalnych"
                            checked={!includeFinished}
                            disabled={busy}
                            onChange={() => changeConfig(() => setIncludeFinished(false))}
                        />
                        <Form.Check
                            type="radio"
                            id={`${idPrefix}StatusesAll`}
                            name={`${idPrefix}Statuses`}
                            label="Wszystkie statusy"
                            checked={includeFinished}
                            disabled={busy}
                            onChange={() => changeConfig(() => setIncludeFinished(true))}
                        />
                        <div className="text-secondary small mt-1">
                            Wariant bez zakończonych pomija zamknięte sprawy, zrobione zadania i zakończone
                            kamienie. Zadania z Backlogu zostają.
                        </div>
                    </div>

                    <div className="p-3 bg-light border rounded">
                        <Form.Label className="fw-bold">Zadania</Form.Label>
                        <Form.Check
                            type="radio"
                            id={`${idPrefix}PersonsAll`}
                            name={`${idPrefix}Persons`}
                            label={scope.allPersonsLabel}
                            checked={personScope === "all"}
                            disabled={busy}
                            onChange={() => changeConfig(() => setPersonScope("all"))}
                        />
                        <Form.Check
                            type="radio"
                            id={`${idPrefix}PersonsMe`}
                            name={`${idPrefix}Persons`}
                            label="Tylko moje"
                            checked={personScope === "me"}
                            disabled={busy || !self}
                            onChange={() => changeConfig(() => setPersonScope("me"))}
                        />
                        <Form.Check
                            type="radio"
                            id={`${idPrefix}PersonsSelected`}
                            name={`${idPrefix}Persons`}
                            label="Wskazanych osób"
                            checked={personScope === "selected"}
                            disabled={busy || scope.taskOwners.length === 0}
                            onChange={() => changeConfig(() => setPersonScope("selected"))}
                        />

                        {personScope === "selected" && (
                            <div className="mt-2 ps-3">
                                {scope.taskOwners.map((person) => (
                                    <Form.Check
                                        key={person.id}
                                        type="checkbox"
                                        id={`${idPrefix}Person${person.id}`}
                                        label={`${person.name} ${person.surname}`}
                                        checked={selectedPersonIds.includes(person.id)}
                                        disabled={busy}
                                        onChange={() => togglePerson(person.id)}
                                    />
                                ))}
                            </div>
                        )}

                        {personScope === "me" && !selfHasTasks && (
                            <div className="text-warning small mt-1">{scope.noSelfTasksNote}</div>
                        )}
                        {scope.taskOwners.length === 0 && (
                            <div className="text-secondary small mt-1">{scope.noOwnersNote}</div>
                        )}
                        <div className="text-secondary small mt-1">
                            Zadania nieprzypisane pokazujemy zawsze. Przy kilku osobach dochodzi kolumna
                            „Osoba"; przy jednej osoba trafia do nazwy arkusza.
                        </div>
                    </div>

                    {result && (
                        <Alert variant="success" className="mt-3 mb-0">
                            {/* Link stylowany jak w kilometrówce: cały komunikat jest odnośnikiem,
                                a kolor dziedziczy z alertu — domyślny niebieski gryzłby się z zielenią. */}
                            <a
                                href={result.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Otwórz spis spraw"
                                className="link-body-emphasis link-underline-opacity-25 link-underline-opacity-100-hover"
                            >
                                {`${
                                    result.overwritten ? "Zaktualizowano arkusz" : "Utworzono arkusz"
                                }: ${result.name}`}
                            </a>
                        </Alert>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" disabled={busy} onClick={onHide}>
                        Zamknij
                    </Button>
                    <Button variant="success" disabled={!canGenerate} onClick={handleGenerate}>
                        {busy ? (
                            <Spinner as="span" animation="border" size="sm" role="status" className="me-2" />
                        ) : (
                            <FontAwesomeIcon icon={faListCheck} className="me-2" />
                        )}
                        Generuj
                    </Button>
                </Modal.Footer>
            </div>
        </Modal>
    );
}
