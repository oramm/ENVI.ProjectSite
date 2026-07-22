import React, { useEffect, useRef, useState } from "react";
import {
    CaseSelectMenuElement,
    ContractSelector,
    LetterSelector,
    ProjectSelector,
    RegisteringEditorSelector,
} from "../../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { Alert, Col, Form, Row } from "react-bootstrap";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import {
    Case,
    Contract,
    IncomingLetterContract,
    OurLetterContract,
    ProjectData,
} from "../../../../Typings/bussinesTypes";
import { casesRepository, projectsRepository } from "../LettersController";
import { ErrorMessage, FileInput } from "../../../View/Modals/CommonFormComponents/GenericComponents";
import { InlineCreateDrawer } from "../../../View/Modals/InlineCreateDrawer";
import {
    CaseInlineCreateBody,
    makeInlineCaseValidationSchema,
} from "../../../TasksGlobal/Modals/Case/CaseInlineCreateBody";
import { CaseModalBody } from "../../../TasksGlobal/Modals/Case/CaseModalBody";
import { makeCaseValidationSchema } from "../../../TasksGlobal/Modals/Case/CaseValidationSchema";
import {
    buildCaseHeaderBadge,
    buildContractHeaderBadge,
} from "../../../TasksGlobal/Modals/Case/CaseModalButtons";

// Typ kamienia „projektowanie - nadzór” (MilestoneTypes.Id) — dla niego oferujemy
// opcję dodania pisma do „Dokumentacji zatwierdzonej”. Odpowiednik Setup.MilestoneTypes.DESIGN_SUPERVISION.
const DESIGN_SUPERVISION_MILESTONE_TYPE_ID = 6;

