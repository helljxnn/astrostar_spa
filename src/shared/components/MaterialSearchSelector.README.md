# MaterialSearchSelector

Componente reutilizable para buscar y seleccionar materiales con autocompletado.

## Características

- 🔍 **Búsqueda en tiempo real** - Filtra por nombre, categoría y descripción
- ⌨️ **Navegación con teclado** - Usa flechas arriba/abajo, Enter y Escape
- 📱 **Responsive** - Se adapta a diferentes tamaños de pantalla
- ♿ **Accesible** - Incluye aria-labels y navegación por teclado
- 🎨 **Personalizable** - Usa los colores del tema (primary-purple)
- 🔄 **Estado de carga** - Muestra indicador mientras carga materiales
- ❌ **Limpieza rápida** - Botón para limpiar la selección
- 📊 **Información completa** - Muestra nombre, categoría, stock y descripción

## Uso

```jsx
import MaterialSearchSelector from "@/shared/components/MaterialSearchSelector";

function MyComponent() {
  const [selectedMaterialId, setSelectedMaterialId] = useState("");
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <MaterialSearchSelector
      materials={materials}
      value={selectedMaterialId}
      onChange={setSelectedMaterialId}
      disabled={false}
      loading={loading}
      placeholder="Buscar material..."
      error=""
    />
  );
}
```

## Props

| Prop          | Tipo       | Requerido | Default                | Descripción                               |
| ------------- | ---------- | --------- | ---------------------- | ----------------------------------------- |
| `materials`   | `Array`    | Sí        | `[]`                   | Lista de materiales disponibles           |
| `value`       | `string`   | Sí        | `""`                   | ID del material seleccionado              |
| `onChange`    | `Function` | Sí        | -                      | Callback cuando se selecciona un material |
| `disabled`    | `boolean`  | No        | `false`                | Si el componente está deshabilitado       |
| `loading`     | `boolean`  | No        | `false`                | Si está cargando materiales               |
| `placeholder` | `string`   | No        | `"Buscar material..."` | Texto placeholder                         |
| `error`       | `string`   | No        | `""`                   | Mensaje de error a mostrar                |

## Estructura de Material

Cada material en el array debe tener la siguiente estructura:

```javascript
{
  id: number,              // ID único del material
  nombre: string,          // Nombre del material
  categoria: string,       // Categoría del material
  descripcion?: string,    // Descripción opcional
  stockActual?: number     // Stock actual opcional
}
```

## Navegación por Teclado

- **↓ (Flecha Abajo)**: Navegar al siguiente item
- **↑ (Flecha Arriba)**: Navegar al item anterior
- **Enter**: Seleccionar el item resaltado
- **Escape**: Cerrar el dropdown
- **Escribir**: Filtrar materiales en tiempo real

## Ejemplos de Uso

### Uso Básico

```jsx
<MaterialSearchSelector
  materials={materials}
  value={form.materialId}
  onChange={(value) => handleChange("materialId", value)}
/>
```

### Con Estado de Carga

```jsx
<MaterialSearchSelector
  materials={materials}
  value={form.materialId}
  onChange={(value) => handleChange("materialId", value)}
  loading={loadingMaterials}
  placeholder="Cargando materiales..."
/>
```

### Con Validación de Errores

```jsx
<MaterialSearchSelector
  materials={materials}
  value={form.materialId}
  onChange={(value) => handleChange("materialId", value)}
  error={errors.materialId}
/>
```

### Deshabilitado

```jsx
<MaterialSearchSelector
  materials={materials}
  value={form.materialId}
  onChange={(value) => handleChange("materialId", value)}
  disabled={true}
/>
```

## Integración en Formularios

El componente está diseñado para integrarse fácilmente en formularios existentes:

```jsx
<div className="flex flex-col">
  <label className="text-sm font-semibold text-gray-700 mb-2">
    Material donado *
  </label>
  <MaterialSearchSelector
    materials={materials}
    value={form.especieMaterialId}
    onChange={(value) => handleChange("especieMaterialId", value)}
    disabled={statusOnlyMode}
    loading={loadingMaterials}
    placeholder="Buscar material..."
    error={errors.especieMaterialId}
  />
</div>
```

## Dónde se Usa

Este componente se utiliza actualmente en:

- ✅ **Formulario de Donaciones** (`DonationsForm.jsx`)
- 🔄 **Formulario de Eventos** (próximamente)
- 🔄 **Gestión de Materiales** (próximamente)

## Mejoras Futuras

- [ ] Agregar paginación para listas muy grandes
- [ ] Soporte para selección múltiple
- [ ] Agregar imágenes de materiales
- [ ] Filtros avanzados (por categoría, stock, etc.)
- [ ] Ordenamiento personalizado
