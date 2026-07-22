/**
 * OurContractModalBody — AQM NAME-match confirmation reset (WS10/L11).
 *
 * The gate itself lives in the yup schema (ContractValidationSchema.test.ts).
 * What can only be proven by rendering is the RESET: the tick must not survive
 * a change of Zamawiający, or the user confirms card A and saves podmiot B.
 *
 * Uses the real react-hook-form behind the repo's FormProvider — a fake setValue
 * would prove nothing about the effect's dependencies.
 */
import React from "react";
import { render, waitFor, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useForm, UseFormReturn, FieldValues } from "react-hook-form";
import { FormProvider } from "../../../View/Modals/FormContext";
import { OurContractModalBody } from "./OurContractModalBody";

const hoisted = vi.hoisted(() => ({ fetchAqmMatch: vi.fn() }));

vi.mock("./aqmMatchService", () => ({ fetchAqmMatch: hoisted.fetchAqmMatch }));
vi.mock("../../../React/MainSetupReact", () => ({
    default: { personsEnviRepository: {} },
}));
vi.mock("../../../View/Modals/CommonFormComponents/BussinesObjectSelectors", () => ({
    CitySelector: () => null,
    ContractTypeSelector: () => null,
    EntitySelector: () => null,
    PersonSelectorPreloaded: () => null,
}));
vi.mock("../../../View/Modals/CommonFormComponents/GenericComponents", () => ({
    MyAsyncTypeahead: () => null,
}));
vi.mock("./ContractModalBody", () => ({ ContractModalBody: () => null }));
vi.mock("../ContractsController", () => ({ citiesRepository: {}, entitiesRepository: {} }));
vi.mock("../../../View/Modals/InlineCreateDrawers", () => ({
    CityInlineCreateDrawer: () => null,
    EntityInlineCreateDrawer: () => null,
}));

const AQM_TYPE = { id: 10, name: "AQM" };
const EMPLOYER_A = { id: 1, name: "Zakład A", taxNumber: "5260250995" };
const EMPLOYER_B = { id: 2, name: "Zakład B", taxNumber: "7471917575" };

const nameMatch = (name: string, taxNr: string | null) => ({
    match: "NAME" as const,
    organization: { id: 99, name, taxNr },
});

let form: UseFormReturn<FieldValues>;

function Harness({ initialData }: { initialData: any }) {
    form = useForm({ defaultValues: {} });
    return (
        <FormProvider value={form}>
            <OurContractModalBody initialData={initialData} isEditing={false} {...({} as any)} />
        </FormProvider>
    );
}

const withEmployer = (employer: object) => ({ _type: AQM_TYPE, _employers: [employer] });

describe("OurContractModalBody — AQM NAME-match confirmation reset", () => {
    beforeEach(() => hoisted.fetchAqmMatch.mockReset());

    it("resets the confirmation when Zamawiający changes", async () => {
        // Card with a NIP — matchOrganization still answers NAME, which is the
        // whole reason the old "bez NIP" wording was wrong.
        hoisted.fetchAqmMatch.mockResolvedValue(nameMatch("Zakład A", "111"));

        const { rerender } = render(<Harness initialData={withEmployer(EMPLOYER_A)} />);
        await waitFor(() => expect(form.getValues("_aqmMatchState")).toBe("NAME"));

        // User ticks the box for card A.
        act(() => form.setValue("aqmNameMatchConfirmed", true));
        expect(form.getValues("aqmNameMatchConfirmed")).toBe(true);

        // Zamawiający swapped to a different podmiot.
        hoisted.fetchAqmMatch.mockResolvedValue(nameMatch("Zakład B", null));
        rerender(<Harness initialData={withEmployer(EMPLOYER_B)} />);

        // Phase 1 — the tick drops the moment the employer changes, i.e. while the new
        // lookup is still in flight. There is no window in which the old confirmation
        // is paired with a new podmiot.
        await waitFor(() => {
            expect(hoisted.fetchAqmMatch).toHaveBeenCalledTimes(2);
            expect(form.getValues("aqmNameMatchConfirmed")).toBe(false);
        });

        // Phase 2 — and it stays off once card B's NAME match lands, so the gate
        // blocks again for the new podmiot.
        await waitFor(() => expect(form.getValues("_aqmMatchState")).toBe("NAME"));
        expect(form.getValues("aqmNameMatchConfirmed")).toBe(false);
    });

    it("clears the match state and the confirmation when the type leaves AQM", async () => {
        hoisted.fetchAqmMatch.mockResolvedValue(nameMatch("Zakład A", "111"));

        const { rerender } = render(<Harness initialData={withEmployer(EMPLOYER_A)} />);
        await waitFor(() => expect(form.getValues("_aqmMatchState")).toBe("NAME"));
        act(() => form.setValue("aqmNameMatchConfirmed", true));

        rerender(
            <Harness initialData={{ _type: { id: 1, name: "Usługi" }, _employers: [EMPLOYER_A] }} />,
        );

        await waitFor(() => {
            expect(form.getValues("_aqmMatchState")).toBeNull();
            expect(form.getValues("aqmNameMatchConfirmed")).toBe(false);
        });
    });

    it("renders the checkbox only for a NAME match", async () => {
        hoisted.fetchAqmMatch.mockResolvedValue({
            match: "NIP" as const,
            organization: { id: 99, name: "Zakład A", taxNr: "5260250995" },
        });

        const { queryByTestId } = render(<Harness initialData={withEmployer(EMPLOYER_A)} />);
        await waitFor(() => expect(form.getValues("_aqmMatchState")).toBe("NIP"));
        expect(queryByTestId("aqm-name-match-confirm")).toBeNull();
    });
});
