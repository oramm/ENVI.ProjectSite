import React, { useEffect, useRef } from "react";
import {
    ContractSelector,
    EntitySelector,
    PersonSelectorPreloaded,
} from "../../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { Button, Col, Form, Row } from "react-bootstrap";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import MainSetup from "../../../React/MainSetupReact";
import { Invoice, InvoiceThirdParty, OurContract } from "../../../../Typings/bussinesTypes";
import { ErrorMessage } from "../../../View/Modals/CommonFormComponents/GenericComponents";

const THIRD_PARTY_ROLE_OPTIONS = [
    { value: 1, label: "1 - Faktor" },
    { value: 2, label: "2 - Odbiorca" },
    { value: 3, label: "3 - Podmiot pierwotny" },
    { value: 4, label: "4 - Dodatkowy nabywca" },
    { value: 5, label: "5 - Wystawca faktury" },
    { value: 6, label: "6 - Dokonujący płatności" },
    { value: 7, label: "7 - JST wystawca" },
    { value: 8, label: "8 - JST odbiorca" },
    { value: 9, label: "9 - Członek GV wystawca" },
    { value: 10, label: "10 - Członek GV odbiorca" },
];

export function InvoiceModalBody({ isEditing, initialData, contextData: contextData }: ModalBodyProps<Invoice>) {
    const {
        register,
        reset,
        setValue,
        watch,
        formState: { dirtyFields, errors, isValid },
        trigger,
    } = useFormContext();
    const statuses = [];
    statuses.push(
        MainSetup.InvoiceStatuses.FOR_LATER,
        MainSetup.InvoiceStatuses.TO_CORRECT,
        MainSetup.InvoiceStatuses.WITHDRAWN
    );
    if (initialData?.status && !statuses.includes(initialData.status)) statuses.push(initialData.status);

    const includeThirdParty = watch("includeThirdParty");
    const isJstSubordinate = watch("isJstSubordinate");
    const isGvMember = watch("isGvMember");
    const addAnotherThirdParty = watch("addAnotherThirdParty");
    const thirdParties = (watch("_thirdParties") || []) as InvoiceThirdParty[];
    const prevIsJstSubordinateRef = useRef<boolean>(false);
    const prevIsGvMemberRef = useRef<boolean>(false);

    function setInitialOwner() {
        if (isEditing) return initialData?._owner;
        return MainSetup.getCurrentUserAsPerson();
    }

    function appendThirdParty(role: number | null = null) {
        const current = ((watch("_thirdParties") || []) as InvoiceThirdParty[]).slice();
        current.push({ role, _entity: null as any });
        setValue("_thirdParties", current as any, { shouldDirty: true, shouldValidate: true });
    }

    function removeThirdParty(index: number) {
        const current = ((watch("_thirdParties") || []) as InvoiceThirdParty[]).slice();
        current.splice(index, 1);
        setValue("_thirdParties", current as any, { shouldDirty: true, shouldValidate: true });
    }

    useEffect(() => {
        console.log("InvoiceModalBody useEffect", initialData);
        const typedContextData = contextData as OurContract | undefined;
        const _entity = initialData?._entity || (typedContextData?._employers && typedContextData._employers[0]);
        const resetData = {
            _contract: initialData?._contract || contextData,
            issueDate: initialData?.issueDate || new Date().toISOString().slice(0, 10),
            daysToPay: initialData?.daysToPay,
            _entity,
            status: initialData?.status || "Na później",
            _owner: setInitialOwner(),
            _editor: MainSetup.getCurrentUserAsPerson(),
            description: initialData?.description || "",
            isJstSubordinate: initialData?.isJstSubordinate ?? false,
            isGvMember: initialData?.isGvMember ?? false,
            includeThirdParty: initialData?.includeThirdParty ?? false,
            _thirdParties:
                initialData?._thirdParties && initialData._thirdParties.length > 0
                    ? initialData._thirdParties
                    : initialData?._thirdParty
                      ? [{ role: initialData?.isJstSubordinate ? 8 : initialData?.isGvMember ? 10 : null, _entity: initialData._thirdParty }]
                      : [],
            addAnotherThirdParty: false,
        };
        reset(resetData);
        prevIsJstSubordinateRef.current = Boolean(resetData.isJstSubordinate);
        prevIsGvMemberRef.current = Boolean(resetData.isGvMember);
        trigger();
    }, [initialData, reset]);

    useEffect(() => {
        if (!includeThirdParty) {
            setValue("_thirdParties", [] as any, { shouldDirty: false, shouldValidate: true });
            setValue("thirdPartyEntityId", null as any, { shouldDirty: false });
            setValue("_thirdParty", null as any, { shouldDirty: false });
            setValue("addAnotherThirdParty", false as any, { shouldDirty: false });
        } else if (thirdParties.length === 0) {
            appendThirdParty();
        }
    }, [includeThirdParty, thirdParties.length, setValue]);

    useEffect(() => {
        if (addAnotherThirdParty) {
            appendThirdParty();
            setValue("addAnotherThirdParty", false as any, { shouldDirty: false });
        }
    }, [addAnotherThirdParty, setValue]);

    useEffect(() => {
        if (isJstSubordinate && !prevIsJstSubordinateRef.current) {
            setValue("includeThirdParty", true as any, { shouldDirty: true, shouldValidate: true });
            appendThirdParty(8);
        }
        prevIsJstSubordinateRef.current = Boolean(isJstSubordinate);
    }, [isJstSubordinate, setValue]);

    useEffect(() => {
        if (isGvMember && !prevIsGvMemberRef.current) {
            setValue("includeThirdParty", true as any, { shouldDirty: true, shouldValidate: true });
            appendThirdParty(10);
        }
        prevIsGvMemberRef.current = Boolean(isGvMember);
    }, [isGvMember, setValue]);

    return (
        <>
            <Form.Group controlId="_contract">
                <Form.Label>Wybierz kontrakt</Form.Label>
                <ContractSelector name="_contract" typesToInclude="our" readOnly={!isEditing} />
            </Form.Group>
            <Row>
                <Form.Group as={Col} controlId="issueDate">
                    <Form.Label>Data utworzenia</Form.Label>
                    <Form.Control
                        type="date"
                        isValid={!errors.issueDate}
                        isInvalid={!!errors.issueDate}
                        {...register("issueDate")}
                    />
                    <ErrorMessage name="issueDate" errors={errors} />
                </Form.Group>
                <Form.Group as={Col} controlId="daysToPay">
                    <Form.Label>Dni do zapłaty</Form.Label>
                    <Form.Control
                        type="number"
                        isValid={!errors.daysToPay}
                        isInvalid={!!errors.daysToPay}
                        min="1"
                        max="60"
                        {...register("daysToPay")}
                    />
                    <ErrorMessage name="daysToPay" errors={errors} />
                </Form.Group>
            </Row>
            <Form.Group controlId="status">
                <Form.Label>Status</Form.Label>
                <Form.Control as="select" isValid={!errors.status} isInvalid={!!errors.status} {...register("status")}>
                    <option value="">-- Wybierz opcję --</option>
                    {statuses.map((statusName, index) => (
                        <option key={index} value={statusName}>
                            {statusName}
                        </option>
                    ))}
                </Form.Control>
                <ErrorMessage errors={errors} name={"status"} />
            </Form.Group>
            <Form.Group>
                <Form.Label>Nabywca</Form.Label>
                <EntitySelector name="_entity" multiple={false} />
            </Form.Group>
            <Row className="mt-2 g-3 flex-nowrap overflow-auto pb-1">
                <Form.Group as={Col} xs="auto" className="mb-0" controlId="isJstSubordinate">
                    <Form.Check
                        type="checkbox"
                        label={<span className="text-nowrap">Dotyczy jednostki podrzędnej JST</span>}
                        isInvalid={!!errors.isJstSubordinate}
                        {...register("isJstSubordinate")}
                    />
                    <ErrorMessage name="isJstSubordinate" errors={errors} />
                </Form.Group>
                <Form.Group as={Col} xs="auto" className="mb-0" controlId="isGvMember">
                    <Form.Check
                        type="checkbox"
                        label={<span className="text-nowrap">Dotyczy członka grupy VAT</span>}
                        isInvalid={!!errors.isGvMember}
                        {...register("isGvMember")}
                    />
                    <ErrorMessage name="isGvMember" errors={errors} />
                </Form.Group>
                <Form.Group as={Col} xs="auto" className="mb-0" controlId="includeThirdParty">
                    <Form.Check
                        type="checkbox"
                        label={<span className="text-nowrap">Dodaj podmiot 3 do faktury</span>}
                        isInvalid={!!errors.includeThirdParty}
                        {...register("includeThirdParty")}
                    />
                    <ErrorMessage name="includeThirdParty" errors={errors} />
                </Form.Group>
            </Row>
            {includeThirdParty && (
                <>
                    {thirdParties.map((item, index) => (
                        <Row className="mt-2" key={`third-party-${index}`}>
                            <Form.Group as={Col} md={6} controlId={`_thirdParties.${index}._entity`}>
                                <Form.Label>{`Podmiot 3 #${index + 1}`}</Form.Label>
                                <EntitySelector name={`_thirdParties.${index}._entity`} multiple={false} />
                            </Form.Group>
                            <Form.Group as={Col} md={4} controlId={`_thirdParties.${index}.role`}>
                                <Form.Label>Rola</Form.Label>
                                <Form.Control
                                    as="select"
                                    {...register(`_thirdParties.${index}.role` as const, {
                                        setValueAs: (value) => (value === "" ? null : Number(value)),
                                    })}
                                >
                                    <option value="">-- Wybierz rolę --</option>
                                    {THIRD_PARTY_ROLE_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Form.Control>
                                <ErrorMessage name={`_thirdParties.${index}.role`} errors={errors} />
                            </Form.Group>
                            <Form.Group as={Col} md={2} controlId={`removeThirdParty${index}`}>
                                <Form.Label className="invisible d-block">Akcja</Form.Label>
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => removeThirdParty(index)}
                                    disabled={thirdParties.length <= 1}
                                >
                                    Usuń
                                </Button>
                            </Form.Group>
                        </Row>
                    ))}
                    <ErrorMessage name="_thirdParties" errors={errors} />
                </>
            )}
            {includeThirdParty && thirdParties.length > 0 && thirdParties[thirdParties.length - 1]?._entity && (
                <Form.Group className="mt-2" controlId="includeAdditionalThirdParty">
                    <Form.Check
                        type="checkbox"
                        label="Czy dodać kolejny podmiot?"
                        isInvalid={!!errors.addAnotherThirdParty}
                        {...register("addAnotherThirdParty")}
                    />
                    <ErrorMessage name="addAnotherThirdParty" errors={errors} />
                </Form.Group>
            )}
            <Form.Group controlId="_owner">
                <PersonSelectorPreloaded
                    label="Osoba rejestrująca"
                    name="_owner"
                    repository={MainSetup.personsEnviRepository}
                />
            </Form.Group>
            <Form.Group controlId="description">
                <Form.Label>Uwagi</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Dodaj komentarz"
                    isValid={!errors?.description}
                    isInvalid={!!errors?.description}
                    {...register("description")}
                />
                <ErrorMessage name="description" errors={errors} />
            </Form.Group>
        </>
    );
}
