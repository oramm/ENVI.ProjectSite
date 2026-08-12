import React, { useEffect } from "react";
import { Alert, Form } from "react-bootstrap";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import { StaffMemberData } from "../../../../Typings/bussinesTypes";
import { fetchPersonProjectAssignments } from "../../../Persons/personsV2Helpers";
import MainSetup from "../../../React/MainSetupReact";
import {
    ProjectSelector,
    SystemRoleSelector,
} from "../../../View/Modals/CommonFormComponents/BussinesObjectSelectors";

export function StaffMemberModalBody({ isEditing, initialData }: ModalBodyProps<StaffMemberData>) {
    const { register, reset, trigger, getValues, watch } = useFormContext();

    // Ta sama reguła co na ekranie użytkowników: role ograniczone do przypisanych
    // projektów muszą te projekty dostać, inaczej osoba zostaje bez dostępu.
    const isProjectScopedRole = MainSetup.isProjectScopedRoleId(watch("systemRoleId"));

    useEffect(() => {
        const resetData: any = {
            // personId jedzie w treści żądania - serwer czyta go z adresu, ale
            // walidator wymaga kompletu pól.
            personId: initialData?.personId,
            systemRoleId: initialData?._systemRoleId ?? "",
            isDriver: !!initialData?.isDriver,
            isInScrum: !!initialData?.isInScrum,
            hasCostInvoiceAccess: !!initialData?.hasCostInvoiceAccess,
            hasBankAccess: !!initialData?.hasBankAccess,
            canLogSiteVisits: !!initialData?.canLogSiteVisits,
            isActive: initialData?.isActive ?? true,
        };
        reset(resetData);
        trigger();
    }, [initialData, reset]);

    // Przypisania dociągamy osobnym żądaniem, tak jak na ekranie użytkowników.
    // getValues(), nie resetData: dane dojeżdżają po otwarciu okna, a nadpisanie
    // zdjęciem sprzed żądania skasowałoby to, co użytkownik zdążył zmienić.
    useEffect(() => {
        const personId = initialData?.personId;
        if (!personId) return;
        let cancelled = false;

        fetchPersonProjectAssignments(personId)
            .catch(() => [])
            .then((assignments) => {
                if (cancelled) return;
                reset({ ...getValues(), _projectAssignments: assignments });
                trigger();
            });

        return () => {
            cancelled = true;
        };
    }, [initialData?.personId, reset, getValues, trigger]);

    return (
        <>
            <div className="mb-3">
                <div className="fw-semibold">
                    {initialData?._personName} {initialData?._personSurname}
                </div>
                <div className="text-muted small">{initialData?._personEmail}</div>
            </div>

            {initialData && initialData._hasStaffRow === false && (
                <Alert variant="info" className="py-2 small">
                    Ta osoba nie ma jeszcze nadanych uprawnień - zapis utworzy je po raz pierwszy.
                </Alert>
            )}

            <SystemRoleSelector name="systemRoleId" />

            {isProjectScopedRole && (
                <div className="mt-3">
                    <ProjectSelector name="_projectAssignments" multiple label="Przypisane projekty" />
                </div>
            )}

            <hr />

            <Form.Group controlId="isDriver">
                <Form.Check type="switch" label="Kierowca" {...register("isDriver")} />
                <Form.Text muted>Dostęp do kilometrówki.</Form.Text>
            </Form.Group>

            <Form.Group controlId="isInScrum" className="mt-3">
                <Form.Check type="switch" label="W scrumie" {...register("isInScrum")} />
                <Form.Text muted>Widoczny na tablicy sprintu i w zestawieniu urlopów.</Form.Text>
            </Form.Group>

            <Form.Group controlId="hasCostInvoiceAccess" className="mt-3">
                <Form.Check type="switch" label="Faktury kosztowe" {...register("hasCostInvoiceAccess")} />
                <Form.Text muted>
                    Otwiera moduł faktur kosztowych. Zmiana działa natychmiast, bez ponownego logowania.
                </Form.Text>
            </Form.Group>

            <Form.Group controlId="hasBankAccess" className="mt-3">
                <Form.Check type="switch" label="Wyciągi bankowe" {...register("hasBankAccess")} />
                <Form.Text muted>Otwiera moduł bankowy z danymi rozliczeniowymi. Zmiana działa natychmiast.</Form.Text>
            </Form.Group>

            <Form.Group controlId="canLogSiteVisits" className="mt-3">
                <Form.Check type="switch" label="Wizyty na budowie" {...register("canLogSiteVisits")} />
                <Form.Text muted>Rejestrowanie wizyt w aplikacji mobilnej.</Form.Text>
            </Form.Group>

            <hr />

            <Form.Group controlId="isActive">
                <Form.Check type="switch" label="Aktywny" {...register("isActive")} />
                <Form.Text muted>
                    Odejście z firmy to wyłączenie tej opcji - historia zadań, urlopów i przejazdów zostaje.
                </Form.Text>
            </Form.Group>
        </>
    );
}
