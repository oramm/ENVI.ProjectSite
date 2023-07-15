import { Case, Milestone, OtherContract, OurContract, Task } from "../../Typings/bussinesTypes"

export interface ContractsWithChildren {
    id: number,
    contract: OurContract | OtherContract,
    milestonesWithCases: {
        milestone: Milestone,
        casesWithTasks: {
            caseItem: Case,
            tasks: Task[]
        }[]
    }[]
}