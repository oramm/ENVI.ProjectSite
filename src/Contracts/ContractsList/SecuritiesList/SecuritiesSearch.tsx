import React from 'react';
import { Security } from '../../../../Typings/bussinesTypes';
import Tools from '../../../React/Tools';
import FilterableTable from '../../../View/Resultsets/FilterableTable/FilterableTable';
import { securitiesRepository } from '../ContractsController';
import { SecurityCashAddNewModalButton, SecurityEditModalButton, SecurityGuarantyAddNewModalButton } from './Modals/SecurityModalButtons';
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
    return <>{security.firstPartExpiryDate}</>;
}

function renderSecondPartExpiryDate(security: Security) {
    if (!security.secondPartExpiryDate) return <>{'Sprawdź w umowie'}</>;
    return <>{security.secondPartExpiryDate}</>;
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
                { header: 'Wygasa 70%', renderTdBody: (security: Security) => renderFirstPartExpiryDate(security) },
                { header: 'Wygasa 30%', renderTdBody: (security: Security) => renderSecondPartExpiryDate(security) },
                { header: 'Uwagi', objectAttributeToShow: 'description' },
            ]}
            AddNewButtonComponents={[SecurityCashAddNewModalButton, SecurityGuarantyAddNewModalButton]}
            EditButtonComponent={SecurityEditModalButton}
            isDeletable={true}
            repository={securitiesRepository}
            selectedObjectRoute={'/contract/'}
        />
    );
}