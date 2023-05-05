import React from 'react';
import FilterableTable from '../../View/Resultsets/FilterableTable';
import ContractsController from './ContractsController';
import { ContractsFilterBody } from './ContractsFilterBody';
import { ContractDeleteModalButton, ContractEditModalButton, OtherContractAddNewModalButton, OurContractAddNewModalButton } from './Modals/ContractModalButtons';

export const contractsRepository = ContractsController.contractsRepository;
export const entitiesRepository = ContractsController.entitiesRepository;
export const projectsRepository = ContractsController.projectsRepository;

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
            DeleteButtonComponent={ContractDeleteModalButton}
            repository={contractsRepository}
            selectedObjectRoute={'/contract/'}
        />
    );
}