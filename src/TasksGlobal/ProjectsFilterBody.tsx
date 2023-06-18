import React from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { useFormContext } from '../View/Modals/FormContext';
import { FilterBodyProps } from '../View/Resultsets/FilterableTable/FilterPanel';

export function ProjectsFilterBody({ }: FilterBodyProps) {
    const { register } = useFormContext();

    return (
        <>
            <Form.Group as={Col}>
                <Form.Label>Szukana fraza</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Wpisz tekst"
                    {...register('searchText')}
                />
            </Form.Group>
        </>
    );
}