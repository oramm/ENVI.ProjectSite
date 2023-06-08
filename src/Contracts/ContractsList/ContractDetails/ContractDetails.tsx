import React from "react";
import { Tab, Tabs } from 'react-bootstrap';

export function ContractDetailsTabs() {

    return (
        <Tabs defaultActiveKey="general" id="uncontrolled-tab-example" fill>
            <Tab eventKey="general" title="General">
                <h1>Szczegóły umowy</h1>
            </Tab>
            <Tab eventKey="tasks" title="Tasks">
                {/* tutaj umieść swoją logikę dla zakładki "tasks" */}
                <h1>Tasks</h1>
            </Tab>
        </Tabs>
    );
};
