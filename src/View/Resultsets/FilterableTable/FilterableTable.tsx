import React, { useEffect, useMemo, useState } from "react";
import { Card, Col, Container, Row } from "react-bootstrap";
import { RepositoryDataItem } from "../../../../Typings/bussinesTypes";
import { FilterableTableProvider, useFilterableTableContext } from "./FilterableTableContext";
import { FilterableTableProps, FilterableTableSnapShot } from "./FilterableTableTypes";
import { FilterPanel } from "./FilterPanel";
import { ResultSetTable, ResultSetTableProps } from "./ResultSetTable";
import { Section, SectionNode } from "./Section";
import { ExpandTrigger, ToggleExpandButton } from "./ToggleExpandButton";

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
    isCopyable = false,
    FilterBodyComponent,
    selectedObjectRoute = "",
    initialObjects = undefined,
    onRowClick,
    externalUpdate = 0,
    shouldRetrieveDataBeforeEdit = false,
    specialRetrieveActionRoute,
    fixedCriteria,
    autoSearchOnReset = false,
    snapshotMode = "criteria+objects",
    sectionsFilterHandlers,
}: FilterableTableProps<LeafDataItemType>) {
    const snapshotName = `filtersableTableSnapshot_${id}`;

    const [isReady, setIsReady] = useState(true);
    const [activeRowId, setActiveRowId] = useState(0);
    const [sections, setSections] = useState(initialSections as SectionNode<LeafDataItemType>[]);
    const [activeSectionId, setActiveSectionId] = useState("");
    const [editingSectionId, setEditingSectionId] = useState("");
    const [objects, setObjects] = useState(initObjects());
    const [globalExpandTrigger, setGlobalExpandTrigger] = useState<ExpandTrigger>(null);

    /** Rekurencyjnie znajduje ścieżkę od korzenia do węzła o podanym ID */
    function findPathToNode(
        nodes: SectionNode<LeafDataItemType>[],
        targetId: string,
        currentPath: string[] = []
    ): string[] | null {
        for (const node of nodes) {
            const newPath = [...currentPath, node.id];
            if (node.id === targetId) {
                return newPath;
            }
            if (node.children.length > 0) {
                const result = findPathToNode(node.children, targetId, newPath);
                if (result) return result;
            }
        }
        return null;
    }

    /** Oblicza zbiór ID sekcji na ścieżce od korzenia do aktywnej sekcji */
    const activePathSet = useMemo(() => {
        if (!activeSectionId || sections.length === 0) return new Set<string>();
        const path = findPathToNode(sections, activeSectionId);
        return new Set(path || []);
    }, [activeSectionId, sections]);

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
        const storedSnapshot = sessionStorage.getItem(snapshotName);
        if (!storedSnapshot) return;

        const { storedObjects } = JSON.parse(storedSnapshot) as FilterableTableSnapShot<LeafDataItemType>;
        return storedObjects;
    }

    function updateSnapshot() {
        const currentSnapshot = sessionStorage.getItem(snapshotName);
        if (!currentSnapshot) return;

        if (snapshotMode === "criteria-only") return;

        const parsedSnapshot = JSON.parse(currentSnapshot) as FilterableTableSnapShot<LeafDataItemType>;
        const updatedFilterableTableSnapshot: FilterableTableSnapShot<LeafDataItemType> = {
            ...parsedSnapshot,
            storedObjects: repository.items,
        };
        sessionStorage.setItem(snapshotName, JSON.stringify(updatedFilterableTableSnapshot));
    }

    useEffect(() => {
        if (initialObjects) {
            setObjects(initialObjects);
        }
        if (initialSections.length > 0) {
            setSections(initialSections);
        }
    }, [externalUpdate]);

    useEffect(() => {
        if (sections.length === 0 && initialSections.length > 0) {
            setSections(initialSections as SectionNode<LeafDataItemType>[]);
        }
    }, [initialSections]);

    function handleAddObject(object: LeafDataItemType) {
        setObjects([...repository.items]);
        updateSnapshot();
    }

    function handleEditObject(object: LeafDataItemType) {
        if (!sections.length) {
            setObjects([...repository.items]);
            updateSnapshot();
        } else setSections(editNode(sections, activeSectionId, object as RepositoryDataItem));
    }
    function handleCopyObject(object: LeafDataItemType) {
        setObjects([...repository.items]);
        updateSnapshot();
    }

    function handleDeleteObject(objectId: number) {
        if (!sections.length) setObjects([...repository.items]);
        else setSections(removeLeafFromSections(sections, objectId));
        updateSnapshot();
    }

    async function refreshSectionsFromHandlers(): Promise<boolean> {
        if (!sectionsFilterHandlers?.onSubmitSections) {
            return false;
        }

        const storedSnapshot = sessionStorage.getItem(snapshotName);
        const parsedSnapshot = storedSnapshot
            ? (JSON.parse(storedSnapshot) as FilterableTableSnapShot<LeafDataItemType>)
            : undefined;
        const criteria = parsedSnapshot?.criteria || {};

        setIsReady(false);
        try {
            const refreshedSections = await sectionsFilterHandlers.onSubmitSections(criteria);
            setSections(refreshedSections);
            return true;
        } catch (error) {
            console.error("Nie udało się odświeżyć sekcji po zmianie", error);
            return false;
        } finally {
            setIsReady(true);
        }
    }

    function removeLeafFromSections(
        nodes: SectionNode<LeafDataItemType>[],
        leafId: number
    ): SectionNode<LeafDataItemType>[] {
        return nodes.map((node) => ({
            ...node,
            children: removeLeafFromSections(node.children, leafId),
            leaves: node.leaves?.filter((leaf) => leaf.id !== leafId),
        }));
    }

    function handleAddSection(sectionDataObject: RepositoryDataItem) {
        void (async () => {
            const wasRefreshed = await refreshSectionsFromHandlers();
            if (wasRefreshed) return;

            setSections(addNode(sections, activeSectionId, sectionDataObject));
        })();
    }

    function handleEditSection(sectionDataObject: RepositoryDataItem) {
        void (async () => {
            const wasRefreshed = await refreshSectionsFromHandlers();
            if (wasRefreshed) return;

            setSections(editNode(sections, activeSectionId, sectionDataObject));
        })();
    }

    function handleDeleteSection(sectionDataObject: number) {
        void (async () => {
            const wasRefreshed = await refreshSectionsFromHandlers();
            if (wasRefreshed) return;

            setSections(deleteNode(sections, activeSectionId));
        })();
    }

    function handleHeaderClick(sectionNode: SectionNode<LeafDataItemType>) {
        const repository = sectionNode.repository;
        // Ustaw kontekst (tło propaguje się w górę przez activePathSet)
        setActiveSectionId(sectionNode.id);
        // Ustaw fokus edycji (menu widoczne tylko tutaj)
        setEditingSectionId(sectionNode.id);
        // Odznacz wiersz tabeli (liść)
        setActiveRowId(0);
        //dodaj sectionNode.dataItem do items jeśłi jeszcze tablica nie zawiera tego elementu
        if (!repository.items.some((item) => item.id === sectionNode.dataItem.id))
            repository.items.push(sectionNode.dataItem);
        repository.addToCurrentItems(sectionNode.dataItem.id);
        console.log("handleHeaderClick", repository.currentItems);
    }

    function showFilter() {
        if (!FilterBodyComponent) return false;
        // Tryb sekcji: wymaga min. 5 sekcji i gotowości komponentu
        if (sections.length > 0) return sections.length >= 5 && isReady;
        // Tryb płaski: zawsze pokazuj
        return true;
    }

    const handleRowClick = (id: number, parentSectionId?: string) => {
        setActiveRowId(id);
        // Ukryj menu sekcji przy kliknięciu w liść (wiersz tabeli)
        setEditingSectionId("");
        // Jeśli przekazano ID sekcji rodzica, ustaw ścieżkę tła
        if (parentSectionId) {
            setActiveSectionId(parentSectionId);
        } else {
            // W trybie bez sekcji (czysta tabela) wyczyść activeSectionId
            setActiveSectionId("");
        }
        console.log("clickedRow:", id);
        repository.addToCurrentItems(id);
        console.log("currentItems:", repository.currentItems);
        if (onRowClick) {
            onRowClick(repository.currentItems[0]);
        }
    };

    return (
        <FilterableTableProvider<LeafDataItemType>
            id={id}
            objects={objects}
            activeRowId={activeRowId}
            activeSectionId={activeSectionId}
            editingSectionId={editingSectionId}
            activePathSet={activePathSet}
            repository={repository}
            sections={sections}
            tableStructure={tableStructure}
            handleAddObject={handleAddObject}
            handleEditObject={handleEditObject}
            handleCopyObject={handleCopyObject}
            handleDeleteObject={handleDeleteObject}
            setObjects={setObjects}
            setSections={setSections}
            handleAddSection={handleAddSection}
            handleEditSection={handleEditSection}
            handleDeleteSection={handleDeleteSection}
            selectedObjectRoute={selectedObjectRoute}
            EditButtonComponent={EditButtonComponent}
            isDeletable={isDeletable}
            isCopyable={isCopyable}
            externalUpdate={externalUpdate}
            shouldRetrieveDataBeforeEdit={shouldRetrieveDataBeforeEdit}
            specialRetrieveActionRoute={specialRetrieveActionRoute}
            globalExpandTrigger={globalExpandTrigger}
            snapshotMode={snapshotMode}
            sectionsFilterHandlers={sectionsFilterHandlers}
        >
            <Container>
                <Row className="align-items-center">
                    <Col>{title && <TableTitle title={title} />}</Col>
                    {AddNewButtonComponents && (
                        <Col md="auto">
                            {AddNewButtonComponents.map((ButtonComponent, index) => (
                                <React.Fragment key={index}>
                                    <ButtonComponent modalProps={{ onAddNew: handleAddObject, repository }} />
                                    {index < AddNewButtonComponents.length - 1 && " "}
                                </React.Fragment>
                            ))}
                        </Col>
                    )}
                    {sections.length > 0 && (
                        <Col md="auto">
                            <ToggleExpandButton
                                expandTrigger={globalExpandTrigger}
                                setExpandTrigger={setGlobalExpandTrigger}
                                className="d-flex align-items-center justify-content-center me-3"
                            />
                        </Col>
                    )}
                </Row>
                {FilterBodyComponent && showFilter() && (
                    <Row className="bg-light p-3 rounded-3 mb-3">
                        <FilterPanel
                            FilterBodyComponent={FilterBodyComponent}
                            repository={repository}
                            fixedCriteria={fixedCriteria}
                            autoSearchOnReset={autoSearchOnReset}
                        />
                    </Row>
                )}
                {!isReady && (
                    <Row>
                        <progress className="mt-1 mb-1" style={{ height: "5px" }} />
                    </Row>
                )}
                <Row>
                    <Col>
                        {sections.length > 0 ? (
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
                // Determine if this is a "Card Section" (like Contract) or regular list
                // If it has a border color, Section.tsx will render its own Card style wrapper.
                // We should avoid wrapping it in an extra Bootstrap Card to prevent double margins/padding.
                const isSelfContainedCard = !!section.borderColor;

                if (isSelfContainedCard) {
                    return (
                        <Section<DataItemType>
                            key={section.dataItem.id + section.type}
                            sectionNode={section}
                            resulsetTableProps={resulsetTableProps}
                            onClick={onClick}
                        />
                    );
                }

                // Initial behavior for standard sections
                return (
                    <Card key={section.dataItem.id + section.type} bg="light" border="light">
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

/** Funkcja do aktualizacji węzłów
 * jeśli edytujemy sekcję to zaczynamy od najwyższego poziomu drzewa i schodzimy do spodu szukając sekcji
 * jeśli edytujemy liść to zaczynamy od sekcji z najwyższego poziomu drzewa i schodzimy do spodu szukając liścia i go edytujemy
 * @param nodes tablica węzłów
 * @param sectionId id węzła sekcji do edycji - dla liscia jest to id sekcji głównej
 * @param newData nowe dane węzła lub liścia
 */
function editNode<LeafDataItemType extends RepositoryDataItem>(
    nodes: SectionNode<LeafDataItemType>[],
    sectionId: string,
    newData: RepositoryDataItem
): SectionNode<LeafDataItemType>[] {
    return nodes.map((node) => {
        const nodeTypeToEdit = nodeTypeToBeEdited(node, newData);
        if (nodeTypeToEdit === "SECTION") {
            if (node.id !== sectionId) {
                // bieżący węzeł to nie ten szukany, przeszukujemy dzieci
                return {
                    ...node,
                    children: editNode(node.children, sectionId, newData),
                };
            }
            // Edytujemy sekcję Znaleziono węzeł do zaktualizowania
            const newSectionNode = { ...node };
            newSectionNode.dataItem = newData;
            if (newSectionNode.editHandler) newSectionNode.editHandler(newSectionNode);
            return newSectionNode;
        } //jeśli edytujemy liść to zaczynamy od sekcji z najwyższego poziomu drzewa i schodzimy do spodu szukając liścia
        else if (nodeTypeToEdit === "LEAF") {
            //mamy sekcję nadrzędną dla szukanego liścia
            if (node.editHandler) node.editHandler(node);
            return {
                ...node,
                children: node.children && editNode(node.children, sectionId, newData),
                leaves: node.leaves && editLeafDataItem(node.leaves, newData),
            };
        }
        throw new Error(`Zły typ węzła}`);
    });
}

function nodeTypeToBeEdited<LeafDataItemType extends RepositoryDataItem>(
    node: SectionNode<LeafDataItemType>,
    newData: RepositoryDataItem
) {
    if (newData.id === node.dataItem.id) return "SECTION";
    return "LEAF";
}

/**Funkcja do aktualizacji liści */
function editLeafDataItem<LeafDataItemType extends RepositoryDataItem>(
    leaves: LeafDataItemType[],
    newData: RepositoryDataItem
): LeafDataItemType[] {
    return leaves.map((leaf) =>
        leaf.id === newData.id
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
                title: <>nowy tytuł</>,
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
