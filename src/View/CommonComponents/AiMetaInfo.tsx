import React from "react";
import { AiUsageInfo } from "../../../Typings/bussinesTypes";

interface AiMetaInfoProps {
    _model?: string;
    _usage?: AiUsageInfo;
}

export function AiMetaInfo({ _model, _usage }: AiMetaInfoProps) {
    if (!_model && !_usage) return null;

    return (
        <div className="text-muted small mt-2">
            {_model && (
                <span className="me-3">
                    Model: <strong>{_model}</strong>
                </span>
            )}
            {_usage && (
                <span>
                    Tokeny: {_usage.promptTokens} prompt +{" "}
                    {_usage.completionTokens} odpowiedź ={" "}
                    <strong>{_usage.totalTokens}</strong>
                </span>
            )}
        </div>
    );
}
