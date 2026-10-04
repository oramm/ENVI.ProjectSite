import React, { useEffect, useRef, useState } from "react";
import { Form, Spinner } from "react-bootstrap";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ProjectData } from "../../../../Typings/bussinesTypes";
import {
    CHAT_SPACE_NAME_MAX,
    ChatSpaceListItem,
    ChatSpaceScope,
    ChatSpaceSelection as ChatSpaceSelectionValue,
    fetchChatSpacesForProject,
    suggestChatSpaceName,
} from "./chatSpacesService";

/**
 * Wybór pokoju Google Chat przy tworzeniu kontraktu ENVI. Zapisuje do pola formularza
 * `_chatSpaceSelection` (jednorazowa instrukcja dla serwera, jak `_milestonesSelection`).
 * Domyślnie „Bez pokoju" — pokój zakłada się świadomie, bo zaprasza prawdziwych ludzi.
 *
 * Oznaczenie nowego kontraktu nadaje serwer przy zapisie, więc dla zakresu „kontrakt"
 * nie da się go podpowiedzieć w formularzu: puste pole nazwy = serwer ułoży
 * `<oznaczenie> <alias albo nazwa>`. Dla zakresu „projekt" podpowiedź jest znana od razu.
 *
 * Renderowany tylko przy dodawaniu kontraktu ENVI.
 */
