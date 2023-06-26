import React, { useEffect, useState } from 'react';
import { Accordion } from "react-bootstrap";
import { RepositoryDataItem } from "../../../../Typings/bussinesTypes";
import RepositoryReact from "../../../React/RepositoryReact";
import { SpecificEditModalButtonProps } from '../../Modals/ModalsTypes';
import { useFilterableTableContext } from './FilterableTableContext';
import { RowActionMenu } from './FiterableTableRow';
import { ResultSetTable, ResultSetTableProps } from "./ResultSetTable";
import './FilterableTable.css'

/** Struktura danych sekcji (poziomu) - element Props dla komponentu Section
 * @param SectionNode.repository - repozytorium z danymi
 * @param SectionNode.dataItem - obiekt z danymi sekcji
 * @param SectionNode.titleLabel - tytuł sekcji
 */
export type SectionNode<LeafDataItemType extends RepositoryDataItem> = {
    id: string,
    level: number,
    name: string,
    repository: RepositoryReact,
    dataItem: RepositoryDataItem,
    titleLabel: string,
    children: SectionNode<LeafDataItemType>[],
    EditButtonComponent?: React.ComponentType<SpecificEditModalButtonProps<RepositoryDataItem>>
    leafs?: LeafDataItemType[],
    isInAccordion?: boolean,
};

export type SectionProps<DataItemType extends RepositoryDataItem> = {
    sectionNode: SectionNode<DataItemType>,
    resulsetTableProps: ResultSetTableProps<DataItemType>,
    onClick: (sectionNode: SectionNode<DataItemType>) => void
}

export function Section<DataItemType extends RepositoryDataItem>({
    sectionNode,
    resulsetTableProps,
    onClick
}: SectionProps<DataItemType>) {
    const { activeSectionId } = useFilterableTableContext<DataItemType>();
    const [isActive, setIsActive] = useState(activeSectionId === sectionNode.id);

    useEffect(() => {
        setIsActive(activeSectionId === sectionNode.id);
    }, [activeSectionId, sectionNode.id]);


    return (
        sectionNode.isInAccordion ?
            <Accordion key={sectionNode.name} alwaysOpen defaultActiveKey={['0']}>
                <Accordion.Item eventKey="0">
                    <Accordion.Header>
                        <SectionHeader
                            sectionNode={sectionNode}
                            isActive={isActive}
                            onClick={onClick}
                        />
                    </Accordion.Header>
                    <Accordion.Body>
                        <SectionBody
                            resulsetTableProps={resulsetTableProps}
                            sectionNode={sectionNode}
                            onClick={onClick}
                        />
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
            :
            <>
                <SectionHeader
                    sectionNode={sectionNode}
                    isActive={isActive}
                    onClick={onClick}
                />
                <SectionBody
                    resulsetTableProps={resulsetTableProps}
                    sectionNode={sectionNode}
                    onClick={onClick}
                />
            </>
    );
}
type SectionHeaderProps<DataItemType extends RepositoryDataItem> = {
    sectionNode: SectionNode<DataItemType>,
    onClick: (sectionNode: SectionNode<DataItemType>) => void,
    isActive: boolean,
}

function SectionHeader<DataItemType extends RepositoryDataItem>({
    sectionNode,
    onClick,
    isActive
}: SectionHeaderProps<DataItemType>) {

    function makeTitleClassName() {
        const classSuffix = sectionNode.level === 1 ? '1' : 'x';
        let name = `section-title-level-${classSuffix}`;

        return name;
    }

    function makeSectionStyle() {
        return {
            display: 'flex',
            alignItems: 'center',
            background: !sectionNode.isInAccordion ? 'aliceblue' : undefined,
        }
    }

    return (
        <div style={makeSectionStyle()}>
            <div
                className={(isActive ? 'active ' : '') + makeTitleClassName()}
                onClick={() => onClick(sectionNode)}
                key={sectionNode.id}

            >
                {sectionNode.titleLabel}
            </div>
            {isActive ?
                <div>
                    <RowActionMenu
                        dataObject={sectionNode.dataItem}
                        isDeletable={true}
                        EditButtonComponent={sectionNode.EditButtonComponent}

                    />
                </div>
                : null
            }
        </div>
    );

}

function SectionBody<DataItemType extends RepositoryDataItem>({
    sectionNode,
    resulsetTableProps,
    onClick
}: SectionProps<DataItemType>) {
    return (
        <>
            {sectionNode.children.map((childNode, index) =>
                <Section<DataItemType>
                    key={childNode.dataItem.id + childNode.name}
                    sectionNode={childNode}
                    resulsetTableProps={resulsetTableProps}
                    onClick={onClick}
                />
            )}

            {sectionNode.leafs &&
                <ResultSetTable<DataItemType>
                    {...resulsetTableProps}
                    filteredObjects={sectionNode.leafs}
                />
            }
        </>
    )
}