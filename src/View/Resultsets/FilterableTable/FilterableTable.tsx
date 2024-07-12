import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Accordion } from "react-bootstrap";
import { RepositoryDataItem } from "../../../../Typings/bussinesTypes";
import { FilterableTableProvider, useFilterableTableContext } from "./FilterableTableContext";
import { FilterPanel } from "./FilterPanel";
import { ResultSetTable, ResultSetTableProps } from "./ResultSetTable";
import { Section, SectionNode } from "./Section";
import { FilterableTableProps, FilterableTableSnapShot } from "./FilterableTableTypes";

/** Wyświetla tablicę z filtrem i modalami CRUD
 * @param title tytuł tabeli (domyślnie pusty)
 * @initialObjects obiekty do wyświetlenia na starcie (domyślnie pusta tablica)
 * @param tableStructure struktura tabeli (nagłówki i atrybuty obiektów do wyświetlenia w kolumnach lub funkcja zwracająca komponenty do wyświetlenia w kolumnach)
 * @param repository repozytorium z danymi
 * @param AddNewButtonComponents komponenty przycisków dodawania nowych obiektów (domyślnie jeden)
 * @param EditButtonComponent komponent przycisku edycji obiektu
 * @param isDeletable czy można usuwać obiekty z tabeli (domyślnie true)
 * @param FilterBodyComponent komponent zawartości filtra
 * @param selectedObjectRoute ścieżka do wyświetlenia szczegółów obiektu
 */
