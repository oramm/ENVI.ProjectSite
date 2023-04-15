import { useState } from 'react';

function useValidation(initialValue: any, validator: ((value: any) => { isValid: boolean, message: string })) {
    const [value, setValue] = useState(initialValue);
    const [isValid, setIsValid] = useState(false);
    const [validationMessage, setValidationMessage] = useState('');

    const handleValidation = (value: any) => {
        const validationResult = validator(value);
        setIsValid(validationResult.isValid);
        setValidationMessage(validationResult.message);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setValue(value);
        handleValidation(value);
    };

    return { value, isValid, validationMessage, handleChange };
}
