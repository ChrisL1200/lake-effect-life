import React from 'react';
import ItemColor from '../../models/itemColor.model';

interface Props {
    colors: ItemColor[];
    selectedColor: ItemColor;
    setSelectedColor: (color: ItemColor) => void;
}

const ColorSelector: React.FC<Props> = ({ colors, selectedColor, setSelectedColor }) => {

    return (<div className="mb-4 flex space-x-4">
        {colors.map((color) => (
            <div
                key={color.color}
                onClick={() => setSelectedColor(color)}
                className={`h-6 w-6 rounded-full cursor-pointer border-1 ${selectedColor.color === color.color ? 'border-black' : 'border-transparent'
                    }`}
                style={{ backgroundColor: color.color.toLowerCase() }}
            >
                {/* Add a check mark if the color is selected */}
                {selectedColor === color && (
                    <div className="flex items-center justify-center h-full">
                        <span className="text-white text-xl">&#10003;</span>
                    </div>
                )}
            </div>
        ))}
    </div>);
};

export default ColorSelector;
