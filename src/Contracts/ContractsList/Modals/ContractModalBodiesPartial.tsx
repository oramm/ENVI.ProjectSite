import React, { useEffect } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { ContractStatusSelectFormElement, ErrorMessage } from '../../../View/Modals/CommonFormComponents';
import { useFormContext } from '../../../View/Modals/FormContext';
import { ModalBodyProps } from '../../../View/Modals/ModalsTypes';
import ToolsForms from '../../../React/ToolsForms';
import ToolsDate from '../../../React/ToolsDate';

export function ContractModalBodyStatus({ initialData }: ModalBodyProps) {
    const { setValue, register, formState: { errors }, } = useFormContext();

    useEffect(() => {
        setValue('status', initialData?.status || '', { shouldValidate: true });
    }, [initialData, setValue]);

    return (
        <ContractStatusSelectFormElement />
    );
}

export function ContractModalBodyName({ initialData }: ModalBodyProps) {
    const { setValue, register, formState: { errors }, } = useFormContext();

    useEffect(() => {
        setValue('name', initialData?.name || '', { shouldValidate: true });

    }, [initialData, setValue]);

    return (
        <Form.Group controlId="name">
            <Form.Label>Nazwa kontraktu</Form.Label>
            <Form.Control
                as="textarea"
                rows={2}
                placeholder="Podaj nazwę"
                isInvalid={!!errors?.name}
                isValid={!errors?.name}
                {...register('name')}
            />
            <ErrorMessage errors={errors} name='name' />
        </Form.Group>
    );
}

export function ContractModalBodyDates({ initialData, isEditing, additionalProps = {} }:
    ModalBodyProps & {
        additionalProps?: {
            watchAllFieldsExternal: any,
            startDateSugestion?: string,
            endDateSugestion?: string,
            guaranteeEndDateSugestion?: string,
        }
    }) {
    const { setValue, register, formState: { errors }, trigger, watch } = useFormContext();
    let { watchAllFieldsExternal, startDateSugestion, endDateSugestion, guaranteeEndDateSugestion } = additionalProps;
    //jeśli nie ma watch w formularzu zewnętrznym to będzie tutaj
    const watchAllFields = watchAllFieldsExternal || watch();

    if (isEditing) {
        startDateSugestion = initialData?.startDate;
        endDateSugestion = initialData?.endDate;
        guaranteeEndDateSugestion = initialData?.guaranteeEndDate;
    } else {
        startDateSugestion = new Date().toISOString().slice(0, 10);
        endDateSugestion = ToolsDate.addDays(startDateSugestion, 365).toISOString().slice(0, 10);
        guaranteeEndDateSugestion = ToolsDate.addDays(endDateSugestion, 365 * 2).toISOString().slice(0, 10);
    }

    useEffect(() => {
        setValue('startDate', startDateSugestion, { shouldValidate: true });
        setValue('endDate', endDateSugestion, { shouldValidate: true });
        setValue('guaranteeEndDate', guaranteeEndDateSugestion, { shouldValidate: true });

    }, [initialData, setValue]);

    return (
        <Row >
            <Form.Group as={Col} controlId="startDate">
                <Form.Label>Początek</Form.Label>
                <Form.Control
                    type="date"
                    isValid={!errors.startDate}
                    isInvalid={!!errors.startDate}
                    {...register('startDate')}
                    className={!isEditing ? ToolsForms.getSuggestedClass('startDate', watchAllFields, startDateSugestion) : ''}
                    onChange={(e) => {
                        register("startDate").onChange(e); // wywołaj standardowe zachowanie
                        trigger("endDate");
                    }}
                />
                <ErrorMessage errors={errors} name='startDate' />
            </Form.Group>
            <Form.Group as={Col} controlId="endDate">
                <Form.Label>Zakończenie</Form.Label>
                <Form.Control
                    type="date"
                    isValid={!errors.endDate}
                    isInvalid={!!errors.endDate}
                    {...register('endDate')}
                    className={!isEditing ? ToolsForms.getSuggestedClass('endDate', watchAllFields, endDateSugestion) : ''}
                    onChange={(e) => {
                        register("endDate").onChange(e); // wywołaj standardowe zachowanie
                        trigger("startDate");
                        trigger("guaranteeEndDate");
                    }}
                />
                <ErrorMessage errors={errors} name='endDate' />
            </Form.Group>
            <Form.Group as={Col} controlId="guaranteeEndDate">
                <Form.Label>Gwarancja</Form.Label>
                <Form.Control
                    type="date"
                    isValid={!errors.guaranteeEndDate}
                    isInvalid={!!errors.guaranteeEndDate}
                    {...register('guaranteeEndDate')}
                    className={!isEditing ? ToolsForms.getSuggestedClass('guaranteeEndDate', watchAllFields, guaranteeEndDateSugestion) : ''}
                    onChange={(e) => {
                        register("guaranteeEndDate").onChange(e); // wywołaj standardowe zachowanie
                        //trigger("startDate");
                    }}
                />
                <ErrorMessage errors={errors} name='guaranteeEndDate' />
            </Form.Group>
        </Row>
    );
}