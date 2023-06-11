import React from 'react';
import FilterableTable from '../../View/Resultsets/FilterableTable';
import { contractsRepository } from './ContractsController';
import { ContractsFilterBody } from './ContractsFilterBody';
import { ContractEditModalButton, OtherContractAddNewModalButton, OurContractAddNewModalButton } from './Modals/ContractModalButtons';


export default function ContractsSearch({ title }: { title: string }) {
    return (
        <FilterableTable
            title={title}
            FilterBodyComponent={ContractsFilterBody}
            tableStructure={[
                { header: 'Oznaczenie', objectAttributeToShow: 'ourId' },
                { header: 'Numer', objectAttributeToShow: 'number' },
                { header: 'Nazwa', objectAttributeToShow: 'name' },
                { header: 'Rozpoczęcie', objectAttributeToShow: 'startDate' },
                { header: 'Zakończenie', objectAttributeToShow: 'endDate' },
            ]}
            AddNewButtonComponents={[OurContractAddNewModalButton, OtherContractAddNewModalButton]}
            EditButtonComponent={ContractEditModalButton}
            isDeletable={true}
            repository={contractsRepository}
            selectedObjectRoute={'/contract/'}
        />
    );
}