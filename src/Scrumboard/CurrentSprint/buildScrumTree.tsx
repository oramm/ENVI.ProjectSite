import { Case, Task } from "../../../Typings/bussinesTypes";
import MainSetup from "../../React/MainSetupReact";
import RepositoryReact from "../../React/RepositoryReact";
import { SectionNode } from "../../View/Resultsets/FilterableTable/Section";
import { buildTree } from "../../TasksGlobal/TasksGlobal";
import { ContractsWithChildren } from "../../TasksGlobal/TasksGlobalTypes";

/** Przycina zadania wg predykatu, USUWAJĄC gałęzie bez pasujących zadań (zachowuje przodków). */
function pruneTasks(
    data: ContractsWithChildren[],
    keep: (t: Task) => boolean
): ContractsWithChildren[] {
    const result: ContractsWithChildren[] = [];
    for (const cwc of data) {
        const milestones = [];
        for (const mwc of cwc.milestonesWithCases || []) {
            const cases = [];
            for (const cwt of mwc.casesWithTasks || []) {
                const tasks = (cwt.tasks || []).filter(keep);
                const subCases = (cwt.subCasesWithTasks || [])
                    .map((s) => ({ caseItem: s.caseItem as Case, tasks: (s.tasks || []).filter(keep) }))
                    .filter((s) => s.tasks.length > 0);
                if (tasks.length > 0 || subCases.length > 0)
                    cases.push({ caseItem: cwt.caseItem, tasks, subCasesWithTasks: subCases });
            }
            if (cases.length > 0) milestones.push({ milestone: mwc.milestone, casesWithTasks: cases });
        }
        if (milestones.length > 0)
            result.push({ id: cwc.id, contract: cwc.contract, milestonesWithCases: milestones });
    }
    return result;
}

/** Filtruje zadania-liście wg predykatu, ale ZACHOWUJE wszystkie węzły (kontrakty/kamienie/sprawy). */
function filterLeaves(
    data: ContractsWithChildren[],
    keep: (t: Task) => boolean
): ContractsWithChildren[] {
    return data.map((cwc) => ({
        ...cwc,
        milestonesWithCases: (cwc.milestonesWithCases || []).map((mwc) => ({
            ...mwc,
            casesWithTasks: (mwc.casesWithTasks || []).map((cwt) => ({
                ...cwt,
                tasks: (cwt.tasks || []).filter(keep),
                subCasesWithTasks: (cwt.subCasesWithTasks || []).map((s) => ({
                    ...s,
                    tasks: (s.tasks || []).filter(keep),
                })),
            })),
        })),
    }));
}

interface BuildOpts {
    ownerId?: number;
    onlyInProgress?: boolean;
    /** Pomija zadania w statusie Backlog (warunek dawnego scrumboardu). */
    excludeBacklog?: boolean;
    /** Repozytorium liści — MUSI być podane, inaczej buildTree nadpisze repo TasksGlobal. */
    leavesRepository: RepositoryReact<Task>;
}

/**
 * Buduje drzewo scrumboardu reużywając buildTree z widoku "Projekty i zadania"
 * (identyczne nazwy/układ kamieni i spraw). Filtr właściciela/statusu z zachowaniem przodków,
 * zwijanie gałęzi bez zadań, opcjonalnie tylko kontrakty "W trakcie".
 */
export function buildScrumTree(data: ContractsWithChildren[], opts: BuildOpts): SectionNode<Task>[] {
    const notBacklog = (t: Task) => !opts.excludeBacklog || t.status !== MainSetup.TaskStatus.BACKLOG;
    let filtered = data;
    if (opts.ownerId) {
        // Filtr osoby: pokazujemy tylko gałęzie z jej zadaniami (usuwamy puste, zachowując przodków)
        const ownerId = opts.ownerId;
        filtered = pruneTasks(filtered, (t) => t._owner?.id === ownerId && notBacklog(t));
    } else if (opts.excludeBacklog) {
        // Bez filtra osoby: ukrywamy tylko zadania Backlog, ale zostawiamy całą strukturę
        // (kontrakty/kamienie/sprawy bez zadań pozostają widoczne, tylko zwinięte)
        filtered = filterLeaves(filtered, notBacklog);
    }
    if (opts.onlyInProgress)
        filtered = filtered.filter((c) => c.contract.status === MainSetup.ContractStatuses.IN_PROGRESS);
    return buildTree(filtered, undefined, undefined, {
        collapseEmpty: true,
        leavesRepository: opts.leavesRepository,
    });
}
