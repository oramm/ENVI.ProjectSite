import { AccountAccessFields } from "./AccountAccessFields";
import { FidmanUserSyncLine } from "../FidmanUserSyncBadge";
import React, { useEffect, useState } from "react";
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
import StaffPrivacyStatus from "../StaffPrivacyStatus";
import { AccountEventsList } from "../AccountEventsList";
import { AccessPreview } from "../access/AccessPreview";
import { assignmentsHint } from "./assignmentsHint";

export function StaffMemberModalBody({ isEditing, initialData }: ModalBodyProps<StaffMemberData>) {
    const {
        register,
        reset,
        trigger,
        getValues,
        watch,
        formState: { errors },
    } = useFormContext();

    // Przypisania do projektów ma każda rola poza użytkownikiem zewnętrznym (DOSTEP-7).
    const hasAssignments = MainSetup.hasProjectAssignmentsRoleId(watch("systemRoleId"));
    const isExternalUser = Number(watch("systemRoleId")) === MainSetup.SystemRoles.EXTERNAL_USER.id;
    const assigned: { ourId: string }[] | null | undefined = watch("_projectAssignments");
    const [assignmentsFailed, setAssignmentsFailed] = useState(false);

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
            finEnabled: !!initialData?._finEnabled,
            isDriver: !!initialData?.isDriver,
            isInScrum: !!initialData?.isInScrum,
            hasCostInvoiceAccess: !!initialData?.hasCostInvoiceAccess,
            hasBankAccess: !!initialData?.hasBankAccess,
            canLogSiteVisits: !!initialData?.canLogSiteVisits,
            canManageSbAccess: !!initialData?.canManageSbAccess,
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

        // Nieudany odczyt NIE wstawia pustej listy: zapis skasowałby wtedy przypisania (brak pola = nie ruszaj).
        fetchPersonProjectAssignments(personId)
            .catch(() => null)
            .then((assignments) => {
                if (cancelled) return;
                setAssignmentsFailed(!assignments);
                if (!assignments) return;
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

            {isEditing && initialData?.personId && <StaffPrivacyStatus key={initialData.personId} personId={initialData.personId} />}

            <AccountAccessFields>
                <FidmanUserSyncLine enabled={!!initialData?._fidmanEnabled} sync={initialData?._fidmanSync} />
            </AccountAccessFields>

            {hasAssignments && (
                <div className="mt-3">
                    <ProjectSelector name="_projectAssignments" multiple label="Przypisane projekty" />
                    <Form.Text className="text-muted">{assignmentsHint(watch("systemRoleId"))}</Form.Text>
                </div>
            )}
            {isExternalUser && (
                <Form.Text className="text-muted d-block mt-2">
                    Ta rola widzi wyłącznie pisma kontraktów, do których jest przypisana. Przypisań do kontraktów to okno nie zmienia.
                </Form.Text>
            )}

            {assignmentsFailed && (
                <Alert variant="warning" className="py-1 small mt-2">
                    Nie udało się wczytać przypisań tej osoby - zapis ich nie zmieni, a podgląd jest niedostępny.
                </Alert>
            )}
            <AccessPreview
                personId={initialData?.personId}
                systemRoleId={watch("systemRoleId")}
                projectOurIds={!hasAssignments ? [] : assigned === undefined ? null : (assigned ?? []).map((p) => p.ourId)}
            />

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
                <Form.Check type="switch" label="Finanse firmy" {...register("hasBankAccess")} />
                <Form.Text muted>Wyciągi bankowe i raporty finansowe firmy</Form.Text>
            </Form.Group>

            <Form.Group controlId="canLogSiteVisits" className="mt-3">
                <Form.Check type="switch" label="Wizyty na budowie" {...register("canLogSiteVisits")} />
                <Form.Text muted>Rejestrowanie wizyt w aplikacji mobilnej.</Form.Text>
            </Form.Group>

            <Form.Group controlId="canManageSbAccess" className="mt-3">
                <Form.Check type="switch" label="Zarządza dostępem do Second Brain" {...register("canManageSbAccess")} />
                <Form.Text muted>Zaprasza do SB, blokuje, odblokowuje i odbiera dostęp (Biuro → Administracja → Dostęp do Second Brain). Działa tylko dla roli kierownik albo administrator.</Form.Text>
            </Form.Group>

            <hr />

            <Form.Group controlId="isActive">
                <Form.Check type="switch" label="Aktywny" {...register("isActive")} />
                <Form.Text muted>
                    Odejście z firmy to wyłączenie tej opcji. Osoba od razu traci logowanie do PS (także otwarte okna),
                    konta w FIDmanie i FIN, Second Brain i pokoje Google Chat projektów. Historia zadań, urlopów
                    i przejazdów zostaje. Hasła skrzynek, które osoba znała, trzeba zmienić osobno.
                </Form.Text>
            </Form.Group>

            {/* ROD-3: historia zmian konta - tylko przy edycji, nowa osoba nie ma jeszcze historii. */}
            {isEditing && <AccountEventsList personId={initialData?.personId} />}
        </>
    );
}
