import React from 'react';
import { Badge } from 'react-bootstrap';
import { Color } from 'react-bootstrap/esm/types';
import { Security } from '../../../../Typings/bussinesTypes';
import Tools from '../../../React/Tools';
import ToolsDate from '../../../React/ToolsDate';
import { DaysLeftBadge } from '../../../View/Resultsets/CommonComponents';
import FilterableTable from '../../../View/Resultsets/FilterableTable/FilterableTable';
import { securitiesRepository } from '../ContractsController';
import { SecurityCashAddNewModalButton, SecurityEditModalButton, SecurityGuaranteeAddNewModalButton } from './Modals/SecurityModalButtons';
import { SecuritiesFilterBody } from './SecuritiesFilterBody';

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

export default function SecuritiesSearch({ title }: { title: string }) {
    return (
        <FilterableTable<Security>
            id='securities'
            title={title}
            FilterBodyComponent={SecuritiesFilterBody}
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
            AddNewButtonComponents={[SecurityCashAddNewModalButton, SecurityGuaranteeAddNewModalButton]}
            EditButtonComponent={SecurityEditModalButton}
            isDeletable={true}
            repository={securitiesRepository}
            selectedObjectRoute={'/contract/'}
        />
    );
}