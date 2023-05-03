import React, { FormEventHandler, useEffect, useState } from 'react';
import FilteredTable, { FilterTableRowProps } from '../../View/Resultsets/FilterableTable';
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
            tableHeaders={['Oznaczenie', 'Numer', 'Nazwa', 'Data początku', 'Data końca']}
            RowComponent={ContractSearchTableRow}
            AddNewButtons={[OurContractAddNewModalButton, OtherContractAddNewModalButton]}
            repository={contractsRepository}
        />
    );
}

function ContractSearchTableRow({ dataObject, isActive, onEdit, onDelete, onIsReadyChange }: FilterTableRowProps): JSX.Element {
    if (!onIsReadyChange) throw new Error('onIsReadyChange is not defined');
    return <>
        <td>{dataObject.ourId}</td>
        <td>{dataObject.number}</td>
        <td>{dataObject.name}</td>
        <td>{dataObject.startDate}</td>
        <td>{dataObject.endDate}</td>
        {isActive && (
            <td>
                {onEdit && (
                    <ContractEditModalButton
                        modalProps={{ onEdit, initialData: dataObject, }}
                        isOurContract={dataObject.ourId}
                    />
                )}
                {onDelete && (
                    <ContractDeleteModalButton
                        modalProps={{ onDelete, initialData: dataObject }}

                    />
                )}
            </td>
        )}
    </>;
}