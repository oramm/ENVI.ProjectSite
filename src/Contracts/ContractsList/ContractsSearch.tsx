import React, { FormEventHandler, useEffect, useState } from 'react';
import { Container, Accordion, Collapse, Button, Row, Col, Form, Alert } from 'react-bootstrap';
import FilteredTable, { FilterTableRowProps, handleSubmitFilterableTable } from '../../View/Resultsets/FilterableTable';
import ContractsController from './ContractsController';
import MainSetup from '../../React/MainSetupReact';
import { ContractTypeSelectFormElement, MyAsyncTypeahead } from '../../View/Resultsets/CommonComponents';
import { RepositoryDataItem } from '../../React/RepositoryReact';
import ToolsDate from '../../React/ToolsDate';
import { EditModalButton } from '../../View/GeneralModal';
import { OurContractEditModalButton, OurContractModalBody } from './OurContractModalBody';
import { OtherContractEditModalButton } from './OtherContractModalBody';

export const contractsRepository = ContractsController.contractsRepository;
export const entitiesRepository = ContractsController.entitiesRepository;
export const projectsRepository = ContractsController.projectsRepository;

export default function ContractsSearch({ title }: { title: string }) {
    const [objects, setObjects] = useState([] as any[]);
    const [searchText, setSearchText] = useState('');
    const [isReady, setIsReady] = useState(true);
    const [activeRowId, setActiveRowId] = useState(0);
    const [projects, setProjects] = useState([] as RepositoryDataItem[]);

    const filters = [
        <Form.Group>
            <Form.Label>Szukana fraza</Form.Label>
            <Form.Control
                type="text"
                placeholder="Wpisz tekst"
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
                labelKey='ourId'
                repository={projectsRepository}
                selectedRepositoryItems={projects}
                onChange={(currentSelectedItems) => setProjects(currentSelectedItems)}
                specialSerwerSearchActionRoute={'projects/' + MainSetup.currentUser.systemEmail}
            />
        </Form.Group>,

        <ContractTypeSelectFormElement onChange={(e) => { }} />
    ];

    async function handleSubmitSearch(e: React.FormEvent<HTMLFormElement>) {
        const additionalSearchCriteria = []
        if (projects.length > 0) {
            additionalSearchCriteria.push({
                name: 'projectId',
                value: projects[0].ourId as string
            });
        }
        try {
            setIsReady(false);
            const data = await handleSubmitFilterableTable(e, contractsRepository, additionalSearchCriteria);
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
                {onEdit && dataObject.ourId && (
                    <OurContractEditModalButton
                        onEdit={onEdit}
                        ModalBodyComponent={OurContractModalBody}
                        onIsReadyChange={onIsReadyChange}
                        initialData={dataObject}
                    />
                )}
                {onEdit && !dataObject.ourId && (
                    <OtherContractEditModalButton
                        onEdit={onEdit}
                        ModalBodyComponent={OurContractModalBody}
                        onIsReadyChange={onIsReadyChange}
                        initialData={dataObject}
                    />
                )}
                {onDelete && (
                    <Button onClick={(e) => onDelete(dataObject.id)} variant="danger">Delete</Button>
                )}
            </td>
        )}
    </>;
}