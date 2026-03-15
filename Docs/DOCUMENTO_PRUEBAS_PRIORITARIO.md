# DOCUMENTO DE PRUEBAS MANUALES - VERSIÓN PRIORITARIA

**Proyecto:** Sistema de Gestión - Fundación  
**Fecha:** 2026-03-02  
**Versión:** 1.0 - Casos Prioritarios  
**Total de casos:** 25 casos funcionales + 15 no funcionales

---

## 01. INVENTARIO DE MÓDULOS

| Módulo | URL/Ruta | Acción crítica | Descripción breve | Riesgo (Alto/Medio/Bajo) | ¿Crítico? (Sí/No) |
|--------|----------|----------------|-------------------|--------------------------|-------------------|
| Login | /login | Ingresar | Autenticación de usuarios | Alto | Sí |
| Usuarios | /dashboard/users | Listar | Gestión de usuarios del sistema | Medio | Sí |
| Categorías de Materiales | /dashboard/material-categories | Crear | Categorías para clasificar materiales | Medio | Sí |
| Gestión de Materiales | /dashboard/materials | Crear | Registro y control de inventario | Alto | Sí |
| Movimientos de Materiales | /dashboard/materials-movements | Registrar | Ingresos y salidas de materiales | Alto | Sí |
| Proveedores | /dashboard/providers | Crear | Gestión de proveedores | Medio | Sí |
| Gestión de Matrículas | /dashboard/enrollments | Matricular | Matrículas e inscripciones de deportistas | Alto | Sí |
| Gestión de Deportistas | /dashboard/athletes | Crear | Registro de deportistas | Alto | Sí |
| Equipos Temporales | /dashboard/temporary-teams | Crear | Equipos para eventos | Medio | No |

---

## 02. CASOS FUNCIONALES (25 CASOS PRIORITARIOS)

