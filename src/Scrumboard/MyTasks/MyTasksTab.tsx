import React, { useEffect, useMemo, useState } from "react";
import { Col, ListGroup, Row } from "react-bootstrap";
import { Case, PersonData, Task } from "../../../Typings/bussinesTypes";
import MainSetup from "../../React/MainSetupReact";
import { SpinnerBootstrap } from "../../View/Resultsets/CommonComponents";
import FilterableTable from "../../View/Resultsets/FilterableTable/FilterableTable";
import { SectionNode } from "../../View/Resultsets/FilterableTable/Section";
import { TaskEditModalButton } from "../../TasksGlobal/Modals/TasksGlobalModalButtons";
import { ContractsWithChildren } from "../../TasksGlobal/TasksGlobalTypes";
import { buildScrumTree } from "../CurrentSprint/buildScrumTree";
import ScrumTaskRow from "../CurrentSprint/ScrumTaskRow";
import ScrumboardApi from "../ScrumboardApi";
import { scrumContractsWithChildrenRepository, scrumMyTasksRepository } from "../ScrumboardController";
import MyTasksFilterPanel, { MyTasksFilter } from "./MyTasksFilterPanel";

/** Zakładka "Moje zadania": zadania zalogowanego użytkownika (lub wybranej osoby dla ADMIN/MANAGER). */
export default function MyTasksTab() {
    const isManager = MainSetup.isRoleAllowed(["ADMIN", "ENVI_MANAGER"]);
    const [persons, setPersons] = useState<PersonData[]>([]);
    const [selectedPerson, setSelectedPerson] = useState<PersonData | undefined>(undefined);
    const [ownerData, setOwnerData] = useState<ContractsWithChildren[]>([]);
    const [fullData, setFullData] = useState<ContractsWithChildren[]>([]);
    const [fullTree, setFullTree] = useState(false);
    const [onlyMine, setOnlyMine] = useState(false);
    const [hoursFilledOnly, setHoursFilledOnly] = useState(false);
    const [loading, setLoading] = useState(false);
    const [externalUpdate, setExternalUpdate] = useState(0);
    const [filter, setFilter] = useState<MyTasksFilter>({});
    const selfId = MainSetup.getCurrentUserAsPerson()?.id;
    const filterCaseId = (filter._case as Case | undefined)?.id;

    // Inicjalizacja: lista osób + domyślnie zalogowany na górze
    useEffect(() => {
        async function init() {
            const self = MainSetup.getCurrentUserAsPerson();
            if (!isManager) {
                if (self) {
                    setPersons([self]);
                    setSelectedPerson(self);
                }
                return;
            }
            // pracownicy ENVI + manager z configu (id 386) — te same osoby co w Podsumowaniu/Planowaniu
            const scrumboardPersons = await ScrumboardApi.getPersons();
            const ordered = self
                ? [self, ...scrumboardPersons.filter((p) => p.id !== self.id)]
                : scrumboardPersons;
            setPersons(ordered);
            setSelectedPerson(self ?? ordered[0]);
        }
        init();
    }, [isManager]);

    // Drzewo zadań osoby (tylko gałęzie z jej zadaniami — filtr po stronie serwera).
    // Kontrakt i statusy z panelu filtrów doładowywane z serwera (jak w „Projekty i zadania").
    useEffect(() => {
        if (!selectedPerson) return;
        async function load() {
            setLoading(true);
            const condition: Record<string, unknown> = { _owner: selectedPerson };
            if (filter._contract) condition._contract = filter._contract;
            if (filter.statuses && filter.statuses.length)
                condition.statuses = filter.statuses;
            else condition.statusType = "active";
            const result = (await scrumContractsWithChildrenRepository.loadItemsFromServerPOST(
                [condition],
                undefined,
                { skipCache: true }
            )) as ContractsWithChildren[];
            setOwnerData(result);
            setFullData([]); // unieważnij pełne drzewo poprzedniej osoby / filtra
            setExternalUpdate((n) => n + 1);
            setLoading(false);
        }
        load();
    }, [selectedPerson, filter]);

    // Pełne drzewo (wszystkie zadania w kontraktach osoby) — ładowane leniwie po włączeniu przełącznika
    useEffect(() => {
        if (!fullTree || fullData.length > 0 || ownerData.length === 0) return;
        async function loadFull() {
            setLoading(true);
            const orConditions = ownerData.map((c) => ({ contractId: c.contract.id, statusType: "active" }));
            const result = (await scrumContractsWithChildrenRepository.loadItemsFromServerPOST(
                orConditions,
                undefined,
                { skipCache: true }
            )) as ContractsWithChildren[];
            setFullData(result);
            setExternalUpdate((n) => n + 1);
            setLoading(false);
        }
        loadFull();
    }, [fullTree, ownerData, fullData.length]);

    // nie pokazuj kontraktów zakończonych
    const data = (fullTree && fullData.length > 0 ? fullData : ownerData).filter(
        (c) => c.contract.status !== MainSetup.ContractStatuses.FINISHED
    );

    // Zmiana filtrów musi wymusić odświeżenie sekcji w FilterableTable
    useEffect(() => {
        setExternalUpdate((n) => n + 1);
    }, [fullTree, onlyMine, hoursFilledOnly]);

    const sections: SectionNode<Task>[] = useMemo(
        () =>
            buildScrumTree(data, {
                leavesRepository: scrumMyTasksRepository,
                ownerId: onlyMine ? selfId : undefined,
                hoursFilledOnly,
                caseId: filterCaseId,
            }),
        [data, onlyMine, hoursFilledOnly, selfId, filterCaseId]
    );

    const tree = loading ? (
        <SpinnerBootstrap />
    ) : ownerData.length === 0 ? (
        <div className="text-muted p-3">Brak zadań przypisanych do tej osoby.</div>
    ) : (
        <FilterableTable<Task>
            id={`scrumMyTasks_${selectedPerson?.id ?? "none"}_${fullTree ? "full" : "own"}`}
            title="Moje zadania"
            showTableHeader={false}
            repository={scrumMyTasksRepository}
            EditButtonComponent={TaskEditModalButton}
            initialSections={sections}
            snapshotMode="criteria-only"
            externalUpdate={externalUpdate}
            tableStructure={[
                {
                    header: "Zadania",
                    renderTdBody: (task: Task, isActive?: boolean) => (
                        <ScrumTaskRow task={task} isActive={isActive} />
                    ),
                    colLg: 11,
                },
            ]}
        />
    );

    return (
        <Row>
            <Col md="3">
                <MyTasksFilterPanel
                    onApply={setFilter}
                    toggles={{
                        fullTree,
                        onlyMine,
                        hoursFilledOnly,
                        setFullTree,
                        setOnlyMine,
                        setHoursFilledOnly,
                    }}
                />
                {isManager && (
                    <ListGroup>
                        {persons.map((person) => (
                            <ListGroup.Item
                                key={person.id}
                                action
                                active={person.id === selectedPerson?.id}
                                onClick={() => setSelectedPerson(person)}
                            >
                                {person.name} {person.surname}
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}
            </Col>
            <Col md="9">{tree}</Col>
        </Row>
    );
}
