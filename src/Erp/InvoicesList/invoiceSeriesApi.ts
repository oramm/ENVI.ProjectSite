import MainSetup from "../../React/MainSetupReact";

// Backend contract: src/invoices/InvoiceSeriesValidator.ts
export interface InvoiceSeriesInput {
    sourceInvoiceId: number;
    totalCount: number;
    intervalMonths: number;
    firstSaleDate: string | null;
}
export interface InvoiceSeriesPreview {
    saleDates: string[];
    netAmount: number;
    grossAmount: number;
}

export async function invoiceSeriesRequest<T>(route: string, input: InvoiceSeriesInput & { requestId?: string }, signal?: AbortSignal): Promise<T> {
    const response = await fetch(MainSetup.serverUrl + route, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        signal,
    });
    const data = await response.json();
    if (!response.ok) {
        const error = new Error(data.errorMessage || data.error?.message || data.error || data.message || "Nie udało się zapisać serii.");
        throw Object.assign(error, { status: response.status });
    }
    return data;
}
