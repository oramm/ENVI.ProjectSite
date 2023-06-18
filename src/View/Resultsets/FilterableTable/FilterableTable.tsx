import React, { useEffect, useState } from 'react';

import { Container, Row, Col } from 'react-bootstrap';
import RepositoryReact from '../../../React/RepositoryReact';
import { SpecificAddNewModalButtonProps, SpecificDeleteModalButtonProps, SpecificEditModalButtonProps } from '../../Modals/ModalsTypes';
import { GeneralDeleteModalButton } from '../../Modals/GeneralModalButtons';
import { RepositoryDataItem } from '../../../../Typings/bussinesTypes';
import { FilterableTableProvider, useFilterableTableContext } from './FilterableTableContext';
import { FilterBodyProps, FilterPanel } from './FilterPanel';
import { ResultSetTable, ResultSetTableProps, RowStructure } from './ResultSetTable';

export type FilterableTableProps<DataItemType extends RepositoryDataItem = RepositoryDataItem> = {
    title: string,
    sectionsStructure?: SectionStruture[],
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
export default function FilterableTable<DataItemType extends RepositoryDataItem>({
    title,
    repository,
    sectionsStructure = [],
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
}: FilterableTableProps<DataItemType>) {
    const [isReady, setIsReady] = useState(true);
    const [activeRowId, setActiveRowId] = useState(0);
    const [objects, setObjects] = useState(initialObjects as DataItemType[]);

    useEffect(() => {
        setObjects(initialObjects);
    }, [externalUpdate]);

    function handleAddObject(object: DataItemType) {
        setObjects([...objects, object]);
    }

    function handleEditObject(object: DataItemType) {
        setObjects(objects.map((o) => (o.id === object.id ? object : o)));
    }

    function handleDeleteObject(objectId: number) {
        setObjects(objects.filter((o) => o.id !== objectId));
    }

    function handleRowClick(id: number) {
        setActiveRowId(id);
        repository.addToCurrentItems(id);
        console.log('handleRowClick', repository.currentItems);
        if (onRowClick) { onRowClick(repository.currentItems[0]) }
    }

    return (
        <FilterableTableProvider<DataItemType>
            objects={objects}
            activeRowId={activeRowId}
            repository={repository}
            sectionsStructure={sectionsStructure}
            tableStructure={tableStructure}//as RowStructure<RepositoryDataItem>[]}
            handleAddObject={handleAddObject}//as (object: RepositoryDataItem) => void}
            handleEditObject={handleEditObject}// as (object: RepositoryDataItem) => void}
            handleDeleteObject={handleDeleteObject}
            setObjects={setObjects}//as Dispatch<SetStateAction<RepositoryDataItem[]>>}
            selectedObjectRoute={selectedObjectRoute}
            EditButtonComponent={EditButtonComponent}// as React.ComponentType<SpecificEditModalButtonProps<RepositoryDataItem>> | undefined}
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
                            Znaleziono: {objects.length}  pozycji.
                        </p>
                        {objects.length > 0 &&
                            (sectionsStructure.length > 0 ?
                                <Sections
                                    resulsetTableProps={{
                                        onRowClick: handleRowClick,
                                        onIsReadyChange: (isReady) => { setIsReady(isReady) }
                                    }}
                                />
                                :
                                < ResultSetTable<DataItemType>
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

/** Struktura danej sekcji 
 * @param SectionStructure.repository - repozytorium z danymi
 * @param SectionStructure.getParentId - zwraca id rodzica sekcji
 * @param SectionStructure.getIdAsLeafSection - zwraca id sekcji, z poziomu tabeli z pozycjami
 * @param SectionStructure.makeTittleLabel - zwraca tytuł sekcji
 */
export type SectionStruture = {
    name: string,
    repository: RepositoryReact,
    getParentId?: (item: RepositoryDataItem) => number | string,
    getIdAsLeafSection: (item: RepositoryDataItem) => number | string,
    makeTittleLabel: (item: RepositoryDataItem) => string,
};

type SectionLevel = {
    repository: RepositoryReact,
    dataItem: RepositoryDataItem,
    titleLabel: string,
    parentIdGetter?: (item: RepositoryDataItem) => number | string,
};

export type SectionProps<DataItemType extends RepositoryDataItem> = {
    sectionLevels: SectionLevel[],
    resulsetTableProps: ResultSetTableProps<DataItemType>,
}

export type SectionsProps<DataItemType extends RepositoryDataItem> = {
    resulsetTableProps: ResultSetTableProps<DataItemType>,
}

function Sections<DataItemType extends RepositoryDataItem>({
    resulsetTableProps
}: SectionsProps<DataItemType>) {
    const { sectionsStructure } = useFilterableTableContext<DataItemType>();

    return (
        <>
            {sectionsStructure.map((section, index) =>
                section.repository.items.map((sectionObject, index) =>
                    <Section<DataItemType>
                        key={index}
                        sectionLevels={[{
                            repository: section.repository,
                            dataItem: sectionObject,
                            parentIdGetter: section.getParentId,
                            titleLabel: section.makeTittleLabel(sectionObject),
                        }]}
                        resulsetTableProps={{ ...resulsetTableProps }}
                    />
                )
            )}
        </>
    );
}

function Section<DataItemType extends RepositoryDataItem>({ sectionLevels, resulsetTableProps }: SectionProps<DataItemType>) {
    const { objects } = useFilterableTableContext<DataItemType>();
    const leafSection = sectionLevels[sectionLevels.length - 1];
    const filteredObjects = objects.filter(object => object.id === leafSection.dataItem.id);

    return (
        <>
            {sectionLevels.map((section, index) => {
                const fontSize = `${2 - (index * 0.2)}rem`;
                return (
                    <div key={index} style={{ fontSize: fontSize }}>
                        {section.titleLabel}
                    </div>
                );
            })}

            <ResultSetTable<DataItemType>
                {...resulsetTableProps}
                filteredObjects={filteredObjects}
            />
        </>
    );
}

export function TableTitle({ title }: { title: string }) {
    return <h1>{title}</h1>
}

export function DeleteModalButton<DataItemType extends RepositoryDataItem>({
    modalProps: { onDelete, initialData } }: SpecificDeleteModalButtonProps<DataItemType>) {

    const { repository } = useFilterableTableContext<DataItemType>();
    const modalTitle = 'Usuwanie ' + (initialData.name || 'wybranego elementu');

    return (
        <GeneralDeleteModalButton<DataItemType>
            modalProps={{
                onDelete,
                modalTitle,
                repository,
                initialData,
            }}
        />
    );
}