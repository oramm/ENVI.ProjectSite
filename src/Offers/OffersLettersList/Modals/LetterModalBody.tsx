import React, { useEffect, useRef, useState } from "react";
import {
    CaseSelectMenuElement,
    OfferSelector,
    PersonSelectorPreloaded,
} from "../../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { Alert, Col, Form, Placeholder, Row } from "react-bootstrap";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import MainSetup from "../../../React/MainSetupReact";
import { Case, ExternalOffer, IncomingLetterOffer, OurLetterOffer, OurOffer } from "../../../../Typings/bussinesTypes";
import { casesRepository, offersRepository } from "../LettersController";
import { ErrorMessage, FileInput } from "../../../View/Modals/CommonFormComponents/GenericComponents";
import { InlineCreateDrawer } from "../../../View/Modals/InlineCreateDrawer";
import {
    CaseInlineCreateBody,
    makeInlineCaseValidationSchema,
} from "../../../TasksGlobal/Modals/Case/CaseInlineCreateBody";
import { CaseModalBody } from "../../../TasksGlobal/Modals/Case/CaseModalBody";
import { makeCaseValidationSchema } from "../../../TasksGlobal/Modals/Case/CaseValidationSchema";
import { buildCaseHeaderBadge } from "../../../TasksGlobal/Modals/Case/CaseModalButtons";

type LetterModalBodyProps = ModalBodyProps<OurLetterOffer | IncomingLetterOffer> & {
    getConfidenceClass?: (fieldName: string) => string;
    fileInputRef?: React.RefObject<HTMLInputElement>;
};

