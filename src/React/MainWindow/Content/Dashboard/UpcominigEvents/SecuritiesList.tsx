import React, { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { Security } from '../../../../../../Typings/bussinesTypes';
import { SecurityModalBodyStatus } from '../../../../../Contracts/ContractsList/SecuritiesList/Modals/SecurityModalBodiesPartial';
import { securityDescriptionValidationSchema } from '../../../../../Contracts/ContractsList/SecuritiesList/Modals/SecurityValidationSchema';
import { PartialEditTrigger } from '../../../../../View/Modals/GeneralModalButtons';
import { DaysLeftBadge, SecurityStatusBadge } from '../../../../../View/Resultsets/CommonComponents';
import FilterableTable from '../../../../../View/Resultsets/FilterableTable/FilterableTable';
import MainSetup from '../../../../MainSetupReact';
import Tools from '../../../../Tools';
import ToolsDate from '../../../../ToolsDate';
import { securitiesRepository } from '../../../MainWindowController';

export default function SecuritiesList() {
    const [securities, setSecurities] = useState([] as Security[]);
    const [externalUpdate, setExternalUpdate] = useState(0);
    const [dataLoaded, setDataLoaded] = useState(false);

    useEffect(() => {
        async function fetchData() {
            setDataLoaded(false);
            const expiryDateTo = ToolsDate.addDays(new Date(), 30);
            const securities = await securitiesRepository.loadItemsFromServerPOST([
                {
                    status: [
                        MainSetup.SecurityStatus.NOT_ISSUED,
                        MainSetup.SecurityStatus.ISSUED,
                        MainSetup.SecurityStatus.PROLONGED,
                        MainSetup.SecurityStatus.TO_PROLONG,
                    ],
                    firstPartExpiryDateTo: expiryDateTo.toISOString().slice(0, 10),
                },
                {
                    status: [
                        MainSetup.SecurityStatus.NOT_ISSUED,
                        MainSetup.SecurityStatus.ISSUED,
                        MainSetup.SecurityStatus.PROLONGED,
                        MainSetup.SecurityStatus.TO_PROLONG,
                        MainSetup.SecurityStatus.RETURNED_1ST_PART,
                    ],
                    secondPartExpiryDateTo: expiryDateTo.toISOString().slice(0, 10),
                }
            ]);

            setSecurities(securities);
            setExternalUpdate(prevState => prevState + 1);
            setDataLoaded(true);
        };

        fetchData();
    }, []);

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
        return <>
            <div>
                {security.description} {' '}
                <PartialEditTrigger
                    modalProps={{
                        initialData: security,
                        ModalBodyComponent: SecurityModalBodyStatus,
                        makeValidationSchema: securityDescriptionValidationSchema,
                        repository: securitiesRepository,
                        modalTitle: 'Edycja statusu',
                        onEdit: handleEditObject,
                        fieldsToUpdate: ['description']
                    }} >
                    <SecurityStatusBadge status={security.status} />
                </PartialEditTrigger >
            </div></>;
    }

    function handleEditObject(object: Security) {
        setSecurities(securities.map((o) => (o.id === object.id ? object : o)));
        setExternalUpdate(prevState => prevState + 1);
    }

    return (
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
                    externalUpdate={externalUpdate}
                    initialObjects={securities}
                />
            </Card.Body>
        </Card>
    );
}