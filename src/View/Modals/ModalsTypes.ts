/**
 * parametry body modalu z formularzem
 * @param isEditing - czy modal jest w trybie edycji trzeba przekazać do do body bo część pól jest różna w trybie edycji i dodawania
 * @param initialData - dane inicjalne do wyświetlenia w formularzu
 * @param additionalProps - dodatkowe właściwości przekazywane do body - np. inne komponenty - patrz OurContractAddNewModalButton
 */

import RepositoryReact from "../../React/RepositoryReact";
import * as yup from "yup";
import { ButtonProps } from "react-bootstrap";
import { ButtonVariant } from "react-bootstrap/esm/types";
import { RepositoryDataItem } from "../../../Typings/bussinesTypes";

export type ModalBodyProps<DataItemType extends RepositoryDataItem = RepositoryDataItem> = {
    isEditing: boolean;
    initialData?: DataItemType;
    contextData?: unknown;
    additionalProps?: any;
}

type GeneralModalButtonModalProps<DataItemType extends RepositoryDataItem = RepositoryDataItem> = {
    ModalBodyComponent: React.ComponentType<ModalBodyProps<DataItemType>>;
    additionalModalBodyProps?: any;
    modalTitle: string;
    repository: RepositoryReact<DataItemType>;
    makeValidationSchema?: (isEditing: boolean) => yup.ObjectSchema<any>;
    contextData?: unknown;
};

export type GeneralModalButtonButtonProps = {
    buttonCaption?: string;
    buttonVariant?: ButtonVariant;
    buttonSize?: ButtonProps["size"];
    buttonIsActive?: boolean;
    buttonIsDisabled?: boolean;
    layout?: 'vertical' | 'horizontal';
};

export type GeneralModalButtonProps<DataItemType extends RepositoryDataItem = RepositoryDataItem> = {
    modalProps: GeneralModalButtonModalProps<DataItemType>;
    buttonProps: GeneralModalButtonButtonProps;
};

type GeneralAddNewModalButtonModalProps<DataItemType extends RepositoryDataItem = RepositoryDataItem> = GeneralModalButtonModalProps<DataItemType> & {
    onAddNew: (object: DataItemType) => void;
    initialData?: DataItemType;
};

type GeneralAddNewModalButtonButtonProps = GeneralModalButtonButtonProps & {
    buttonCaption: string;
};

export type GeneralAddNewModalButtonProps<DataItemType extends RepositoryDataItem = RepositoryDataItem> = {
    modalProps: GeneralAddNewModalButtonModalProps<DataItemType>;
    buttonProps: GeneralAddNewModalButtonButtonProps;
};

type GeneralEditModalButtonModalProps<DataItemType extends RepositoryDataItem = RepositoryDataItem> = GeneralModalButtonModalProps<DataItemType> & {
    onEdit: (object: DataItemType) => void;
    specialActionRoute?: string;
    initialData: DataItemType;
};

export type GeneralEditModalButtonProps<DataItemType extends RepositoryDataItem = RepositoryDataItem> = {
    modalProps: GeneralEditModalButtonModalProps<DataItemType>;
    buttonProps?: GeneralModalButtonButtonProps;
};

type GeneralDeleteModalButtonModalProps<DataItemType extends RepositoryDataItem = RepositoryDataItem> = Omit<
    GeneralModalButtonModalProps<DataItemType>,
    "ModalBodyComponent"
> & {
    onDelete: (objectId: number) => void;
    initialData: DataItemType;
};

type GeneralDeleteModalButtonButtonProps = GeneralModalButtonButtonProps & {
    buttonCaption?: string;
};

export type GeneralDeleteModalButtonProps<DataItemType extends RepositoryDataItem = RepositoryDataItem> = {
    modalProps: GeneralDeleteModalButtonModalProps<DataItemType>;
    buttonProps?: GeneralDeleteModalButtonButtonProps;
};

type SpecificAddNewModalButtonModalProps<DataItemType extends RepositoryDataItem = RepositoryDataItem> = Omit<
    GeneralAddNewModalButtonModalProps<DataItemType>,
    "ModalBodyComponent" | "modalTitle" | "repository"
> & {
    repository?: RepositoryReact<DataItemType>;
};

type SpecificAddNewModalButtonButtonProps = GeneralAddNewModalButtonButtonProps;

export type SpecificAddNewModalButtonProps<DataItemType extends RepositoryDataItem = RepositoryDataItem> = {
    modalProps: SpecificAddNewModalButtonModalProps<DataItemType>;
    buttonProps?: SpecificAddNewModalButtonButtonProps;
};

type SpecificEditModalButtonModalProps<DataItemType extends RepositoryDataItem = RepositoryDataItem> = Omit<
    GeneralEditModalButtonModalProps<DataItemType>,
    "ModalBodyComponent" | "modalTitle" | "repository"
> & {
    repository?: RepositoryReact<DataItemType>;
    onEdit: (object: DataItemType) => void;
    initialData: DataItemType;
};

export type SpecificEditModalButtonProps<DataItemType extends RepositoryDataItem = RepositoryDataItem> = {
    modalProps: SpecificEditModalButtonModalProps<DataItemType>;
    buttonProps?: GeneralModalButtonButtonProps;
};

type SpecificDeleteModalButtonModalProps<DataItemType extends RepositoryDataItem = RepositoryDataItem> = Omit<
    GeneralDeleteModalButtonModalProps<DataItemType>,
    "ModalBodyComponent" | "modalTitle" | "repository"
> & {
    onDelete: (objectId: number) => void;
    initialData: DataItemType;
    repository: RepositoryReact<DataItemType>;
};

type SpecificDeleteModalButtonButtonProps = GeneralDeleteModalButtonButtonProps;

export type SpecificDeleteModalButtonProps<DataItemType extends RepositoryDataItem = RepositoryDataItem> = {
    modalProps: SpecificDeleteModalButtonModalProps<DataItemType>;
    buttonProps?: SpecificDeleteModalButtonButtonProps;
};

export type additionalFieldsKeysValue = {
    name: string;
    value: string;
};