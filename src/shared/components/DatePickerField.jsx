import React from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import es from 'date-fns/locale/es';
import 'react-datepicker/dist/react-datepicker.css';
import './DatePickerField.css';

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
 * @param {function} props.filterTime - Función para deshabilitar horas específicas.
 * @param {string} props.minTime - Hora mínima seleccionable.
 * @param {string} props.maxTime - Hora máxima seleccionable.
 * @param {number} props.timeIntervals - Intervalos de tiempo en minutos.
 * @param {boolean} props.disabled - Si el campo está deshabilitado.
 * @param {string} props.error - Mensaje de error a mostrar.
 * @param {Date} props.minDate - Fecha mínima seleccionable.
 * @param {string} props.placeholder - Texto placeholder.
 */
export const DatePickerField = ({
    label,
    selected,
    onChange,
    filterDate,
    includeTimes,
    filterTime,
    minTime,
    maxTime,
    timeIntervals = 30,
    disabled,
    error,
    required,
    minDate,
    placeholder
}) => {
    return (
        <div className="w-full relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <DatePicker
                selected={selected}
                onChange={onChange}
                filterDate={filterDate}
                includeTimes={includeTimes}
                filterTime={filterTime}
                minDate={minDate || new Date()}
                minTime={minTime ? new Date(`1970-01-01T${minTime}`) : null}
                maxTime={maxTime ? new Date(`1970-01-01T${maxTime}`) : null}
                timeIntervals={timeIntervals}
                dateFormat="EEEE, d 'de' MMMM 'de' yyyy h:mm aa"
                className={`w-full px-3 py-2 bg-white border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple disabled:bg-gray-100 disabled:cursor-not-allowed`}
                disabled={disabled}
                locale="es"
                showTimeSelect
                placeholderText={placeholder || "Seleccione fecha y hora"}
                popperClassName="datepicker-popper-high-z"
                popperPlacement="bottom-start"
                popperModifiers={[
                    {
                        name: 'offset',
                        options: {
                            offset: [0, 8],
                        },
                    },
                    {
                        name: 'preventOverflow',
                        options: {
                            rootBoundary: 'viewport',
                            tether: false,
                            altAxis: true,
                        },
                    },
                ]}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
};

