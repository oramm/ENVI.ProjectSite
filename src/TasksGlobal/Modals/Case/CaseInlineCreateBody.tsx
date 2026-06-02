import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import { Alert, Spinner } from "react-bootstrap";
import { Case, Contract, MilestoneData } from "../../../../Typings/bussinesTypes";
import { MilestoneSelector } from "../../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import { CaseModalBody } from "./CaseModalBody";
import { makeCaseValidationSchema } from "./CaseValidationSchema";
import { caseTypesRepository } from "../../../Contracts/ContractsList/ContractsController";

/**
 * Schemat walidacji dla inline-tworzenia Sprawy w panelu.
 *
 * BRAMKA: `makeCaseValidationSchema` waliduje wyłącznie `name`/`description` (NIE `_parent`
 * ani `_type`), więc sam w sobie nie blokuje zapisu przed wyborem kamienia milowego.
 * Tutaj rozszerzamy go o wymóg `_parent` (Kamień milowy) i `_type` (Typ sprawy), dzięki
 * czemu przycisk "Zapisz" w `InlineCreateDrawer` (disabled gdy `!isValid`) pozostaje
 * zablokowany, dopóki rodzic i typ nie zostaną wybrane.
 */
export function makeInlineCaseValidationSchema(isEditing: boolean) {
    return makeCaseValidationSchema(isEditing).shape({
        _parent: Yup.object().nullable().required("Wybierz kamień milowy"),
        _type: Yup.object().nullable().required("Wybierz typ sprawy"),
    });
}

/**
 * Złożone body panelu inline-tworzenia Sprawy (używane przez `InlineCreateDrawer`).
 *
 * Reużywa istniejące komponenty bez ich modyfikacji:
 * - `MilestoneSelector` (z N2) — wybór Kamienia milowego (rodzica Sprawy); zapisuje
 *   wybrany obiekt do pola `_parent` w formularzu,
 * - `CaseModalBody` — niezmieniony formularz Sprawy (typ + nazwa + uwagi).
 *
 * `CaseModalBody` czyta rodzica jako `initialData?._parent || contextData` i na jego
 * podstawie renderuje `CaseTypeSelector` (`milestoneType={_parent._type}`). Dlatego
 * dopiero PO wybraniu Kamienia milowego przekazujemy go do `CaseModalBody` jako
 * `contextData` — to spełnia kontrakt "drawer wstrzykuje Milestone jako _parent".
 *
 * `_contract` (do załadowania listy kamieni) przychodzi przez `additionalProps`.
 */
export function CaseInlineCreateBody({ additionalProps }: ModalBodyProps<Case>) {
    const { watch } = useFormContext();
    const _contract = additionalProps?._contract as Contract | undefined;
    const selectedMilestone = watch("_parent") as MilestoneData | undefined;
    // null = jeszcze nieładowane; liczba = wynik ostatniego ładowania dla kontraktu.
    const [milestoneCount, setMilestoneCount] = useState<number | null>(null);

    // `CaseTypeSelector` czyta opcje wprost z `caseTypesRepository.items`, ale sam ich NIE
    // ładuje — w TasksGlobal repo jest wstępnie ładowane na mount. W formularzu pisma nikt go
    // nie ładuje, więc tutaj dociągamy typy spraw, zanim zamontujemy CaseModalBody (inaczej
    // lista "Typ sprawy" jest pusta).
    const [caseTypesReady, setCaseTypesReady] = useState(caseTypesRepository.items.length > 0);
    useEffect(() => {
        let active = true;
        if (caseTypesRepository.items.length === 0) {
            caseTypesRepository
                .loadItemsFromServerPOST()
                .then(() => active && setCaseTypesReady(true))
                .catch(() => active && setCaseTypesReady(true));
        }
        return () => {
            active = false;
        };
    }, []);

    // Brak kamieni milowych dla kontraktu ⇒ nie da się utworzyć Sprawy (musi mieć rodzica).
    // Zgodnie z N0: kierujemy do TasksGlobal (inline tworzenie Kamienia jest odroczone).
    const hasNoMilestones = !!_contract && milestoneCount === 0;

    return (
        <>
            <MilestoneSelector name="_parent" _contract={_contract} onOptionsLoaded={setMilestoneCount} />
            {hasNoMilestones ? (
                <Alert variant="warning" className="mt-2 mb-0 small">
                    Ten kontrakt nie ma jeszcze kamieni milowych, więc nie można utworzyć sprawy.
                    Dodaj kamień milowy w{" "}
                    <Alert.Link href="#/tasksGlobal" target="_blank" rel="noopener noreferrer">
                        module Zadania (TasksGlobal)
                    </Alert.Link>
                    , a następnie wróć tutaj.
                </Alert>
            ) : selectedMilestone ? (
                caseTypesReady ? (
                    <CaseModalBody isEditing={false} contextData={selectedMilestone} />
                ) : (
                    <div className="d-flex align-items-center gap-2 mt-2 text-muted small">
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                        Ładowanie typów spraw…
                    </div>
                )
            ) : (
                <Alert variant="light" className="mt-2 mb-0 border small text-muted">
                    Wybierz kamień milowy, aby określić typ i nazwę sprawy.
                </Alert>
            )}
        </>
    );
}
