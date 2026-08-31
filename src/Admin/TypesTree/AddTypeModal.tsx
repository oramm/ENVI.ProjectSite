import React, { useEffect, useState } from "react";
import { Alert, Button, Col, Form, Modal, Offcanvas, Row, Spinner } from "react-bootstrap";
import {
    TypesTreeCaseType,
    TypesTreeData,
    TypesTreeMilestoneType,
    milestoneTypesForContractType,
} from "./typesTreeModel";

/**
 * Szerokość panelu bocznego. Ta sama liczba zwęża obszar drzewa w `TypesTreeView`,
 * żeby drzewo przeliczyło się na węższe miejsce, zamiast schować się pod panelem.
 *
 * 420 px to szerokość panelu `InlineCreateDrawer` - jedynego drugiego panelu bocznego
 * z formularzem w tej aplikacji. Jedna liczba dla obu, żeby panele nie różniły się
 * bez powodu (decyzja ownera 2026-08-24).
 */
export const TYPES_PANEL_WIDTH = 420;

/**
 * `attachMilestoneType` to nie dodawanie typu, tylko podpięcie ISTNIEJĄCEGO pod kolejny
 * typ umowy. Ten sam typ kamienia bywa używany przez kilka typów umów i tak ma być.
 * Typów spraw nie podpina się osobno - wiszą pod kamieniem, więc jadą razem z nim.
 */
export type AddTypeKind = "milestoneType" | "caseType" | "attachMilestoneType";

/** Węzeł wskazany do edycji; null oznacza dodawanie nowego. */
export type EditTarget =
    | { kind: "milestoneType"; entity: TypesTreeMilestoneType }
    | { kind: "caseType"; entity: TypesTreeCaseType }
    | null;

/**
 * Dodawanie i edycja typu kamienia milowego albo typu sprawy.
 *
 * Numer folderu przy kamieniu należy do POWIĄZANIA z typem umowy, nie do samego
 * kamienia - dlatego formularz kamienia zawsze pracuje w kontekście wybranego
 * typu umowy i zapisuje oba rekordy naraz.
 *
 * Kamienia przy typie sprawy NIE da się zmienić: przeniesienie typu pod inny
 * kamień zostawiłoby istniejące sprawy przypięte do typu wiszącego gdzie indziej.
 */
