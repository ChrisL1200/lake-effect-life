import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PersonIcon from "@mui/icons-material/Person";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { Drawer } from "@material-tailwind/react";
import { RootState } from "../../store";
import { useSelector } from "react-redux";
import CartItem from "../../models/cartItem.model";

const MEN_TOP_TYPES = ["T-Shirt", "Tank Top", "Hoodie", "Long Sleeve", "Jacket"];
const WOMEN_TOP_TYPES = [
  "T-Shirt",
  "Tank Top",
  "Hoodie",
  "Long Sleeve",
  "Sweatshirt",
];

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openSection, setOpenSection] = useState<"Men" | "Women" | null>(null);

  const cartItems: CartItem[] = useSelector((reduxState: RootState) => {
    return reduxState.cart.cartItems;
  });

  const handleCartClick = () => {
    navigate("/cart");
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  const toggleMenu = () => {
    setIsMenuOpen((previous) => !previous);
  };

  const toggleSection = (section: "Men" | "Women") => {
    setOpenSection((previous) => (previous === section ? null : section));
  };

  const navigateToSearchWithFilters = (gender: "Men" | "Women", type: string) => {
    const query = new URLSearchParams({ gender, type });
    navigate(`/search?${query.toString()}`);
    setIsMenuOpen(false);
  };

  const handleAboutClick = () => {
    navigate("/about");
    setIsMenuOpen(false);
  };

  const handleAdminClick = () => {
    navigate("/admin");
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-black text-white shadow-lg">
      <div className="container mx-auto flex justify-between items-center p-4">
        <div className="flex items-center">
          <button
            className="mr-3 rounded border border-white/40 p-1 hover:bg-white/15 transition-colors"
            onClick={toggleMenu}
            type="button"
            aria-label="Open navigation menu"
          >
            <MenuIcon className="h-6 w-6 text-white" />
          </button>
          <img
            src="/images/logo.png"
            alt="Logo"
            className="h-10 w-auto mr-2 cursor-pointer"
            onClick={handleLogoClick}
          />
        </div>

        <div className="ml-auto flex items-center">
          <div className="relative mr-4 cursor-pointer" onClick={handleLoginClick}>
            <PersonIcon className="h-8 w-8 text-white" />
          </div>

          <div className="relative cursor-pointer" onClick={handleCartClick}>
            <ShoppingCartIcon className="h-8 w-8 text-white" />
            {cartItems.length > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                {cartItems.length}
              </span>
            )}
          </div>
        </div>
      </div>
      <Drawer open={isMenuOpen} onClose={toggleMenu} className="bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Shop</h3>
          <button
            onClick={toggleMenu}
            type="button"
            className="rounded border border-gray-300 p-1 text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Close navigation menu"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="border-b border-gray-200 pb-3">
            <button
              type="button"
              onClick={() => toggleSection("Men")}
              className="flex w-full items-center justify-between text-left text-sm font-semibold text-gray-900"
            >
              Men
              {openSection === "Men" ? (
                <ExpandLessIcon className="h-5 w-5 text-gray-500" />
              ) : (
                <ExpandMoreIcon className="h-5 w-5 text-gray-500" />
              )}
            </button>
            {openSection === "Men" && (
              <div className="mt-2 space-y-1">
                {MEN_TOP_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => navigateToSearchWithFilters("Men", type)}
                    className="block w-full rounded px-2 py-1 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="border-b border-gray-200 pb-3">
            <button
              type="button"
              onClick={() => toggleSection("Women")}
              className="flex w-full items-center justify-between text-left text-sm font-semibold text-gray-900"
            >
              Women
              {openSection === "Women" ? (
                <ExpandLessIcon className="h-5 w-5 text-gray-500" />
              ) : (
                <ExpandMoreIcon className="h-5 w-5 text-gray-500" />
              )}
            </button>
            {openSection === "Women" && (
              <div className="mt-2 space-y-1">
                {WOMEN_TOP_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => navigateToSearchWithFilters("Women", type)}
                    className="block w-full rounded px-2 py-1 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1 pt-1">
            <button
              type="button"
              onClick={handleAboutClick}
              className="block w-full text-left text-xs text-gray-500 hover:text-gray-700"
            >
              About Us
            </button>
            <button
              type="button"
              onClick={handleAdminClick}
              className="block w-full text-left text-xs text-gray-500 hover:text-gray-700"
            >
              Admin
            </button>
          </div>
        </div>
      </Drawer>
    </header>
  );
};

export default Header;
