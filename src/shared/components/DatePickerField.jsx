import React from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import es from 'date-fns/locale/es';
import 'react-datepicker/dist/react-datepicker.css';

// Registrar el idioma español para el calendario
registerLocale('es', es);

/**
 * Componente de campo de fecha con react-datepicker.
 *
 * @param {object} props - Propiedades del componente.
 * @param {string} props.label - Etiqueta del campo.
 * @param {Date} props.selected - La fecha seleccionada.
 * @param {function} props.onChange - Función que se ejecuta al cambiar la fecha.
 * @param {function} props.filterDate - Función para deshabilitar fechas.
 * @param {Date[]} props.includeTimes - Array de horas a incluir.
 * @param {string} props.minTime - Hora mínima seleccionable.
 * @param {string} props.maxTime - Hora máxima seleccionable.
 * @param {boolean} props.disabled - Si el campo está deshabilitado.
 * @param {string} props.error - Mensaje de error a mostrar.
 */
export const DatePickerField = ({ label, selected, onChange, filterDate, includeTimes, minTime, maxTime, disabled, error, required }) => {
    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <DatePicker
                selected={selected}
                onChange={onChange}
                filterDate={filterDate}
                includeTimes={includeTimes}
                minTime={minTime ? new Date(`1970-01-01T${minTime}`) : null}
                maxTime={maxTime ? new Date(`1970-01-01T${maxTime}`) : null}
                dateFormat="dd/MM/yyyy h:mm aa"
                className={`w-full px-3 py-2 bg-white border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple disabled:bg-gray-100 disabled:cursor-not-allowed`}
                disabled={disabled}
                locale="es"
                showTimeSelect
                placeholderText="Seleccione fecha y hora"
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
};