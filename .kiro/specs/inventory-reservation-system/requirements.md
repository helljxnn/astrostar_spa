# Requirements Document

## Introduction

Este documento define los requisitos para implementar un sistema de gestión de inventario con reservas para materiales. El sistema permitirá un control preciso del stock dividido en dos estados: disponible y reservado, facilitando la asignación de materiales a eventos y el seguimiento del inventario real.

**Alcance del proyecto:**
- Módulos bajo nuestra responsabilidad: **Gestión de Materiales** e **Ingresos de Materiales**
- Módulos externos (solo definimos interfaces): **Eventos** y **Donaciones**

## Glossary

- **Sistema de Inventario**: Módulo de gestión de materiales
- **Stock Disponible**: Cantidad de material libre para usar o asignar
- **Stock Reservado**: Cantidad de material asignado a eventos futuros
- **Stock Total**: Suma de stock disponible y reservado
- **Movimiento de Inventario**: Registro de entrada o salida de material (compra, donación, baja)
- **Reserva de Material**: Asignación temporal de material a un evento específico
- **Consumo de Material**: Descuento definitivo del inventario cuando un evento finaliza
- **Baja de Material**: Descuento de inventario por daño, pérdida o descarte
- **Material**: Artículo gestionado en el inventario
- **Evento**: Actividad que puede requerir materiales (módulo externo)
- **Donación**: Aporte gratuito de material o dinero (módulo externo)

## Requirements

### Requirement 1

**User Story:** Como administrador de inventario, quiero ver el stock dividido en disponible y reservado, para tener control preciso de qué materiales están libres y cuáles están comprometidos.

#### Acceptance Criteria

1. WHEN el sistema muestra la lista de materiales THEN el Sistema de Inventario SHALL mostrar tres columnas de stock: disponible, reservado y total
2. WHEN se calcula el stock total THEN el Sistema de Inventario SHALL sumar el stock disponible más el stock reservado
3. WHEN el stock disponible es cero THEN el Sistema de Inventario SHALL mostrar una indicación visual clara de que no hay material libre
4. WHEN se visualiza un material individual THEN el Sistema de Inventario SHALL mostrar el desglose completo de stock disponible, reservado y total
5. WHEN se actualiza cualquier valor de stock THEN el Sistema de Inventario SHALL recalcular automáticamente el stock total

### Requirement 2

**User Story:** Como administrador de inventario, quiero registrar compras de materiales, para aumentar el stock disponible cuando la fundación adquiere nuevos artículos.

#### Acceptance Criteria

1. WHEN se registra una compra de material THEN el Sistema de Inventario SHALL aumentar el stock disponible del material en la cantidad especificada
2. WHEN se registra una compra THEN el Sistema de Inventario SHALL requerir proveedor, material, cantidad, precio y fecha
3. WHEN la cantidad de compra es cero o negativa THEN el Sistema de Inventario SHALL rechazar el registro
4. WHEN se completa el registro de compra THEN el Sistema de Inventario SHALL crear un movimiento de inventario de tipo "compra"
5. WHEN se registra una compra THEN el Sistema de Inventario SHALL actualizar el stock total automáticamente

### Requirement 3

**User Story:** Como administrador de inventario, quiero registrar bajas de material por daño o descarte, para mantener el inventario actualizado con las pérdidas reales.

#### Acceptance Criteria

1. WHEN se registra una baja de material THEN el Sistema de Inventario SHALL reducir el stock disponible en la cantidad especificada
2. WHEN se registra una baja THEN el Sistema de Inventario SHALL requerir material, cantidad y motivo
3. WHEN la cantidad de baja excede el stock disponible THEN el Sistema de Inventario SHALL rechazar la operación
4. WHEN se completa el registro de baja THEN el Sistema de Inventario SHALL crear un movimiento de inventario de tipo "baja"
5. WHEN se registra una baja THEN el Sistema de Inventario SHALL actualizar el stock total automáticamente

### Requirement 4

**User Story:** Como administrador de inventario, quiero que el sistema proporcione endpoints para reservar materiales, para que el módulo de eventos pueda asignar materiales a actividades futuras.

#### Acceptance Criteria

1. WHEN un módulo externo solicita reservar material THEN el Sistema de Inventario SHALL validar que existe stock disponible suficiente
2. WHEN se confirma una reserva THEN el Sistema de Inventario SHALL reducir el stock disponible y aumentar el stock reservado en la cantidad especificada
3. WHEN la cantidad solicitada excede el stock disponible THEN el Sistema de Inventario SHALL rechazar la reserva y retornar un mensaje de error
4. WHEN se crea una reserva THEN el Sistema de Inventario SHALL vincular la reserva con el identificador del evento
5. WHEN se consulta un material THEN el Sistema de Inventario SHALL mostrar todas las reservas activas asociadas

### Requirement 5

**User Story:** Como administrador de inventario, quiero que el sistema proporcione endpoints para consumir materiales reservados, para que cuando un evento finalice se descuente el inventario definitivamente.

#### Acceptance Criteria

1. WHEN un módulo externo solicita consumir material reservado THEN el Sistema de Inventario SHALL validar que existe una reserva activa para ese evento
2. WHEN se confirma el consumo THEN el Sistema de Inventario SHALL reducir el stock reservado en la cantidad especificada
3. WHEN se confirma el consumo THEN el Sistema de Inventario SHALL reducir el stock total en la cantidad especificada
4. WHEN se completa el consumo THEN el Sistema de Inventario SHALL crear un movimiento de inventario de tipo "consumo"
5. WHEN se consume material THEN el Sistema de Inventario SHALL marcar la reserva como completada

