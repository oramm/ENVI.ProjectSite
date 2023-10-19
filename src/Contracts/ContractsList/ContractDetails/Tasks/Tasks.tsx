import React, { createContext, useContext, useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { Task } from '../../../../../Typings/bussinesTypes';
import ToolsDate from '../../../../React/ToolsDate';
import { SpinnerBootstrap, TaskStatusBadge } from '../../../../View/Resultsets/CommonComponents';
import FilterableTable from '../../../../View/Resultsets/FilterableTable/FilterableTable';
import { useContract } from '../../ContractContext';
import { tasksRepository } from '../../ContractsController';
import { TaskAddNewModalButton, TaskEditModalButton } from './Modals/TaskModalButtons';
import { TasksFilterBody } from './TasksFilterBody';

export default function Tasks() {
    const { contract, caseTypes, miletonesTypes, milestones, cases, tasks, } = useContract();

    const [externalUpdate, setExternalUpdate] = useState(0);

    useEffect(() => {
        setExternalUpdate(prevState => prevState + 1);
    }, [contract, tasks]);

    if (!contract) {
        return <div>Ładuję dane... <SpinnerBootstrap /> </div>;
    }

    return (
        <Card >
            <Card.Body >
                {tasks ?
                    <FilterableTable<Task>
                        id='tasks'
                        title='Zadania'
                        initialObjects={tasks}
                        repository={tasksRepository}
                        AddNewButtonComponents={[TaskAddNewModalButton]}
                        FilterBodyComponent={TasksFilterBody}
                        EditButtonComponent={TaskEditModalButton}
                        tableStructure={[
                            { header: 'Nazwa', objectAttributeToShow: 'name' },
                            { header: 'Opis', objectAttributeToShow: 'description' },
                            { header: 'Termin', objectAttributeToShow: 'deadline' },
                            { header: 'Status', renderTdBody: (task: Task) => <TaskStatusBadge status={task.status} /> },
                            { header: 'Właściciel', renderTdBody: (task: Task) => <>{`${task._owner.name} ${task._owner.surname}`}</> },
                        ]}
                        externalUpdate={externalUpdate}

                    />
                    : <>"Ładowanie zadań..." <SpinnerBootstrap /></>
                }

                <p className='tekst-muted small'>
                    Koordynator(ka): {`${contract._manager.name} ${contract._manager.surname}`}<br />
                    Aktualizacja: {ToolsDate.timestampToString(contract._lastUpdated)}
                </p>
            </Card.Body>
        </Card >
    );
}