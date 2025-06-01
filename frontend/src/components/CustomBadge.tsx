import React from 'react'

interface CustomBadgeProps {
    text: string,
    icon?: any,
    classes?: string
}

const CustomBadge: React.FC<CustomBadgeProps> = ({ icon, text, classes }: CustomBadgeProps) => {
    return (
        <div className={`flex justify-center items-center gap-2 bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-gray-700 dark:text-gray-300 py-1 ${classes}`}>
            {icon}
            <div className='font-bold'>{text}</div>
        </div>
    )
}

export default CustomBadge