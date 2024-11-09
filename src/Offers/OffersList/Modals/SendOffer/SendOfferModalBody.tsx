import React, { useEffect, useRef, useState } from "react";
import { useFormContext } from "../../../../View/Modals/FormContext";
import { OfferEventData, OurOffer } from "../../../../../Typings/bussinesTypes";
import { ModalBodyProps } from "../../../../View/Modals/ModalsTypes";
import { Form } from "react-bootstrap";
import { ErrorMessage } from "../../../../View/Modals/CommonFormComponents/GenericComponents";
import { GdFilesSelector } from "../../../../View/Modals/CommonFormComponents/OtherAttributesSelectors";
import { PersonSelector } from "../../../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { personsRepository } from "../../OffersController";
import MainSetup from "../../../../React/MainSetupReact";
import { hasError } from "../../../../View/Resultsets/CommonComponentsController";

export function SendOfferModalBody({ initialData }: ModalBodyProps<OurOffer>) {
    const {
        register,
        reset,
        formState: { errors },
        trigger,
    } = useFormContext();

    const isAnotherOffer = initialData?._lastEvent?.eventType === MainSetup.OfferEventType.SEND;

    useEffect(() => {
        const resetData: any = {
            _newEvent: {
                comment: initialData?._lastEvent?.comment || "",
                additionalMessage: initialData?._lastEvent?.additionalMessage || "",
                _recipients:
                    initialData?._lastEvent?.eventType === MainSetup.OfferEventType.SEND
                        ? initialData?._lastEvent?._recipients
                        : undefined,
                _gdFilesBasicData: undefined,
            } as OfferEventData,
        };

        reset(resetData);
        trigger();
    }, [initialData, reset]);

    if (!initialData?.gdFolderId) {
        throw new Error("Brak przypisanego folderu oferty");
    }

    function renderAnotherOfferFileInstrutions() {
        return (
            <Form.Text className="text-muted">
                <div>
                    Wybierz z folderu oferty na Dysku Google pliki, które chcesz przesłać wraz z ofertą. Możesz wybrać
                    więcej niż jeden.
                </div>
            </Form.Text>
        );
    }

    return (
        <>
            <Form.Group controlId="_recipients" className="mb-4">
                <Form.Label>Adresaci maila</Form.Label>
                <PersonSelector
                    name="_newEvent._recipients"
                    multiple={true}
                    repository={personsRepository}
                    allowNew={false}
                />
                <Form.Text muted>
                    <div>
                        Możesz wybrać osoby z listy, albo wpisać adresy mailowe ręcznie (jako osobne niebieskie bloczki)
                    </div>
                </Form.Text>
            </Form.Group>

            <Form.Group controlId="additionalMessage" className="mb-4">
                <Form.Label>Dodatkowa informacja do szablonu maila</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Pole opcjonalne"
                    isValid={!hasError(errors, "_newEvent.additionalMessage")}
                    isInvalid={hasError(errors, "_newEvent.additionalMessage")}
                    {...register("_newEvent.additionalMessage")}
                />
                <ErrorMessage name="_newEvent.additionalMessage" errors={errors} />
                <Form.Text className="text-muted">
                    <div>
                        Wypełnij to pole tylko jeśli musisz dodać jakąś nietypową informację, której nie ma w załączonej
                        ofercie. Ta informacja zostanie umieszczona w treści maila.
                    </div>
                </Form.Text>
            </Form.Group>

            <Form.Group controlId="comment" className="mb-4">
                <Form.Label>Komentarz prywatny</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Pole opcjonalne"
                    isValid={!hasError(errors, "_newEvent.comment")}
                    isInvalid={hasError(errors, "_newEvent.comment")}
                    {...register("_newEvent.comment")}
                />
                <ErrorMessage name="_newEvent.comment" errors={errors} />
                <Form.Text className="text-muted">
                    <div>
                        {isAnotherOffer ? (
                            <>
                                UWAGA oferta była juz wysłana ${initialData._lastEvent!.versionNumber} razy. Podaj
                                wyjąśnienie wewnętrzne dla ENVI <br />
                            </>
                        ) : (
                            "Wypełnij to pole tylko jeśli masz komentarz wewnętrzy na potrzeby ENVI - nie będzie on wysłany do Klienta."
                        )}
                    </div>
                </Form.Text>
            </Form.Group>

            <GdFilesSelector
                showValidationInfo={true}
                name="_newEvent._gdFilesBasicData"
                contextData={initialData}
                attentionRequiredFileNames={initialData?._lastEvent?._gdFilesBasicData?.map((file) => file.name)}
                multiple={true}
            />
            <Form.Text className="text-muted">
                {isAnotherOffer ? (
                    renderAnotherOfferFileInstrutions()
                ) : (
                    <div>
                        Wybierz z folderu oferty na Dysku Google pliki, które chcesz przesłać wraz z ofertą. Możesz
                        wybrać więcej niż jeden.
                    </div>
                )}
            </Form.Text>
        </>
    );
}
