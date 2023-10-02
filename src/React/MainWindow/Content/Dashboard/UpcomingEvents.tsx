// UpcomingEventsCard.tsx
import React, { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { OurContract, OtherContract, Security } from '../../../../../Typings/bussinesTypes';
import { ContractStatusBadge, DaysLeftBadge } from '../../../../View/Resultsets/CommonComponents';
import FilterableTable from '../../../../View/Resultsets/FilterableTable/FilterableTable';
import MainSetup from '../../../MainSetupReact';
import Tools from '../../../Tools';
import ToolsDate from '../../../ToolsDate';
import { contractsRepository, securitiesRepository } from '../../MainWindowController';

export default function UpcomingEvents() {
    const [contracts, setContracts] = useState([] as (OurContract | OtherContract)[]);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [externalUpdate, setExternalUpdate] = useState(0);

    useEffect(() => {
        async function fetchData() {
            setDataLoaded(false);
            const endDateTo = ToolsDate.addDays(new Date(), 30);
            const [contracts] = await Promise.all([
                contractsRepository.loadItemsFromServer({
                    status: JSON.stringify([
                        MainSetup.ContractStatuses.IN_PROGRESS,
                        MainSetup.ContractStatuses.NOT_STARTED
                    ]),
                    endDateTo: endDateTo.toISOString().slice(0, 10),
                }),
            ]);
            setContracts(contracts);
            setExternalUpdate(prevState => prevState + 1);
            setDataLoaded(true);
        };

        fetchData();
    }, []);

    function renderName(contract: OurContract | OtherContract) {
        return <>
            {contract.name}
            <ContractStatusBadge status={contract.status} />
        </>;
    }

    function renderEndDate(endDate: string) {
        const daysLeft = ToolsDate.countDaysLeftTo(endDate);

        return <>
            <div>{endDate}</div>
            <div><DaysLeftBadge daysLeft={daysLeft} /></div>
        </>;
    }

    function renderValue(value: number) {
        if (value === undefined) return <></>
        const formatedValue = Tools.formatNumber(value);
        return <div className="text-end">{formatedValue}</div>
    }

    function renderType(isCash: boolean) {
        return <>{isCash ? 'Gotówka' : 'Gwarancja'}</>;
    }

    function renderFirstPartExpiryDate(security: Security) {
        if (!security.firstPartExpiryDate) return <>{security._contract.startDate}</>;
        const daysLeft = ToolsDate.countDaysLeftTo(security.firstPartExpiryDate);

        return <>
            <div>{security.firstPartExpiryDate}</div>
            {daysLeft < 30 ? <div><DaysLeftBadge daysLeft={daysLeft} /></div> : ''}
        </>;
    }

    function renderSecondPartExpiryDate(security: Security) {
        if (!security.secondPartExpiryDate) return <>{security._contract.guaranteeEndDate || 'Sprawdź w umowie'}</>;
        const daysLeft = ToolsDate.countDaysLeftTo(security.secondPartExpiryDate);

        return <>
            <div>{security.secondPartExpiryDate}</div>
            {daysLeft < 30 ? <div><DaysLeftBadge daysLeft={daysLeft} /></div> : ''}
        </>;
    }

    function renderDescription(security: Security) {
        if (!security.description) return <></>;
        return <>{security.description}</>;
    }

    return (
        <>
            <Card>
                <Card.Body>
                    <Card.Title>Kończące się Kontrakty</Card.Title>
                    <FilterableTable<OurContract | OtherContract>
                        id='contracts'
                        title={''}
                        tableStructure={[
                            { header: 'Projekt', renderTdBody: (contract: OurContract | OtherContract) => <>{contract._parent.ourId}</> },
                            { header: 'Oznaczenie', objectAttributeToShow: 'ourId' },
                            { header: 'Numer', objectAttributeToShow: 'number' },
                            { header: 'Nazwa', renderTdBody: (contract: OurContract | OtherContract) => renderName(contract) },
                            { header: 'Rozpoczęcie', objectAttributeToShow: 'startDate' },
                            { header: 'Zakończenie', renderTdBody: (contract: OurContract | OtherContract) => renderEndDate(contract.endDate) },
                        ]}
                        //EditButtonComponent={ContractEditModalButton}
                        isDeletable={false}
                        repository={contractsRepository}
                        selectedObjectRoute={'/contract/'}
                        initialObjects={contracts}
                        externalUpdate={externalUpdate}
                    />
                </Card.Body>
            </Card>
            <Card>
                <Card.Body>
                    <Card.Title>ZNWu do zwrotu</Card.Title>
                    <FilterableTable<Security>
                        id='securities'
                        title={''}
                        tableStructure={[
                            { header: 'Typ', renderTdBody: (security: Security) => renderType(security.isCash) },
                            { header: 'Oznaczenie', renderTdBody: (security: Security) => <>{security._contract.ourId}</> },
                            { header: 'Wartość', renderTdBody: (security: Security) => renderValue(security.value) },
                            { header: 'Zwrócono', renderTdBody: (security: Security) => renderValue(security.returnedValue) },
                            { header: 'Do zwrotu', renderTdBody: (security: Security) => renderValue(security._remainingValue) },
                            { header: '70% Wygasa', renderTdBody: (security: Security) => renderFirstPartExpiryDate(security) },
                            { header: '30% Wygasa', renderTdBody: (security: Security) => renderSecondPartExpiryDate(security) },
                            { header: 'Uwagi', renderTdBody: (security: Security) => renderDescription(security) },
                        ]}
                        isDeletable={true}
                        repository={securitiesRepository}
                        selectedObjectRoute={'/contract/'}
                    />
                </Card.Body>
            </Card>
        </>
    );
}