| Ruta | Tipo | Objetivo | Precondiciones | Datos de prueba | Pasos (numerados) | Resultado esperado | Prioridad | Severidad |
|------|------|----------|----------------|-----------------|-------------------|-------------------|-----------|-----------|
| /login | Feliz | Login con credenciales válidas | Usuario existe | correo válido + contraseña válida | 1) Ir a /login 2) Ingresar correo 3) Ingresar contraseña 4) Click 'Ingresar' | Accede al sistema y redirige a inicio | P1 | Alta |
| /login | Feliz | Bloquear contraseña incorrecta | Usuario existe | correo válido + contraseña incorrecta | 1) Ir a /login 2) Correo válido 3) Contraseña incorrecta 4) Ingresar | No accede; mensaje genérico | P1 | Media |
| /logout | Feliz | Cerrar sesión | Usuario logueado | - | 1) Estar logueado 2) Click Salir 3) Verificar redirección | Cierra sesión y redirige a login | P1 | Alta |
| / | Feliz | Back después de logout | Usuario hizo logout | - | 1) Logout 2) Back 3) Navegar a página protegida | No debe mostrar contenido protegido | P1 | Alta |
| /dashboard/users | Feliz | Listar usuarios y usar buscador | Usuario autenticado. Existen usuarios | Buscar por: identificación o nombre | 1) Ir a /dashboard/users 2) Verificar listado con columnas (Nombre, Correo, Identificación, Rol, Teléfono) 3) Ingresar identificación en buscador 4) Verificar filtrado 5) Limpiar y buscar por nombre | Listado carga correctamente. Buscador filtra sin duplicar datos | P1 | Alta |
| /dashboard/material-categories | Feliz | Listar categorías y usar buscador | Usuario autenticado. Existen categorías | Buscar por: nombre de categoría | 1) Ir a /dashboard/material-categories 2) Verificar listado con columnas (Nombre, Descripción, Estado, Acciones) 3) Ingresar término en buscador 4) Verificar filtrado 5) Limpiar búsqueda | Listado carga correctamente. Buscador filtra sin duplicar datos | P1 | Alta |
| /dashboard/material-categories | Feliz | Crear categoría con datos válidos | Usuario autenticado con permisos Crear | Nombre: "Balones" Descripción: "Balones deportivos" | 1) Ir a /dashboard/material-categories 2) Click 'Crear' 3) Ingresar Nombre y Descripción 4) Click 'Guardar' 5) Verificar en listado | Muestra confirmación. Categoría aparece en listado | P1 | Alta |
| /dashboard/material-categories | Negativa | Evitar nombre duplicado en categoría | Existe categoría con mismo nombre | Nombre: "Balones" (ya existe) | 1) Ir a /dashboard/material-categories 2) Click 'Crear' 3) Ingresar nombre existente 4) Click 'Guardar' | NO guarda. Muestra mensaje de validación | P2 | Media |
| /dashboard/materials | Feliz | Listar materiales y usar buscador | Usuario autenticado. Existen materiales | Buscar por: nombre o categoría | 1) Ir a /dashboard/materials 2) Verificar listado con columnas (Nombre, Categoría, Fundación, Eventos, Total, Estado, Acciones) 3) Ingresar término en buscador 4) Verificar filtrado 5) Limpiar búsqueda | Listado carga correctamente. Buscador filtra sin duplicar datos | P1 | Alta |
| /dashboard/materials | Feliz | Crear material con datos válidos | Usuario autenticado. Existe categoría | Nombre: "Balón Fútbol #5" Categoría: seleccionar Stock Fundación: 10 Stock Eventos: 5 | 1) Ir a /dashboard/materials 2) Click 'Crear' 3) Completar campos 4) Guardar 5) Verificar listado | Confirmación. Material aparece con stock correcto | P1 | Alta |
| /dashboard/materials | Feliz | Transferir stock entre inventarios | Material con stock en Fundación | Cantidad: 5 De: FUNDACION A: EVENTOS | 1) Ir a /dashboard/materials 2) Click 'Transferir' (icono intercambio) 3) Seleccionar origen y destino 4) Ingresar cantidad 5) Guardar | Transferencia exitosa. Stock actualizado | P1 | Alta |
| /dashboard/materials | Feliz | Registrar baja de material | Material con stock disponible | Cantidad: 2 Tipo: DETERIORO Descripción: "Desgaste por uso" | 1) Ir a /dashboard/materials 2) Click 'Registrar Baja' 3) Completar formulario 4) Guardar | Baja registrada. Stock disminuye | P2 | Media |
| /dashboard/materials-movements | Feliz | Listar movimientos y usar pestañas Ingresos/Salidas | Usuario autenticado. Existen movimientos | - | 1) Ir a /dashboard/materials-movements 2) Verificar tab 'Ingresos' con columnas (Fecha, Material, Categoría, Cantidad, Proveedor) 3) Click tab 'Salidas' 4) Verificar columnas (Fecha, Material, Categoría, Cantidad, Tipo) | Listado carga correctamente en ambas pestañas | P1 | Alta |
| /dashboard/materials-movements | Feliz | Registrar ingreso de material | Usuario autenticado. Existe material y proveedor | Material: seleccionar Cantidad: 20 Proveedor: seleccionar Destino: FUNDACION | 1) Ir a /dashboard/materials-movements 2) Tab 'Ingresos' 3) Click 'Registrar Ingreso' 4) Completar formulario 5) Guardar | Ingreso registrado. Aparece en listado | P1 | Alta |
| /dashboard/materials-movements | Feliz | Ver salidas: Baja de material | Existe salida tipo BAJA registrada | Salida tipo: BAJA | 1) Ir a /dashboard/materials-movements 2) Tab 'Salidas' 3) Verificar listado 4) Identificar salida tipo "Baja" 5) Click 'Ver' 6) Verificar detalle | Detalle muestra tipo de baja, origen y descripción | P1 | Alta |
| /dashboard/materials-movements | Feliz | Ver salidas: Transferencia entre inventarios | Existe salida tipo TRANSFERENCIA | Salida tipo: TRANSFERENCIA | 1) Ir a /dashboard/materials-movements 2) Tab 'Salidas' 3) Identificar salida tipo "Transferencia" 4) Click 'Ver' 5) Verificar detalle | Detalle muestra origen, destino y cantidad | P1 | Alta |
| /dashboard/providers | Feliz | Listar proveedores y usar buscador | Usuario autenticado. Existen proveedores | Buscar por: razón social, NIT, correo | 1) Ir a /dashboard/providers 2) Verificar listado 3) Ingresar término en buscador 4) Verificar filtrado 5) Limpiar búsqueda | Listado carga. Buscador filtra correctamente | P1 | Alta |
| /dashboard/providers | Feliz | Crear proveedor persona jurídica | Usuario autenticado con permisos Crear | Razón Social: "Deportes XYZ SAS" NIT: 900123456-1 Tipo: Jurídica Contacto: "Juan Pérez" | 1) Ir a /dashboard/providers 2) Click 'Crear Proveedor' 3) Seleccionar tipo Jurídica 4) Completar campos 5) Guardar | Proveedor creado. Aparece en listado | P1 | Alta |
| /dashboard/enrollments | Feliz | Listar matrículas y usar pestañas | Usuario autenticado. Existen matrículas | - | 1) Ir a /dashboard/enrollments 2) Verificar tab 'Matrículas' 3) Click tab 'Inscripciones' 4) Verificar contador | Ambas pestañas cargan correctamente | P1 | Alta |
| /dashboard/enrollments | Feliz | Crear matrícula nueva desde cero | Usuario autenticado. Existe acudiente | Nombres: "Carlos" Apellidos: "Ramírez" Documento: 1098765432 Categoría: "Infantil" | 1) Ir a /dashboard/enrollments 2) Click 'Nueva Matrícula' 3) Completar formulario 4) Seleccionar acudiente 5) Guardar | Matrícula creada. Aparece en listado | P1 | Alta |
| /dashboard/enrollments | Feliz | Procesar inscripción pendiente | Existe inscripción en tab Inscripciones | Inscripción pendiente | 1) Ir a /dashboard/enrollments 2) Tab 'Inscripciones' 3) Seleccionar inscripción 4) Completar datos 5) Guardar | Inscripción procesada. Pasa a Matrículas | P1 | Alta |
| /dashboard/enrollments | Feliz | Renovar matrícula vencida | Deportista con matrícula vencida | Categoría: actualizar Comprobante: PDF | 1) Ir a /dashboard/enrollments 2) Tab 'Matrículas' 3) Click 'Renovar' 4) Completar formulario 5) Guardar | Matrícula renovada. Estado Vigente | P1 | Alta |
| /dashboard/athletes | Feliz | Listar deportistas y usar buscador | Usuario autenticado. Existen deportistas | Buscar por: nombre o documento | 1) Ir a /dashboard/athletes 2) Verificar listado 3) Ingresar término en buscador 4) Verificar filtrado 5) Limpiar | Listado carga. Buscador filtra correctamente | P1 | Alta |
| /dashboard/athletes | Feliz | Crear deportista con acudiente | Usuario autenticado. Existe acudiente | Nombres: "Ana" Apellidos: "Torres" Documento: 1087654321 Categoría: "Pre-Juvenil" | 1) Ir a /dashboard/athletes 2) Click 'Crear' 3) Completar formulario 4) Seleccionar acudiente 5) Guardar | Deportista creado. Aparece en listado | P1 | Alta |
| /dashboard/temporary-teams | Feliz | Listar equipos y usar buscador | Usuario autenticado. Existen equipos | Buscar por: nombre de equipo | 1) Ir a /dashboard/temporary-teams 2) Verificar listado 3) Ingresar término en buscador 4) Verificar filtrado 5) Limpiar | Listado carga. Buscador filtra correctamente | P1 | Alta |

