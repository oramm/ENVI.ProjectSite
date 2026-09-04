import React, { useEffect } from "react";
import { Form } from "react-bootstrap";
import { SystemUserData } from "../../../../Typings/bussinesTypes";
import MainSetup from "../../../React/MainSetupReact";
import {
    EntitySelector,
    ProjectSelector,
    SystemRoleSelector,
} from "../../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { ErrorMessage } from "../../../View/Modals/CommonFormComponents/GenericComponents";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";

/**
 * Zakładanie użytkownika z okna „Personel i uprawnienia" (PER-3).
 *
 * Dwie sekcje, bo powstają dwie różne rzeczy: osoba w książce adresowej i jej konto
 * w systemie. Kolejność pól i etykiety jak na skasowanym ekranie „Dodawanie użytkowników" -
 * to ten sam przepływ, tylko w innym oknie.
 *
 * TYLKO dodawanie. Uprawnienia i konto istniejącej osoby edytuje `StaffMemberModalBody`,
 * a jej dane kontaktowe - okno „Osoby". Dlatego nie ma tu doczytywania danych z tras v2:
 * przy zakładaniu nie ma czego doczytać.
 */
export function UserModalBody({ initialData }: ModalBodyProps<SystemUserData>) {
    const {
        register,
        reset,
        trigger,
        watch,
        formState: { errors },
    } = useFormContext();

    // Role ograniczone do przypisanych projektów muszą te projekty dostać przy zakładaniu,
    // inaczej konto powstaje bez dostępu do czegokolwiek.
    const isProjectScopedRole = MainSetup.isProjectScopedRoleId(watch("systemRoleId"));

    useEffect(() => {
        reset({
            _entity: initialData?._entity || null,
            name: "",
            surname: "",
            position: "",
            email: "",
            cellphone: "",
            phone: "",
            comment: "",
            systemRoleId: "",
            systemEmail: "",
            fidmanEnabled: false,
            // Celowo BEZ _projectAssignments - patrz `saveProjectAssignments`: brak pola
            // znaczy „nie ruszaj", pusta tablica znaczy „wyczyść". Przy zakładaniu nie ma
            // czego czyścić, a selektor doda pole, gdy rola go pokaże.
        });
        trigger();
    }, [initialData, reset]);

    return (
        <>
            <div className="fw-semibold mb-2">Dane osoby</div>

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
                    placeholder="Podaj email kontaktowy"
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

            <Form.Group controlId="cellphone">
                <Form.Label>Telefon komórkowy</Form.Label>
                <Form.Control
                    placeholder="Podaj numer komórki"
                    isInvalid={!!errors?.cellphone}
                    {...register("cellphone")}
                />
                <ErrorMessage name="cellphone" errors={errors} />
            </Form.Group>

            <Form.Group controlId="phone">
                <Form.Label>Telefon</Form.Label>
                <Form.Control
                    placeholder="Podaj numer telefonu"
                    isInvalid={!!errors?.phone}
                    {...register("phone")}
                />
                <ErrorMessage name="phone" errors={errors} />
            </Form.Group>

            <hr />

            <div className="fw-semibold mb-2">Konto w systemie</div>

            <Form.Group controlId="systemEmail">
                <Form.Label>Email systemowy</Form.Label>
                <Form.Control
                    type="email"
                    placeholder="Podaj gmail do logowania potrzebny do utworzenia konta na witrynie"
                    isInvalid={!!errors?.systemEmail}
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
                    <Form.Text className="text-muted">Ta rola widzi wyłącznie dane wskazanych tu projektów.</Form.Text>
                </Form.Group>
            )}
        </>
    );
}
