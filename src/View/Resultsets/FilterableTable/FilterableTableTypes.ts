import { FieldValues } from "react-hook-form";
import { RepositoryDataItem } from "../../../../Typings/bussinesTypes";
import RepositoryReact from "../../../React/RepositoryReact";
import { SpecificAddNewModalButtonProps, SpecificEditModalButtonProps } from "../../Modals/ModalsTypes";
import { SectionNode } from "./Section";
import * as yup from "yup";

export type SnapshotMode = "criteria+objects" | "criteria-only";

/** props komponentu akcji wiersza renderowanego w RowActionMenu (obok ikony edycji) */
export type RowActionMenuItemProps<DataItemType extends RepositoryDataItem = RepositoryDataItem> = {
    dataObject: DataItemType;
    layout: "vertical" | "horizontal";
};

export type SectionsFilterHandlers<DataItemType extends RepositoryDataItem = RepositoryDataItem> = {
    onSubmitSections: (criteria: FieldValues) => Promise<SectionNode<DataItemType>[]>;
    onResetSections: () => SectionNode<DataItemType>[];
};

export type FilterableTableProps<DataItemType extends RepositoryDataItem = RepositoryDataItem> = {
    id: string;
    title?: string;
    showTableHeader?: boolean;
    initialSections?: SectionNode<DataItemType>[];
    tableStructure: RowStructure<DataItemType>[];
    repository: RepositoryReact<DataItemType>;
    AddNewButtonComponents?: React.ComponentType<SpecificAddNewModalButtonProps<DataItemType>>[];
    EditButtonComponent?: React.ComponentType<SpecificEditModalButtonProps<DataItemType>>;
    /** dodatkowe akcje wiersza (ikony) renderowane w RowActionMenu — np. "Odpowiedz" na liście pism */
    RowActionMenuComponents?: React.ComponentType<RowActionMenuItemProps<DataItemType>>[];
    isDeletable?: boolean | ((item: DataItemType) => boolean);
    isCopyable?: boolean;
    FilterBodyComponent?: React.ComponentType<FilterBodyProps>;
    selectedObjectRoute?: string;
    initialObjects?: DataItemType[];
    onRowClick?: (object: DataItemType) => void;
    externalUpdate?: number;
    shouldRetrieveDataBeforeEdit?: boolean;
    specialRetrieveActionRoute?: string;
    fixedCriteria?: FieldValues;
    /** Wartości przywracane przez "Wyczyść" zamiast pustych — np. domyślny status "aktywny". */
    resetCriteria?: FieldValues;
    autoSearchOnReset?: boolean;

    snapshotMode?: SnapshotMode;
    sectionsFilterHandlers?: SectionsFilterHandlers<DataItemType>;
};

export type FilterableTableSnapShot<DataItemType extends RepositoryDataItem = RepositoryDataItem> = {
    criteria: FieldValues;
    storedObjects?: DataItemType[];
    /** Ostatnio kliknięty wiersz - po powrocie ze szczegółów widać, gdzie się było. */
    activeRowId?: number;
};

export type FilterPanelProps = {
    FilterBodyComponent: React.ComponentType<FilterBodyProps>;
    repository: RepositoryReact;
    validationSchema?: yup.ObjectSchema<any> | undefined;
    fixedCriteria?: FieldValues;
    resetCriteria?: FieldValues;
    autoSearchOnReset?: boolean;
};

export type FilterBodyProps = {};

export type RowStructure<DataItemType extends RepositoryDataItem = RepositoryDataItem> = {
    header?: string;
    objectAttributeToShow?: keyof DataItemType;
    colMd?: number; // Added for column width in medium screens
    colSm?: number; // Added for column width in small screens
    colLg?: number; // Added for column width in large screens
    renderTdBody?: (dataItem: DataItemType, isActive?: boolean) => JSX.Element;
    renderThBody?: () => JSX.Element;
    submenuItems?: React.ComponentType<SpecificEditModalButtonProps<DataItemType>>[];
};
