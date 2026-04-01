"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CostInvoiceDetails;
const react_1 = __importStar(require("react"));
const react_router_dom_1 = require("react-router-dom");
const react_bootstrap_1 = require("react-bootstrap");
const CostInvoicesController_1 = require("./CostInvoicesController");
const CostInvoicesBadges_1 = require("./CostInvoicesBadges");
const Tools_1 = __importDefault(require("../../React/Tools/Tools"));
const ToolsDate_1 = __importDefault(require("../../React/Tools/ToolsDate"));
const CommonComponents_1 = require("../../View/Resultsets/CommonComponents");
function CostInvoiceDetails() {
    const { id } = (0, react_router_dom_1.useParams)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const [invoice, setInvoice] = (0, react_1.useState)(null);
    const [categories, setCategories] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [saving, setSaving] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const [validationDetails, setValidationDetails] = (0, react_1.useState)([]);
    const [success, setSuccess] = (0, react_1.useState)(null);
    // Edytowalne pola faktury
    const [categoryId, setCategoryId] = (0, react_1.useState)(null);
    const [bookingPercentage, setBookingPercentage] = (0, react_1.useState)(100);
    const [vatDeductionPercentage, setVatDeductionPercentage] = (0, react_1.useState)(100);
    const [notes, setNotes] = (0, react_1.useState)("");
    const [status, setStatus] = (0, react_1.useState)(CostInvoicesController_1.CostInvoiceStatuses.NEW);
    const [paymentStatus, setPaymentStatus] = (0, react_1.useState)(CostInvoicesController_1.PaymentStatuses.UNPAID);
    const [paidAmount, setPaidAmount] = (0, react_1.useState)(0);
    const updateListCaches = (0, react_1.useCallback)((updatedInvoice) => {
        if (!updatedInvoice?.id)
            return;
        const updateById = (items, nextItem) => {
            if (!Array.isArray(items))
                return items;
            let found = false;
            const updated = items.map((item) => {
                if (item?.id === nextItem.id) {
                    found = true;
                    return { ...item, ...nextItem };
                }
                return item;
            });
            return found ? updated : items;
        };
        try {
            const repoRaw = sessionStorage.getItem("costInvoices");
            if (repoRaw) {
                const repoParsed = JSON.parse(repoRaw);
                const updatedItems = updateById(repoParsed?.items || [], updatedInvoice);
                sessionStorage.setItem("costInvoices", JSON.stringify({ ...repoParsed, items: updatedItems }));
            }
        }
        catch (error) {
            console.warn("[CostInvoiceDetails] Nie udało się zaktualizować cache repozytorium", error);
        }
        try {
            const snapshotKey = "filtersableTableSnapshot_costInvoices";
            const snapshotRaw = sessionStorage.getItem(snapshotKey);
            if (snapshotRaw) {
                const snapshotParsed = JSON.parse(snapshotRaw);
                const updatedStoredObjects = updateById(snapshotParsed?.storedObjects || [], updatedInvoice);
                sessionStorage.setItem(snapshotKey, JSON.stringify({ ...snapshotParsed, storedObjects: updatedStoredObjects }));
            }
        }
        catch (error) {
            console.warn("[CostInvoiceDetails] Nie udało się zaktualizować snapshotu listy", error);
        }
    }, []);
    // Edytowalne pozycje
    const [editedItems, setEditedItems] = (0, react_1.useState)(new Map());
    (0, react_1.useEffect)(() => {
        if (!id)
            return;
        loadData();
    }, [id]);
    const loadData = (0, react_1.useCallback)(async () => {
        if (!id)
            return;
        setLoading(true);
        setError(null);
        try {
            const [invoiceData, categoriesData] = await Promise.all([
                (0, CostInvoicesController_1.fetchCostInvoiceDetails)(Number(id)),
                (0, CostInvoicesController_1.fetchCategories)(),
            ]);
            const invoiceWithItems = { ...invoiceData };
            setInvoice(invoiceWithItems);
            setCategories(categoriesData);
            // Ustaw wartości edytowalnych pól
            setCategoryId(invoiceWithItems.categoryId || null);
            setBookingPercentage(invoiceWithItems.bookingPercentage);
            setVatDeductionPercentage(invoiceWithItems.vatDeductionPercentage);
            setNotes(invoiceWithItems.notes || "");
            setStatus(invoiceWithItems.status);
            setPaymentStatus(invoiceWithItems.paymentStatus ?? CostInvoicesController_1.PaymentStatuses.UNPAID);
            setPaidAmount(invoiceWithItems.paidAmount ?? 0);
            document.title = `Faktura ${invoiceWithItems.invoiceNumber} | ${invoiceWithItems.supplierName}`;
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Błąd ładowania danych");
        }
        finally {
            setLoading(false);
        }
    }, [id]);
    const handleCategoryChange = (newCategoryId) => {
        setCategoryId(newCategoryId);
        // Ustaw domyślny % odliczenia VAT dla kategorii
        if (newCategoryId) {
            const category = categories.find((c) => c.id === newCategoryId);
            if (category) {
                setVatDeductionPercentage(category.vatDeductionDefault);
            }
        }
    };
    const handleItemChange = (itemId, field, value) => {
        setEditedItems((prev) => {
            const newMap = new Map(prev);
            const existing = newMap.get(itemId) || {};
            newMap.set(itemId, { ...existing, [field]: value });
            return newMap;
        });
    };
    const handleSave = async () => {
        if (!invoice)
            return;
        if (paymentStatus === CostInvoicesController_1.PaymentStatuses.PARTIALLY_PAID && paidAmount <= 0) {
            setError("Dla statusu 'Częściowo zapłacona' kwota zapłacona musi być większa od 0.");
            return;
        }
        setSaving(true);
        setError(null);
        setValidationDetails([]);
        setSuccess(null);
        try {
            await persistChanges(invoice.id);
            setSuccess("Zmiany zostały zapisane");
            // Odśwież dane
            await loadData();
        }
        catch (err) {
            if (err instanceof CostInvoicesController_1.CostInvoiceApiError) {
                setValidationDetails(err.details);
            }
            setError(err instanceof Error ? err.message : "Błąd zapisywania");
        }
        finally {
            setSaving(false);
        }
    };
    const persistChanges = async (invoiceId) => {
        const updatedInvoice = await (0, CostInvoicesController_1.updateCostInvoice)(invoiceId, {
            categoryId,
            bookingPercentage,
            vatDeductionPercentage,
            notes: notes || null,
            status,
            paymentStatus,
            paidAmount,
        });
        updateListCaches(updatedInvoice);
        setInvoice((prev) => (prev ? { ...prev, ...updatedInvoice } : updatedInvoice));
        setStatus(updatedInvoice.status);
        setPaymentStatus(updatedInvoice.paymentStatus ?? CostInvoicesController_1.PaymentStatuses.UNPAID);
        setPaidAmount(updatedInvoice.paidAmount ?? 0);
        for (const [itemId, changes] of editedItems) {
            if (Object.keys(changes).length > 0) {
                await (0, CostInvoicesController_1.updateCostInvoiceItem)(invoiceId, itemId, changes);
            }
        }
        setEditedItems(new Map());
    };
    const handleBook = async () => {
        if (!invoice)
            return;
        setSaving(true);
        setError(null);
        setValidationDetails([]);
        try {
            await persistChanges(invoice.id);
            const updated = await (0, CostInvoicesController_1.bookCostInvoice)(invoice.id);
            setInvoice((prev) => (prev ? { ...updated, _items: prev._items || updated._items } : updated));
            setStatus(updated.status);
            setSuccess("Faktura została zaksięgowana");
        }
        catch (err) {
            if (err instanceof CostInvoicesController_1.CostInvoiceApiError) {
                setValidationDetails(err.details);
                console.error("[CostInvoiceDetails] Błąd walidacji księgowania", {
                    invoiceId: invoice.id,
                    status: err.status,
                    details: err.details,
                    payload: err.payload,
                });
            }
            setError(err instanceof Error ? err.message : "Błąd księgowania");
        }
        finally {
            setSaving(false);
        }
    };
    if (loading) {
        return (react_1.default.createElement("div", { className: "text-center m-5" },
            react_1.default.createElement(CommonComponents_1.SpinnerBootstrap, null),
            react_1.default.createElement("div", { className: "mt-3" }, "\u0141adowanie danych faktury...")));
    }
    if (!invoice) {
        return (react_1.default.createElement(react_bootstrap_1.Alert, { variant: "danger", className: "m-3" }, "Nie znaleziono faktury"));
    }
    const isBooked = invoice.status === CostInvoicesController_1.CostInvoiceStatuses.BOOKED;
    const supplierBankAccount = invoice.supplierBankAccount?.trim();
    const canMarkPartiallyPaid = invoice.grossAmount > 0;
    const getItemSelection = (item) => {
        const edited = editedItems.get(item.id) || {};
        return {
            isSelected: edited.isSelectedForBooking ?? item.isSelectedForBooking,
            bookingPercentage: edited.bookingPercentage ?? item.bookingPercentage,
            vatDeductionPercentage: edited.vatDeductionPercentage ?? item.vatDeductionPercentage,
        };
    };
    const costItems = (invoice._items || []).filter((item) => getItemSelection(item).isSelected);
    const nonCostItems = (invoice._items || []).filter((item) => !getItemSelection(item).isSelected);
    const renderItemsTable = (items, title) => (react_1.default.createElement("div", { className: "mb-3" },
        react_1.default.createElement("div", { className: "px-3 pt-3 fw-semibold" },
            title,
            " (",
            items.length,
            ")"),
        items.length === 0 ? (react_1.default.createElement("div", { className: "px-3 pb-3 text-muted small" }, "Brak pozycji")) : (react_1.default.createElement(react_bootstrap_1.Table, { striped: true, hover: true, responsive: true, className: "mb-0" },
            react_1.default.createElement("thead", null,
                react_1.default.createElement("tr", null,
                    react_1.default.createElement("th", { style: { width: "40px" } },
                        react_1.default.createElement(react_bootstrap_1.Form.Check, { type: "checkbox", disabled: isBooked, checked: items.every((i) => getItemSelection(i).isSelected), onChange: (e) => {
                                items.forEach((item) => {
                                    handleItemChange(item.id, "isSelectedForBooking", e.target.checked);
                                });
                            } })),
                    react_1.default.createElement("th", null, "Lp."),
                    react_1.default.createElement("th", null, "Opis"),
                    react_1.default.createElement("th", { className: "text-end" }, "Ilo\u015B\u0107"),
                    react_1.default.createElement("th", { className: "text-end" }, "Cena jedn."),
                    react_1.default.createElement("th", { className: "text-end" }, "Netto"),
                    react_1.default.createElement("th", { className: "text-center" }, "VAT"),
                    react_1.default.createElement("th", { className: "text-end" }, "Brutto"),
                    react_1.default.createElement("th", { style: { width: "100px" } }, "Ksi\u0119g. %"),
                    react_1.default.createElement("th", { style: { width: "100px" } }, "VAT odl. %"))),
            react_1.default.createElement("tbody", null, items.map((item) => {
                const { isSelected, bookingPercentage, vatDeductionPercentage } = getItemSelection(item);
                return (react_1.default.createElement("tr", { key: item.id, className: !isSelected ? "text-muted" : "" },
                    react_1.default.createElement("td", null,
                        react_1.default.createElement(react_bootstrap_1.Form.Check, { type: "checkbox", checked: isSelected, disabled: isBooked, onChange: (e) => handleItemChange(item.id, "isSelectedForBooking", e.target.checked) })),
                    react_1.default.createElement("td", null, item.lineNumber),
                    react_1.default.createElement("td", null, item.description),
                    react_1.default.createElement("td", { className: "text-end" },
                        item.quantity,
                        " ",
                        item.unit),
                    react_1.default.createElement("td", { className: "text-end" }, Tools_1.default.formatNumber(item.unitPrice)),
                    react_1.default.createElement("td", { className: "text-end" }, Tools_1.default.formatNumber(item.netValue)),
                    react_1.default.createElement("td", { className: "text-center" },
                        item.vatRate,
                        "%"),
                    react_1.default.createElement("td", { className: "text-end" }, Tools_1.default.formatNumber(item.grossValue)),
                    react_1.default.createElement("td", null,
                        react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "number", size: "sm", min: 0, max: 100, value: bookingPercentage, disabled: isBooked || !isSelected, onChange: (e) => handleItemChange(item.id, "bookingPercentage", Number(e.target.value)) })),
                    react_1.default.createElement("td", null,
                        react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "number", size: "sm", min: 0, max: 100, value: vatDeductionPercentage, disabled: isBooked || !isSelected, onChange: (e) => handleItemChange(item.id, "vatDeductionPercentage", Number(e.target.value)) }))));
            }))))));
    return (react_1.default.createElement(react_bootstrap_1.Container, { fluid: true, className: "py-3" },
        error && (react_1.default.createElement(react_bootstrap_1.Alert, { variant: "danger", onClose: () => {
                setError(null);
                setValidationDetails([]);
            }, dismissible: true },
            react_1.default.createElement("div", null, error),
            validationDetails.length > 0 && (react_1.default.createElement("ul", { className: "mb-0 mt-2" }, validationDetails.map((detail, index) => (react_1.default.createElement("li", { key: `${index}_${detail}` }, detail))))))),
        success && (react_1.default.createElement(react_bootstrap_1.Alert, { variant: "success", onClose: () => setSuccess(null), dismissible: true }, success)),
        react_1.default.createElement(react_bootstrap_1.Card, { className: "mb-3" },
            react_1.default.createElement(react_bootstrap_1.Card.Header, null,
                react_1.default.createElement(react_bootstrap_1.Row, { className: "align-items-center" },
                    react_1.default.createElement(react_bootstrap_1.Col, null,
                        react_1.default.createElement("h4", { className: "mb-0" },
                            "Faktura ",
                            invoice.invoiceNumber,
                            react_1.default.createElement(CostInvoicesBadges_1.CostInvoiceStatusBadge, { status: status }),
                            react_1.default.createElement(CostInvoicesBadges_1.InvoiceTypeBadge, { invoiceType: invoice.invoiceType }))),
                    react_1.default.createElement(react_bootstrap_1.Col, { xs: "auto", className: "d-flex align-items-center gap-2" },
                        react_1.default.createElement(react_bootstrap_1.Form.Label, { className: "mb-0 small text-muted" }, "Status"),
                        react_1.default.createElement(react_bootstrap_1.Form.Select, { size: "sm", value: status, onChange: (e) => setStatus(e.target.value), disabled: isBooked || saving, "aria-label": "Status faktury" },
                            react_1.default.createElement("option", { value: CostInvoicesController_1.CostInvoiceStatuses.NEW }, "Nowa"),
                            react_1.default.createElement("option", { value: CostInvoicesController_1.CostInvoiceStatuses.EXCLUDED }, "Poza kosztami"))),
                    react_1.default.createElement(react_bootstrap_1.Col, { xs: "auto" },
                        react_1.default.createElement(react_bootstrap_1.Button, { variant: "outline-secondary", size: "sm", onClick: () => navigate("/costInvoices") }, "\u2190 Powr\u00F3t do listy")))),
            react_1.default.createElement(react_bootstrap_1.Card.Body, null,
                react_1.default.createElement(react_bootstrap_1.Row, null,
                    react_1.default.createElement(react_bootstrap_1.Col, { md: 6 },
                        react_1.default.createElement("h6", null, "Dostawca"),
                        react_1.default.createElement("p", { className: "mb-1" },
                            react_1.default.createElement("strong", null, invoice.supplierName)),
                        react_1.default.createElement("p", { className: "mb-1 text-muted" },
                            "NIP: ",
                            invoice.supplierNip),
                        invoice.supplierAddress && (react_1.default.createElement("p", { className: "mb-1 text-muted small" }, invoice.supplierAddress)),
                        react_1.default.createElement("p", { className: "mb-0 small" },
                            react_1.default.createElement("span", { className: "text-muted" }, "Konto: "),
                            supplierBankAccount ? (react_1.default.createElement(react_1.default.Fragment, null,
                                react_1.default.createElement("code", null, supplierBankAccount),
                                react_1.default.createElement(react_bootstrap_1.Button, { variant: "link", size: "sm", className: "py-0 px-1", title: "Kopiuj numer rachunku", onClick: () => navigator.clipboard.writeText(supplierBankAccount) }, "\u2398"))) : (react_1.default.createElement("span", { className: "text-muted" }, "brak")))),
                    react_1.default.createElement(react_bootstrap_1.Col, { md: 3 },
                        react_1.default.createElement("h6", null, "Daty"),
                        react_1.default.createElement("p", { className: "mb-1" },
                            react_1.default.createElement("small", { className: "text-muted" }, "Wystawienia:"),
                            " ",
                            ToolsDate_1.default.dateYMDtoDMY(invoice.issueDate)),
                        invoice.saleDate && (react_1.default.createElement("p", { className: "mb-1" },
                            react_1.default.createElement("small", { className: "text-muted" }, "Sprzeda\u017Cy:"),
                            " ",
                            ToolsDate_1.default.dateYMDtoDMY(invoice.saleDate))),
                        invoice.dueDate && (react_1.default.createElement("p", { className: "mb-1" },
                            react_1.default.createElement("small", { className: "text-muted" }, "P\u0142atno\u015Bci:"),
                            " ",
                            ToolsDate_1.default.dateYMDtoDMY(invoice.dueDate))),
                        invoice.paymentDate && (react_1.default.createElement("p", { className: "mb-0" },
                            react_1.default.createElement("small", { className: "text-muted" }, "Zap\u0142acono:"),
                            " ",
                            react_1.default.createElement("strong", { className: "text-success" }, ToolsDate_1.default.dateYMDtoDMY(invoice.paymentDate))))),
                    react_1.default.createElement(react_bootstrap_1.Col, { md: 3 },
                        react_1.default.createElement("h6", null, "Warto\u015Bci"),
                        react_1.default.createElement("p", { className: "mb-1" },
                            react_1.default.createElement("small", { className: "text-muted" }, "Netto:"),
                            " ",
                            react_1.default.createElement("strong", null,
                                Tools_1.default.formatNumber(invoice.netAmount),
                                " ",
                                invoice.currency)),
                        react_1.default.createElement("p", { className: "mb-1" },
                            react_1.default.createElement("small", { className: "text-muted" }, "VAT:"),
                            " ",
                            Tools_1.default.formatNumber(invoice.vatAmount),
                            " ",
                            invoice.currency),
                        react_1.default.createElement("p", { className: "mb-0" },
                            react_1.default.createElement("small", { className: "text-muted" }, "Brutto:"),
                            " ",
                            react_1.default.createElement("strong", null,
                                Tools_1.default.formatNumber(invoice.grossAmount),
                                " ",
                                invoice.currency)))),
                react_1.default.createElement(react_bootstrap_1.Row, { className: "mt-3" },
                    react_1.default.createElement(react_bootstrap_1.Col, null,
                        react_1.default.createElement("small", { className: "text-muted" }, "Nr KSeF: "),
                        react_1.default.createElement("code", { className: "small" }, invoice.ksefNumber))))),
        react_1.default.createElement(react_bootstrap_1.Card, { className: "mb-3" },
            react_1.default.createElement(react_bootstrap_1.Card.Header, null,
                react_1.default.createElement("h5", { className: "mb-0" }, "Ustawienia ksi\u0119gowania")),
            react_1.default.createElement(react_bootstrap_1.Card.Body, null,
                react_1.default.createElement(react_bootstrap_1.Row, null,
                    react_1.default.createElement(react_bootstrap_1.Col, { md: 3 },
                        react_1.default.createElement(react_bootstrap_1.Form.Group, { className: "mb-3" },
                            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Kategoria kosztu"),
                            react_1.default.createElement(react_bootstrap_1.Form.Select, { value: categoryId || "", onChange: (e) => handleCategoryChange(e.target.value ? Number(e.target.value) : null), disabled: isBooked },
                                react_1.default.createElement("option", { value: "" }, "-- Wybierz kategori\u0119 --"),
                                categories.map((cat) => (react_1.default.createElement("option", { key: cat.id, value: cat.id },
                                    cat.name,
                                    " (VAT: ",
                                    cat.vatDeductionDefault,
                                    "%)")))))),
                    react_1.default.createElement(react_bootstrap_1.Col, { md: 3 },
                        react_1.default.createElement(react_bootstrap_1.Form.Group, { className: "mb-3" },
                            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "% do ksi\u0119gowania"),
                            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "number", min: 0, max: 100, value: bookingPercentage, onChange: (e) => setBookingPercentage(Number(e.target.value)), disabled: isBooked }),
                            react_1.default.createElement(react_bootstrap_1.Form.Text, { className: "text-muted" },
                                "Do zaksi\u0119gowania: ",
                                Tools_1.default.formatNumber((invoice.netAmount * bookingPercentage) / 100),
                                " z\u0142"))),
                    react_1.default.createElement(react_bootstrap_1.Col, { md: 3 },
                        react_1.default.createElement(react_bootstrap_1.Form.Group, { className: "mb-3" },
                            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "% odliczenia VAT"),
                            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "number", min: 0, max: 100, value: vatDeductionPercentage, onChange: (e) => setVatDeductionPercentage(Number(e.target.value)), disabled: isBooked }),
                            react_1.default.createElement(react_bootstrap_1.Form.Text, { className: "text-muted" },
                                "VAT do odliczenia: ",
                                Tools_1.default.formatNumber((invoice.vatAmount * vatDeductionPercentage) / 100),
                                " z\u0142")))),
                react_1.default.createElement(react_bootstrap_1.Row, null,
                    react_1.default.createElement(react_bootstrap_1.Col, { md: 12 },
                        react_1.default.createElement(react_bootstrap_1.Form.Group, { className: "mb-3" },
                            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Notatki"),
                            react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "textarea", rows: 2, value: notes, onChange: (e) => setNotes(e.target.value), disabled: isBooked, placeholder: "Dodatkowe informacje..." })))),
                react_1.default.createElement(react_bootstrap_1.Row, { className: "mt-2" },
                    react_1.default.createElement(react_bootstrap_1.Col, { md: 12 },
                        react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Status p\u0142atno\u015Bci"),
                        react_1.default.createElement("div", { className: "mb-2" },
                            react_1.default.createElement(CostInvoicesBadges_1.PaymentMethodBadge, { paymentMethod: invoice.paymentMethod })),
                        react_1.default.createElement("div", { className: "d-flex gap-2 flex-wrap mb-2" }, [
                            { value: CostInvoicesController_1.PaymentStatuses.UNPAID, label: "● Niezapłacona" },
                            { value: CostInvoicesController_1.PaymentStatuses.PARTIALLY_PAID, label: "◑ Częściowo" },
                            { value: CostInvoicesController_1.PaymentStatuses.PAID, label: "✓ Zapłacona" },
                            { value: CostInvoicesController_1.PaymentStatuses.NOT_APPLICABLE, label: "– Nie dotyczy" },
                        ].map(({ value, label }) => (react_1.default.createElement(react_bootstrap_1.Button, { key: value, size: "sm", variant: paymentStatus === value ? "primary" : "outline-secondary", disabled: isBooked || (value === CostInvoicesController_1.PaymentStatuses.PARTIALLY_PAID && !canMarkPartiallyPaid), onClick: () => {
                                setPaymentStatus(value);
                                if (value === CostInvoicesController_1.PaymentStatuses.PAID)
                                    setPaidAmount(invoice.grossAmount);
                                if (value === CostInvoicesController_1.PaymentStatuses.UNPAID || value === CostInvoicesController_1.PaymentStatuses.NOT_APPLICABLE)
                                    setPaidAmount(0);
                            } }, label)))),
                        !canMarkPartiallyPaid && (react_1.default.createElement("div", { className: "text-muted small mb-2" }, "Dla dokument\u00F3w z ujemnym brutto status cz\u0119\u015Bciowej p\u0142atno\u015Bci nie jest dost\u0119pny.")),
                        paymentStatus === CostInvoicesController_1.PaymentStatuses.PARTIALLY_PAID && (react_1.default.createElement(react_bootstrap_1.Row, { className: "align-items-center g-2" },
                            react_1.default.createElement(react_bootstrap_1.Col, { xs: "auto" },
                                react_1.default.createElement(react_bootstrap_1.Form.Label, { className: "mb-0 small" }, "Kwota zap\u0142acona")),
                            react_1.default.createElement(react_bootstrap_1.Col, { xs: "auto" },
                                react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "number", size: "sm", min: 0, max: invoice.grossAmount, step: 0.01, value: paidAmount, disabled: isBooked, onChange: (e) => setPaidAmount(parseFloat(e.target.value) || 0), style: { width: "130px" } })),
                            react_1.default.createElement(react_bootstrap_1.Col, { xs: "auto" },
                                react_1.default.createElement("span", { className: "text-muted small" },
                                    "z ",
                                    Tools_1.default.formatNumber(invoice.grossAmount),
                                    " ",
                                    invoice.currency,
                                    " · ",
                                    "pozosta\u0142o:",
                                    " ",
                                    react_1.default.createElement("strong", { className: invoice.grossAmount - paidAmount > 0 ? "text-danger" : "text-success" },
                                        Tools_1.default.formatNumber(invoice.grossAmount - paidAmount),
                                        " ",
                                        invoice.currency))))))),
                isBooked && invoice.bookedAt && (react_1.default.createElement(react_bootstrap_1.Alert, { variant: "info", className: "mb-0 mt-3" },
                    react_1.default.createElement("strong", null, "Zaksi\u0119gowano:"),
                    " ",
                    ToolsDate_1.default.dateToDDmmmYYYYHHMM(invoice.bookedAt),
                    invoice._bookedByPerson && (react_1.default.createElement(react_1.default.Fragment, null,
                        " przez ",
                        invoice._bookedByPerson.name,
                        " ",
                        invoice._bookedByPerson.surname)))))),
        react_1.default.createElement(react_bootstrap_1.Card, { className: "mb-3" },
            react_1.default.createElement(react_bootstrap_1.Card.Header, null,
                react_1.default.createElement("h5", { className: "mb-0" }, "Pozycje faktury")),
            react_1.default.createElement(react_bootstrap_1.Card.Body, { className: "p-0" },
                renderItemsTable(costItems, "Pozycje kosztowe"),
                renderItemsTable(nonCostItems, "Pozycje poza kosztami"))),
        !isBooked && (react_1.default.createElement("div", { className: "d-flex gap-2" },
            react_1.default.createElement(react_bootstrap_1.Button, { variant: "primary", onClick: handleSave, disabled: saving }, saving ? (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(react_bootstrap_1.Spinner, { animation: "border", size: "sm", className: "me-1" }),
                "Zapisywanie...")) : ("💾 Zapisz zmiany")),
            status !== CostInvoicesController_1.CostInvoiceStatuses.EXCLUDED && (react_1.default.createElement(react_bootstrap_1.Button, { variant: "success", onClick: handleBook, disabled: saving }, saving ? (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(react_bootstrap_1.Spinner, { animation: "border", size: "sm", className: "me-1" }),
                "Ksi\u0119gowanie...")) : ("✅ Zaksięguj fakturę")))))));
}
