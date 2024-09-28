import React from 'react';
import { useNavigate } from 'react-router-dom';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import { RootState } from '../../store';
import { useSelector } from 'react-redux';
import CartItem from '../../models/cartItem.model';

const Header: React.FC = () => {
    const navigate = useNavigate();

    const cartItems: CartItem[] = useSelector((reduxState: RootState) => {
        return reduxState.cart.cartItems;
    });

    const handleCartClick = () => {
        navigate('/cart');
    };

    const handleLoginClick = () => {
        navigate('/login');
    };

    const handleLogoClick = () => {
        navigate('/');
    };

    return (
        <header className="bg-white shadow-md">
            <div className="container mx-auto flex justify-between items-center p-4">
                <div className="flex items-center">
                    <img
                        src="/images/logo.png"
                        alt="Logo"
                        className="h-10 w-auto mr-2"
                        onClick={handleLogoClick}
                    />
                </div>

                <div className="relative ml-auto mr-2" onClick={handleLoginClick}>
                    <PersonIcon className="h-8 w-8 text-gray-600" />
                </div>

                <div className="relative" onClick={handleCartClick}>
                    <ShoppingCartIcon className="h-8 w-8 text-gray-600" />
                    {cartItems.length > 0 &&
                        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                            {cartItems.length}
                        </span>
                    }
                </div>
            </div>
        </header>
    );
};

export default Header;