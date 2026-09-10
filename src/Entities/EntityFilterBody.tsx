import React from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { useFormContext } from '../View/Modals/FormContext';
import { GusStatusSelector } from '../View/Modals/CommonFormComponents/StatusSelectors';

export function EntitiesFilterBody() {
    const { register } = useFormContext();

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
            {/* GPO-3: nic nie zaznaczone = wszystkie podmioty, tak jak dotąd. */}
            <Form.Group as={Col} md={4}>
                <GusStatusSelector />
            </Form.Group>
        </Row>
    );
}