import React, { useEffect, useRef, useState } from "react";
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
import { EntityInlineCreateDrawer } from "../../../View/Modals/InlineCreateDrawers";
import { entitiesRepository } from "../InvoicesController";
import { computeJstInvoicePrefill } from "./invoiceJstPrefill";
import { THIRD_PARTY_ROLE_OPTIONS } from "../thirdPartyRoles";

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
    const thirdParties = (watch("_thirdParties") || []) as InvoiceThirdParty[];
    const buyer = watch("_entity") as { name?: string; taxNumber?: string; address?: string } | undefined;
    // F3: nowa FV z umowy, która ma Nabywcę FV (klasa JST gmina+zakład) → auto-fill Nabywca+Odbiorca i lock (D2/OD3).
    // Tylko dla NOWEJ faktury; edycja istniejącej FV nietknięta (D3). Kontrakt jest read-only dla nowej FV
    // (ContractSelector readOnly={!isEditing}), więc prefill liczony raz z contextData — brak zmiany kontraktu w formularzu.
    const isJstAutoFilled = Boolean(computeJstInvoicePrefill(contextData as OurContract | undefined, isEditing));
    const [showCreateEntity, setShowCreateEntity] = useState(false);
    const [showCreateThirdParty, setShowCreateThirdParty] = useState(false);
    const activeThirdPartyIndexRef = useRef<number>(0);

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
        const employer0 = typedContextData?._employers && typedContextData._employers[0];
        // F3: NOWA FV z umowy z Nabywcą FV → Nabywca=Nabywca FV (gmina), Odbiorca=Zamawiający (zakład, rola 8), zablokowane.
        const jstPrefillData = computeJstInvoicePrefill(typedContextData, isEditing);
        const jstPrefill = Boolean(jstPrefillData);
        const _entity = initialData?._entity || (jstPrefillData ? jstPrefillData._entity : employer0);
        const resetData = {
            _contract: initialData?._contract || contextData,
            issueDate: initialData?.issueDate || new Date().toISOString().slice(0, 10),
            daysToPay: initialData?.daysToPay,
            _entity,
            status: initialData?.status || "Na później",
            _owner: setInitialOwner(),
            _editor: MainSetup.getCurrentUserAsPerson(),
            description: initialData?.description || "",
            isJstSubordinate: initialData?.isJstSubordinate ?? jstPrefill,
            isGvMember: initialData?.isGvMember ?? false,
            includeThirdParty: initialData?.includeThirdParty ?? jstPrefill,
            _thirdParties:
                initialData?._thirdParties && initialData._thirdParties.length > 0
                    ? initialData._thirdParties
                    : initialData?._thirdParty
                      ? [{ role: initialData?.isJstSubordinate ? 8 : initialData?.isGvMember ? 10 : null, _entity: initialData._thirdParty }]
                      : jstPrefillData
                        ? jstPrefillData._thirdParties
                        : [],
            addAnotherThirdParty: false,
        };
        // Znacznik podmiotu 3 wlaczony, a lista pusta (stara faktura, prefill JST): jeden pusty
        // wiersz, zeby bylo w co wpisac podmiot. Liczy sie to TU, przy resecie, a nie w efekcie
        // reagujacym na znacznik - efekt widzialby wartosci sprzed resetu i dokladal wiersze
        // do faktur, ktore podmiot trzeci juz maja (zgloszenie wlasciciela 2026-08-31).
        if (resetData.includeThirdParty && resetData._thirdParties.length === 0) {
            resetData._thirdParties = [{ role: null, _entity: null }] as any;
        }
        reset(resetData);
        trigger();
    }, [initialData, reset]);

    /**
     * Wiersze podmiotow trzecich dokladaja i kasuja WYLACZNIE reakcje na klikniecie uzytkownika.
     * Wczesniej robily to efekty pilnujace znacznikow; przy otwarciu faktury do edycji efekt
     * dostawal wartosci sprzed resetu formularza i dokladal puste wiersze fakturom, ktore podmiot
     * trzeci mialy juz ustawiony (zgloszenie wlasciciela 2026-08-31).
     */
    function onThirdPartyFlagChecked(checked: boolean, role: number) {
        if (!checked) return;
        setValue("includeThirdParty", true as any, { shouldDirty: true, shouldValidate: true });
        appendThirdParty(role);
    }

    function onIncludeThirdPartyChanged(checked: boolean) {
        if (checked) {
            if (((watch("_thirdParties") || []) as InvoiceThirdParty[]).length === 0) appendThirdParty();
            return;
        }
        setValue("_thirdParties", [] as any, { shouldDirty: true, shouldValidate: true });
        setValue("thirdPartyEntityId", null as any, { shouldDirty: false });
        setValue("_thirdParty", null as any, { shouldDirty: false });
        setValue("addAnotherThirdParty", false as any, { shouldDirty: false });
    }

    return (
        <>
            <Form.Group controlId="_contract">
                <Form.Label>Wybierz kontrakt</Form.Label>
                <ContractSelector name="_contract" typesToInclude="our" readOnly={!isEditing} />
            </Form.Group>
            <Row>
                <Form.Group as={Col} controlId="issueDate">
                    <Form.Label>Data sprzedaży</Form.Label>
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
                <Form.Label>Nabywca{isJstAutoFilled ? " — auto z umowy (Nabywca FV, gmina), zablokowany" : ""}</Form.Label>
                {isJstAutoFilled ? (
                    <Form.Control readOnly disabled value={buyer?.name ?? ""} />
                ) : (
                    <EntitySelector name="_entity" multiple={false} onRequestCreate={() => setShowCreateEntity(true)} />
                )}
                {buyer && !buyer.taxNumber && (
                    <div className="small text-warning mt-1">
                        ⚠ Nabywca nie ma NIP — KSeF odrzuci fakturę przy wysyłce. Uzupełnij NIP podmiotu.
                    </div>
                )}
                {buyer && !buyer.address && (
                    <div className="small text-warning mt-1">
                        ⚠ Nabywca nie ma adresu — na zwykłej fakturze adres jest obowiązkowy, KSeF odrzuci fakturę bez niego.
                    </div>
                )}
            </Form.Group>
            <Row className="mt-2 g-3 flex-nowrap overflow-auto pb-1">
                <Form.Group as={Col} xs="auto" className="mb-0" controlId="isJstSubordinate">
                    <Form.Check
                        type="checkbox"
                        label={<span className="text-nowrap">Dotyczy jednostki podrzędnej JST</span>}
                        isInvalid={!!errors.isJstSubordinate}
                        disabled={isJstAutoFilled}
                        {...register("isJstSubordinate", {
                            onChange: (event) => onThirdPartyFlagChecked(event.target.checked, 8),
                        })}
                    />
                    <ErrorMessage name="isJstSubordinate" errors={errors} />
                </Form.Group>
                <Form.Group as={Col} xs="auto" className="mb-0" controlId="isGvMember">
                    <Form.Check
                        type="checkbox"
                        label={<span className="text-nowrap">Dotyczy członka grupy VAT</span>}
                        isInvalid={!!errors.isGvMember}
                        disabled={isJstAutoFilled}
                        {...register("isGvMember", {
                            onChange: (event) => onThirdPartyFlagChecked(event.target.checked, 10),
                        })}
                    />
                    <ErrorMessage name="isGvMember" errors={errors} />
                </Form.Group>
                <Form.Group as={Col} xs="auto" className="mb-0" controlId="includeThirdParty">
                    <Form.Check
                        type="checkbox"
                        label={<span className="text-nowrap">Dodaj podmiot 3 do faktury</span>}
                        isInvalid={!!errors.includeThirdParty}
                        disabled={isJstAutoFilled}
                        {...register("includeThirdParty", {
                            onChange: (event) => onIncludeThirdPartyChanged(event.target.checked),
                        })}
                    />
                    <ErrorMessage name="includeThirdParty" errors={errors} />
                </Form.Group>
            </Row>
            {includeThirdParty && isJstAutoFilled && (
                <Row className="mt-2">
                    <Form.Group as={Col} md={7} controlId="jstReceiverReadonly">
                        <Form.Label>Odbiorca (JST — jednostka podrzędna, rola 8) — auto z umowy (Zamawiający, zakład), zablokowany</Form.Label>
                        <Form.Control readOnly disabled value={thirdParties[0]?._entity?.name ?? ""} />
                    </Form.Group>
                </Row>
            )}
            {includeThirdParty && !isJstAutoFilled && (
                <>
                    {thirdParties.map((item, index) => (
                        <React.Fragment key={`third-party-${index}`}>
                        <Row className="mt-2 flex-md-nowrap">
                            <Form.Group as={Col} md={7} controlId={`_thirdParties.${index}._entity`}>
                                <Form.Label>{`Podmiot 3 #${index + 1}`}</Form.Label>
                                <EntitySelector
                                    name={`_thirdParties.${index}._entity`}
                                    multiple={false}
                                    onRequestCreate={() => {
                                        activeThirdPartyIndexRef.current = index;
                                        setShowCreateThirdParty(true);
                                    }}
                                />
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
                            <Form.Group as={Col} xs="auto" className="ms-auto px-0" controlId={`removeThirdParty${index}`}>
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
                        {item?._entity && !item._entity.taxNumber && (
                            <div className="small text-info mb-1">
                                ℹ Podmiot bez NIP — w KSeF zostanie zidentyfikowany przez ID wewnętrzny: {item._entity.id} <br/>
                                Jeśli chcesz, aby podmiot miał NIP na fakturze, edytuj jego dane w zakładce Podmioty.
                            </div>
                        )}
                        </React.Fragment>
                    ))}
                    <ErrorMessage name="_thirdParties" errors={errors} />
                </>
            )}
            {includeThirdParty && !isJstAutoFilled && thirdParties.length > 0 && thirdParties[thirdParties.length - 1]?._entity && (
                <Form.Group className="mt-2" controlId="includeAdditionalThirdParty">
                    <Form.Check
                        type="checkbox"
                        label="Czy dodać kolejny podmiot?"
                        isInvalid={!!errors.addAnotherThirdParty}
                        {...register("addAnotherThirdParty", {
                            onChange: (event) => {
                                if (!event.target.checked) return;
                                appendThirdParty();
                                setValue("addAnotherThirdParty", false as any, { shouldDirty: false });
                            },
                        })}
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
            <EntityInlineCreateDrawer
                show={showCreateEntity}
                onHide={() => setShowCreateEntity(false)}
                title="Nowy podmiot (nabywca)"
                repository={entitiesRepository}
                onCreated={(created) => setValue("_entity", created, { shouldValidate: true })}
            />
            <EntityInlineCreateDrawer
                show={showCreateThirdParty}
                onHide={() => setShowCreateThirdParty(false)}
                title="Nowy podmiot 3"
                repository={entitiesRepository}
                onCreated={(created) =>
                    setValue(`_thirdParties.${activeThirdPartyIndexRef.current}._entity` as any, created, {
                        shouldValidate: true,
                    })
                }
            />
        </>
    );
}
