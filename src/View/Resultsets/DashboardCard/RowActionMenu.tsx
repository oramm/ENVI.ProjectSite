import React, { useState } from "react";
import { RepositoryDataItem } from "../../../../Typings/bussinesTypes";
import RepositoryReact from "../../../React/RepositoryReact";
import { SpecificEditModalButtonProps } from "../../Modals/ModalsTypes";
import { GDDocFileIconLink, GDFolderIconLink, MenuExpandIconButton } from "../CommonComponents";
import { DeleteModalButton } from "../FilterableTable/FilterableTableRow";
import { useDashboardCardContext } from "./DashboardCardContext";

interface RowActionMenuProps<DataItemType extends RepositoryDataItem> {
    dataObject: DataItemType;
    handleEditObject?: (object: DataItemType) => void;
    EditButtonComponent?: React.ComponentType<SpecificEditModalButtonProps<DataItemType>>;
    handleDeleteObject?: (objectId: number) => void;
    isDeletable: boolean;
    layout?: "vertical" | "horizontal";
    shouldRetrieveDataBeforeEdit?: boolean;
    specialRetrieveActionRoute?: string;
    submenuItems?: React.ComponentType<SpecificEditModalButtonProps<DataItemType>>[];
}

export default function RowActionMenu<DataItemType extends RepositoryDataItem>({
    dataObject,
    handleEditObject,
    EditButtonComponent,
    handleDeleteObject,
    isDeletable,
    layout = "vertical",
    shouldRetrieveDataBeforeEdit = false,
    specialRetrieveActionRoute,
    submenuItems = [],
}: RowActionMenuProps<DataItemType>) {
    const repository = useDashboardCardContext<DataItemType>().repository;
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
                        repository,
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
