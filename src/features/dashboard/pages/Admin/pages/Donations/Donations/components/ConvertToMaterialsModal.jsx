import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";
import { FaBoxOpen, FaPlus, FaTrash, FaCheckCircle } from "react-icons/fa";
import { createPortal } from "react-dom";
import donationsService from "../services/donationsService";
import materialsService from "../../../SportsMaterials/Materials/services/MaterialsService";
import eventsService from "../../../Events/services/eventsService";
import {
  showErrorAlert,
  showSuccessAlert,
} from "../../../../../../../../shared/utils/alerts.js";

const ConvertToMaterialsModal = ({ isOpen, onClose, donation, onSuccess }) => {
  const [materials, setMaterials] = useState([]);
  const [events, setEvents] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({
    materialId: "",
    cantidad: "",
    observaciones: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      fetchMaterials();
      fetchEvents();
    }
  }, [isOpen]);

  const fetchMaterials = async () => {
    setLoadingMaterials(true);
    try {
      const response = await materialsService.getAll({ limit: 1000, estado: "Activo" });
      const data = response?.data?.data || response?.data || [];
      setMaterials(Array.isArray(data) ? data : []);
    } catch (error) {
      showErrorAlert("Error", "No se pudieron cargar los materiales");
    } finally {
      setLoadingMaterials(false);
    }
  };

  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const response = await eventsService.getActiveEvents();
      const data = response?.data || response?.events || [];
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      showErrorAlert("Error", "No se pudieron cargar los eventos");
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleAddItem = () => {
    const newErrors = {};

    if (!currentItem.materialId) {
      newErrors.materialId = "Selecciona un material";
    }
    if (!currentItem.cantidad || Number(currentItem.cantidad) <= 0) {
      newErrors.cantidad = "La cantidad debe ser mayor a 0";
    }

    if (Object.keys(newErrors).length > 0) {
      setErr
