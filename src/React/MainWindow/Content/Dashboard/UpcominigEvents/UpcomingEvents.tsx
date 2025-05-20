import React from "react";
import SecuritiesList from "./SecuritiesList";
import MilestonesList from "./MilestonesList";

export default function UpcomingEvents() {
    return (
        <>
            <div className="mb-3 bg-white">
                <MilestonesList />
            </div>
            {/* 
            <div className="mb-3">
                <SecuritiesList />
            </div> 
            */}
        </>
    );
}
