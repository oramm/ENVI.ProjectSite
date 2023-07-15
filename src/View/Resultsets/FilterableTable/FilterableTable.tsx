import React, { useEffect, useState } from 'react';

import { Container, Row, Col, Card, Accordion } from 'react-bootstrap';
import RepositoryReact from '../../../React/RepositoryReact';
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from '../../Modals/ModalsTypes';
import { RepositoryDataItem } from '../../../../Typings/bussinesTypes';
import { FilterableTableProvider, useFilterableTableContext } from './FilterableTableContext';
import { FilterBodyProps, FilterPanel } from './FilterPanel';
import { ResultSetTable, ResultSetTableProps } from './ResultSetTable';
import { RowStructure } from './FiterableTableRow';
import { Section, SectionNode } from './Section';

export type FilterableTableProps<DataItemType extends RepositoryDataItem = RepositoryDataItem> = {
    title: string,
    showTableHeader?: boolean,
    initialSections?: SectionNode<DataItemType>[],
    tableStructure: RowStructure<DataItemType>[],
    repository: RepositoryReact<DataItemType>,
    AddNewButtonComponents?: React.ComponentType<SpecificAddNewModalButtonProps<DataItemType>>[]
    EditButtonComponent?: React.ComponentType<SpecificEditModalButtonProps<DataItemType>>;
    isDeletable?: boolean;
    FilterBodyComponent?: React.ComponentType<FilterBodyProps>;
    selectedObjectRoute?: string;
    initialObjects?: DataItemType[];
    onRowClick?: (object: DataItemType) => void;
    externalUpdate?: number;
    localFilter?: boolean;
}
/** Wyświetla tablicę z filtrem i modalami CRUD
 * @param title tytuł tabeli (domyślnie pusty)
 * @initialObjects obiekty do wyświetlenia na starcie (domyślnie pusta tablica)
 * @param tableStructure struktura tabeli (nagłówki i atrybuty obiektów do wyświetlenia w kolumnach lub funkcja zwracająca komponenty do wyświetlenia w kolumnach)
 * @param repository repozytorium z danymi
 * @param AddNewButtonComponents komponenty przycisków dodawania nowych obiektów (domyślnie jeden) 
 * @param EditButtonComponent komponent przycisku edycji obiektu
 * @param isDeletable czy można usuwać obiekty z tabeli (domyślnie true)
 * @param FilterBodyComponent komponent zawartości filtra
 * @param selectedObjectRoute ścieżka do wyświetlenia szczegółów obiektu
 */
