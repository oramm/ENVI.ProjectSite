import React, { useEffect, useState } from "react";
import { Accordion, Col, Row } from "react-bootstrap";
import { RepositoryDataItem } from "../../../../Typings/bussinesTypes";
import RepositoryReact from "../../../React/RepositoryReact";
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from "../../Modals/ModalsTypes";
import { useFilterableTableContext } from "./FilterableTableContext";
import { RowActionMenu } from "./FilterableTableRow";
import { ResultSetTable, ResultSetTableProps } from "./ResultSetTable";
import "./FilterableTable.css";
import { useNavigate } from "react-router-dom";

/** Struktura danych sekcji (poziomu) - element Props dla komponentu Section
 * @param SectionNode.repository - repozytorium z danymi
 * @param SectionNode.dataItem - obiekt z danymi sekcji
 * @param SectionNode.titleLabel - tytuł sekcji
 */
export type SectionNode<LeafDataItemType extends RepositoryDataItem> = {
    id: string;
    level: number;
    type: string;
    childrenNodesType?: string;
    repository: RepositoryReact;
    dataItem: RepositoryDataItem;
    titleLabel: string;
    children: SectionNode<LeafDataItemType>[];
    EditButtonComponent?: React.ComponentType<SpecificEditModalButtonProps<RepositoryDataItem>>;
    AddNewButtonComponent?: React.ComponentType<SpecificAddNewModalButtonProps<RepositoryDataItem>>;
    leaves?: LeafDataItemType[];
    isInAccordion?: boolean;
    isDeletable?: boolean;
    editHandler?: (node: SectionNode<LeafDataItemType>) => void;
    selectedObjectRoute?: string;
};

export type SectionProps<DataItemType extends RepositoryDataItem> = {
    sectionNode: SectionNode<DataItemType>;
    resulsetTableProps: ResultSetTableProps<DataItemType>;
    onClick: (sectionNode: SectionNode<DataItemType>) => void;
};

export function Section<DataItemType extends RepositoryDataItem>({
    sectionNode,
    resulsetTableProps,
    onClick,
}: SectionProps<DataItemType>) {
    const { activeSectionId } = useFilterableTableContext<DataItemType>();
    const [isActive, setIsActive] = useState(activeSectionId === sectionNode.id);
    const { sections } = useFilterableTableContext<DataItemType>();
    useEffect(() => {
        setIsActive(activeSectionId === sectionNode.id);
    }, [activeSectionId, sectionNode.id, sections]);

    return sectionNode.isInAccordion ? (
        <Accordion className="mb-2" key={sectionNode.id} alwaysOpen defaultActiveKey={["0"]}>
            <Accordion.Item eventKey="0">
                <Accordion.Header>
                    <SectionHeader sectionNode={sectionNode} isActive={isActive} onClick={onClick} />
                </Accordion.Header>
                <Accordion.Body>
                    <SectionBody resulsetTableProps={resulsetTableProps} sectionNode={sectionNode} onClick={onClick} />
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
    ) : (
        <>
            <SectionHeader sectionNode={sectionNode} isActive={isActive} onClick={onClick} />
            <SectionBody resulsetTableProps={resulsetTableProps} sectionNode={sectionNode} onClick={onClick} />
        </>
    );
}
type SectionHeaderProps<DataItemType extends RepositoryDataItem> = {
    sectionNode: SectionNode<DataItemType>;
    onClick: (sectionNode: SectionNode<DataItemType>) => void;
    isActive: boolean;
};

function SectionHeader<DataItemType extends RepositoryDataItem>({
    sectionNode,
    onClick,
    isActive,
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
        };
    }

    return (
        <div
            className="d-flex justify-content-between align-items-center flex-wrap w-100 px-2 py-1"
            onClick={() => onClick(sectionNode)}
            onDoubleClick={() => {
                if (selectedObjectRoute) navigate(selectedObjectRoute + dataItem.id);
            }}
        >
            <div className="d-flex align-items-center gap-2" style={{ cursor: "pointer" }}>
                <span style={makeTitleStyle()}>{sectionNode.titleLabel}</span>
                {(sectionNode.leaves?.length || sectionNode.children.length) > 5 && (
                    <span className="tekst-muted small">
                        [{sectionNode.leaves?.length || sectionNode.children.length} pozycji]
                    </span>
                )}
            </div>

            {isActive && (
                <div className="d-flex align-items-center gap-2 section-action-menu">
                    <RowActionMenu
                        dataObject={sectionNode.dataItem}
                        isDeletable={!!sectionNode.isDeletable}
                        EditButtonComponent={sectionNode.EditButtonComponent}
                        handleEditObject={handleEditSection}
                        handleDeleteObject={handleDeleteSection}
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

function SectionBody<DataItemType extends RepositoryDataItem>({
    sectionNode,
    resulsetTableProps,
    onClick,
}: SectionProps<DataItemType>) {
    return (
        <>
            {sectionNode.children.map((childNode, index) => (
                <Section<DataItemType>
                    key={childNode.dataItem.id + childNode.type}
                    sectionNode={childNode}
                    resulsetTableProps={resulsetTableProps}
                    onClick={onClick}
                />
            ))}

            {sectionNode.leaves && (
                <ResultSetTable<DataItemType> {...resulsetTableProps} filteredObjects={sectionNode.leaves} />
            )}
        </>
    );
}
