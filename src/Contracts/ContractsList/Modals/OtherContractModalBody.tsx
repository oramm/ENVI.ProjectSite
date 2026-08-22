import React, { useEffect, useMemo, useRef, useState } from "react";
import { Form } from "react-bootstrap";
import RepositoryReact from "../../../React/RepositoryReact";
import {
    ContractTypeSelector,
    EntitySelector,
} from "../../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { ContractModalBody } from "./ContractModalBody";
import { entitiesRepository } from "../ContractsController";
import { useFormContext } from "../../../View/Modals/FormContext";
import { ModalBodyProps } from "../../../View/Modals/ModalsTypes";
import { EntityData, OtherContract, OurContract } from "../../../../Typings/bussinesTypes";
import { MyAsyncTypeahead } from "../../../View/Modals/CommonFormComponents/GenericComponents";
import { EntityInlineCreateDrawer } from "../../../View/Modals/InlineCreateDrawers";
import { ContractStructureTree } from "./ContractStructureTree";

/**
 * Wskazanie lidera konsorcjum spośród już wybranych wykonawców.
 *
 * Renderuje się WYŁĄCZNIE przy więcej niż jednym wykonawcy — przy jednym nie ma czego
 * wybierać, więc pola nie ma w drzewie DOM; nie jest ukrywane stylem, żeby nie zostawiać
 * kontrolki, którą da się trafić klawiaturą albo czytnikiem ekranu.
 *
 * Wybór jest nieobowiązkowy. Firma wyrzucona z listy wykonawców przestaje być liderem,
 * bo wskazanie na podmiot spoza listy backend i tak odrzuca (400) — a zostawione „w tle"
 * byłoby stanem, którego użytkownik nie widzi na ekranie.
 */
export function ContractLeaderSelect() {
    const { setValue, watch } = useFormContext();
    const contractors = (watch("_contractors") as EntityData[]) || [];
    const leaderEntityId = watch("_leaderEntityId") as number | null | undefined;

    useEffect(() => {
        if (leaderEntityId === undefined || leaderEntityId === null) return;
        if (contractors.some((contractor) => contractor.id === leaderEntityId)) return;
        setValue("_leaderEntityId", null, { shouldValidate: true, shouldDirty: true });
    }, [contractors, leaderEntityId, setValue]);

    if (contractors.length < 2) return null;

    return (
        <Form.Group controlId="_leaderEntityId">
            <Form.Label>Lider konsorcjum</Form.Label>
            <Form.Select
                value={leaderEntityId === undefined || leaderEntityId === null ? "" : String(leaderEntityId)}
                onChange={(event) =>
                    setValue("_leaderEntityId", event.target.value ? Number(event.target.value) : null, {
                        shouldValidate: true,
                        shouldDirty: true,
                    })
                }
            >
                <option value="">— nie wskazano —</option>
                {contractors
                    .filter((contractor) => contractor.id !== undefined && contractor.id !== null)
                    .map((contractor) => (
                        <option key={contractor.id} value={String(contractor.id)}>
                            {contractor.shortName ? `${contractor.name} (${contractor.shortName})` : contractor.name}
                        </option>
                    ))}
            </Form.Select>
            <Form.Text muted>Nieobowiązkowe. Wskazany lider staje się pierwszy na liście wykonawców.</Form.Text>
        </Form.Group>
    );
}

/**Wywoływana w ProjectsSelector jako props  */
export function OtherContractModalBody(props: ModalBodyProps<OtherContract>) {
    const initialData = props.initialData as OtherContract;

    // ✅ Lokalne repository w useMemo - nie będzie kolizji z głównym contractsRepository
    const ourRelatedContractsRepository = useMemo(
        () =>
            new RepositoryReact<OurContract>({
                name: "ourRelatedContracts_temp",
                actionRoutes: { addNewRoute: "", editRoute: "", deleteRoute: "", getRoute: "contracts" },
            }),
        []
    );

    const { setValue, watch } = useFormContext();
    const _project = watch("_project");
    const [showCreateContractor, setShowCreateContractor] = useState(false);

    useEffect(() => {
        setValue("_type", initialData?._type, { shouldValidate: true });
        setValue("_contractors", initialData?._contractors || [], { shouldValidate: true });
        // `null`, a nie `undefined`: obiekt wysyłany przy edycji powstaje przez `lodash.merge`
        // z rekordu w repozytorium, a merge POMIJA `undefined` — czyli zdjęcie lidera nigdy
        // nie doszłoby do serwera. Jawny `null` nadpisuje i backend czyta go jako „bez lidera".
        setValue("_leaderEntityId", initialData?._leaderEntityId ?? null, { shouldValidate: true });
        setValue("_ourContract", initialData?._ourContract, { shouldValidate: true });
    }, [initialData, setValue]);

    function handleContractorCreated(created: EntityData) {
        const current = (watch("_contractors") as EntityData[]) || [];
        setValue("_contractors", [...current, created], { shouldValidate: true });
    }

    return (
        <>
            {" "}
            {!props.isEditing ? <ContractTypeSelector typesToInclude="other" /> : null}
            <ContractModalBody {...props} />
            <Form.Group>
                <Form.Label>Wykonawcy</Form.Label>
                <EntitySelector name="_contractors" multiple={true} onRequestCreate={() => setShowCreateContractor(true)} />
            </Form.Group>
            <ContractLeaderSelect />
            <Form.Group>
                <Form.Label>Powiązana usługa IK lub PT</Form.Label>
                <MyAsyncTypeahead
                    name="_ourContract"
                    labelKey="ourId"
                    searchKey="contractOurId"
                    contextSearchParams={{
                        _project,
                        typesToInclude: "our",
                    }}
                    repository={ourRelatedContractsRepository}
                    renderMenuItemChildren={(option: any) => (
                        <div>
                            {option.ourId} {option.name}
                        </div>
                    )}
                />
            </Form.Group>
            <EntityInlineCreateDrawer
                show={showCreateContractor}
                onHide={() => setShowCreateContractor(false)}
                title="Nowy podmiot (wykonawca)"
                repository={entitiesRepository}
                onCreated={handleContractorCreated}
            />
            {/* Na samym dole formularza: drzewo to ostatnia decyzja przed zapisem. */}
            {!props.isEditing && <ContractStructureTree />}
        </>
    );
}
