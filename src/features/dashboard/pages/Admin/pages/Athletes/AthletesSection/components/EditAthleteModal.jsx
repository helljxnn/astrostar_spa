// // src/features/dashboard/pages/Admin/pages/Athletes/EditAthleteForm.jsx
// import React, { useEffect } from "react";
// import { motion } from "framer-motion";
// import { FormField } from "../../../../../../../../shared/components/FormField";
// import { showSuccessAlert, showConfirmAlert, showErrorAlert } from "../../../../../../../../shared/utils/alerts";
// import { useFormAthleteValidation } from "../hooks/useFormAthleteValidation";

// const documentTypes = [
//   { value: "cedula", label: "Cédula de Ciudadanía" },
//   { value: "tarjeta_identidad", label: "Tarjeta de Identidad" },
//   { value: "cedula_extranjeria", label: "Cédula de Extranjería" },
//   { value: "pasaporte", label: "Pasaporte" },
// ];

// const categoryOptions = [
//   { value: "infantil", label: "Infantil (12-14 años)" },
//   { value: "juvenil", label: "Juvenil (15-17 años)" },
//   { value: "junior", label: "Junior (18-20 años)" },
//   { value: "senior", label: "Senior (21-35 años)" },
//   { value: "master", label: "Máster (36+ años)" },
//   { value: "profesional", label: "Profesional" },
//   { value: "elite", label: "Elite" },
// ];

// const states = [
//   { value: "Activo", label: "Activo" },
//   { value: "Inactivo", label: "Inactivo" },
//   { value: "Lesionado", label: "Lesionado" },
//   { value: "Suspendido", label: "Suspendido" },
// ];

// const sportsOptions = [
//   { value: "acuaticos", label: "Acuáticos" },
//   { value: "atletismo", label: "Atletismo" },
//   { value: "futbol", label: "Fútbol" },
//   // ...agrega los demás deportes
// ];

// const EditAthleteForm = ({ athleteToEdit, onUpdate, onClose }) => {
//   const {
//     values,
//     errors,
//     touched,
//     handleChange,
//     handleBlur,
//     validateAllFields,
//     resetForm,
//     setValues,
//     setTouched,
//   } = useFormAthleteValidation(
//     {
//       nombres: "",
//       tipoDocumento: "",
//       numeroDocumento: "",
//       correo: "",
//       telefono: "",
//       edad: "",
//       fechaNacimiento: "",
//       categoria: "",
//       estado: "",
//       deportes: "",
//     },
//     {} // aquí puedes usar tus reglas de validación existentes
//   );

//   useEffect(() => {
//     if (athleteToEdit) {
//       setValues({
//         nombres: athleteToEdit.nombres || "",
//         tipoDocumento: athleteToEdit.tipoDocumento || "",
//         numeroDocumento: athleteToEdit.numeroDocumento || "",
//         correo: athleteToEdit.correo || "",
//         telefono: athleteToEdit.telefono || "",
//         edad: athleteToEdit.edad || "",
//         fechaNacimiento: athleteToEdit.fechaNacimiento || "",
//         categoria: athleteToEdit.categoria || "",
//         estado: athleteToEdit.estado || "Activo",
//         deportes: athleteToEdit.deportes || "",
//       });
//     }
//   }, [athleteToEdit, setValues]);

//   const formatPhoneNumber = (phone) => {
//     if (!phone) return phone;
//     const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
//     if (cleanPhone.startsWith("+57") || cleanPhone.startsWith("57")) return phone;
//     if (/^\d{7,10}$/.test(cleanPhone)) return `+57 ${cleanPhone}`;
//     return phone;
//   };

//   const handleSubmit = async () => {
//     // Marcar todos los campos como tocados
//     const allTouched = Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {});
//     setTouched(allTouched);

//     if (!validateAllFields()) {
//       return showErrorAlert("Campos incompletos", "Por favor completa todos los campos correctamente.");
//     }

//     const confirmResult = await showConfirmAlert(
//       "¿Actualizar deportista?",
//       `¿Deseas actualizar la información de ${athleteToEdit.nombres}?`,
//       { confirmButtonText: "Sí, actualizar", cancelButtonText: "Cancelar" }
//     );

//     if (!confirmResult.isConfirmed) return;

//     try {
//       await onUpdate({ ...values, id: athleteToEdit.id, telefono: formatPhoneNumber(values.telefono) });
//       showSuccessAlert("Deportista actualizado", `${values.nombres} ha sido actualizado correctamente.`);
//       resetForm();
//       onClose();
//     } catch (error) {
//       showErrorAlert("Error", error.message || "No se pudo actualizar el deportista.");
//     }
//   };

//   if (!athleteToEdit) return null;

//   return (
//     <motion.div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
//       <motion.div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-2xl font-bold text-center flex-1">Editar Deportista</h2>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
//         </div>

//         <div className="space-y-4">
//           <FormField label="Nombre" name="nombres" value={values.nombres} onChange={handleChange} onBlur={handleBlur} error={errors.nombres} touched={touched.nombres} />
//           <FormField label="Tipo de Documento" name="tipoDocumento" type="select" options={documentTypes} value={values.tipoDocumento} onChange={handleChange} onBlur={handleBlur} error={errors.tipoDocumento} touched={touched.tipoDocumento} />
//           <FormField label="Identificación" name="numeroDocumento" value={values.numeroDocumento} onChange={handleChange} onBlur={handleBlur} error={errors.numeroDocumento} touched={touched.numeroDocumento} />
//           <FormField label="Correo" name="correo" type="email" value={values.correo} onChange={handleChange} onBlur={handleBlur} error={errors.correo} touched={touched.correo} />
//           <FormField label="Teléfono" name="telefono" value={values.telefono} onChange={handleChange} onBlur={handleBlur} error={errors.telefono} touched={touched.telefono} />
//           <FormField label="Edad" name="edad" type="number" value={values.edad} onChange={handleChange} onBlur={handleBlur} error={errors.edad} touched={touched.edad} />
//           <FormField label="Fecha de Nacimiento" name="fechaNacimiento" type="date" value={values.fechaNacimiento} onChange={handleChange} onBlur={handleBlur} error={errors.fechaNacimiento} touched={touched.fechaNacimiento} />
//           <FormField label="Categoría" name="categoria" type="select" options={categoryOptions} value={values.categoria} onChange={handleChange} onBlur={handleBlur} error={errors.categoria} touched={touched.categoria} />
//           <FormField label="Estado" name="estado" type="select" options={states} value={values.estado} onChange={handleChange} onBlur={handleBlur} error={errors.estado} touched={touched.estado} />
//           <FormField label="Deporte" name="deportes" type="select" options={sportsOptions} value={values.deportes} onChange={handleChange} onBlur={handleBlur} error={errors.deportes} touched={touched.deportes} />
//         </div>

//         <div className="flex justify-end gap-4 mt-6">
//           <button onClick={onClose} className="px-4 py-2 border rounded-lg">Cancelar</button>
//           <button onClick={handleSubmit} className="px-4 py-2 bg-primary-blue text-white rounded-lg">Actualizar</button>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// };

// export default EditAthleteForm;
