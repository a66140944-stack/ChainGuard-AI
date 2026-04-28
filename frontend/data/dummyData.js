function isoDate(isoValue) {
  return isoValue;
}

export const dummyShipments = [
  {
    id: "SHP-ESP32",
    shipmentNumber: "SHP-ESP32",
    fromLocation: "Ghaziabad",
    toLocation: "New Delhi",
    startDate: isoDate("2026-04-28"),
    endDate: isoDate("2026-04-28"),
    delayToleranceDays: 1,
    logisticsType: "Road",
    deviceId: "ESP32",
    temperatureC: 26.0,
    temperatureSeries: [{ timestamp: "2026-04-28", temperatureC: 26.0 }],
    fragility: "Medium",
    vehicleNumber: "ESP Node",
    delayDays: 0,
    predictedDeliveryDate: isoDate("2026-04-28"),
    riskLevel: "Low",
    status: "In Transit",
    deliveredDate: null,
    currentLocation: { label: "ESP Node", lat: 28.756563, lng: 77.495548 },
    route: [
      { name: "ESP Node", lat: 28.756563, lng: 77.495548 },
      { name: "New Delhi", lat: 28.6139, lng: 77.209 }
    ]
  }
];
