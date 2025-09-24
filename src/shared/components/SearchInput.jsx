import React from 'react';
import { IoSearch } from 'react-icons/io5';

const SearchInput = ({ value, onChange, placeholder = 'Buscar...', className = '' }) => {
  return (
    <div className={`px-3 py-2 rounded-lg flex flex-row gap-2 items-center bg-gray-200 ${className}`}>
      <IoSearch size={20} color="gray" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="bg-transparent outline-none border-none w-full"
        aria-label="Campo de búsqueda"
      />
    </div>
  );
};

export default SearchInput;
