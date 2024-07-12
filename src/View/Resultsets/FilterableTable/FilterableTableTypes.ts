import { FieldValues } from "react-hook-form";
import { RepositoryDataItem } from "../../../../Typings/bussinesTypes";
import RepositoryReact from "../../../React/RepositoryReact";
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from "../../Modals/ModalsTypes";
import { SectionNode } from "./Section";

export type FilterableTableProps<DataItemType extends RepositoryDataItem = RepositoryDataItem> = {
    id: string;
    title: string;
    showTableHeader?: boolean;
    initialSections?: SectionNode<DataItemType>[];
    tableStructure: RowStructure<DataItemType>[];
    repository: RepositoryReact<DataItemType>;
    AddNewButtonComponents?: React.ComponentType<SpecificAddNewModalButtonProps<DataItemType>>[];
    EditButtonComponent?: React.ComponentType<SpecificEditModalButtonProps<DataItemType>>;
    isDeletable?: boolean;
    FilterBodyComponent?: React.ComponentType<FilterBodyProps>;
    selectedObjectRoute?: string;
    initialObjects?: DataItemType[];
    onRowClick?: (object: DataItemType) => void;
    externalUpdate?: number;
    shouldRetrieveDataBeforeEdit?: boolean;
};

export type FilterableTableSnapShot<DataItemType extends RepositoryDataItem = RepositoryDataItem> = {
    criteria: FieldValues;
    storedObjects: DataItemType[];
};

export type FilterPanelProps = {
    FilterBodyComponent: React.ComponentType<FilterBodyProps>;
    repository: RepositoryReact;
};

export type FilterBodyProps = {};

export type RowStructure<DataItemType extends RepositoryDataItem = RepositoryDataItem> = {
    header?: string;
    objectAttributeToShow?: keyof DataItemType;
    renderTdBody?: (dataItem: DataItemType, isActive?: boolean) => JSX.Element;
    renderThBody?: () => JSX.Element;
    submenuItems?: React.ComponentType<SpecificEditModalButtonProps<DataItemType>>[];
};