### Requirement 6

**User Story:** Como administrador de inventario, quiero que el sistema proporcione endpoints para liberar reservas, para que si un evento se cancela el material vuelva a estar disponible.

#### Acceptance Criteria

1. WHEN un módulo externo solicita liberar una reserva THEN el Sistema de Inventario SHALL validar que existe una reserva activa
2. WHEN se confirma la liberación THEN el Sistema de Inventario SHALL aumentar el stock disponible en la cantidad reservada
3. WHEN se confirma la liberación THEN el Sistema de Inventario SHALL reducir el stock reservado en la cantidad especificada
4. WHEN se libera una reserva THEN el Sistema de Inventario SHALL marcar la reserva como cancelada
5. WHEN se libera una reserva THEN el Sistema de Inventario SHALL mantener el stock total sin cambios

### Requirement 7

**User Story:** Como administrador de inventario, quiero que el sistema proporcione endpoints para recibir notificaciones de donaciones de material, para que el stock disponible aumente automáticamente cuando se registren donaciones.

#### Acceptance Criteria

1. WHEN el módulo de donaciones notifica una donación de material THEN el Sistema de Inventario SHALL aumentar el stock disponible del material especificado
2. WHEN se recibe una notificación de donación THEN el Sistema de Inventario SHALL validar que el material existe en el catálogo
3. WHEN se procesa una donación THEN el Sistema de Inventario SHALL crear un movimiento de inventario de tipo "donación"
4. WHEN la cantidad donada es cero o negativa THEN el Sistema de Inventario SHALL rechazar la notificación
5. WHEN se procesa una donación THEN el Sistema de Inventario SHALL actualizar el stock total automáticamente

### Requirement 8

**User Story:** Como administrador de inventario, quiero ver el historial completo de movimientos de cada material, para tener trazabilidad de todas las entradas y salidas.

#### Acceptance Criteria

1. WHEN se consulta el historial de un material THEN el Sistema de Inventario SHALL mostrar todos los movimientos ordenados por fecha descendente
2. WHEN se muestra un movimiento THEN el Sistema de Inventario SHALL incluir tipo, cantidad, fecha, usuario responsable y observaciones
3. WHEN el movimiento es una reserva o consumo THEN el Sistema de Inventario SHALL mostrar el evento asociado
4. WHEN el movimiento es una compra THEN el Sistema de Inventario SHALL mostrar el proveedor asociado
5. WHEN el movimiento es una donación THEN el Sistema de Inventario SHALL mostrar el donante asociado

### Requirement 9

**User Story:** Como desarrollador del módulo de eventos, quiero documentación clara de las APIs de inventario, para poder integrar correctamente la asignación de materiales a eventos.

#### Acceptance Criteria

1. WHEN se documenta la API de reserva THEN el Sistema de Inventario SHALL especificar el endpoint, método HTTP, parámetros requeridos y respuestas posibles
2. WHEN se documenta la API de consumo THEN el Sistema de Inventario SHALL especificar el endpoint, método HTTP, parámetros requeridos y respuestas posibles
3. WHEN se documenta la API de liberación THEN el Sistema de Inventario SHALL especificar el endpoint, método HTTP, parámetros requeridos y respuestas posibles
4. WHEN se documenta la API de consulta THEN el Sistema de Inventario SHALL especificar cómo obtener el stock disponible de un material
5. WHEN ocurre un error en cualquier operación THEN el Sistema de Inventario SHALL retornar códigos de error claros y mensajes descriptivos

### Requirement 10

**User Story:** Como administrador de inventario, quiero que el sistema valide la integridad del stock, para evitar inconsistencias entre disponible, reservado y total.

#### Acceptance Criteria

1. WHEN se realiza cualquier operación de stock THEN el Sistema de Inventario SHALL validar que stock total sea igual a stock disponible más stock reservado
2. WHEN se detecta una inconsistencia THEN el Sistema de Inventario SHALL rechazar la operación y registrar un error
3. WHEN el stock disponible sería negativo THEN el Sistema de Inventario SHALL rechazar la operación
4. WHEN el stock reservado sería negativo THEN el Sistema de Inventario SHALL rechazar la operación
5. WHEN el stock total sería negativo THEN el Sistema de Inventario SHALL rechazar la operación

## External Module Interfaces

### Interface para Módulo de Eventos

El módulo de eventos deberá implementar las siguientes integraciones:

**Asignar materiales a un evento:**
- Llamar al endpoint de reserva del Sistema de Inventario
- Pasar: ID del evento, ID del material, cantidad
- Manejar respuesta de éxito o error (stock insuficiente)

**Finalizar evento:**
- Llamar al endpoint de consumo del Sistema de Inventario
- Pasar: ID del evento
- El sistema consumirá todas las reservas asociadas al evento

**Cancelar evento:**
- Llamar al endpoint de liberación del Sistema de Inventario
- Pasar: ID del evento
- El sistema liberará todas las reservas asociadas al evento

### Interface para Módulo de Donaciones

El módulo de donaciones deberá implementar las siguientes integraciones:

**Registrar donación de material:**
- Llamar al endpoint de notificación de donación del Sistema de Inventario
- Pasar: ID del donante, ID del material, cantidad, observaciones
- El sistema aumentará el stock disponible automáticamente

**Validar material antes de registrar:**
- Consultar el catálogo de materiales del Sistema de Inventario
- Verificar que el material existe antes de permitir el registro de donación
