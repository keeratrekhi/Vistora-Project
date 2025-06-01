import React from 'react'
import { Path, UseFormRegister } from 'react-hook-form'

interface CustomCheckboxProps {
    labelValue: string,
    name: string,
    value: any,
    register: UseFormRegister<any>,
    errorMessage?: string
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ labelValue, name, value, register, errorMessage }: CustomCheckboxProps) => {
    return (
        <div className="flex items-center mb-4">
            <input id="default-checkbox" type="checkbox" value={value} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                {...register(name as Path<any>)}
            />
            <label htmlFor="default-checkbox" className="ms-2 text-sm font-medium text-gray-900 dark:text-black cursor-pointer">{labelValue}</label>
            <p className="text-red-500 text-sm">
                {errorMessage}
            </p>
        </div>
    )
}

export default CustomCheckbox