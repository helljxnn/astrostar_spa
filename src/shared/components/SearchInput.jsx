import React from 'react';
import { IoSearch } from 'react-icons/io5';

/**
 * Componente de búsqueda reutilizable con un ícono.
 *
 * @param {object} props - Propiedades del componente.
 * @param {string} props.value - El valor actual del campo de búsqueda.
 * @param {function} props.onChange - Función que se ejecuta cuando el valor cambia.
 * @param {string} [props.placeholder='Buscar...'] - El texto del placeholder.
 * @param {string} [props.className=''] - Clases CSS adicionales para el contenedor.
 */
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