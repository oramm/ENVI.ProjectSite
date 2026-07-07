import React, { useEffect, useMemo, useState } from "react";
import { Col, Form, ListGroup, Row } from "react-bootstrap";
import { PersonData, Task } from "../../../Typings/bussinesTypes";
import MainSetup from "../../React/MainSetupReact";
import { SpecificAddNewModalButtonProps } from "../../View/Modals/ModalsTypes";
import { SpinnerBootstrap } from "../../View/Resultsets/CommonComponents";
import FilterableTable from "../../View/Resultsets/FilterableTable/FilterableTable";
import { SectionNode } from "../../View/Resultsets/FilterableTable/Section";
import { TaskEditModalButton } from "../../TasksGlobal/Modals/TasksGlobalModalButtons";
import { ContractsWithChildren } from "../../TasksGlobal/TasksGlobalTypes";
import { buildScrumTree } from "../CurrentSprint/buildScrumTree";
import ScrumTaskRow from "../CurrentSprint/ScrumTaskRow";
import ScrumboardApi from "../ScrumboardApi";
import { scrumContractsWithChildrenRepository, scrumMyTasksRepository } from "../ScrumboardController";

/** Zakładka "Moje zadania": zadania zalogowanego użytkownika (lub wybranej osoby dla ADMIN/MANAGER). */
export default function MyTasksTab() {
    const isManager = MainSetup.isRoleAllowed(["ADMIN", "ENVI_MANAGER"]);
    const [persons, setPersons] = useState<PersonData[]>([]);
    const [selectedPerson, setSelectedPerson] = useState<PersonData | undefined>(undefined);
    const [ownerData, setOwnerData] = useState<ContractsWithChildren[]>([]);
    const [fullData, setFullData] = useState<ContractsWithChildren[]>([]);
    const [fullTree, setFullTree] = useState(false);
    const [loading, setLoading] = useState(false);
    const [externalUpdate, setExternalUpdate] = useState(0);

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

    // Drzewo zadań osoby (tylko gałęzie z jej zadaniami — filtr po stronie serwera)
    useEffect(() => {
        if (!selectedPerson) return;
        async function load() {
            setLoading(true);
            const result = (await scrumContractsWithChildrenRepository.loadItemsFromServerPOST(
                [{ _owner: selectedPerson, statusType: "active" }],
                undefined,
                { skipCache: true }
            )) as ContractsWithChildren[];
            setOwnerData(result);
            setFullData([]); // unieważnij pełne drzewo poprzedniej osoby
            setExternalUpdate((n) => n + 1);
            setLoading(false);
        }
        load();
    }, [selectedPerson]);

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

    const data = fullTree && fullData.length > 0 ? fullData : ownerData;

    // Przełączenie trybu drzewa musi wymusić odświeżenie sekcji w FilterableTable
    useEffect(() => {
        setExternalUpdate((n) => n + 1);
    }, [fullTree]);

    const sections: SectionNode<Task>[] = useMemo(
        () => buildScrumTree(data, { leavesRepository: scrumMyTasksRepository }),
        [data]
    );

    // Przełącznik pełnego drzewa renderowany w wierszu nagłówka FilterableTable (obok "Moje zadania" i zwiń)
    const FullTreeControl = useMemo(() => {
        const Control: React.FC<SpecificAddNewModalButtonProps<Task>> = () => (
            <Form.Check
                type="switch"
                id="scrum-mytasks-fulltree"
                className="mb-0"
                label="Pokaż pełne drzewo kontraktów (wszystkie zadania)"
                checked={fullTree}
                onChange={(e) => setFullTree(e.target.checked)}
            />
        );
        return Control;
    }, [fullTree]);

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
            AddNewButtonComponents={[FullTreeControl]}
            EditButtonComponent={TaskEditModalButton}
            initialSections={sections}
            snapshotMode="criteria-only"
            externalUpdate={externalUpdate}
            tableStructure={[
                { header: "Zadania", renderTdBody: (task: Task) => <ScrumTaskRow task={task} />, colLg: 11 },
            ]}
        />
    );

    if (!isManager) return <div>{tree}</div>;

    return (
        <Row>
            <Col md="3">
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
            </Col>
            <Col md="9">{tree}</Col>
        </Row>
    );
}