export function AddTypeModal({
    kind,
    editTarget,
    data,
    contractTypeId,
    defaultMilestoneTypeId,
    isSaving,
    error,
    onClose,
    onSubmit,
}: {
    kind: AddTypeKind | null;
    editTarget?: EditTarget;
    data: TypesTreeData;
    contractTypeId: number | null;
    defaultMilestoneTypeId?: number | null;
    isSaving: boolean;
    error: string | null;
    onClose: () => void;
    onSubmit: (kind: AddTypeKind, payload: any, editedId?: number) => void;
}) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [folderNumber, setFolderNumber] = useState("");
    const [isDefault, setIsDefault] = useState(false);
    const [isUnique, setIsUnique] = useState(false);
    const [isSubCaseOnly, setIsSubCaseOnly] = useState(false);
    const [parentCaseTypeIds, setParentCaseTypeIds] = useState<number[]>([]);
    const [milestoneTypeId, setMilestoneTypeId] = useState<number | "">("");
    const [templateName, setTemplateName] = useState("");
    const [templateDescription, setTemplateDescription] = useState("");
    const [taskTemplates, setTaskTemplates] = useState<{ name: string; description: string; status: string }[]>([]);
    const [wasSubmitted, setWasSubmitted] = useState(false);

    const isEditing = !!editTarget;
    /** Podpinanie istniejącego typu - własny, krótki formularz zamiast pól typu. */
    const isAttach = !editTarget && kind === "attachMilestoneType";
    const isMilestone = (editTarget ? editTarget.kind : kind) === "milestoneType";

    /** Numer folderu kamienia leży na krawędzi z wybranym typem umowy. */
    const milestoneEdge =
        editTarget?.kind === "milestoneType" && contractTypeId !== null
            ? data.contractTypeMilestoneTypes.find(
                  (edge) =>
                      edge.contractTypeId === contractTypeId &&
                      edge.milestoneTypeId === editTarget.entity.id,
              )
            : undefined;

    useEffect(() => {
        if (!kind && !editTarget) return;
        setWasSubmitted(false);

        if (editTarget?.kind === "milestoneType") {
            const entity = editTarget.entity;
            setName(entity.name);
            setDescription(entity.description ?? "");
            setFolderNumber(milestoneEdge?.folderNumber ?? "");
            setIsDefault(!!milestoneEdge?.isDefault);
            setIsUnique(!!entity.isUniquePerContract);
            setIsSubCaseOnly(false);
            setMilestoneTypeId("");
            setTemplateName(entity._templateName ?? "");
            setTemplateDescription(entity._templateDescription ?? "");
            setTaskTemplates([]);
            return;
        }
        if (editTarget?.kind === "caseType") {
            const entity = editTarget.entity;
            setName(entity.name);
            setDescription(entity.description ?? "");
            setFolderNumber(entity.folderNumber ?? "");
            setIsDefault(!!entity.isDefault);
            setIsUnique(!!entity.isUniquePerMilestone);
            setIsSubCaseOnly(!!entity.isSubCaseOnly);
            setMilestoneTypeId(entity.milestoneTypeId ?? "");
            setParentCaseTypeIds(
                data.subCaseTypeLinks
                    .filter((link) => link.subCaseTypeId === entity.id)
                    .map((link) => link.parentCaseTypeId),
            );
            setTemplateName(entity._templateName ?? "");
            setTemplateDescription(entity._templateDescription ?? "");
            setTaskTemplates((entity._taskTemplates ?? []).map((t) => ({ name: t.name, description: t.description, status: t.status })));
            return;
        }

        setName("");
        setDescription("");
        setFolderNumber("");
        setIsDefault(false);
        setIsUnique(false);
        setIsSubCaseOnly(false);
        setParentCaseTypeIds([]);
        setTemplateName("");
        setTemplateDescription("");
        setTaskTemplates([]);
        setMilestoneTypeId(defaultMilestoneTypeId ?? "");
    }, [kind, editTarget, defaultMilestoneTypeId, milestoneEdge?.folderNumber, milestoneEdge?.isDefault]);

    if (!kind && !editTarget) return null;

    // Numer folderu kamienia to CHAR(2) - także wtedy, gdy podpinamy istniejący typ.
    const maxFolderLength = isMilestone || isAttach ? 2 : 8;
    const isNameLocked = !!editTarget && editTarget.entity._isNameLocked;
    const usageCount = editTarget?.entity._usageCount ?? 0;

    /**
     * Rozjazd, który ISTNIAŁ przed otwarciem okna: pozycja oznaczona jako domyślna,
     * ale bez szablonu, więc mimo flagi nie powstawała. Liczymy ze stanu ZAPISANEGO,
     * nie z pola formularza - inaczej komunikat wyskakiwałby każdemu, kto właśnie
     * zaznacza przełącznik po raz pierwszy.
     */
    const hadTemplateGap = !editTarget
        ? false
        : editTarget.kind === "milestoneType"
          ? !!milestoneEdge?.isDefault && editTarget.entity._templateId === null
          : editTarget.entity.isDefault && editTarget.entity._templateId === null;

    /**
     * Ustawienia tworzenia pokazujemy tylko wtedy, gdy szablon istnieje albo powstanie.
     * W stanie „nie powstaje samo i szablonu nie ma” te pola nie miałyby gdzie trafić,
     * więc ich obecność wprowadzałaby w błąd.
     */
    const showTemplateSection = isDefault || (!!editTarget && editTarget.entity._templateId !== null);

    /** Komunikaty pokazujemy dopiero po próbie zapisu, żeby pusty formularz nie krzyczał. */
    const nameError = name.trim().length === 0 ? "Podaj nazwę." : null;
    const folderError =
        folderNumber.trim().length === 0
            ? "Podaj numer folderu."
            : folderNumber.trim().length > maxFolderLength
              ? `Numer folderu może mieć najwyżej ${maxFolderLength} znaki.`
              : null;
    const milestoneError = !isMilestone && !isEditing && milestoneTypeId === "" ? "Wybierz kamień milowy." : null;
    const descriptionError = description.length > 250 ? "Opis może mieć najwyżej 250 znaków." : null;
    // Typ „wyłącznie podsprawa” bez rodzica byłby niewidoczny w całym systemie:
    // nie pojawia się przy zakładaniu zwykłej sprawy, a bez powiązania nie ma
    // też pod czym wystąpić.
    const parentsError =
        !isMilestone && isSubCaseOnly && parentCaseTypeIds.length === 0
            ? "Wskaż co najmniej jedną sprawę nadrzędną."
            : null;
    const attachError = isAttach && milestoneTypeId === "" ? "Wybierz typ kamienia." : null;
    // Przy podpinaniu nie ma pól typu, więc nie ma czego walidować poza wyborem i numerem.
    const hasErrors = isAttach
        ? !!(attachError || folderError)
        : !!(nameError || folderError || milestoneError || descriptionError || parentsError);

    /** Możliwi rodzice: sprawy z tego samego kamienia, poza samym sobą i innymi podsprawami. */
    const effectiveMilestoneTypeId =
        editTarget?.kind === "caseType"
            ? editTarget.entity.milestoneTypeId
            : milestoneTypeId === ""
              ? null
              : Number(milestoneTypeId);

    const parentOptions: TypesTreeCaseType[] = data.caseTypes.filter(
        (candidate) =>
            candidate.milestoneTypeId === effectiveMilestoneTypeId &&
            !candidate.isSubCaseOnly &&
            candidate.id !== editTarget?.entity.id,
    );

    function toggleParent(id: number) {
        setParentCaseTypeIds((current) =>
            current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
        );
    }

    const milestoneOptions: TypesTreeMilestoneType[] =
        contractTypeId === null
            ? []
            : milestoneTypesForContractType(data, contractTypeId).map((entry) => entry.milestoneType);

    /**
     * Kandydaci do podpięcia: typy kamieni, których ten typ umowy jeszcze nie ma.
     *
     * Bez kamieni ofertowych - te należą do gałęzi ofert, a nie do umów, i kod
     * odwołuje się do nich po numerze. Serwer odrzuca je niezależnie od tej listy.
     */
    const attachOptions: TypesTreeMilestoneType[] =
        contractTypeId === null
            ? []
            : data.milestoneTypes
                  .filter(
                      (type) =>
                          !data.contractTypeMilestoneTypes.some(
                              (edge) =>
                                  edge.contractTypeId === contractTypeId &&
                                  edge.milestoneTypeId === type.id,
                          ) &&
                          !data.offerMilestoneTypes.some(
                              (edge) => edge.milestoneTypeId === type.id,
                          ),
                  )
                  .sort((first, second) => first.name.localeCompare(second.name, "pl"));

    const selectedAttachType =
        milestoneTypeId === ""
            ? undefined
            : data.milestoneTypes.find((type) => type.id === Number(milestoneTypeId));

    function handleSubmit() {
        setWasSubmitted(true);
        if (isAttach) {
            if (hasErrors || contractTypeId === null) return;
            onSubmit("attachMilestoneType", {
                milestoneTypeId: Number(milestoneTypeId),
                contractTypeId,
                // Numer folderu jedzie jako tekst - serwer parsuje wartości ciała
                // żądania i samo "9" dotarłoby tam jako liczba.
                folderNumber: String(folderNumber).trim(),
                isDefault,
            });
            return;
        }
        if (hasErrors || (isMilestone && contractTypeId === null)) return;

        if (isMilestone) {
            onSubmit(
                "milestoneType",
                {
                    name: name.trim(),
                    description: description.trim(),
                    isUniquePerContract: isUnique,
                    isInScrumByDefault: false,
                    contractTypeId,
                    // Numer folderu jedzie jako tekst - serwer parsuje wartości ciała
                    // żądania i samo "9" dotarłoby tam jako liczba.
                    folderNumber: String(folderNumber).trim(),
                    isDefault,
                    templateName: showTemplateSection ? templateName.trim() : "",
                    templateDescription: showTemplateSection ? templateDescription.trim() : "",
                },
                editTarget?.entity.id,
            );
            return;
        }
        onSubmit(
            "caseType",
            {
                milestoneTypeId: milestoneTypeId === "" ? undefined : Number(milestoneTypeId),
                name: name.trim(),
                description: description.trim(),
                folderNumber: String(folderNumber).trim(),
                isDefault,
                isUniquePerMilestone: isUnique,
                isInScrumByDefault: false,
                isSubCaseOnly,
                parentCaseTypeIds,
                templateName: showTemplateSection ? templateName.trim() : "",
                templateDescription: showTemplateSection ? templateDescription.trim() : "",
                taskTemplates: showTemplateSection ? taskTemplates.filter((t) => t.name.trim().length > 0) : [],
            },
            editTarget?.entity.id,
        );
    }

    const contractTypeName = data.contractTypes.find((type) => type.id === contractTypeId)?.name ?? "";
    const milestoneName =
        editTarget?.kind === "caseType"
            ? data.milestoneTypes.find((type) => type.id === editTarget.entity.milestoneTypeId)?.name
            : undefined;

    const titleAction = isEditing ? "Edytuj" : "Dodaj";
    const titleSubject = isMilestone ? "typ kamienia milowego" : "typ sprawy";

    const heading = isAttach
        ? "Podepnij istniejący typ kamienia"
        : `${titleAction} ${titleSubject}`;

    /**
     * W panelu bocznym (352 px) kolumny stojące obok siebie zwężają się do pól,
     * w których nie widać własnego tekstu - tam wszystko idzie jedna pod drugą.
     * W oknie modalnym (szerokie `size="lg"`) zostaje układ dotychczasowy.
     */
    const col = (panel: number, modal: number) => (isEditing ? panel : modal);

    const body = (
        <>
            {error && (
                <Alert variant="danger" className="py-2 small">
                    {error}
                </Alert>
            )}

            {isEditing && usageCount > 0 && (
                <Alert variant="warning" className="py-2 small">
                    Ten typ jest użyty <strong>{usageCount}</strong> raz(y). Zmiana nazwy albo numeru folderu
                    nie przemianuje folderów już istniejących na Dysku - dotyczy tylko tych, które dopiero
                    powstaną.
                </Alert>
            )}

            {isNameLocked && (
                <Alert variant="secondary" className="py-2 small">
                    Nazwa jest zablokowana, bo kod odwołuje się do tego typu wprost. Pozostałe pola można zmieniać.
                </Alert>
            )}

            {isMilestone ? (
                <Alert variant="light" className="py-2 small border">
                    {isEditing ? "Numer folderu dotyczy powiązania z typem umowy " : "Nowy kamień zostanie powiązany z typem umowy "}
                    <strong>{contractTypeName}</strong>.
                </Alert>
            ) : isEditing ? (
                <Form.Group className="mb-3">
                    <Form.Label>Kamień milowy</Form.Label>
                    <Form.Control value={milestoneName ?? "bez kamienia"} disabled />
                    <Form.Text muted>
                        Kamienia nie da się zmienić - istniejące sprawy zostałyby przypięte do typu wiszącego
                        pod innym kamieniem.
                    </Form.Text>
                </Form.Group>
            ) : (
                <Form.Group className="mb-3">
                    <Form.Label>Kamień milowy</Form.Label>
                    <Form.Select
                        value={milestoneTypeId}
                        isInvalid={wasSubmitted && !!milestoneError}
                        onChange={(event) =>
                            setMilestoneTypeId(event.target.value ? Number(event.target.value) : "")
                        }
                    >
                        <option value="">Wybierz kamień</option>
                        {milestoneOptions.map((type) => (
                            <option key={type.id} value={type.id}>
                                {type.name}
                            </option>
                        ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{milestoneError}</Form.Control.Feedback>
                </Form.Group>
            )}

            <Row>
                <Form.Group as={Col} md={col(12, 8)} className="mb-3">
                    <Form.Label>Nazwa</Form.Label>
                    <Form.Control
                        value={name}
                        disabled={isNameLocked}
                        isInvalid={wasSubmitted && !!nameError}
                        onChange={(event) => setName(event.target.value)}
                        autoFocus={!isNameLocked}
                    />
                    <Form.Control.Feedback type="invalid">{nameError}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} md={col(12, 4)} className="mb-3">
                    <Form.Label>Numer folderu</Form.Label>
                    <Form.Control
                        value={folderNumber}
                        maxLength={maxFolderLength}
                        placeholder={isMilestone ? "np. 09" : "np. 04.03"}
                        isInvalid={wasSubmitted && !!folderError}
                        onChange={(event) => setFolderNumber(event.target.value)}
                    />
                    <Form.Control.Feedback type="invalid">{folderError}</Form.Control.Feedback>
                    <Form.Text muted>Maks. {maxFolderLength} znaki.</Form.Text>
                </Form.Group>
            </Row>

            <Form.Group className="mb-3">
                <Form.Label>Opis</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={2}
                    value={description}
                    isInvalid={wasSubmitted && !!descriptionError}
                    onChange={(event) => setDescription(event.target.value)}
                />
                <Form.Control.Feedback type="invalid">{descriptionError}</Form.Control.Feedback>
            </Form.Group>

            {/* Jeden przełącznik zamiast dwóch miejsc konfiguracji: zaznaczenie
                ustawia flagę „domyślny” ORAZ zakłada szablon, bez którego pozycja
                i tak by nie powstała. Odznaczenie szablonu nie kasuje - trzyma
                nazwę, a przy sprawach także zadania startowe. */}
            <Form.Check
                type="switch"
                label="Powstaje automatycznie przy nowej umowie"
                checked={isDefault}
                onChange={(event) => setIsDefault(event.target.checked)}
            />
            {hadTemplateGap && (
                <Form.Text className="text-warning d-block">
                    Dotąd nie powstawało, mimo zaznaczenia - brakowało szablonu. Zapis to naprawi.
                </Form.Text>
            )}

            {!showTemplateSection && (
                <Form.Text muted className="d-block">
                    Zaznacz, żeby ustawić nazwę i {isMilestone ? "opis" : "zadania startowe"} pozycji tworzonej
                    automatycznie.
                </Form.Text>
            )}

            {showTemplateSection && (
            <div className="border rounded p-2 mt-2 mb-2">
                <Form.Group className="mb-2">
                    <Form.Label className="small mb-1">
                        Nazwa {isMilestone ? "tworzonego kamienia" : "tworzonej sprawy"}
                    </Form.Label>
                    <Form.Control
                        size="sm"
                        value={templateName}
                        placeholder="puste = nazwa typu"
                        onChange={(event) => setTemplateName(event.target.value)}
                    />
                </Form.Group>
                {/* Etykieta mówi wprost, czego opis dotyczy - samo „Opis" myliło się
                    z opisem typu wyżej. Pole na całą szerokość i wielowierszowe: w pół
                    kolumny mieściło kilkanaście znaków (uwaga ownera 2026-08-24). */}
                <Form.Group>
                    <Form.Label className="small mb-1">
                        Opis {isMilestone ? "tworzonego kamienia" : "tworzonej sprawy"}
                    </Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={2}
                        size="sm"
                        value={templateDescription}
                        onChange={(event) => setTemplateDescription(event.target.value)}
                    />
                </Form.Group>
                {isMilestone && (
                    <Form.Text muted>
                        Nazwa jest wspólna dla wszystkich typów umów używających tego kamienia - to, czy kamień
                        powstaje, ustawia się osobno dla każdego typu umowy.
                    </Form.Text>
                )}
            </div>
            )}
            <Form.Check
                className="mt-2"
                type="switch"
                label={isMilestone ? "Unikalny w ramach umowy" : "Unikalny w ramach kamienia"}
                checked={isUnique}
                onChange={(event) => setIsUnique(event.target.checked)}
            />
            {!isMilestone && (
                <>
                    {/* Zadania startowe. Do tej pory ta konfiguracja nie miała
                        żadnego interfejsu, choć decyduje o pierwszym kontakcie
                        zespołu z nową sprawą. */}
                    {showTemplateSection && (
                    <div className="mt-2">
                        <Form.Label className="mb-1">Zadania zakładane razem ze sprawą</Form.Label>
                        {taskTemplates.length === 0 && (
                            <div className="text-muted small mb-2">
                                Brak - sprawa powstanie pusta.
                            </div>
                        )}
                        {taskTemplates.map((task, index) => (
                            <Row key={index} className="g-1 mb-1 align-items-start">
                                <Col md={col(12, 4)}>
                                    <Form.Control
                                        size="sm"
                                        placeholder="Nazwa zadania"
                                        value={task.name}
                                        onChange={(event) =>
                                            setTaskTemplates((current) =>
                                                current.map((item, i) =>
                                                    i === index ? { ...item, name: event.target.value } : item,
                                                ),
                                            )
                                        }
                                    />
                                </Col>
                                <Col md={col(12, 4)}>
                                    <Form.Control
                                        size="sm"
                                        placeholder="Opis"
                                        value={task.description}
                                        onChange={(event) =>
                                            setTaskTemplates((current) =>
                                                current.map((item, i) =>
                                                    i === index
                                                        ? { ...item, description: event.target.value }
                                                        : item,
                                                ),
                                            )
                                        }
                                    />
                                </Col>
                                <Col md={col(9, 3)}>
                                    <Form.Select
                                        size="sm"
                                        value={task.status}
                                        onChange={(event) =>
                                            setTaskTemplates((current) =>
                                                current.map((item, i) =>
                                                    i === index ? { ...item, status: event.target.value } : item,
                                                ),
                                            )
                                        }
                                    >
                                        {/* Pusty status backend zamienia przy tworzeniu
                                            zadania na „Nie rozpoczęty”, więc osobna
                                            pozycja o tej samej nazwie byłaby duplikatem. */}
                                        <option value="">Nie rozpoczęty</option>
                                        <option value="Backlog">Backlog</option>
                                    </Form.Select>
                                </Col>
                                <Col md={col(3, 1)}>
                                    <Button
                                        size="sm"
                                        variant="outline-secondary"
                                        className="w-100"
                                        title="Usuń zadanie"
                                        onClick={() =>
                                            setTaskTemplates((current) =>
                                                current.filter((_, i) => i !== index),
                                            )
                                        }
                                    >
                                        &times;
                                    </Button>
                                </Col>
                            </Row>
                        ))}
                        <Button
                            size="sm"
                            variant="outline-success"
                            onClick={() =>
                                setTaskTemplates((current) => [
                                    ...current,
                                    { name: "", description: "", status: "" },
                                ])
                            }
                        >
                            Dodaj zadanie
                        </Button>
                    </div>
                    )}

                    <Form.Check
                        className="mt-3"
                        type="switch"
                        label="Wyłącznie jako podsprawa"
                        checked={isSubCaseOnly}
                        onChange={(event) => setIsSubCaseOnly(event.target.checked)}
                    />
                    <Form.Text muted>Taki typ nie pojawi się przy zakładaniu zwykłej sprawy.</Form.Text>

                    {/* Lista rodziców jest widoczna ZAWSZE, także po odznaczeniu flagi.
                        Powiązania żyją w bazie niezależnie od niej - gdyby lista znikała,
                        nie dałoby się ich wyczyścić, a typ zostawał jednocześnie sprawą
                        i podsprawą. */}
                    <div className="mt-3">
                        <Form.Label className="mb-1">
                            Sprawy nadrzędne{!isSubCaseOnly && " (opcjonalnie)"}
                        </Form.Label>
                        {parentOptions.length === 0 ? (
                            <Alert variant="warning" className="py-2 small mb-0">
                                Ten kamień nie ma jeszcze zwykłych typów spraw, pod które można podpiąć
                                podsprawę. Najpierw dodaj typ sprawy, potem wróć tutaj.
                            </Alert>
                        ) : (
                                <div
                                    className={`border rounded p-2 ${
                                        wasSubmitted && parentsError ? "border-danger" : ""
                                    }`}
                                    style={{ maxHeight: 180, overflowY: "auto" }}
                                >
                                    {parentOptions.map((candidate) => (
                                        <Form.Check
                                            key={candidate.id}
                                            type="checkbox"
                                            id={`parentCaseType-${candidate.id}`}
                                            label={`${candidate.folderNumber ?? ""} ${candidate.name}`.trim()}
                                            checked={parentCaseTypeIds.includes(candidate.id)}
                                            onChange={() => toggleParent(candidate.id)}
                                        />
                                    ))}
                                </div>
                            )}
                        {wasSubmitted && parentsError && (
                            <div className="text-danger small mt-1">{parentsError}</div>
                        )}
                        <Form.Text muted>
                            Ten sam typ może być dopuszczony pod kilkoma sprawami - w drzewie rysujemy go
                            wtedy jako jeden węzeł z kilkoma liniami.
                            {!isSubCaseOnly && parentCaseTypeIds.length > 0 && (
                                <>
                                    {" "}
                                    Ten typ można założyć zarówno jako zwykłą sprawę, jak i jako podsprawę.
                                    Odznacz wszystkie sprawy nadrzędne, żeby został wyłącznie zwykłą sprawą.
                                </>
                            )}
                        </Form.Text>
                    </div>
                </>
            )}
        </>
    );

    /**
     * Formularz podpinania. Krótki celowo: nazwa, opis i pozostałe ustawienia należą
     * do samego typu i są wspólne dla wszystkich typów umów, więc dawanie ich tutaj
     * kusiłoby do zmiany, która uderzyłaby w pozostałe typy umów.
     */
    const attachBody = (
        <>
            {error && (
                <Alert variant="danger" className="py-2 small">
                    {error}
                </Alert>
            )}
            <Alert variant="light" className="py-2 small border">
                Typ zostanie podpięty do typu umowy <strong>{contractTypeName}</strong>. Ustawiasz tu
                tylko to, co należy do powiązania - nazwa i opis zostają takie, jakie typ ma dziś.
            </Alert>
            <Form.Group className="mb-3">
                <Form.Label>Typ kamienia</Form.Label>
                <Form.Select
                    value={milestoneTypeId}
                    isInvalid={wasSubmitted && !!attachError}
                    onChange={(event) =>
                        setMilestoneTypeId(event.target.value === "" ? "" : Number(event.target.value))
                    }
                >
                    <option value="">-- wybierz --</option>
                    {attachOptions.map((type) => (
                        <option key={type.id} value={type.id}>
                            {type.name}
                        </option>
                    ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{attachError}</Form.Control.Feedback>
                <Form.Text muted>
                    Lista pomija typy, które ten typ umowy już ma. Typy spraw jadą razem z kamieniem -
                    osobno się ich nie podpina.
                </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Numer folderu</Form.Label>
                <Form.Control
                    value={folderNumber}
                    isInvalid={wasSubmitted && !!folderError}
                    onChange={(event) => setFolderNumber(event.target.value)}
                />
                <Form.Control.Feedback type="invalid">{folderError}</Form.Control.Feedback>
                <Form.Text muted>
                    Numer należy do tego typu umowy i nie musi być w nim niepowtarzalny - typ
                    wycofywany może zachować swój, a nowy przejąć ten sam.
                </Form.Text>
            </Form.Group>
            <Form.Check
                type="switch"
                label="Powstaje automatycznie przy nowej umowie"
                checked={isDefault}
                onChange={(event) => setIsDefault(event.target.checked)}
            />
            {isDefault && selectedAttachType?._templateId === null && (
                <Alert variant="warning" className="py-2 small mt-2">
                    Ten typ nie ma szablonu kamienia, więc mimo zaznaczenia nic nie powstanie. Szablon
                    dodaje się przy edycji samego typu - i obowiązuje wtedy wszystkie typy umów.
                </Alert>
            )}
        </>
    );

    const buttons = (
        <>
            <Button variant="outline-secondary" onClick={onClose} disabled={isSaving}>
                Anuluj
            </Button>
            <Button variant="success" onClick={handleSubmit} disabled={isSaving}>
                {isSaving ? <Spinner animation="border" size="sm" /> : "Zapisz"}
            </Button>
        </>
    );

    // Edycja typu idzie PANELEM BOCZNYM (decyzja D2 planu): szczegóły widać obok
    // drzewa, a nie zamiast drzewa. `backdrop={false}` i `scroll` zostawiają drzewo
    // widoczne i klikalne, dzięki czemu klik w sąsiedni kafel PODMIENIA treść panelu
    // zamiast go zamykać i otwierać od nowa.
    //
    // Dodawanie („Dodaj kamień milowy", „Dodaj typ sprawy") zostaje oknem modalnym -
    // tam kontekst drzewa nic nie wnosi, a wymuszone domknięcie jest zaletą.
    if (isEditing)
        return (
            <Offcanvas
                show
                onHide={onClose}
                placement="end"
                backdrop={false}
                scroll
                data-testid="types-tree-panel"
                style={{ width: TYPES_PANEL_WIDTH }}
            >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title className="fs-5">{heading}</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    {body}
                    <div className="d-flex justify-content-end gap-2 mt-3">{buttons}</div>
                </Offcanvas.Body>
            </Offcanvas>
        );

    return (
        // Szerzej niż domyślnie: wiersz zadania startowego to nazwa, opis, status
        // i przycisk usuwania - w wąskim oknie zwijają się do nieczytelnych pól.
        //
        // BEZ `centered`: wyśrodkowane w pionie okno przy każdej zmianie wysokości
        // przelicza swoje położenie, więc rozwinięcie ustawień tworzenia przesuwało
        // w górę całą treść i przełącznik uciekał spod kursora. Okno zakotwiczone
        // u góry rośnie tylko w dół, a to, co nad zmianą, zostaje na miejscu.
        <Modal show onHide={onClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title className="fs-5">{heading}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{isAttach ? attachBody : body}</Modal.Body>
            <Modal.Footer>{buttons}</Modal.Footer>
        </Modal>
    );
}
