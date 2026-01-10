import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RepositoryDataItem } from "../../../../Typings/bussinesTypes";
import RepositoryReact from "../../../React/RepositoryReact";
import { GeneralDeleteModalButton, GeneralCopyModalButton } from "../../Modals/GeneralModalButtons";
import {
    SpecificDeleteModalButtonProps,
    SpecificEditModalButtonProps,
    SpecificCopyModalButtonProps,
} from "../../Modals/ModalsTypes";
import { GDDocFileIconLink, GDFolderIconLink, MenuExpandIconButton, CopyIconButton } from "../CommonComponents";
import { useFilterableTableContext } from "./FilterableTableContext";
import { RowStructure } from "./FilterableTableTypes";
import { Col, Row } from "react-bootstrap";
import { getColSize } from "./ResultSetTable";
import { buildDetailsPath } from "../../../React/Tools/ToolsRouting";

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
        handleCopyObject,
        handleDeleteObject,
        EditButtonComponent,
        isDeletable,
        isCopyable,
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
                if (!selectedObjectRoute) return;
                const target = buildDetailsPath(selectedObjectRoute, dataObject.id);
                if (target) navigate(target, { state: { repository } });
            }}
            className={`${getRowClass({ isActive, isStriped })}`}
        >
            {tableStructure.map((column, index) => {
                const key = String(column.objectAttributeToShow || index);
                // xs jest nadpisywane celowo: 11/12 dla isActive (rezerwacja dla RowActionMenu), 12/12 dla inactive
                return (
                    <Col key={key} {...getColSize(column)} xs={isActive ? 11 : 12}>
                        {tdBodyRender(column, dataObject)}
                    </Col>
                );
            })}
            {isActive && (
                <Col xs="1">
                    <div className="d-flex justify-content-center">
                        {" "}
                        <RowActionMenu
                            dataObject={dataObject}
                            handleEditObject={handleEditObject}
                            handleCopyObject={handleCopyObject}
                            EditButtonComponent={EditButtonComponent}
                            handleDeleteObject={handleDeleteObject}
                            isDeletable={isDeletable}
                            isCopyable={isCopyable}
                            shouldRetrieveDataBeforeEdit={shouldRetrieveDataBeforeEdit}
                            specialRetrieveActionRoute={specialRetrieveActionRoute}
                        />
                    </div>
                </Col>
            )}
        </Row>
    );
}

interface RowActionMenuProps<DataItemType extends RepositoryDataItem> {
    dataObject: DataItemType;
    sectionRepository?: RepositoryReact;
    handleEditObject?: (object: DataItemType) => void;
    handleCopyObject?: (object: DataItemType) => void;
    EditButtonComponent?: React.ComponentType<SpecificEditModalButtonProps<DataItemType>>;
    handleDeleteObject?: (objectId: number) => void;
    isDeletable: boolean;
    isCopyable?: boolean;
    layout?: "vertical" | "horizontal";
    shouldRetrieveDataBeforeEdit?: boolean;
    specialRetrieveActionRoute?: string;
    submenuItems?: React.ComponentType<SpecificEditModalButtonProps<DataItemType>>[];
}

export function RowActionMenu<DataItemType extends RepositoryDataItem>({
    dataObject,
    handleEditObject,
    handleCopyObject,
    EditButtonComponent,
    handleDeleteObject,
    isDeletable,
    isCopyable = false,
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
            )}{" "}
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
            )}{" "}
            {isCopyable && handleCopyObject && (
                <CopyModalButton
                    modalProps={{
                        onCopy: handleCopyObject,
                        initialData: dataObject,
                        repository: repository as RepositoryReact<DataItemType>,
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

export function CopyModalButton<DataItemType extends RepositoryDataItem>({
    modalProps: { onCopy, initialData, repository },
    buttonProps,
}: SpecificCopyModalButtonProps<DataItemType>) {
    const name = "name" in initialData ? initialData.name : undefined;
    const modalTitle = "Kopiowanie " + (name || "wybranego elementu");

    return (
        <GeneralCopyModalButton<DataItemType>
            modalProps={{
                onCopy,
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
        "p-3 mb-2 rounded shadow-sm mx-0",
        isStriped && !isActive && "bg-light rounded shadow-sm",
        isActive && "bg-primary bg-opacity-10 border-start border-4 border-primary",
        !isActive && "row-hover",
    ]
        .filter(Boolean)
        .join(" ");
}