export function ChatSpaceSelection() {
    const { setValue, watch } = useFormContext();
    const project = watch("_project") as ProjectData | undefined;
    const projectOurId = project?.ourId;
    const contractAlias = watch("alias") as string | undefined;
    const contractName = watch("name") as string | undefined;
    const selection = (watch("_chatSpaceSelection") as ChatSpaceSelectionValue | undefined) ?? { mode: "none" };

    // Nazwa wpisana przez użytkownika; null = nie ruszał, pokazujemy podpowiedź.
    const [typedName, setTypedName] = useState<string | null>(null);
    const [spaces, setSpaces] = useState<ChatSpaceListItem[] | null>(null);
    const [spacesLoading, setSpacesLoading] = useState(false);
    const cacheRef = useRef<Map<string, ChatSpaceListItem[] | null>>(new Map());

    useEffect(() => {
        if (!projectOurId) {
            setSpaces(null);
            return;
        }
        if (cacheRef.current.has(projectOurId)) {
            setSpaces(cacheRef.current.get(projectOurId) ?? null);
            return;
        }
        let cancelled = false;
        setSpacesLoading(true);
        fetchChatSpacesForProject(projectOurId).then((list) => {
            cacheRef.current.set(projectOurId, list);
            if (cancelled) return;
            setSpaces(list);
            setSpacesLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, [projectOurId]);

    // Lista niedostępna (brak trasy albo błąd) -> wybór „Istniejący pokój" się nie pokazuje.
    const existingAvailable = !spacesLoading && spaces !== null && spaces.length > 0;
    // Opcja „Istniejący pokój" zniknęła (pusta lista, wyczyszczony projekt), a wybrany był ten tryb:
    // wracamy do „Bez pokoju", żeby walidacja nie blokowała zapisu niewidocznym wyborem.
    useEffect(() => {
        if (!spacesLoading && !existingAvailable && selection.mode === "existing") {
            setValue("_chatSpaceSelection", { mode: "none" }, { shouldValidate: true });
        }
    }, [spacesLoading, existingAvailable, selection.mode, setValue]);

    const scope: ChatSpaceScope = selection.mode === "new" ? selection.scope : "contract";

    function suggestion(forScope: ChatSpaceScope): string {
        return forScope === "project" ? suggestChatSpaceName(project?.ourId, project?.alias, project?.name) : "";
    }

    function write(next: ChatSpaceSelectionValue) {
        setValue("_chatSpaceSelection", next, { shouldValidate: true });
    }

    function writeNew(nextScope: ChatSpaceScope, name: string | null) {
        const trimmed = (name ?? "").trim();
        write({
            mode: "new",
            scope: nextScope,
            displayName: trimmed ? trimmed.slice(0, CHAT_SPACE_NAME_MAX) : undefined,
        });
    }

    function chooseMode(mode: ChatSpaceSelectionValue["mode"]) {
        if (mode === "none") return write({ mode: "none" });
        if (mode === "new") return writeNew(scope, typedName);
        write({ mode: "existing", chatSpaceId: spaces?.[0]?.id ?? 0 });
    }

    function changeName(value: string) {
        setTypedName(value);
        writeNew(scope, value);
    }

    const shownName = typedName ?? suggestion(scope);
    const placeholder =
        scope === "contract"
            ? `Domyślnie: oznaczenie kontraktu (nadane przy zapisie) ${suggestChatSpaceName("", contractAlias, contractName)}`.trim()
            : "Nazwa pokoju";

    return (
        <Form.Group className="mt-3" controlId="_chatSpaceSelection" data-testid="chat-space-selection">
            <Form.Label>Pokój Google Chat</Form.Label>
            <div>
                <Form.Check
                    type="radio"
                    inline
                    name="chatSpaceMode"
                    id="chatSpaceMode-new"
                    label="Nowy pokój"
                    checked={selection.mode === "new"}
                    onChange={() => chooseMode("new")}
                />
                {existingAvailable && (
                    <Form.Check
                        type="radio"
                        inline
                        name="chatSpaceMode"
                        id="chatSpaceMode-existing"
                        label="Istniejący pokój"
                        checked={selection.mode === "existing"}
                        onChange={() => chooseMode("existing")}
                    />
                )}
                <Form.Check
                    type="radio"
                    inline
                    name="chatSpaceMode"
                    id="chatSpaceMode-none"
                    label="Bez pokoju"
                    checked={selection.mode === "none"}
                    onChange={() => chooseMode("none")}
                />
            </div>

            {selection.mode === "new" && (
                <div className="mt-2" data-testid="chat-space-new">
                    <div>
                        <Form.Check
                            type="radio"
                            inline
                            name="chatSpaceScope"
                            id="chatSpaceScope-contract"
                            label="Dla kontraktu"
                            checked={scope === "contract"}
                            onChange={() => writeNew("contract", typedName)}
                        />
                        <Form.Check
                            type="radio"
                            inline
                            name="chatSpaceScope"
                            id="chatSpaceScope-project"
                            label="Dla projektu"
                            checked={scope === "project"}
                            onChange={() => writeNew("project", typedName)}
                        />
                    </div>
                    <Form.Label className="mt-2" htmlFor="chatSpaceName">
                        Nazwa pokoju
                    </Form.Label>
                    <Form.Control
                        id="chatSpaceName"
                        type="text"
                        maxLength={CHAT_SPACE_NAME_MAX}
                        value={shownName}
                        placeholder={placeholder}
                        onChange={(e) => changeName(e.target.value)}
                    />
                    <div className="text-muted small mt-1">
                        Pokój powstanie po zapisie kontraktu; zaproszeni zostaną koordynator, administrator i Ty.
                    </div>
                </div>
            )}

            {selection.mode === "existing" && (
                <div className="mt-2" data-testid="chat-space-existing">
                    {spacesLoading ? (
                        <div className="text-muted small d-flex align-items-center gap-1">
                            <Spinner animation="border" size="sm" />
                            <span>Wczytuję pokoje…</span>
                        </div>
                    ) : (
                        <Form.Select
                            aria-label="Istniejący pokój"
                            value={selection.chatSpaceId}
                            onChange={(e) => write({ mode: "existing", chatSpaceId: Number(e.target.value) })}
                        >
                            {(spaces ?? []).map((space) => (
                                <option key={space.id} value={space.id}>
                                    {space.displayName}
                                </option>
                            ))}
                        </Form.Select>
                    )}
                </div>
            )}
        </Form.Group>
    );
}
