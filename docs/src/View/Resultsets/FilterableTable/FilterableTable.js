"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableTitle = void 0;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const react_fontawesome_1 = require("@fortawesome/react-fontawesome");
const free_solid_svg_icons_1 = require("@fortawesome/free-solid-svg-icons");
const FilterableTableContext_1 = require("./FilterableTableContext");
const FilterPanel_1 = require("./FilterPanel");
const ResultSetTable_1 = require("./ResultSetTable");
const Section_1 = require("./Section");
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
function FilterableTable({ id, title, showTableHeader = true, repository, initialSections = [], tableStructure, AddNewButtonComponents = [], EditButtonComponent, isDeletable = true, isCopyable = false, FilterBodyComponent, selectedObjectRoute = "", initialObjects = undefined, onRowClick, externalUpdate = 0, shouldRetrieveDataBeforeEdit = false, specialRetrieveActionRoute, }) {
    const snapshotName = `filtersableTableSnapshot_${id}`;
    const [isReady, setIsReady] = (0, react_1.useState)(true);
    const [activeRowId, setActiveRowId] = (0, react_1.useState)(0);
    const [sections, setSections] = (0, react_1.useState)(initialSections);
    const [activeSectionId, setActiveSectionId] = (0, react_1.useState)("");
    const [objects, setObjects] = (0, react_1.useState)(initObjects());
    const [globalExpandTrigger, setGlobalExpandTrigger] = (0, react_1.useState)(null);
    function initObjects() {
        if (initialObjects)
            return initialObjects;
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
        if (!storedSnapshot)
            return;
        const { storedObjects } = JSON.parse(storedSnapshot);
        return storedObjects;
    }
    function updateSnapshot() {
        const currentSnapshot = sessionStorage.getItem(snapshotName);
        if (!currentSnapshot)
            return;
        const updatedFilterableTableSnapshot = {
            criteria: JSON.parse(currentSnapshot),
            storedObjects: repository.items,
        };
        sessionStorage.setItem(snapshotName, JSON.stringify(updatedFilterableTableSnapshot));
    }
    (0, react_1.useEffect)(() => {
        if (initialObjects) {
            setObjects(initialObjects);
        }
        if (initialSections.length > 0) {
            setSections(initialSections);
        }
    }, [externalUpdate]);
    function handleAddObject(object) {
        setObjects([...repository.items]);
        updateSnapshot();
    }
    function handleEditObject(object) {
        if (!sections.length) {
            setObjects([...repository.items]);
            updateSnapshot();
        }
        else
            setSections(editNode(sections, activeSectionId, object));
    }
    function handleCopyObject(object) {
        setObjects([...repository.items]);
        updateSnapshot();
    }
    function handleDeleteObject(objectId) {
        if (!sections.length)
            setObjects([...repository.items]);
        else
            setSections(removeLeafFromSections(sections, objectId));
        updateSnapshot();
    }
    function removeLeafFromSections(nodes, leafId) {
        return nodes.map((node) => ({
            ...node,
            children: removeLeafFromSections(node.children, leafId),
            leaves: node.leaves?.filter((leaf) => leaf.id !== leafId),
        }));
    }
    function handleAddSection(sectionDataObject) {
        setSections(addNode(sections, activeSectionId, sectionDataObject));
    }
    function handleEditSection(sectionDataObject) {
        setSections(editNode(sections, activeSectionId, sectionDataObject));
    }
    function handleDeleteSection(sectionDataObject) {
        setSections(deleteNode(sections, activeSectionId));
    }
    function handleHeaderClick(sectionNode) {
        const repository = sectionNode.repository;
        setActiveSectionId(sectionNode.id);
        //dodaj sectionNode.dataItem do items jeśłi jeszcze tablica nie zawiera tego elementu
        if (!repository.items.some((item) => item.id === sectionNode.dataItem.id))
            repository.items.push(sectionNode.dataItem);
        repository.addToCurrentItems(sectionNode.dataItem.id);
        console.log("handleHeaderClick", repository.currentItems);
    }
    const handleRowClick = (id) => {
        setActiveRowId(id);
        console.log("clickedRow:", id);
        repository.addToCurrentItems(id);
        console.log("currentItems:", repository.currentItems);
        if (onRowClick) {
            onRowClick(repository.currentItems[0]);
        }
    };
    function renderToggleExpandButton() {
        if (sections.length === 0)
            return null;
        return (react_1.default.createElement(react_bootstrap_1.Button, { variant: "outline-secondary", size: "sm", className: "d-flex align-items-center justify-content-center me-3", onClick: () => setGlobalExpandTrigger({
                action: globalExpandTrigger?.action === "COLLAPSE" ? "EXPAND" : "COLLAPSE",
                id: Date.now(),
            }), title: globalExpandTrigger?.action === "COLLAPSE" ? "Rozwiń wszystko" : "Zwiń wszystko" },
            react_1.default.createElement(react_fontawesome_1.FontAwesomeIcon, { icon: globalExpandTrigger?.action === "COLLAPSE" ? free_solid_svg_icons_1.faAngleDoubleDown : free_solid_svg_icons_1.faAngleDoubleUp })));
    }
    return (react_1.default.createElement(FilterableTableContext_1.FilterableTableProvider, { id: id, objects: objects, activeRowId: activeRowId, activeSectionId: activeSectionId, repository: repository, sections: sections, tableStructure: tableStructure, handleAddObject: handleAddObject, handleEditObject: handleEditObject, handleCopyObject: handleCopyObject, handleDeleteObject: handleDeleteObject, setObjects: setObjects, setSections: setSections, handleAddSection: handleAddSection, handleEditSection: handleEditSection, handleDeleteSection: handleDeleteSection, selectedObjectRoute: selectedObjectRoute, EditButtonComponent: EditButtonComponent, isDeletable: isDeletable, isCopyable: isCopyable, externalUpdate: externalUpdate, shouldRetrieveDataBeforeEdit: shouldRetrieveDataBeforeEdit, specialRetrieveActionRoute: specialRetrieveActionRoute, globalExpandTrigger: globalExpandTrigger },
        react_1.default.createElement(react_bootstrap_1.Container, null,
            react_1.default.createElement(react_bootstrap_1.Row, { className: "align-items-center" },
                react_1.default.createElement(react_bootstrap_1.Col, null, title && react_1.default.createElement(TableTitle, { title: title })),
                AddNewButtonComponents && (react_1.default.createElement(react_bootstrap_1.Col, { md: "auto" }, AddNewButtonComponents.map((ButtonComponent, index) => (react_1.default.createElement(react_1.default.Fragment, { key: index },
                    react_1.default.createElement(ButtonComponent, { modalProps: { onAddNew: handleAddObject, repository } }),
                    index < AddNewButtonComponents.length - 1 && " "))))),
                initialSections.length > 0 && react_1.default.createElement(react_bootstrap_1.Col, { md: "auto" }, renderToggleExpandButton())),
            FilterBodyComponent && (react_1.default.createElement(react_bootstrap_1.Row, { className: "bg-light p-3 rounded-3 mb-3" },
                react_1.default.createElement(FilterPanel_1.FilterPanel, { FilterBodyComponent: FilterBodyComponent, repository: repository }))),
            !isReady && (react_1.default.createElement(react_bootstrap_1.Row, null,
                react_1.default.createElement("progress", { className: "mt-1 mb-1", style: { height: "5px" } }))),
            react_1.default.createElement(react_bootstrap_1.Row, null,
                react_1.default.createElement(react_bootstrap_1.Col, null, initialSections?.length > 0 ? (react_1.default.createElement(Sections, { onClick: handleHeaderClick, resulsetTableProps: {
                        showTableHeader: showTableHeader,
                        onRowClick: handleRowClick,
                    } })) : (react_1.default.createElement(react_1.default.Fragment, null,
                    react_1.default.createElement("p", { className: "tekst-muted small" }, objects && `Znaleziono: ${objects.length} pozycji`),
                    react_1.default.createElement(ResultSetTable_1.ResultSetTable, { showTableHeader: showTableHeader, onRowClick: handleRowClick }))))))));
}
exports.default = FilterableTable;
function Sections({ resulsetTableProps, onClick, }) {
    const { sections } = (0, FilterableTableContext_1.useFilterableTableContext)();
    return (react_1.default.createElement(react_1.default.Fragment, null, sections.map((section, index) => {
        return (react_1.default.createElement(react_bootstrap_1.Card, { key: section.dataItem.id + section.type, bg: "light", border: "light" },
            react_1.default.createElement(Section_1.Section, { key: section.dataItem.id + section.type, sectionNode: section, resulsetTableProps: resulsetTableProps, onClick: onClick })));
    })));
}
function TableTitle({ title }) {
    return react_1.default.createElement("h1", null, title);
}
exports.TableTitle = TableTitle;
/** Funkcja do aktualizacji węzłów
 * jeśli edytujemy sekcję to zaczynamy od najwyższego poziomu drzewa i schodzimy do spodu szukając sekcji
 * jeśli edytujemy liść to zaczynamy od sekcji z najwyższego poziomu drzewa i schodzimy do spodu szukając liścia i go edytujemy
 * @param nodes tablica węzłów
 * @param sectionId id węzła sekcji do edycji - dla liscia jest to id sekcji głównej
 * @param newData nowe dane węzła lub liścia
 */
