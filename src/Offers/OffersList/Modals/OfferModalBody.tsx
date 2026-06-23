import React, { useEffect, useState } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { CityData, ExternalOffer, OurOffer } from "../../../../Typings/bussinesTypes";
import {
    CitySelector,
    ContractTypeSelector,
    EntitySelector,
} from "../../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { ErrorMessage } from "../../../View/Modals/CommonFormComponents/GenericComponents";
import { EntityInlineCreateDrawer } from "../../../View/Modals/InlineCreateDrawers";
import { entitiesRepository } from "../../../Entities/EntitiesController";
import {
    OfferBidProcedureSelectFormElement,
    OfferFormSelectFormElement,
} from "../../../View/Modals/CommonFormComponents/OtherAttributesSelectors";
import { OfferStatusSelector } from "../../../View/Modals/CommonFormComponents/StatusSelectors";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";

export function OfferModalBody({ isEditing, initialData }: ModalBodyProps<OurOffer | ExternalOffer>) {
    const {
        register,
        reset,
        setValue,
        watch,
        formState: { dirtyFields, errors, isValid },
        trigger,
    } = useFormContext();

    const _city: CityData | string | undefined = watch("_city");
    const [showCreateEmployer, setShowCreateEmployer] = useState(false);

    useEffect(() => {
        const resetData: any = {
            _city: initialData?._city,
            _type: initialData?._type,
            _employer: initialData?.employerName,
            alias: initialData?.alias || "",
            description: initialData?.description || "",
            comment: initialData?.comment || "",
            creationDate: initialData?.creationDate || new Date().toISOString().slice(0, 10),
            submissionDeadline: initialData?.submissionDeadline,
            status: initialData?.status || "",
            bidProcedure: initialData?.bidProcedure || "",
            form: initialData?.form || "",
        };
        reset(resetData);

        trigger();
    }, [initialData, reset]);

    function renderCityText() {
        if (typeof _city !== "string") return "";
        return "System utworzy nowe miasto w bazie i wygeneruje dla niego trzyliterowy kod. Upewnij się, że podałano nazwę bez literówek i, że system nie podpowiada Ci już tego miasta";
    }

    return (
        <>
            {!isEditing && (
                <Row>
                    <Form.Group as={Col} controlId="_city">
                        <Form.Label>Miasto</Form.Label>
                        <CitySelector showValidationInfo={true} allowNew={true} />
                        <Form.Text muted>{renderCityText()}</Form.Text>
                    </Form.Group>

                    <Form.Group as={Col} controlId="_type">
                        <ContractTypeSelector typesToInclude="our" />
                    </Form.Group>
                </Row>
            )}
            <Form.Group>
                <Form.Label>Zamawiający</Form.Label>
                <EntitySelector name="_employer" multiple={false} onRequestCreate={() => setShowCreateEmployer(true)} />
            </Form.Group>
            <Form.Group controlId="alias">
                <Form.Label>Alias</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Podaj alias"
                    isValid={!errors?.alias}
                    isInvalid={!!errors?.alias}
                    {...register("alias")}
                />
                <ErrorMessage errors={errors} name="alias" />
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
            <Form.Group controlId="comment">
                <Form.Label>Uwagi</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Dodaj uwagi"
                    isValid={!errors?.comment}
                    isInvalid={!!errors?.comment}
                    {...register("comment")}
                />
                <ErrorMessage name="comment" errors={errors} />
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
                <Form.Group as={Col} controlId="submissionDeadline">
                    <Form.Label>Termin składania</Form.Label>
                    <Form.Control
                        type="date"
                        isValid={!errors.submissionDeadline}
                        isInvalid={!!errors.submissionDeadline}
                        {...register("submissionDeadline")}
                    />
                    <ErrorMessage name="submissionDeadline" errors={errors} />
                </Form.Group>
            </Row>
            <Row>
                <OfferBidProcedureSelectFormElement as={Col} />
                <OfferFormSelectFormElement as={Col} />
            </Row>
            <OfferStatusSelector multiple={false} />
            <EntityInlineCreateDrawer
                show={showCreateEmployer}
                onHide={() => setShowCreateEmployer(false)}
                title="Nowy podmiot (zamawiający)"
                repository={entitiesRepository}
                onCreated={(created) => setValue("_employer", created, { shouldValidate: true })}
            />
        </>
    );
}
