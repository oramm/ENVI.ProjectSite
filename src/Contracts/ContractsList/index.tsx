import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Container, Accordion, Collapse, Button, Row, Col, Form } from 'react-bootstrap';

export default function Resultset({ title, filters }: { title: string, filters: any[] }) {
    const [objects, setObjects] = useState([]);
    return (
        <Container>
            <Row>
                <Col>
                    <h1>{title}</h1>
                </Col>
            </Row>
            <Row>
                <Col>
                    <FilterPanel filters={filters} />
                </Col>
            </Row>
            <Row>
                <Col>
                    {objects.length > 0 && (
                        <Table objects={objects} />
                    )}
                </Col>
            </Row>
        </Container>
    );

    function FilterPanel({ filters }: { filters: any[] }) {
        return (
            <Form method="POST" onSubmit={handleSubmit}>
                <Row>
                    {filters.map((filter, index) => (
                        <Col key={index}>
                            {filter}
                        </Col>
                    ))}
                </Row>
                <Button type="submit">Szukaj</Button>
            </Form>
        );
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const formData = new FormData(event.target as HTMLFormElement);
        const serverUrl = (window.location.href.includes('localhost')) ? 'http://localhost:3000/' : 'https://erp-envi.herokuapp.com/';

        try {
            const response = await fetch(serverUrl + 'contracts', {
                method: 'GET'
            });

            if (!response.ok) {
                throw new Error(response.statusText);
            }

            const data = await response.json();
            setObjects(data);
            console.log(data);
        } catch (error) {
            console.error(error);
        }
    };

    function Table({ objects }: { objects: any[] }) {
        return (
            <table>
                <thead>
                    <tr>
                        <th>Column 1</th>
                        <th>Column 2</th>
                        <th>Column 3</th>
                        {/* ... */}
                    </tr>
                </thead>
                <tbody>
                    {objects.map((object, index) => (
                        <tr key={index}>
                            <td>{object.id}</td>
                            <td>{object.ourId}</td>
                            <td>{object.name}</td>
                            {/* ... */}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }
}

const filters = [
    <Form.Group>
        <Form.Label>Text Input</Form.Label>
        <Form.Control type="text" placeholder="Enter text" />
    </Form.Group>,
    <Form.Group>
        <Form.Label>Date Input</Form.Label>
        <Form.Control type="date" defaultValue={2010 - 12 - 12} />
    </Form.Group>,
    <Form.Group>
        <Form.Label>Select Option</Form.Label>
        <Form.Control as="select">
            <option>Option 1</option>
            <option>Option 2</option>
            <option>Option 3</option>
        </Form.Control>
    </Form.Group>
];

const root = document.getElementById("root");
if (root)
    ReactDOM.createRoot(root).render(<Resultset title={"Lista kontraktów"} filters={filters} />);
