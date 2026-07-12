import React, { useEffect, useState } from "react";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import { useFormContext } from "../../View/Modals/FormContext";
import { ModalBodyProps } from "../../View/Modals/ModalsTypes";
import { EntityData } from "../../../Typings/bussinesTypes";
import { ErrorMessage } from "../../View/Modals/CommonFormComponents/GenericComponents";
import { lookupNip } from "./gusLookupService";

export function EntityModalBody({ isEditing, initialData }: ModalBodyProps<EntityData>) {
    const {
        register,
        reset,
        getValues,
        setValue,
        formState: { dirtyFields, errors, isValid },
        trigger,
    } = useFormContext();

    const [gusLoading, setGusLoading] = useState(false);
    const [gusError, setGusError] = useState<string | null>(null);

    // NIP-G1 — "Pobierz z GUS": autofill name+address from taxNumber, user can
    // still edit both before saving. BLOCKED until gate G-N1 in prod (503 with
    // a readable message until the owner sets GUS_BIR_KEY).
    const handleFetchFromGus = async () => {
        const nip = getValues("taxNumber");
        setGusError(null);
        setGusLoading(true);
        try {
            const result = await lookupNip(nip);
            setValue("name", result.name, { shouldDirty: true, shouldValidate: true });
            setValue("address", result.address, { shouldDirty: true, shouldValidate: true });
        } catch (err) {
            setGusError(err instanceof Error ? err.message : "Błąd wyszukiwania GUS");
        } finally {
            setGusLoading(false);
        }
    };

    useEffect(() => {
        const resetData: any = {
            name: initialData?.name,
            shortName: initialData?.shortName,
            address: initialData?.address,
            taxNumber: initialData?.taxNumber,
            www: initialData?.www,
            email: initialData?.email,
            phone: initialData?.phone,
        };
        reset(resetData);
        trigger();
    }, [initialData, reset]);

    return (
        <>
            <Form.Group controlId="name">
                <Form.Label>Nazwa</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Podaj nazwę"
                    isInvalid={!!errors?.name}
                    isValid={!errors?.name}
                    {...register("name")}
                />
                <ErrorMessage name="name" errors={errors} />
            </Form.Group>

            <Form.Group controlId="shortName">
                <Form.Label>Skrócona nazwa</Form.Label>
                <Form.Control
                    placeholder="Podaj skróconą nazwę (max 15 znaków) (Potrzebna do nazwy folderu kontraktu na dysku)"
                    maxLength={15}
                    isInvalid={!!errors?.shortName}
                    isValid={!errors?.shortName}
                    {...register("shortName")}
                />
                <ErrorMessage name="shortName" errors={errors} />
            </Form.Group>

            <Form.Group controlId="address">
                <Form.Label>Adres</Form.Label>
                <Form.Control
                    placeholder="Podaj adres"
                    isInvalid={!!errors?.address}
                    isValid={!errors?.address}
                    {...register("address")}
                />
                <ErrorMessage name="address" errors={errors} />
            </Form.Group>

            <Form.Group controlId="taxNumber">
                <Form.Label>NIP</Form.Label>
                <div className="d-flex align-items-start gap-2">
                    <Form.Control
                        placeholder="Podaj numer podatkowy"
                        isInvalid={!!errors?.taxNumber}
                        isValid={!errors?.taxNumber}
                        {...register("taxNumber")}
                    />
                    <Button
                        variant="outline-secondary"
                        size="sm"
                        className="text-nowrap"
                        onClick={handleFetchFromGus}
                        disabled={gusLoading || !!errors?.taxNumber || !getValues("taxNumber")}
                    >
                        {gusLoading ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-1" />
                                Pobieranie...
                            </>
                        ) : (
                            "Pobierz z GUS"
                        )}
                    </Button>
                </div>
                <ErrorMessage name="taxNumber" errors={errors} />
                {gusError && (
                    <Alert variant="danger" className="mt-2 mb-0" onClose={() => setGusError(null)} dismissible>
                        {gusError}
                    </Alert>
                )}
            </Form.Group>

            <Form.Group controlId="www">
                <Form.Label>WWW</Form.Label>
                <Form.Control
                    placeholder="Podaj adres strony www"
                    isInvalid={!!errors?.www}
                    isValid={!errors?.www}
                    {...register("www")}
                />
                <ErrorMessage name="www" errors={errors} />
            </Form.Group>

            <Form.Group controlId="email">
                <Form.Label>Email</Form.Label>
                <Form.Control
                    type="email"
                    placeholder="Podaj adres email"
                    isInvalid={!!errors?.email}
                    isValid={!errors?.email}
                    {...register("email")}
                />
                <ErrorMessage name="email" errors={errors} />
            </Form.Group>

            <Form.Group controlId="phone">
                <Form.Label>Telefon</Form.Label>
                <Form.Control
                    placeholder="Podaj numer telefonu"
                    isInvalid={!!errors?.phone}
                    isValid={!errors?.phone}
                    {...register("phone")}
                />
                <ErrorMessage name="phone" errors={errors} />
            </Form.Group>
        </>
    );
}
