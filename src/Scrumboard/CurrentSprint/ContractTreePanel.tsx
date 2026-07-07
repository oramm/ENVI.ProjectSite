import React, { useEffect, useMemo, useState } from "react";
import { Form } from "react-bootstrap";
import { OtherContract, OurContract, PersonData, Task } from "../../../Typings/bussinesTypes";
import MainSetup from "../../React/MainSetupReact";
import { SpecificAddNewModalButtonProps } from "../../View/Modals/ModalsTypes";
import { SpinnerBootstrap } from "../../View/Resultsets/CommonComponents";
import FilterableTable from "../../View/Resultsets/FilterableTable/FilterableTable";
import { SectionNode } from "../../View/Resultsets/FilterableTable/Section";
import { TaskEditModalButton } from "../../TasksGlobal/Modals/TasksGlobalModalButtons";
import { ContractsWithChildren } from "../../TasksGlobal/TasksGlobalTypes";
import { scrumContractsWithChildrenRepository, scrumTasksRepository } from "../ScrumboardController";
import { buildScrumTree } from "./buildScrumTree";
import ScrumTaskRow from "./ScrumTaskRow";

type Contract = OurContract | OtherContract;

interface Props {
    contract: Contract | undefined;
}

/** Prawy panel: drzewo wybranej umowy ENVI + kontraktów powiązanych, z filtrem osoby. */
export default function ContractTreePanel({ contract }: Props) {
    const [data, setData] = useState<ContractsWithChildren[]>([]);
    const [loading, setLoading] = useState(false);
    const [ownerId, setOwnerId] = useState<number | undefined>(undefined);
    const [externalUpdate, setExternalUpdate] = useState(0);

    const employees = useMemo<PersonData[]>(() => MainSetup.personsEnviRepository?.items ?? [], []);

    useEffect(() => {
        if (!contract) {
            setData([]);
            return;
        }
        async function load() {
            setLoading(true);
            const orConditions: any[] = [{ contractId: contract!.id, statusType: "active" }];
            if ("ourId" in contract!) {
                orConditions.push({ ourIdRelated: (contract as OurContract).ourId, statusType: "active" });
            }
            const result = (await scrumContractsWithChildrenRepository.loadItemsFromServerPOST(
                orConditions,
                undefined,
                { skipCache: true }
            )) as ContractsWithChildren[];
            setData(result);
            setOwnerId(undefined);
            setExternalUpdate((n) => n + 1);
            setLoading(false);
        }
        load();
    }, [contract]);

    const sections: SectionNode<Task>[] = useMemo(
        () =>
            buildScrumTree(data, {
                ownerId,
                onlyInProgress: true,
                excludeBacklog: true,
                leavesRepository: scrumTasksRepository,
            }),
        [data, ownerId]
    );

    // Selektor osoby renderowany w wierszu nagłówka FilterableTable (obok "Zadania" i przycisku zwiń)
    const PersonFilterControl = useMemo(() => {
        const Control: React.FC<SpecificAddNewModalButtonProps<Task>> = () => (
            <div className="d-flex align-items-center gap-2">
                <Form.Label className="mb-0 small text-muted">Filtruj zadania osoby:</Form.Label>
                <Form.Select
                    size="sm"
                    style={{ width: "auto" }}
                    value={ownerId ?? ""}
                    onChange={(e) => {
                        setOwnerId(e.target.value ? Number(e.target.value) : undefined);
                        setExternalUpdate((n) => n + 1);
                    }}
                >
                    <option value="">Wszyscy</option>
                    {employees.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.name} {p.surname}
                        </option>
                    ))}
                </Form.Select>
            </div>
        );
        return Control;
    }, [ownerId, employees]);

    if (!contract) {
        return (
            <div className="text-muted p-3">
                <h5>Wybierz umowę z listy po lewej</h5>
                <p>Zobaczysz kontrakt ENVI oraz powiązane kontrakty na roboty i dostawy.</p>
            </div>
        );
    }

    if (loading) return <SpinnerBootstrap />;

    return (
        <FilterableTable<Task>
            id={`scrumTasks_${contract.id}`}
            title="Zadania"
            showTableHeader={false}
            repository={scrumTasksRepository}
            AddNewButtonComponents={[PersonFilterControl]}
            EditButtonComponent={TaskEditModalButton}
            initialSections={sections}
            snapshotMode="criteria-only"
            externalUpdate={externalUpdate}
            tableStructure={[
                { header: "Zadania", renderTdBody: (task: Task) => <ScrumTaskRow task={task} />, colLg: 11 },
            ]}
        />
    );
}