export default function FilterableTable<LeafDataItemType extends RepositoryDataItem>({
    id,
    title,
    showTableHeader = true,
    repository,
    initialSections = [],
    tableStructure,
    AddNewButtonComponents = [],
    EditButtonComponent,
    isDeletable = true,
    FilterBodyComponent,
    selectedObjectRoute = "",
    initialObjects = undefined,
    onRowClick,
    externalUpdate = 0,
    shouldRetrieveDataBeforeEdit = false,
}: FilterableTableProps<LeafDataItemType>) {
    const [isReady, setIsReady] = useState(true);
    const [activeRowId, setActiveRowId] = useState(0);
    const [sections, setSections] = useState(initialSections as SectionNode<LeafDataItemType>[]);
    const [activeSectionId, setActiveSectionId] = useState("");
    const [objects, setObjects] = useState(initObjects());

    function initObjects() {
        if (initialObjects) return initialObjects;
        const objectsFromStorage = getObjectsFromStorage();
        if (objectsFromStorage) {
            initialObjects = objectsFromStorage;
            repository.items = objectsFromStorage;
            return objectsFromStorage;
        }
        return [];
    }

    function getObjectsFromStorage() {
        const snapshotName = `filtersableTableSnapshot_${id}`;
        const storedSnapshot = sessionStorage.getItem(snapshotName);
        if (!storedSnapshot) return;

        const { storedObjects } = JSON.parse(storedSnapshot) as FilterableTableSnapShot<LeafDataItemType>;
        return storedObjects;
    }

    useEffect(() => {
        if (initialObjects) {
            setObjects(initialObjects);
            //console.log("Aktualizacja obiektów:", initialObjects);
        }
        if (initialSections.length > 0) {
            setSections(initialSections);
            //console.log("Aktualizacja sekcji:", initialSections);
        }
    }, [externalUpdate]);

    function handleAddObject(object: LeafDataItemType) {
        setObjects([...objects, object]);
    }

    function handleEditObject(object: LeafDataItemType) {
        if (!sections.length) setObjects(objects.map((o) => (o.id === object.id ? object : o)));
        else setSections(editNode(sections, activeSectionId, object));
    }

    function handleDeleteObject(objectId: number) {
        setObjects(objects.filter((o) => o.id !== objectId));
    }

    function handleAddSection(sectionDataObject: RepositoryDataItem) {
        setSections(addNode(sections, activeSectionId, sectionDataObject));
    }

    function handleEditSection(sectionDataObject: RepositoryDataItem) {
        setSections(editNode(sections, activeSectionId, sectionDataObject));
    }

    function handleDeleteSection(sectionDataObject: number) {
        setSections(deleteNode(sections, activeSectionId));
    }

    function handleHeaderClick(sectionNode: SectionNode<LeafDataItemType>) {
        const repository = sectionNode.repository;
        setActiveSectionId(sectionNode.id);
        //dodaj sectionNode.dataItem do items jeśłi jeszcze tablica nie zawiera tego elementu
        if (!repository.items.some((item) => item.id === sectionNode.dataItem.id))
            repository.items.push(sectionNode.dataItem);
        repository.addToCurrentItems(sectionNode.dataItem.id);
        console.log("handleHeaderClick", repository.currentItems);
    }

    function handleRowClick(id: number) {
        setActiveRowId(id);
        repository.addToCurrentItems(id);
        console.log("handleRowClick", repository.currentItems);
        if (onRowClick) {
            onRowClick(repository.currentItems[0]);
        }
    }
    console.log("Render FilterableTable: initialSections", initialSections);
    return (
        <FilterableTableProvider<LeafDataItemType>
            id={id}
            objects={objects}
            activeRowId={activeRowId}
            activeSectionId={activeSectionId}
            repository={repository}
            sections={sections}
            tableStructure={tableStructure}
            handleAddObject={handleAddObject}
            handleEditObject={handleEditObject}
            handleDeleteObject={handleDeleteObject}
            setObjects={setObjects}
            setSections={setSections}
            handleAddSection={handleAddSection}
            handleEditSection={handleEditSection}
            handleDeleteSection={handleDeleteSection}
            selectedObjectRoute={selectedObjectRoute}
            EditButtonComponent={EditButtonComponent}
            isDeletable={isDeletable}
            externalUpdate={externalUpdate}
            shouldRetrieveDataBeforeEdit={shouldRetrieveDataBeforeEdit}
        >
            <Container>
                <Row>
                    <Col>{title && <TableTitle title={title} />}</Col>
                    {AddNewButtonComponents && (
                        <Col md="auto">
                            {AddNewButtonComponents.map((ButtonComponent, index) => (
                                <React.Fragment key={index}>
                                    <ButtonComponent modalProps={{ onAddNew: handleAddObject }} />
                                    {index < AddNewButtonComponents.length - 1 && " "}
                                </React.Fragment>
                            ))}
                        </Col>
                    )}
                </Row>
                {FilterBodyComponent && (
                    <Row>
                        <FilterPanel FilterBodyComponent={FilterBodyComponent} repository={repository} />
                    </Row>
                )}
                {!isReady && (
                    <Row>
                        <progress className="mt-1 mb-1" style={{ height: "5px" }} />
                    </Row>
                )}
                <Row>
                    <Col>
                        {initialSections?.length > 0 ? (
                            <Sections
                                onClick={handleHeaderClick}
                                resulsetTableProps={{
                                    showTableHeader: showTableHeader,
                                    onRowClick: handleRowClick,
                                }}
                            />
                        ) : (
                            <>
                                <p className="tekst-muted small">
                                    {objects && `Znaleziono: ${objects.length} pozycji`}
                                </p>
                                <ResultSetTable<LeafDataItemType>
                                    showTableHeader={showTableHeader}
                                    onRowClick={handleRowClick}
                                />
                            </>
                        )}
                    </Col>
                </Row>
            </Container>
        </FilterableTableProvider>
    );
}

export type SectionsProps<DataItemType extends RepositoryDataItem> = {
    resulsetTableProps: ResultSetTableProps<DataItemType>;
    onClick: (sectionNode: SectionNode<DataItemType>) => void;
};

