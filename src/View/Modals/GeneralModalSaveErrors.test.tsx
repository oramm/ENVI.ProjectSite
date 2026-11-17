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
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useFormContext } from "./FormContext";
import { GeneralModal } from "./GeneralModal";
import { ourLetterValidationSchema } from "../../Letters/LettersList/Modals/LetterValidationSchema";
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
    it("retains a shared-contract failure and shows the server-confirmed completion after retry", async () => {
        const onClose = vi.fn();
        let attempt = 0;
        function SharedBody() {
            const { setValue } = useFormContext();
            React.useEffect(() => { setValue('_milestonesSelection', [{mode:'shared',milestoneId:4889}]); }, [setValue]);
            return <div>Nowa wspólna umowa</div>;
        }
        const repository = makeRepositoryStub({ actionRoutes: {addNewRoute:'contractReact'},
            addNewItem: vi.fn(async (_data, _route, onProgress) => {
                if (++attempt === 1) throw new Error('Dokumenty wymagają ponowienia');
                onProgress({status:'done',progressMessage:'Skrót i folder zweryfikowane przez serwer'});
                return {id:99};
            }) });
        renderModal({isEditing:false,repository,onClose,ModalBodyComponent:SharedBody});
        await submitForm();
        await screen.findByText('Dokumenty wymagają ponowienia');
        expect(onClose).not.toHaveBeenCalled();
        await submitForm();
        await screen.findByText('Skrót i folder zweryfikowane przez serwer');
        expect(screen.queryByRole('button',{name:/Zatwierdź/})).toBeNull();
        expect(repository.addNewItem).toHaveBeenCalledTimes(2);
        expect(onClose).not.toHaveBeenCalled();
        screen.getByRole('button',{name:'Zamknij'}).click();
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    function LetterBody() {
        const {register,setValue}=useFormContext();
        React.useEffect(()=>{setValue('_cases',[{id:10}],{shouldValidate:true});},[setValue]);
        return <input aria-label="Opis pisma" {...register('description')} />;
    }
    it('retrying letter availability preserves entered text and permits exactly one registration after a successful check',async()=>{
        const request=vi.fn().mockResolvedValueOnce(new Response('{}',{status:500})).mockResolvedValue(new Response(JSON.stringify({blocked:false})));
        vi.stubGlobal('fetch',request);
        try {
            const repository=makeRepositoryStub({actionRoutes:{addNewRoute:'letterReact'}}),onClose=vi.fn();
            renderModal({isEditing:false,repository,onClose,ModalBodyComponent:LetterBody});
            await screen.findByText(/Nie udało się sprawdzić, czy do wybranej sprawy można dodać pismo/);
            fireEvent.change(screen.getByLabelText('Opis pisma'),{target:{value:'Treść pozostaje po ponowieniu'}});
            expect(screen.getByRole('button',{name:/Zatwierdź/})).toBeDisabled();
            expect(repository.addNewItem).not.toHaveBeenCalled();
            fireEvent.click(screen.getByRole('button',{name:'Spróbuj ponownie'}));
            await waitFor(()=>expect(screen.getByRole('button',{name:/Zatwierdź/})).toBeEnabled());
            expect(screen.getByLabelText('Opis pisma')).toHaveValue('Treść pozostaje po ponowieniu');
            expect(request).toHaveBeenCalledTimes(2);
            fireEvent.click(screen.getByRole('button',{name:/Zatwierdź/}));
            await waitFor(()=>expect(onClose).toHaveBeenCalledTimes(1));
            expect(repository.addNewItem).toHaveBeenCalledTimes(1);
            expect(repository.addNewItem).toHaveBeenCalledWith(expect.objectContaining({description:'Treść pozostaje po ponowieniu',_cases:[{id:10}]}),undefined,expect.any(Function));
        } finally {vi.unstubAllGlobals();}
    });
    it('a consolidating letter case stays blocked and does not offer a retry that would bypass the block',async()=>{
        vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify({blocked:true}))));
        try {
            const repository=makeRepositoryStub({actionRoutes:{addNewRoute:'letterReact'}});
            renderModal({isEditing:false,repository,ModalBodyComponent:LetterBody});
            await screen.findByText(/Zarejestruj pismo w sprawie docelowej/);
            expect(screen.getByRole('button',{name:/Zatwierdź/})).toBeDisabled();
            expect(screen.queryByRole('button',{name:'Spróbuj ponownie'})).toBeNull();
            expect(repository.addNewItem).not.toHaveBeenCalled();
        } finally {vi.unstubAllGlobals();}
    });

    it('opening a letter form keeps only field validation and silently checks a newly selected case',async()=>{
        let resolve!:(response:Response)=>void;
        const request=vi.fn(()=>new Promise<Response>(done=>{resolve=done;}));vi.stubGlobal('fetch',request);
        function EmptyLetterBody(){
            const {setValue,formState:{errors}}=useFormContext();
            return <><button type="button" onClick={()=>setValue('_cases',[{id:10}],{shouldValidate:true})}>Wybierz sprawę testową</button>
                {errors._cases&&<span data-testid="case-validation">{errors._cases.message as string}</span>}</>;
        }
        try {
            const repository=makeRepositoryStub({actionRoutes:{addNewRoute:'letterReact'}});
            renderModal({isEditing:false,repository,ModalBodyComponent:EmptyLetterBody,
                makeValidationSchema:()=>ourLetterValidationSchema(false).pick(['_cases'])});
            expect(screen.queryByRole('status')).toBeNull();
            expect(screen.getByRole('button',{name:/Zatwierdź/})).toBeDisabled();
            expect(request).not.toHaveBeenCalled();
            fireEvent.submit(screen.getByRole('button',{name:/Zatwierdź/}).closest('form')!);
            expect(await screen.findByTestId('case-validation')).toHaveTextContent('Wybierz sprawy');
            expect(screen.queryByRole('status')).toBeNull();expect(repository.addNewItem).not.toHaveBeenCalled();
            fireEvent.click(screen.getByRole('button',{name:'Wybierz sprawę testową'}));
            await waitFor(()=>expect(request).toHaveBeenCalledTimes(1));
            expect(screen.queryByRole('status')).toBeNull();
            expect(screen.getByRole('button',{name:/Zatwierdź/})).toBeDisabled();
            resolve(new Response(JSON.stringify({blocked:false})));
            await waitFor(()=>expect(screen.getByRole('button',{name:/Zatwierdź/})).toBeEnabled());
            expect(screen.queryByTestId('case-validation')).toBeNull();expect(screen.queryByRole('status')).toBeNull();
            expect(repository.addNewItem).not.toHaveBeenCalled();
        } finally {vi.unstubAllGlobals();}
    });
});
