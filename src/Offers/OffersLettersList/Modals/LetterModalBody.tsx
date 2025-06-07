import React, { useEffect, useRef, useState } from "react";
import {
    CaseSelectMenuElement,
    OfferSelectFormElement,
    PersonSelectorPreloaded,
} from "../../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { Alert, Col, Form, Placeholder, Row } from "react-bootstrap";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import MainSetup from "../../../React/MainSetupReact";
import { IncomingLetterOffer, OurLetterOffer, OurOffer } from "../../../../Typings/bussinesTypes";
import { casesRepository, offersRepository } from "../LettersController";
import { ErrorMessage, FileInput } from "../../../View/Modals/CommonFormComponents/GenericComponents";

export function LetterModalBody({ isEditing, initialData }: ModalBodyProps<OurLetterOffer | IncomingLetterOffer>) {
    const {
        register,
        reset,
        setValue,
        watch,
        formState: { dirtyFields, errors, isValid },
        trigger,
    } = useFormContext();

    const _offer = watch("_offer");
    const creationDate = watch("creationDate");
    const registrationDate = watch("registrationDate");

    useEffect(() => {
        const resetData: any = {
            _offer: initialData?._offer,
            _cases: initialData?._cases || [],
            description: initialData?.description || "",
            creationDate: initialData?.creationDate || new Date().toISOString().slice(0, 10),
            registrationDate: initialData?.registrationDate || new Date().toISOString().slice(0, 10),
            _editor: initialData?._editor,
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
                <OfferSelectFormElement name="_offer" repository={offersRepository} readOnly={!isEditing} />
            </Form.Group>
            <Form.Group>
                <Form.Label>Dotyczy spraw</Form.Label>
                {_offer ? (
                    <CaseSelectMenuElement
                        name="_cases"
                        repository={casesRepository}
                        _offer={_offer}
                        readonly={!_offer}
                    />
                ) : (
                    <Alert variant="warning">Wybierz ofertę, by przypisać do spraw</Alert>
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
                <FileInput {...register("file")} />
            </Form.Group>
        </>
    );
}
