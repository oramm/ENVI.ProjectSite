import React, { createContext, FormEventHandler, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Table, Container, Accordion, Collapse, Button, Row, Col, Form, ProgressBar } from 'react-bootstrap';
import RepositoryReact, { RepositoryDataItem } from '../../React/RepositoryReact';
import { FormProvider } from '../FormContext';
import { FieldValues, useForm } from 'react-hook-form';
import { parseFieldValuestoFormData } from './CommonComponentsController';
import { SpecificAddNewModalButtonProps } from '../GeneralModal';


export type FilterBodyProps = {}

export type FilteredTableProps = {
    title: string,
    tableHeaders: string[],
    RowComponent: React.ComponentType<FilterTableRowProps>,
    repository: RepositoryReact
    AddNewButtons?: React.ComponentType<SpecificAddNewModalButtonProps>[]
    FilterBodyComponent: React.ComponentType<FilterBodyProps>;
}

export default function FilteredTable({
    title,
    repository,
    tableHeaders,
    RowComponent,
    AddNewButtons = [],
    FilterBodyComponent
}: FilteredTableProps) {
    const [isReady, setIsReady] = useState(true);
    const [activeRowId, setActiveRowId] = useState(0);
    const { handleAddObject, handleEditObject, handleDeleteObject, objects, setObjects } = useFilteredTableState();

    function handleRowClick(id: number) {
        setActiveRowId(id);
        repository.addToCurrentItems(id);
        console.log('handleRowClick', repository.currentItems);
    }

    return (
        <FilteredTableContext.Provider value={{ handleAddObject, handleEditObject, handleDeleteObject, objects, setObjects }}>
            <Container>
                <Row>
                    <Col>
                        <TableTitle title={title} />
                    </Col>
                    {AddNewButtons &&
                        <Col md="auto">
                            {AddNewButtons.map((ButtonComponent, index) => (
                                <React.Fragment key={index}>
                                    <ButtonComponent
                                        modalProps={{ onAddNew: handleAddObject }}
                                    />
                                    {index < AddNewButtons.length - 1 && ' '}
                                </React.Fragment>
                            ))}
                        </Col>
                    }
                </Row>
                <Row>
                    <FilterPanel
                        FilterBodyComponent={FilterBodyComponent}
                        repository={repository}
                        onIsReadyCHange={(isReady) => {
                            setIsReady(isReady);
                        }}
                    />
                </Row>
                {!isReady && <Row><progress style={{ height: "5px" }} /></Row>}
                <Row>
                    <Col>
                        {objects.length > 0 && (
                            <ResultSetTable
                                objects={objects}
                                activeRowId={activeRowId}
                                onRowClick={handleRowClick}
                                tableHeaders={tableHeaders}
                                RowComponent={RowComponent}
                                onIsReadyChange={(isReady) => { setIsReady(isReady); }}
                                onEdit={handleEditObject}
                                onDelete={handleDeleteObject}
                                onAddNew={handleAddObject}
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
    onIsReadyCHange: React.Dispatch<React.SetStateAction<boolean>>,

}
function FilterPanel({ FilterBodyComponent, repository, onIsReadyCHange: onIsReadyChange }: FilterPanelProps) {
    const [errorMessage, setErrorMessage] = useState('');
    const { setObjects } = useFilteredTableContext();
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
    objects: RepositoryDataItem[],
    activeRowId: number,
    onRowClick: (id: number) => void,
    tableHeaders: string[],
    RowComponent: React.ComponentType<FilterTableRowProps>
    onIsReadyChange?: (isReady: boolean) => void
    onEdit?: (object: RepositoryDataItem) => void
    onDelete?: (id: number) => void
    onAddNew?: (object: RepositoryDataItem) => void
}

function ResultSetTable({
    objects,
    activeRowId,
    onRowClick,
    tableHeaders,
    RowComponent,
    onIsReadyChange,
    onEdit,
    onDelete,
    onAddNew
}: ResultSetTableProps) {
    const navigate = useNavigate();
    return (
        <Table striped hover size="sm">
            <thead>
                <tr>
                    {tableHeaders.map((header, index) => (
                        <th key={index}>{header}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {objects.map((dataObject) => {
                    const isActive = dataObject.id === activeRowId;
                    return (
                        < tr
                            key={dataObject.id}
                            onClick={(e) => (onRowClick(dataObject.id))}
                            onDoubleClick={() => { navigate('/contract/' + dataObject.id) }}
                            className={isActive ? 'active' : ''}
                        >
                            <RowComponent
                                dataObject={dataObject}
                                isActive={isActive}
                                onIsReadyChange={onIsReadyChange}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onAddNew={onAddNew}
                            />
                        </tr>)
                })}
            </tbody>
        </Table >
    );
}

export type FilterTableRowProps = {
    dataObject: RepositoryDataItem,
    isActive: boolean,
    onDelete?: (id: number) => void,
    onEdit?: (object: RepositoryDataItem) => void
    onAddNew?: (object: RepositoryDataItem) => void
    onDoubleClick?: (object: RepositoryDataItem) => void
    onIsReadyChange?: (isReady: boolean) => void
}

export function TableTitle({ title }: { title: string }) {
    return <h1>{title}</h1>
}

interface FilteredTableContextType {
    objects: RepositoryDataItem[];
    handleAddObject: (object: RepositoryDataItem) => void;
    handleEditObject: (object: RepositoryDataItem) => void;
    handleDeleteObject: (objectId: number) => void;
    setObjects: React.Dispatch<React.SetStateAction<RepositoryDataItem[]>>;
}

const FilteredTableContext = createContext<FilteredTableContextType>({
    objects: [],
    handleAddObject: () => { },
    handleEditObject: () => { },
    handleDeleteObject: () => { },
    setObjects: () => { },
});

export const useFilteredTableContext = () => {
    return useContext(FilteredTableContext);
};

export const useFilteredTableState = () => {
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

    return {
        objects,
        setObjects,
        handleAddObject,
        handleEditObject,
        handleDeleteObject,
    };
};