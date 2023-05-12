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
    additionalProps?: any;
}

type GeneralModalButtonModalProps = {
    ModalBodyComponent: React.ComponentType<ModalBodyProps>;
    additionalModalBodyProps?: any;
    modalTitle: string;
    repository: RepositoryReact;
    validationSchema?: yup.ObjectSchema<any>;
};

type GeneralModalButtonButtonProps = {
    buttonVariant?: ButtonVariant;
    buttonSize?: ButtonProps["size"];
    buttonIsActive?: boolean;
    buttonIsDisabled?: boolean;
};

export type GeneralModalButtonProps = {
    modalProps: GeneralModalButtonModalProps;
    buttonProps: GeneralModalButtonButtonProps;
};

type GeneralAddNewModalButtonModalProps<DataItemType extends RepositoryDataItem = RepositoryDataItem> = GeneralModalButtonModalProps & {
    onAddNew: (object: DataItemType) => void;
};

type GeneralAddNewModalButtonButtonProps = GeneralModalButtonButtonProps & {
    buttonCaption: string;
};

export type GeneralAddNewModalButtonProps = {
    modalProps: GeneralAddNewModalButtonModalProps;
    buttonProps: GeneralAddNewModalButtonButtonProps;
};

type GeneralEditModalButtonModalProps<DataItemType extends RepositoryDataItem = RepositoryDataItem> = GeneralModalButtonModalProps & {
    onEdit: (object: DataItemType) => void;
    initialData: DataItemType;
};

type GeneralEditModalButtonButtonProps = GeneralModalButtonButtonProps & {
    buttonCaption?: string;
};

export type GeneralEditModalButtonProps = {
    modalProps: GeneralEditModalButtonModalProps;
    buttonProps?: GeneralEditModalButtonButtonProps;
};

type GeneralDeleteModalButtonModalProps = Omit<
    GeneralModalButtonModalProps,
    "ModalBodyComponent"
> & {
    onDelete: (objectId: number) => void;
    initialData: RepositoryDataItem;
};

type GeneralDeleteModalButtonButtonProps = GeneralModalButtonButtonProps & {
    buttonCaption?: string;
};

export type GeneralDeleteModalButtonProps = {
    modalProps: GeneralDeleteModalButtonModalProps;
    //buttonProps?: GeneralDeleteModalButtonButtonProps;
};

type SpecificAddNewModalButtonModalProps = Omit<
    GeneralAddNewModalButtonModalProps,
    "ModalBodyComponent" | "modalTitle" | "repository"
> & {
    onAddNew: (object: RepositoryDataItem) => void;
};

type SpecificAddNewModalButtonButtonProps = GeneralAddNewModalButtonButtonProps;

export type SpecificAddNewModalButtonProps = {
    modalProps: SpecificAddNewModalButtonModalProps;
    buttonProps?: SpecificAddNewModalButtonButtonProps;
};

type SpecificEditModalButtonModalProps = Omit<
    GeneralEditModalButtonModalProps,
    "ModalBodyComponent" | "modalTitle" | "repository"
> & {
    onEdit: (object: RepositoryDataItem) => void;
    initialData: RepositoryDataItem;
};

type SpecificEditModalButtonButtonProps = GeneralEditModalButtonButtonProps;

export type SpecificEditModalButtonProps = {
    modalProps: SpecificEditModalButtonModalProps;
    buttonProps?: SpecificEditModalButtonButtonProps;
};

type SpecificDeleteModalButtonModalProps = Omit<
    GeneralDeleteModalButtonModalProps,
    "ModalBodyComponent" | "modalTitle" | "repository"
> & {
    onDelete: (objectId: number) => void;
    initialData: RepositoryDataItem;
};

type SpecificDeleteModalButtonButtonProps = GeneralDeleteModalButtonButtonProps;

export type SpecificDeleteModalButtonProps = {
    modalProps: SpecificDeleteModalButtonModalProps;
    buttonProps?: SpecificDeleteModalButtonButtonProps;
};

export type additionalFieldsKeysValue = {
    name: string;
    value: string;
};