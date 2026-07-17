import React, { useEffect, useState } from "react";
import { GeneralAddNewModalButton, GeneralEditModalButton } from "../../../View/Modals/GeneralModalButtons";
import { GeneralModal } from "../../../View/Modals/GeneralModal";
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from "../../../View/Modals/ModalsTypes";
import { ProjectSelectorModalBody } from "./LetterModalBody";
import { makeOtherLetterValidationSchema, ourLetterValidationSchema } from "./LetterValidationSchema";
import { IncomingLetterModalBody } from "./IncomingLetterModalBody";
import { OurLetterModalBody } from "./OurLetterModalBody";
import { IncomingLetterContract, OurLetterContract } from "../../../../Typings/bussinesTypes";
import { lettersRepository } from "../LettersController";
import { Button, Spinner } from "react-bootstrap";
import { ReplyIconButton, SuccessToast } from "../../../View/Resultsets/CommonComponents";
import { useFilterableTableContext } from "../../../View/Resultsets/FilterableTable/FilterableTableContext";
import { RowActionMenuItemProps } from "../../../View/Resultsets/FilterableTable/FilterableTableTypes";

/** przycisk i modal edycji Letter */
export function LetterEditModalButton({
    modalProps: { onEdit, initialData },
    buttonProps,
}: SpecificEditModalButtonProps<OurLetterContract | IncomingLetterContract>) {
    useEffect(() => {}, [initialData]);

    return initialData.isOur ? (
        <OurLetterEditModalButton modalProps={{ onEdit, initialData }} buttonProps={buttonProps} />
    ) : (
        <IncomingLetterEditModalButton modalProps={{ onEdit, initialData }} buttonProps={buttonProps} />
    );
}

export function OurLetterEditModalButton({
    modalProps: { onEdit, initialData },
}: SpecificEditModalButtonProps<OurLetterContract | IncomingLetterContract>) {
    return (
        <GeneralEditModalButton<OurLetterContract | IncomingLetterContract>
            modalProps={{
                onEdit: onEdit,
                ModalBodyComponent: OurLetterModalBody,
                modalTitle: "Edycja pisma wychodzącego",
                repository: lettersRepository,
                initialData: initialData,
                makeValidationSchema: ourLetterValidationSchema,
                // panel "Nowa sprawa" (InlineCreateDrawer) działa też w edycji pisma
                enforceFocus: false,
            }}
            buttonProps={{
                buttonVariant: "outline-success",
            }}
        />
    );
}

export function OurLetterAddNewModalButton({
    modalProps: { onAddNew },
}: SpecificAddNewModalButtonProps<OurLetterContract | IncomingLetterContract>) {
    return (
        <GeneralAddNewModalButton<OurLetterContract | IncomingLetterContract>
            modalProps={{
                onAddNew: onAddNew,
                ModalBodyComponent: ProjectSelectorModalBody,
                additionalModalBodyProps: { SpecificLetterModalBody: OurLetterModalBody },
                modalTitle: "Rejestruj pismo wychodzące",
                repository: lettersRepository,
                makeValidationSchema: ourLetterValidationSchema,
                // host modala pisma musi puścić focus do panelu "Nowa sprawa" (InlineCreateDrawer)
                enforceFocus: false,
            }}
            buttonProps={{
                buttonCaption: "Rejestruj wychodzące",
                buttonVariant: "outline-success",
            }}
        />
    );
}

export function IncomingLetterEditModalButton({
    modalProps: { onEdit, initialData },
}: SpecificEditModalButtonProps<OurLetterContract | IncomingLetterContract>) {
    return (
        <GeneralEditModalButton<OurLetterContract | IncomingLetterContract>
            modalProps={{
                onEdit: onEdit,
                ModalBodyComponent: IncomingLetterModalBody,
                modalTitle: "Edycja pisma przychodzącego",
                repository: lettersRepository,
                initialData: initialData,
                makeValidationSchema: makeOtherLetterValidationSchema,
                // panel "Nowa sprawa" (InlineCreateDrawer) działa też w edycji pisma
                enforceFocus: false,
            }}
            buttonProps={{}}
        />
    );
}

