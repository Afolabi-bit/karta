import { Star } from "lucide-react";
import React from "react";

interface RatingProps {
    value?: number;
}

const Rating: React.FC<RatingProps> = ({ value = 4 }) => {

    return (
        <div className="flex items-center">
            {Array.from({ length: 5 }, (_, i) => (
                <Star
                    key={i}
                    className={`shrink-0 size-4 fill-current ${value > i ? "text-[#E59500]" : "text-gray-300"}`}
                />
            ))}
        </div>
    );
};

export default Rating;
