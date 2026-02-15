import * as Yup from "yup";

export function makeMeetingNoteValidationSchema(isEditing: boolean) {
    return Yup.object().shape({
        title: Yup.string().required("Tytuł jest wymagany"),
        meetingDate: Yup.date().required("Data spotkania jest wymagana"),
    });
}
