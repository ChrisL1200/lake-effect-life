import React from 'react';
import ItemColor from '../../models/itemColor.model';
import './ColorSelector.scss';

interface Props {
    colors: ItemColor[];
    selectedColor: ItemColor;
    setSelectedColor: (color: ItemColor) => void;
}

const ColorSelector: React.FC<Props> = ({ colors, selectedColor, setSelectedColor }) => {
    return (
        <div className="color-selector mb-4 flex overflow-x-auto overflow-y-hidden pb-2">
            {colors.map((color) => (
                <div className="pr-2" key={color.color}>
                    <div
                        onClick={() => setSelectedColor(color)}
                        className={`h-6 w-6 rounded-full cursor-pointer border-2 ${selectedColor.color === color.color ? 'border-black' : 'border-transparent'}`}
                        style={{ backgroundColor: color.color.toLowerCase() }}
                    >
                        {/* Black border is applied directly when selected */}
                    </div>
                </div>
            ))}
        </div>

    );
};

export default ColorSelector;
