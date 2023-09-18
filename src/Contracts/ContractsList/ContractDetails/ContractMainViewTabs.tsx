import React, { useEffect, useState } from "react";
import { Tab, Tabs } from 'react-bootstrap';
import { useParams } from "react-router-dom";
import { Case, CaseType, Milestone, MilestoneType, Task } from "../../../../Typings/bussinesTypes";
import { SpinnerBootstrap } from "../../../View/Resultsets/CommonComponents";
import { ContractProvider } from "../ContractContext";
import { casesRepository, caseTypesRepository, contractsRepository, milestonesRepository, milestoneTypesRepository, tasksRepository } from "../ContractsController";
import { MainContractDetailsHeader } from "./ContractMainHeader";
import ContractOtherDetails from "./ContractOtherDetails";
import ContractOurDetails from "./ContractOurDetails";
import Tasks from "./Tasks/Tasks";

export function ContractMainViewTabs() {
    const [contract, setContract] = useState(contractsRepository.currentItems[0]);
    const [miletonesTypes, setMiletonesTypes] = useState(undefined as MilestoneType[] | undefined);
    const [caseTypes, setCaseTypes] = useState(undefined as CaseType[] | undefined);
    const [milestones, setMilestones] = useState(undefined as Milestone[] | undefined);
    const [cases, setCases] = useState(undefined as Case[] | undefined);
    const [tasks, setTasks] = useState(undefined as Task[] | undefined);
    let { id } = useParams();
    useEffect(() => {
        async function fetchData() {
            if (!id) throw new Error('Nie znaleziono id w adresie url');
            const idNumber = Number(id);
            const params = { contractId: id }
            const fetchContract = contract ? undefined : contractsRepository.loadItemFromRouter(idNumber);
            const fetchMilestonesTypes = milestoneTypesRepository.loadItemsFromServer(params);
            const fetchCaseTypes = caseTypesRepository.loadItemsFromServer(params);
            const fetchMilestones = milestonesRepository.loadItemsFromServer(params);
            const fetchCases = casesRepository.loadItemsFromServer(params);
            const fetchTasks = tasksRepository.loadItemsFromServer(params);

            try {
                const [
                    contractData,
                    milestonesTypesData,
                    caseTypesData,
                    milestonesData,
                    casesData,
                    tasksData
                ] = await Promise.all([
                    fetchContract,
                    fetchMilestonesTypes,
                    fetchCaseTypes,
                    fetchMilestones,
                    fetchCases,
                    fetchTasks
                ]);
                if (contractData) setContract(contractData);
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

    if (!contract) {
        return <div>Ładuję dane... <SpinnerBootstrap /> </div>;
    }
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
                        {contract.ourId
                            ? <ContractOurDetails />
                            : <ContractOtherDetails />
                        }
                    </Tab>
                    <Tab eventKey="tasks" title="Zadania">
                        <Tasks />
                    </Tab>
                </Tabs>
            </>
        </ContractProvider>

    );
};
