import React, { useEffect, useState } from "react";
import { Tab, Tabs } from 'react-bootstrap';
import { Case, CaseType, Milestone, MilestoneType, Task } from "../../../../Typings/bussinesTypes";
import { ContractProvider } from "../ContractContext";
import { casesRepository, caseTypesRepository, contractsRepository, milestonesRepository, milestoneTypesRepository, tasksRepository } from "../ContractsController";
import ContractDetails from "./ContractDetails";
import { MainContractDetailsHeader } from "./ContractMainHeader";
import Tasks from "./Tasks/Tasks";

export function ContractMainViewTabs() {
    const [contract, setContract] = useState(contractsRepository.currentItems[0] || contractsRepository.getItemFromRouter());
    const [miletonesTypes, setMiletonesTypes] = useState(undefined as MilestoneType[] | undefined);
    const [caseTypes, setCaseTypes] = useState(undefined as CaseType[] | undefined);
    const [milestones, setMilestones] = useState(undefined as Milestone[] | undefined);
    const [cases, setCases] = useState(undefined as Case[] | undefined);
    const [tasks, setTasks] = useState(undefined as Task[] | undefined);

    useEffect(() => {
        async function fetchData() {
            const contractIdFormData = new FormData();
            contractIdFormData.append('contractId', contract.id.toString());

            const fetchMilestonesTypes = milestoneTypesRepository.loadItemsFromServer(contractIdFormData);
            const fetchCaseTypes = caseTypesRepository.loadItemsFromServer(contractIdFormData);
            const fetchMilestones = milestonesRepository.loadItemsFromServer(contractIdFormData);
            const fetchCases = casesRepository.loadItemsFromServer(contractIdFormData);
            const fetchTasks = tasksRepository.loadItemsFromServer(contractIdFormData);

            try {
                const [
                    milestonesTypesData,
                    caseTypesData,
                    milestonesData,
                    casesData,
                    tasksData
                ] = await Promise.all([
                    fetchMilestonesTypes,
                    fetchCaseTypes,
                    fetchMilestones,
                    fetchCases,
                    fetchTasks
                ]);

                setMiletonesTypes(milestonesTypesData);
                setCaseTypes(caseTypesData);
                setMilestones(milestonesData);
                setCases(casesData);
                setTasks(tasksData);

            } catch (error) {
                console.error("Error fetching data", error);
                // Handle error as you see fit
            }
        };

        fetchData();
    }, []);


    return (
        <ContractProvider
            contract={contract}
            setContract={setContract}
            caseTypes={caseTypes}
            setCaseTypes={setCaseTypes}
            miletonesTypes={miletonesTypes}
            setMiletonesTypes={setMiletonesTypes}
            milestones={milestones}
            setMilestones={setMilestones}
            cases={cases}
            setCases={setCases}
            tasks={tasks}
            setTasks={setTasks}
        >
            <>
                <MainContractDetailsHeader />
                <Tabs defaultActiveKey="general" id="uncontrolled-tab-example">
                    <Tab eventKey="general" title="Dane ogólne">
                        <ContractDetails />
                    </Tab>
                    <Tab eventKey="tasks" title="Zadania">
                        <Tasks />
                    </Tab>
                </Tabs>
            </>
        </ContractProvider>

    );
};
