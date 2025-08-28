// src/pages/Events.jsx
import { Hero } from "../components/Hero";
import {
  showSuccessAlert,
  showErrorAlert,
  showConfirmAlert,
} from "../../../shared/utils/alerts";

function Events() {
  return (
    <div>
      <Hero
        variant="background"
        title="Eventos"
        subtitle="Promover el desarrollo integral de las personas y su relación con el entorno, fomentando el deporte, la recreación, la actividad física y el uso saludable del tiempo libre. También buscamos incentivar la participación ciudadana y el respeto por los derechos humanos, en línea con la Constitución colombiana y las leyes actuales."
        imageUrl="/assets/images/EventsHero.png"
      />

      // Botones de prueba para las alertas 
      <div className="flex flex-wrap gap-4 justify-center mt-10">
        
        <button
          onClick={() =>
            showSuccessAlert("Éxito", "La operación fue exitosa 🎉")
          }
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Probar Éxito
        </button>

        <button
          onClick={() => showErrorAlert("Error", "Algo salió mal 😢")}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Probar Error
        </button>

        <button
          onClick={() =>
            showConfirmAlert(
              "¿Estás seguro?",
              "Esta acción no se puede deshacer 🤔"
            )
          }
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Probar Confirmación
        </button>
      </div>
    </div>
  );
}

export default Events;
