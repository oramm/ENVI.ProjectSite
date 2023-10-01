// UpcomingEventsCard.tsx
import React, { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { OurContract, OtherContract } from '../../../../../Typings/bussinesTypes';
import { ContractStatusBadge } from '../../../../View/Resultsets/CommonComponents';
import FilterableTable from '../../../../View/Resultsets/FilterableTable/FilterableTable';
import ToolsDate from '../../../ToolsDate';
import { contractsRepository } from '../../MainWindowController';

export default function UpcomingEvents() {
    const [contracts, setContracts] = useState([] as (OurContract | OtherContract)[]);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [externalUpdate, setExternalUpdate] = useState(0);

    useEffect(() => {
        async function fetchData() {
            setDataLoaded(false);
            const endDateTo = ToolsDate.addDays(new Date(), 30);
            const [contracts] = await Promise.all([
                contractsRepository.loadItemsFromServer({
                    statusType: 'active',
                    endDateTo: endDateTo.toISOString().slice(0, 10),
                }),
            ]);
            setContracts(contracts);
            setExternalUpdate(prevState => prevState + 1);
            setDataLoaded(true);
        };

        fetchData();
    }, []);

    function renderName(contract: OurContract | OtherContract) {
        return <>
            {contract.name}
            <ContractStatusBadge status={contract.status} />
        </>;
    }

    return (
        <Card>
            <Card.Body>
                <Card.Title>Kończące się Kontrakty</Card.Title>
                <Card.Text>
                    <FilterableTable<OurContract | OtherContract>
                        id='contracts'
                        title={''}
                        //FilterBodyComponent={ContractsFilterBody}
                        tableStructure={[
                            { header: 'Projekt', renderTdBody: (contract: OurContract | OtherContract) => <>{contract._parent.ourId}</> },
                            { header: 'Oznaczenie', objectAttributeToShow: 'ourId' },
                            { header: 'Numer', objectAttributeToShow: 'number' },
                            { header: 'Nazwa', renderTdBody: (contract: OurContract | OtherContract) => renderName(contract) },
                            { header: 'Rozpoczęcie', objectAttributeToShow: 'startDate' },
                            { header: 'Zakończenie', objectAttributeToShow: 'endDate' },
                            { header: 'Gwarancja do', objectAttributeToShow: 'guaranteeEndDate' },
                        ]}
                        //AddNewButtonComponents={[OurContractAddNewModalButton, OtherContractAddNewModalButton]}
                        //EditButtonComponent={ContractEditModalButton}
                        isDeletable={false}
                        repository={contractsRepository}
                        selectedObjectRoute={'/contract/'}
                        externalUpdate={externalUpdate}
                    />
                </Card.Text>
            </Card.Body>
        </Card>
    );
}