export function LetterModalBody({ isEditing, initialData, getConfidenceClass = () => '', fileInputRef }: LetterModalBodyProps) {
    const {
        register,
        reset,
        setValue,
        watch,
        formState: { dirtyFields, errors, isValid },
        trigger,
    } = useFormContext();

    const _offer = watch("_offer") as OurOffer | ExternalOffer | undefined;
    const creationDate = watch("creationDate");
    const registrationDate = watch("registrationDate");

    // Panel inline-tworzenia/edycji Sprawy (Offcanvas) + token wymuszający odświeżenie opcji
    // selektora ze źródła prawdy (casesRepository.items). Analogicznie do pism do kontraktów.
    const [showCreateCase, setShowCreateCase] = useState(false);
    const [showEditCase, setShowEditCase] = useState(false);
    const [caseToEdit, setCaseToEdit] = useState<Case | undefined>(undefined);
    const [caseOptionsRefreshToken, setCaseOptionsRefreshToken] = useState(0);

    // Po utworzeniu sprawy w panelu: addNewItem dopisał ją już do casesRepository.items
    // (źródło prawdy). Auto-zaznaczamy ją w `_cases` i podbijamy token, by selektor
    // przebudował opcje z repository.items.
    function handleCaseCreated(newCase: Case) {
        const created = casesRepository.items.find((item) => item.id === newCase.id) ?? newCase;
        const current = (watch("_cases") as Case[] | undefined) ?? [];
        const alreadySelected = current.some((item) => item.id === created.id);
        const nextCases = alreadySelected ? current : [...current, created];
        setValue("_cases", nextCases, { shouldValidate: true });
        setCaseOptionsRefreshToken((token) => token + 1);
    }

    // Po edycji sprawy: editItem zaktualizował casesRepository.items (źródło prawdy).
    function handleCaseEdited(editedCase: Case) {
        const updated = casesRepository.items.find((item) => item.id === editedCase.id) ?? editedCase;
        const current = (watch("_cases") as Case[] | undefined) ?? [];
        const nextCases = current.map((item) => (item.id === updated.id ? updated : item));
        setValue("_cases", nextCases, { shouldValidate: true });
        setCaseOptionsRefreshToken((token) => token + 1);
    }

    useEffect(() => {
        let defaultEditor;
        if (!isEditing) {
            const currentUser = MainSetup.currentUser;
            if (currentUser && MainSetup.personsEnviRepository.items.length > 0) {
                defaultEditor = MainSetup.personsEnviRepository.items.find(
                    (person) => person.email === currentUser.systemEmail
                );
            }
        }
        const resetData: any = {
            _offer: initialData?._offer,
            _cases: initialData?._cases || [],
            description: initialData?.description || "",
            creationDate: initialData?.creationDate || new Date().toISOString().slice(0, 10),
            registrationDate: initialData?.registrationDate || new Date().toISOString().slice(0, 10),
            _editor: initialData?._editor || defaultEditor,
        };
        reset(resetData);

        trigger();
    }, [initialData, reset]);

    useEffect(() => {
        if (!dirtyFields._offer) return;
        setValue("_cases", undefined, { shouldValidate: true });
    }, [_offer, _offer?.id, setValue]);

    useEffect(() => {
        trigger(["creationDate", "registrationDate"]);
    }, [trigger, watch, creationDate, registrationDate]);

    useEffect(() => {
        setValue("registrationDate", creationDate);
    }, [setValue, creationDate]);

    return (
        <>
            <Form.Group controlId="_offer">
                <Form.Label>Wybierz ofertę</Form.Label>
                <OfferSelector name="_offer" readOnly={!isEditing} />
            </Form.Group>
            <Form.Group>
                <Form.Label>Dotyczy spraw</Form.Label>
                {_offer ? (
                    <CaseSelectMenuElement
                        name="_cases"
                        repository={casesRepository}
                        _offer={_offer}
                        readonly={!_offer}
                        onRequestCreate={() => setShowCreateCase(true)}
                        onRequestEdit={(caseItem) => {
                            setCaseToEdit(caseItem);
                            setShowEditCase(true);
                        }}
                        refreshToken={caseOptionsRefreshToken}
                    />
                ) : (
                    <Alert variant="warning">Wybierz ofertę, by przypisać do spraw</Alert>
                )}
            </Form.Group>

            {/* Panel boczny tworzenia Sprawy "w miejscu" — ta SAMA instancja casesRepository
                co selektor, więc utworzona sprawa odświeża jego opcje. */}
            <InlineCreateDrawer<Case>
                show={showCreateCase}
                onHide={() => setShowCreateCase(false)}
                title="Nowa sprawa"
                repository={casesRepository}
                ModalBodyComponent={CaseInlineCreateBody}
                additionalModalBodyProps={{ _offer }}
                makeValidationSchema={makeInlineCaseValidationSchema}
                onCreated={handleCaseCreated}
            />

            {/* Panel boczny edycji Sprawy "w miejscu" (ikona ołówka na tokenie sprawy). */}
            <InlineCreateDrawer<Case>
                show={showEditCase}
                onHide={() => setShowEditCase(false)}
                title="Edytuj sprawę"
                headerBadge={buildCaseHeaderBadge(
                    caseToEdit?._parent,
                    caseToEdit?.parentCaseId
                        ? casesRepository.items.find((c) => c.id === caseToEdit.parentCaseId)
                        : undefined
                )}
                repository={casesRepository}
                ModalBodyComponent={CaseModalBody}
                makeValidationSchema={makeCaseValidationSchema}
                isEditing={true}
                initialData={caseToEdit}
                onEdited={handleCaseEdited}
            />

            <Form.Group controlId="description">
                <Form.Label>Opis</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Podaj opis"
                    isValid={!errors?.description}
                    isInvalid={!!errors?.description}
                    {...register("description")}
                    className={getConfidenceClass("description")}
                />
                <ErrorMessage name="description" errors={errors} />
            </Form.Group>
            <Row>
                <Form.Group as={Col} controlId="creationDate">
                    <Form.Label>Data utworzenia</Form.Label>
                    <Form.Control
                        type="date"
                        isValid={!errors.creationDate}
                        isInvalid={!!errors.creationDate}
                        {...register("creationDate")}
                        className={getConfidenceClass("creationDate")}
                    />
                    <ErrorMessage name="creationDate" errors={errors} />
                </Form.Group>
                <Form.Group as={Col} controlId="registrationDate">
                    <Form.Label>Data Nadania</Form.Label>
                    <Form.Control
                        type="date"
                        isValid={!errors.registrationDate}
                        isInvalid={!!errors.registrationDate}
                        {...register("registrationDate")}
                    />
                    <ErrorMessage name="registrationDate" errors={errors} />
                </Form.Group>
            </Row>
            <Form.Group controlId="_editor">
                <PersonSelectorPreloaded
                    label="Osoba rejestrująca"
                    name="_editor"
                    repository={MainSetup.personsEnviRepository}
                />
            </Form.Group>
            <Form.Group controlId="file">
                <Form.Label>Plik</Form.Label>
                <FileInput {...register("file")} inputRef={fileInputRef} />
                {isEditing && (
                    <Form.Text className="text-muted small">
                        Wcześniej załączone pliki są widoczne na dysku w folderze pisma. System nie zapamiętuje tych
                        plików jako wartości pola wyboru pliku.
                    </Form.Text>
                )}
            </Form.Group>
        </>
    );
}
