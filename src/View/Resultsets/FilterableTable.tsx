import React, { createContext, Dispatch, FormEventHandler, SetStateAction, useContext, useEffect, useState } from 'react';

import { Table, Container, Button, Row, Col, Form } from 'react-bootstrap';
import RepositoryReact from '../../React/RepositoryReact';
import { FormProvider } from '../Modals/FormContext';
import { FieldValues, useForm } from 'react-hook-form';
import { parseFieldValuestoFormData } from './CommonComponentsController';
import { GDDocFileIconLink, GDFolderIconLink } from './CommonComponents';
import { useNavigate } from 'react-router-dom';
import { SpecificAddNewModalButtonProps, SpecificDeleteModalButtonProps, SpecificEditModalButtonProps } from '../Modals/ModalsTypes';
import { GeneralDeleteModalButton } from '../Modals/GeneralModalButtons';
import { RepositoryDataItem } from '../../../Typings/bussinesTypes';


export type FilterBodyProps = {}

export type FilterableTableProps<DataItemType extends RepositoryDataItem = RepositoryDataItem> = {
    title: string,
    tableStructure: RowStructure<DataItemType>[],
    repository: RepositoryReact<DataItemType>,
    AddNewButtonComponents?: React.ComponentType<SpecificAddNewModalButtonProps<DataItemType>>[]
    EditButtonComponent?: React.ComponentType<SpecificEditModalButtonProps<DataItemType>>;
    isDeletable?: boolean;
    FilterBodyComponent?: React.ComponentType<FilterBodyProps>;
    selectedObjectRoute?: string;
    initialObjects?: DataItemType[];
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
    tableStructure,
    AddNewButtonComponents = [],
    EditButtonComponent,
    isDeletable = true,
    FilterBodyComponent,
    selectedObjectRoute = '',
    initialObjects = [],
}: FilterableTableProps<DataItemType>) {
    const [isReady, setIsReady] = useState(true);
    const [activeRowId, setActiveRowId] = useState(0);
    const [objects, setObjects] = useState(initialObjects as DataItemType[]);

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
    }

    return (
        <FilterableTableProvider<DataItemType>
            objects={objects}
            activeRowId={activeRowId}
            repository={repository}
            tableStructure={tableStructure}//as RowStructure<RepositoryDataItem>[]}
            handleAddObject={handleAddObject}//as (object: RepositoryDataItem) => void}
            handleEditObject={handleEditObject}// as (object: RepositoryDataItem) => void}
            handleDeleteObject={handleDeleteObject}
            setObjects={setObjects}//as Dispatch<SetStateAction<RepositoryDataItem[]>>}
            selectedObjectRoute={selectedObjectRoute}
            EditButtonComponent={EditButtonComponent}// as React.ComponentType<SpecificEditModalButtonProps<RepositoryDataItem>> | undefined}
            isDeletable={isDeletable}
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
                            onIsReadyChange={(isReady) => {
                                setIsReady(isReady);
                            }}
                        />
                    </Row>
                }
                {!isReady && <Row><progress style={{ height: "5px" }} /></Row>}
                <Row>
                    <Col>
                        {objects.length > 0 && (
                            <ResultSetTable<DataItemType>
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

type FilterPanelProps = {
    FilterBodyComponent: React.ComponentType<FilterBodyProps>;
    repository: RepositoryReact,
    onIsReadyChange: React.Dispatch<React.SetStateAction<boolean>>,
}
function FilterPanel<DataItemType extends RepositoryDataItem>({ FilterBodyComponent, repository, onIsReadyChange }: FilterPanelProps) {
    const [errorMessage, setErrorMessage] = useState('');
    const { setObjects } = useFilterableTableContext<DataItemType>();
    const formMethods = useForm({ defaultValues: {}, mode: 'onChange' });

    async function handleSubmitSearch(data: FieldValues) {
        onIsReadyChange(false);
        const formData = parseFieldValuestoFormData(data);
        const result = await repository.loadItemsFromServer(formData) as DataItemType[];
        setObjects(result);
        onIsReadyChange(true);
    };

    return (
        <FormProvider value={formMethods}>
            <Form onSubmit={formMethods.handleSubmit(handleSubmitSearch)}>
                <FilterBodyComponent />
                <Row xl={1}>
                    <Form.Group as={Col} >
                        <Button type="submit">Szukaj</Button>
                    </Form.Group>
                </Row>
            </Form>
        </FormProvider>
    );
}

type ResultSetTableProps = {
    onRowClick: (id: number) => void,
    onIsReadyChange?: (isReady: boolean) => void
}

function renderHeaderBody<DataItemType extends RepositoryDataItem>(column: RowStructure<DataItemType>) {
    if (column.header) return column.header;
    if (!column.renderThBody) return '';
    return column.renderThBody();
}

function ResultSetTable<DataItemType extends RepositoryDataItem>({
    onRowClick,
    onIsReadyChange,
}: ResultSetTableProps) {
    const { objects, activeRowId, tableStructure } = useFilterableTableContext<DataItemType>();
    return (
        <>
            <p className='tekst-muted small'>
                Znaleziono: {objects.length}  pozycji.
            </p>
            <Table striped hover size="sm">
                <thead>
                    <tr>
                        {tableStructure.map((column) => (
                            <th key={column.renderThBody?.name || column.header}>
                                {renderHeaderBody(column)}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {objects.map((dataObject) => {
                        const isActive = dataObject.id === activeRowId;
                        return (
                            <FiterableTableRow<DataItemType>
                                key={dataObject.id}
                                dataObject={dataObject}
                                isActive={isActive}
                                onIsReadyChange={onIsReadyChange}
                                onRowClick={onRowClick}
                            />
                        )
                    })}
                </tbody>
            </Table >
        </>
    );
}

export type FilterTableRowProps<DataItemType extends RepositoryDataItem> = {
    dataObject: DataItemType,
    isActive: boolean,
    onDoubleClick?: (object: DataItemType) => void
    onIsReadyChange?: (isReady: boolean) => void,
    onRowClick: (id: number) => void,
}

function FiterableTableRow<DataItemType extends RepositoryDataItem>({
    dataObject,
    isActive,
    onIsReadyChange,
    onRowClick
}: FilterTableRowProps<DataItemType>): JSX.Element {
    if (!onIsReadyChange) throw new Error('onIsReadyChange is not defined');
    const navigate = useNavigate();
    const { selectedObjectRoute, tableStructure } = useFilterableTableContext<DataItemType>();

    function tdBodyRender(columStructure: RowStructure<DataItemType>, dataObject: DataItemType) {
        if (columStructure.objectAttributeToShow !== undefined)
            return dataObject[columStructure.objectAttributeToShow] as string;
        if (columStructure.renderTdBody !== undefined)
            return columStructure.renderTdBody(dataObject);
        return '';
    }

    return (
        <tr
            onClick={(e) => (onRowClick(dataObject.id))}
            onDoubleClick={() => {
                if (selectedObjectRoute) navigate(selectedObjectRoute + dataObject.id)
            }}
            className={isActive ? 'active' : ''}
        >
            {tableStructure.map((column, index) => (
                <td key={column.objectAttributeToShow || index}>
                    {tdBodyRender(column, dataObject)}
                </td>
            ))}
            {isActive &&
                <td align='center'>
                    <RowActionMenu dataObject={dataObject} />
                </td>
            }
        </tr>
    );
}

interface RowActionMenuProps<DataItemType extends RepositoryDataItem> {
    dataObject: DataItemType;
}

function RowActionMenu<DataItemType extends RepositoryDataItem>({
    dataObject,
}: RowActionMenuProps<DataItemType>) {
    const {
        handleEditObject,
        handleDeleteObject,
        EditButtonComponent,
        isDeletable
    } = useFilterableTableContext<DataItemType>();
    return (
        <>
            {dataObject._gdFolderUrl && (
                <GDFolderIconLink folderUrl={dataObject._gdFolderUrl} />
            )}
            {dataObject._documentOpenUrl && (
                <GDDocFileIconLink folderUrl={dataObject._documentOpenUrl} />
            )}
            {EditButtonComponent && (
                <EditButtonComponent
                    modalProps={{ onEdit: handleEditObject, initialData: dataObject, }}
                />
            )}
            {isDeletable && (
                <DeleteModalButton
                    modalProps={{ onDelete: handleDeleteObject, initialData: dataObject }}
                />
            )}
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

type RowStructure<DataItemType extends RepositoryDataItem = RepositoryDataItem> = {
    header?: string,
    objectAttributeToShow?: string,
    renderTdBody?: (dataItem: DataItemType) => JSX.Element
    renderThBody?: () => JSX.Element
};

type FilterableTableContextProps<DataItemType extends RepositoryDataItem> = {
    objects: DataItemType[];
    repository: RepositoryReact<DataItemType>;
    tableStructure: RowStructure<DataItemType>[],
    handleAddObject: (object: DataItemType) => void;
    handleEditObject: (object: DataItemType) => void;
    handleDeleteObject: (objectId: number) => void;
    setObjects: React.Dispatch<React.SetStateAction<DataItemType[]>>;
    selectedObjectRoute: string,
    activeRowId: number,
    EditButtonComponent?: React.ComponentType<SpecificEditModalButtonProps<DataItemType>>,
    isDeletable: boolean,
};

export const FilterableTableContext = createContext<FilterableTableContextProps<RepositoryDataItem>>({
    objects: [],
    repository: {} as RepositoryReact<RepositoryDataItem>,
    tableStructure: [],
    handleAddObject: () => { },
    handleEditObject: () => { },
    handleDeleteObject: () => { },
    setObjects: () => { },
    selectedObjectRoute: '',
    activeRowId: 0,
    EditButtonComponent: undefined,
    isDeletable: true,
});

function FilterableTableProvider<Item extends RepositoryDataItem>({
    objects,
    setObjects,
    repository,
    handleAddObject,
    handleEditObject,
    handleDeleteObject,
    tableStructure,
    selectedObjectRoute,
    activeRowId,
    EditButtonComponent,
    isDeletable = true,
    children, }: React.PropsWithChildren<FilterableTableContextProps<Item>>
) {
    const FilterableTableContextGeneric = FilterableTableContext as unknown as React.Context<FilterableTableContextProps<Item>>;

    return <FilterableTableContextGeneric.Provider value={{
        objects,
        setObjects: setObjects as React.Dispatch<React.SetStateAction<Item[]>>,
        repository,
        tableStructure,
        handleAddObject,
        handleEditObject,
        handleDeleteObject,
        selectedObjectRoute,
        activeRowId,
        EditButtonComponent,
        isDeletable,
    }}>
        {children}
    </FilterableTableContextGeneric.Provider>;
}

function useFilterableTableContext<Item extends RepositoryDataItem>() {
    const context = React.useContext<FilterableTableContextProps<Item>>(
        (FilterableTableContext as unknown) as React.Context<FilterableTableContextProps<Item>>
    );
    if (!context) {
        throw new Error('useMyContext must be used under MyContextProvider');
    }
    return context;
}