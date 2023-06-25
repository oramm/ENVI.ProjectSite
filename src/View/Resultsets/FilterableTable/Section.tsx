import React, { useEffect, useState } from 'react';
import { Accordion } from "react-bootstrap";
import { RepositoryDataItem } from "../../../../Typings/bussinesTypes";
import RepositoryReact from "../../../React/RepositoryReact";
import { RowActionMenu } from './FiterableTableRow';
import { ResultSetTable, ResultSetTableProps } from "./ResultSetTable";

/** Struktura danych sekcji (poziomu) - element Props dla komponentu Section
 * @param SectionNode.repository - repozytorium z danymi
 * @param SectionNode.dataItem - obiekt z danymi sekcji
 * @param SectionNode.titleLabel - tytuł sekcji
 */
export type SectionNode<DataItemType extends RepositoryDataItem> = {
    id: number,
    level: number,
    name: string,
    repository: RepositoryReact,
    dataItem: RepositoryDataItem,
    titleLabel: string,
    children: SectionNode<DataItemType>[],
    leafs?: DataItemType[],
    isInAccordion?: boolean,
};

export type SectionProps<DataItemType extends RepositoryDataItem> = {
    sectionNode: SectionNode<DataItemType>,
    resulsetTableProps: ResultSetTableProps<DataItemType>,
}

export function Section<DataItemType extends RepositoryDataItem>({
    sectionNode,
    resulsetTableProps,
}: SectionProps<DataItemType>) {

    return (
        sectionNode.isInAccordion ?
            <Accordion key={sectionNode.name} alwaysOpen defaultActiveKey={['0']}>
                <Accordion.Item eventKey="0">
                    <Accordion.Header>
                        <SectionHeader sectionNode={sectionNode} />
                    </Accordion.Header>
                    <Accordion.Body>
                        <SectionBody resulsetTableProps={resulsetTableProps} sectionNode={sectionNode} />
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
            :
            <>
                <SectionHeader sectionNode={sectionNode} />
                <SectionBody resulsetTableProps={resulsetTableProps} sectionNode={sectionNode} />
            </>
    );


}

function SectionHeader({ sectionNode }: { sectionNode: SectionNode<RepositoryDataItem> }) {
    function makeTitleStyle(nodeLevel: number) {
        return {
            //marginTop: nodeLevel === 1 ? '35px' : undefined,
            fontSize: nodeLevel === 1 ? '1.5rem' : '1rem',
            fontWeight: 600 - nodeLevel * 100,
            color: `rgb(${50}, ${130}, ${50})`
        }
    }

    function handleClick() {
        console.log('handleClick', sectionNode.dataItem);
        sectionNode.repository.addToCurrentItems(sectionNode.dataItem.id);
    }

    function handleDeleteObject() {

    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', background: 'aliceblue' }}>
            <div
                onClick={handleClick}
                key={sectionNode.name}
                style={makeTitleStyle(sectionNode.level)}
            >
                {sectionNode.titleLabel}
            </div>
            <div>
                <RowActionMenu
                    dataObject={sectionNode.dataItem}
                    isDeletable={true}
                />
            </div>
        </div>
    );

}

function SectionBody<DataItemType extends RepositoryDataItem>({
    sectionNode,
    resulsetTableProps
}: SectionProps<DataItemType>) {
    return (
        <>
            {sectionNode.children.map((childNode, index) =>
                <Section<DataItemType>
                    key={childNode.dataItem.id + childNode.name}
                    sectionNode={childNode}
                    resulsetTableProps={resulsetTableProps}
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