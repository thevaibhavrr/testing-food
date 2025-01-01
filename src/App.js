import { Route, Routes } from "react-router-dom";

import "./App.css";
import CartPage from "./components/weddigservice/CartPage";
import CategoryPage from "./components/weddigservice/servicedetails";
import AllServicesPage from "./components/weddigservice/allservice"
import Subcatogayall from "./components/weddigservice/subcatogey";
function App() {
  return (
    <div className="App">
      <Routes>
      <Route path="/" element={<AllServicesPage />} />

        <Route path="/d/:subcategory" element={<CategoryPage />} />
        <Route path="/category/:category" element={<Subcatogayall />} />

        <Route path="/cart" element={<CartPage />} />
      </Routes>
    </div>
  );
}

export default App;