function Sections<DataItemType extends RepositoryDataItem>({
    resulsetTableProps,
    onClick,
}: SectionsProps<DataItemType>) {
    const { sections } = useFilterableTableContext<DataItemType>();

    return (
        <>
            {sections.map((section, index) => {
                return (
                    <Card
                        key={section.dataItem.id + section.type}
                        bg="light"
                        border="light"
                        style={{ marginTop: "10px" }}
                    >
                        <Section<DataItemType>
                            key={section.dataItem.id + section.type}
                            sectionNode={section}
                            resulsetTableProps={resulsetTableProps}
                            onClick={onClick}
                        />
                    </Card>
                );
            })}
        </>
    );
}

export function TableTitle({ title }: { title: string }) {
    return <h1>{title}</h1>;
}

// Funkcja do aktualizacji węzłów
function editNode<LeafDataItemType extends RepositoryDataItem>(
    nodes: SectionNode<LeafDataItemType>[],
    sectionId: string,
    newData: RepositoryDataItem
): SectionNode<LeafDataItemType>[] {
    return nodes.map((node) => {
        if (node.id === sectionId) {
            // Znaleziono węzeł do zaktualizowania, zwracamy nowe dane
            const newSectionNode = { ...node };
            newSectionNode.dataItem = newData;
            if (newSectionNode.editHandler) newSectionNode.editHandler(newSectionNode);
            return newSectionNode;
        } else {
            // Nie znaleziono węzła do zaktualizowania, przeszukujemy dzieci
            return {
                ...node,
                children: editNode(node.children, sectionId, newData),
                leaves: node.leaves ? editLeafDataItem(node.leaves, newData.id, newData) : undefined,
            };
        }
    });
}

// Funkcja do aktualizacji liści
function editLeafDataItem<LeafDataItemType extends RepositoryDataItem>(
    leaves: LeafDataItemType[],
    id: number,
    newData: RepositoryDataItem
): LeafDataItemType[] {
    return leaves.map((leaf) =>
        leaf.id === id
            ? {
                  ...leaf,
                  ...newData,
              }
            : leaf
    );
}

// Funkcja do dodawania nowych węzłów i liści
function addNode<LeafDataItemType extends RepositoryDataItem>(
    nodes: SectionNode<LeafDataItemType>[],
    parentId: string,
    newData: RepositoryDataItem
): SectionNode<LeafDataItemType>[] {
    return nodes.map((node) => {
        if (node.id === parentId) {
            // Jeśli rodzic ma już liście, dodajemy nowe dane jako liść
            if (node.leaves) {
                const newLeaf = { ...newData } as LeafDataItemType;

                return {
                    ...node,
                    leaves: [...node.leaves, newLeaf],
                };
            }
            const newNodeType = node.childrenNodesType || "";

            // W przeciwnym razie dodajemy nowe dane jako węzeł
            const newChild: SectionNode<LeafDataItemType> = {
                id: newNodeType + newData.id,
                isInAccordion: true,
                level: node.level + 1,
                type: newNodeType,
                repository: node.repository,
                dataItem: newData,
                titleLabel: "nowy tytuł",
                children: [],
                leaves: [],
            };

            return {
                ...node,
                children: [...node.children, newChild],
            };
        } else {
            // Nie znaleziono węzła, przeszukujemy dzieci
            return {
                ...node,
                children: addNode(node.children, parentId, newData),
            };
        }
    });
}

function deleteNode<LeafDataItemType extends RepositoryDataItem>(
    nodes: SectionNode<LeafDataItemType>[],
    nodeId: string
): SectionNode<LeafDataItemType>[] {
    return nodes.reduce<SectionNode<LeafDataItemType>[]>((newNodes, node) => {
        if (node.id === nodeId) {
            // Jeśli id węzła pasuje do id, które chcemy usunąć, pomijamy ten węzeł
            return newNodes;
        } else {
            // Jeśli id nie pasuje, przeszukujemy dzieci
            const newNode = {
                ...node,
                children: deleteNode(node.children, nodeId),
            };
            return [...newNodes, newNode];
        }
    }, []);
}
