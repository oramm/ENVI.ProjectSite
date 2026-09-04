/**
 * Regresja: modal zamykał się jak po udanym zapisie, mimo że domknięcie zapisu padło.
 *
 * `handleEditWithoutFiles` / `handleAdd` wołały `onEdit(...)` / `onAddNew(...)` BEZ `await`,
 * więc odrzucona obietnica asynchronicznego handlera nie wracała do `handleSubmitRepository`
 * i `catch` nigdy nie ustawiał `errorMessage`. Tak ginął m.in. konflikt SystemEmail przy
 * zapisie konta systemowego osoby: dane osobowe szły do bazy, konto nie, a użytkownik
 * widział zamknięty modal i był przekonany, że zapisał.
 */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { GeneralModal } from "./GeneralModal";
import RepositoryReact from "../../React/RepositoryReact";
import { RepositoryDataItem } from "../../../Typings/bussinesTypes";

vi.mock("../../React/Tools/ToolsFetch", () => ({
    default: {
        sendClientErrorReport: vi.fn(),
    },
}));

const CONFLICT_MESSAGE = "SystemEmail 'anna@envi.com.pl' is already used by another person account.";

/** Minimalna atrapa repozytorium: `GeneralModal` używa tylko tych pól. */
function makeRepositoryStub(overrides: Partial<Record<string, unknown>> = {}) {
    return {
        name: "personsRepository_test",
        actionRoutes: { getRoute: "persons", addNewRoute: "person", editRoute: "person", deleteRoute: "person" },
        currentItems: [{ id: 7, name: "Anna" }],
        items: [{ id: 7, name: "Anna" }],
        editItem: vi.fn(async () => ({ id: 7, name: "Anna" })),
        addNewItem: vi.fn(async () => ({ id: 7, name: "Anna" })),
        replaceItemById: vi.fn(),
        ...overrides,
    } as unknown as RepositoryReact<RepositoryDataItem>;
}

function ModalBodyStub() {
    return <div data-testid="modal-body">ciało modala</div>;
}

function renderModal(props: Record<string, unknown>) {
    const repository = makeRepositoryStub();
    const onClose = vi.fn();
    const view = render(
        <GeneralModal
            show={true}
            title="Edycja danych osoby"
            isEditing={true}
            onClose={onClose}
            repository={repository}
            ModalBodyComponent={ModalBodyStub}
            modalBodyProps={{ isEditing: true, initialData: { id: 7 } as RepositoryDataItem }}
            {...(props as any)}
        />
    );
    return { repository, onClose, view };
}

/** Klik w "Zatwierdź" — modal ma jeden przycisk typu submit. */
async function submitForm() {
    const submitButton = await screen.findByRole("button", { name: /Zatwierdź/ });
    submitButton.click();
}

describe("GeneralModal — błąd domknięcia zapisu trafia do paska błędu", () => {
    beforeEach(() => vi.clearAllMocks());

    it("pokazuje błąd z asynchronicznego onEdit i NIE zamyka modala", async () => {
        const onEdit = vi.fn(async () => {
            throw new Error(CONFLICT_MESSAGE);
        });

        const { onClose } = renderModal({ onEdit });
        await submitForm();

        expect(await screen.findByText(new RegExp(CONFLICT_MESSAGE.replace(/[.'[\]]/g, "."))))
            .toBeTruthy();
        expect(onClose).not.toHaveBeenCalled();
    });

    it("pokazuje błąd z asynchronicznego onAddNew i NIE zamyka modala", async () => {
        const onAddNew = vi.fn(async () => {
            throw new Error(CONFLICT_MESSAGE);
        });

        const { onClose } = renderModal({ isEditing: false, onAddNew, onEdit: undefined });
        await submitForm();

        expect(await screen.findByText(new RegExp(CONFLICT_MESSAGE.replace(/[.'[\]]/g, "."))))
            .toBeTruthy();
        expect(onClose).not.toHaveBeenCalled();
    });

    it("udany zapis nadal zamyka modal - także gdy handler jest asynchroniczny", async () => {
        const onEdit = vi.fn(async () => {
            await Promise.resolve();
        });

        const { onClose } = renderModal({ onEdit });
        await submitForm();

        await waitFor(() => expect(onClose).toHaveBeenCalled());
        expect(onEdit).toHaveBeenCalled();
    });

    it("synchroniczny handler działa jak dotąd - zapis i zamknięcie", async () => {
        const onEdit = vi.fn();

        const { onClose } = renderModal({ onEdit });
        await submitForm();

        await waitFor(() => expect(onClose).toHaveBeenCalled());
        // Dwa argumenty, nie jeden: odpowiedź serwera i obiekt wysłany na serwer.
        // Handlery, które domykają zapis osobnymi żądaniami, biorą wartości formularza
        // z drugiego - odpowiedź serwera nie musi ich odbijać (patrz ModalSaveCallback).
        expect(onEdit).toHaveBeenCalledWith(
            expect.objectContaining({ id: 7 }),
            expect.objectContaining({ id: 7 })
        );
    });

    /**
     * Skoro nieudane domknięcie zostawia modal otwarty, użytkownik kliknie "Zatwierdź"
     * jeszcze raz. Przy dodawaniu rekord bazowy już istnieje, więc powtórka musi ominąć
     * `addNewItem` - inaczej naprawianie błędu konta zakładałoby drugą osobę.
     */
    it("ponowne Zatwierdź po nieudanym domknięciu NIE tworzy drugiego rekordu", async () => {
        const onAddNew = vi.fn(async () => {
            throw new Error(CONFLICT_MESSAGE);
        });
        const repository = makeRepositoryStub();
        const onClose = vi.fn();
        render(
            <GeneralModal
                show={true}
                title="Dodaj użytkownika systemu"
                isEditing={false}
                onClose={onClose}
                repository={repository}
                onAddNew={onAddNew}
                ModalBodyComponent={ModalBodyStub}
                modalBodyProps={{ isEditing: false }}
            />
        );

        await submitForm();
        await waitFor(() => expect(onAddNew).toHaveBeenCalledTimes(1));
        await submitForm();
        await waitFor(() => expect(onAddNew).toHaveBeenCalledTimes(2));

        // Dwa podejścia, ale tylko jeden POST - domknięcie powtarza się samo.
        expect(repository.addNewItem).toHaveBeenCalledTimes(1);
        expect(onClose).not.toHaveBeenCalled();
    });
});
