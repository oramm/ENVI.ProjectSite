import React, { useEffect, useState } from "react";
import { Accordion } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { RepositoryDataItem } from "../../../../Typings/bussinesTypes";
import RepositoryReact from "../../../React/RepositoryReact";
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from "../../Modals/ModalsTypes";
import "./FilterableTable.css";
import { useFilterableTableContext } from "./FilterableTableContext";
import { RowActionMenu } from "./FilterableTableRow";
import { ResultSetTable, ResultSetTableProps } from "./ResultSetTable";
import { ExpandTrigger, ToggleExpandButton } from "./ToggleExpandButton";
import { buildDetailsPath } from "../../../React/Tools/ToolsRouting";

/** Struktura danych sekcji (poziomu) - element Props dla komponentu Section
 * @param SectionNode.repository - repozytorium z danymi
 * @param SectionNode.dataItem - obiekt z danymi sekcji
 * @param SectionNode.title - tytuł sekcji (JSX) - może zawierać dedykowane style CSS
 */
export type SectionNode<LeafDataItemType extends RepositoryDataItem> = {
    id: string;
    level: number;
    type: string;
    childrenNodesType?: string;
    repository: RepositoryReact;
    dataItem: RepositoryDataItem;
    title: JSX.Element;
    children: SectionNode<LeafDataItemType>[];
    EditButtonComponent?: React.ComponentType<SpecificEditModalButtonProps<RepositoryDataItem>>;
    AddNewButtonComponent?: React.ComponentType<SpecificAddNewModalButtonProps<RepositoryDataItem>>;
    leaves?: LeafDataItemType[];
    isInAccordion?: boolean;
    /** Kontroluje stan akordeonu przy montowaniu — domyślnie true (rozwinięty) */
    initialExpanded?: boolean;
    isDeletable?: boolean;
    editHandler?: (node: SectionNode<LeafDataItemType>) => void;
    shouldRetrieveDataBeforeEdit?: boolean;
    specialRetrieveActionRoute?: string;
    selectedObjectRoute?: string;
    borderColor?: string;
};

export type SectionProps<DataItemType extends RepositoryDataItem> = {
    sectionNode: SectionNode<DataItemType>;
    resulsetTableProps: ResultSetTableProps<DataItemType>;
    onClick: (sectionNode: SectionNode<DataItemType>) => void;
    childrenExpandTrigger?: ExpandTrigger;
};

