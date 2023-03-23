import React, { FormEventHandler, useEffect, useState } from 'react';
import { Container, Accordion, Collapse, Button, Row, Col, Form, Alert } from 'react-bootstrap';
import FilteredTable, { FilterTableRowProps, handleSubmitFilterableTable } from '../../View/Resultsets/FilterableTable';
import ContractsController from './ContractsController';
import MainSetup from '../../React/MainSetupReact';
import { EditContractButton, AddNewContractButton } from './ContractModal';
import { ContractTypeSelectFormElement, MyAsyncTypeahead } from '../../View/Resultsets/CommonComponents';
import { RepositoryDataItem } from '../../React/RepositoryReact';
import ToolsDate from '../../React/ToolsDate';

export const contractsRepository = ContractsController.contractsRepository;
export const entitiesRepository = ContractsController.entitiesRepository;
export const projectsRepository = ContractsController.projectsRepository;

export default function ContractsSearch({ title }: { title: string }) {
    const [objects, setObjects] = useState([] as any[]);
    const [searchText, setSearchText] = useState('');
    const [isReady, setIsReady] = useState(true);
    const [activeRowId, setActiveRowId] = useState(0);
    const [projectOurId, setProjectOurId] = useState('');

    const filters = [
        <Form.Group>
            <Form.Label>Szukana fraza</Form.Label>
            <Form.Control
                type="text"
                placeholder="Wpisz tekst"
                onKeyUp={handleTextKeyUp}
                name="searchText"
                value={searchText} onChange={e => setSearchText(e.target.value)}
            />
        </Form.Group>,
        <Form.Group>
            <Form.Label>Początek od</Form.Label>
            <Form.Control
                name='startDate'
                type="date"
                defaultValue={ToolsDate.addDays(new Date(), -365).toISOString().slice(0, 10)} />
        </Form.Group>,
        <Form.Group>
            <Form.Label>Początek do</Form.Label>
            <Form.Control
                name='endDate'
                type="date"
                defaultValue={ToolsDate.addDays(new Date(), +600).toISOString().slice(0, 10)} />
        </Form.Group>,
        <Form.Group>
            <Form.Label>Projekt</Form.Label>
            <MyAsyncTypeahead
                labelKey='OurId'
                repository={projectsRepository}
                onChange={(currentSelectedItems) => setProjectOurId(currentSelectedItems[0].ourId)}
            />

        </Form.Group>,

        <ContractTypeSelectFormElement onChange={(e) => { }} />
    ];

    async function handleTextKeyUp(e: any) {
        setIsReady(false);
        const valueFromTextBox = (e.target as HTMLInputElement).value as string;

        setIsReady(true);
    }

    async function handleSubmitSearch(e: React.FormEvent<HTMLFormElement>) {
        try {
            setIsReady(false);
            const data = await handleSubmitFilterableTable(e, contractsRepository);
            setObjects(data);
            setIsReady(true);
        } catch (error) {
            throw error;
        }
    };

    function handleEditObject(object: RepositoryDataItem) {
        setObjects(objects.map((o) => o.id === object.id ? object : o));
    }

    function handleAddObject(object: RepositoryDataItem) {
        setObjects([...objects, object]);
    }

    async function handleDeleteObject(objectId: number) {
        await contractsRepository.deleteItemNodeJS(objectId);
        setObjects(objects.filter((o) => o.id !== objectId));
    }

    function handleRowClick(id: number) {
        console.log('handleRowClick', id);
        setActiveRowId(id);
        contractsRepository.addToCurrentItems(id);
    }

    return (
        <FilteredTable
            objects={objects}
            onSubmitSearch={handleSubmitSearch}
            onAdd={handleAddObject}
            onEdit={handleEditObject}
            onDelete={handleDeleteObject}
            onIsReadyChange={setIsReady}
            filters={filters}
            title={title}
            isReady={isReady}
            activeRowId={activeRowId}
            onRowClick={handleRowClick}
            tableHeaders={['Oznaczenie', 'Numer', 'Nazwa', 'Data początku', 'Data końca']}
            rowRenderer={(props) => <ContractSearchTableRow {...props} />}
        />
    );
}

function ContractSearchTableRow({ dataObject, isActive, onEdit, onDelete, onIsReadyChange }: FilterTableRowProps): JSX.Element {
    if (!onIsReadyChange) throw new Error('onIsReadyChange is not defined');
    return <>
        <td>{dataObject.ourId}</td>
        <td>{dataObject.number}</td>
        <td>{dataObject.name}</td>
        <td>{dataObject.startDate}</td>
        <td>{dataObject.endDate}</td>
        {isActive && (
            <td>
                {onEdit && (
                    <EditContractButton
                        onEdit={onEdit}
                        initialData={dataObject}
                        onIsReadyChange={onIsReadyChange}
                    />
                )}
                {onDelete && (
                    <Button onClick={(e) => onDelete(dataObject.id)} variant="danger">Delete</Button>
                )}
            </td>
        )}
    </>;
}