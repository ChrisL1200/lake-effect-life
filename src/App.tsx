// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import Home from './components/home/home.tsx';
import Search from './components/search/search.tsx';
import Item from './components/item/item.tsx';
import { store } from './store/store';

const App: React.FC = () => {
    return (
        <Provider store={store}>
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