export function Section<DataItemType extends RepositoryDataItem>({
    sectionNode,
    resulsetTableProps,
    onClick,
    childrenExpandTrigger,
}: SectionProps<DataItemType>) {
    const { activePathSet, editingSectionId, sections, globalExpandTrigger } =
        useFilterableTableContext<DataItemType>();
    // Tło: czy sekcja jest na ścieżce od korzenia do aktywnej
    const isOnActivePath = activePathSet.has(sectionNode.id);
    // Menu: czy to jest aktualnie edytowana sekcja
    const isEditing = editingSectionId === sectionNode.id;
    const [activeKey, setActiveKey] = useState<string[]>(sectionNode.initialExpanded !== false ? ["0"] : []);
    const [localExpandTrigger, setLocalExpandTrigger] = useState<ExpandTrigger>(null);

    useEffect(() => {
        if (globalExpandTrigger?.action === "COLLAPSE") {
            setActiveKey([]);
        } else if (globalExpandTrigger?.action === "EXPAND") {
            setActiveKey(["0"]);
        }
    }, [globalExpandTrigger]);

    useEffect(() => {
        if (childrenExpandTrigger?.action === "COLLAPSE") {
            setActiveKey([]);
        } else if (childrenExpandTrigger?.action === "EXPAND") {
            setActiveKey(["0"]);
        }
    }, [childrenExpandTrigger]);

    // Obliczanie klas dla kontenera Accordion (karta vs zwykły)
    const hasCustomBorder = !!sectionNode.borderColor;
    const accordionClassName = hasCustomBorder ? "mb-4 section-accordion section-card" : "mb-2 section-accordion";

    return sectionNode.isInAccordion ? (
        <Accordion
            id={sectionNode.id}
            className={accordionClassName}
            style={hasCustomBorder ? { borderLeftColor: sectionNode.borderColor } : undefined}
            key={sectionNode.id}
            alwaysOpen
            activeKey={activeKey}
            onSelect={(e) => setActiveKey(e as string[])}
        >
            <Accordion.Item eventKey="0">
                <Accordion.Header>
                    <SectionHeader
                        sectionNode={sectionNode}
                        isOnActivePath={isOnActivePath}
                        isEditing={isEditing}
                        onClick={onClick}
                        localExpandTrigger={localExpandTrigger}
                        setLocalExpandTrigger={setLocalExpandTrigger}
                    />
                </Accordion.Header>
                <Accordion.Body>
                    <SectionBody
                        resulsetTableProps={resulsetTableProps}
                        sectionNode={sectionNode}
                        onClick={onClick}
                        localExpandTrigger={localExpandTrigger}
                    />
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
    ) : (
        <div id={sectionNode.id}>
            <SectionHeader
                sectionNode={sectionNode}
                isOnActivePath={isOnActivePath}
                isEditing={isEditing}
                onClick={onClick}
                localExpandTrigger={localExpandTrigger}
                setLocalExpandTrigger={setLocalExpandTrigger}
            />
            <SectionBody
                resulsetTableProps={resulsetTableProps}
                sectionNode={sectionNode}
                onClick={onClick}
                localExpandTrigger={localExpandTrigger}
            />
        </div>
    );
}
type SectionHeaderProps<DataItemType extends RepositoryDataItem> = {
    sectionNode: SectionNode<DataItemType>;
    onClick: (sectionNode: SectionNode<DataItemType>) => void;
    /** Czy sekcja jest na ścieżce od korzenia do aktywnej (dla tła) */
    isOnActivePath: boolean;
    /** Czy to jest aktualnie edytowana sekcja (dla menu) */
    isEditing: boolean;
    localExpandTrigger: ExpandTrigger;
    setLocalExpandTrigger: React.Dispatch<React.SetStateAction<ExpandTrigger>>;
};

