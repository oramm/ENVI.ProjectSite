import React, { useEffect, useState } from "react";
import { Form, Spinner } from "react-bootstrap";
import { PersonProfileV2Payload, SystemUserData } from "../../../../Typings/bussinesTypes";
import {
    fetchPersonAccountV2,
    fetchPersonProfileV2,
    fetchPersonProjectAssignments,
} from "../../../Persons/personsV2Helpers";
import MainSetup from "../../../React/MainSetupReact";
import {
    EntitySelector,
    ProjectSelector,
    SystemRoleSelector,
} from "../../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { ErrorMessage } from "../../../View/Modals/CommonFormComponents/GenericComponents";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";

export function SystemUserModalBody({ isEditing, initialData }: ModalBodyProps<SystemUserData>) {
    const {
        register,
        reset,
        watch,
        getValues,
        formState: { dirtyFields, errors, isValid },
        trigger,
    } = useFormContext();

    const [v2Loading, setV2Loading] = useState(false);
    const [profileV2, setProfileV2] = useState<PersonProfileV2Payload | null>(null);

    // Role zakresowe (pracownik kontraktowy, klient) widzą tylko przypisane projekty,
    // więc przy nich trzeba je wskazać. Dla pozostałych ról pole nie ma sensu i się nie pokazuje.
    const isProjectScopedRole = MainSetup.isProjectScopedRoleId(watch("systemRoleId"));

    useEffect(() => {
        const resetData: any = {
            _entity: initialData?._entity || null,
            name: initialData?.name || "",
            surname: initialData?.surname || "",
            position: initialData?.position || "",
            email: initialData?.email || "",
            cellPhone: initialData?.cellPhone || "",
            phone: initialData?.phone || "",
            comment: initialData?.comment || "",
            systemRoleId: initialData?.systemRoleId || "",
            systemEmail: initialData?.systemEmail || "",
            fidmanEnabled: initialData?.fidmanEnabled ?? false,
            // Celowo BEZ _projectAssignments: przypisania dojeżdżają osobnym żądaniem.
            // Pusta tablica znaczyłaby "użytkownik wyczyścił listę", więc zapis wykonany
            // zanim dane dotrą skasowałby przypisania. Brak pola blokuje zapis (patrz
            // saveProjectAssignments), pusta lista już nie.
            //googleId: initialData?.googleId,
            //googleRefreshToken: initialData?.googleRefreshToken,
        };
        reset(resetData);
        trigger();

        // Przy edycji pobierz dane z endpointow v2 (account + profile + przypisania projektów)
        if (isEditing && initialData?.id) {
            let cancelled = false;
            setV2Loading(true);

            Promise.all([
                fetchPersonAccountV2(initialData.id),
                fetchPersonProfileV2(initialData.id),
                fetchPersonProjectAssignments(initialData.id).catch(() => []),
            ])
                .then(([accountData, profileData, assignments]) => {
                    if (cancelled) return;

                    // Zapisz profile do lokalnego stanu (na potrzeby przyszlego write path)
                    setProfileV2(profileData);

                    // Nadpisz pola account w formularzu danymi z v2
                    if (accountData) {
                        // getValues(), nie resetData: dane dojeżdżają po otwarciu modala,
                        // a resetData to zdjęcie sprzed żądania - nadpisanie nim skasowałoby
                        // to, co użytkownik zdążył wpisać w międzyczasie.
                        reset({
                            ...getValues(),
                            systemRoleId: accountData.systemRoleId ?? resetData.systemRoleId,
                            systemEmail: accountData.systemEmail ?? resetData.systemEmail,
                            fidmanEnabled: accountData.fidmanEnabled ?? resetData.fidmanEnabled,
                            _projectAssignments: assignments,
                        });
                        trigger();
                    }
                })
                .catch((error) => {
                    if (!cancelled) {
                        console.error("SystemUserModalBody: blad ladowania danych v2:", error);
                    }
                })
                .finally(() => {
                    if (!cancelled) setV2Loading(false);
                });

            return () => {
                cancelled = true;
            };
        }
    }, [initialData, reset]);

    return (
        <>
            {v2Loading && (
                <div className="text-muted small mb-2 d-flex align-items-center">
                    <Spinner animation="border" size="sm" className="me-2" />
                    Ladowanie danych konta...
                </div>
            )}
            <Form.Group>
                <Form.Label>Podmiot</Form.Label>
                <EntitySelector name="_entity" multiple={false} />
            </Form.Group>
            <Form.Group controlId="name">
                <Form.Label>Imię</Form.Label>
                <Form.Control
                    placeholder="Podaj imię"
                    isInvalid={!!errors?.name}
                    isValid={!errors?.name}
                    {...register("name")}
                />
                <ErrorMessage name="name" errors={errors} />
            </Form.Group>

            <Form.Group controlId="surname">
                <Form.Label>Nazwisko</Form.Label>
                <Form.Control
                    placeholder="Podaj nazwisko"
                    isInvalid={!!errors?.surname}
                    isValid={!errors?.surname}
                    {...register("surname")}
                />
                <ErrorMessage name="surname" errors={errors} />
            </Form.Group>

            <Form.Group controlId="email">
                <Form.Label>Email</Form.Label>
                <Form.Control
                    type="email"
                    placeholder="Podaj email"
                    isInvalid={!!errors?.email}
                    isValid={!errors?.email}
                    {...register("email")}
                />
                <ErrorMessage name="email" errors={errors} />
            </Form.Group>

            <Form.Group controlId="position">
                <Form.Label>Stanowisko</Form.Label>
                <Form.Control
                    placeholder="Podaj stanowisko"
                    isInvalid={!!errors?.position}
                    isValid={!errors?.position}
                    {...register("position")}
                />
                <ErrorMessage name="position" errors={errors} />
            </Form.Group>

            <Form.Group controlId="cellPhone">
                <Form.Label>Telefon komórkowy</Form.Label>
                <Form.Control
                    placeholder="Podaj numer komórki"
                    isInvalid={!!errors?.cellPhone}
                    isValid={!errors?.cellPhone}
                    {...register("cellPhone")}
                />
                <ErrorMessage name="cellPhone" errors={errors} />
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

            <Form.Group controlId="systemEmail">
                <Form.Label>Email systemowy</Form.Label>
                <Form.Control
                    type="email"
                    placeholder="Podaj gmail do logowania potrzebny do utworzenia konta na witrynie"
                    isInvalid={!!errors?.systemEmail}
                    isValid={!errors?.systemEmail}
                    {...register("systemEmail")}
                />
                <ErrorMessage name="systemEmail" errors={errors} />
            </Form.Group>

            <SystemRoleSelector name="systemRoleId" />

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
                <ErrorMessage name="fidmanEnabled" errors={errors} />
            </Form.Group>

            {isProjectScopedRole && (
                <Form.Group className="mt-2">
                    <ProjectSelector name="_projectAssignments" multiple label="Przypisane projekty" />
                    <Form.Text className="text-muted">
                        Ta rola widzi wyłącznie dane wskazanych tu projektów.
                    </Form.Text>
                </Form.Group>
            )}
        </>
    );
}
