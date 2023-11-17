import React from 'react';
import { OtherContract, OurContract, Task } from '../../../Typings/bussinesTypes';
import { ContractStatusBadge } from '../../View/Resultsets/CommonComponents';
import FilterableTable from '../../View/Resultsets/FilterableTable/FilterableTable';
import { contractsRepository } from './ContractsController';
import { ContractsFilterBody } from './ContractsFilterBody';
import { ContractEditModalButton, OtherContractAddNewModalButton, OurContractAddNewModalButton } from './Modals/ContractModalButtons';


/**render name witch ContractStatusBadge */
function renderName(contract: OurContract | OtherContract) {
    return <>
        {contract.name} {' '}
        <ContractStatusBadge status={contract.status} />
    </>;
}

export default function ContractsSearch({ title }: { title: string }) {
    return (
        <FilterableTable<OurContract | OtherContract>
            id='contracts'
            title={title}
            FilterBodyComponent={ContractsFilterBody}
            tableStructure={[
                { header: 'Projekt', renderTdBody: (contract: OurContract | OtherContract) => <>{contract._parent.ourId}</> },
                { header: 'Oznaczenie', objectAttributeToShow: 'ourId' },
                { header: 'Numer', objectAttributeToShow: 'number' },
                { header: 'Nazwa', renderTdBody: (contract: OurContract | OtherContract) => renderName(contract) },
                { header: 'Rozpoczęcie', objectAttributeToShow: 'startDate' },
                { header: 'Zakończenie', objectAttributeToShow: 'endDate' },
                { header: 'Gwarancja do', objectAttributeToShow: 'guaranteeEndDate' },
            ]}
            AddNewButtonComponents={[OurContractAddNewModalButton, OtherContractAddNewModalButton]}
            EditButtonComponent={ContractEditModalButton}
            isDeletable={true}
            repository={contractsRepository}
            selectedObjectRoute={'/contract/'}
            shouldRetrieveDataBeforeEdit={true}
        />
    );
}