export function LetterModalBody({
    isEditing,
    initialData,
    getConfidenceClass = () => '',
    fileInputRef,
}: LetterModalBodyProps & { fileInputRef?: React.RefObject<HTMLInputElement> }) {
    const {
        register,
        reset,
        setValue,
        watch,
        formState: { dirtyFields, errors, isValid },
        trigger,
    } = useFormContext();
    // fallback do initialData._project: przy odpowiedzi na pismo projekt jest znany z góry
    // (modal otwiera się bez ProjectSelectorModalBody, więc watch("_project") jest puste)
    const _project = isEditing
        ? undefined
        : (watch("_project") as ProjectData | undefined) ?? initialData?._project;

    // Panel inline-tworzenia Sprawy (Offcanvas) + token wymuszający odświeżenie opcji
    // selektora ze źródła prawdy (casesRepository.items) po utworzeniu/edycji sprawy.
    const [showCreateCase, setShowCreateCase] = useState(false);
    const [showEditCase, setShowEditCase] = useState(false);
    const [caseToEdit, setCaseToEdit] = useState<Case | undefined>(undefined);
    const [caseOptionsRefreshToken, setCaseOptionsRefreshToken] = useState(0);

    const _contract = watch("_contract");
    const _watchedCases = watch("_cases") as Case[] | undefined;
    // Opcja „Dokumentacja zatwierdzona” tylko gdy kontrakt ma włączoną flagę
    // i któraś wybrana sprawa należy do kamienia projektowanie - nadzór.
    const approvedDocsApplicable =
        (_contract as Contract | undefined)?.approvedDocumentation === true &&
        !!_watchedCases?.some(
            (caseItem) => caseItem?._parent?._type?.id === DESIGN_SUPERVISION_MILESTONE_TYPE_ID
        );
    const creationDate = watch("creationDate");
    const registrationDate = watch("registrationDate");
    const responseDueDate = watch("responseDueDate");

    function getContractFromCases(_cases: Case[] | undefined) {
        if (!_cases || _cases.length === 0) return undefined;
        return _cases[0]._parent?._contract as Contract;
    }

    // Po utworzeniu sprawy w panelu: addNewItem dopisał ją już do casesRepository.items
    // (źródło prawdy). Auto-zaznaczamy ją w `_cases` i podbijamy token, by selektor
    // przebudował opcje z repository.items. Nie mutujemy stanu poza setValue/setState.
    function handleCaseCreated(newCase: Case) {
        const created = casesRepository.items.find((item) => item.id === newCase.id) ?? newCase;
        const current = (watch("_cases") as Case[] | undefined) ?? [];
        const alreadySelected = current.some((item) => item.id === created.id);
        const nextCases = alreadySelected ? current : [...current, created];
        setValue("_cases", nextCases, { shouldValidate: true });
        setCaseOptionsRefreshToken((token) => token + 1);
    }

    // Po edycji sprawy: editItem zaktualizował casesRepository.items (źródło prawdy).
    // Zastępujemy edytowaną sprawę w `_cases` i podbijamy token, by selektor odświeżył opcje.
    function handleCaseEdited(editedCase: Case) {
        const updated = casesRepository.items.find((item) => item.id === editedCase.id) ?? editedCase;
        const current = (watch("_cases") as Case[] | undefined) ?? [];
        const nextCases = current.map((item) => (item.id === updated.id ? updated : item));
        setValue("_cases", nextCases, { shouldValidate: true });
        setCaseOptionsRefreshToken((token) => token + 1);
    }

    useEffect(() => {
        const nowUTC = new Date().toISOString().split("T")[0];
        const toDateInput = (value: string | undefined | null): string => {
            if (!value) return "";
            const iso = value.match(/^(\d{4}-\d{2}-\d{2})/);
            return iso ? iso[1] : "";
        };

        const resetData: any = {
            id: initialData?.id,
            _contract: getContractFromCases(initialData?._cases),
            _cases: initialData?._cases || [],
            description: initialData?.description || "",
            creationDate: initialData?.creationDate || nowUTC,
            registrationDate: initialData?.registrationDate || nowUTC,
            _editor: initialData?._editor,
            relatedLetterNumber: initialData?.relatedLetterNumber || "",
            responseDueDate: toDateInput(initialData?.responseDueDate),
            addedToApprovedDocumentation: initialData?.addedToApprovedDocumentation ? 1 : 0,
        };
        if (!isEditing) resetData._project = _project;
        reset(resetData);

        trigger();
    }, [initialData, reset]);

    useEffect(() => {
        if (!dirtyFields._contract) return;
        setValue("_cases", undefined, { shouldValidate: true });
        // zmiana kontraktu unieważnia zaznaczenie „dokumentacji zatwierdzonej”
        setValue("addedToApprovedDocumentation", 0, { shouldValidate: true });
    }, [_contract, _contract?.id, setValue]);

    useEffect(() => {
        trigger(["creationDate", "registrationDate", "responseDueDate"]);
    }, [trigger, watch, creationDate, registrationDate, responseDueDate]);

    useEffect(() => {
        if (!isEditing) setValue("registrationDate", creationDate);
    }, [setValue, creationDate, isEditing]);

    return (
        <>
            <Form.Group controlId="_contract">
                <Form.Label>Wybierz kontrakt</Form.Label>
                <ContractSelector name="_contract" _project={_project} readOnly={!isEditing} />
            </Form.Group>
            <Form.Group>
                <Form.Label>Dotyczy spraw</Form.Label>
                {_contract ? (
                    <CaseSelectMenuElement
                        name="_cases"
                        repository={casesRepository}
                        _project={_project}
                        _contract={_contract}
                        readonly={!_contract}
                        onRequestCreate={() => setShowCreateCase(true)}
                        onRequestEdit={(caseItem) => {
                            setCaseToEdit(caseItem);
                            setShowEditCase(true);
                        }}
                        refreshToken={caseOptionsRefreshToken}
                    />
                ) : (
                    <Alert variant="warning">Wybierz kontrakt, by przypisać do spraw</Alert>
                )}
            </Form.Group>

            {approvedDocsApplicable && (
                <Form.Group controlId="addedToApprovedDocumentation" className="mt-2">
                    {/* Zapisujemy 1/0 (nie boolean), bo przy piśmie z plikiem payload idzie
                        jako FormData, a serializer gubi wartości boolean. Backend robi !!. */}
                    <Form.Check
                        type="checkbox"
                        label="Dodaj to pismo do &quot;Dokumentacji zatwierdzonej&quot;"
                        checked={!!watch("addedToApprovedDocumentation")}
                        onChange={(e) =>
                            setValue("addedToApprovedDocumentation", e.target.checked ? 1 : 0, {
                                shouldValidate: true,
                            })
                        }
                    />
                </Form.Group>
            )}

            {/* Panel boczny tworzenia Sprawy "w miejscu" — ta SAMA instancja casesRepository
                co selektor, więc utworzona sprawa odświeża jego opcje. */}
            <InlineCreateDrawer<Case>
                show={showCreateCase}
                onHide={() => setShowCreateCase(false)}
                title="Nowa sprawa"
                headerBadge={buildContractHeaderBadge(_contract as any)}
                repository={casesRepository}
                ModalBodyComponent={CaseInlineCreateBody}
                additionalModalBodyProps={{ _contract }}
                makeValidationSchema={makeInlineCaseValidationSchema}
                onCreated={handleCaseCreated}
            />

            {/* Panel boczny edycji Sprawy "w miejscu" — ta SAMA instancja casesRepository
                co selektor, więc po edycji token odświeży dane sprawy. */}
            <InlineCreateDrawer<Case>
                show={showEditCase}
                onHide={() => setShowEditCase(false)}
                title="Edytuj sprawę"
                headerBadge={buildCaseHeaderBadge(
                    caseToEdit?._parent,
                    caseToEdit?.parentCaseId
                        ? casesRepository.items.find((c) => c.id === caseToEdit.parentCaseId)
                        : undefined
                )}
                repository={casesRepository}
                ModalBodyComponent={CaseModalBody}
                makeValidationSchema={makeCaseValidationSchema}
                isEditing={true}
                initialData={caseToEdit}
                onEdited={handleCaseEdited}
            />

            <Form.Group controlId="description">
                <Form.Label>Opis</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Podaj opis"
                    isValid={!errors?.description}
                    isInvalid={!!errors?.description}
                    {...register("description")}
                />
                <ErrorMessage name="description" errors={errors} />
            </Form.Group>
            <Row>
                <Form.Group as={Col} controlId="creationDate">
                    <Form.Label>Data utworzenia</Form.Label>
                    <Form.Control
                        type="date"
                        isValid={!errors.creationDate}
                        isInvalid={!!errors.creationDate}
                        {...register("creationDate")}
                        className={getConfidenceClass("creationDate")}
                    />
                    <ErrorMessage name="creationDate" errors={errors} />
                </Form.Group>
                <Form.Group as={Col} controlId="registrationDate">
                    <Form.Label>Data Nadania</Form.Label>
                    <Form.Control
                        type="date"
                        isValid={!errors.registrationDate}
                        isInvalid={!!errors.registrationDate}
                        {...register("registrationDate")}
                    />
                    <ErrorMessage name="registrationDate" errors={errors} />
                </Form.Group>
            </Row>
            <Form.Group controlId="_editor">
                <RegisteringEditorSelector
                    label="Osoba rejestrująca"
                    name="_editor"
                />
            </Form.Group>
            <Form.Group controlId="file">
                <Form.Label>Plik</Form.Label>
                <FileInput {...register("file")} inputRef={fileInputRef} />
                {isEditing && (
                    <Form.Text className="text-muted small">
                        Wcześniej załączone pliki są widoczne na dysku w folderze pisma. System nie zapamiętuje tych
                        plików jako wartości pola wyboru pliku.
                    </Form.Text>
                )}
            </Form.Group>
            <Row>
                <Form.Group as={Col} controlId="relatedLetterNumber">
                    {_contract ? (
                        <LetterSelector
                            name="relatedLetterNumber"
                            label="Numer powiązanego pisma"
                            _contract={_contract}
                        />
                    ) : (
                        <>
                            <Form.Label>Numer powiązanego pisma</Form.Label>
                            <Form.Control placeholder="Najpierw wybierz kontrakt" disabled />
                        </>
                    )}
                </Form.Group>
                <Form.Group as={Col} controlId="responseDueDate">
                    <Form.Label>Odpowiedzieć do</Form.Label>
                    <Form.Control
                        type="date"
                        isValid={!errors.responseDueDate}
                        isInvalid={!!errors.responseDueDate}
                        {...register("responseDueDate")}
                        className={getConfidenceClass("responseDueDate")}
                    />
                    <ErrorMessage name="responseDueDate" errors={errors} />
                </Form.Group>
            </Row>
        </>
    );
}

