# Módulo de Gestión de Eventos

## Arquitectura Reorganizada

### 📁 Estructura de Archivos

```
EventsSection/
├── adapters/
│   ├── eventsCalendarAdapter.js     # Adaptador genérico para BaseCalendar
│   └── eventsColorAdapter.js        # Lógica específica de colores por tipo de evento
├── components/
│   ├── eventManage/
│   │   ├── DashboardEventComponent.jsx  # Componente específico de eventos
│   │   ├── EventsCalendar.jsx          # Calendario principal de eventos
│   │   └── EventModal.jsx              # Modal de creación/edición
│   └── registration/                   # Componentes de inscripciones
└── hooks/
    └── useEvents.js                    # Hook de gestión de eventos
```

### 🎨 Sistema de Colores

#### Prioridades de Color:

1. **Estado "Finalizado"** → Gris `#9ca3af` (independiente del tipo)
2. **Tipo de Evento** → Colores específicos:
   - Festival → Verde `#9BFFB6`
   - Torneo → Azul `#9BE9FF`
   - Clausura → Morado `#B595FF`
   - Taller → Rosado `#FF95E5`
3. **Estado** → Colores genéricos (fallback)

#### Implementación:

- **eventsColorAdapter.js**: Contiene la lógica específica de colores del módulo
- **DashboardEventComponent.jsx**: Usa el adaptador para obtener colores
- **eventsCalendarAdapter.js**: Aplica colores en la transformación de datos

### 🔧 Separación de Responsabilidades

#### Componentes Genéricos (BaseCalendar):

- Sin lógica específica de módulos
- Reutilizable para otros módulos (clases, horarios, etc.)
- Colores genéricos por estado

#### Adaptadores Específicos:

- **eventsCalendarAdapter.js**: Transformación de datos genérica
- **eventsColorAdapter.js**: Lógica específica de colores por tipo de evento

#### Componentes Específicos:

- **DashboardEventComponent.jsx**: Renderizado específico para eventos
- **EventsCalendar.jsx**: Configuración específica del calendario de eventos

### 🚀 Escalabilidad

Esta arquitectura permite:

- ✅ Agregar nuevos tipos de eventos fácilmente
- ✅ Modificar colores sin afectar otros módulos
- ✅ Reutilizar BaseCalendar en otros módulos
- ✅ Mantener código limpio y separado por responsabilidades

### 📝 Cómo Agregar un Nuevo Tipo de Evento

1. **Agregar color en eventsColorAdapter.js**:

```javascript
const eventsTypeColorMap = {
  Festival: "#9BFFB6",
  Torneo: "#9BE9FF",
  Clausura: "#B595FF",
  Taller: "#FF95E5",
  NuevoTipo: "#COLOR_HEX", // ← Agregar aquí
};
```

2. **El resto del sistema se actualiza automáticamente**

### 🧹 Componentes Eliminados/Deprecados

- Lógica de colores duplicada en DashboardEventComponent
- Función getEventColor duplicada en eventsCalendarAdapter
- Separación clara entre genérico y específico
