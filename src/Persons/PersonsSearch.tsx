import React, { useCallback, useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import FilterableTable from "../View/Resultsets/FilterableTable/FilterableTable";
import { PersonData } from "../../Typings/bussinesTypes";
import { PersonsFilterBody } from "./PersonFilterBody";
import { PersonAddNewModalButton, PersonEditModalButton } from "./Modals/PersonModalButtons";
import { personsRepository } from "./PersonsController";
import PersonProfilePanel from "./PersonProfilePanel";
import { PersonPermissionsButton } from "./PersonPermissionsButton";

// Stała tablica: nowa przy każdym renderze przerysowywałaby akcje wiersza bez powodu.
const personRowActionMenuComponents = [PersonPermissionsButton];

export default function PersonsSearch({ title }: { title: string }) {
    const [selectedPerson, setSelectedPerson] = useState<PersonData | null>(null);

    useEffect(() => {
        document.title = title;
    }, [title]);

    function renderEntityName(person: PersonData) {
        return person._entity?.name || "-";
    }

    function renderContact(person: PersonData) {
        const phone = person.phone || person.cellphone || "-";
        const email = person.email || "-";

        return (
            <div className="mb-2">
                <span className="text-muted">Kontakt:</span> <span className="fw-bold">{phone}</span>
                <span className="text-muted"> | </span>
                <span>{email}</span>
            </div>
        );
    }

    function renderSkills(person: PersonData) {
        if (!person._skillNames) return null;
        return (
            <div className="text-muted small" style={{ whiteSpace: "pre-line" }}>
                <span className="fw-bold">Specjalizacje:</span> {person._skillNames}
            </div>
        );
    }

    function renderRowContent(person: PersonData) {
        return (
            <>
                <div className="d-flex align-items-center gap-2 mb-2">
                    <h5 className="mb-0">
                        {person.name} {person.surname}
                    </h5>
                    {person.position && <small className="text-muted">{person.position}</small>}
                </div>
                <div className="mb-2">
                    <span className="text-muted">Firma:</span>{" "}
                    <span className="fw-bold">{renderEntityName(person)}</span>
                </div>
                {renderContact(person)}
                {renderSkills(person)}
            </>
        );
    }

    const handleRowClick = useCallback((person: PersonData) => {
        setSelectedPerson(person);
    }, []);

    const handleClosePanel = useCallback(() => {
        setSelectedPerson(null);
    }, []);

    return (
        // Kontener jest tu konieczny, nie ozdobny (uwaga ownera 2026-09-04): wiersz siatki
        // Bootstrapa ma ujemne marginesy po obu stronach, które równoważy dopiero wypełnienie
        // kontenera. Bez niego wiersz wystawał 12 px poza prawą krawędź okna (pomiar: prawa
        // krawędź 1932 przy oknie 1920) i okno dostawało poziomy pasek przewijania -
        // jedyne okno z listą, bo tylko ono opakowuje tabelę w wiersz siatki (panel profilu obok).
        <Container fluid>
            <Row>
                <Col md={selectedPerson ? 8 : 12}>
                <FilterableTable<PersonData>
                    id="persons"
                    title={title}
                    FilterBodyComponent={PersonsFilterBody}
                    tableStructure={[
                        { header: undefined, renderTdBody: (person: PersonData) => renderRowContent(person) },
                    ]}
                    AddNewButtonComponents={[PersonAddNewModalButton]}
                    EditButtonComponent={PersonEditModalButton}
                    RowActionMenuComponents={personRowActionMenuComponents}
                    isDeletable={true}
                    repository={personsRepository}
                    selectedObjectRoute={"/person/"}
                    onRowClick={handleRowClick}
                />
            </Col>
            {selectedPerson && (
                <Col md={4}>
                    <PersonProfilePanel person={selectedPerson} onClose={handleClosePanel} />
                </Col>
            )}
            </Row>
        </Container>
    );
}
