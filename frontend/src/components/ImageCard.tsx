import { IMAGE_NOT_FOUND_PATH } from '@/constants/ImagePathConstant';
import React from 'react'

interface ImageCardProps {
    imageURL?: string,
    imageAlt?: string,
    title: string,
    description: string,
    body?: any
}

const ImageCard: React.FC<ImageCardProps> = ({ imageURL, imageAlt, title, description, body }: ImageCardProps) => {
    return (
        <div className="w-75 bg-white/10  backdrop-blur-lg rounded-lg shadow-sm">
            <img
                className="w-full rounded-t-lg"
                src={imageURL || IMAGE_NOT_FOUND_PATH} // Use fallback image if imageURL is not provided
                alt={imageAlt || "Fallback image"} // Use fallback alt text if imageAlt is not provided
            />
            <div className="p-5">
                <h5 className="mb-2 text-xl font-medium tracking-tight text-white">{title}</h5>
                <p className="mb-3 font-normal text-white">{description}</p>
                {body}
            </div>
        </div>
    );
}

export default ImageCard