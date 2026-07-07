import React, { useMemo, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { Typeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";
import { OtherContract, OurContract } from "../../../Typings/bussinesTypes";

type Contract = OurContract | OtherContract;
type SortKey = "alias" | "coordinator";

interface Props {
    contracts: Contract[];
    discussedByContractId: Map<number, boolean>;
    selectedContractId?: number;
    onSelectContract: (contract: Contract) => void;
    onToggleDiscussed: (contractId: number, discussed: boolean) => void;
}

function contractLabel(contract: Contract): string {
    const id = "ourId" in contract ? contract.ourId : contract.number || "";
    return `${id}${contract.alias ? " | " + contract.alias : ""} ${contract.name || ""}`.trim();
}

function coordinatorName(contract: Contract): string {
    const manager =
        "ourId" in contract ? (contract as OurContract)._manager : (contract as OtherContract)._ourContract?._manager;
    return manager ? `${manager.surname} ${manager.name}` : "";
}

function scrollToContract(contractId: number) {
    // czekamy na re-render (po zaznaczeniu), potem przewijamy TYLKO wewnętrzną listę
    requestAnimationFrame(() => {
        const el = document.getElementById(`scrumContractRow${contractId}`);
        const container = el?.closest(".scrum-contracts-list") as HTMLElement | null;
        if (!el || !container) return;
        // wyśrodkuj element w kontenerze bez przewijania całego okna
        const delta =
            el.getBoundingClientRect().top -
            container.getBoundingClientRect().top -
            (container.clientHeight - el.clientHeight) / 2;
        container.scrollTo({ top: container.scrollTop + delta, behavior: "smooth" });
        el.classList.remove("section-scroll-highlight");
        void el.offsetWidth;
        el.classList.add("section-scroll-highlight");
        el.addEventListener("animationend", () => el.classList.remove("section-scroll-highlight"), { once: true });
    });
}

export default function ContractsListPanel({
    contracts,
    discussedByContractId,
    selectedContractId,
    onSelectContract,
    onToggleDiscussed,
}: Props) {
    const [sortKey, setSortKey] = useState<SortKey>("alias");
    const [discussedToBottom, setDiscussedToBottom] = useState(false);
    const [coordinators, setCoordinators] = useState<string[]>([]);

    const coordinatorOptions = useMemo(
        () => Array.from(new Set(contracts.map(coordinatorName).filter(Boolean))).sort((a, b) => a.localeCompare(b, "pl")),
        [contracts]
    );

    const visibleContracts = useMemo(() => {
        const withComparable = contracts
            .map((c) => ({
                contract: c,
                coordinator: coordinatorName(c),
                discussed: discussedByContractId.get(c.id) ?? false,
            }))
            .filter((x) => coordinators.length === 0 || coordinators.includes(x.coordinator));
        withComparable.sort((a, b) => {
            if (discussedToBottom && a.discussed !== b.discussed) return a.discussed ? 1 : -1;
            if (sortKey === "coordinator") {
                const byCoord = a.coordinator.localeCompare(b.coordinator, "pl");
                if (byCoord !== 0) return byCoord;
            }
            return contractLabel(a.contract).localeCompare(contractLabel(b.contract), "pl");
        });
        return withComparable;
    }, [contracts, discussedByContractId, sortKey, discussedToBottom, coordinators]);

    function clearFilters() {
        setSortKey("alias");
        setDiscussedToBottom(false);
        setCoordinators([]);
    }

    let lastWasDiscussed = false;

    return (
        <div className="scrum-contracts-panel">
            {/* Panel filtrów — spójny ze stylem filtrów w reszcie aplikacji (bg-light, rounded) */}
            <div className="bg-light p-2 rounded-3 mb-3 scrum-filter-panel">
                {/* Selektor umowy z podpowiadaniem — wybór przewija i podświetla umowę (nie filtruje) */}
                <Typeahead
                    id="scrum-contract-jump"
                    size="sm"
                    className="mb-2"
                    placeholder="Skocz do umowy…"
                    options={contracts}
                    labelKey={(c) => contractLabel(c as Contract)}
                    selected={[]}
                    onChange={(sel) => {
                        if (!sel[0]) return;
                        const c = sel[0] as Contract;
                        onSelectContract(c); // od razu zaznacz i pokaż szczegóły po prawej
                        scrollToContract(c.id);
                    }}
                />

                {/* Filtr koordynatorów (wielokrotny wybór) */}
                <Typeahead
                    id="scrum-coordinator-filter"
                    multiple
                    size="sm"
                    className="mb-2"
                    placeholder="Filtruj po koordynatorach…"
                    options={coordinatorOptions}
                    selected={coordinators}
                    onChange={(sel) => setCoordinators(sel as string[])}
                />

                <div className="d-flex gap-2 align-items-center flex-wrap">
                    <Form.Select
                        size="sm"
                        style={{ width: "auto" }}
                        value={sortKey}
                        onChange={(e) => setSortKey(e.target.value as SortKey)}
                    >
                        <option value="alias">Sortuj: kod | alias</option>
                        <option value="coordinator">Sortuj: koordynator</option>
                    </Form.Select>
                    <Form.Check
                        type="switch"
                        id="scrum-discussed-to-bottom"
                        label="Omówione na dół"
                        checked={discussedToBottom}
                        onChange={(e) => setDiscussedToBottom(e.target.checked)}
                    />
                    <Button variant="outline-secondary" size="sm" onClick={clearFilters}>
                        Wyczyść filtry
                    </Button>
                </div>
            </div>

            <div className="scrum-contracts-list">
                {visibleContracts.map(({ contract, discussed, coordinator }) => {
                    const showSeparator = discussedToBottom && discussed && !lastWasDiscussed;
                    lastWasDiscussed = discussed;
                    const id = "ourId" in contract ? contract.ourId : contract.number;
                    return (
                        <React.Fragment key={contract.id}>
                            {showSeparator && <hr className="scrum-discussed-separator" />}
                            <div
                                id={`scrumContractRow${contract.id}`}
                                className={
                                    "scrum-contract-item d-flex align-items-center gap-2" +
                                    (contract.id === selectedContractId ? " active" : "") +
                                    (discussed ? " discussed" : "")
                                }
                            >
                                <Form.Check
                                    type="checkbox"
                                    title="Omówiony na planowaniu"
                                    checked={discussed}
                                    onChange={(e) => onToggleDiscussed(contract.id, e.target.checked)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <div className="flex-grow-1 scrum-contract-label" onClick={() => onSelectContract(contract)}>
                                    <span className="fw-semibold">
                                        {id}
                                        {contract.alias ? ` | ${contract.alias}` : ""}
                                    </span>
                                    <span className="d-block text-secondary small text-truncate">{contract.name}</span>
                                    {coordinator && <span className="d-block text-muted small">{coordinator}</span>}
                                </div>
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}
