import React, { useState } from "react";
import { Alert, Button, Col, Form, Modal, Row } from "react-bootstrap";
import { Resolver, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps, ModalSaveCallback } from "../../../View/Modals/ModalsTypes";
import { EditIconButton } from "../../../View/Resultsets/CommonComponents";
import { SoftwareLicenseData } from "../SoftwareLicenseTypes";
import { softwareLicensesRepository } from "../SoftwareLicensesController";
import { licenseTextFields, makeSoftwareLicenseValidationSchema } from "./SoftwareLicenseValidationSchema";

export function SoftwareLicenseAddNewModalButton({ modalProps: { onAddNew } }: SpecificAddNewModalButtonProps<SoftwareLicenseData>) {
    const [open, setOpen] = useState(false);
    return <><Button variant="outline-success" onClick={() => setOpen(true)}>Dodaj licencję</Button>
        {open && <LicenseForm onSave={onAddNew} onClose={() => setOpen(false)} />}</>;
}
export function SoftwareLicenseEditModalButton({ modalProps: { initialData, onEdit } }: SpecificEditModalButtonProps<SoftwareLicenseData>) {
    const [open, setOpen] = useState(false);
    return <div onClick={event => event.stopPropagation()}><EditIconButton layout="vertical" onClick={() => setOpen(true)} />
        {open && <LicenseForm initialData={initialData} onSave={onEdit} onClose={() => setOpen(false)} />}</div>;
}

