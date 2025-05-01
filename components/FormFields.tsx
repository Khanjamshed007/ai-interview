import React from 'react'
import { FormControl, FormItem, FormLabel, FormMessage } from './ui/form'
import { Input } from './ui/input'
import { Control, Controller, FieldValues, Path } from 'react-hook-form'

interface FormFieldProps<T extends FieldValues> {
    control: Control<T>;
    name: Path<T>;
    label?: string
    placeholder?: string
    type?: 'text' | 'password' | 'email' | 'number' | 'file'
}

const FormFields = <T extends FieldValues>({ name, control, label, placeholder, type = "text" }: FormFieldProps<T>) => {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field, formState: { errors } }) => {
                const errorMessage = errors[name]?.message as string | undefined;
                return (
                    <FormItem>
                        <FormLabel className="label">{label}</FormLabel>
                        <FormControl>
                            <Input className="input" placeholder={placeholder} {...field} type={type} />
                        </FormControl>
                        <FormMessage>{errorMessage}</FormMessage>
                    </FormItem>
                );
            }}
        />
    );
};

export default FormFields