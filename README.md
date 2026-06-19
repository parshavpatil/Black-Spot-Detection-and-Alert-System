# 🚨 Black Spot Detection and Alert System (BSDAS)

> A Smart Road Safety Solution using GPS Tracking, Geofencing, Real-Time Alerts, and Interactive Mapping

## 📌 Overview

Road accidents remain one of the leading causes of injuries and fatalities worldwide. Many accidents repeatedly occur at specific accident-prone locations known as **Black Spots**. Unfortunately, drivers often remain unaware of these dangerous zones until it is too late.

The **Black Spot Detection and Alert System (BSDAS)** is a web and mobile-based solution designed to improve road safety by providing **real-time alerts** whenever a driver approaches a known black spot.

The system continuously tracks the driver's location using GPS and triggers **voice alerts, vibration notifications, and visual warnings** when the user enters a predefined 500-meter danger zone.

---

## 🎯 Problem Statement

Traffic authorities identify and maintain records of accident-prone locations, but this information is rarely available to drivers in real time.

Traditional warning signs:

* Can be ignored easily
* Are ineffective during night driving
* May not be visible during poor weather conditions
* Cannot provide personalized alerts

BSDAS bridges this gap by converting static accident data into real-time driver notifications.

---

## ✨ Key Features

### 👨‍💼 Admin Web Portal

* Add new black spots on an interactive map
* Edit existing black spot information
* Delete outdated black spots
* Manage severity levels and descriptions
* View all accident-prone locations

### 📱 Driver Mobile Application

* Real-time GPS location tracking
* Continuous monitoring of nearby black spots
* Interactive map visualization
* Live distance calculation from black spots
* Background monitoring

### 🔔 Alert System

* Geofencing-based detection
* 500-meter danger zone radius
* Instant vibration alerts
* Voice notifications
* Marathi language warning alerts
* On-screen safety warnings

### ☁️ Cloud Synchronization

* Real-time API communication
* Automatic data updates
* Admin-to-mobile synchronization
* Centralized database management

---

## 🏗️ System Architecture

```text
                 ┌────────────────────┐
                 │ Admin Web Portal   │
                 │ React + Leaflet    │
                 └─────────┬──────────┘
                           │
                           ▼
                 ┌────────────────────┐
                 │ Node.js API Server │
                 │ Express Backend    │
                 └─────────┬──────────┘
                           │
                           ▼
                 ┌────────────────────┐
                 │ MongoDB Database   │
                 └─────────┬──────────┘
                           │
                           ▼
                 ┌────────────────────┐
                 │ Mobile Application │
                 │ GPS Tracking       │
                 └─────────┬──────────┘
                           │
                           ▼
                 ┌────────────────────┐
                 │ Geofencing Engine  │
                 └─────────┬──────────┘
                           │
                           ▼
                 ┌────────────────────┐
                 │ Alert Generation   │
                 │ Voice + Vibration  │
                 └────────────────────┘
```

---

## ⚙️ Technology Stack

### Frontend

* React.js
* Tailwind CSS
* Leaflet.js

### Backend

* Node.js
* Express.js

### Database

* MongoDB Atlas

### APIs & Services

* Geolocation API
* Leaflet Mapping API
* Axios
* REST APIs

### Development Tools

* Visual Studio Code
* Postman
* GitHub

---

## 🔄 Workflow

1. User opens the mobile application.
2. Application requests location permission.
3. GPS tracking starts after permission is granted.
4. Black spot data is fetched from the backend.
5. Driver's live location is continuously monitored.
6. Distance between driver and black spots is calculated.
7. When the driver enters a 500m radius:

   * Vibration alert is triggered
   * Voice alert is played
   * Warning message is displayed
8. Monitoring continues until the application is closed.

---

## 📊 Methodology

### 1. Black Spot Management

Administrators manage accident-prone locations through a web interface.

### 2. Database Integration

All black spot information is stored and managed using MongoDB and REST APIs.

### 3. Live Location Tracking

GPS continuously tracks driver movement.

### 4. Geofencing

A virtual 500-meter safety boundary is created around every black spot.

### 5. Alert Generation

Drivers receive immediate warnings upon entering a danger zone.

---

## 📱 Project Modules

### Admin Module

* Black spot management
* Map-based location marking
* CRUD operations

### Backend API Module

* API development
* Data synchronization
* Authentication handling

### Mobile App Module

* GPS tracking
* Location monitoring
* User interface

### Geofencing & Alert Module

* Distance calculation
* Alert triggering
* Voice notifications

---

## 🚦 Results

The system was successfully implemented and tested.

### Achievements

✅ Accurate black spot detection

✅ Real-time GPS tracking

✅ Successful geofencing implementation

✅ Instant vibration notifications

✅ Marathi voice alerts

✅ Real-time admin-to-mobile synchronization

✅ Interactive map visualization

### Outcome

The application effectively warns drivers before they reach accident-prone locations, increasing road safety awareness and reducing accident risks.

---

## 🌍 Sustainable Development Goals (SDGs)

### Goal 3 – Good Health and Well-being

Reducing road accident injuries and fatalities.

### Goal 9 – Industry, Innovation and Infrastructure

Leveraging modern technology to improve transportation safety.

### Goal 11 – Sustainable Cities and Communities

Creating safer urban mobility systems.

### Goal 16 – Peace, Justice and Strong Institutions

Supporting traffic authorities with better accident data management.

---

## 🔮 Future Enhancements

* AI-based accident prediction
* Dynamic black spot detection using live accident data
* Traffic congestion monitoring
* Emergency service integration
* Push notification support
* Multi-language voice alerts
* Driver behavior analysis
* Accident analytics dashboard

---

## 👨‍💻 Team Members

* Prathmesh Dilip Shahapure
* Suparshav Mahaveer Patil
* Ruturaj Ramdas Nikam
* Arya Sanjay Chodankar

### Guide

Mrs. S. C. Desai

---

## 📚 References

The project is based on research in:

* Road Accident Prediction
* Geospatial Analysis
* GIS-based Black Spot Identification
* Machine Learning for Road Safety
* IoT and Real-Time Alert Systems
* GPS and Geofencing Technologies

---

## ⭐ Project Impact

BSDAS transforms static accident records into actionable real-time safety alerts, helping drivers make informed decisions while traveling and contributing towards safer roads and smarter transportation systems.
