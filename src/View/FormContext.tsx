import { createContext, useContext } from 'react';
import { FieldErrors, UseFormHandleSubmit, Control, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';

interface FormContextValues {
    register: UseFormRegister<any>;
    setValue: UseFormSetValue<any>;
    watch: UseFormWatch<any>;
    handleSubmit: UseFormHandleSubmit<any>;
    control: Control<any>;
    formState: {
        errors: FieldErrors<any>,
        isValid: boolean
    };
}

const FormContext = createContext<FormContextValues | null>(null);

export const useFormContext = () => {
    const context = useContext(FormContext);
    if (!context) {
        throw new Error('useFormContext must be used within a FormProvider');
    }
    return context;
};

export const FormProvider = FormContext.Provider;
