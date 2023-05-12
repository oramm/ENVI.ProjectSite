import React, { createContext, FormEventHandler, useContext, useEffect, useState } from 'react';

import { Table, Container, Button, Row, Col, Form } from 'react-bootstrap';
import RepositoryReact from '../../React/RepositoryReact';
import { FormProvider } from '../Modals/FormContext';
import { FieldValues, useForm } from 'react-hook-form';
import { parseFieldValuestoFormData } from './CommonComponentsController';
import { GDFolderIconLink } from './CommonComponents';
import { useNavigate } from 'react-router-dom';
import { SpecificAddNewModalButtonProps, SpecificDeleteModalButtonProps, SpecificEditModalButtonProps } from '../Modals/ModalsTypes';
import { GeneralDeleteModalButton } from '../Modals/GeneralModalButtons';
import { RepositoryDataItem } from '../../../Typings/bussinesTypes';


export type FilterBodyProps = {}

export type FilterableTableProps = {
    title: string,
    tableStructure: RowStructure[],
    repository: RepositoryReact
    AddNewButtonComponents?: React.ComponentType<SpecificAddNewModalButtonProps>[]
    EditButtonComponent?: React.ComponentType<SpecificEditModalButtonProps>;
    isDeletable?: boolean;
    FilterBodyComponent: React.ComponentType<FilterBodyProps>;
    selectedObjectRoute?: string;
}
/** Wyświetla tablicę z filtrem i modalami CRUD
 * @param title tytuł tabeli
 * @param tableStructure struktura tabeli (nagłówki i atrybuty obiektów do wyświetlenia w kolumnach lub funkcja zwracająca komponenty do wyświetlenia w kolumnach)
 * @param repository repozytorium z danymi
 * @param AddNewButtonComponents komponenty przycisków dodawania nowych obiektów (domyślnie jeden) 
 * @param EditButtonComponent komponent przycisku edycji obiektu
 * @param isDeletable czy można usuwać obiekty z tabeli (domyślnie true)
 * @param FilterBodyComponent komponent zawartości filtra
 * @param selectedObjectRoute ścieżka do wyświetlenia szczegółów obiektu
 */
export default function FilterableTable({
    title,
    repository,
    tableStructure,
    AddNewButtonComponents = [],
    EditButtonComponent,
    isDeletable = true,
    FilterBodyComponent,
    selectedObjectRoute = '',
}: FilterableTableProps) {
    const [isReady, setIsReady] = useState(true);
    const [activeRowId, setActiveRowId] = useState(0);

    const [objects, setObjects] = useState([] as RepositoryDataItem[]);

    function handleAddObject(object: RepositoryDataItem) {
        setObjects([...objects, object]);
    }

    function handleEditObject(object: RepositoryDataItem) {
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
        <FilterableTableContext.Provider value={{
            handleAddObject,
            handleEditObject,
            handleDeleteObject,
            tableStructure,
            objects,
            repository,
            setObjects,
            selectedObjectRoute,
            activeRowId,
            EditButtonComponent,
            isDeletable,
        }}>
            <Container>
                <Row>
                    <Col>
                        <TableTitle title={title} />
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
                <Row>
                    <FilterPanel
                        FilterBodyComponent={FilterBodyComponent}
                        repository={repository}
                        onIsReadyChange={(isReady) => {
                            setIsReady(isReady);
                        }}
                    />
                </Row>
                {!isReady && <Row><progress style={{ height: "5px" }} /></Row>}
                <Row>
                    <Col>
                        {objects.length > 0 && (
                            <ResultSetTable
                                onRowClick={handleRowClick}
                                onIsReadyChange={(isReady) => { setIsReady(isReady); }}
                            />
                        )}
                    </Col>
                </Row>
            </Container>
        </FilterableTableContext.Provider>
    );
}

