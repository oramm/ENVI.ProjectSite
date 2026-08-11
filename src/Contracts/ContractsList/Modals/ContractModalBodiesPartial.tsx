import React, { useEffect } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import ToolsForms from "../../../React/Tools/ToolsForms";
import ToolsDate from "../../../React/Tools/ToolsDate";
import { OtherContract, OurContract } from "../../../../Typings/bussinesTypes";
import { ContractStatusSelector } from "../../../View/Modals/CommonFormComponents/StatusSelectors";
import { ErrorMessage } from "../../../View/Modals/CommonFormComponents/GenericComponents";

/**
 * Czy umowa ma Okres Zgłaszania Wad (FIDIC DNP). Instytucja występuje wyłącznie w umowach
 * na roboty w trybie Żółtym i Czerwonym — dla pozostałych typów pole nie ma sensu i nie
 * pokazujemy go wcale.
 *
 * ŚWIADOMA ROZBIEŻNOŚĆ wobec filtra integracji z FIDmanem, który pyta o `TypeId` z allowlisty
 * syncu. To dwa różne pytania: tutaj domenowe („czy ta umowa w ogóle ma taki termin"), tam
 * techniczne („czy system wyśle ją do FIDmana"). Dlatego tu po pierwszym słowie nazwy typu —
 * tak samo jak ContractTypeBadge wyprowadza kolor — i dlatego „Czerwony ryczałtowy" DOSTAJE
 * to pole, choć do FIDmana dziś nie idzie. Nie ujednolicać obu miejsc bez nowej decyzji.
 *
 * Skutek uboczny do zapamiętania: zmiana typu umowy na taki bez OZW ukrywa pole, ale NIE
 * kasuje wpisanej wcześniej daty w bazie. Dane zostają — zamierzone.
 */
export function hasDefectsNotificationPeriod(type: { name?: string } | null | undefined): boolean {
    const firstWord = (type?.name ?? "").trim().split(/\s+/)[0];
    return firstWord === "Czerwony" || firstWord === "Żółty";
}

export function ContractModalBodyStatus({ initialData }: ModalBodyProps<OurContract | OtherContract>) {
    const {
        setValue,
        register,
        formState: { errors },
    } = useFormContext();

    useEffect(() => {
        setValue("status", initialData?.status || "", { shouldValidate: true });
    }, [initialData, setValue]);

    return <ContractStatusSelector />;
}

export function ContractModalBodyName({ initialData }: ModalBodyProps<OurContract | OtherContract>) {
    const {
        setValue,
        register,
        formState: { errors },
    } = useFormContext();

    useEffect(() => {
        setValue("name", initialData?.name || "", { shouldValidate: true });
    }, [initialData, setValue]);

    return (
        <Form.Group controlId="name">
            <Form.Label>Nazwa kontraktu</Form.Label>
            <Form.Control
                as="textarea"
                rows={2}
                placeholder="Podaj nazwę"
                isInvalid={!!errors?.name}
                isValid={!errors?.name}
                {...register("name")}
            />
            <ErrorMessage errors={errors} name="name" />
        </Form.Group>
    );
}

