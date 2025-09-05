import React from "react";
import Thead from "./thead";
import Tbody from "./tbody";

const Table = ({
    thead = {
        cols: 0,
        width: "",
        height: "",
        titles: [],
        state: false,
        permissions: []

    },
    tbody = {
        maxRows: 0,
        data,
        state: false
    }
}) => {
    return (
        <table id="table" className={`w-full h-auto table-fixed`}>
            <Thead options={{ thead }} />
            <Tbody options={{ tbody }} />
        </table>
    );
}

export default Table;