import React, { createContext, useContext } from "react";
import { Case, CaseType, Milestone, MilestoneType, OtherContract, OurContract, Project, Task } from "../../../Typings/bussinesTypes";


// Utwórz kontekst
const ContractContext = createContext<{
    contract?: OurContract | OtherContract,
    setContract?: React.Dispatch<React.SetStateAction<OurContract | OtherContract>>,
    caseTypes?: CaseType[] | undefined,
    setCaseTypes?: React.Dispatch<React.SetStateAction<CaseType[] | undefined>>,
    miletonesTypes?: MilestoneType[] | undefined,
    setMiletonesTypes?: React.Dispatch<React.SetStateAction<MilestoneType[] | undefined>>,
    milestones?: Milestone[] | undefined,
    setMilestones?: React.Dispatch<React.SetStateAction<Milestone[] | undefined>>,
    cases?: Case[] | undefined,
    setCases?: React.Dispatch<React.SetStateAction<Case[] | undefined>>,
    tasks?: Task[] | undefined,
    setTasks?: React.Dispatch<React.SetStateAction<Task[] | undefined>>,
    project?: Project,
    setProject?: React.Dispatch<React.SetStateAction<Project>>
}>({});

type ContractProviderProps = {
    contract?: OurContract | OtherContract,
    setContract?: React.Dispatch<React.SetStateAction<OurContract | OtherContract>>,
    caseTypes?: CaseType[] | undefined,
    setCaseTypes?: React.Dispatch<React.SetStateAction<CaseType[] | undefined>>,
    miletonesTypes?: MilestoneType[] | undefined,
    setMiletonesTypes?: React.Dispatch<React.SetStateAction<MilestoneType[] | undefined>>,
    milestones?: Milestone[] | undefined,
    setMilestones?: React.Dispatch<React.SetStateAction<Milestone[] | undefined>>,
    cases?: Case[] | undefined,
    setCases?: React.Dispatch<React.SetStateAction<Case[] | undefined>>,
    tasks?: Task[] | undefined,
    setTasks?: React.Dispatch<React.SetStateAction<Task[] | undefined>>,
    project?: Project,
    setProject?: React.Dispatch<React.SetStateAction<Project>>
}

// Twórz dostawcę kontekstu, który przechowuje stan faktury
export function ContractProvider({
    contract,
    setContract,
    caseTypes,
    setCaseTypes,
    miletonesTypes,
    setMiletonesTypes,
    milestones,
    setMilestones,
    cases,
    setCases,
    tasks,
    setTasks,
    project,
    setProject,
    children
}: React.PropsWithChildren<ContractProviderProps>) {

    return (
        <ContractContext.Provider
            value={{
                contract,
                setContract,
                caseTypes,
                setCaseTypes,
                miletonesTypes,
                setMiletonesTypes,
                milestones,
                setMilestones,
                cases,
                setCases,
                tasks,
                setTasks,
                project,
                setProject,
            }}>
            {children}
        </ContractContext.Provider>
    );
}

// Tworzy własny hook, który będzie używany przez komponenty podrzędne do uzyskania dostępu do faktury
export function useContract() {
    return useContext(ContractContext);
}