type ProjectSelectorProps = ModalBodyProps & {
    SpecificContractModalBody?: React.ComponentType<ModalBodyProps>;
};
/** przełęcza widok pomiędzy wyborem projektu a formularzem pisma
 * SpecificContractModalBody - komponent formularza kontraktu (OurContractModalBody lub OtherContractModalBody)
 * @param additionalProps - dodatkowe propsy przekazywane do SpecificContractModalBody - ustawiane w Otjer lub OurContractModalBody
 * w tym przypadku jest additionalProps zawiera tylko parametr SpecificContractModalBody - komponent formularza kontraktu (OurContractModalBody lub OtherContractModalBody)
 *
 */
export function ProjectSelectorModalBody({ isEditing, additionalProps }: ProjectSelectorProps) {
    const { register, setValue, watch, formState } = useFormContext();
    const _project = watch("_project") as ProjectData | undefined;

    //musi być zgodna z nazwą w Our... lub OtherContractModalBody
    const { SpecificLetterModalBody } = additionalProps;
    if (!SpecificLetterModalBody) throw new Error("SpecificContractModalBody is not defined");

    return (
        <>
            {_project ? (
                <SpecificLetterModalBody isEditing={isEditing} additionalProps={additionalProps} />
            ) : (
                <ProjectSelector name="_project" />
            )}
        </>
    );
}

type LetterModalBodyProps = ModalBodyProps<OurLetterContract | IncomingLetterContract> & {
    getConfidenceClass?: (fieldName: string) => string;
};
