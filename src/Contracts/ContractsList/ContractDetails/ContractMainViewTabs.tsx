import React, { useEffect, useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { useLocation, useParams } from "react-router-dom";
import { OtherContract, OurContract } from "../../../../Typings/bussinesTypes";
import RepositoryReact from "../../../React/RepositoryReact";
import { SpinnerBootstrap } from "../../../View/Resultsets/CommonComponents";
import { ContractDetailsProvider } from "./ContractDetailsContext";
import { ContractMainHeader } from "./ContractMainHeader";
import ContractOtherDetails from "./ContractOtherDetails";
import ContractOurDetails from "./ContractOurDetails";
import Tasks from "./Tasks/Tasks";

export function ContractMainViewTabs() {
    const location = useLocation();
    const contractsRepository = createContractRepository();

    const [contract, setContract] = useState(undefined as OurContract | OtherContract | undefined);
    let { id } = useParams();

    useEffect(() => {
        console.log(`ContractMainViewTabs: useEffect(() => { id: ${contract?.id}`);
    }, [contract]);

    useEffect(() => {
        async function fetchData() {
            if (!id) throw new Error("Nie znaleziono id w adresie url");
            const contractData = (await contractsRepository.loadItemsFromServerPOST([{ id }]))[0];
            setContract(contractData);
            initContractRepository(contractData);
            const idNumber = Number(id);
            const titleCOntractLabel = "ourId" in contractData ? contractData.ourId : contractData.number;
            document.title = `Umowa ${titleCOntractLabel || idNumber}`;
        }

        fetchData();
    }, []);

    function createContractRepository() {
        const repository = new RepositoryReact<OurContract | OtherContract>({
            actionRoutes: {
                getRoute: "contracts",
                addNewRoute: "contractReact",
                editRoute: "contract",
                deleteRoute: "contract",
            },
            name: "contracts",
        });
        let repositoryDataFromRoute = location?.state?.repository as RepositoryReact<OurContract | OtherContract>;
        if (repositoryDataFromRoute) {
            repository.items = repositoryDataFromRoute.items;
            repository.currentItems = repositoryDataFromRoute.currentItems;
        }
        return repository;
    }

    function initContractRepository(contractData: OurContract | OtherContract) {
        if (!contractsRepository.currentItems.find((c) => c.id === contractData.id))
            contractsRepository.items.push(contractData);
        contractsRepository.addToCurrentItems(contractData.id);
    }

    if (!contract) {
        return (
            <div>
                Ładuję dane... <SpinnerBootstrap />{" "}
            </div>
        );
    } else
        return (
            <ContractDetailsProvider
                contract={contract}
                setContract={setContract}
                contractsRepository={contractsRepository}
            >
                <>
                    <ContractMainHeader />
                    <Tabs defaultActiveKey="general" id="uncontrolled-tab-example">
                        <Tab eventKey="general" title="Dane ogólne">
                            {"ourId" in contract ? <ContractOurDetails /> : <ContractOtherDetails />}
                        </Tab>
                        <Tab eventKey="tasks" title="Zadania">
                            <Tasks />
                        </Tab>
                    </Tabs>
                </>
            </ContractDetailsProvider>
        );
}
