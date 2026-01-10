import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faUser } from "@fortawesome/free-solid-svg-icons";
import { OtherContract, OurContract, PersonData, RepositoryDataItem } from "../../../../Typings/bussinesTypes";
import { ContractStatusBadge } from "../CommonComponents";
import { useFilterableTableContext } from "./FilterableTableContext";
import { RowActionMenu } from "./FilterableTableRow";
import { SectionHeaderProps } from "./Section";
import { ToggleExpandButton } from "./ToggleExpandButton";
import { buildDetailsPath } from "../../../React/Tools/ToolsRouting";

/**
 * Dedykowany komponent nagłówka dla kontraktów z lepszą typografią i wizualizacją
 * Bazuje na designie z mockupów AI - optymalizowany dla czytelności
 * Używa tej samej struktury danych co makeContractTitleLabel ale z CSS variables
 */
export function ContractHeader<DataItemType extends RepositoryDataItem>({
    sectionNode,
    onClick,
    isActive,
    localExpandTrigger,
    setLocalExpandTrigger,
}: SectionHeaderProps<DataItemType>) {
    const navigate = useNavigate();
    const { handleDeleteSection, handleEditSection, handleAddSection } = useFilterableTableContext<DataItemType>();
    const { selectedObjectRoute, dataItem } = sectionNode;

    // Rzutuj dataItem na typ kontraktu
    const contract = dataItem as OurContract | OtherContract;
    const isOurContract = "ourId" in contract;
    const manager = isOurContract ? (contract._manager as PersonData) : undefined;
    const ourId = isOurContract ? contract.ourId : undefined;
    const contractors = !isOurContract ? contract._contractors : undefined;

    const identifier = ourId ? ourId : `${contract._type.name} ${contract.number}`;
    const contractName = contract.name?.length > 200 ? contract.name.substring(0, 200) + "..." : contract.name;

    const hasAlias = !!contract.alias;
    const hasContractors = contractors && contractors.length > 0;
    const showAliasLine = hasAlias || hasContractors;
    const hasDates = contract.startDate || contract.endDate;

    // Klasy CSS
    const borderClass = isOurContract ? "contract-header-our" : "contract-header-other";

    return (
        <div
            className={`contract-header ${borderClass} ${isActive ? "contract-header-active" : ""} w-100 mb-2`}
            onClick={() => onClick(sectionNode)}
            onDoubleClick={() => {
                if (!selectedObjectRoute) return;
                const target = buildDetailsPath(selectedObjectRoute, dataItem.id);
                if (target) navigate(target);
            }}
        >
            {/* Główna zawartość nagłówka */}
            <div className="p-3 d-flex flex-column flex-md-row justify-content-md-between align-items-start w-100">
                {/* Lewa strona - informacje o kontrakcie */}
                <div className="flex-fill pe-md-3 min-w-0" style={{ flexGrow: 1 }}>
                    {/* Linia #1: ID + Status Badge */}
                    <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                        <span className="contract-id">{identifier}</span>
                        <ContractStatusBadge status={contract.status} />
                    </div>

                    {/* Linia #2: Nazwa kontraktu (tytuł główny) */}
                    <h6 className="contract-title mb-1">{contractName}</h6>

                    {/* Linia #3: Alias + Wykonawcy (opcjonalnie) */}
                    {showAliasLine && (
                        <div className="d-flex align-items-center gap-2 mb-2">
                            {hasAlias && <span className="contract-alias">{contract.alias}</span>}
                            {hasAlias && hasContractors && <span className="text-muted opacity-50">|</span>}
                            {hasContractors && (
                                <span className="text-muted small">{contractors.map((c) => c.name).join(", ")}</span>
                            )}
                        </div>
                    )}

                    {/* Linia #4: Daty + Koordynator */}
                    <div className="d-flex flex-wrap gap-4 align-items-center contract-metadata">
                        {hasDates && (
                            <div className="d-flex align-items-center gap-2">
                                <FontAwesomeIcon icon={faCalendarAlt} className="contract-metadata-icon" />
                                <span>
                                    {contract.startDate || "?"} — {contract.endDate || "?"}
                                </span>
                            </div>
                        )}
                        {manager && (
                            <div className="d-flex align-items-center gap-2">
                                <FontAwesomeIcon icon={faUser} className="contract-metadata-icon" />
                                <span>
                                    Koordynator:{" "}
                                    <strong>
                                        {manager.name} {manager.surname}
                                    </strong>
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Prawa strona - Menu akcji (tylko gdy aktywny) */}
                {isActive && (
                    <div className="d-flex align-items-start gap-2 flex-shrink-0 mt-2 mt-md-0">
                        {sectionNode.children.length > 0 && (
                            <ToggleExpandButton
                                expandTrigger={localExpandTrigger}
                                setExpandTrigger={setLocalExpandTrigger}
                                collapseTitle="Zwiń dzieci"
                                expandTitle="Rozwiń dzieci"
                                stopPropagation
                            />
                        )}
                        <RowActionMenu
                            dataObject={sectionNode.dataItem}
                            isDeletable={!!sectionNode.isDeletable}
                            EditButtonComponent={sectionNode.EditButtonComponent}
                            handleEditObject={handleEditSection}
                            handleDeleteObject={handleDeleteSection}
                            shouldRetrieveDataBeforeEdit={sectionNode.shouldRetrieveDataBeforeEdit}
                            specialRetrieveActionRoute={sectionNode.specialRetrieveActionRoute}
                            layout="horizontal"
                            sectionRepository={sectionNode.repository}
                        />
                        {sectionNode.AddNewButtonComponent && (
                            <sectionNode.AddNewButtonComponent
                                modalProps={{
                                    onAddNew: handleAddSection,
                                    contextData: sectionNode.dataItem,
                                }}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
