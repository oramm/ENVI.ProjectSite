import React, { useEffect, useRef, useState } from "react";
import {
    CaseSelectMenuElement,
    ContractSelector,
    LetterSelector,
    PersonSelectorPreloaded,
    ProjectSelector,
} from "../../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { Alert, Col, Form, Row } from "react-bootstrap";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import MainSetup from "../../../React/MainSetupReact";
import {
    Case,
    Contract,
    IncomingLetterContract,
    OurLetterContract,
    ProjectData,
} from "../../../../Typings/bussinesTypes";
import { casesRepository, projectsRepository } from "../LettersController";
import { ErrorMessage, FileInput } from "../../../View/Modals/CommonFormComponents/GenericComponents";

export function LetterModalBody({
    isEditing,
    initialData,
    getConfidenceClass = () => '',
    fileInputRef,
}: LetterModalBodyProps & { fileInputRef?: React.RefObject<HTMLInputElement> }) {
    const {
        register,
        reset,
        setValue,
        watch,
        formState: { dirtyFields, errors, isValid },
        trigger,
    } = useFormContext();
    const _project = isEditing ? undefined : (watch("_project") as ProjectData | undefined);

    const _contract = watch("_contract");
    const creationDate = watch("creationDate");
    const registrationDate = watch("registrationDate");
    const responseDueDate = watch("responseDueDate");

    function getContractFromCases(_cases: Case[] | undefined) {
        if (!_cases || _cases.length === 0) return undefined;
        return _cases[0]._parent?._contract as Contract;
    }

    useEffect(() => {
        const nowUTC = new Date().toISOString().split("T")[0];
        let defaultEditor;
        if (!isEditing) {
            const currentUser = MainSetup.currentUser;
            if (currentUser && MainSetup.personsEnviRepository.items.length > 0) {
                // Znajdź obiekt PersonData na podstawie emaila zalogowanego użytkownika
                defaultEditor = MainSetup.personsEnviRepository.items.find(
                    (person) => person.email === currentUser.systemEmail
                );
            }
        }
        const toDateInput = (value: string | undefined | null): string => {
            if (!value) return "";
            const iso = value.match(/^(\d{4}-\d{2}-\d{2})/);
            return iso ? iso[1] : "";
        };

        const resetData: any = {
            id: initialData?.id,
            _contract: getContractFromCases(initialData?._cases),
            _cases: initialData?._cases || [],
            description: initialData?.description || "",
            creationDate: initialData?.creationDate || nowUTC,
            registrationDate: initialData?.registrationDate || nowUTC,
            _editor: initialData?._editor || defaultEditor,
            relatedLetterNumber: initialData?.relatedLetterNumber || "",
            responseDueDate: toDateInput(initialData?.responseDueDate),
        };
        if (!isEditing) resetData._project = _project;
        reset(resetData);

        trigger();
    }, [initialData, reset]);

    useEffect(() => {
        if (!dirtyFields._contract) return;
        setValue("_cases", undefined, { shouldValidate: true });
    }, [_contract, _contract?.id, setValue]);

    useEffect(() => {
        trigger(["creationDate", "registrationDate", "responseDueDate"]);
    }, [trigger, watch, creationDate, registrationDate, responseDueDate]);

    useEffect(() => {
        if (!isEditing) setValue("registrationDate", creationDate);
    }, [setValue, creationDate, isEditing]);

    return (
        <>
            <Form.Group controlId="_contract">
                <Form.Label>Wybierz kontrakt</Form.Label>
                <ContractSelector name="_contract" _project={_project} readOnly={!isEditing} />
            </Form.Group>
            <Form.Group>
                <Form.Label>Dotyczy spraw</Form.Label>
                {_contract ? (
                    <CaseSelectMenuElement
                        name="_cases"
                        repository={casesRepository}
                        _project={_project}
                        _contract={_contract}
                        readonly={!_contract}
                    />
                ) : (
                    <Alert variant="warning">Wybierz kontrakt, by przypisać do spraw</Alert>
                )}
            </Form.Group>

            <Form.Group controlId="description">
                <Form.Label>Opis</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Podaj opis"
                    isValid={!errors?.description}
                    isInvalid={!!errors?.description}
                    {...register("description")}
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
            <Row>
                <Form.Group as={Col} controlId="relatedLetterNumber">
                    {_contract ? (
                        <LetterSelector
                            name="relatedLetterNumber"
                            label="Numer powiązanego pisma"
                            _contract={_contract}
                        />
                    ) : (
                        <>
                            <Form.Label>Numer powiązanego pisma</Form.Label>
                            <Form.Control placeholder="Najpierw wybierz kontrakt" disabled />
                        </>
                    )}
                </Form.Group>
                <Form.Group as={Col} controlId="responseDueDate">
                    <Form.Label>Odpowiedzieć do</Form.Label>
                    <Form.Control
                        type="date"
                        isValid={!errors.responseDueDate}
                        isInvalid={!!errors.responseDueDate}
                        {...register("responseDueDate")}
                        className={getConfidenceClass("responseDueDate")}
                    />
                    <ErrorMessage name="responseDueDate" errors={errors} />
                </Form.Group>
            </Row>
        </>
    );
}

type ProjectSelectorProps = ModalBodyProps & {
    SpecificContractModalBody?: React.ComponentType<ModalBodyProps>;
};
/** przełęcza widok pomiędzy wyborem projektu a formularzem pisma
 * SpecificContractModalBody - komponent formularza kontraktu (OurContractModalBody lub OtherContractModalBody)
 * @param additionalProps - dodatkowe propsy przekazywane do SpecificContractModalBody - ustawiane w Otjer lub OurContractModalBody
 * w tym przypadku jest additionalProps zawiera tylko parametr SpecificContractModalBody - komponent formularza kontraktu (OurContractModalBody lub OtherContractModalBody)
 *
 */
export function ProjectSelectorModalBody({ isEditing, additionalProps }: ProjectSelectorProps) {
    const { register, setValue, watch, formState } = useFormContext();
    const _project = watch("_project") as ProjectData | undefined;

    //musi być zgodna z nazwą w Our... lub OtherContractModalBody
    const { SpecificLetterModalBody } = additionalProps;
    if (!SpecificLetterModalBody) throw new Error("SpecificContractModalBody is not defined");

    return (
        <>
            {_project ? (
                <SpecificLetterModalBody isEditing={isEditing} additionalProps={additionalProps} />
            ) : (
                <ProjectSelector name="_project" />
            )}
        </>
    );
}

type LetterModalBodyProps = ModalBodyProps<OurLetterContract | IncomingLetterContract> & {
    getConfidenceClass?: (fieldName: string) => string;
};
