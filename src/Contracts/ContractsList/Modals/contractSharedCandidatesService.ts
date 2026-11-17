import MainSetup from "../../../React/MainSetupReact";
import ToolsFetch from "../../../React/Tools/ToolsFetch";

export interface ContractSharedCandidate {
    milestoneId: number;
    milestoneName: string;
    sourceContractId: number;
    sourceContractName: string;
    sourceContractAlias: string;
    sourceContractOurId: string | null;
    expectedRevision: string;
}

export function fetchContractSharedCandidates(projectOurId: string, contractTypeId: number): Promise<ContractSharedCandidate[]> {
    const query = new URLSearchParams({ projectOurId, contractTypeId: String(contractTypeId) });
    return ToolsFetch.fetchJsonWithSafeError(
        `${MainSetup.serverUrl}milestones/sharing/contract-candidates?${query}`,
        { method: "GET", credentials: "include" },
    );
}
