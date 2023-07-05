import React from 'react';
import { OtherContract, OurContract, Task } from '../../../Typings/bussinesTypes';
import { TaskStatusBadge } from '../../View/Resultsets/CommonComponents';
import FilterableTable from '../../View/Resultsets/FilterableTable/FilterableTable';
import { contractsRepository } from './ContractsController';
import { ContractsFilterBody } from './ContractsFilterBody';
import { ContractEditModalButton, OtherContractAddNewModalButton, OurContractAddNewModalButton } from './Modals/ContractModalButtons';


export default function ContractsSearch({ title }: { title: string }) {
    return (
        <FilterableTable<OurContract | OtherContract>
            title={title}
            FilterBodyComponent={ContractsFilterBody}
            tableStructure={[
                { header: 'Projekt', renderTdBody: (contract: OurContract | OtherContract) => <>{contract._parent.ourId}</> },
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