function SectionHeader<DataItemType extends RepositoryDataItem>({
    sectionNode,
    onClick,
    isOnActivePath,
    isEditing,
    localExpandTrigger,
    setLocalExpandTrigger,
}: SectionHeaderProps<DataItemType>) {
    const navigate = useNavigate();
    const { handleDeleteSection, handleEditSection, handleAddSection } = useFilterableTableContext<DataItemType>();
    const { selectedObjectRoute, dataItem } = sectionNode;

    function makeTitleStyle() {
        const nodeLevel = sectionNode.level;
        return {
            fontSize: nodeLevel === 1 ? "1.5rem" : "1rem",
            fontWeight: 600 - nodeLevel * 100,
            color: `rgb(50, 130, 50)`,
            textTransform: "none" as const,
        };
    }

    const hasCustomBorder = !!sectionNode.borderColor;
    const isAccordionChild = !!sectionNode.isInAccordion;

    // Base classes
    let computedClassName = `
        d-flex
        flex-column flex-md-row
        justify-content-md-between
        align-items-start align-items-md-center
        w-100
        transition-base
        section-header
    `;

    // Apply specific variants
    if (hasCustomBorder) {
        // "Card Header" style - clean, large padding, transparent base
        computedClassName += " p-3";
    } else {
        // "Default Header" style - smaller padding
        computedClassName += " px-2 py-1 rounded";
    }

    // Active & Hover states (Colors)
    // Tło: podświetlone dla wszystkich sekcji na ścieżce od korzenia
    if (isOnActivePath) {
        computedClassName += " state-active";
    } else {
        computedClassName += " state-hover";
    }

    return (
        <div
            className={computedClassName}
            onClick={() => onClick(sectionNode)}
            onDoubleClick={() => {
                if (!selectedObjectRoute) return;
                const target = buildDetailsPath(selectedObjectRoute, dataItem.id);
                if (target) navigate(target);
            }}
        >
            {/* LEWA STRONA – TITLE */}
            <div
                className="
                            d-flex
                            align-items-center
                            gap-2
                            flex-grow-1
                            min-w-0
                        "
                style={{ cursor: "pointer" }}
            >
                <div style={makeTitleStyle()} className="flex-grow-1 text-break">
                    {sectionNode.title}
                </div>

                {(sectionNode.leaves?.length || sectionNode.children.length) > 5 && (
                    <span className="text-muted small flex-shrink-0">
                        [{sectionNode.leaves?.length || sectionNode.children.length} pozycji]
                    </span>
                )}
            </div>

            {/* PRAWA STRONA – MENU (tylko dla aktualnie edytowanej sekcji) */}
            {isEditing && (
                <div
                    className="
                                d-flex
                                align-items-center
                                gap-2
                                
                                flex-shrink-0
                                mt-2 mt-md-0
                            "
                >
                    {sectionNode.children.length > 0 && sectionNode.type !== "casetype" && (
                        <ToggleExpandButton
                            expandTrigger={localExpandTrigger}
                            setExpandTrigger={setLocalExpandTrigger}
                            collapseTitle="Zwiń dzieci"
                            expandTitle="Rozwiń dzieci"
                            stopPropagation
                        />
                    )}

                    <RowActionMenu
                        dataObject={sectionNode.dataItem}
                        isDeletable={!!sectionNode.isDeletable}
                        EditButtonComponent={sectionNode.EditButtonComponent}
                        handleEditObject={handleEditSection}
                        handleDeleteObject={handleDeleteSection}
                        shouldRetrieveDataBeforeEdit={sectionNode.shouldRetrieveDataBeforeEdit}
                        specialRetrieveActionRoute={sectionNode.specialRetrieveActionRoute}
                        layout="horizontal"
                        sectionRepository={sectionNode.repository}
                    />

                    {sectionNode.AddNewButtonComponent && (
                        <sectionNode.AddNewButtonComponent
                            modalProps={{
                                onAddNew: handleAddSection,
                                contextData: sectionNode.dataItem,
                            }}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

type SectionBodyProps<DataItemType extends RepositoryDataItem> = SectionProps<DataItemType> & {
    localExpandTrigger: ExpandTrigger;
};

// Jeśli karta (border), padding w body musi być dopasowany do stylistyki
function SectionBody<DataItemType extends RepositoryDataItem>({
    sectionNode,
    resulsetTableProps,
    onClick,
    localExpandTrigger,
}: SectionBodyProps<DataItemType>) {
    const hasCustomBorder = !!sectionNode.borderColor;

    // KONTRAKTY (Karty): Padding ramki dla całej zawartości
    const cardContentStyle: React.CSSProperties = hasCustomBorder ? { padding: "0 1rem 1rem 1rem" } : {};

    // ZAGNIEŻDŻONE SEKCJE: Wcięcie (indentation) TYLKO dla dzieci (nested sections), NIE dla liści (tabeli tasków)
    // Dla sekcji niebędących akordeоnem (np. podsprawy w przypadku spraw z podsprawami) dodajemy
    // marginTop, żeby oddzielić blok dzieci od nagłówka rodzica bez zależności od stanu expand/collapse.
    const indentationStyle: React.CSSProperties = !hasCustomBorder
        ? { paddingLeft: "1.5rem", ...(!sectionNode.isInAccordion ? { marginTop: "0.5rem" } : {}) }
        : {};

    return (
        <div style={cardContentStyle}>
            {/* Liście (Tabela) - BEZ wcięcia (indentation), ale ewentualnie z paddingiem karty.*/}
            {sectionNode.leaves && (
                <div className="mt-2">
                    <ResultSetTable<DataItemType>
                        {...resulsetTableProps}
                        filteredObjects={sectionNode.leaves}
                        parentSectionId={sectionNode.id}
                    />
                </div>
            )}
            {sectionNode.children.length > 0 && (
                <div style={indentationStyle}>
                    {sectionNode.children.map((childNode, index) => (
                        <Section<DataItemType>
                            key={childNode.id}
                            sectionNode={childNode}
                            resulsetTableProps={resulsetTableProps}
                            onClick={onClick}
                            childrenExpandTrigger={localExpandTrigger}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
