import React from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { useFormContext } from '../../View/Modals/FormContext';
import { DateRangeInput } from '../../View/Modals/CommonFormComponents/GenericComponents';

export function BankTransferFilterBody() {
    const { register } = useFormContext();

    return (
        <Row className="g-3">
            <Form.Group as={Col} sm={12} md={4}>
                <Form.Label>Szukana fraza</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Kontrahent, opis, nr konta"
                    {...register('searchText')}
                />
            </Form.Group>
            <Form.Group as={Col} sm={6} md={2}>
                <Form.Label>Status</Form.Label>
                <Form.Select {...register('matchingStatus')}>
                    <option value="">Wszystkie</option>
                    <option value="UNMATCHED">Nierozliczone</option>
                    <option value="PROPOSED">Proponowane</option>
                    <option value="CONFIRMED">Potwierdzone</option>
                    <option value="MANUAL">Ręczne</option>
                </Form.Select>
            </Form.Group>
            <Form.Group as={Col} sm={6} md={2}>
                <Form.Label>Kierunek</Form.Label>
                <Form.Select {...register('direction')}>
                    <option value="">Oba</option>
                    <option value="IN">IN (przychodzące)</option>
                    <option value="OUT">OUT (wychodzące)</option>
                </Form.Select>
            </Form.Group>
            <DateRangeInput
                as={Col}
                sm={12}
                md={4}
                label="Data realizacji"
                fromName="dateFrom"
                toName="dateTo"
                showValidationInfo={false}
            />
        </Row>
    );
}
