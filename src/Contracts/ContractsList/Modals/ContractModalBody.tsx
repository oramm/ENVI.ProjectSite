import React, { useEffect, useState } from "react";
import {
    ContractRangeSelector,
    ProjectSelector,
} from "../../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { Col, Form, Row } from "react-bootstrap";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import { ContractRangeData, OtherContract, OurContract, ProjectData } from "../../../../Typings/bussinesTypes";
import { ContractRangeInlineCreateDrawer } from "../../../View/Modals/InlineCreateDrawers";
import { contractRangesRepository, projectsRepository } from "../ContractsController";
import ToolsDate from "../../../React/Tools/ToolsDate";
import ToolsForms from "../../../React/Tools/ToolsForms";
import { ErrorMessage, ValueInPLNInput } from "../../../View/Modals/CommonFormComponents/GenericComponents";
import { ContractStatusSelector } from "../../../View/Modals/CommonFormComponents/StatusSelectors";

// Typy kontraktów, które mają kamień „Projektowanie - nadzór” (MilestoneType 6)
// wg MilestoneTypes_ContractTypes: 3 = „Żółty”, 8 = „Usługa”. Tylko dla nich
// opcja „Dokumentacja zatwierdzona” ma sens (gdzie indziej kamień 6 nie powstaje).
const APPROVED_DOCS_CONTRACT_TYPE_IDS = [3, 8];