function editNode(nodes, sectionId, newData) {
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
            if (newSectionNode.editHandler)
                newSectionNode.editHandler(newSectionNode);
            return newSectionNode;
        } //jeśli edytujemy liść to zaczynamy od sekcji z najwyższego poziomu drzewa i schodzimy do spodu szukając liścia
        else if (nodeTypeToEdit === "LEAF") {
            //mamy sekcję nadrzędną dla szukanego liścia
            if (node.editHandler)
                node.editHandler(node);
            return {
                ...node,
                children: node.children && editNode(node.children, sectionId, newData),
                leaves: node.leaves && editLeafDataItem(node.leaves, newData),
            };
        }
        throw new Error(`Zły typ węzła}`);
    });
}
function nodeTypeToBeEdited(node, newData) {
    if (newData.id === node.dataItem.id)
        return "SECTION";
    return "LEAF";
}
/**Funkcja do aktualizacji liści */
function editLeafDataItem(leaves, newData) {
    return leaves.map((leaf) => leaf.id === newData.id
        ? {
            ...leaf,
            ...newData,
        }
        : leaf);
}
// Funkcja do dodawania nowych węzłów i liści
function addNode(nodes, parentId, newData) {
    return nodes.map((node) => {
        if (node.id === parentId) {
            // Jeśli rodzic ma już liście, dodajemy nowe dane jako liść
            if (node.leaves) {
                const newLeaf = { ...newData };
                return {
                    ...node,
                    leaves: [...node.leaves, newLeaf],
                };
            }
            const newNodeType = node.childrenNodesType || "";
            // W przeciwnym razie dodajemy nowe dane jako węzeł
            const newChild = {
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
        }
        else {
            // Nie znaleziono węzła, przeszukujemy dzieci
            return {
                ...node,
                children: addNode(node.children, parentId, newData),
            };
        }
    });
}
function deleteNode(nodes, nodeId) {
    return nodes.reduce((newNodes, node) => {
        if (node.id === nodeId) {
            // Jeśli id węzła pasuje do id, które chcemy usunąć, pomijamy ten węzeł
            return newNodes;
        }
        else {
            // Jeśli id nie pasuje, przeszukujemy dzieci
            const newNode = {
                ...node,
                children: deleteNode(node.children, nodeId),
            };
            return [...newNodes, newNode];
        }
    }, []);
}
