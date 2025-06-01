
import React from 'react'

interface DashboardCardProps {
    title?: any,
    subTitle?: any
    cardBody: any,
    classes?: string,
}

const DashboardCard: React.FC<DashboardCardProps> = ({ cardBody, classes, title, subTitle }: DashboardCardProps) => {
    return (
        <div className={`bg-white flex-col p-3 rounded-sm shadow ${classes}`}>
            <div className="text-l text-gray-800 font-bold tracking-[4px]">{title}</div>
            <div className="mt-2 text-gray-500">{subTitle}</div>
            {cardBody}
        </div>
    )
}

export default DashboardCard