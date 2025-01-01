import React from 'react'
import { Route, Routes } from "react-router-dom";
import WeddingAllservice from '../components/weddigservice/allservice';
import WeddingServiceDetails from '../components/weddigservice/servicedetails';

function Wedding() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<WeddingAllservice />} />
        <Route path="/:id" element={<WeddingServiceDetails />} />
      </Routes>
    </div>
  )
}

export default Wedding