// src/App.tsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Home from '../home/Home.tsx';
import Search from '../search/Search.tsx';
import View from '../view/View.tsx';
import Header from './Header.tsx';
import { addItems } from '../../store/item.store.ts';
import api from '../../api/index.ts';
import Item from '../../models/item.model.ts';

const App: React.FC = () => {
    const dispatch = useDispatch();
    const loadData = async () => {
        const items: Item[] = await api.item.getItems();
        dispatch(addItems(items));
    }

    useEffect(() => {
        loadData();
    }, []);

    return (
        <>
            <Header></Header>
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/item/:id" element={<View />} />
                </Routes>
            </Router>
        </>
    );
};

export default App;

