import React, { useEffect, useState } from "react";
import { Form, Spinner } from "react-bootstrap";
import { PersonAccountV2Payload, PersonData, PersonProfileV2Payload } from "../../../Typings/bussinesTypes";
import { EntitySelector } from "../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { ErrorMessage } from "../../View/Modals/CommonFormComponents/GenericComponents";
import { useFormContext } from "../../View/Modals/FormContext";
import { ModalBodyProps } from "../../View/Modals/ModalsTypes";
import { fetchPersonAccountV2, fetchPersonProfileV2 } from "../personsV2Helpers";
import { EntityInlineCreateDrawer } from "../../View/Modals/InlineCreateDrawers";
import { entitiesRepository } from "../PersonsController";

export function PersonModalBody({ isEditing, initialData }: ModalBodyProps<PersonData>) {
    const {
        register,
        reset,
        setValue,
        formState: { dirtyFields, errors, isValid },
        trigger,
    } = useFormContext();

    const [v2Loading, setV2Loading] = useState(false);
    const [showCreateEntity, setShowCreateEntity] = useState(false);
    const [accountV2, setAccountV2] = useState<PersonAccountV2Payload | null>(null);
    const [profileV2, setProfileV2] = useState<PersonProfileV2Payload | null>(null);

    useEffect(() => {
        const resetData: any = {
            _entity: initialData?._entity || null,
            name: initialData?.name || "",
            surname: initialData?.surname || "",
            position: initialData?.position || "",
            email: initialData?.email || "",
            cellphone: initialData?.cellphone || "",
            phone: initialData?.phone || "",
            comment: initialData?.comment || "",
            //systemRoleId: initialData?.systemRoleId,
            //systemEmail: initialData?.systemEmail,
            //googleId: initialData?.googleId,
            //googleRefreshToken: initialData?.googleRefreshToken,
        };
        reset(resetData);
        trigger();

        // Przy edycji pobierz dane z endpointow v2 (account + profile)
        if (isEditing && initialData?.id) {
            let cancelled = false;
            setV2Loading(true);

            Promise.all([fetchPersonAccountV2(initialData.id), fetchPersonProfileV2(initialData.id)])
                .then(([accountData, profileData]) => {
                    if (cancelled) return;

                    // Zapisz account i profile do lokalnego stanu
                    // (pola account sa zakomentowane w formularzu -- dane na potrzeby przyszlego write path FE-PV2-06)
                    setAccountV2(accountData);
                    setProfileV2(profileData);
                })
                .catch((error) => {
                    if (!cancelled) {
                        console.error("PersonModalBody: blad ladowania danych v2:", error);
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
                <EntitySelector name="_entity" multiple={false} onRequestCreate={() => setShowCreateEntity(true)} />
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

            <Form.Group controlId="cellphone">
                <Form.Label>Telefon komórkowy</Form.Label>
                <Form.Control
                    placeholder="Podaj numer komórki"
                    isInvalid={!!errors?.cellphone}
                    isValid={!errors?.cellphone}
                    {...register("cellphone")}
                />
                <ErrorMessage name="cellphone" errors={errors} />
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
            <EntityInlineCreateDrawer
                show={showCreateEntity}
                onHide={() => setShowCreateEntity(false)}
                title="Nowy podmiot"
                repository={entitiesRepository}
                onCreated={(created) => setValue("_entity", created, { shouldValidate: true })}
            />
        </>
    );
}
