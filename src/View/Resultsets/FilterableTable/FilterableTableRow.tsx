import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RepositoryDataItem } from "../../../../Typings/bussinesTypes";
import RepositoryReact from "../../../React/RepositoryReact";
import { GeneralDeleteModalButton } from "../../Modals/GeneralModalButtons";
import { SpecificDeleteModalButtonProps, SpecificEditModalButtonProps } from "../../Modals/ModalsTypes";
import { GDDocFileIconLink, GDFolderIconLink, MenuExpandIconButton } from "../CommonComponents";
import { useFilterableTableContext } from "./FilterableTableContext";
import { RowStructure } from "./FilterableTableTypes";
import { Col, Row } from "react-bootstrap";
import { getColSize } from "./ResultSetTable";

export type FilterTableRowProps<DataItemType extends RepositoryDataItem> = {
    dataObject: DataItemType;
    isActive: boolean;
    isStriped: boolean;
    onDoubleClick?: (object: DataItemType) => void;
    onRowClick: (id: number) => void;
};

export function FilterableTableRow<DataItemType extends RepositoryDataItem>({
    dataObject,
    isActive,
    isStriped,
    onRowClick,
}: FilterTableRowProps<DataItemType>): JSX.Element {
    const navigate = useNavigate();
    const { selectedObjectRoute, tableStructure } = useFilterableTableContext<DataItemType>();
    const {
        handleEditObject,
        handleDeleteObject,
        EditButtonComponent,
        isDeletable,
        repository,
        shouldRetrieveDataBeforeEdit,
        specialRetrieveActionRoute,
    } = useFilterableTableContext<DataItemType>();

    function tdBodyRender(columnStructure: RowStructure<DataItemType>, dataObject: DataItemType) {
        if (columnStructure.objectAttributeToShow !== undefined) {
            const key = columnStructure.objectAttributeToShow;
            return String(dataObject[key] ?? "");
        }
        if (columnStructure.renderTdBody !== undefined) return columnStructure.renderTdBody(dataObject, isActive);
        return "";
    }

    return (
        <Row
            onClick={(e) => onRowClick(dataObject.id)}
            onDoubleClick={() => {
                if (selectedObjectRoute) navigate(selectedObjectRoute + dataObject.id, { state: { repository } });
            }}
            className={`${getRowClass({ isActive, isStriped })} p-3 mb-2`}
        >
            {tableStructure.map((column, index) => {
                const key = String(column.objectAttributeToShow || index);
                return (
                    <Col key={key} {...getColSize(column)} xs={isActive ? 11 : 12}>
                        {tdBodyRender(column, dataObject)}
                    </Col>
                );
            })}
            {isActive && (
                <Col align="center" xs="1" className="d-flex justify-content-center">
                    <RowActionMenu
                        dataObject={dataObject}
                        handleEditObject={handleEditObject}
                        EditButtonComponent={EditButtonComponent}
                        handleDeleteObject={handleDeleteObject}
                        isDeletable={isDeletable}
                        shouldRetrieveDataBeforeEdit={shouldRetrieveDataBeforeEdit}
                        specialRetrieveActionRoute={specialRetrieveActionRoute}
                    />
                </Col>
            )}
        </Row>
    );
}

interface RowActionMenuProps<DataItemType extends RepositoryDataItem> {
    dataObject: DataItemType;
    sectionRepository?: RepositoryReact;
    handleEditObject?: (object: DataItemType) => void;
    EditButtonComponent?: React.ComponentType<SpecificEditModalButtonProps<DataItemType>>;
    handleDeleteObject?: (objectId: number) => void;
    isDeletable: boolean;
    layout?: "vertical" | "horizontal";
    shouldRetrieveDataBeforeEdit?: boolean;
    specialRetrieveActionRoute?: string;
    submenuItems?: React.ComponentType<SpecificEditModalButtonProps<DataItemType>>[];
}

export function RowActionMenu<DataItemType extends RepositoryDataItem>({
    dataObject,
    handleEditObject,
    EditButtonComponent,
    handleDeleteObject,
    isDeletable,
    layout = "vertical",
    sectionRepository,
    shouldRetrieveDataBeforeEdit = false,
    specialRetrieveActionRoute,
    submenuItems = [],
}: RowActionMenuProps<DataItemType>) {
    const repository = sectionRepository || useFilterableTableContext<DataItemType>().repository;
    const [isMenuExpanded, setIsMenuExpanded] = useState(false);

    function toggleMenu() {
        setIsMenuExpanded((prevState) => !prevState);
    }

    return (
        <div
            className={`d-flex ${
                layout === "vertical" ? "flex-column align-items-start" : "flex-row align-items-center"
            }`}
        >
            {dataObject._gdFolderUrl && <GDFolderIconLink layout={layout} folderUrl={dataObject._gdFolderUrl} />}
            {dataObject._documentOpenUrl && (
                <GDDocFileIconLink layout={layout} folderUrl={dataObject._documentOpenUrl} />
            )}
            {EditButtonComponent && handleEditObject && (
                <EditButtonComponent
                    modalProps={{
                        onEdit: handleEditObject,
                        initialData: dataObject,
                        shouldRetrieveDataBeforeEdit,
                        specialRetrieveActionRoute,
                        repository: repository as RepositoryReact<any>,
                    }}
                    buttonProps={{ layout }}
                />
            )}
            {isDeletable && handleDeleteObject && (
                <>
                    <MenuExpandIconButton layout={layout} onClick={toggleMenu} />
                    {isMenuExpanded && (
                        <>
                            <DeleteModalButton
                                modalProps={{ onDelete: handleDeleteObject, initialData: dataObject, repository }}
                                buttonProps={{ layout }}
                            />
                            {submenuItems.map(
                                (SubmenuItem, index) =>
                                    handleEditObject && (
                                        <SubmenuItem
                                            key={index}
                                            modalProps={{
                                                onEdit: handleEditObject,
                                                initialData: dataObject,
                                                repository: repository as RepositoryReact<DataItemType>,
                                            }}
                                            buttonProps={{ layout, buttonCaption: "Edytuj" }}
                                        />
                                    )
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
}

export function DeleteModalButton<DataItemType extends RepositoryDataItem>({
    modalProps: { onDelete, initialData, repository },
    buttonProps,
}: SpecificDeleteModalButtonProps<DataItemType>) {
    const name = "name" in initialData ? initialData.name : undefined;
    const modalTitle = "Usuwanie " + (name || "wybranego elementu");

    return (
        <GeneralDeleteModalButton<DataItemType>
            modalProps={{
                onDelete,
                modalTitle,
                repository,
                initialData,
            }}
            buttonProps={buttonProps}
        />
    );
}

/**
 * Returns a string with the class names for the row based on the active state and striped row state.
 */
export function getRowClass({ isActive, isStriped }: { isActive: boolean; isStriped: boolean }) {
    return [
        "p-3 mb-2 rounded shadow-sm",
        isStriped && !isActive && "bg-light rounded shadow-sm",
        isActive && "bg-primary bg-opacity-10 border-start border-4 border-primary",
        !isActive && "row-hover",
    ]
        .filter(Boolean)
        .join(" ");
}
