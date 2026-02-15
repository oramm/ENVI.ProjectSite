import React, { useCallback, useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { Controller } from "react-hook-form";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import { PersonProfileSkillV2Record, SkillDictionaryRecord } from "../../../../Typings/bussinesTypes";
import { ErrorMessage } from "../../../View/Modals/CommonFormComponents/GenericComponents";
import { fetchSkillsDictionary } from "../../personsV2Helpers";

const LEVEL_OPTIONS = [
    { value: "", label: "-- wybierz --" },
    { value: "BEGINNER", label: "Początkujący" },
    { value: "INTERMEDIATE", label: "Średniozaawansowany" },
    { value: "ADVANCED", label: "Zaawansowany" },
    { value: "EXPERT", label: "Ekspert" },
];

export function ProfileSkillModalBody({ isEditing, initialData }: ModalBodyProps<PersonProfileSkillV2Record>) {
    const {
        register,
        reset,
        setValue,
        control,
        formState: { errors },
        trigger,
    } = useFormContext();

    const [isLoading, setIsLoading] = useState(false);
    const [options, setOptions] = useState<SkillDictionaryRecord[]>([]);

    useEffect(() => {
        const resetData: any = {
            skillId: initialData?.skillId,
            levelCode: initialData?.levelCode || "",
            yearsOfExperience: initialData?.yearsOfExperience,
            _selectedSkill: initialData?._skill ? [initialData._skill] : [],
        };
        reset(resetData);
        trigger();
    }, [initialData, reset]);

    const handleSearch = useCallback(async (query: string) => {
        setIsLoading(true);
        try {
            const results = await fetchSkillsDictionary(query);
            setOptions(results);
        } finally {
            setIsLoading(false);
        }
    }, []);

    function handleSkillChange(selected: SkillDictionaryRecord[]) {
        setValue("_selectedSkill", selected);
        if (selected.length > 0) {
            setValue("skillId", selected[0].id);
        } else {
            setValue("skillId", undefined);
        }
        trigger("skillId");
    }

    return (
        <>
            <Form.Group controlId="skillId" className="mb-3">
                <Form.Label>Specjalizacja</Form.Label>
                <Controller
                    name="_selectedSkill"
                    control={control}
                    render={({ field }) => (
                        <AsyncTypeahead
                            id="profileSkill-asyncTypeahead"
                            labelKey="name"
                            multiple={false}
                            isLoading={isLoading}
                            onSearch={handleSearch}
                            options={options}
                            onChange={(selected) => handleSkillChange(selected as SkillDictionaryRecord[])}
                            selected={field.value || []}
                            placeholder="Wpisz nazwę specjalizacji..."
                            minLength={1}
                            isInvalid={!!errors?.skillId}
                            renderMenuItemChildren={(option) => {
                                const skill = option as SkillDictionaryRecord;
                                return <span>{skill.name}</span>;
                            }}
                        />
                    )}
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
                <Form.Label>Lata doświadczenia</Form.Label>
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
