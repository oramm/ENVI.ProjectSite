import React, { useEffect, useState } from 'react';
import { Security } from '../../../../Typings/bussinesTypes';
import Tools from '../../../React/Tools';
import ToolsDate from '../../../React/ToolsDate';
import { PartialEditTrigger } from '../../../View/Modals/GeneralModalButtons';
import { DaysLeftBadge, SecurityStatusBadge } from '../../../View/Resultsets/CommonComponents';
import FilterableTable from '../../../View/Resultsets/FilterableTable/FilterableTable';
import { securitiesRepository } from '../ContractsController';
import { SecurityModalBodyDates, SecurityModalBodyDescritpion, SecurityModalBodyStatus, SecurityModalBodyValue } from './Modals/SecurityModalBodiesPartial';
import { SecurityCashAddNewModalButton, SecurityEditModalButton, SecurityGuaranteeAddNewModalButton } from './Modals/SecurityModalButtons';
import { securityDescriptionValidationSchema, securityStatusValidationSchema, securityValueValidationSchema, suecurityDatesValidationSchema } from './Modals/SecurityValidationSchema';
import { SecuritiesFilterBody } from './SecuritiesFilterBody';

export default function SecuritiesSearch({ title }: { title: string }) {
    const [securities, setSecurities] = useState([] as Security[]);
    const [externalUpdate, setExternalUpdate] = useState(0);

    useEffect(() => {
        document.title = title;
    }, [title]);

    function renderValueGeneric(security: Security, value: number, fieldsToUpdate: string[]) {
        if (security.value === undefined) return <></>
        const formatedValue = Tools.formatNumber(value);
        return <PartialEditTrigger
            modalProps={{
                initialData: security,
                ModalBodyComponent: SecurityModalBodyValue,
                makeValidationSchema: securityValueValidationSchema,
                repository: securitiesRepository,
                modalTitle: 'Edycja wartości',
                onEdit: handleEditObject,
                fieldsToUpdate: fieldsToUpdate
            }} >
            <div className="text-end">{formatedValue}</div>
        </PartialEditTrigger >
    }

    function renderValue(security: Security) {
        return renderValueGeneric(security, security.value, ['value']);
    }

    function renderReturnedValue(security: Security) {
        return renderValueGeneric(security, security.returnedValue, ['returnedValue']);
    }

    function renderRemainingValue(security: Security) {
        if (security.value === undefined) return <></>
        const formatedValue = Tools.formatNumber(security._remainingValue);
        return <div className="text-end">{formatedValue}</div>
    }

    function renderType(isCash: boolean) {
        return <>{isCash ? 'Gotówka' : 'Gwarancja'}</>;
    }

    function renderFirstPartExpiryDate(security: Security) {
        let element: JSX.Element;
        if (!security.firstPartExpiryDate) element = <>{security._contract.startDate}</>;
        const daysLeft = ToolsDate.countDaysLeftTo(security.firstPartExpiryDate);

        element = <>
            <div>{security.firstPartExpiryDate}</div>
            {daysLeft < 30 ? <div><DaysLeftBadge daysLeft={daysLeft} /></div> : ''}
        </>;
        return <PartialEditTrigger
            modalProps={{
                initialData: security,
                ModalBodyComponent: SecurityModalBodyDates,
                makeValidationSchema: suecurityDatesValidationSchema,
                repository: securitiesRepository,
                modalTitle: 'Edycja dat',
                onEdit: handleEditObject,
                fieldsToUpdate: ['firstPartExpiryDate', 'secondPartExpiryDate']
            }} >
            {element}
        </PartialEditTrigger >
    }

    function renderSecondPartExpiryDate(security: Security) {
        let element: JSX.Element;
        if (!security.secondPartExpiryDate) element = <>{security._contract.guaranteeEndDate || 'Sprawdź w umowie'}</>;
        const daysLeft = ToolsDate.countDaysLeftTo(security.secondPartExpiryDate);

        element = <>
            <div>{security.secondPartExpiryDate}</div>
            {daysLeft < 30 ? <div><DaysLeftBadge daysLeft={daysLeft} /></div> : ''}
        </>;
        return <PartialEditTrigger
            modalProps={{
                initialData: security,
                ModalBodyComponent: SecurityModalBodyDates,
                makeValidationSchema: suecurityDatesValidationSchema,
                repository: securitiesRepository,
                modalTitle: 'Edycja dat',
                onEdit: handleEditObject,
                fieldsToUpdate: ['firstPartExpiryDate', 'secondPartExpiryDate']
            }} >
            {element}
        </PartialEditTrigger >
    }

    function renderDescription(security: Security) {
        if (!security.description) return <></>;
        return <>
            <PartialEditTrigger
                modalProps={{
                    initialData: security,
                    ModalBodyComponent: SecurityModalBodyDescritpion,
                    makeValidationSchema: securityDescriptionValidationSchema,
                    repository: securitiesRepository,
                    modalTitle: 'Edycja opisu',
                    onEdit: handleEditObject,
                    fieldsToUpdate: ['description']

                }} >
                <>{security.description}</>
            </PartialEditTrigger >
            {' '}
            <PartialEditTrigger
                modalProps={{
                    initialData: security,
                    ModalBodyComponent: SecurityModalBodyStatus,
                    makeValidationSchema: securityStatusValidationSchema,
                    repository: securitiesRepository,
                    modalTitle: 'Edycja statusu',
                    onEdit: handleEditObject,
                    fieldsToUpdate: ['description']
                }} >
                <SecurityStatusBadge status={security.status} />
            </PartialEditTrigger >
        </>;
    }

    function handleEditObject(object: Security) {
        setSecurities(securitiesRepository.items.map((o) => (o.id === object.id ? object : o)));
        setExternalUpdate(prevState => prevState + 1);
    }
    return (
        <FilterableTable<Security>
            id='securities'
            title={title}
            FilterBodyComponent={SecuritiesFilterBody}
            tableStructure={[
                { header: 'Typ', renderTdBody: (security: Security) => renderType(security.isCash) },
                { header: 'Oznaczenie', renderTdBody: (security: Security) => <>{security._contract.ourId}</> },
                { header: 'Wartość', renderTdBody: (security: Security) => renderValue(security) },
                { header: 'Zwrócono', renderTdBody: (security: Security) => renderReturnedValue(security) },
                { header: 'Do zwrotu', renderTdBody: (security: Security) => renderRemainingValue(security) },
                { header: '70% Wygasa', renderTdBody: (security: Security) => renderFirstPartExpiryDate(security) },
                { header: '30% Wygasa', renderTdBody: (security: Security) => renderSecondPartExpiryDate(security) },
                { header: 'Uwagi', renderTdBody: (security: Security) => renderDescription(security) },
            ]}
            AddNewButtonComponents={[SecurityCashAddNewModalButton, SecurityGuaranteeAddNewModalButton]}
            EditButtonComponent={SecurityEditModalButton}
            isDeletable={true}
            repository={securitiesRepository}
            selectedObjectRoute={'/contract/'}
            initialObjects={securities}
            externalUpdate={externalUpdate}
        />
    );
}