import React, { FormEventHandler, useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { useNavigate } from 'react-router-dom';

import { Table, Container, Accordion, Collapse, Button, Row, Col, Form, ProgressBar } from 'react-bootstrap';
import RepositoryReact, { RepositoryDataItem } from '../../React/RepositoryReact';
import { OtherContractAddNewModalButton } from '../../Contracts/ContractsList/OtherContractModalBody';
import { OurContractAddNewModalButton } from '../../Contracts/ContractsList/OurContractModalBody';

type FilteredTableProps = {
    title: string,
    filters: JSX.Element[],
    onSubmitSearch: FormEventHandler,
    onEdit?: (object: RepositoryDataItem) => void,
    onDelete?: (id: number) => void,
    onIsReadyChange?: (isReady: boolean) => void,
    onAddNew?: (object: RepositoryDataItem) => void,
    objects: any[],
    isReady: boolean,
    activeRowId: number,
    onRowClick: (id: number) => void,
    tableHeaders: string[],
    rowRenderer: (props: FilterTableRowProps) => JSX.Element
}

export default function FilteredTable({
    title,
    filters,
    onSubmitSearch,
    onEdit,
    onDelete,
    onIsReadyChange = () => { },
    onAddNew,
    objects,
    isReady,
    activeRowId,
    onRowClick,
    tableHeaders,
    rowRenderer
}: FilteredTableProps) {
    return (
        <Container>
            <Row>
                <Col>
                    <TableTitle title={title} />
                </Col>
                {onAddNew &&
                    <>
                        <Col md="auto">
                            <OtherContractAddNewModalButton
                                modalProps={{ onAddNew, onIsReadyChange }}
                            />
                            {' '}
                            <OurContractAddNewModalButton
                                modalProps={{ onAddNew, onIsReadyChange }}
                            />
                        </Col>
                    </>
                }
            </Row>
            <Row>
                <FilterPanel filters={filters} onSubmit={onSubmitSearch} />
            </Row>
            {!isReady && <Row><progress style={{ height: "5px" }} /></Row>}
            <Row>
                <Col>
                    {objects.length > 0 && (
                        <ResultSetTable
                            objects={objects}
                            activeRowId={activeRowId}
                            onRowClick={onRowClick}
                            tableHeaders={tableHeaders}
                            rowRenderer={rowRenderer}
                            onIsReadyChange={onIsReadyChange}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onAddNew={onAddNew}
                        />
                    )}
                </Col>
            </Row>
        </Container>
    );
}

function FilterPanel({ filters, onSubmit }: { filters: any[], onSubmit: FormEventHandler }) {
    return (
        <Form onSubmit={onSubmit}>

            {filters.map((filter, index) => (
                <Col key={index}> {filter} </Col>
            ))}
            <Col>
                <Button type="submit">Szukaj</Button>
            </Col>
        </Form>
    );
}

/**
 *  Obsługuje wyszukiwanie w tabeli z filtrowaniem 
 */
export async function handleSubmitFilterableTable(
    e: React.FormEvent<HTMLFormElement>,
    repository: RepositoryReact,
    additionalParameters?: { name: string; value: string }[]
) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    if (additionalParameters?.length)
        for (const param of additionalParameters)
            formData.append(param.name, param.value);

    return await repository.loadItemsfromServer(formData);
}

type ResultSetTableProps = {
    objects: RepositoryDataItem[],
    activeRowId: number,
    onRowClick: (id: number) => void,
    tableHeaders: string[],
    rowRenderer: (props: FilterTableRowProps) => JSX.Element;
    onIsReadyChange?: (isReady: boolean) => void
    onEdit?: (object: RepositoryDataItem) => void
    onDelete?: (id: number) => void
    onAddNew?: (object: RepositoryDataItem) => void
}

function ResultSetTable({ objects,
    activeRowId,
    onRowClick,
    tableHeaders,
    rowRenderer,
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
                            onDoubleClick={() => { console.log('dblClick'); navigate('/contract/' + dataObject.id) }}
                            className={isActive ? 'active' : ''}
                        >
                            {rowRenderer({
                                dataObject,
                                isActive,
                                onIsReadyChange,
                                onEdit,
                                onDelete,
                                onAddNew
                            })}
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