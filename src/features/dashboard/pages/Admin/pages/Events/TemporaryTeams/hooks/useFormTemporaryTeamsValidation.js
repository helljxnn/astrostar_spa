"use client"

import { useState } from "react"

// Funciones auxiliares de validación
const hasDoubleSpaces = (value) => /\s{2,}/.test(value)
const isOnlyLetters = (value) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)
const cleanPhone = (phone) => phone.replace(/[\s\-\(\)]/g, "")

const validatePhone = (value) => {
  if (!value?.trim()) return "El número telefónico es obligatorio"
  const phone = cleanPhone(value)

  // Validación para números con código de país
  if (phone.startsWith("+57") || phone.startsWith("57")) {
    const local = phone.replace(/^(\+57|57)/, "")
    if ((local.length === 10 && /^3/.test(local)) || (local.length === 7 && /^[2-8]/.test(local))) return ""
    return "Número inválido. Celular: 3XXXXXXXXX, Fijo: 2XXXXXXX-8XXXXXXX"
  }

  // Validar que solo contenga números
  if (!/^\d+$/.test(phone)) return "El teléfono solo puede contener números"

  // Validar formato correcto
  if ((phone.length === 10 && /^3/.test(phone)) || (phone.length === 7 && /^[2-8]/.test(phone))) return ""

  // Mensajes de error específicos
  if (phone.length < 7) return "El número debe tener al menos 7 dígitos"
  if (phone.length > 10) return "Número demasiado largo. Máximo 10 dígitos para celular"
  if (phone.length === 10 && !/^3/.test(phone)) return "Los números celulares deben iniciar con 3"
  if (phone.length === 7 && !/^[2-8]/.test(phone)) return "Los números fijos deben iniciar con 2-8"
  if ([8, 9].includes(phone.length)) return "Longitud inválida. Use 7 dígitos (fijo) o 10 dígitos (celular)"

  return "Formato de teléfono inválido"
}

// Función de validación para categoría
const validateCategoria = (value, teamType) => {
  if (teamType === "temporal") {
    if (!value?.trim()) return "La categoría es obligatoria para equipos temporales"
    if (value.trim().length < 2) return "La categoría debe tener al menos 2 caracteres"
    if (value.trim().length > 50) return "La categoría no puede exceder 50 caracteres"
    if (hasDoubleSpaces(value)) return "No se permiten espacios dobles"
  }
  return ""
}

// Hook optimizado
export const useFormTemporaryTeamsValidation = (initialValues, validationRules) => {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const validateField = (name, value) => {
    const rules = validationRules[name]
    if (!rules) return ""
    for (const rule of rules) {
      const error = rule(value, values)
      if (error) return error
    }
    return ""
  }

  const validateAllFields = () => {
    const newErrors = {}
    Object.keys(validationRules).forEach((name) => {
      const error = validateField(name, values[name])
      if (error) newErrors[name] = error
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (nameOrEvent, value) => {
    const { name, val } =
      typeof nameOrEvent === "string"
        ? { name: nameOrEvent, val: value }
        : { name: nameOrEvent.target.name, val: nameOrEvent.target.value }

    setValues((prev) => ({ ...prev, [name]: val }))

    if (touched[name]) {
      const error = validateField(name, val)
      setErrors((prev) => ({ ...prev, [name]: error }))
    }
  }

  const handleBlur = (nameOrEvent) => {
    const name = typeof nameOrEvent === "string" ? nameOrEvent : nameOrEvent?.target?.name
    if (!name) return

    setTouched((prev) => ({ ...prev, [name]: true }))
    const error = validateField(name, values[name])
    setErrors((prev) => ({ ...prev, [name]: error }))
  }

  const resetForm = () => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAllFields,
    setValues,
    setErrors,
    setTouched,
    resetForm,
  }
}

export const temporaryTeamsValidationRules = {
  nombreEquipo: [
    (v) => (!v?.trim() ? "El nombre del equipo es obligatorio" : ""),
    (v) => (v?.trim().length < 3 ? "El nombre debe tener al menos 3 caracteres" : ""),
    (v) => (v?.trim().length > 100 ? "El nombre no puede exceder 100 caracteres" : ""),
    (v) => (hasDoubleSpaces(v) ? "No se permiten espacios dobles" : ""),
  ],
  telefono: [validatePhone],
  entrenador: [(v) => (!v ? "Debe seleccionar un entrenador" : "")],
  deportistas: [(v) => (!v || v.length === 0 ? "Debe seleccionar al menos una deportista" : "")],
  estado: [(v) => (!v ? "Debe seleccionar un estado" : "")],
  categoria: [
    // La categoría es obligatoria solo para equipos temporales
    (v, values) => {
      // Esta validación se maneja en el componente principal basado en teamType
      return ""
    }
  ],
  descripcion: [
    (v) => (!v?.trim() ? "" : v.trim().length > 500 ? "La descripción no puede exceder 500 caracteres" : ""),
    (v) => (!v?.trim() ? "" : hasDoubleSpaces(v) ? "No se permiten espacios dobles" : ""),
  ],
}