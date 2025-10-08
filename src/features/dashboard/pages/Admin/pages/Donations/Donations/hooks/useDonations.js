import { useState } from "react";
import { InitialDonations } from "../../../../../../../../shared/models/initialDonationsData";

// Hook personalizado para manejar donaciones
export const useDonations = () => {
  const [donations, setDonations] = useState(InitialDonations);

  const addDonation = (donation) => {
    setDonations((prev) => [...prev, donation]);
  };

  const removeDonation = (nombreDonante) => {
    setDonations((prev) =>
      prev.filter((item) => item.nombreDonante !== nombreDonante)
    );
  };

  return { donations, setDonations, addDonation, removeDonation };
};
