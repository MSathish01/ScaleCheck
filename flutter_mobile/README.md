# 📱 ScaleCheck Mobile (Flutter Edition)
### Official Legal Metrology Field Officer & Offline Stamping Suite

This is the native cross-platform **Flutter** implementation of **ScaleCheck**, built for on-site Legal Metrology Officers (LMO) and Government Approved Test Centres (GATC).

---

## 🌟 Key Features

1. **⚡ True Offline-First Architecture**:
   - Uses local **SQLite** (`sqflite`) to store assigned verification jobs and cached records.
   - Works 100% offline in rural mandis, highway weighbridges, and remote fuel stations without cellular connectivity.
2. **⚖️ Comprehensive Statutory Observation Record**:
   - Visual and housing integrity verification.
   - Repeatability and zero-load return checks.
   - Precise error measurements: MPE tolerance, Observed error, and Eccentricity.
   - Working standard test weights tracking.
   - Physical tamper-evident seal numbering.
3. **📍 Hardware Geolocation & Photo Evidence**:
   - Automatically geotags inspections with device GPS coordinates via `geolocator`.
   - Captures on-site scale display & nameplate photos via native device camera (`image_picker`).
4. **📋 Statutory Form VIII Rejection Notice & Re-Inspection**:
   - Emits formal legal rejection notice under **Section 24 of the Legal Metrology Act, 2009**.
   - Includes full support for **Re-Inspection / Observation Amendments** after trader repair.
5. **📷 Camera QR Seal Scanner**:
   - Scans physical digital QR seals on commercial instruments and performs instant RSA-2048 cryptographic validity checks.
6. **🔄 1-Click Cryptographic Ledger Sync**:
   - Automatically batch-syncs queued offline records to the backend (`POST /api/v1/inspections/sync-offline`).

---

## 🛠️ Project Structure

```text
flutter_mobile/
├── pubspec.yaml               # Flutter package configuration & dependencies
├── lib/
│   ├── main.dart              # App bootstrap & Provider initialization
│   ├── core/
│   │   ├── api_service.dart   # Dio HTTP client with JWT interceptor & sync endpoints
│   │   └── app_theme.dart     # Material 3 Government palette (Navy, Emerald, Amber)
│   ├── data/
│   │   ├── local_db.dart      # Local SQLite database manager (sqflite)
│   │   └── models/
│   │       ├── assigned_job.dart        # Instrument & trader details model
│   │       └── offline_inspection.dart  # Inspection findings model
│   ├── providers/
│   │   └── inspection_provider.dart     # Provider state manager for sync & offline mode
│   └── screens/
│       ├── login_screen.dart            # Login with fast demo switcher (LMO, GATC, Trader)
│       ├── officer_workbench_screen.dart # Queue list, online/offline toggle, sync banner
│       ├── inspection_form_screen.dart   # Inspection form with presets, GPS & camera
│       ├── rejection_notice_screen.dart # Form VIII Rejection Notice (Section 24)
│       └── qr_scanner_screen.dart       # Camera QR seal verification scanner
```

---

## 🚀 How to Run

### 1. Prerequisites
- Install the **Flutter SDK** (v3.0.0+) from [flutter.dev](https://flutter.dev).
- Add `flutter/bin` to your system `PATH`.

### 2. Setup & Install Dependencies
Open terminal in this directory:
```bash
cd flutter_mobile
flutter pub get
```

### 3. Connect to Backend
- If running on **Android Emulator**: The app automatically uses `http://10.0.2.2:5000/api/v1` to communicate with the host PC.
- If running on a **Physical Android Device**: Ensure your phone and laptop are on the same Wi-Fi network and update `defaultBaseUrl` in `lib/core/api_service.dart` to your laptop's local IP (e.g. `http://192.168.1.X:5000/api/v1`).

### 4. Launch the App
```bash
flutter run
```

### 5. Build Android Release APK
```bash
flutter build apk --release
```
The compiled standalone APK will be located at:
`build/app/outputs/flutter-apk/app-release.apk`