export function ContractModalBody({ isEditing, initialData }: ModalBodyProps<OurContract | OtherContract>) {
    const {
        register,
        setValue,
        reset,
        watch,
        formState: { errors },
        trigger,
    } = useFormContext();
    const watchAllFields = watch();
    const [showCreateContractRange, setShowCreateContractRange] = useState(false);
    // „Dokumentacja zatwierdzona” tylko dla typów kontraktu mających kamień 6.
    const approvedDocsAllowed = APPROVED_DOCS_CONTRACT_TYPE_IDS.includes(
        (watch("_type") as { id?: number } | undefined)?.id ?? -1
    );
    let startDateSugestion: string | undefined;
    let endDateSugestion: string | undefined;
    let guaranteeEndDateSugestion: string | undefined;

    if (isEditing) {
        startDateSugestion = initialData?.startDate;
        endDateSugestion = initialData?.endDate;
        guaranteeEndDateSugestion = initialData?.guaranteeEndDate;
    } else {
        startDateSugestion = new Date().toISOString().slice(0, 10);
        endDateSugestion = ToolsDate.addDays(startDateSugestion, 365).toISOString().slice(0, 10);
        guaranteeEndDateSugestion = ToolsDate.addDays(endDateSugestion, 365 * 2)
            .toISOString()
            .slice(0, 10);
    }
    useEffect(() => {
        setValue("name", initialData?.name || "", { shouldValidate: true });
        setValue("number", initialData?.number || "", { shouldValidate: true });
        setValue("alias", initialData?.alias || "", { shouldValidate: true });
        setValue("_contractRanges", initialData?._contractRangesPerContract || [], { shouldValidate: true });
        setValue("comment", initialData?.comment || "", { shouldValidate: true });
        setValue("value", initialData?.value || "", { shouldValidate: true });
        setValue("status", initialData?.status || "", { shouldValidate: true });
        setValue("lettersShortcutsInSubfolder", initialData?.lettersShortcutsInSubfolder ?? false, { shouldValidate: true });
        setValue("approvedDocumentation", initialData?.approvedDocumentation ?? false, { shouldValidate: true });
        // Metoda rozliczenia (RZL pack): pole nieobowiązkowe, dokładnie dwie opcje domenowe.
        // "" = jeszcze nie wpisano (789 kontraktów historycznych) — to stan pusty pola,
        // NIE trzecia opcja do wyboru. Backend normalizuje "" do null (Contract.ts).
        setValue("settlementMethod", initialData?.settlementMethod ?? "", { shouldValidate: true });
        setValue("startDate", startDateSugestion, { shouldValidate: true });
        setValue("endDate", endDateSugestion, { shouldValidate: true });
        setValue("guaranteeEndDate", guaranteeEndDateSugestion, { shouldValidate: true });
    }, [initialData, setValue]);

    return (
        <>
            <Form.Group controlId="number">
                <Form.Label>Numer kontraktu</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Podaj numer"
                    isInvalid={!!errors?.number}
                    isValid={!errors?.number}
                    {...register("number")}
                />
                <ErrorMessage errors={errors} name="number" />
            </Form.Group>
            <Form.Group controlId="name">
                <Form.Label>Nazwa kontraktu</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Podaj nazwę"
                    isInvalid={!!errors?.name}
                    isValid={!errors?.name}
                    {...register("name")}
                />
                <ErrorMessage errors={errors} name="name" />
            </Form.Group>

            <Form.Group controlId="alias">
                <Form.Label>Alias</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Podaj alias"
                    required
                    isValid={!errors?.alias}
                    isInvalid={!!errors?.alias}
                    {...register("alias")}
                />
                <ErrorMessage errors={errors} name="alias" />
            </Form.Group>
            <ContractRangeSelector
                repository={contractRangesRepository}
                onRequestCreate={() => setShowCreateContractRange(true)}
            />
            <Form.Group controlId="comment">
                <Form.Label>Opis</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Podaj opis"
                    isValid={!errors?.comment}
                    isInvalid={!!errors?.comment}
                    {...register("comment")}
                />
                <ErrorMessage errors={errors} name="comment" />
            </Form.Group>
            <Form.Group controlId="valueInPLN">
                <Form.Label>Wartość netto w PLN</Form.Label>
                <ValueInPLNInput />
            </Form.Group>
            <Row>
                <Form.Group as={Col} controlId="startDate">
                    <Form.Label>Początek</Form.Label>
                    <Form.Control
                        type="date"
                        isValid={!errors.startDate}
                        isInvalid={!!errors.startDate}
                        {...register("startDate")}
                        className={
                            !isEditing
                                ? ToolsForms.getSuggestedClass("startDate", watchAllFields, startDateSugestion)
                                : ""
                        }
                        onChange={(e) => {
                            register("startDate").onChange(e); // wywołaj standardowe zachowanie
                            trigger("endDate");
                        }}
                    />
                    <ErrorMessage errors={errors} name="startDate" />
                </Form.Group>
                <Form.Group as={Col} controlId="endDate">
                    <Form.Label>Zakończenie</Form.Label>
                    <Form.Control
                        type="date"
                        isValid={!errors.endDate}
                        isInvalid={!!errors.endDate}
                        {...register("endDate")}
                        className={
                            !isEditing ? ToolsForms.getSuggestedClass("endDate", watchAllFields, endDateSugestion) : ""
                        }
                        onChange={(e) => {
                            register("endDate").onChange(e); // wywołaj standardowe zachowanie
                            trigger("startDate");
                            trigger("guaranteeEndDate");
                        }}
                    />
                    <ErrorMessage errors={errors} name="endDate" />
                </Form.Group>
                <Form.Group as={Col} controlId="guaranteeEndDate">
                    <Form.Label>Gwarancja</Form.Label>
                    <Form.Control
                        type="date"
                        isValid={!errors.guaranteeEndDate}
                        isInvalid={!!errors.guaranteeEndDate}
                        {...register("guaranteeEndDate")}
                        className={
                            !isEditing
                                ? ToolsForms.getSuggestedClass(
                                      "guaranteeEndDate",
                                      watchAllFields,
                                      guaranteeEndDateSugestion
                                  )
                                : ""
                        }
                        onChange={(e) => {
                            register("guaranteeEndDate").onChange(e); // wywołaj standardowe zachowanie
                            //trigger("startDate");
                        }}
                    />
                    <ErrorMessage errors={errors} name="guaranteeEndDate" />
                </Form.Group>
            </Row>
            <ContractStatusSelector />
            <Form.Group controlId="lettersShortcutsInSubfolder" className="mt-2">
                <Form.Check
                    type="checkbox"
                    label="Czy chcesz aby skróty do pism były dostępne w podfolderze &quot;Pisma&quot;?"
                    {...register("lettersShortcutsInSubfolder")}
                />
            </Form.Group>
            {approvedDocsAllowed && (
                <Form.Group controlId="approvedDocumentation" className="mt-2">
                    <Form.Check
                        type="checkbox"
                        label="Czy chcesz dodać folder &quot;Dokumentacja zatwierdzona&quot; (kamień projektowanie - nadzór)?"
                        {...register("approvedDocumentation")}
                    />
                </Form.Group>
            )}
            {/* Metoda rozliczenia (RZL pack, 40_wiki/firma/technologie/plakietka-typu-kontraktu-akcent):
                dokładnie dwie opcje domenowe + pusty stan początkowy „—" dla kontraktów bez wpisanej
                wartości. Pole nieobowiązkowe — NIE dodawać trzeciej opcji („nieustalona"/„mieszana");
                kontrakt mieszany owner wpisuje wg przeważającej metody. */}
            <Form.Group controlId="settlementMethod" className="mt-2">
                <Form.Label>Metoda rozliczenia</Form.Label>
                <Form.Control as="select" {...register("settlementMethod")}>
                    <option value="">—</option>
                    <option value="LUMP_SUM">ryczałt</option>
                    <option value="MEASUREMENT">obmiar</option>
                </Form.Control>
            </Form.Group>
            <ContractRangeInlineCreateDrawer
                show={showCreateContractRange}
                onHide={() => setShowCreateContractRange(false)}
                title="Nowy zakres kontraktu"
                onCreated={(created) => {
                    // selektor jest multiple - dopisujemy nowy zakres do już wybranych
                    const current = (watch("_contractRanges") || []) as ContractRangeData[];
                    setValue("_contractRanges", [...current, created], { shouldValidate: true });
                }}
            />
        </>
    );
}

type ProjectSelectorProps = ModalBodyProps & {
    SpecificContractModalBody?: React.ComponentType<ModalBodyProps>;
};
/** przełęcza widok pomiędzy wyborem projektu a formularzem kontraktu
 * SpecificContractModalBody - komponent formularza kontraktu (OurContractModalBody lub OtherContractModalBody)
 * @param additionalProps - dodatkowe propsy przekazywane do SpecificContractModalBody - ustawiane w Other lub OurContractModalBody
 * w tym przypadku jest additionalProps zawiera tylko parametr SpecificContractModalBody - komponent formularza kontraktu (OurContractModalBody lub OtherContractModalBody)
 *
 */
export function ProjectSelectorModalBody({ isEditing, additionalProps }: ProjectSelectorProps) {
    const { register, setValue, watch, formState } = useFormContext();
    const project = watch("_project") as ProjectData | undefined;

    //musi być zgodna z nazwą w Our... lub OtherContractModalBody
    const { SpecificContractModalBody } = additionalProps;
    if (!SpecificContractModalBody) throw new Error("SpecificContractModalBody is not defined");

    return (
        <>
            {project ? (
                <SpecificContractModalBody isEditing={isEditing} additionalProps={additionalProps} />
            ) : (
                <ProjectSelector />
            )}
        </>
    );
}
