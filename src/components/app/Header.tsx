import React from 'react';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const Header: React.FC = () => {
    return (
        <header className="bg-white shadow-md">
            <div className="container mx-auto flex justify-between items-center p-4">
                <div className="flex items-center">
                    <img
                        src="/images/logo.png"
                        alt="Logo"
                        className="h-10 w-auto mr-2"
                    />
                </div>

                {/* Cart Icon */}
                <div className="relative">
                    <ShoppingCartIcon className="h-8 w-8 text-gray-600" />
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                        3
                    </span>
                </div>
            </div>
        </header>
    );
};

export default Header;