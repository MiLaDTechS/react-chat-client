import produce from "immer";
import { useCallback, useEffect, useRef, useState } from "react";

const PREFIX = process.env.REACT_APP_LS_PREFIX;

export const useIsFirstRender = () => {
    const isFirstRenderRef = useRef(true);

    useEffect(() => {
        isFirstRenderRef.current = false;
    }, []);

    return isFirstRenderRef.current;
};

export const useLocalStorage = (key, initialValue) => {
    const prefixedKey = PREFIX + key;

    const [value, setValue] = useState(() => {
        const jsonValue = localStorage.getItem(prefixedKey);
        return (jsonValue && jsonValue !== 'undefined') ? JSON.parse(jsonValue) : initialValue ? (typeof initialValue === 'function' ? initialValue() : initialValue) : '';
    });

    useEffect(() => {
        localStorage.setItem(prefixedKey, JSON.stringify(value))
    }, [prefixedKey, value]);

    const removeItem = useCallback(() => {
        localStorage.removeItem(prefixedKey);
    }, [prefixedKey]);

    return { value, setValue, removeItem }
};

export const useImmer = (initialValue) => {
    const [val, updateValue] = useState(initialValue);
    return [
        val,
        useCallback((updater) => {
            if (typeof updater === "function") updateValue(produce(updater));
            else updateValue(updater);
        }, []),
    ];
}

const CustomValidationModuleOnSubmit = (input) => {
    if (input) {
        const { validity, name } = input;

        switch (name) {
            case 'message':
                if (validity.valueMissing) {
                    input.setCustomValidity('Write a message');
                } else {
                    input.setCustomValidity('');
                }
                break;
            case 'email':
                if (validity.valueMissing) {
                    input.setCustomValidity('Email is required');
                } else if (validity.typeMismatch) {
                    input.setCustomValidity('Email is invalid');
                } else {
                    input.setCustomValidity('');
                }
                break;
            case 'password':
                if (validity.valueMissing) {
                    input.setCustomValidity('Password is required');
                } else {
                    input.setCustomValidity('');
                }
                break;
            case 'confirmPassword':
                if (validity.valueMissing) {
                    input.setCustomValidity('Confirm Password is required');
                } else {
                    input.setCustomValidity('');
                }
                break;
            default:
                break;
        }
    }
}

export const CustomValidationModule = () => { };

CustomValidationModule.onSubmit = CustomValidationModuleOnSubmit;