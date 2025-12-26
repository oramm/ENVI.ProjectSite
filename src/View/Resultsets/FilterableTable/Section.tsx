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
 * @param SectionNode.title - tytuł sekcji (JSX)
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
    isDeletable?: boolean;
    editHandler?: (node: SectionNode<LeafDataItemType>) => void;
    shouldRetrieveDataBeforeEdit?: boolean;
    specialRetrieveActionRoute?: string;
    selectedObjectRoute?: string;
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
    const { activeSectionId, sections, globalExpandTrigger } = useFilterableTableContext<DataItemType>();
    const [isActive, setIsActive] = useState(activeSectionId === sectionNode.id);
    const [activeKey, setActiveKey] = useState<string[]>(["0"]);
    const [localExpandTrigger, setLocalExpandTrigger] = useState<ExpandTrigger>(null);

    useEffect(() => {
        setIsActive(activeSectionId === sectionNode.id);
    }, [activeSectionId, sectionNode.id, sections]);

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

    useEffect(() => {
        // Local trigger: COLLAPSE zwija tylko dzieci (bez bieżącej sekcji), EXPAND rozwija siebie i dzieci
        if (localExpandTrigger?.action === "EXPAND") {
            setActiveKey(["0"]);
        }
    }, [localExpandTrigger]);

    return sectionNode.isInAccordion ? (
        <Accordion
            className="mb-2"
            key={sectionNode.id}
            alwaysOpen
            activeKey={activeKey}
            onSelect={(e) => setActiveKey(e as string[])}
        >
            <Accordion.Item eventKey="0">
                <Accordion.Header>
                    <SectionHeader
                        sectionNode={sectionNode}
                        isActive={isActive}
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
        <>
            <SectionHeader
                sectionNode={sectionNode}
                isActive={isActive}
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
        </>
    );
}
type SectionHeaderProps<DataItemType extends RepositoryDataItem> = {
    sectionNode: SectionNode<DataItemType>;
    onClick: (sectionNode: SectionNode<DataItemType>) => void;
    isActive: boolean;
    localExpandTrigger: ExpandTrigger;
    setLocalExpandTrigger: React.Dispatch<React.SetStateAction<ExpandTrigger>>;
};

function SectionHeader<DataItemType extends RepositoryDataItem>({
    sectionNode,
    onClick,
    isActive,
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
    const headerStyle = {
        backgroundColor: "aliceblue",
        borderRadius: "0.25rem",
    };
    return (
        <div
            className="d-flex justify-content-between align-items-center flex-wrap w-100 px-2 py-1 mb-2"
            style={!sectionNode.isInAccordion ? headerStyle : undefined}
            onClick={() => onClick(sectionNode)}
            onDoubleClick={() => {
                if (!selectedObjectRoute) return;
                const target = buildDetailsPath(selectedObjectRoute, dataItem.id);
                if (target) navigate(target);
            }}
        >
            <div className="d-flex align-items-center gap-2" style={{ cursor: "pointer" }}>
                <div style={makeTitleStyle()}>{sectionNode.title}</div>
                {(sectionNode.leaves?.length || sectionNode.children.length) > 5 && (
                    <span className="tekst-muted small">
                        [{sectionNode.leaves?.length || sectionNode.children.length} pozycji]
                    </span>
                )}
            </div>

            {isActive && (
                <div className="d-flex align-items-center gap-2 section-action-menu">
                    {sectionNode.children.length > 0 && (
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

function SectionBody<DataItemType extends RepositoryDataItem>({
    sectionNode,
    resulsetTableProps,
    onClick,
    localExpandTrigger,
}: SectionBodyProps<DataItemType>) {
    return (
        <>
            {sectionNode.children.map((childNode, index) => (
                <Section<DataItemType>
                    key={childNode.dataItem.id + childNode.type}
                    sectionNode={childNode}
                    resulsetTableProps={resulsetTableProps}
                    onClick={onClick}
                    childrenExpandTrigger={localExpandTrigger}
                />
            ))}

            {sectionNode.leaves && (
                <ResultSetTable<DataItemType> {...resulsetTableProps} filteredObjects={sectionNode.leaves} />
            )}
        </>
    );
}
