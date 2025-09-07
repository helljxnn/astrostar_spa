// Table.jsx
import React from "react";
import Thead from "./Thead";
import Tbody from "./Tbody";

const Table = ({ thead, tbody }) => {
  return (
    <div className="overflow-x-auto shadow-lg rounded-2xl bg-white">
      <table
        id="table"
        className="w-full border-collapse text-sm font-questrial"
      >
        <Thead options={{ thead }} />
        <Tbody options={{ tbody }} />
      </table>
    </div>
  );
};

export default Table;
