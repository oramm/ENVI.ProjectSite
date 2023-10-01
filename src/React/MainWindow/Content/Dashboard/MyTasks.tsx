// MyTasksCard.tsx
import React from 'react';
import { Card } from 'react-bootstrap';

export default function MyTasks() {
    return (
        <Card>
            <Card.Body>
                <Card.Title>Moje Zadania</Card.Title>
                <Card.Text>
                    Here you can display a list or summary of the user's tasks.
                </Card.Text>
            </Card.Body>
        </Card>
    );
}
