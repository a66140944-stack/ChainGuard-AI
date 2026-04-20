function isoDate(isoValue) {
  return isoValue;
}

export const dummyShipments = [
  {
    id: "CG-1001",
    shipmentNumber: "CG-1001",
    fromLocation: "Chennai",
    toLocation: "Delhi",
    startDate: isoDate("2026-04-01"),
    endDate: isoDate("2026-04-10"),
    delayToleranceDays: 2,
    logisticsType: "Container",
    deviceId: "IOT-DEV-102",
    temperatureC: 4.8,
    temperatureSeries: [
      { timestamp: "2026-04-01", temperatureC: 4.2 },
      { timestamp: "2026-04-03", temperatureC: 4.7 },
      { timestamp: "2026-04-04", temperatureC: 5.0 },
      { timestamp: "2026-04-06", temperatureC: 4.6 },
      { timestamp: "2026-04-07", temperatureC: 5.3 },
      { timestamp: "2026-04-09", temperatureC: 4.9 },
      { timestamp: "2026-04-10", temperatureC: 4.4 }
    ],
    fragility: "Medium",
    vehicleNumber: "TN09XY3344",
    delayDays: 2,
    predictedDeliveryDate: isoDate("2026-04-12"),
    riskLevel: "High",
    status: "Delayed",
    deliveredDate: null,
    currentLocation: { label: "Indore", lat: 22.7196, lng: 75.8577 },
    route: [
      { name: "Chennai", lat: 13.0827, lng: 80.2707 },
      { name: "Bhopal", lat: 23.2599, lng: 77.4126 },
      { name: "Indore", lat: 22.7196, lng: 75.8577 },
      { name: "Delhi", lat: 28.6139, lng: 77.209 }
    ]
  },
  {
    id: "CG-1002",
    shipmentNumber: "CG-1002",
    fromLocation: "Mumbai",
    toLocation: "Kolkata",
    startDate: isoDate("2026-04-03"),
    endDate: isoDate("2026-04-11"),
    delayToleranceDays: 1,
    logisticsType: "Road",
    deviceId: "IOT-DEV-207",
    temperatureC: 7.2,
    temperatureSeries: [
      { timestamp: "2026-04-03", temperatureC: 6.9 },
      { timestamp: "2026-04-04", temperatureC: 7.4 },
      { timestamp: "2026-04-05", temperatureC: 7.1 },
      { timestamp: "2026-04-07", temperatureC: 7.8 },
      { timestamp: "2026-04-08", temperatureC: 7.6 },
      { timestamp: "2026-04-10", temperatureC: 7.3 },
      { timestamp: "2026-04-11", temperatureC: 7.0 }
    ],
    fragility: "Low",
    vehicleNumber: "MH12AB1234",
    delayDays: 0,
    predictedDeliveryDate: isoDate("2026-04-11"),
    riskLevel: "Low",
    status: "In Transit",
    deliveredDate: null,
    currentLocation: { label: "Bhubaneswar", lat: 20.2961, lng: 85.8245 },
    route: [
      { name: "Mumbai", lat: 19.076, lng: 72.8777 },
      { name: "Nagpur", lat: 21.1458, lng: 79.0882 },
      { name: "Bhubaneswar", lat: 20.2961, lng: 85.8245 },
      { name: "Kolkata", lat: 22.5726, lng: 88.3639 }
    ]
  }
];
