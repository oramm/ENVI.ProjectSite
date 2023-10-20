import React, { createContext, useContext } from "react";
import RepositoryReact from "../../../React/RepositoryReact";
import { OtherContract, OurContract } from "../../../../Typings/bussinesTypes";


// Utwórz kontekst
const ContractDetailsContext = createContext<{
    contract?: OurContract | OtherContract,
    setContract?: React.Dispatch<React.SetStateAction<OurContract | OtherContract>>,
    contractsRepository?: RepositoryReact<OurContract | OtherContract>,
}>({});

type ContractDetailsProviderProps = {
    contract?: OurContract | OtherContract,
    setContract?: React.Dispatch<React.SetStateAction<OurContract | OtherContract>>,
    contractsRepository?: RepositoryReact<OurContract | OtherContract>,
}

// Twórz dostawcę kontekstu, który przechowuje stan faktury
export function ContractDetailsProvider({
    contract,
    setContract,
    contractsRepository,
    children
}: React.PropsWithChildren<ContractDetailsProviderProps>) {

    return (
        <ContractDetailsContext.Provider
            value={{
                contract,
                setContract,
                contractsRepository
            }}>
            {children}
        </ContractDetailsContext.Provider>
    );
}

// Tworzy własny hook, który będzie używany przez komponenty podrzędne do uzyskania dostępu do faktury
export function useContractDetails() {
    return useContext(ContractDetailsContext);
}