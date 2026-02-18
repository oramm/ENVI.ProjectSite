import React, { useEffect, useMemo } from "react";
import { Form } from "react-bootstrap";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import { PersonProfileSkillV2Record, SkillDictionaryRecord } from "../../../../Typings/bussinesTypes";
import { ErrorMessage } from "../../../View/Modals/CommonFormComponents/GenericComponents";
import { SkillSelector } from "../../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import RepositoryReact from "../../../React/RepositoryReact";

const LEVEL_OPTIONS = [
    { value: "", label: "-- wybierz --" },
    { value: "BEGINNER", label: "Poczatkujacy" },
    { value: "INTERMEDIATE", label: "Sredniozaawansowany" },
    { value: "ADVANCED", label: "Zaawansowany" },
    { value: "EXPERT", label: "Ekspert" },
];

export function ProfileSkillModalBody({ isEditing, initialData }: ModalBodyProps<PersonProfileSkillV2Record>) {
    const {
        register,
        watch,
        setValue,
        reset,
        formState: { errors },
        trigger,
    } = useFormContext();

    const skillRepository = useMemo(
        () =>
            new RepositoryReact<SkillDictionaryRecord>({
                actionRoutes: {
                    getRoute: "v2/skills/search",
                    addNewRoute: "",
                    editRoute: "",
                    deleteRoute: "",
                },
                name: "profileSkillSelector_temp",
            }),
        []
    );

    const selectedSkill = watch("_skill") as SkillDictionaryRecord | undefined;

    useEffect(() => {
        reset({
            _skill: initialData?._skill,
            skillId: initialData?.skillId,
            levelCode: initialData?.levelCode || "",
            yearsOfExperience: initialData?.yearsOfExperience,
        });
        trigger();
    }, [initialData, reset, trigger]);

    useEffect(() => {
        const mappedSkillId = selectedSkill?.id;
        setValue("skillId", mappedSkillId);
        trigger("skillId");
    }, [selectedSkill, setValue, trigger]);

    return (
        <>
            <Form.Group controlId="_skill" className="mb-3">
                <SkillSelector
                    name="_skill"
                    label="Specjalizacja"
                    multiple={false}
                    repository={skillRepository}
                />
                <ErrorMessage name="skillId" errors={errors} />
            </Form.Group>

            <Form.Group controlId="levelCode" className="mb-3">
                <Form.Label>Poziom</Form.Label>
                <Form.Select {...register("levelCode")}>
                    {LEVEL_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>

            <Form.Group controlId="yearsOfExperience" className="mb-3">
                <Form.Label>Lata doswiadczenia</Form.Label>
                <Form.Control
                    type="number"
                    min={0}
                    max={50}
                    placeholder="np. 5"
                    isInvalid={!!errors?.yearsOfExperience}
                    isValid={!errors?.yearsOfExperience}
                    {...register("yearsOfExperience", { valueAsNumber: true })}
                />
                <ErrorMessage name="yearsOfExperience" errors={errors} />
            </Form.Group>
        </>
    );
}
