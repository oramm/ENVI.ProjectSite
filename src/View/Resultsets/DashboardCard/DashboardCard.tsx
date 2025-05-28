import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Card, ListGroup } from "react-bootstrap";
import { DashboardCardProvider } from "./DashboardCardContext";
import { RepositoryDataItem } from "../../../../Typings/bussinesTypes";
import RepositoryReact from "../../../React/RepositoryReact";
import { SpecificEditModalButtonProps } from "../../Modals/ModalsTypes";
import ToolsDate from "../../../React/Tools/ToolsDate";
import RowActionMenu from "./RowActionMenu";
import { SpinnerBootstrap } from "../CommonComponents";

export type DashboardCardProps<DataItemType extends RepositoryDataItem = RepositoryDataItem> = {
    cardData: DashboardCardData<DataItemType>;
    dataLoaded: boolean;
    showTableHeader?: boolean;
    SectionSubtittle?: React.ComponentType<{ sectionData: DashboardCardSectionData }>;
    ListItem: React.ComponentType<{ object: DataItemType; onClick?: () => void }>;
    repository: RepositoryReact<DataItemType>;
    EditButtonComponent?: React.ComponentType<SpecificEditModalButtonProps<DataItemType>>;
    isDeletable?: boolean;
    detailsRoute?: string;
    getDetailsId?: (object: DataItemType) => number | string;
    initialObjects: DataItemType[];
    onRowClick?: (object: DataItemType) => void;
    externalUpdate?: number;
    shouldRetrieveDataBeforeEdit?: boolean;
    specialRetrieveActionRoute?: string;
    className?: string;
    headerRoute?: string;
};

export type DashboardCardData<DataItemType> = {
    header: {
        title: string;
        daysBeforeToday?: number;
        daysAfterToday?: number;
    };
    sections?: DashboardCardSectionData[];
    sectionAttributeName: keyof DataItemType;
};

export type DashboardCardSectionData = {
    icon: string;
    key: string;
    label: string;
};

