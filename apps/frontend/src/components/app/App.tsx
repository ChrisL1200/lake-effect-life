// src/App.tsx
import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useDispatch } from "react-redux";
import Home from "../home/Home.tsx";
import Search from "../search/Search.tsx";
import View from "../view/View.tsx";
import Header from "./Header.tsx";
import { addGroupedItems } from "../../store/item.store.ts";
import api from "../../api/index.ts";
import Cart from "../cart/Cart.tsx";
import Checkout from "../checkout/Checkout.tsx";
import Login from "../login/Login.tsx";
import Admin from "../admin/Admin.tsx";
import AdminInventoryEditor from "../admin/AdminInventoryEditor.tsx";
import GroupedItem from "../../models/groupedItem.model.ts";
import About from "../about/About.tsx";
import AdminTransactions from "../admin/AdminTransactions.tsx";

const App: React.FC = () => {
  const dispatch = useDispatch();
  const loadData = async () => {
    const groupedItems: GroupedItem[] = await api.item.getGroupedItems();
    dispatch(addGroupedItems(groupedItems));
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <>
      <Router>
        <Header></Header>
        <div className="container mx-auto w-full p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/item/:id" element={<View />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/about" element={<About />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/transactions" element={<AdminTransactions />} />
            <Route path="/admin/new" element={<AdminInventoryEditor />} />
            <Route path="/admin/:id/edit" element={<AdminInventoryEditor />} />
          </Routes>
        </div>
      </Router>
    </>
  );
};

export default App;
