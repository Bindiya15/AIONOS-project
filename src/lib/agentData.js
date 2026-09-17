// All data supplied by the spec. Nothing here is invented.
export const TODAY = "Wednesday, 23 September 2026";

export const customers = {
  priya: {
    id: "priya",
    name: "Priya Nair",
    loyaltyTier: "Gold",
    bookingRef: "SK4821X",
    contact: { email: "priya.nair@example.com", phone: "+91-98xxxxxxx1" },
    travelHistory: {
      flightsLast12Months: 6,
      priorComplaints: "1 prior complaint: delayed baggage, resolved with voucher",
    },
    flight: {
      number: "SK-204",
      route: "Delhi → Goa",
      date: "Wednesday, 23 September 2026",
      scheduledDeparture: "18:40",
      status: "Cancelled",
      reason: "Operational reasons",
    },
    returnFlight: {
      route: "Goa → Delhi",
      date: "Friday, 25 September 2026",
      scheduledDeparture: "16:20",
      status: "Unaffected",
    },
    disruptionType: "cancellation",
    delayHours: null,
  },
  arvind: {
    id: "arvind",
    name: "Arvind Kulkarni",
    loyaltyTier: "Silver",
    bookingRef: "TR1190B",
    contact: { email: "arvind.kulkarni@example.com", phone: "+91-98xxxxxxx2" },
    travelHistory: {
      flightsLast12Months: 3,
      priorComplaints: "No prior complaints",
    },
    flight: {
      number: "SK-118",
      route: "Mumbai → Bengaluru",
      date: "Wednesday, 23 September 2026",
      scheduledDeparture: "07:10",
      status: "Delayed",
      reason: "Delayed 4 hours",
      newDeparture: "11:10",
    },
    disruptionType: "delay",
    delayHours: 4,
  },
  meher: {
    id: "meher",
    name: "Meher Kaur",
    loyaltyTier: "Platinum",
    bookingRef: "WL7742",
    contact: { email: "meher.kaur@example.com", phone: "+91-98xxxxxxx3" },
    travelHistory: {
      flightsLast12Months: 10,
      priorComplaints: "1 prior complaint: overbooking, resolved with a tier-status upgrade",
    },
    flight: {
      number: "SK-305",
      route: "Delhi → Hyderabad",
      date: "Wednesday, 23 September 2026",
      scheduledDeparture: "14:00",
      status: "Delayed",
      reason: "Delayed 6 hours",
      newDeparture: "20:00",
    },
    disruptionType: "delay",
    delayHours: 6,
  },
};

export const customerList = [
  { id: "priya", label: "Priya Nair — Gold", scenario: "Cancellation" },
  { id: "arvind", label: "Arvind Kulkarni — Silver", scenario: "4h Delay" },
  { id: "meher", label: "Meher Kaur — Platinum", scenario: "6h Delay" },
];

export const demoButtons = [
  { id: "priya", label: "Test Priya — Cancellation" },
  { id: "arvind", label: "Test Arvind — 4h Delay" },
  { id: "meher", label: "Test Meher — 6h Delay" },
];

export const quickActionsByCustomer = {
  priya: [
    { id: "refund", label: "Request Full Refund" },
    { id: "rebook", label: "Free Rebooking" },
  ],
  arvind: [
    { id: "meal", label: "Issue Meal Voucher" },
    { id: "lounge", label: "Provide Lounge Access" },
  ],
  meher: [
    { id: "meal", label: "Issue Meal Voucher" },
    { id: "lounge", label: "Provide Lounge Access" },
    { id: "hotel", label: "Arrange Eligible Hotel" },
    { id: "supervisor", label: "Request Supervisor Approval" },
  ],
};