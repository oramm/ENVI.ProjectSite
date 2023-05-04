import React from 'react';
import FilteredTable from '../../View/Resultsets/FilterableTable';
import ContractsController from './ContractsController';
import { ContractDeleteModalButton, ContractEditModalButton } from './Modals/ContractModalBody';
import { ContractsFilterBody } from './ContractsFilterBody';
import { OurContractAddNewModalButton } from './Modals/OurContractModalBody';
import { OtherContractAddNewModalButton } from './Modals/OtherContractModalBody';

export const contractsRepository = ContractsController.contractsRepository;
export const entitiesRepository = ContractsController.entitiesRepository;
export const projectsRepository = ContractsController.projectsRepository;

export default function ContractsSearch({ title }: { title: string }) {
    return (
        <FilteredTable
            title={title}
            FilterBodyComponent={ContractsFilterBody}
            tableStructure={{
                headers: ['Oznaczenie', 'Numer', 'Nazwa', 'Rozpoczęcie', 'Zakończenie'],
                objectAttributesToShow: ['ourId', 'number', 'name', 'startDate', 'endDate'],
            }}
            AddNewButtonComponents={[OurContractAddNewModalButton, OtherContractAddNewModalButton]}
            EditButtonComponent={ContractEditModalButton}
            DeleteButtonComponent={ContractDeleteModalButton}
            repository={contractsRepository}
            selectedObjectRoute={'/contract/'}
        />
    );
}