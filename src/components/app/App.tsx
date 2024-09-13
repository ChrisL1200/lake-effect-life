// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import Home from '../home/Home.tsx';
import Search from '../search/Search.tsx';
import Item from '../item/Item.tsx';
import Header from './Header.tsx';
import { store } from '../../store';

const App: React.FC = () => {
    return (
        <Provider store={store}>
            <Header></Header>
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/item/:id" element={<Item />} />
                </Routes>
            </Router>
        </Provider>
    );
};

export default App;

