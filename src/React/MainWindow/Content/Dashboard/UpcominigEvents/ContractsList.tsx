import React, { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { OurContract, OtherContract, SystemRoleName } from '../../../../../../Typings/bussinesTypes';
import { ContractModalBodyDates, ContractModalBodyName, ContractModalBodyStatus } from '../../../../../Contracts/ContractsList/Modals/ContractModalBodiesPartial';
import { contractDatesValidationSchema, contractNameValidationSchema, contractStatusValidationSchema } from '../../../../../Contracts/ContractsList/Modals/ContractValidationSchema';
import { PartialEditTrigger } from '../../../../../View/Modals/GeneralModalButtons';
import { ContractStatusBadge, DaysLeftBadge, MyTooltip } from '../../../../../View/Resultsets/CommonComponents';
import FilterableTable from '../../../../../View/Resultsets/FilterableTable/FilterableTable';
import MainSetup from '../../../../MainSetupReact';
import Tools from '../../../../Tools';
import ToolsDate from '../../../../ToolsDate';
import { contractsRepository } from '../../../MainWindowController';

export default function ContractsList() {
    const [contracts, setContracts] = useState([] as (OurContract | OtherContract)[]);
    const [externalUpdate, setExternalUpdate] = useState(0);
    const [dataLoaded, setDataLoaded] = useState(false);

    useEffect(() => {
        async function fetchData() {
            setDataLoaded(false);
            const endDateTo = ToolsDate.addDays(new Date(), 30);
            const [contracts] = await Promise.all([
                contractsRepository.loadItemsFromServerPOST([{
                    status: [
                        MainSetup.ContractStatuses.IN_PROGRESS,
                        MainSetup.ContractStatuses.NOT_STARTED
                    ],
                    endDateTo: endDateTo.toISOString().slice(0, 10),
                    getRemainingValue: true,
                }]),
            ]);
            setContracts(contracts);
            setExternalUpdate(prevState => prevState + 1);
            setDataLoaded(true);
        };

        fetchData();
    }, []);



    function renderName(contract: OurContract | OtherContract) {
        return <>
            <PartialEditTrigger
                modalProps={{
                    initialData: contract,
                    modalTitle: 'Edycja nazwy',
                    repository: contractsRepository,
                    ModalBodyComponent: ContractModalBodyName,
                    onEdit: handleEditObject,
                    fieldsToUpdate: ['name'],
                    makeValidationSchema: contractNameValidationSchema,
                }} >
                <>{contract.name}</>
            </PartialEditTrigger >
            {' '}
            <PartialEditTrigger
                modalProps={{
                    initialData: contract,
                    modalTitle: 'Edycja statusu',
                    repository: contractsRepository,
                    ModalBodyComponent: ContractModalBodyStatus,
                    onEdit: handleEditObject,
                    fieldsToUpdate: ['status'],
                    makeValidationSchema: contractStatusValidationSchema

                }} >
                <ContractStatusBadge status={contract.status} />
            </PartialEditTrigger >
        </>;
    }

    function renderEndDate(contract: OurContract | OtherContract) {
        const { endDate } = contract;
        const daysLeft = ToolsDate.countDaysLeftTo(endDate);

        return <>
            <div>
                <DateEditTrigger
                    contract={contract}
                    date={endDate}
                    onEdit={handleEditObject}
                />
            </div>
            <div><DaysLeftBadge daysLeft={daysLeft} /></div>
        </>;
    }

    function renderStartDate(contract: OurContract | OtherContract) {
        const { startDate } = contract;
        return <div>
            <DateEditTrigger
                contract={contract}
                date={startDate}
                onEdit={handleEditObject}
            />
        </div>
    }

    function handleEditObject(object: OurContract | OtherContract) {
        setContracts(contracts.map((o) => (o.id === object.id ? object : o)));
        setExternalUpdate(prevState => prevState + 1);
    }

    function renderRemainingValue(contract: OurContract | OtherContract) {
        if (!contract.ourId ||
            (!contract._remainingNotIssuedValue || !contract._remainingNotScheduledValue))
            return <></>;
        const formatedNotScheduledValue = Tools.formatNumber(contract._remainingNotScheduledValue || 0, 0);
        const formatedNotIssuedValue = Tools.formatNumber(contract._remainingNotIssuedValue || 0, 0);
        return <>
            <MyTooltip content='Różnica pomiędzy wartością wysłanych faktur a wartością umowy' placement='right'>
                <div className="text-end text-success">{formatedNotIssuedValue}</div>
            </MyTooltip>
            <MyTooltip content='Różnica pomiędzy wartością wszystkich  faktur w witrynie a wartością umowy' placement='right'>
                <div className="text-end text-danger">{formatedNotScheduledValue}</div>
            </MyTooltip>
        </>;
    }

    function makeTablestructure() {
        const tableStructure = [
            { header: 'Projekt', renderTdBody: (contract: OurContract | OtherContract) => <>{contract._parent.ourId}</> },
            { header: 'Oznaczenie', objectAttributeToShow: 'ourId' },
            { header: 'Numer', objectAttributeToShow: 'number' },
            { header: 'Nazwa', renderTdBody: (contract: OurContract | OtherContract) => renderName(contract) },
            { header: 'Rozpoczęcie', renderTdBody: (contract: OurContract | OtherContract) => renderStartDate(contract) },
            { header: 'Zakończenie', renderTdBody: (contract: OurContract | OtherContract) => renderEndDate(contract) },
        ];

        const allowedRoles = [
            MainSetup.SystemRoles.ADMIN.systemName,
            MainSetup.SystemRoles.ENVI_MANAGER.systemName,
        ];

        if (MainSetup.isRoleAllowed(allowedRoles)) {
            tableStructure.push({ header: 'Do rozliczenia', renderTdBody: (contract) => renderRemainingValue(contract) });
        }
        return tableStructure;
    }
    return (
        <Card>
            <Card.Body>
                <Card.Title>Kończące się Kontrakty</Card.Title>
                <FilterableTable<OurContract | OtherContract>
                    id='contracts'
                    title={''}
                    tableStructure={makeTablestructure()}
                    //EditButtonComponent={ContractEditModalButton}
                    isDeletable={false}
                    repository={contractsRepository}
                    selectedObjectRoute={'/contract/'}
                    initialObjects={contracts}
                    externalUpdate={externalUpdate}
                />
            </Card.Body>
        </Card>
    );
}


type DateEditTriggerProps = {
    date: string,
    contract: OurContract | OtherContract
    onEdit: (contract: OurContract | OtherContract) => void
}

function DateEditTrigger({ date, contract, onEdit }: DateEditTriggerProps) {
    return (
        <PartialEditTrigger
            modalProps={{
                initialData: contract,
                modalTitle: 'Edycja dat',
                repository: contractsRepository,
                ModalBodyComponent: ContractModalBodyDates,
                onEdit: onEdit,
                fieldsToUpdate: ['startDate', 'endDate', 'guaranteeEndDate'],
                makeValidationSchema: contractDatesValidationSchema,
            }}
        >
            {<>
                {date
                    ? ToolsDate.dateYMDtoDMY(date)
                    : 'Jeszcze nie ustalono'
                }
            </>
            }
        </PartialEditTrigger>
    );
}