import React, { StrictMode, useEffect } from "react";
import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FilterPanel } from "./FilterPanel";
import { useFormContext } from "../../Modals/FormContext";

const hoisted = vi.hoisted(() => ({
    contextMock: {
        setObjects: vi.fn(),
        id: "testTable",
        sections: [] as any[],
        setSections: vi.fn(),
        snapshotMode: "criteria+objects" as const,
        sectionsFilterHandlers: undefined,
    },
}));

vi.mock("./FilterableTableContext", () => ({
    useFilterableTableContext: () => hoisted.contextMock,
}));

/** Repozytorium udaje tylko tyle, ile FilterPanel naprawdę woła przy wyszukiwaniu. */
function makeRepositoryMock(items: any[] = [{ id: 1 }]) {
    return { loadItemsFromServerPOST: vi.fn(async () => items) } as any;
}

function FilterBodyMock() {
    return null;
}

/** Tak samo jak DateRangeInput: pole filtra wpisuje wartość domyślną we własnym efekcie. */
function FilterBodyWithDefaultMock() {
    const { setValue } = useFormContext();
    useEffect(() => {
        setValue("issueDateFrom", "2026-01-01");
    }, [setValue]);
    return null;
}

describe("FilterPanel - searchOnMount", () => {
    beforeEach(() => {
        sessionStorage.clear();
        hoisted.contextMock.setObjects.mockReset();
    });

    it("ładuje dane po wejściu, bez klikania „Szukaj”", async () => {
        const repository = makeRepositoryMock([{ id: 7 }]);

        render(<FilterPanel FilterBodyComponent={FilterBodyMock} repository={repository} searchOnMount={true} />);

        await waitFor(() => expect(repository.loadItemsFromServerPOST).toHaveBeenCalledTimes(1));
        expect(hoisted.contextMock.setObjects).toHaveBeenCalledWith([{ id: 7 }]);
    });

    it("bez searchOnMount czeka na kliknięcie „Szukaj”", async () => {
        const repository = makeRepositoryMock();

        render(<FilterPanel FilterBodyComponent={FilterBodyMock} repository={repository} />);

        await waitFor(() => expect(hoisted.contextMock.setObjects).not.toHaveBeenCalled());
        expect(repository.loadItemsFromServerPOST).not.toHaveBeenCalled();
    });

    it("wysyła jedno żądanie mimo podwójnego montowania w StrictMode", async () => {
        const repository = makeRepositoryMock();

        render(
            <StrictMode>
                <FilterPanel FilterBodyComponent={FilterBodyMock} repository={repository} searchOnMount={true} />
            </StrictMode>
        );

        await waitFor(() => expect(repository.loadItemsFromServerPOST).toHaveBeenCalledTimes(1));
    });

    it("bierze wartości domyślne ustawione przez pola filtra", async () => {
        const repository = makeRepositoryMock();

        render(
            <FilterPanel FilterBodyComponent={FilterBodyWithDefaultMock} repository={repository} searchOnMount={true} />
        );

        await waitFor(() =>
            expect(repository.loadItemsFromServerPOST).toHaveBeenCalledWith([{ issueDateFrom: "2026-01-01" }])
        );
    });

    it("bierze kryteria zapamiętane w snapshocie", async () => {
        sessionStorage.setItem(
            "filtersableTableSnapshot_testTable",
            JSON.stringify({ criteria: { searchText: "abc" } })
        );
        const repository = makeRepositoryMock();

        render(<FilterPanel FilterBodyComponent={FilterBodyMock} repository={repository} searchOnMount={true} />);

        await waitFor(() => expect(repository.loadItemsFromServerPOST).toHaveBeenCalledWith([{ searchText: "abc" }]));
    });
});
