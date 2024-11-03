import React, { useEffect } from "react";
import { Form } from "react-bootstrap";
import { useFormContext } from "../../View/Modals/FormContext";
import { ModalBodyProps } from "../../View/Modals/ModalsTypes";
import { PersonData } from "../../../Typings/bussinesTypes";
import { entitiesRepository } from "../PersonsController";
import { ErrorMessage, MyAsyncTypeahead } from "../../View/Modals/CommonFormComponents/GenericComponents";
import { EntitySelector } from "../../View/Modals/CommonFormComponents/BussinesObjectSelectors";

export function PersonModalBody({ isEditing, initialData }: ModalBodyProps<PersonData>) {
    const {
        register,
        reset,
        formState: { dirtyFields, errors, isValid },
        trigger,
    } = useFormContext();

    useEffect(() => {
        const resetData: any = {
            _entity: initialData?._entity,
            name: initialData?.name,
            surname: initialData?.surname,
            position: initialData?.position,
            email: initialData?.email,
            cellPhone: initialData?.cellPhone,
            phone: initialData?.phone,
            comment: initialData?.comment,
            //systemRoleId: initialData?.systemRoleId,
            //systemEmail: initialData?.systemEmail,
            //googleId: initialData?.googleId,
            //googleRefreshToken: initialData?.googleRefreshToken,
        };
        reset(resetData);
        trigger();
    }, [initialData, reset]);

    return (
        <>
            <Form.Group>
                <Form.Label>Odbiorcy</Form.Label>
                <EntitySelector name="_entity" repository={entitiesRepository} multiple={true} />
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
        </>
    );
}
