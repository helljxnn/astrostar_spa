// import React from "react";
// import { motion } from "framer-motion";
// import { FormField } from "../../../../../../../../shared/components/FormField";
// import {
//   showSuccessAlert,
//   showErrorAlert,
// } from "../../../../../../../../shared/utils/alerts";
// import {
//   useFormAthleteValidation,
//   athleteValidationRules,
// } from "../hooks/useFormAthleteValidation";

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

// const sportsOptions = [
//   { value: "acuaticos", label: "Acuáticos" },
//   { value: "atletismo", label: "Atletismo" },
//   { value: "badminton", label: "Bádminton" },
//   { value: "baloncesto", label: "Baloncesto" },
//   { value: "beisbol", label: "Béisbol" },
//   { value: "billar", label: "Billar" },
//   { value: "boxeo", label: "Boxeo" },
//   { value: "ciclismo", label: "Ciclismo" },
//   { value: "esgrima", label: "Esgrima" },
//   { value: "futbol", label: "Fútbol" },
//   { value: "gimnasia", label: "Gimnasia" },
//   { value: "golf", label: "Golf" },
//   { value: "halterofilia", label: "Halterofilia" },
//   { value: "judo", label: "Judo" },
//   { value: "karate", label: "Karate" },
//   { value: "lucha", label: "Lucha" },
//   { value: "natacion", label: "Natación" },
//   { value: "patinaje", label: "Patinaje" },
//   { value: "remo", label: "Remo" },
//   { value: "softbol", label: "Softbol" },
//   { value: "taekwondo", label: "Taekwondo" },
//   { value: "tenis", label: "Tenis" },
//   { value: "tenis_mesa", label: "Tenis de Mesa" },
//   { value: "triathlon", label: "Triatlón" },
//   { value: "voleibol", label: "Voleibol" },
// ];

// const CreateAthleteModal = ({ isOpen, onClose, onSave }) => {
//   const {
//     values,
//     errors,
//     touched,
//     handleChange,
//     handleBlur,
//     validateAllFields,
//     resetForm,
//     setTouched,
//   } = useFormAthleteValidation(
//     {
//       nombres: "",
//       apellidos: "",
//       tipoDocumento: "cedula",
//       numeroDocumento: "",
//       fechaNacimiento: "",
//       correo: "",
//       telefono: "",
//       deportePrincipal: "",
//       categoria: "",
//     },
//     athleteValidationRules
//   );

//   const formatPhoneNumber = (phone) => {
//     if (!phone) return phone;
//     const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
//     if (cleanPhone.startsWith("+57") || cleanPhone.startsWith("57")) return phone;
//     if (/^\d{7,10}$/.test(cleanPhone)) return `+57 ${cleanPhone}`;
//     return phone;
//   };

//   const calculateAge = (birthDate) => {
//     const today = new Date();
//     const birth = new Date(birthDate);
//     let age = today.getFullYear() - birth.getFullYear();
//     const monthDiff = today.getMonth() - birth.getMonth();

//     if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
//       age--;
//     }
//     return age;
//   };

//   const handleSubmit = async () => {
//     // 1. Marcar todos los campos como tocados
//     const allTouched = {};
//     Object.keys(athleteValidationRules).forEach((field) => {
//       allTouched[field] = true;
//     });
//     setTouched(allTouched);

//     // 2. Validar todos los campos
//     if (!validateAllFields()) {
//       showErrorAlert(
//         "Campos incompletos",
//         "Por favor completa todos los campos correctamente antes de continuar."
//       );
//       return;
//     }

//     try {
//       const athleteData = {
//         ...values,
//         telefono: formatPhoneNumber(values.telefono),
//         edad: calculateAge(values.fechaNacimiento),
//         estado: "Activo", // Estado por defecto para nuevos deportistas
//       };

//       await onSave(athleteData);
//       showSuccessAlert(
//         "Deportista creado",
//         "El deportista ha sido creado exitosamente."
//       );

//       resetForm();
//       onClose();
//     } catch (error) {
//       console.error("Error al crear deportista:", error);
//       showErrorAlert(
//         "Error",
//         error.message || "Ocurrió un error al crear el deportista"
//       );
//     }
//   };

//   // Función para cerrar el modal y resetear el formulario
//   const handleClose = () => {
//     resetForm();
//     onClose();
//   };

//   if (!isOpen) return null;

