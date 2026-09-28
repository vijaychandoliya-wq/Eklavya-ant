# Eklavya — Android Permissions & Play Policy Justifications

This document matches the **shipped React Native app** in `Eklavya-ant` and notes differences in the legacy native sibling under `Eklavya/`.

---

## 1. Verified manifests

### Eklavya-ant (React Native — primary for this Play package)

**File:** `android/app/src/main/AndroidManifest.xml`

| Permission / setting | Present? |
|----------------------|----------|
| `android.permission.INTERNET` | **Yes** |
| Location (fine/coarse/background) | **No** |
| Camera / microphone | **No** |
| Storage / media read-write | **No** |
| Phone state / SMS / contacts | **No** |
| Notifications (POST_NOTIFICATIONS) | **No** |
| `allowBackup` | **false** |
| Cleartext traffic | Controlled by build flag `${usesCleartextTraffic}` — production should keep cleartext **off** |

### Legacy native sibling (`Eklavya/` Android project)

**File:** `app/src/main/AndroidManifest.xml` (template package still shows `com.gegosoft.yourappname`)

Historically declares a **much wider** set, including for example:

- `INTERNET`, `ACCESS_NETWORK_STATE`, `ACCESS_WIFI_STATE`  
- Storage / media permissions (`READ/WRITE_EXTERNAL_STORAGE`, `MANAGE_EXTERNAL_STORAGE`, `READ_MEDIA_IMAGES`, …)  
- `CAMERA`, `RECORD_AUDIO`, `MODIFY_AUDIO_SETTINGS`  
- `READ_PHONE_STATE`  
- Camera hardware features; Google Maps activity / API key placeholder  

**Do not reuse that permission set for the React Native Play listing unless those APIs are actually used and justified.** If you publish the native sibling separately, complete a separate permissions + Data safety package for it.

---

## 2. Permission → feature → Play justification (Eklavya-ant)

| Permission | Why the app needs it | User-facing explanation | Play policy notes |
|------------|----------------------|-------------------------|-------------------|
| **INTERNET** | Login, dashboard, attendance, homework, exams, fees, leave, notices, chat, emergency mail, transport status APIs | “Required to connect to your school’s Gurukull service.” | Normal; no special declaration beyond Data safety for data collected over the network |

No other runtime or install-time dangerous permissions are declared in the current RN manifest.

---

## 3. Features that look like permissions but are not (RN build)

| Feature in UI | Device permission? | Actual behaviour |
|---------------|--------------------|------------------|
| **Track location** | No | Reads transport/trip data from Gurukull API (`transport/locationlist`, trip status). Does not access parent GPS. |
| **Online class** | No camera/mic | Lists scheduled online classes from API; empty state when none. |
| **Chat / emergency mail** | No | Network messaging via API. |
| **Theme light/dark** | No | Local preference in AsyncStorage. |
| **Single-device login** | No special permission | App-generated `device_id` stored locally and sent at login. |
| **Avatars / notice images** | No storage permission | Loaded over HTTPS from `https://app.gurukull.in` via image URLs. |

---

## 4. Restricted / sensitive permissions checklist

Google Play treats certain permissions as **restricted** or high-scrutiny. Confirm **none** of the following are in the RN manifest before release:

| Permission / capability | In Eklavya-ant? | Action if adding later |
|-------------------------|-----------------|------------------------|
| `READ_SMS` / `RECEIVE_SMS` / `SEND_SMS` | No | Avoid; SMS OTP should use Play SMS Retriever or school-side SMS only |
| `READ_CALL_LOG` / `ANSWER_PHONE_CALLS` | No | Do not add |
| `READ_PHONE_STATE` | No | Avoid unless strictly necessary and approved |
| `ACCESS_BACKGROUND_LOCATION` | No | Only if continuous tracking with prominent disclosure |
| `ACCESS_FINE_LOCATION` / `ACCESS_COARSE_LOCATION` | No | Need in-app disclosure + Data safety update if added for Maps |
| `CAMERA` | No | Justify with photo upload feature + runtime prompt |
| `RECORD_AUDIO` | No | Justify with voice feature |
| `READ_MEDIA_*` / broad storage | No | Prefer Photo Picker / SAF; avoid `MANAGE_EXTERNAL_STORAGE` |
| `QUERY_ALL_PACKAGES` | No | Do not add |
| Accessibility / Notification listener | No | Do not add |
| All-files access | No | Do not add |
| Health / Health Connect | No | N/A |

**Result for current RN app:** No restricted permissions. Keep the surface minimal.

---

## 5. Declarations still required without sensitive permissions

Even with only `INTERNET`, complete:

- [ ] Privacy policy URL (HTTPS)  
- [ ] Data safety form (`05-data-safety-play-console.md`)  
- [ ] Account deletion instructions (school admin / support email)  
- [ ] Content rating questionnaire  
- [ ] Target audience and content settings appropriate for a **parent** utility that displays children’s school data  

---

## 6. Policy justifications library (paste snippets)

### Internet access

> Eklavya is a client for the Gurukull school platform at app.gurukull.in. All academic and messaging features require network access to authenticate parents and fetch school-published data for linked students.

### Device identifier (no permission)

> On first launch the app creates a local device identifier and stores it in app private storage. It is sent during login so the school platform can enforce single-device or session rules. It is not used for advertising.

### Children’s data

> The app is intended for adult parents and guardians. It displays student records only for children the school has linked to the parent’s registered mobile number. The school is the data controller for student records.

### Location wording (important)

> “Track location” shows school transport updates supplied by the Gurukull backend when a trip is active. The React Native Eklavya build does not request location permission and does not collect the parent device’s GPS coordinates.

---

## 7. If you later add common school-app permissions

Document before shipping:

| Addition | Manifest + runtime | Play extras |
|----------|--------------------|-------------|
| Push notices | `POST_NOTIFICATIONS` (Android 13+) | Data safety: device IDs / messages; notification permission rationale |
| Homework photo upload | Photo Picker or `READ_MEDIA_IMAGES` / camera | Photos data type; prominent disclosure if camera |
| In-app fee payment | Payment SDK permissions as required | Financial info; Payments policy |
| Live map of bus | `ACCESS_FINE_LOCATION` only if device GPS needed | Location data type; in-app disclosure; possibly prominent disclosure |

---

## 8. Release hygiene

1. Ship Play build from **Eklavya-ant** with the slim manifest unless product explicitly needs native sibling APIs.  
2. Keep production **cleartext traffic disabled**.  
3. Re-skim `AndroidManifest.xml` on every release before updating Data safety.  
4. Do not copy the legacy native permission list “just in case.”
