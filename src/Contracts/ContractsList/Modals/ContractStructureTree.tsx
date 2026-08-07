import React, { useEffect, useRef, useState } from "react";
import { Alert, Button, Form, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronRight, faFolder } from "@fortawesome/free-solid-svg-icons";
import { useFormContext } from "../../../View/Modals/FormContext";
import { UniquenessIcon } from "../../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { fetchContractTemplatesTree } from "./contractTemplatesTreeService";
import {
    ContractTemplatesTree,
    ContractType,
    MilestoneSelectionItem,
    MilestoneTypeTreeNode,
    OptionalContractFolderKey,
} from "../../../../Typings/bussinesTypes";

/**
 * Drzewo struktury tworzonej razem z umową: kamienie milowe -> sprawy, plus
 * osobna sekcja folderów na Dysku niebędących sprawami.
 *
 * Pozycją drzewa jest TYP, nie szablon — dzięki temu widać cały słownik
 * dostępny dla typu umowy, a nie tylko pozycje mające szablon. Zaznaczone
 * startowo jest dokładnie to, co powstaje dziś automatycznie; regułę liczy
 * serwer (isCheckedByDefault) i nie wolno jej tu odtwarzać.
 *
 * Renderowany tylko przy dodawaniu umowy.
 */

/** Dopiski, których serwer nie musi znać — to czysto UI-owa podpowiedź. */
const FOLDER_HINTS: Partial<Record<OptionalContractFolderKey, string>> = {
    MEETING_PROTOCOLS: "Jeśli nie utworzysz teraz, folder powstanie sam przy pierwszej notatce ze spotkania.",
};

/** Kamienie milowe wyróżnione rozmiarem — sprawy zostają w rozmiarze bazowym. */
const MILESTONE_LABEL_STYLE: React.CSSProperties = { fontSize: "1.0625rem" };

/**
 * Wiersz z checkboxem — wspólny dla kamieni, spraw i folderów.
 * Rodzaju pozycji nie oznaczamy ikoną: kamienie od spraw odróżnia wcięcie
 * i rozmiar tekstu, a foldery są w osobnej sekcji. Ikona zostaje tylko tam,
 * gdzie niesie treść, czyli przy folderach na Dysku.
 */
function CheckRow({
    id,
    checked,
    muted,
    icon,
    labelClassName = "",
    labelStyle,
    onChange,
    children,
}: {
    id: string;
    checked: boolean;
    muted?: boolean;
    icon?: typeof faFolder;
    labelClassName?: string;
    labelStyle?: React.CSSProperties;
    onChange: (checked: boolean) => void;
    children: React.ReactNode;
}) {
    return (
        <div className="d-flex align-items-start">
            {icon && (
                <span
                    className="text-muted me-2"
                    style={{ width: "1.1rem", display: "inline-block", textAlign: "center" }}
                >
                    <FontAwesomeIcon icon={icon} title="folder na Dysku" size="sm" />
                </span>
            )}
            <Form.Check type="checkbox" id={id}>
                <Form.Check.Input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
                <Form.Check.Label className={`${muted ? "text-muted" : ""} ${labelClassName}`.trim()} style={labelStyle}>
                    {children}
                </Form.Check.Label>
            </Form.Check>
        </div>
    );
}

/** Etykieta typu: numer folderu, nazwa typu, ikona unikalności, nazwa szablonu pod spodem. */
function TypeLabel({
    folderNumber,
    typeName,
    isUnique,
    templateName,
}: {
    folderNumber: string;
    typeName: string;
    isUnique: boolean;
    templateName: string;
}) {
    return (
        <>
            {folderNumber} {typeName}
            <UniquenessIcon isUnique={isUnique} />
            {templateName && <div className="text-muted small">{templateName}</div>}
        </>
    );
}

