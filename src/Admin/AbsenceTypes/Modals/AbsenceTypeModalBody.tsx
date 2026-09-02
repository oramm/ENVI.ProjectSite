import React, { useEffect } from "react";
import { Alert, Col, Form, Row } from "react-bootstrap";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import { AbsenceTypeData } from "../../../../Typings/bussinesTypes";
import { ErrorMessage } from "../../../View/Modals/CommonFormComponents/GenericComponents";
import { ABSENCE_POOLS, AbsencePool, poolFlags, readPool } from "../absenceTypePool";

export function AbsenceTypeModalBody({ isEditing, initialData }: ModalBodyProps<AbsenceTypeData>) {
    const {
        register,
        reset,
        setValue,
        watch,
        formState: { errors },
        trigger,
    } = useFormContext();

    useEffect(() => {
        const resetData: any = {
            name: initialData?.name ?? "",
            color: initialData?.color ?? "#0d6efd",
            countsAgainstLimit: initialData?.countsAgainstLimit ?? true,
            countsAsCare: initialData?.countsAsCare ?? false,
            countsAsHoliday: initialData?.countsAsHoliday ?? false,
            // Domyślnie WOLNO brać na godziny - tak samo, jak stoi kolumna w bazie
            // i jak zakłada walidator serwera przy braku pola w payloadzie.
            allowsPartialDay: initialData?.allowsPartialDay ?? true,
        };
        reset(resetData);
        trigger();
    }, [initialData, reset]);

    const usageCount = initialData?._usageCount ?? 0;
    const partialUsageCount = initialData?._partialUsageCount ?? 0;

    // Ostrzegamy dopiero wtedy, gdy zapis NAPRAWDĘ zostawi osierocone wpisy: przy edycji
    // istniejącego typu, ze zdjętą kratką i przy nieobecnościach godzinowych w historii.
    // Serwer nie kasuje ich ani nie przelicza - one po prostu przestają dawać się edytować.
    const warnAboutPartial =
        isEditing && !watch("allowsPartialDay") && partialUsageCount > 0;

    // Lista czyta i zapisuje te same trzy flagi co dotąd - zmienia się tylko sposób ich
    // wskazania. Payload zostaje bez zmian, backend nic o tym wyborze nie wie.
    const pool = readPool({
        countsAgainstLimit: watch("countsAgainstLimit"),
        countsAsCare: watch("countsAsCare"),
        countsAsHoliday: watch("countsAsHoliday"),
    });

    function selectPool(value: AbsencePool) {
        const flags = poolFlags(value);
        setValue("countsAgainstLimit", flags.countsAgainstLimit);
        setValue("countsAsCare", flags.countsAsCare);
        setValue("countsAsHoliday", flags.countsAsHoliday);
    }

    return (
        <>
            <Row>
                <Form.Group as={Col} md={8} controlId="name">
                    <Form.Label>Nazwa</Form.Label>
                    <Form.Control placeholder="np. Wypoczynkowy" isInvalid={!!errors?.name} {...register("name")} />
                    <ErrorMessage name="name" errors={errors} />
                </Form.Group>

                <Form.Group as={Col} md={4} controlId="color">
                    <Form.Label>Kolor</Form.Label>
                    <Form.Control type="color" title="Wybierz kolor" {...register("color")} />
                    <ErrorMessage name="color" errors={errors} />
                </Form.Group>
            </Row>

            <hr />

            <Form.Group controlId="pool">
                <Form.Label>Z której puli schodzi</Form.Label>
                <Form.Select value={pool} onChange={(e) => selectPool(e.target.value as AbsencePool)}>
                    {ABSENCE_POOLS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>

            <Form.Group controlId="allowsPartialDay" className="mt-3">
                <Form.Check
                    type="checkbox"
                    label="Można brać na godziny (część dnia)"
                    {...register("allowsPartialDay")}
                />
                <Form.Text muted className="d-block">
                    Zdjęta kratka znaczy, że ten typ wpisuje się wyłącznie na całe dni. Poza tym wyborem nic tego nie
                    narzuca - system nie zna prawnych różnic między typami nieobecności.
                </Form.Text>
                {warnAboutPartial && (
                    <Alert variant="warning" className="py-2 mt-2 mb-0">
                        Ten typ ma <strong>{partialUsageCount}</strong>{" "}
                        {partialUsageCount === 1
                            ? "nieobecność wpisaną"
                            : "nieobecności wpisanych"}{" "}
                        na godziny. Po zdjęciu kratki zostaną w kalendarzu i dalej będą się
                        liczyć do puli, ale <strong>nie dadzą się edytować</strong>, dopóki
                        kratki nie postawisz z powrotem.
                    </Alert>
                )}
            </Form.Group>

            <Form.Text muted className="d-block mt-2">
                To reguła, a nie opis - kod wylicza na tej podstawie, z której puli schodzi nieobecność. Pule są
                rozłączne, dlatego jest to wybór, a nie zestaw przełączników.
                {isEditing && usageCount > 0 && (
                    <>
                        {" "}
                        Ten typ jest użyty <strong>{usageCount}</strong> raz(y), więc zmiana przeliczy salda wstecz.
                    </>
                )}
            </Form.Text>
        </>
    );
}
