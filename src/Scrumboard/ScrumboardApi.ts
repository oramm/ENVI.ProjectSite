import {
    PersonData,
    ScrumboardAbsence,
    ScrumboardContractStatus,
    ScrumboardPersonSummary,
    ScrumboardPlanningEntry,
    ScrumboardVacationsData,
    ScrumboardVacationWeekCount,
} from "../../Typings/bussinesTypes";
import MainSetup from "../React/MainSetupReact";
import ToolsFetch from "../React/Tools/ToolsFetch";

/** Godziny zadania zwracane przez PUT /scrumboard/task/:id/hours */
export interface ScrumboardTaskHours {
    id: number;
    estimatedHours: number | null;
    hoursMon: number | null;
    hoursTue: number | null;
    hoursWed: number | null;
    hoursThu: number | null;
    hoursFri: number | null;
    weekSum: number;
}

export interface ScrumboardReportResult {
    gdId: string;
    url: string;
    name: string;
}

const base = MainSetup.serverUrl;

function jsonOptions(method: string, body?: unknown): RequestInit {
    return {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    };
}

/** Cienki klient API dla endpointów scrumboarda (nie pasują do wzorca RepositoryReact/CRUD). */
export default class ScrumboardApi {
    static async getContractStatuses(): Promise<ScrumboardContractStatus[]> {
        return ToolsFetch.fetchWithRetry(
            `${base}scrumboard/contractStatuses`,
            jsonOptions("POST", { orConditions: [] })
        );
    }

    static async setContractDiscussed(
        contractId: number,
        discussed: boolean
    ): Promise<ScrumboardContractStatus> {
        return ToolsFetch.fetchWithRetry(
            `${base}scrumboard/contractStatus/${contractId}`,
            jsonOptions("PUT", { discussed })
        );
    }

    static async resetDiscussed(): Promise<{ ok: boolean }> {
        return ToolsFetch.fetchWithRetry(
            `${base}scrumboard/contractStatuses/reset`,
            jsonOptions("POST")
        );
    }

    static async updateTaskHours(
        taskId: number,
        payload: Partial<Omit<ScrumboardTaskHours, "id" | "weekSum">>
    ): Promise<ScrumboardTaskHours> {
        return ToolsFetch.fetchWithRetry(
            `${base}scrumboard/task/${taskId}/hours`,
            jsonOptions("PUT", payload)
        );
    }

    static async resetHours(): Promise<{ ok: boolean }> {
        return ToolsFetch.fetchWithRetry(
            `${base}scrumboard/hours/reset`,
            jsonOptions("POST")
        );
    }

    static async updateTaskStatus(taskPayload: unknown): Promise<any> {
        const id = (taskPayload as { id: number }).id;
        return ToolsFetch.fetchWithRetry(
            `${base}scrumboard/task/${id}/status`,
            jsonOptions("PUT", taskPayload)
        );
    }

    /** Osoby scrumboardu: pracownicy ENVI + manager z configu (te same co w podsumowaniu/planowaniu). */
    static async getPersons(): Promise<PersonData[]> {
        return ToolsFetch.fetchWithRetry(`${base}scrumboard/persons`, jsonOptions("GET"));
    }

    static async getPlanning(): Promise<ScrumboardPlanningEntry[]> {
        return ToolsFetch.fetchWithRetry(
            `${base}scrumboard/planning`,
            jsonOptions("GET")
        );
    }

    static async updatePlanning(
        personId: number,
        values: Omit<ScrumboardPlanningEntry, "id" | "personId" | "_hoursAvailable" | "_person">
    ): Promise<ScrumboardPlanningEntry> {
        return ToolsFetch.fetchWithRetry(
            `${base}scrumboard/planning/${personId}`,
            jsonOptions("PUT", values)
        );
    }

    static async getTimesSummary(): Promise<ScrumboardPersonSummary[]> {
        return ToolsFetch.fetchWithRetry(
            `${base}scrumboard/timesSummary`,
            jsonOptions("GET")
        );
    }

    static async generateReport(): Promise<ScrumboardReportResult> {
        return ToolsFetch.fetchWithRetry(
            `${base}scrumboard/report`,
            jsonOptions("POST")
        );
    }

    // ---- Urlopy ----
    static async getVacations(year: number): Promise<ScrumboardVacationsData> {
        return ToolsFetch.fetchWithRetry(
            `${base}scrumboard/vacations?year=${year}`,
            jsonOptions("GET")
        );
    }

    static async getVacationWeekCounts(): Promise<ScrumboardVacationWeekCount[]> {
        return ToolsFetch.fetchWithRetry(
            `${base}scrumboard/vacations/weekCounts`,
            jsonOptions("GET")
        );
    }

    static async addAbsence(payload: {
        personId: number;
        typeId: number;
        dateFrom: string;
        dateTo: string;
        note?: string | null;
    }): Promise<ScrumboardAbsence> {
        return ToolsFetch.fetchWithRetry(
            `${base}scrumboard/vacation`,
            jsonOptions("POST", payload)
        );
    }

    static async updateAbsence(
        id: number,
        payload: {
            typeId: number;
            dateFrom: string;
            dateTo: string;
            note?: string | null;
        }
    ): Promise<ScrumboardAbsence> {
        return ToolsFetch.fetchWithRetry(
            `${base}scrumboard/vacation/${id}`,
            jsonOptions("PUT", payload)
        );
    }

    static async deleteAbsence(id: number): Promise<{ ok: boolean }> {
        return ToolsFetch.fetchWithRetry(
            `${base}scrumboard/vacation/${id}`,
            jsonOptions("DELETE")
        );
    }

    static async setVacationLimit(
        personId: number,
        year: number,
        limitDays: number,
        carryoverDays: number,
        careDays: number
    ): Promise<{
        personId: number;
        year: number;
        limitDays: number;
        carryoverDays: number;
        careDays: number;
    }> {
        return ToolsFetch.fetchWithRetry(
            `${base}scrumboard/vacationLimit/${personId}/${year}`,
            jsonOptions("PUT", { limitDays, carryoverDays, careDays })
        );
    }
}
