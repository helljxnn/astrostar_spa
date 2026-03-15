# DOCUMENTACIÓN COMPLETA - MÓDULO DE DEPORTISTAS

## TABLA DE CONTENIDOS
1. [Arquitectura del Módulo](#arquitectura-del-módulo)
2. [Frontend - Estructura y Componentes](#frontend---estructura-y-componentes)
3. [Diseño y UX](#diseño-y-ux)
4. [Campos y Validaciones](#campos-y-validaciones)
5. [Flujos de Usuario](#flujos-de-usuario)
6. [Backend - Endpoints](#backend---endpoints)
7. [Casos de Uso](#casos-de-uso)
8. [Mejores Prácticas Implementadas](#mejores-prácticas-implementadas)

---

## ARQUITECTURA DEL MÓDULO

### Estructura de Carpetas Frontend

```
src/features/dashboard/pages/Admin/pages/Athletes/
├── AthletesSection/
│   ├── Athletes.jsx                    # Página principal de deportistas
│   ├── components/
│   │   ├── AthleteModal.jsx           # Modal crear/editar deportista
│   │   ├── GuardianModal.jsx          # Modal crear/editar acudiente
│   │   └── GuardianViewModal.jsx      # Modal ver detalles acudiente
│   └── services/
│       └── AthletesService.js         # Servicio API deportistas
│
├── Enrollments/
│   ├── Enrollments.jsx                # Página de matrículas
│   ├── components/
│   │   ├── EnrollmentHistoryModal.jsx # Historial de matrículas
│   │   └── RenewEnrollmentModal.jsx   # Modal renovar matrícula
│   ├── hooks/
│   │   └── useEnrollments.js          # Hook lógica matrículas
│   └── services/
│       ├── EnrollmentsService.js      # Servicio API matrículas
│       └── InscriptionsService.js     # Servicio pre-inscripciones
│
└── SportsCategory/
    └── components/
        └── AthletesListModal.jsx      # Lista deportistas por categoría
```

### Hooks Compartidos

```
src/shared/hooks/
├── useDocumentValidation.js           # Validación documentos únicos
└── useEmailValidation.js              # Validación emails únicos
```

### Servicios Compartidos

```
src/shared/services/
└── apiClient.js                       # Cliente HTTP centralizado
```

---

## FRONTEND - ESTRUCTURA Y COMPONENTES

### 1. Athletes.jsx - Página Principal

**Responsabilidades:**
- Listar todas las deportistas activas
- Filtrar por nombre, documento, categoría
- Crear nueva deportista
- Editar deportista existente
- Ver detalles de deportista
- Gestionar acudientes

**Estado Principal:**
```javascript
const [athletes, setAthletes] = useState([])
const [loading, setLoading] = useState(false)
const [filters, setFilters] = useState({
  search: '',
  categoria: '',
  status: 'Activo'
})
const [isModalOpen, setIsModalOpen] = useState(false)
const [selectedAthlete, setSelectedAthlete] = useState(null)
```

**Funciones Clave:**
- `loadAthletes()` - Cargar lista de deportistas
- `handleCreate()` - Abrir modal para crear
- `handleEdit(athlete)` - Abrir modal para editar
- `handleDelete(id)` - Eliminar deportista
- `handleSearch(term)` - Filtrar por búsqueda


### 2. AthleteModal.jsx - Modal Crear/Editar

**Props:**
```javascript
{
  isOpen: boolean,
  onClose: () => void,
  onSave: (data) => Promise<void>,
  athleteToEdit: Athlete | null,
  isEnrollmentMode: boolean,
  documentTypes: DocumentType[],
  categories: SportsCategory[]
}
```

**Campos del Formulario:**

#### Información Personal
- **Primer Nombre** (firstName) - Input text, requerido
- **Segundo Nombre** (middleName) - Input text, opcional
- **Primer Apellido** (lastName) - Input text, requerido
- **Segundo Apellido** (secondLastName) - Input text, opcional

#### Documento
- **Tipo de Documento** (documentTypeId) - Select, requerido
  - Opciones: Tarjeta de Identidad, Cédula de Ciudadanía, Cédula de Extranjería, Pasaporte
- **Número de Documento** (identification) - Input text, requerido, único
  - Validación en tiempo real contra backend
  - Mínimo 6 caracteres
  - Solo números

#### Contacto
- **Correo Electrónico** (email) - Input email, requerido, único
  - Validación en tiempo real contra backend
  - Formato email válido
  - Se normaliza a minúsculas
- **Número Telefónico** (phoneNumber) - Input tel, requerido
  - Formato: 10 dígitos
  - Solo números
- **Dirección** (address) - Input text, requerido
  - Mínimo 5 caracteres

#### Datos Deportivos
- **Fecha de Nacimiento** (birthDate) - Input date, requerido
  - No puede ser futura
  - Calcula edad automáticamente
  - Muestra edad en tiempo real
- **Categoría** (categoria) - Select, requerido
  - Opciones: Infantil, PreJuvenil, Juvenil
  - Validación: edad debe estar en rango de categoría
  - Muestra rango de edad de cada categoría

#### Acudiente (Solo si < 18 años)
- **Acudiente** (acudiente) - SearchableSelect, requerido si menor
  - Búsqueda en tiempo real
  - Muestra: Nombre completo + Documento
  - Botón "Crear Nuevo" para agregar acudiente
- **Parentesco** (parentesco) - Select, requerido si tiene acudiente
  - Opciones: Madre, Padre, Hermano/a, Tío/a, Abuelo/a, Primo/a, Otro

**Validaciones en Tiempo Real:**
```javascript
// Documento único
const validateDocument = async (doc) => {
  const result = await DocumentValidation.check(doc, excludeUserId)
  if (!result.available) {
    setErrors(prev => ({...prev, identification: 'Documento ya registrado'}))
  }
}

// Email único
const validateEmail = async (email) => {
  const result = await EmailValidation.check(email, excludeUserId)
  if (!result.available) {
    setErrors(prev => ({...prev, email: 'Email ya registrado'}))
  }
}

// Edad vs Categoría
const validateCategoryAge = (birthDate, category) => {
  const age = calculateAge(birthDate)
  const cat = categories.find(c => c.nombre === category)
  
  if (age < cat.edadMinima || age > cat.edadMaxima) {
    setErrors(prev => ({
      ...prev, 
      categoria: `Edad ${age} fuera del rango ${cat.edadMinima}-${cat.edadMaxima}`
    }))
  }
}

// Acudiente obligatorio para menores
const validateGuardian = (birthDate, guardianId) => {
  const age = calculateAge(birthDate)
  
  if (age < 18 && !guardianId) {
    setErrors(prev => ({
      ...prev,
      acudiente: 'El acudiente es obligatorio para menores de edad'
    }))
  }
}
```

**Flujo de Guardado:**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault()
  
  // 1. Validar todos los campos
  const isValid = validateAllFields()
  if (!isValid) return
  
  // 2. Validar categoría por edad
  const ageValid = validateCategoryAge()
  if (!ageValid) return
  
  // 3. Validar acudiente si es menor
  const guardianValid = validateGuardian()
  if (!guardianValid) return
  
  // 4. Preparar datos
  const data = prepareAthleteData()
  
  // 5. Enviar al backend
  await onSave(data)
  
  // 6. Cerrar modal
  onClose()
}
```


### 3. Enrollments.jsx - Página de Matrículas

**Responsabilidades:**
- Listar deportistas matriculadas
- Mostrar pre-inscripciones pendientes
- Crear matrícula desde pre-inscripción
- Renovar matrículas vencidas
- Ver historial de matrículas

**Tabs de Navegación:**
1. **Deportistas Matriculadas** - Lista de deportistas activas con matrícula vigente
2. **Pre-Inscripciones** - Lista de inscripciones pendientes de aprobar

**Estado Principal:**
```javascript
const {
  athletes,              // Deportistas matriculadas
  inscriptions,          // Pre-inscripciones pendientes
  loading,
  createEnrollment,      // Función crear matrícula
  renewEnrollment,       // Función renovar matrícula
  loadAthletes,
  loadInscriptions
} = useEnrollments()
```

**Tabla de Deportistas Matriculadas:**

Columnas:
- Foto (avatar con iniciales)
- Nombre Completo
- Documento
- Email
- Teléfono
- Categoría (badge con color)
- Estado Matrícula (badge: Vigente/Vencida/Por Vencer)
- Fecha Vencimiento
- Acciones (Ver, Editar, Historial, Renovar)

**Tabla de Pre-Inscripciones:**

Columnas:
- Nombre Completo
- Documento
- Email
- Teléfono
- Fecha Nacimiento
- Edad
- Estado (badge: Pendiente)
- Acciones (Matricular, Rechazar)

**Indicadores Visuales:**
```javascript
// Estado de matrícula
const getEnrollmentStatus = (fechaVencimiento) => {
  const today = new Date()
  const vencimiento = new Date(fechaVencimiento)
  const diasRestantes = Math.ceil((vencimiento - today) / (1000 * 60 * 60 * 24))
  
  if (diasRestantes < 0) {
    return { label: 'Vencida', color: 'red', icon: '⚠️' }
  } else if (diasRestantes <= 30) {
    return { label: 'Por Vencer', color: 'yellow', icon: '⏰' }
  } else {
    return { label: 'Vigente', color: 'green', icon: '✓' }
  }
}

// Categoría con color
const getCategoryColor = (categoria) => {
  const colors = {
    'Infantil': 'blue',
    'PreJuvenil': 'purple',
    'Juvenil': 'orange'
  }
  return colors[categoria] || 'gray'
}
```

**Flujo de Matrícula desde Pre-Inscripción:**
```javascript
const handleMatricularInscription = async (inscription) => {
  // 1. Seleccionar inscripción
  setSelectedInscription(inscription)
  
  // 2. Abrir modal con datos pre-cargados
  setIsAthleteModalOpen(true)
  
  // 3. Usuario completa/edita datos
  // 4. Usuario selecciona acudiente (si es menor)
  // 5. Usuario selecciona categoría
  
  // 6. Guardar matrícula
  const result = await createEnrollment(athleteData, inscription.id)
  
  if (result.success) {
    // 7. Mostrar mensaje de éxito
    showSuccessMessage('Deportista matriculada exitosamente')
    
    // 8. Mostrar credenciales generadas
    if (result.temporaryPassword) {
      showPasswordModal(result.temporaryPassword)
    }
    
    // 9. Recargar listas
    await loadAthletes()
    await loadInscriptions()
  }
}
```

---

## DISEÑO Y UX

### Paleta de Colores

```css
/* Colores Principales */
--primary: #6366f1;        /* Índigo - Acciones principales */
--secondary: #8b5cf6;      /* Violeta - Acciones secundarias */
--success: #10b981;        /* Verde - Estados positivos */
--warning: #f59e0b;        /* Amarillo - Advertencias */
--danger: #ef4444;         /* Rojo - Errores/Eliminación */
--info: #3b82f6;           /* Azul - Información */

/* Categorías */
--category-infantil: #3b82f6;     /* Azul */
--category-prejuvenil: #8b5cf6;   /* Violeta */
--category-juvenil: #f97316;      /* Naranja */

/* Estados de Matrícula */
--enrollment-vigente: #10b981;    /* Verde */
--enrollment-por-vencer: #f59e0b; /* Amarillo */
--enrollment-vencida: #ef4444;    /* Rojo */
```

### Componentes de UI

#### 1. Tabla de Deportistas
```jsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Foto</TableHead>
      <TableHead>Nombre</TableHead>
      <TableHead>Documento</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Categoría</TableHead>
      <TableHead>Estado</TableHead>
      <TableHead>Acciones</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {athletes.map(athlete => (
      <TableRow key={athlete.id}>
        <TableCell>
          <Avatar initials={getInitials(athlete)} />
        </TableCell>
        <TableCell>{athlete.fullName}</TableCell>
        <TableCell>{athlete.identification}</TableCell>
        <TableCell>{athlete.email}</TableCell>
        <TableCell>
          <Badge color={getCategoryColor(athlete.categoria)}>
            {athlete.categoria}
          </Badge>
        </TableCell>
        <TableCell>
          <Badge color={getEnrollmentStatus(athlete).color}>
            {getEnrollmentStatus(athlete).label}
          </Badge>
        </TableCell>
        <TableCell>
          <ActionButtons athlete={athlete} />
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

#### 2. Modal de Deportista
```jsx
<Modal isOpen={isOpen} onClose={onClose} size="large">
  <ModalHeader>
    {isEditing ? 'Editar Deportista' : 'Nueva Deportista'}
  </ModalHeader>
  
  <ModalBody>
    <Form onSubmit={handleSubmit}>
      {/* Información Personal */}
      <Section title="Información Personal">
        <FormField label="Primer Nombre" required>
          <Input 
            value={firstName}
            onChange={handleChange}
            error={errors.firstName}
          />
        </FormField>
        {/* ... más campos */}
      </Section>
      
      {/* Documento */}
      <Section title="Documento">
        {/* ... campos documento */}
      </Section>
      
      {/* Contacto */}
      <Section title="Contacto">
        {/* ... campos contacto */}
      </Section>
      
      {/* Datos Deportivos */}
      <Section title="Datos Deportivos">
        {/* ... campos deportivos */}
      </Section>
      
      {/* Acudiente (solo si < 18) */}
      {age < 18 && (
        <Section title="Información del Acudiente" required>
          {/* ... campos acudiente */}
        </Section>
      )}
    </Form>
  </ModalBody>
  
  <ModalFooter>
    <Button variant="secondary" onClick={onClose}>
      Cancelar
    </Button>
    <Button variant="primary" onClick={handleSubmit}>
      {isEditing ? 'Actualizar' : 'Crear'}
    </Button>
  </ModalFooter>
</Modal>
```


#### 3. Badges y Estados

```jsx
// Badge de Categoría
<Badge 
  color={getCategoryColor(categoria)}
  icon={getCategoryIcon(categoria)}
>
  {categoria}
</Badge>

// Badge de Estado de Matrícula
<Badge 
  color={getEnrollmentStatus(fechaVencimiento).color}
  icon={getEnrollmentStatus(fechaVencimiento).icon}
>
  {getEnrollmentStatus(fechaVencimiento).label}
</Badge>

// Badge de Edad
<Badge color="gray">
  {age} años
</Badge>
```

#### 4. Mensajes de Validación

```jsx
// Error inline en campo
<FormField label="Email" error={errors.email}>
  <Input 
    type="email"
    value={email}
    onChange={handleEmailChange}
    className={errors.email ? 'border-red-500' : ''}
  />
  {errors.email && (
    <ErrorMessage>{errors.email}</ErrorMessage>
  )}
</FormField>

// Mensaje de éxito
<SuccessAlert>
  ✓ Deportista creada exitosamente
  {emailSent && ' - Credenciales enviadas por email'}
</SuccessAlert>

// Mensaje de advertencia
<WarningAlert>
  ⚠️ La matrícula vence en {diasRestantes} días
</WarningAlert>
```

### Responsive Design

```css
/* Mobile First */
@media (max-width: 640px) {
  /* Tabla se convierte en cards */
  .table-row {
    display: flex;
    flex-direction: column;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 12px;
  }
  
  /* Modal ocupa toda la pantalla */
  .modal {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
  }
  
  /* Formulario en una columna */
  .form-grid {
    grid-template-columns: 1fr;
  }
}

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) {
  .form-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 1025px) {
  .form-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

---

## CAMPOS Y VALIDACIONES

### Tabla Completa de Campos

| Campo | Tipo | Requerido | Validación | Único | Default |
|-------|------|-----------|------------|-------|---------|
| firstName | String | Sí | Min 2 caracteres | No | - |
| middleName | String | No | - | No | "" |
| lastName | String | Sí | Min 2 caracteres | No | - |
| secondLastName | String | No | - | No | "" |
| documentTypeId | Int | Sí | Debe existir | No | - |
| identification | String | Sí | Min 6, solo números | Sí | - |
| email | String | Sí | Formato email | Sí | - |
| phoneNumber | String | Sí | 10 dígitos | No | - |
| address | String | Sí | Min 5 caracteres | No | - |
| birthDate | Date | Sí | No futura | No | - |
| categoria | String | Sí | Debe existir, edad en rango* | No | - |
| estado | String | No | Enum: Activo/Inactivo | No | "Activo" |
| acudiente | Int | Condicional** | Debe existir | No | null |
| parentesco | String | Condicional*** | Enum GuardianRelationship | No | null |

*La validación de edad vs categoría NO aplica cuando se crea desde matrícula (preRegistrationId presente)
**Requerido si edad < 18 años
***Requerido si tiene acudiente

### Validaciones Frontend

#### 1. Validación de Documento

```javascript
const useDocumentValidation = () => {
  const [cache, setCache] = useState({})
  
  const validateDocument = async (identification, excludeUserId = null, skipInscriptionCheck = false) => {
    // 1. Verificar cache
    const cacheKey = `${identification}_${excludeUserId || 'new'}_${skipInscriptionCheck ? 'noInscription' : 'withInscription'}`
    
    if (cache[cacheKey]) {
      return cache[cacheKey]
    }
    
    // 2. Validar formato
    if (identification.length < 6) {
      return { available: false, message: 'Mínimo 6 caracteres' }
    }
    
    if (!/^\d+$/.test(identification)) {
      return { available: false, message: 'Solo números' }
    }
    
    // 3. Verificar en backend
    const athleteResult = await AthletesService.checkIdentification(
      identification,
      excludeUserId
    )
    
    if (!athleteResult.available) {
      return { available: false, message: 'Documento ya registrado' }
    }
    
    // 4. Verificar en inscripciones (si no se salta)
    if (!skipInscriptionCheck) {
      const inscriptionResult = await InscriptionsService.checkIdentification(
        identification
      )
      
      if (!inscriptionResult.available) {
        return { available: false, message: 'Documento en pre-inscripción' }
      }
    }
    
    // 5. Guardar en cache
    const result = { available: true, message: 'Documento disponible' }
    setCache(prev => ({ ...prev, [cacheKey]: result }))
    
    return result
  }
  
  return { validateDocument }
}
```

#### 2. Validación de Email

```javascript
const useEmailValidation = () => {
  const validateEmail = async (email, excludeUserId = null) => {
    // 1. Validar formato
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { available: false, message: 'Formato de email inválido' }
    }
    
    // 2. Normalizar
    const normalizedEmail = email.toLowerCase().trim()
    
    // 3. Verificar en backend
    const result = await AthletesService.checkEmail(
      normalizedEmail,
      excludeUserId
    )
    
    return result
  }
  
  return { validateEmail }
}
```

#### 3. Validación de Categoría por Edad

```javascript
const validateCategoryAge = (birthDate, categoria, categories) => {
  // 1. Calcular edad
  const age = calculateAge(birthDate)
  
  // 2. Buscar categoría
  const category = categories.find(c => c.nombre === categoria)
  
  if (!category) {
    return {
      valid: false,
      message: 'Categoría no encontrada'
    }
  }
  
  // 3. Validar rango
  if (age < category.edadMinima) {
    return {
      valid: false,
      message: `Edad ${age} es menor al mínimo de ${category.nombre} (${category.edadMinima} años)`
    }
  }
  
  if (age > category.edadMaxima) {
    return {
      valid: false,
      message: `Edad ${age} es mayor al máximo de ${category.nombre} (${category.edadMaxima} años)`
    }
  }
  
  return {
    valid: true,
    message: `Edad ${age} está en el rango de ${category.nombre} (${category.edadMinima}-${category.edadMaxima} años)`
  }
}
```

#### 4. Validación de Acudiente

```javascript
const validateGuardian = (birthDate, guardianId, relationship) => {
  const age = calculateAge(birthDate)
  
  // 1. Menor de edad sin acudiente
  if (age < 18 && !guardianId) {
    return {
      valid: false,
      field: 'acudiente',
      message: 'El acudiente es obligatorio para menores de edad'
    }
  }
  
  // 2. Tiene acudiente pero no parentesco
  if (guardianId && !relationship) {
    return {
      valid: false,
      field: 'parentesco',
      message: 'Debe seleccionar el parentesco'
    }
  }
  
  // 3. Mayor de edad con acudiente (advertencia, no error)
  if (age >= 18 && guardianId) {
    return {
      valid: true,
      warning: 'La deportista es mayor de edad, el acudiente es opcional'
    }
  }
  
  return { valid: true }
}
```


### Validaciones Backend

#### 1. Validación en Repositorio

```javascript
// athletes.repository.js
async create(athleteData) {
  // 1. Validar usuario no existe
  await this.validateUserDoesNotExist(athleteData.identification, athleteData.email)
  
  // 2. Validar acudiente si es menor
  const age = calculateAge(athleteData.birthDate)
  if (age < 18 && !athleteData.guardianId) {
    throw new Error('El acudiente es obligatorio para menores de 18 años')
  }
  
  // 3. Validar categoría por edad (SOLO si NO viene de matrícula)
  if (!athleteData.preRegistrationId) {
    await this.validateCategoryAge(athleteData.birthDate, athleteData.categoria)
  }
  
  // 4. Crear usuario
  const user = await this.createUser(athleteData)
  
  // 5. Crear atleta
  const athlete = await this.createAthlete(user.id, athleteData)
  
  return athlete
}
```

---

## FLUJOS DE USUARIO

### Flujo 1: Crear Deportista Nueva

```mermaid
graph TD
    A[Usuario hace clic en "Nueva Deportista"] --> B[Se abre AthleteModal vacío]
    B --> C[Usuario llena información personal]
    C --> D[Usuario ingresa documento]
    D --> E{Documento único?}
    E -->|No| F[Mostrar error inline]
    E -->|Sí| G[Usuario ingresa email]
    G --> H{Email único?}
    H -->|No| I[Mostrar error inline]
    H -->|Sí| J[Usuario ingresa fecha nacimiento]
    J --> K[Sistema calcula edad]
    K --> L{Edad < 18?}
    L -->|Sí| M[Mostrar sección acudiente OBLIGATORIA]
    L -->|No| N[Ocultar sección acudiente]
    M --> O[Usuario selecciona acudiente]
    O --> P[Usuario selecciona parentesco]
    P --> Q[Usuario selecciona categoría]
    N --> Q
    Q --> R{Edad en rango de categoría?}
    R -->|No| S[Mostrar error de categoría]
    R -->|Sí| T[Usuario hace clic en Guardar]
    T --> U[Enviar datos al backend]
    U --> V{Backend valida?}
    V -->|No| W[Mostrar error del servidor]
    V -->|Sí| X[Crear usuario + atleta]
    X --> Y[Generar contraseña temporal]
    Y --> Z[Enviar email con credenciales]
    Z --> AA[Mostrar mensaje de éxito]
    AA --> AB[Cerrar modal]
    AB --> AC[Recargar lista de deportistas]
```

### Flujo 2: Matricular desde Pre-Inscripción

```mermaid
graph TD
    A[Usuario ve lista de pre-inscripciones] --> B[Usuario hace clic en "Matricular"]
    B --> C[Se abre AthleteModal con datos pre-cargados]
    C --> D[Sistema valida documento y email]
    D --> E{Datos válidos?}
    E -->|No| F[Mostrar errores]
    E -->|Sí| G[Sistema calcula edad]
    G --> H{Edad < 18?}
    H -->|Sí| I[Mostrar sección acudiente OBLIGATORIA]
    H -->|No| J[Usuario selecciona categoría]
    I --> K[Usuario busca/crea acudiente]
    K --> L[Usuario selecciona parentesco]
    L --> J
    J --> M[Usuario hace clic en Guardar]
    M --> N[Enviar datos con preRegistrationId]
    N --> O[Backend crea usuario + atleta + matrícula]
    O --> P[Backend marca pre-inscripción como Procesada]
    P --> Q[Generar contraseña temporal]
    Q --> R[Enviar email con credenciales]
    R --> S[Mostrar mensaje de éxito con contraseña]
    S --> T[Cerrar modal]
    T --> U[Recargar lista de deportistas y pre-inscripciones]
```

### Flujo 3: Renovar Matrícula Vencida

```mermaid
graph TD
    A[Usuario ve deportista con matrícula vencida] --> B[Usuario hace clic en "Renovar"]
    B --> C[Se abre RenewEnrollmentModal]
    C --> D[Mostrar datos de deportista]
    D --> E[Usuario ingresa fecha inicio opcional]
    E --> F[Usuario ingresa observaciones opcional]
    F --> G[Usuario sube comprobante de pago opcional]
    G --> H[Usuario hace clic en Renovar]
    H --> I[Enviar datos al backend]
    I --> J[Backend crea nueva matrícula]
    J --> K[Backend calcula fecha vencimiento +1 año]
    K --> L[Backend cambia estado deportista a Activo]
    L --> M[Mostrar mensaje de éxito]
    M --> N[Cerrar modal]
    N --> O[Recargar lista de deportistas]
```

### Flujo 4: Editar Deportista

```mermaid
graph TD
    A[Usuario hace clic en "Editar"] --> B[Se abre AthleteModal con datos]
    B --> C[Usuario modifica campos]
    C --> D{Cambió documento?}
    D -->|Sí| E[Validar documento único excluyendo actual]
    D -->|No| F{Cambió email?}
    E --> F
    F -->|Sí| G[Validar email único excluyendo actual]
    F -->|No| H{Cambió fecha nacimiento?}
    G --> H
    H -->|Sí| I[Recalcular edad]
    I --> J{Edad < 18?}
    J -->|Sí| K{Tiene acudiente?}
    K -->|No| L[Mostrar error: acudiente obligatorio]
    K -->|Sí| M[Usuario hace clic en Actualizar]
    J -->|No| M
    H -->|No| M
    M --> N[Enviar datos al backend]
    N --> O[Backend actualiza usuario + atleta]
    O --> P[Mostrar mensaje de éxito]
    P --> Q[Cerrar modal]
    Q --> R[Recargar lista de deportistas]
```

---

## BACKEND - ENDPOINTS

### Base URL
```
http://localhost:4000/api
```

### Autenticación
Todos los endpoints requieren token JWT:
```
Authorization: Bearer <token>
```

### GET /athletes
Obtener lista de deportistas con paginación y filtros.

**Query Parameters:**
| Parámetro | Tipo | Descripción | Requerido | Default |
|-----------|------|-------------|-----------|---------| 
| page | Int | Número de página | No | 1 |
| limit | Int | Registros por página | No | 10 |
| search | String | Búsqueda por nombre/documento | No | "" |
| status | String | Filtrar por estado | No | "Activo" |
| categoria | String | Filtrar por categoría | No | - |
| estadoInscripcion | String | Filtrar por estado inscripción | No | - |

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 10,
      "status": "Active",
      "user": {
        "firstName": "María",
        "lastName": "González",
        "email": "maria@example.com",
        "identification": "1234567890",
        "age": 15
      },
      "guardian": {
        "id": 5,
        "firstName": "Pedro",
        "lastName": "González"
      }
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```


### POST /athletes
Crear nueva deportista.

**Request Body:**
```json
{
  "firstName": "María",
  "middleName": "José",
  "lastName": "González",
  "secondLastName": "Pérez",
  "documentTypeId": 1,
  "identification": "1234567890",
  "email": "maria@example.com",
  "phoneNumber": "3001234567",
  "address": "Calle 123",
  "birthDate": "2010-05-15",
  "categoria": "PreJuvenil",
  "estado": "Activo",
  "acudiente": 5,
  "parentesco": "Mother"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 10,
    "status": "Active"
  },
  "temporaryPassword": "1234567890",
  "emailSent": true,
  "message": "Deportista creada exitosamente"
}
```

### POST /enrollments
Crear matrícula (crea deportista + matrícula).

**Request Body:**
```json
{
  "preRegistrationId": 5,
  "athlete": {
    "firstName": "María",
    "lastName": "González",
    "documentTypeId": "1",
    "identification": "1234567890",
    "email": "maria@example.com",
    "phoneNumber": "3001234567",
    "address": "Calle 123",
    "birthDate": "2010-05-15T00:00:00.000Z",
    "categoria": "PreJuvenil",
    "estado": "Activo",
    "acudiente": 5,
    "parentesco": "Mother"
  },
  "enrollment": {
    "fechaMatricula": "2026-03-01",
    "observaciones": "Primera matrícula"
  }
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Deportista matriculada exitosamente",
  "data": {
    "athlete": {
      "id": 1,
      "userId": 10
    },
    "enrollment": {
      "id": 1,
      "fechaMatricula": "2026-03-01",
      "fechaVencimiento": "2027-03-01",
      "estado": "Vigente"
    },
    "temporaryPassword": "1234567890",
    "emailSent": true
  }
}
```

### GET /athletes/check-email
Verificar disponibilidad de email.

**Query Parameters:**
- email (requerido)
- excludeUserId (opcional)

**Response 200:**
```json
{
  "success": true,
  "available": true,
  "message": "Email disponible"
}
```

### GET /athletes/check-identification
Verificar disponibilidad de documento.

**Query Parameters:**
- identification (requerido)
- excludeUserId (opcional)

**Response 200:**
```json
{
  "success": true,
  "available": false,
  "message": "El documento ya está registrado"
}
```

---

## CASOS DE USO

### Caso 1: Crear Deportista Menor de Edad con Acudiente

**Escenario:** Administrador quiere registrar una deportista de 8 años.

**Precondiciones:**
- Usuario autenticado con rol Admin
- Existe al menos un acudiente en el sistema

**Pasos:**
1. Usuario navega a "Deportistas"
2. Usuario hace clic en "Nueva Deportista"
3. Usuario llena información personal:
   - Primer Nombre: "Samanta"
   - Primer Apellido: "Murillo"
   - Segundo Apellido: "Agudelo"
4. Usuario selecciona tipo de documento: "Tarjeta de Identidad"
5. Usuario ingresa documento: "1010929820"
   - Sistema valida en tiempo real: ✓ Disponible
6. Usuario ingresa email: "samanta@example.com"
   - Sistema valida en tiempo real: ✓ Disponible
7. Usuario ingresa teléfono: "3135920318"
8. Usuario ingresa dirección: "Calle 47a #49a"
9. Usuario selecciona fecha de nacimiento: "2018-02-02"
   - Sistema calcula edad: 8 años
   - Sistema muestra sección de acudiente como OBLIGATORIA
10. Usuario busca y selecciona acudiente: "Monica María Sosa Calle"
11. Usuario selecciona parentesco: "Tío/a"
12. Usuario selecciona categoría: "Infantil" (5-12 años)
    - Sistema valida: ✓ Edad 8 está en rango 5-12
13. Usuario hace clic en "Crear"
14. Sistema crea deportista exitosamente
15. Sistema genera contraseña temporal
16. Sistema envía email con credenciales
17. Sistema muestra mensaje: "Deportista creada exitosamente"

**Resultado Esperado:**
- Deportista creada con ID único
- Usuario creado con credenciales
- Email enviado con contraseña temporal
- Deportista aparece en lista de deportistas

**Validaciones Aplicadas:**
- ✓ Documento único
- ✓ Email único
- ✓ Acudiente obligatorio para menor de 18
- ✓ Parentesco requerido
- ✓ Edad en rango de categoría

---

### Caso 2: Matricular desde Pre-Inscripción (Menor con Categoría Incorrecta)

**Escenario:** Administrador quiere matricular una pre-inscripción de una niña de 8 años que seleccionó categoría "PreJuvenil" (13-15 años).

**Precondiciones:**
- Existe pre-inscripción con estado "Pending"
- Pre-inscripción tiene datos completos
- Existe acudiente en el sistema

**Pasos:**
1. Usuario navega a "Matrículas" > Tab "Pre-Inscripciones"
2. Usuario ve pre-inscripción de "Samanta Murillo Agudelo"
   - Edad: 8 años
   - Categoría seleccionada: "PreJuvenil"
3. Usuario hace clic en "Matricular"
4. Sistema abre modal con datos pre-cargados
5. Sistema valida documento y email: ✓ Disponibles
6. Sistema calcula edad: 8 años
7. Sistema muestra sección acudiente como OBLIGATORIA
8. Usuario selecciona acudiente: "Monica María Sosa Calle"
9. Usuario selecciona parentesco: "Primo/a"
10. Usuario ve categoría pre-seleccionada: "PreJuvenil"
11. Usuario hace clic en "Crear Matrícula"
12. Sistema envía datos al backend con preRegistrationId
13. Backend NO valida categoría por edad (porque viene de matrícula)
14. Backend crea usuario + atleta + matrícula exitosamente
15. Backend marca pre-inscripción como "Procesada"
16. Sistema muestra mensaje de éxito
17. Pre-inscripción desaparece de la lista
18. Deportista aparece en lista de matriculadas con categoría "PreJuvenil"

**Resultado Esperado:**
- Deportista creada con categoría "PreJuvenil" aunque tenga 8 años
- Matrícula creada con fecha de vencimiento +1 año
- Pre-inscripción marcada como procesada
- Email enviado con credenciales

**Validaciones Aplicadas:**
- ✓ Documento único
- ✓ Email único
- ✓ Acudiente obligatorio para menor
- ✓ Parentesco requerido
- ✗ Edad vs categoría NO validada (porque viene de matrícula)

**Nota Importante:** Este comportamiento es intencional. Cuando se matricula desde pre-inscripción, el backend NO valida que la edad coincida con el rango de la categoría, permitiendo flexibilidad en casos especiales.

---

### Caso 3: Renovar Matrícula Vencida

**Escenario:** Deportista con matrícula vencida quiere renovar.

**Precondiciones:**
- Deportista existe con estado "Inactive"
- Matrícula anterior vencida

**Pasos:**
1. Usuario navega a "Matrículas"
2. Usuario ve deportista "Laura Ramírez" con badge "Vencida" (rojo)
3. Usuario hace clic en "Renovar"
4. Sistema abre modal de renovación
5. Sistema muestra datos de deportista
6. Usuario ingresa fecha de inicio (opcional): "2026-03-01"
7. Usuario ingresa observaciones (opcional): "Renovación anual"
8. Usuario hace clic en "Renovar Matrícula"
9. Backend crea nueva matrícula:
   - fechaInicio: "2026-03-01"
   - fechaVencimiento: "2027-03-01" (+ 1 año)
   - estado: "Vigente"
10. Backend cambia estado de deportista a "Active"
11. Sistema muestra mensaje: "Matrícula renovada exitosamente"
12. Deportista aparece con badge "Vigente" (verde)

**Resultado Esperado:**
- Nueva matrícula creada
- Deportista reactivada
- Fecha de vencimiento calculada automáticamente

---

## MEJORES PRÁCTICAS IMPLEMENTADAS

### 1. Frontend

#### Separación de Responsabilidades
- Componentes enfocados en UI
- Hooks para lógica de negocio
- Servicios para comunicación con API
- Utilidades para funciones reutilizables

#### Validaciones en Tiempo Real
- Documento único validado al escribir (debounce 500ms)
- Email único validado al escribir (debounce 500ms)
- Edad calculada automáticamente al cambiar fecha
- Categoría validada al cambiar edad o categoría

#### Caché de Validaciones
- Resultados de validación guardados en memoria
- Evita llamadas duplicadas al backend
- Mejora performance y UX

#### Manejo de Errores
- Errores inline en cada campo
- Mensajes descriptivos y accionables
- No bloquea el formulario completo
- Permite corregir errores uno por uno

#### Accesibilidad
- Labels asociados a inputs
- Mensajes de error con aria-describedby
- Navegación por teclado
- Contraste de colores WCAG AA

### 2. Backend

#### Validaciones Robustas
- Validación en múltiples capas (controller, service, repository)
- Mensajes de error descriptivos
- Validación de datos relacionados (acudiente, categoría)

#### Transacciones Atómicas
- Crear usuario + atleta en una transacción
- Rollback automático si falla alguna operación
- Consistencia de datos garantizada

#### Logging Estructurado
- Logs con prefijos consistentes
- Niveles de log apropiados (info, error, debug)
- Trazabilidad completa de operaciones

#### Seguridad
- Contraseñas hasheadas con bcrypt
- Tokens JWT con expiración
- Validación de permisos por rol
- Sanitización de inputs

### 3. Arquitectura

#### Código Limpio
- Funciones pequeñas y específicas
- Nombres descriptivos
- Comentarios solo donde necesario
- DRY (Don't Repeat Yourself)

#### Escalabilidad
- Código modular y reutilizable
- Fácil de extender con nuevas funcionalidades
- Separación clara de capas
- Bajo acoplamiento

#### Mantenibilidad
- Código fácil de leer y entender
- Estructura consistente
- Documentación inline
- Tests unitarios (recomendado)

---

## RESUMEN

El módulo de deportistas es un sistema completo para gestionar el ciclo de vida de las deportistas, desde la pre-inscripción hasta la matrícula y renovación. Implementa validaciones robustas, manejo de errores descriptivo, y una UX fluida con validaciones en tiempo real.

**Características Principales:**
- ✓ Gestión completa de deportistas (CRUD)
- ✓ Validaciones en tiempo real (documento, email)
- ✓ Gestión de acudientes para menores de edad
- ✓ Matrículas con vencimiento automático
- ✓ Renovación de matrículas vencidas
- ✓ Integración con pre-inscripciones
- ✓ Generación automática de credenciales
- ✓ Envío de emails con contraseñas temporales
- ✓ Historial de matrículas
- ✓ Filtros y búsqueda avanzada
- ✓ Responsive design
- ✓ Accesibilidad WCAG AA

**Tecnologías:**
- Frontend: React, TailwindCSS, SweetAlert2
- Backend: Node.js, Express, Prisma
- Base de Datos: PostgreSQL
- Autenticación: JWT
- Email: Nodemailer