export function ContractModalBodyDates({
    initialData,
    isEditing,
    additionalProps = {},
}: ModalBodyProps<OurContract | OtherContract> & {
    additionalProps?: {
        watchAllFieldsExternal: any;
        startDateSugestion?: string;
        endDateSugestion?: string;
        guaranteeEndDateSugestion?: string;
    };
}) {
    const {
        setValue,
        register,
        formState: { errors },
        trigger,
        watch,
    } = useFormContext();
    let { watchAllFieldsExternal, startDateSugestion, endDateSugestion, guaranteeEndDateSugestion } = additionalProps;
    //jeśli nie ma watch w formularzu zewnętrznym to będzie tutaj
    const watchAllFields = watchAllFieldsExternal || watch();

    if (isEditing) {
        startDateSugestion = initialData?.startDate;
        endDateSugestion = initialData?.endDate;
        guaranteeEndDateSugestion = initialData?.guaranteeEndDate;
    } else {
        startDateSugestion = new Date().toISOString().slice(0, 10);
        endDateSugestion = ToolsDate.addDays(startDateSugestion, 365).toISOString().slice(0, 10);
        guaranteeEndDateSugestion = ToolsDate.addDays(endDateSugestion, 365 * 2)
            .toISOString()
            .slice(0, 10);
    }

    useEffect(() => {
        setValue("startDate", startDateSugestion, { shouldValidate: true });
        setValue("endDate", endDateSugestion, { shouldValidate: true });
        setValue("guaranteeEndDate", guaranteeEndDateSugestion, { shouldValidate: true });
        // Terminy nieobowiązkowe: pusty string, gdy ich nie ma. Nie `undefined` — pole
        // niekontrolowane przeszłoby w kontrolowane przy pierwszym wpisaniu daty i React
        // zgłosiłby ostrzeżenie; pusty string trzyma je kontrolowanym od początku.
        setValue("warrantyEndDate", initialData?.warrantyEndDate ?? "", { shouldValidate: true });
        setValue("defectsNotificationEndDate", initialData?.defectsNotificationEndDate ?? "", {
            shouldValidate: true,
        });
    }, [initialData, setValue]);

    return (
        <Row>
            <Form.Group as={Col} controlId="startDate">
                <Form.Label>Początek</Form.Label>
                <Form.Control
                    type="date"
                    isValid={!errors.startDate}
                    isInvalid={!!errors.startDate}
                    {...register("startDate")}
                    className={
                        !isEditing ? ToolsForms.getSuggestedClass("startDate", watchAllFields, startDateSugestion) : ""
                    }
                    onChange={(e) => {
                        register("startDate").onChange(e); // wywołaj standardowe zachowanie
                        trigger("endDate");
                    }}
                />
                <ErrorMessage errors={errors} name="startDate" />
            </Form.Group>
            <Form.Group as={Col} controlId="endDate">
                <Form.Label>Zakończenie</Form.Label>
                <Form.Control
                    type="date"
                    isValid={!errors.endDate}
                    isInvalid={!!errors.endDate}
                    {...register("endDate")}
                    className={
                        !isEditing ? ToolsForms.getSuggestedClass("endDate", watchAllFields, endDateSugestion) : ""
                    }
                    onChange={(e) => {
                        register("endDate").onChange(e); // wywołaj standardowe zachowanie
                        trigger("startDate");
                        trigger("guaranteeEndDate");
                    }}
                />
                <ErrorMessage errors={errors} name="endDate" />
            </Form.Group>
            <Form.Group as={Col} controlId="guaranteeEndDate">
                <Form.Label>Gwarancja</Form.Label>
                <Form.Control
                    type="date"
                    isValid={!errors.guaranteeEndDate}
                    isInvalid={!!errors.guaranteeEndDate}
                    {...register("guaranteeEndDate")}
                    className={
                        !isEditing
                            ? ToolsForms.getSuggestedClass(
                                  "guaranteeEndDate",
                                  watchAllFields,
                                  guaranteeEndDateSugestion
                              )
                            : ""
                    }
                    onChange={(e) => {
                        register("guaranteeEndDate").onChange(e); // wywołaj standardowe zachowanie
                        //trigger("startDate");
                    }}
                />
                <ErrorMessage errors={errors} name="guaranteeEndDate" />
            </Form.Group>
            <OptionalContractDateFields type={initialData?._type} />
        </Row>
    );
}

/**
 * Terminy nieobowiązkowe: rękojmia (każda umowa) i koniec Okresu Zgłaszania Wad (tylko Żółty
 * i Czerwony — zob. hasDefectsNotificationPeriod).
 *
 * Świadomie BEZ wartości podpowiadanej i bez `ToolsForms.getSuggestedClass`, inaczej niż przy
 * gwarancji obok. Podpowiedź w polu, którego wolno nie wypełnić, zamienia „nie ustalono" na
 * „wpisano datę wziętą z sufitu” — a te terminy trafiają potem do pilnowania zobowiązań.
 * Pusto ma znaczyć pusto.
 */
export function OptionalContractDateFields({ type }: { type?: { name?: string } | null }) {
    const {
        register,
        formState: { errors },
    } = useFormContext();

    return (
        <>
            <Form.Group as={Col} controlId="warrantyEndDate">
                <Form.Label>Rękojmia</Form.Label>
                <Form.Control
                    type="date"
                    isInvalid={!!errors.warrantyEndDate}
                    {...register("warrantyEndDate")}
                />
                <ErrorMessage errors={errors} name="warrantyEndDate" />
            </Form.Group>
            {hasDefectsNotificationPeriod(type) && (
                <Form.Group as={Col} controlId="defectsNotificationEndDate">
                    <Form.Label>Zgłaszanie wad do</Form.Label>
                    <Form.Control
                        type="date"
                        isInvalid={!!errors.defectsNotificationEndDate}
                        {...register("defectsNotificationEndDate")}
                    />
                    <ErrorMessage errors={errors} name="defectsNotificationEndDate" />
                </Form.Group>
            )}
        </>
    );
}
