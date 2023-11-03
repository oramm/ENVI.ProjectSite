import React from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { ErrorMessage, MyAsyncTypeahead } from '../View/Modals/CommonFormComponents';
import { useFormContext } from '../View/Modals/FormContext';
import { entitiesRepository } from './PersonsController';

export function PersonsFilterBody() {
    const { register, formState: { errors } } = useFormContext();

    return (
        <Row xl={12} md={6} xs={12}>
            <Form.Group as={Col} md={4}>
                <Form.Label>Szukana fraza</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Wpisz tekst"
                    {...register('searchText')}
                />
            </Form.Group>
            <Form.Group as={Col} md={8}>
                <Form.Label>Odbiorcy</Form.Label>
                <MyAsyncTypeahead
                    name='_entities'
                    labelKey='name'
                    repository={entitiesRepository}
                    multiple={true}
                    showValidationInfo={false}
                />
                <ErrorMessage errors={errors} name='_entities' />
            </Form.Group>
        </Row>
    );
}