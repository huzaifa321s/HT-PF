import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";


import CustomHeaderFooter from "../CustomHeaderFooter";

const BlankPage = ({
  mode = "dev",
  selectedFont = "'Poppins', sans-serif",
  selectedLayout = {},
  pageId,
}) => {


  return (
    <CustomHeaderFooter>

    </CustomHeaderFooter>
  );
};

export default BlankPage;
