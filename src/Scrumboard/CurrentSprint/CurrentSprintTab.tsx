import React, { useEffect, useState } from "react";
import { Alert, Col, Row } from "react-bootstrap";
import { OtherContract, OurContract } from "../../../Typings/bussinesTypes";
import MainSetup from "../../React/MainSetupReact";
import { scrumContractsListRepository } from "../ScrumboardController";
import ScrumboardApi from "../ScrumboardApi";
import { useScrumboardEvents } from "../useScrumboardEvents";
import ContractsListPanel from "./ContractsListPanel";
import ContractTreePanel from "./ContractTreePanel";

type Contract = OurContract | OtherContract;

export default function CurrentSprintTab() {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [discussedByContractId, setDiscussedByContractId] = useState<Map<number, boolean>>(new Map());
    const [selectedContract, setSelectedContract] = useState<Contract | undefined>(undefined);
    const [error, setError] = useState<string | null>(null);

    async function loadAll() {
        try {
            const [contractsList, statuses] = await Promise.all([
                scrumContractsListRepository.loadItemsFromServerPOST(
                    [{ typesToInclude: "our", statuses: [MainSetup.ContractStatuses.IN_PROGRESS] }],
                    undefined,
                    { skipCache: true }
                ) as Promise<Contract[]>,
                ScrumboardApi.getContractStatuses(),
            ]);
            setContracts(contractsList);
            setDiscussedByContractId(new Map(statuses.map((s) => [s.contractId, s.discussed])));
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        }
    }

    useEffect(() => {
        // upewnij się, że lista osób (do filtra) jest załadowana
        if (!MainSetup.personsEnviRepository?.items?.length) {
            MainSetup.personsEnviRepository
                ?.loadItemsFromServerPOST([{ systemRoleName: "ENVI_EMPLOYEE" }])
                .catch(() => undefined);
        }
        loadAll();
    }, []);

    // Real-time: aktualizacja checkboxów omówienia
    useScrumboardEvents(
        {
            "contract-discussed-changed": (payload: { contractId: number; discussed: boolean }) => {
                setDiscussedByContractId((prev) => {
                    const next = new Map(prev);
                    next.set(payload.contractId, payload.discussed);
                    return next;
                });
            },
            "discussed-reset": () => setDiscussedByContractId(new Map()),
        },
        loadAll // po reconnekcie pełny refetch
    );

    async function toggleDiscussed(contractId: number, discussed: boolean) {
        // optymistycznie
        setDiscussedByContractId((prev) => new Map(prev).set(contractId, discussed));
        try {
            await ScrumboardApi.setContractDiscussed(contractId, discussed);
        } catch (err) {
            setDiscussedByContractId((prev) => new Map(prev).set(contractId, !discussed));
            setError(err instanceof Error ? err.message : String(err));
        }
    }

    return (
        <>
            {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}
            <Row>
                <Col md="3">
                    <ContractsListPanel
                        contracts={contracts}
                        discussedByContractId={discussedByContractId}
                        selectedContractId={selectedContract?.id}
                        onSelectContract={setSelectedContract}
                        onToggleDiscussed={toggleDiscussed}
                    />
                </Col>
                <Col md="9">
                    <ContractTreePanel contract={selectedContract} />
                </Col>
            </Row>
        </>
    );
}
