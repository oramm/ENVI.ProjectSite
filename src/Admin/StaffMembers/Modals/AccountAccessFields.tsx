import React from "react";
import { Form } from "react-bootstrap";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ErrorMessage } from "../../../View/Modals/CommonFormComponents/GenericComponents";

export function AccountAccessFields({ children }: { children?: React.ReactNode }) {
    const {
        register,
        formState: { errors },
    } = useFormContext();
    return (
        <>
            {[
                { name: "fidmanEnabled", user: "FIDmana", system: "FIDmanie" },
                { name: "finEnabled", user: "FIN", system: "FIN" },
            ].map(({ name, user, system }) => (
                <Form.Group key={name} controlId={name} className="mt-2">
                    <Form.Check
                        type="checkbox"
                        label={`Użytkownik ${user} (loguje się tym samym kontem Google)`}
                        isInvalid={!!errors?.[name]}
                        {...register(name)}
                    />
                    <Form.Text className="text-muted">
                        Konto w {system} zakłada się z e-maila systemowego. Odznaczenie wyłącza je, nie kasuje.
                    </Form.Text>
                    {name === "fidmanEnabled" && children}
                    <ErrorMessage name={name} errors={errors} />
                </Form.Group>
            ))}
        </>
    );
}
