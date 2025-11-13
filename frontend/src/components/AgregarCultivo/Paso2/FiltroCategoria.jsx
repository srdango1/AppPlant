import React from 'react';

const FilterButton = ({ name, isSelected, onClick }) => {
    const baseClasses = "flex h-12 shrink-0 cursor-pointer items-center justify-center gap-x-2 rounded-lg px-4 transition-colors";
    const selectedClasses = "bg-primary/20 dark:bg-primary/30 text-primary font-medium";
    const unselectedClasses = "bg-card-light dark:bg-card-dark hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium";

    return (
        <div className={`${baseClasses} ${isSelected ? selectedClasses : unselectedClasses}`} onClick={onClick}>
            <p>{name}</p>
        </div>
    );
};

export default FilterButton