// GeneralModal enriches cached records with form fields; license keys must never take that path.
export function LicenseForm({ initialData, onSave, onClose }: {
    initialData?: SoftwareLicenseData; onSave?: ModalSaveCallback<SoftwareLicenseData>; onClose: () => void;
}) {
    const [pending, setPending] = useState(false);
    const [error, setError] = useState("");
    const defaults: Record<string, string> = Object.fromEntries(licenseTextFields.map(([name]) => [name, initialData?.[name] ?? ""]));
    Object.assign(defaults, {
        licenseType: initialData?.licenseType ?? "", seatsPurchased: String(initialData?.seatsPurchased ?? 1),
        seatsUsed: String(initialData?.seatsUsed ?? 0), purchaseDate: initialData?.purchaseDate ?? "",
        expirationDate: initialData?.expirationDate ?? "", cost: initialData?.cost ?? "",
        keyAction: "keep", licenseKey: "",
    });
    const { register, handleSubmit, watch, setValue, resetField, formState: { errors } } = useForm<Record<string, string>>({
        defaultValues: defaults, resolver: yupResolver(makeSoftwareLicenseValidationSchema()) as unknown as Resolver<Record<string, string>>,
    });
    const keyAction = watch("keyAction");
    const free = Number(watch("seatsPurchased")) - Number(watch("seatsUsed"));
    const feedback = (name: string) => <Form.Control.Feedback type="invalid">{errors[name]?.message}</Form.Control.Feedback>;
    const input = (name: string, label: string, type = "text", limit?: number) => <Form.Group as={Col} md={6} controlId={`lic-${name}`} className="mb-3" key={name}>
        <Form.Label>{label}</Form.Label>
        <Form.Control type={type} maxLength={limit} isInvalid={!!errors[name]} {...register(name)} />{feedback(name)}
    </Form.Group>;
    async function save(values: Record<string, string>) {
        setPending(true); setError("");
        const { keyAction: action, licenseKey, ...fields } = values;
        const payload: Record<string, unknown> = { ...fields };
        if (action === "replace") payload.licenseKey = licenseKey;
        if (action === "remove") payload.licenseKey = null;
        resetField("licenseKey");
        try {
            const saved = await softwareLicensesRepository.saveLicense(payload, initialData?.id);
            delete payload.licenseKey;
            if (onSave) await onSave(saved);
            onClose();
        } catch {
            setError("Nie można zapisać licencji. Sprawdź połączenie i uprawnienia. Przed ponowieniem odśwież listę; klucz wpisz ponownie.");
        } finally { delete payload.licenseKey; setPending(false); }
    }
    return <Modal show size="lg" onHide={() => { if (!pending) onClose(); }} backdrop={pending ? "static" : true} keyboard={!pending}>
        <Form onSubmit={handleSubmit(save)} autoComplete="off" noValidate>
            <Modal.Header closeButton={!pending}><Modal.Title>{initialData ? "Edycja licencji" : "Dodaj licencję"}</Modal.Title></Modal.Header>
            <Modal.Body><fieldset disabled={pending}>
                <Row>{licenseTextFields.slice(0, 3).map(([name, label, limit]) => input(name, label, "text", limit))}
                    <Form.Group as={Col} md={6} controlId="lic-licenseType" className="mb-3"><Form.Label>Typ licencji</Form.Label>
                        <Form.Select {...register("licenseType")}><option value="">Nie podano</option><option>OEM</option><option>Retail</option><option>Volume</option><option value="Subscription">Subskrypcja</option></Form.Select>
                    </Form.Group>
                </Row>
                <h6>Stanowiska</h6><Row>{input("seatsPurchased", "Kupione", "number")}{input("seatsUsed", "Zajęte", "number")}</Row>
                <p>Wolne stanowiska: {Number.isInteger(free) && free >= 0 ? free : "—"}</p>
                <Row>{licenseTextFields.slice(3, 7).map(([name, label, limit]) => input(name, label, "text", limit))}</Row>
                <h6>Zakup i rozliczenie</h6>
                <Row>{input("purchaseDate", "Data zakupu", "date")}{input("expirationDate", "Data wygaśnięcia", "date")}
                    {input("cost", "Koszt brutto [zł]")}{input("billingCycle", "Cykl rozliczeniowy", "text", 100)}{input("status", "Status", "text", 100)}</Row>
                <Form.Group controlId="lic-comment" className="mb-3"><Form.Label>Uwagi</Form.Label>
                    <Form.Control as="textarea" rows={2} isInvalid={!!errors.comment} {...register("comment")} />{feedback("comment")}</Form.Group>
                <h6>Klucz licencyjny</h6>
                <Form.Group controlId="lic-keyAction" className="mb-3"><Form.Label>Zmiana klucza</Form.Label>
                    <Form.Select {...register("keyAction")} onChange={event => { setValue("keyAction", event.target.value); resetField("licenseKey"); }}>
                        <option value="keep">{initialData ? "Pozostaw obecny klucz" : "Bez klucza"}</option>
                        <option value="replace">Wpisz nowy klucz</option>
                        {initialData?.hasLicenseKey && <option value="remove">Usuń zapisany klucz</option>}
                    </Form.Select>
                    <Form.Text>{initialData?.hasLicenseKey ? "Klucz jest zapisany i pozostaje zasłonięty." : "Brak zapisanego klucza."}</Form.Text>
                </Form.Group>
                {keyAction === "replace" && <Form.Group controlId="lic-licenseKey"><Form.Label>Nowy klucz</Form.Label>
                    <Form.Control as="textarea" rows={2} style={{ WebkitTextSecurity: "disc" } as React.CSSProperties} autoComplete="off" spellCheck={false} isInvalid={!!errors.licenseKey} {...register("licenseKey")} />{feedback("licenseKey")}</Form.Group>}
                {keyAction === "remove" && <Alert variant="warning">Zapisanie usunie klucz z tej licencji.</Alert>}
            </fieldset>{error && <Alert variant="danger" className="mt-3">{error}</Alert>}</Modal.Body>
            <Modal.Footer><Button variant="secondary" disabled={pending} onClick={onClose}>Anuluj</Button>
                <Button type="submit" disabled={pending}>{pending ? "Zapisywanie…" : "Zapisz"}</Button></Modal.Footer>
        </Form>
    </Modal>;
}
