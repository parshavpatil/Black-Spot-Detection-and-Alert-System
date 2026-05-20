export interface Blackspot {
  id: string;
  title: string;
  description: string;
  locationText: string;
  lat: number;
  lng: number;
  date: string;
  imageUrl: string;
}

export const blackspots: Blackspot[] = [
    {
      id: "b1",
      title: "Unmarked Potholes",
      description: "Series of deep potholes causing vehicles to swerve.",
      locationText: "Ikeja, Lagos",
      lat: 6.5244,
      lng: 3.3792,
      date: "2025-02-01",
      imageUrl: "",
    },
    {
      id: "b2",
      title: "Blind Intersection",
      description: "Visibility blocked by parked vehicles and overgrown shrubs.",
      locationText: "Yaba, Lagos",
      lat: 6.45,
      lng: 3.4,
      date: "2025-01-15",
      imageUrl: "",
    },
    {
      id: "b3",
      title: "Faded Zebra Crossing",
      description: "Pedestrian crossing markings almost invisible at night.",
      locationText: "Lekki Phase 1, Lagos",
      lat: 6.47,
      lng: 3.35,
      date: "2024-12-20",
      imageUrl: "",
    },
  
    // ---- Kolhapur (Maharashtra) additions ----
    {
      id: "b4",
      title: "Rankala Lake — Pothole cluster / tourist-congestion",
      description: "Major stretch around Rankala Lake with recurring potholes and heavy two-wheeler / tourist traffic — repairs frequently patched and cause unstable surface for bikes.",
      locationText: "Rankala Lake Road, Kolhapur (near Hari Om Nagar)",
      lat: 16.6905,          // approximate
      lng: 74.2106,          // approximate
      date: "2025-06-01",    // approximate (reported mid-2025)
      imageUrl: "",
    },
    {
      id: "b5",
      title: "Binkhambi Ganesh Mandir → Mirajkar Tikti stretch — congestion / blind turns",
      description: "Narrow urban stretch that becomes heavily congested during festivals; parked vehicles and temporary banners reduce visibility at intersections.",
      locationText: "Sawarkar Marg / Mirajkar Tikti, Kolhapur",
      lat: 16.6925,          // Mirajkar Tikti approx (16°41'33\"N)
      lng: 74.2247,          // approx
      date: "2025-09-02",    // festival-related diversions noted Sep 2025
      imageUrl: "",
    },
    {
      id: "b6",
      title: "NH-48 / Pune–Bengaluru highway — Kagal / Ghunki Phata stretch",
      description: "High-speed highway section in Kolhapur district with a history of collisions and fatal crashes; problem spots at phatas (junctions) and stretches with incomplete shoulders.",
      locationText: "Near Kagal / Ghunki Phata, Kolhapur district (NH-48 area)",
      lat: 16.5993,          // Kagal approx (district/town)
      lng: 74.3163,          // approx
      date: "2025-05-27",    // representative date for highway incidents reporting
      imageUrl: "",
    },
    {
      id: "b7",
      title: "Kaneriwadi Phata (Pune–Bengaluru corridor) — collision hotspot",
      description: "Phata / junction on the national highway near Kolhapur where heavy vehicles and mixed traffic meet — several reported accidents caught on CCTV in recent years.",
      locationText: "Kaneriwadi Phata (NH stretch near Kolhapur)",
      lat: 16.68,            // approximate
      lng: 74.25,            // approximate
      date: "2023-05-27",    // example past accident (useful as 'known incident' marker)
      imageUrl: "",
    },
    {
      id: "b8",
      title: "Rajarampuri / Laxmipuri busy market roads — pedestrian & vehicle conflicts",
      description: "Busy commercial lanes with narrow carriageways, frequent jaywalking and worn pedestrian markings — visibility and road surface issues create daily small-accident risk.",
      locationText: "Rajarampuri / Laxmipuri area, Kolhapur",
      lat: 16.6930,          // approximate central Kolhapur
      lng: 74.2320,          // approximate
      date: "2025-06-15",    // approximate (city pothole/maintenance reporting mid-2025)
      imageUrl: "",
    },
    {
      id: "b9",
      title: "Temblai Flyover approach / Treyamboli Hill route — festival congestion & temporary closures",
      description: "Approaches to Temblai/Treyamboli (hill route) see repeated diversions and crowding during festivals — temporary closures and ad-hoc banners create sudden lane changes and confusion.",
      locationText: "Temblai / Treyamboli Hill approach, Kolhapur",
      lat: 16.7050,          // approximate
      lng: 74.2450,          // approximate
      date: "2025-09-02",    // festival diversion reporting
      imageUrl: "",
    },
    {
      id: "b10",
      title: "Temblai Flyover approach / Treyamboli Hill route — festival congestion & temporary closures",
      description: "Approaches to Temblai/Treyamboli (hill route) see repeated diversions and crowding during festivals — temporary closures and ad-hoc banners create sudden lane changes and confusion.",
      locationText: "Temblai / Treyamboli Hill approach, Kolhapur",
      lat: 16.7313,          // approximate
      lng:  74.2467,       // approximate
      date: "2025-09-02",    // festival diversion reporting
      imageUrl: "",
    }
  ];
  