type FilterPanelProps = {
    FilterBodyComponent: React.ComponentType<FilterBodyProps>;
    repository: RepositoryReact,
    onIsReadyChange: React.Dispatch<React.SetStateAction<boolean>>,
}
function FilterPanel({ FilterBodyComponent, repository, onIsReadyChange }: FilterPanelProps) {
    const [errorMessage, setErrorMessage] = useState('');
    const { setObjects } = useContext(FilterableTableContext);
    const {
        register,
        setValue,
        watch,
        handleSubmit,
        control,
        formState: { errors, isValid },
        trigger
    } = useForm({ defaultValues: {}, mode: 'onChange' });

    async function handleSubmitSearch(data: FieldValues) {
        onIsReadyChange(false);
        const formData = parseFieldValuestoFormData(data);
        const result = await repository.loadItemsfromServer(formData);
        setObjects(result);
        onIsReadyChange(true);
    };

    return (
        <FormProvider value={{ register, setValue, watch, handleSubmit, control, formState: { errors, isValid }, trigger }}>
            <Form onSubmit={handleSubmit(handleSubmitSearch)}>
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

function renderHeaderBody(column: RowStructure) {
    if (column.header) return column.header;
    if (!column.renderThBody) return '';
    return column.renderThBody();
}

function ResultSetTable({
    onRowClick,
    onIsReadyChange,
}: ResultSetTableProps) {
    const { objects, activeRowId, tableStructure } = useContext(FilterableTableContext);
    return (
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
                        <FiterableTableRow
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
    );
}

export type FilterTableRowProps = {
    dataObject: RepositoryDataItem,
    isActive: boolean,
    onDoubleClick?: (object: RepositoryDataItem) => void
    onIsReadyChange?: (isReady: boolean) => void,
    onRowClick: (id: number) => void,
}

function FiterableTableRow({ dataObject, isActive, onIsReadyChange, onRowClick }: FilterTableRowProps): JSX.Element {
    if (!onIsReadyChange) throw new Error('onIsReadyChange is not defined');
    const navigate = useNavigate();
    const { selectedObjectRoute, tableStructure } = useContext(FilterableTableContext);

    function tdBodyRender(columStructure: RowStructure, dataObject: RepositoryDataItem) {
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

interface RowActionMenuProps {
    dataObject: RepositoryDataItem;
}

function RowActionMenu({
    dataObject,
}: RowActionMenuProps) {
    const { handleEditObject, handleDeleteObject, EditButtonComponent, isDeletable } = useContext(FilterableTableContext);
    return (
        <>
            {dataObject._gdFolderUrl && (
                <GDFolderIconLink folderUrl={dataObject._gdFolderUrl} />
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

export function DeleteModalButton({
    modalProps: { onDelete, initialData } }: SpecificDeleteModalButtonProps) {

    const { repository } = useContext(FilterableTableContext);
    const modalTitle = 'Usuwanie ' + (initialData.name || 'wybranego elementu');

    return (
        <GeneralDeleteModalButton
            modalProps={{
                onDelete,
                modalTitle,
                repository,
                initialData,
            }}
        />
    );
}

type RowStructure = {
    header?: string,
    objectAttributeToShow?: string,
    renderTdBody?: (dataItem: RepositoryDataItem) => JSX.Element
    renderThBody?: () => JSX.Element
};

type FilterableTableContextType = {
    objects: RepositoryDataItem[];
    repository: RepositoryReact;
    tableStructure: RowStructure[],
    handleAddObject: (object: RepositoryDataItem) => void;
    handleEditObject: (object: RepositoryDataItem) => void;
    handleDeleteObject: (objectId: number) => void;
    setObjects: React.Dispatch<React.SetStateAction<RepositoryDataItem[]>>;
    selectedObjectRoute: string,
    activeRowId: number,
    EditButtonComponent?: React.ComponentType<SpecificEditModalButtonProps>,
    isDeletable: boolean,
}

export const FilterableTableContext = createContext<FilterableTableContextType>({
    objects: [],
    repository: {} as RepositoryReact,
    tableStructure: [{ header: '', objectAttributeToShow: '', renderTdBody: () => <></> }],
    handleAddObject: () => { },
    handleEditObject: () => { },
    handleDeleteObject: () => { },
    setObjects: () => { },
    selectedObjectRoute: '',
    activeRowId: 0,
    EditButtonComponent: undefined,
    isDeletable: true,
});