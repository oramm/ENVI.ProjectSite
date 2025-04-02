import { Case, MilestoneData, OtherContract, OurContract, Task } from "../../Typings/bussinesTypes";

export interface ContractsWithChildren {
    id: number;
    contract: OurContract | OtherContract;
    milestonesWithCases: {
        milestone: MilestoneData;
        casesWithTasks: {
            caseItem: Case;
            tasks: Task[];
        }[];
    }[];
}