//   return (
//     <motion.div
//       className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//     >
//       <motion.div
//         className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"
//         initial={{ scale: 0.8, opacity: 0, y: 50 }}
//         animate={{ scale: 1, opacity: 1, y: 0 }}
//         exit={{ scale: 0.8, opacity: 0, y: 50 }}
//         transition={{ type: "spring", damping: 25, stiffness: 300 }}
//       >
//         {/* Header */}
//         <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-6 z-10">
//           <button
//             className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
//             onClick={handleClose}
//           >
//             ✕
//           </button>
//           <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
//             Crear Deportista
//           </h2>
//         </div>

//         {/* Body */}
//         <div className="p-6 space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <FormField
//               label="Nombres"
//               name="nombres"
//               type="text"
//               placeholder="Nombres del deportista"
//               value={values.nombres}
//               onChange={handleChange}
//               onBlur={handleBlur}
//               error={errors.nombres}
//               touched={touched.nombres}
//               delay={0.1}
//               required
//             />

//             <FormField
//               label="Apellidos"
//               name="apellidos"
//               type="text"
//               placeholder="Apellidos del deportista"
//               value={values.apellidos}
//               onChange={handleChange}
//               onBlur={handleBlur}
//               error={errors.apellidos}
//               touched={touched.apellidos}
//               delay={0.15}
//               required
//             />

//             <FormField
//               label="Tipo de Documento"
//               name="tipoDocumento"
//               type="select"
//               placeholder="Seleccionar tipo de documento"
//               options={documentTypes}
//               value={values.tipoDocumento}
//               onChange={handleChange}
//               onBlur={handleBlur}
//               error={errors.tipoDocumento}
//               touched={touched.tipoDocumento}
//               delay={0.2}
//               required
//             />

//             <FormField
//               label="Número de Documento"
//               name="numeroDocumento"
//               type="text"
//               placeholder="Número de identificación"
//               value={values.numeroDocumento}
//               onChange={handleChange}
//               onBlur={handleBlur}
//               error={errors.numeroDocumento}
//               touched={touched.numeroDocumento}
//               delay={0.25}
//               required
//             />

//             <FormField
//               label="Fecha de Nacimiento"
//               name="fechaNacimiento"
//               type="date"
//               placeholder="Fecha de nacimiento"
//               value={values.fechaNacimiento}
//               onChange={handleChange}
//               onBlur={handleBlur}
//               error={errors.fechaNacimiento}
//               touched={touched.fechaNacimiento}
//               delay={0.3}
//               required
//             />

//             <FormField
//               label="Correo Electrónico"
//               name="correo"
//               type="email"
//               placeholder="correo@ejemplo.com"
//               value={values.correo}
//               onChange={handleChange}
//               onBlur={handleBlur}
//               error={errors.correo}
//               touched={touched.correo}
//               delay={0.35}
//               required
//             />

//             <FormField
//               label="Número Telefónico"
//               name="telefono"
//               type="text"
//               placeholder="3001234567 o 6012345678"
//               value={values.telefono}
//               onChange={handleChange}
//               onBlur={handleBlur}
//               error={errors.telefono}
//               touched={touched.telefono}
//               delay={0.4}
//               required
//             />

//             <FormField
//               label="Deporte Principal"
//               name="deportePrincipal"
//               type="select"
//               placeholder="Seleccionar deporte"
//               options={sportsOptions}
//               value={values.deportePrincipal}
//               onChange={handleChange}
//               onBlur={handleBlur}
//               error={errors.deportePrincipal}
//               touched={touched.deportePrincipal}
//               delay={0.45}
//               required
//             />

//             <div className="md:col-span-2">
//               <FormField
//                 label="Categoría Deportiva"
//                 name="categoria"
//                 type="select"
//                 placeholder="Seleccionar categoría"
//                 options={categoryOptions}
//                 value={values.categoria}
//                 onChange={handleChange}
//                 onBlur={handleBlur}
//                 error={errors.categoria}
//                 touched={touched.categoria}
//                 delay={0.5}
//                 required
//               />
//             </div>
//           </div>

//           {/* Footer */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.6 }}
//             className="flex justify-between pt-6 border-t border-gray-200"
//           >
//             <motion.button
//               type="button"
//               onClick={handleClose}
//               className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//             >
//               Cancelar
//             </motion.button>

//             <motion.button
//               onClick={handleSubmit}
//               className="px-8 py-3 text-white rounded-xl transition-all duration-200 font-medium shadow-lg bg-gradient-to-r from-primary-purple to-primary-blue hover:from-primary-purple hover:to-primary-blue"
//               whileHover={{
//                 scale: 1.02,
//                 boxShadow: "0 10px 25px rgba(139, 92, 246, 0.3)",
//               }}
//               whileTap={{ scale: 0.98 }}
//             >
//               Crear Deportista
//             </motion.button>
//           </motion.div>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// };

// export default CreateAthleteModal;