export default function FilterableTable<LeafDataItemType extends RepositoryDataItem>({
    title,
    showTableHeader = true,
    repository,
    initialSections = [],
    tableStructure,
    AddNewButtonComponents = [],
    EditButtonComponent,
    isDeletable = true,
    FilterBodyComponent,
    selectedObjectRoute = '',
    initialObjects = [],
    onRowClick,
    externalUpdate = 0,
    localFilter: locaFilter = false,
}: FilterableTableProps<LeafDataItemType>) {
    const [isReady, setIsReady] = useState(true);
    const [activeRowId, setActiveRowId] = useState(0);
    const [sections, setSections] = useState(initialSections as SectionNode<LeafDataItemType>[]);
    const [activeSectionId, setActiveSectionId] = useState('');

    const [objects, setObjects] = useState(initialObjects as LeafDataItemType[]);

    useEffect(() => {
        setObjects(initialObjects);
    }, [externalUpdate]);

    function handleAddObject(object: LeafDataItemType) {
        setObjects([...objects, object]);
    }

    function handleEditObject(object: LeafDataItemType) {
        setObjects(objects.map((o) => (o.id === object.id ? object : o)));
    }

    function handleDeleteObject(objectId: number) {
        setObjects(objects.filter((o) => o.id !== objectId));
    }

    function handleAddSection(sectionDataObject: RepositoryDataItem) {
        const section = sections.find((s) => s.dataItem.id === sectionDataObject.id && s.name === sectionDataObject.name);
        if (section)
            setSections([...sections, section]);
    }

    function handleEditSection(sectionDataObject: RepositoryDataItem) {
        setSections(editNodeDataItem(sections, activeSectionId, sectionDataObject));
    }

    function handleDeleteSection(sectionDataObject: number) {
        //setSections(sections.filter((s) => s.id !== sectionDataObject));
    }

    function handleHeaderClick(sectionNode: SectionNode<LeafDataItemType>) {
        const repository = sectionNode.repository;
        setActiveSectionId(sectionNode.id);
        //dodaj sectionNode.dataItem do items jeśłi jeszcze tablica nie zawiera tego elementu 
        if (!repository.items.some((item) => item.id === sectionNode.dataItem.id))
            repository.items.push(sectionNode.dataItem);
        repository.addToCurrentItems(sectionNode.dataItem.id);
        console.log('handleHeaderClick', repository.currentItems);
    }

    function handleRowClick(id: number) {
        setActiveRowId(id);
        repository.addToCurrentItems(id);
        console.log('handleRowClick', repository.currentItems);
        if (onRowClick) { onRowClick(repository.currentItems[0]) }
    }

    return (
        <FilterableTableProvider<LeafDataItemType>
            objects={objects}
            activeRowId={activeRowId}
            activeSectionId={activeSectionId}
            repository={repository}
            sections={sections}
            tableStructure={tableStructure}
            handleAddObject={handleAddObject}
            handleEditObject={handleEditObject}
            handleDeleteObject={handleDeleteObject}
            setObjects={setObjects}
            setSections={setSections}
            handleAddSection={handleAddSection}
            handleEditSection={handleEditSection}
            handleDeleteSection={handleDeleteSection}
            selectedObjectRoute={selectedObjectRoute}
            EditButtonComponent={EditButtonComponent}
            isDeletable={isDeletable}
            externalUpdate={externalUpdate}
        >
            <Container>
                <Row>
                    <Col>
                        {title && <TableTitle title={title} />}
                    </Col>
                    {AddNewButtonComponents &&
                        <Col md="auto">
                            {AddNewButtonComponents.map((ButtonComponent, index) => (
                                <React.Fragment key={index}>
                                    <ButtonComponent
                                        modalProps={{ onAddNew: handleAddObject }}
                                    />
                                    {index < AddNewButtonComponents.length - 1 && ' '}
                                </React.Fragment>
                            ))}
                        </Col>
                    }
                </Row>
                {FilterBodyComponent &&
                    <Row>
                        <FilterPanel
                            FilterBodyComponent={FilterBodyComponent}
                            repository={repository}
                            locaFilter={locaFilter}
                            onIsReadyChange={(isReady) => {
                                setIsReady(isReady);
                            }}
                        />
                    </Row>
                }
                {!isReady && <Row><progress style={{ height: "5px" }} /></Row>}
                <Row>
                    <Col>
                        <p className='tekst-muted small'>
                            {objects && `Znaleziono: ${objects.length} pozycji`}
                        </p>
                        {(initialSections?.length > 0 ?
                            <Sections
                                onClick={handleHeaderClick}
                                resulsetTableProps={{
                                    showTableHeader: showTableHeader,
                                    onRowClick: handleRowClick,
                                    onIsReadyChange: (isReady) => { setIsReady(isReady) }
                                }}
                            />
                            :
                            <ResultSetTable<LeafDataItemType>
                                showTableHeader={showTableHeader}
                                onRowClick={handleRowClick}
                                onIsReadyChange={(isReady) => { setIsReady(isReady); }}
                            />
                        )}
                    </Col>
                </Row>
            </Container>
        </FilterableTableProvider>
    );
}

export type SectionsProps<DataItemType extends RepositoryDataItem> = {
    resulsetTableProps: ResultSetTableProps<DataItemType>,
    onClick: (sectionNode: SectionNode<DataItemType>) => void
}

function Sections<DataItemType extends RepositoryDataItem>({
    resulsetTableProps,
    onClick
}: SectionsProps<DataItemType>) {
    const { sections } = useFilterableTableContext<DataItemType>();

    return (
        <>
            {sections.map((section, index) => {
                return (
                    <Card
                        key={section.dataItem.id + section.name}
                        bg='light'
                        border='light'
                        style={{ marginTop: '10px' }}
                    >
                        <Section<DataItemType>
                            key={section.dataItem.id + section.name}
                            sectionNode={section}
                            resulsetTableProps={resulsetTableProps}
                            onClick={onClick}
                        />
                    </Card>)
            })}
        </>
    );
}

export function TableTitle({ title }: { title: string }) {
    return <h1>{title}</h1>
}

// Funkcja do aktualizacji węzłów
function editNodeDataItem<LeafDataItemType extends RepositoryDataItem>(
    nodes: SectionNode<LeafDataItemType>[],
    sectionId: string,
    newData: RepositoryDataItem
): SectionNode<LeafDataItemType>[] {
    return nodes.map(node => {
        if (node.id === sectionId) {
            // Znaleziono węzeł do zaktualizowania, zwracamy nowe dane
            const newSectionNode = { ...node };
            newSectionNode.dataItem = newData;
            if (newSectionNode.editHandler) newSectionNode.editHandler(newSectionNode);
            return newSectionNode;
        } else {
            // Nie znaleziono węzła do zaktualizowania, przeszukujemy dzieci
            return {
                ...node,
                children: editNodeDataItem(node.children, sectionId, newData),
                leaves: node.leaves ? editLeafDataItem(node.leaves, newData.id, newData) : undefined,
            };
        }
    });
}

// Funkcja do aktualizacji liści
function editLeafDataItem<LeafDataItemType extends RepositoryDataItem>(
    leaves: LeafDataItemType[],
    id: number,
    newData: RepositoryDataItem
): LeafDataItemType[] {
    return leaves.map(leaf =>
        leaf.id === id
            ? {
                ...leaf,
                ...newData,
            }
            : leaf
    );
}