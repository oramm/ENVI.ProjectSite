import React from "react";
import type { PrivacyNotice } from "./privacyApi";

export default function PrivacyNoticeSections({ sections }: { sections: PrivacyNotice["sections"] }) {
    return <>{sections.map(section => <section className="mb-4" key={section.heading}>
        <h2 className="h6">{section.heading}</h2>
        <p style={{ whiteSpace: "pre-line" }}>{section.text}</p>
    </section>)}</>;
}
