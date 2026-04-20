"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createShipment, fetchShipments } from "../lib/api.js";
import { dummyShipments } from "../data/dummyData.js";

const ShipmentContext = createContext(null);

function addDays(dateISO, days) {
  const nextDate = new Date(dateISO);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate.toISOString().slice(0, 10);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function computeRiskLevel({ temperatureC, fragility, delayDays, delayToleranceDays }) {
  const numericTemperature = Number(temperatureC);
  let score = 0;

  if (numericTemperature > 8) score += (numericTemperature - 8) * 2;
  if (numericTemperature < 0) score += (0 - numericTemperature) * 2;
  if (numericTemperature > 6 && numericTemperature <= 8) score += 2;
  if (fragility === "High") score += 4;
  if (fragility === "Medium") score += 2;
  if (delayDays > delayToleranceDays) score += 5;
  if (delayDays === delayToleranceDays) score += 2;

  if (score <= 6) return "Low";
  if (score <= 12) return "Medium";
  return "High";
}

function buildTemperatureSeries({ startDate, temperatureC }) {
  const baseTemperature = Number(temperatureC);
  return Array.from({ length: 7 }, (_, index) => ({
    timestamp: addDays(startDate, index),
    temperatureC: Number((baseTemperature + (index - 3) * 0.4 + Math.sin(index) * 0.2).toFixed(1))
  }));
}

const cityCoordinates = {
  Chennai: { lat: 13.0827, lng: 80.2707 },
  Delhi: { lat: 28.6139, lng: 77.209 },
  Mumbai: { lat: 19.076, lng: 72.8777 },
  Kolkata: { lat: 22.5726, lng: 88.3639 },
  Bengaluru: { lat: 12.9716, lng: 77.5946 },
  Hyderabad: { lat: 17.385, lng: 78.4867 },
  Lucknow: { lat: 26.8467, lng: 80.9462 },
  Ahmedabad: { lat: 23.0225, lng: 72.5714 }
};

function getCityCoordinates(cityName) {
  return cityCoordinates[String(cityName || "").trim()] || { lat: 22.7196, lng: 75.8577 };
}

export function ShipmentContextProvider({ children }) {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShipmentId, setSelectedShipmentId] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadShipments() {
      setLoading(true);
      try {
        const nextShipments = await fetchShipments();
        if (!active) return;
        setShipments(nextShipments?.length ? nextShipments : dummyShipments);
        setSelectedShipmentId((nextShipments?.[0] || dummyShipments[0])?.id ?? null);
      } catch {
        if (!active) return;
        setShipments(dummyShipments);
        setSelectedShipmentId(dummyShipments[0]?.id ?? null);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadShipments();

    return () => {
      active = false;
    };
  }, []);

  const selectedShipment = useMemo(() => {
    if (!selectedShipmentId) return null;
    return shipments.find((shipment) => shipment.id === selectedShipmentId) || null;
  }, [shipments, selectedShipmentId]);

  async function addShipment(formValues) {
    const delayDays = clamp(Math.floor(Number(formValues.delayToleranceDays) * 0.6), 0, 5);
    const predictedDeliveryDate = addDays(formValues.endDate, delayDays);
    const originCoordinates = getCityCoordinates(formValues.fromLocation);
    const destinationCoordinates = getCityCoordinates(formValues.toLocation);
    const midpointCoordinates = {
      lat: (originCoordinates.lat + destinationCoordinates.lat) / 2,
      lng: (originCoordinates.lng + destinationCoordinates.lng) / 2
    };

    const newShipment = {
      id: `CG-${Date.now()}`,
      shipmentNumber: formValues.shipmentNumber,
      fromLocation: formValues.fromLocation,
      toLocation: formValues.toLocation,
      startDate: formValues.startDate,
      endDate: formValues.endDate,
      delayToleranceDays: Number(formValues.delayToleranceDays),
      logisticsType: formValues.logisticsType,
      deviceId: formValues.deviceId,
      temperatureC: Number(formValues.temperatureC),
      temperatureSeries: buildTemperatureSeries({
        startDate: formValues.startDate,
        temperatureC: formValues.temperatureC
      }),
      fragility: formValues.fragility,
      vehicleNumber: formValues.vehicleNumber,
      delayDays,
      predictedDeliveryDate,
      riskLevel: computeRiskLevel({
        temperatureC: formValues.temperatureC,
        fragility: formValues.fragility,
        delayDays,
        delayToleranceDays: Number(formValues.delayToleranceDays)
      }),
      status: delayDays > 0 ? "Delayed" : "In Transit",
      deliveredDate: null,
      currentLocation: {
        label: "En route",
        lat: midpointCoordinates.lat,
        lng: midpointCoordinates.lng
      },
      route: [
        { name: formValues.fromLocation, lat: originCoordinates.lat, lng: originCoordinates.lng },
        { name: "Midpoint", lat: midpointCoordinates.lat, lng: midpointCoordinates.lng },
        { name: formValues.toLocation, lat: destinationCoordinates.lat, lng: destinationCoordinates.lng }
      ]
    };

    setShipments((previousShipments) => [newShipment, ...previousShipments]);
    setSelectedShipmentId(newShipment.id);
    await createShipment(newShipment);
  }

  function riskPillClass(riskLevel) {
    if (riskLevel === "Low") return "bg-success-500/15 text-success-500 border-success-500/30";
    if (riskLevel === "Medium") return "bg-warning-500/15 text-warning-500 border-warning-500/30";
    return "bg-danger-500/15 text-danger-500 border-danger-500/30";
  }

  function riskDotClass(riskLevel) {
    if (riskLevel === "Low") return "bg-success-500";
    if (riskLevel === "Medium") return "bg-warning-500";
    return "bg-danger-500";
  }

  return (
    <ShipmentContext.Provider
      value={{
        shipments,
        loading,
        selectedShipmentId,
        setSelectedShipmentId,
        selectedShipment,
        addShipment,
        riskPillClass,
        riskDotClass
      }}
    >
      {children}
    </ShipmentContext.Provider>
  );
}

export function useShipments() {
  const context = useContext(ShipmentContext);
  if (!context) {
    throw new Error("useShipments must be used within ShipmentContextProvider");
  }
  return context;
}
