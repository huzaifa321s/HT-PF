import React from "react";
import { Text } from "@react-pdf/renderer";
import { useDispatch } from "react-redux";
import { setOffset } from "./pdfNavigationSlice";

const PdfTracker = ({ section }) => {
    const dispatch = useDispatch();

    return (
        <Text
            fixed
            style={{ fontSize: 0, height: 0, width: 0, opacity: 0 }}
            render={({ pageNumber }) => {
                // Dispatch asynchronously to avoid "cannot update while rendering" error
                setTimeout(() => {
                    dispatch(setOffset({ section, offset: pageNumber }));
                }, 0);
                return "";
            }}
        />
    );
};

export default PdfTracker;
