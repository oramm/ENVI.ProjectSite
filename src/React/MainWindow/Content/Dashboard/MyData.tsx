// MyDataCard.tsx
import React from 'react';
import { Card } from 'react-bootstrap';
import MainSetup from '../../../MainSetupReact';

export default function MyData() {
    return (
        <Card>
            <Card.Body>
                <Card.Title>Moje Dane</Card.Title>
                <Card.Text>
                    <div>{MainSetup.currentUser.userName}</div>
                    <div>{MainSetup.currentUser.systemEmail}</div>
                    <div>{MainSetup.currentUser.systemRoleName}</div>
                </Card.Text>
            </Card.Body>
        </Card>
    );
}