---

## 03. EJECUCIÓN FUNCIONAL

| Ejecución_ID | Caso_ID | Fecha | Ejecutado por | Resultado (Pass/Fail/Blocked) | Evidencia (URL/archivo) | Observaciones | Bug_ID (si aplica) |
|--------------|---------|-------|---------------|-------------------------------|-------------------------|---------------|-------------------|
| E-01 | Login válido | | | | | | |
| E-02 | Login contraseña incorrecta | | | | | | |
| E-03 | Cerrar sesión | | | | | | |
| E-04 | Back después logout | | | | | | |
| E-05 | Listar usuarios | | | | | | |
| E-06 | Listar categorías | | | | | | |
| E-07 | Crear categoría | | | | | | |
| E-08 | Nombre duplicado categoría | | | | | | |
| E-09 | Listar materiales | | | | | | |
| E-10 | Crear material | | | | | | |
| E-11 | Transferir stock | | | | | | |
| E-12 | Registrar baja | | | | | | |
| E-13 | Listar movimientos | | | | | | |
| E-14 | Registrar ingreso | | | | | | |
| E-15 | Ver salida baja | | | | | | |
| E-16 | Ver salida transferencia | | | | | | |
| E-17 | Listar proveedores | | | | | | |
| E-18 | Crear proveedor | | | | | | |
| E-19 | Listar matrículas | | | | | | |
| E-20 | Crear matrícula | | | | | | |
| E-21 | Procesar inscripción | | | | | | |
| E-22 | Renovar matrícula | | | | | | |
| E-23 | Listar deportistas | | | | | | |
| E-24 | Crear deportista | | | | | | |
| E-25 | Listar equipos | | | | | | |

---

## 04. CHECKLIST NO FUNCIONAL (15 CHEQUEOS)

### PERFORMANCE (4 chequeos)

