import * as Yup from "yup";
import { valueValidation } from "../../../../View/Modals/CommonFormComponents/GenericComponents";

function makeOfferBondValidationSchema(isEditing: boolean) {
    return Yup.object().shape({
        _offerBond: Yup.object().shape({
            value: valueValidation,
            form: Yup.string().required("Forma jest wymagana"),
            paymentData: Yup.string()
                .required("Dane do płatności są wymagane")
                .max(300, "Dane do płatności mogą mieć maksymalnie 300 znaków"),
            comment: Yup.string().max(500, "Uwagi mogą mieć maksymalnie 500 znaków"),
            status: Yup.string().required("Status jest wymagany"),
            expiryDate: Yup.date().required("Data ważności jest wymagana"),
        }),
    });
}

export default makeOfferBondValidationSchema;
