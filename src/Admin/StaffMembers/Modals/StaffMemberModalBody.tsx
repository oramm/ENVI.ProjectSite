import { FidmanUserSyncLine } from "../FidmanUserSyncBadge";
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
import { ErrorMessage } from "../../../View/Modals/CommonFormComponents/GenericComponents";

export function StaffMemberModalBody({ isEditing, initialData }: ModalBodyProps<StaffMemberData>) {
    const {
        register,
        reset,
        trigger,
        getValues,
        watch,
        formState: { errors },
    } = useFormContext();

    // Ta sama reguła co na ekranie użytkowników: role ograniczone do przypisanych
    // projektów muszą te projekty dostać, inaczej osoba zostaje bez dostępu.
    const isProjectScopedRole = MainSetup.isProjectScopedRoleId(watch("systemRoleId"));

    useEffect(() => {
        const resetData: any = {
            // personId jedzie w treści żądania - serwer czyta go z adresu, ale
            // walidator wymaga kompletu pól.
            personId: initialData?.personId,
            systemRoleId: initialData?._systemRoleId ?? "",
            // Konto przychodzi razem z wierszem listy (odczyt panelu), więc bez osobnego
            // żądania jak na ekranie użytkowników. Zapis idzie osobno trasą konta v2.
            systemEmail: initialData?._systemEmail ?? "",
            fidmanEnabled: !!initialData?._fidmanEnabled,
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
                {/* Imię i nazwisko SĄ linkiem do danych osoby (uwaga ownera 2026-09-04, PER-7),
                    zamiast osobnego odnośnika „Dane osoby". To okno odpowiada na pytanie „co
                    osoba może w systemie" i danych osoby nie edytuje (D-PER-2 (a)) - literówkę
                    w nazwisku poprawia się w oknie „Osoby", a link oszczędza szukania jej drugi
                    raz. Układ jak karta auta w kilometrówce: nazwa pogrubiona, szczegóły
                    drobnym szarym pod spodem. */}
                <div className="fw-semibold fs-5">
                    {initialData?.personId ? (
                        <a
                            href={`#/person/${initialData.personId}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-reset"
                            title="Dane osoby - otwiera okno Osoby"
                            data-testid="person-link"
                        >
                            {initialData._personName} {initialData._personSurname}
                        </a>
                    ) : (
                        <>
                            {initialData?._personName} {initialData?._personSurname}
                        </>
                    )}
                </div>
                <div className="text-muted small">{initialData?._personEmail}</div>
                {initialData?._entityName && <div className="text-muted small">{initialData._entityName}</div>}
            </div>

            {initialData && initialData._hasStaffRow === false && (
                <Alert variant="info" className="py-2 small">
                    Ta osoba nie ma jeszcze nadanych uprawnień - zapis utworzy je po raz pierwszy.
                </Alert>
            )}

            <SystemRoleSelector name="systemRoleId" />

            <Form.Group controlId="systemEmail" className="mt-3">
                <Form.Label>Email systemowy</Form.Label>
                <Form.Control
                    type="email"
                    placeholder="Podaj gmail do logowania potrzebny do utworzenia konta na witrynie"
                    isInvalid={!!errors?.systemEmail}
                    {...register("systemEmail")}
                />
                <ErrorMessage name="systemEmail" errors={errors} />
            </Form.Group>

            <Form.Group controlId="fidmanEnabled" className="mt-2">
                <Form.Check
                    type="checkbox"
                    label="Użytkownik FIDmana (loguje się tym samym kontem Google)"
                    isInvalid={!!errors?.fidmanEnabled}
                    {...register("fidmanEnabled")}
                />
                <Form.Text className="text-muted">
                    Konto w FIDmanie zakłada się z e-maila systemowego. Odznaczenie wyłącza je, nie kasuje.
                </Form.Text>
                {/* Stan z kolejki wysyłek, nie z checkboxa (D-PER-8) - to samo, co plakietka
                    w wierszu listy, pełnym zdaniem. */}
                <FidmanUserSyncLine enabled={!!initialData?._fidmanEnabled} sync={initialData?._fidmanSync} />
                <ErrorMessage name="fidmanEnabled" errors={errors} />
            </Form.Group>

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
