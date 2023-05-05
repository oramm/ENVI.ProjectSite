import React, { createContext, FormEventHandler, useContext, useEffect, useState } from 'react';

import { Table, Container, Button, Row, Col, Form } from 'react-bootstrap';
import RepositoryReact, { RepositoryDataItem } from '../../React/RepositoryReact';
import { FormProvider } from '../FormContext';
import { FieldValues, useForm } from 'react-hook-form';
import { parseFieldValuestoFormData } from './CommonComponentsController';
import { SpecificAddNewModalButtonProps, SpecificDeleteModalButtonProps, SpecificEditModalButtonProps } from '../GeneralModal';
import { GDFolderIconLink } from './CommonComponents';
import { useNavigate } from 'react-router-dom';


export type FilterBodyProps = {}

export type FilteredTableProps = {
    title: string,
    tableStructure: { header: string, objectAttributeToShow: string }[],
    repository: RepositoryReact
    AddNewButtonComponents?: React.ComponentType<SpecificAddNewModalButtonProps>[]
    EditButtonComponent?: React.ComponentType<SpecificEditModalButtonProps>;
    DeleteButtonComponent?: React.ComponentType<SpecificDeleteModalButtonProps>;
    FilterBodyComponent: React.ComponentType<FilterBodyProps>;
    selectedObjectRoute?: string;
}

export default function FilteredTable({
    title,
    repository,
    tableStructure,
    AddNewButtonComponents = [],
    EditButtonComponent,
    DeleteButtonComponent,
    FilterBodyComponent,
    selectedObjectRoute = '',
}: FilteredTableProps) {
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
        <FilteredTableContext.Provider value={{
            handleAddObject,
            handleEditObject,
            handleDeleteObject,
            tableStructure,
            objects,
            setObjects,
            selectedObjectRoute,
            activeRowId,
            EditButtonComponent,
            DeleteButtonComponent
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
        </FilteredTableContext.Provider>
    );
}

type FilterPanelProps = {
    FilterBodyComponent: React.ComponentType<FilterBodyProps>;
    repository: RepositoryReact,
    onIsReadyChange: React.Dispatch<React.SetStateAction<boolean>>,
}
function FilterPanel({ FilterBodyComponent, repository, onIsReadyChange }: FilterPanelProps) {
    const [errorMessage, setErrorMessage] = useState('');
    const { setObjects } = useContext(FilteredTableContext);
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

function ResultSetTable({
    onRowClick,
    onIsReadyChange,
}: ResultSetTableProps) {
    const { objects, activeRowId, tableStructure } = useContext(FilteredTableContext);
    return (
        <Table striped hover size="sm">
            <thead>
                <tr>
                    {tableStructure.map((column, index) => (
                        <th key={index}>{column.header}</th>
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
    const { selectedObjectRoute, tableStructure } = useContext(FilteredTableContext);
    return (
        <>
            <tr
                onClick={(e) => (onRowClick(dataObject.id))}
                onDoubleClick={() => {
                    if (selectedObjectRoute) navigate(selectedObjectRoute + dataObject.id)
                }}
                className={isActive ? 'active' : ''}
            >
                {tableStructure.map((column, index) => (
                    <td key={index}>{dataObject[column.objectAttributeToShow]}</td>
                ))}
                {isActive &&
                    <td align='center'>
                        <RowActionMenu dataObject={dataObject} />
                    </td>
                }
            </tr>
        </>);
}

interface RowActionMenuProps {
    dataObject: RepositoryDataItem;
}

function RowActionMenu({
    dataObject,
}: RowActionMenuProps) {
    const { handleEditObject, handleDeleteObject, EditButtonComponent, DeleteButtonComponent } = useContext(FilteredTableContext);
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
            {DeleteButtonComponent && (
                <DeleteButtonComponent
                    modalProps={{ onDelete: handleDeleteObject, initialData: dataObject }}
                />
            )}
        </>
    );
}

export function TableTitle({ title }: { title: string }) {
    return <h1>{title}</h1>
}

interface FilteredTableContextType {
    objects: RepositoryDataItem[];
    tableStructure: { header: string, objectAttributeToShow: string }[],
    handleAddObject: (object: RepositoryDataItem) => void;
    handleEditObject: (object: RepositoryDataItem) => void;
    handleDeleteObject: (objectId: number) => void;
    setObjects: React.Dispatch<React.SetStateAction<RepositoryDataItem[]>>;
    selectedObjectRoute: string,
    activeRowId: number,
    EditButtonComponent?: React.ComponentType<SpecificEditModalButtonProps>,
    DeleteButtonComponent?: React.ComponentType<SpecificDeleteModalButtonProps>,
}

export const FilteredTableContext = createContext<FilteredTableContextType>({
    objects: [],
    tableStructure: [{ header: '', objectAttributeToShow: '' }],
    handleAddObject: () => { },
    handleEditObject: () => { },
    handleDeleteObject: () => { },
    setObjects: () => { },
    selectedObjectRoute: '',
    activeRowId: 0,
    EditButtonComponent: undefined,
    DeleteButtonComponent: undefined,
});