export function IncomingLetterAddNewModalButton({
    modalProps: { onAddNew },
}: SpecificAddNewModalButtonProps<OurLetterContract | IncomingLetterContract>) {
    return (
        <GeneralAddNewModalButton<OurLetterContract | IncomingLetterContract>
            modalProps={{
                onAddNew: onAddNew,
                ModalBodyComponent: ProjectSelectorModalBody,
                additionalModalBodyProps: { SpecificLetterModalBody: IncomingLetterModalBody }, // additional props for ProjectSelectorModalBody
                modalTitle: "Nowe pismo przychodzące",
                repository: lettersRepository,
                makeValidationSchema: makeOtherLetterValidationSchema,
                // host modala pisma musi puścić focus do panelu "Nowa sprawa" (InlineCreateDrawer)
                enforceFocus: false,
            }}
            buttonProps={{
                buttonCaption: "Rejestruj przychodzące",
            }}
        />
    );
}

/** ikona "Odpowiedz" (jak w kliencie pocztowym) w menu akcji wiersza — dla obu kierunków.
 * Odpowiedź jest zawsze pismem w kierunku przeciwnym do źródłowego:
 *   - na pismo przychodzące → rejestracja pisma wychodzącego (nasza odpowiedź, z szablonem),
 *   - na pismo wychodzące   → rejestracja pisma przychodzącego (odpowiedź kontrahenta, z plikiem).
 * Pola wypełniane na podstawie pisma źródłowego: projekt, sprawy (→ kontrakt),
 * podmiot (odbiorca ↔ nadawca) oraz relatedLetterNumber (powiązanie ze źródłem). */
export function RespondToLetterButton({
    dataObject,
    layout,
}: RowActionMenuItemProps<OurLetterContract | IncomingLetterContract>) {
    const { handleAddObject } = useFilterableTableContext<OurLetterContract | IncomingLetterContract>();
    const [showForm, setShowForm] = useState(false);

    // odpowiadamy pismem w kierunku przeciwnym do źródłowego
    const replyIsOur = !dataObject.isOur;

    // stabilna referencja: useEffect-y w LetterModalBody/OurLetterModalBody robią reset(initialData),
    // więc nowy obiekt przy każdym renderze czyściłby formularz w trakcie wypełniania
    const replyInitialData = React.useMemo(
        () =>
            ({
                _project: dataObject._project,
                _cases: dataObject._cases,
                _entitiesMain: dataObject._entitiesMain,
                description: dataObject.description
                    ? `Odpowiedź na: ${dataObject.description}`.slice(0, 300)
                    : "",
                relatedLetterNumber: dataObject.number ? String(dataObject.number) : "",
                isOur: replyIsOur,
            } as Partial<OurLetterContract | IncomingLetterContract> as OurLetterContract),
        [dataObject, replyIsOur]
    );

    // bez _cases nie da się wywieść kontraktu (ContractSelector readOnly w trybie add) — formularz byłby nie do zapisania
    if (!dataObject._cases?.length) return null;

    return (
        <>
            <ReplyIconButton layout={layout} onClick={() => setShowForm(true)} />
            <GeneralModal<OurLetterContract | IncomingLetterContract>
                show={showForm}
                onClose={() => setShowForm(false)}
                isEditing={false}
                title={`Odpowiedź na pismo ${dataObject.number ?? ""}`}
                subtitle={dataObject.description ? `Dotyczy: ${dataObject.description}` : undefined}
                repository={lettersRepository}
                onAddNew={handleAddObject}
                ModalBodyComponent={replyIsOur ? OurLetterModalBody : IncomingLetterModalBody}
                makeValidationSchema={replyIsOur ? ourLetterValidationSchema : makeOtherLetterValidationSchema}
                modalBodyProps={{
                    isEditing: false,
                    initialData: replyInitialData,
                }}
                // host modala pisma musi puścić focus do panelu "Nowa sprawa" (InlineCreateDrawer)
                enforceFocus={false}
            />
        </>
    );
}

export function ExportOurLetterContractToPDFButton({
    onError,
    ourLetterContract,
}: {
    onError: (error: Error) => void;
    ourLetterContract: OurLetterContract;
}) {
    const [requestPending, setRequestPending] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);

    async function handleClick() {
        try {
            setRequestPending(true);
            await lettersRepository.fetch("exportOurLetterToPDF", ourLetterContract);
            setRequestPending(false);
            setShowSuccessToast(true);
        } catch (error) {
            if (error instanceof Error) {
                setRequestPending(false);
                onError(error);
            }
        }
    }

    return (
        <>
            <Button key="Exportuj do PDF" variant="outline-secondary" size="sm" onClick={handleClick}>
                Exportuj do PDF{" "}
                {requestPending && <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />}
            </Button>
            <SuccessToast
                message="Eksport do PDF zakończył się powodzeniem!"
                show={showSuccessToast}
                onClose={() => setShowSuccessToast(false)}
            />
        </>
    );
}
