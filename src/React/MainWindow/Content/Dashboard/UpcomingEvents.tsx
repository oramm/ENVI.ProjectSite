import React, { useEffect, useState } from "react";
import ContractsList from "./UpcominigEvents/ContractsList";
import SecuritiesList from "./UpcominigEvents/SecuritiesList";
import MilestonesList from "./UpcominigEvents/MilestonesList";

export default function UpcomingEvents() {
    return (
        <>
            <div className="mb-3 bg-white">
                <MilestonesList />
            </div>
            <div className="mb-3">
                <SecuritiesList />
            </div>
        </>
    );
}