export default function DashboardCard<DataItemType extends RepositoryDataItem>({
    cardData,
    dataLoaded,
    repository,
    SectionSubtittle,
    ListItem,
    EditButtonComponent,
    isDeletable = true,
    detailsRoute = "",
    getDetailsId,
    initialObjects,
    onRowClick,
    shouldRetrieveDataBeforeEdit = false,
    specialRetrieveActionRoute,
    className,
    headerRoute,
}: DashboardCardProps<DataItemType>) {
    const [expandedStatus, setExpandedStatus] = useState<Record<string, boolean>>({});
    const [activeRowId, setActiveRowId] = useState(0);
    const [objects, setObjects] = useState(initialObjects);

    const navigate = useNavigate();

    useEffect(() => {
        setObjects(initialObjects);
    }, [initialObjects]);

    const INITIAL_VISIBLE = 0;
    const dateFrom = ToolsDate.addDays(new Date(), -(cardData.header.daysBeforeToday ?? 0))
        .toISOString()
        .slice(0, 10);
    const dateTo = ToolsDate.addDays(new Date(), cardData.header.daysAfterToday ?? 0)
        .toISOString()
        .slice(0, 10);

    function handleEditObject(object: DataItemType) {
        setObjects(objects.map((o) => (o.id === object.id ? object : o)));
    }

    function handleDeleteObject(objectId: number) {
        setObjects(objects.filter((o) => o.id !== objectId));
    }

    function handleToggle(sectionKey: string) {
        setExpandedStatus((prev) => ({
            ...prev,
            [sectionKey]: !prev[sectionKey],
        }));
    }

    function handleRowClick(id: number) {
        setActiveRowId(id);
        repository.addToCurrentItems(id);
        if (onRowClick) {
            onRowClick(repository.currentItems[0]);
        }
    }

    function handleRowDoubleClick(object: DataItemType) {
        const detailsId = getDetailsId ? getDetailsId(object) : object.id;
        if (detailsRoute) navigate(`${detailsRoute}${detailsId}`, { state: { repository } });
    }

    function handleHeaderClick() {
        if (headerRoute) navigate(headerRoute, { state: { repository } });
    }

    function renderCardTitle() {
        return (
            <div className="d-flex justify-content-between align-items-center">
                <Card.Title className="mb-0" onClick={() => handleHeaderClick()} style={{ cursor: "pointer" }}>
                    {cardData.header.title}
                </Card.Title>
                <span style={{ fontSize: "0.85em" }} className="text-secondary">
                    {ToolsDate.dateToDdMmm(dateFrom)} - {ToolsDate.dateToDdMmm(dateTo)}
                </span>
            </div>
        );
    }

    function renderSection(params: {
        objectsInSection: DataItemType[];
        sectionData: DashboardCardSectionData;
        expanded: boolean;
    }) {
        const { objectsInSection, expanded, sectionData } = params;
        const visibleData = expanded ? objectsInSection : objectsInSection.slice(0, INITIAL_VISIBLE);
        return (
            <ListGroup.Item key={sectionData.key} className="p-0 border-0">
                <div
                    className={`list-group-item-action${expanded ? " bg-primary bg-opacity-10" : ""}`}
                    style={{ cursor: "pointer", display: "flex", flexDirection: "column" }}
                    onClick={() => handleToggle(sectionData.key)}
                >
                    {/* Pierwszy wiersz - główny */}
                    <div className="d-flex align-items-center justify-content-between w-100">
                        <span className="d-flex align-items-center flex-grow-1">
                            <span style={{ fontSize: 14, width: 14 }}>{sectionData.icon}</span>
                            <span className="ms-2 fw-semibold">{sectionData.label || sectionData.key}</span>
                        </span>
                        <span className="d-flex align-items-center">
                            <Badge bg="light" text="dark">
                                {objectsInSection.length}
                            </Badge>
                            <span className="text-secondary small ms-2" style={{ fontSize: "0.9em" }}>
                                {expanded ? "▼" : "▸"}
                            </span>
                        </span>
                    </div>
                    {/* Drugi wiersz - subtytuł */}
                    {SectionSubtittle && (
                        <div className="ms-4 pt-1 small text-secondary">
                            <SectionSubtittle sectionData={sectionData} />
                        </div>
                    )}
                </div>

                <ul className="ps-4 mt-2 mb-2" style={{ listStyleType: "none" }}>
                    {visibleData.map((object) => renderListItem(object))}
                </ul>
            </ListGroup.Item>
        );
    }

    function renderListItem(object: DataItemType) {
        const isActive = object.id === activeRowId;

        return (
            <li
                key={object.id}
                onClick={() => handleRowClick(object.id)}
                onDoubleClick={() => handleRowDoubleClick(object)}
                className={`mb-2 d-flex align-items-center${isActive ? " bg-primary bg-opacity-10" : ""}`}
                style={{ justifyContent: "space-between" }}
            >
                <ListItem object={object} />
                {isActive && (
                    <span className="ms-2 d-flex justify-content-end flex-grow-1" style={{ minWidth: 0 }}>
                        <RowActionMenu
                            dataObject={object}
                            handleEditObject={handleEditObject}
                            EditButtonComponent={EditButtonComponent}
                            handleDeleteObject={handleDeleteObject}
                            isDeletable={isDeletable}
                            layout="horizontal"
                        />
                    </span>
                )}
            </li>
        );
    }

    if (!dataLoaded) {
        return (
            <Card className={className}>
                <Card.Body>
                    <Card.Title>{cardData.header.title}</Card.Title>
                    <SpinnerBootstrap />
                </Card.Body>
            </Card>
        );
    }

    if (!cardData.sections?.length) {
        return (
            <Card className={className}>
                <Card.Body>
                    <Card.Title>{cardData.header.title}</Card.Title>
                    <div className="text-secondary">Brak danych do wyświetlenia.</div>
                </Card.Body>
            </Card>
        );
    }

    return (
        <DashboardCardProvider<DataItemType>
            objects={objects}
            cardData={cardData}
            activeRowId={activeRowId}
            repository={repository}
            handleEditObject={handleEditObject}
            handleDeleteObject={handleDeleteObject}
            setObjects={setObjects}
            selectedObjectRoute={detailsRoute}
            EditButtonComponent={EditButtonComponent}
            isDeletable={isDeletable}
            shouldRetrieveDataBeforeEdit={shouldRetrieveDataBeforeEdit}
            specialRetrieveActionRoute={specialRetrieveActionRoute}
        >
            <Card className={className}>
                <Card.Body>
                    {renderCardTitle()}
                    <ListGroup variant="flush" className="mt-3">
                        {cardData.sections!.map((sectionData) => {
                            const objectsInSection = objects.filter(
                                (object) => sectionData.key === object[cardData.sectionAttributeName]
                            );
                            if (objectsInSection.length === 0) return null;
                            return renderSection({
                                objectsInSection,
                                sectionData,
                                expanded: expandedStatus[sectionData.key] || false,
                            });
                        })}
                    </ListGroup>
                </Card.Body>
            </Card>
        </DashboardCardProvider>
    );
}
