import React, { useEffect, useState } from "react";
import { Alert, Button, Col, Form, Modal, Row, Spinner } from "react-bootstrap";
import {
    TypesTreeCaseType,
    TypesTreeData,
    TypesTreeMilestoneType,
    milestoneTypesForContractType,
} from "./typesTreeModel";

export type AddTypeKind = "milestoneType" | "caseType";

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
    const [wasSubmitted, setWasSubmitted] = useState(false);

    const isEditing = !!editTarget;
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
            return;
        }

        setName("");
        setDescription("");
        setFolderNumber("");
        setIsDefault(false);
        setIsUnique(false);
        setIsSubCaseOnly(false);
        setParentCaseTypeIds([]);
        setMilestoneTypeId(defaultMilestoneTypeId ?? "");
    }, [kind, editTarget, defaultMilestoneTypeId, milestoneEdge?.folderNumber, milestoneEdge?.isDefault]);

    if (!kind && !editTarget) return null;

    const maxFolderLength = isMilestone ? 2 : 8;
    const isNameLocked = !!editTarget && editTarget.entity._isNameLocked;
    const usageCount = editTarget?.entity._usageCount ?? 0;

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
    const hasErrors = !!(nameError || folderError || milestoneError || descriptionError || parentsError);

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

    function handleSubmit() {
        setWasSubmitted(true);
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

    return (
        <Modal show onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title className="fs-5">{`${titleAction} ${titleSubject}`}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
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
                    <Form.Group as={Col} md={8} className="mb-3">
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
                    <Form.Group as={Col} md={4} className="mb-3">
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

                <Form.Check
                    type="switch"
                    label={isMilestone ? "Domyślny dla tego typu umowy" : "Domyślny w kamieniu"}
                    checked={isDefault}
                    onChange={(event) => setIsDefault(event.target.checked)}
                />
                <Form.Check
                    className="mt-2"
                    type="switch"
                    label={isMilestone ? "Unikalny w ramach umowy" : "Unikalny w ramach kamienia"}
                    checked={isUnique}
                    onChange={(event) => setIsUnique(event.target.checked)}
                />
                {!isMilestone && (
                    <>
                        <Form.Check
                            className="mt-2"
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
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={onClose} disabled={isSaving}>
                    Anuluj
                </Button>
                <Button variant="success" onClick={handleSubmit} disabled={isSaving}>
                    {isSaving ? <Spinner animation="border" size="sm" /> : "Zapisz"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