| NF_ID | Categoría | Chequeo | Procedimiento (cómo probar) | Resultado (Cumple/Parcial/No) | Evidencia | Observaciones |
|-------|-----------|---------|----------------------------|-------------------------------|-----------|---------------|
| NF-P01 | Performance | Carga de pantalla principal | 1) Abrir /dashboard 2) DevTools → Network 3) Disable cache 4) Ctrl+Shift+R 5) Registrar tiempo. Criterio: ≤ 3.0s | | | |
| NF-P02 | Performance | Carga de listado de materiales | 1) Abrir /dashboard/materials 2) DevTools → Network 3) Medir tiempo. Criterio: ≤ 4.0s | | | |
| NF-P03 | Performance | Búsqueda en tiempo real | 1) Ir a módulo con buscador 2) Escribir término 3) Observar. Criterio: Sin lag | | | |
| NF-P04 | Performance | Generación de reportes | 1) Click 'Generar reporte' 2) Medir tiempo. Criterio: ≤ 5.0s | | | |

### SEGURIDAD BÁSICA (4 chequeos)

| NF_ID | Categoría | Chequeo | Procedimiento (cómo probar) | Resultado (Cumple/Parcial/No) | Evidencia | Observaciones |
|-------|-----------|---------|----------------------------|-------------------------------|-----------|---------------|
| NF-S01 | Seguridad | Ruta protegida sin login | 1) Incógnito 2) Ir a /dashboard. Criterio: Redirige a /login | | | |
| NF-S02 | Seguridad | Sesión expira después logout | 1) Login 2) Logout 3) Back. Criterio: No muestra contenido | | | |
| NF-S03 | Seguridad | Validación server-side | 1) Deshabilitar validación cliente 2) Enviar datos inválidos. Criterio: Backend rechaza | | | |
| NF-S04 | Seguridad | No muestra stacktrace | 1) Provocar error. Criterio: Mensaje genérico | | | |

### USABILIDAD (3 chequeos)

| NF_ID | Categoría | Chequeo | Procedimiento (cómo probar) | Resultado (Cumple/Parcial/No) | Evidencia | Observaciones |
|-------|-----------|---------|----------------------------|-------------------------------|-----------|---------------|
| NF-U01 | Usabilidad | Mensajes de confirmación | 1) Crear/Editar/Eliminar. Criterio: Mensajes claros | | | |
| NF-U02 | Usabilidad | Confirmación antes eliminar | 1) Intentar eliminar. Criterio: Modal con Sí/No | | | |
| NF-U03 | Usabilidad | Consistencia UI | 1) Navegar módulos. Criterio: Diseño consistente | | | |

### ACCESIBILIDAD (2 chequeos)

| NF_ID | Categoría | Chequeo | Procedimiento (cómo probar) | Resultado (Cumple/Parcial/No) | Evidencia | Observaciones |
|-------|-----------|---------|----------------------------|-------------------------------|-----------|---------------|
| NF-A01 | Accesibilidad | Navegación por teclado | 1) Usar solo TAB. Criterio: Foco llega a todos los campos | | | |
| NF-A02 | Accesibilidad | Foco visible | 1) Navegar con TAB. Criterio: Foco siempre visible | | | |

### COMPATIBILIDAD (2 chequeos)

| NF_ID | Categoría | Chequeo | Procedimiento (cómo probar) | Resultado (Cumple/Parcial/No) | Evidencia | Observaciones |
|-------|-----------|---------|----------------------------|-------------------------------|-----------|---------------|
| NF-C01 | Compatibilidad | Chrome y Firefox | 1) Probar en ambos. Criterio: Funciona en ambos | | | |
| NF-C02 | Compatibilidad | Responsive | 1) DevTools responsive 2) Probar 375px y 768px. Criterio: Botones accesibles | | | |

---

## 05. REGISTRO DE BUGS

| Bug_ID | Título | Módulo | Tipo (Bug/UX) | Severidad | Prioridad | Ambiente | Pasos para Reproducir | Esperado vs Actual | Evidencia | Estado | Asignado A | Fecha Reporte |
|--------|--------|--------|---------------|-----------|-----------|----------|----------------------|-------------------|-----------|--------|------------|---------------|
| | | | | | | | | | | | | |
| | | | | | | | | | | | | |
| | | | | | | | | | | | | |
| | | | | | | | | | | | | |
| | | | | | | | | | | | | |
| | | | | | | | | | | | | |

---

## 06. RESUMEN

| Métrica | Valor |
|---------|-------|
| Total Casos Funcionales | 25 |
| Casos Ejecutados | 0 |
| Pass | 0 |
| Fail | 0 |
| % Pass | 0% |
| Chequeos No Funcionales | 15 |
| Bugs Reportados | 0 |

**Distribución:** Feliz 96% | Negativa 4%

**Módulos:** Login (4) | Usuarios (1) | Categorías (3) | Materiales (4) | Movimientos (4) | Proveedores (2) | Matrículas (4) | Deportistas (2) | Equipos (1)

---

**Fecha:** 2026-03-02 | **Versión:** 1.0 | **Estado:** Pendiente Ejecución