export function ContractStructureTree() {
    const {
        setValue,
        watch,
        formState: { errors },
    } = useFormContext();

    const contractTypeId = (watch("_type") as ContractType | undefined)?.id;
    const selection = (watch("_milestonesSelection") as MilestoneSelectionItem[] | undefined) ?? [];
    const selectedFolders = (watch("_contractFoldersSelection") as OptionalContractFolderKey[] | undefined) ?? [];

    const [tree, setTree] = useState<ContractTemplatesTree | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<Set<number>>(new Set());
    const [reloadToken, setReloadToken] = useState(0);

    // Pamięć spraw odznaczonych razem z kamieniem: ponowne zaznaczenie kamienia
    // przywraca to, co użytkownik miał, a nie zestaw domyślny. Ref, nie state —
    // nie ma powodować re-renderu. GeneralModalContent montuje się od nowa przy
    // każdym otwarciu modala, więc pamięć resetuje się per sesja formularza.
    const rememberedCasesRef = useRef<Map<number, number[]>>(new Map());
    // Drzewo per typ umowy — przełączanie typu tam i z powrotem nie odpytuje serwera.
    const cacheRef = useRef<Map<number, ContractTemplatesTree>>(new Map());

    function writeSelection(next: MilestoneSelectionItem[]) {
        setValue("_milestonesSelection", next, { shouldValidate: true });
    }

    useEffect(() => {
        if (!contractTypeId) {
            setTree(null);
            setErrorMessage(null);
            setExpanded(new Set());
            writeSelection([]);
            setValue("_contractFoldersSelection", []);
            return;
        }

        const applyTree = (loaded: ContractTemplatesTree) => {
            setTree(loaded);
            setErrorMessage(null);
            setExpanded(new Set());
            rememberedCasesRef.current = new Map();
            writeSelection(
                loaded.milestoneTypes
                    .filter((node) => node.isCheckedByDefault)
                    .map((node) => ({
                        milestoneTypeId: node.milestoneTypeId,
                        caseTypeIds: node.caseTypes
                            .filter((caseType) => caseType.isCheckedByDefault)
                            .map((caseType) => caseType.caseTypeId),
                    })),
            );
            setValue(
                "_contractFoldersSelection",
                loaded.optionalFolders.filter((folder) => folder.isDefault).map((folder) => folder.key),
            );
            setValue("_contractStructureTreeUnavailable", false, { shouldValidate: true });
        };

        const cached = cacheRef.current.get(contractTypeId);
        if (cached) {
            applyTree(cached);
            return;
        }

        let cancelled = false;
        setTree(null);
        setErrorMessage(null);

        fetchContractTemplatesTree(contractTypeId)
            .then((loaded) => {
                if (cancelled) return;
                cacheRef.current.set(contractTypeId, loaded);
                applyTree(loaded);
            })
            .catch((err: unknown) => {
                if (cancelled) return;
                setErrorMessage(err instanceof Error ? err.message : "Nieznany błąd");
            });

        return () => {
            cancelled = true;
        };
    }, [contractTypeId, reloadToken, setValue]);

    function toggleExpanded(milestoneTypeId: number) {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(milestoneTypeId)) next.delete(milestoneTypeId);
            else next.add(milestoneTypeId);
            return next;
        });
    }

    function toggleMilestone(node: MilestoneTypeTreeNode, checked: boolean) {
        if (checked) {
            const remembered = rememberedCasesRef.current.get(node.milestoneTypeId);
            const caseTypeIds =
                remembered ??
                node.caseTypes.filter((caseType) => caseType.isCheckedByDefault).map((caseType) => caseType.caseTypeId);
            writeSelection([...selection, { milestoneTypeId: node.milestoneTypeId, caseTypeIds }]);
            // Zaznaczenie rozwija, żeby od razu było widać, co powstanie w środku
            setExpanded((prev) => new Set(prev).add(node.milestoneTypeId));
            return;
        }

        const current = selection.find((item) => item.milestoneTypeId === node.milestoneTypeId);
        if (current) rememberedCasesRef.current.set(node.milestoneTypeId, current.caseTypeIds);
        writeSelection(selection.filter((item) => item.milestoneTypeId !== node.milestoneTypeId));
    }

    function toggleCase(node: MilestoneTypeTreeNode, caseTypeId: number, checked: boolean) {
        const current = selection.find((item) => item.milestoneTypeId === node.milestoneTypeId);

        if (!current) {
            // Sprawa w niezaznaczonym kamieniu zaznacza też kamień, ale bierze
            // WYŁĄCZNIE wskazaną sprawę — użytkownik wskazał konkretną pozycję.
            if (!checked) return;
            writeSelection([...selection, { milestoneTypeId: node.milestoneTypeId, caseTypeIds: [caseTypeId] }]);
            return;
        }

        const caseTypeIds = checked
            ? [...current.caseTypeIds, caseTypeId]
            : current.caseTypeIds.filter((id) => id !== caseTypeId);

        writeSelection(
            selection.map((item) => (item.milestoneTypeId === node.milestoneTypeId ? { ...item, caseTypeIds } : item)),
        );
    }

    function toggleFolder(key: OptionalContractFolderKey, checked: boolean) {
        setValue(
            "_contractFoldersSelection",
            checked ? [...selectedFolders, key] : selectedFolders.filter((item) => item !== key),
        );
    }

    /** Awaryjne wyjście: bez tego awaria endpointu zablokowałaby rejestrację umów. */
    function skipTree() {
        setValue("_contractStructureTreeUnavailable", true);
        setValue("_milestonesSelection", undefined, { shouldValidate: true });
        setValue("_contractFoldersSelection", undefined);
    }

    if (!contractTypeId)
        return (
            <div className="text-muted small mt-3" data-testid="structure-tree-no-type">
                Najpierw wybierz typ umowy — pojawi się lista kamieni milowych i spraw do utworzenia.
            </div>
        );

    if (errorMessage)
        return (
            <Alert variant="warning" className="mt-3" data-testid="structure-tree-error">
                Nie udało się wczytać struktury umowy: {errorMessage}
                <div className="mt-2 d-flex gap-2">
                    <Button size="sm" variant="outline-secondary" onClick={() => setReloadToken((t) => t + 1)}>
                        Ponów
                    </Button>
                    <Button size="sm" variant="outline-secondary" onClick={skipTree}>
                        Utwórz domyślną strukturę
                    </Button>
                </div>
            </Alert>
        );

    if (!tree)
        return (
            <div className="mt-3 text-muted small d-flex align-items-center gap-1" data-testid="structure-tree-loading">
                <Spinner animation="border" size="sm" />
                <span>Wczytuję strukturę umowy…</span>
            </div>
        );

    return (
        <>
            <Form.Group className="mt-3" controlId="_milestonesSelection">
                <Form.Label>Kamienie milowe i sprawy do utworzenia</Form.Label>
                {/* MilestonesController.createFolders tworzy podfoldery przez
                    CaseTypeRepository.findByMilestoneType, które nie filtruje ani
                    po IsDefault, ani po IsSubCaseOnly - folder powstaje dla
                    KAŻDEGO typu spraw kamienia. */}
                <div className="text-muted small mb-2" data-testid="structure-tree-folders-note">
                    Zaznaczenie kamienia zakłada na Dysku podfoldery wszystkich jego typów spraw, także
                    tych niezaznaczonych. Odznaczenie sprawy pomija samą sprawę - folder i tak będzie czekał pusty.
                </div>
                <div data-testid="structure-tree">
                    {tree.milestoneTypes.map((node) => {
                        const current = selection.find((item) => item.milestoneTypeId === node.milestoneTypeId);
                        const selectedCaseIds = current?.caseTypeIds ?? [];
                        const isExpanded = expanded.has(node.milestoneTypeId);

                        return (
                            <div key={node.milestoneTypeId}>
                                <div className="d-flex align-items-start">
                                    <Button
                                        variant="link"
                                        size="sm"
                                        className="p-0 me-1 text-muted"
                                        style={{
                                            width: "1.2rem",
                                            visibility: node.caseTypes.length ? "visible" : "hidden",
                                        }}
                                        onClick={() => toggleExpanded(node.milestoneTypeId)}
                                        aria-label={isExpanded ? "Zwiń" : "Rozwiń"}
                                        aria-expanded={isExpanded}
                                        type="button"
                                    >
                                        <FontAwesomeIcon icon={isExpanded ? faChevronDown : faChevronRight} size="sm" />
                                    </Button>
                                    <CheckRow
                                        id={`milestoneType-${node.milestoneTypeId}`}
                                        checked={!!current}
                                        muted={!node.hasTemplate}
                                        labelClassName="fw-semibold"
                                        labelStyle={MILESTONE_LABEL_STYLE}
                                        onChange={(checked) => toggleMilestone(node, checked)}
                                    >
                                        <TypeLabel
                                            folderNumber={node.folderNumber}
                                            typeName={node.typeName}
                                            isUnique={node.isUniquePerContract}
                                            templateName={node.templateName}
                                        />
                                    </CheckRow>
                                </div>

                                {isExpanded && (
                                    <div className="ms-4 ps-3">
                                        {node.caseTypes.map((caseType) => (
                                            <CheckRow
                                                key={caseType.caseTypeId}
                                                id={`caseType-${caseType.caseTypeId}`}
                                                checked={selectedCaseIds.includes(caseType.caseTypeId)}
                                                muted={!caseType.hasTemplate}
                                                onChange={(checked) => toggleCase(node, caseType.caseTypeId, checked)}
                                            >
                                                <TypeLabel
                                                    folderNumber={caseType.folderNumber}
                                                    typeName={caseType.typeName}
                                                    isUnique={caseType.isUniquePerMilestone}
                                                    templateName={caseType.templateName}
                                                />
                                            </CheckRow>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                {errors._milestonesSelection && (
                    <div className="small text-danger mt-1" data-testid="structure-tree-error-message">
                        {errors._milestonesSelection.message as string}
                    </div>
                )}
            </Form.Group>

            <Form.Group className="mt-3">
                <Form.Label>Dodatkowe foldery na Dysku</Form.Label>
                <div data-testid="optional-folders">
                    {tree.optionalFolders.map((folder) => (
                        <div key={folder.key}>
                            <CheckRow
                                icon={faFolder}
                                id={`folder-${folder.key}`}
                                checked={selectedFolders.includes(folder.key)}
                                onChange={(checked) => toggleFolder(folder.key, checked)}
                            >
                                {folder.name}
                            </CheckRow>
                            {FOLDER_HINTS[folder.key] && (
                                <div className="text-muted small ms-4 ps-2">{FOLDER_HINTS[folder.key]}</div>
                            )}
                        </div>
                    ))}
                </div>
            </Form.Group>
        </>
    );
}
