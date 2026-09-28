# Eklavya — Google Play Store Listing

Paste-ready fields for Google Play Console. Replace bracketed placeholders before publish.

---

## App identity

| Field | Value |
|--------|--------|
| **App name (title)** | Eklavya |
| **Subtitle** (30 chars max recommended) | School parent companion |
| **Package / application ID** | `[YOUR_ANDROID_PACKAGE_NAME]` |
| **Developer name** | Gurukull |
| **Default language** | English (India) — `en-IN` |
| **Official app icon** | `docs/play-store/assets/eklavya-logo.png` (or `ic_launcher_512.png` for upload) |

**Official icon:** Tree with a capital **G** on a navy square. Source: `assets/eklavya-logo.png`. Play upload: `docs/play-store/assets/ic_launcher_512.png` (512×512, full-bleed navy).

**Subtitle alternatives (≤30 characters):**
- Parent app for school
- Stay connected to school

---

## Short description (≤80 characters)

```
Stay connected to your child’s school—attendance, homework, fees & chat.
```

**Character count:** 72

**Alternates:**
```
Parent app for attendance, homework, exams, fees, leave & school chat.
```
```
Gurukull parent app: notices, timetable, marks, fees and staff messaging.
```

---

## Full description

```
Eklavya is the official parent mobile app for schools running on Gurukull (app.gurukull.in). Sign in with your registered mobile number and password to follow your child’s school life in one place—built for Indian school parents who need clear, timely updates.

WHAT YOU CAN DO

• Switch between linked children when more than one student is on your account
• View the home dashboard with school context and quick access to key modules
• Check daily attendance and stay on top of homework and assignments
• See exams and marks, timetable, class events, and discipline records
• Review fee information shared by the school
• Apply for leave and track leave applications
• Read school notices, calendar events, magazine updates, and school info
• Chat with school staff or admin when messaging is enabled
• View emergency / broadcast school mail (alerts from the school admin)
• Send feedback to the school
• Follow school transport trip status when the school publishes live tracking
• See online class listings when your school schedules them
• Use light or dark theme (or follow your phone setting)

WHO IT’S FOR

Parents and guardians whose mobile number is registered in the school’s Gurukull system. Login credentials are issued or managed by your school—not created through the Play Store listing.

PRIVACY & ACCESS

Eklavya connects securely to your school’s Gurukull platform. Student records you see are those the school has linked to your parent account. For account help, password issues, or to unlink a device, contact your school office or the support address below.

SUPPORT

Email: support@gurukull.in
Platform: https://app.gurukull.in
Privacy: [HOSTED_PRIVACY_POLICY_URL]
Terms: [HOSTED_TERMS_URL]

Eklavya — stay close to your child’s learning journey.
```

---

## Promo text (≤80 characters; updatable without new release)

```
Attendance, homework, fees, leave & school chat—all in one parent app.
```

**Alternate:**
```
New: easier chats with staff and clearer home dashboard for parents.
```

---

## Category & tags

| Field | Suggested value |
|--------|------------------|
| **Application type** | Application |
| **Category** | Education |
| **Tags / keywords** (internal; not all shown on Play) | school parent app, attendance, homework, fees, timetable, Indian school, Gurukull, student portal, leave application, school chat |
| **Contact email** | `support@gurukull.in` |
| **Phone** | `[SCHOOL_OR_ORG_PHONE]` (optional) |
| **Website** | `https://app.gurukull.in` or `[MARKETING_SITE]/eklavya` |
| **Privacy policy URL** | `[HOSTED_PRIVACY_POLICY_URL]` *(required)* |

---

## Content rating notes

| Topic | Guidance for questionnaire |
|--------|----------------------------|
| **Likely rating** | Everyone / PEGI 3 / equivalent educational utility |
| **Target age** | Adults (parents/guardians); content is about minors’ school records viewed by parents |
| **Violence / sexual content / gambling** | None |
| **User interaction** | Users can message school staff; school-moderated communication |
| **Personal info sharing** | App exchanges account and student school data with the school’s Gurukull backend only |
| **Location** | Does not collect the parent device’s GPS in the current React Native build; may display school-provided transport status |
| **Unrestricted web** | No general browser; links/media resolve to the school platform |

Complete the official **IARC questionnaire** in Play Console; do not self-assign a rating outside that flow.

---


## App icon (Play Console)

| Asset | Spec | Path in repo |
|--------|------|----------------|
| **Source logo** | 800 × 800 PNG | `assets/eklavya-logo.png` (also `docs/play-store/assets/eklavya-logo.png`) |
| **High-res icon** | 512 × 512 PNG, 32-bit | `docs/play-store/assets/ic_launcher_512.png` |
| **Alt copy** | 800 × 800 PNG | `docs/play-store/assets/eklavya-icon.png` (same artwork) |

Upload `ic_launcher_512.png` as the Play Console **Hi-res icon**. Android launcher mipmaps / adaptive foregrounds were generated from the same source under `android/app/src/main/res/`.

---
## Feature graphic & screenshot shot list

### Feature graphic (1024 × 500)

Capture / design:
1. Place the **official Eklavya icon** (`docs/play-store/assets/eklavya-logo.png`) as the primary brand mark (left or centre-left)
2. Wordmark **Eklavya** + short line: “Parent app for Gurukull schools”
3. Soft school atmosphere (classroom / notebook / campus photo) on navy-friendly tones — avoid cluttered UI collage
4. Optional: one device frame showing Home dashboard only (do not replace the official icon with a generic mark)

### Phone screenshots (recommended set, 6–8)

Shoot on a real device or emulator with **demo school data** (no real student PII in store assets). Ensure the **installed app icon** on the device is the official tree/G navy mark so status/recents chrome (if visible) stays on-brand.

| # | Screen | What to show | Caption idea |
|---|--------|--------------|--------------|
| 1 | **Home** | Dashboard + selected child | “Your child’s school day at a glance” |
| 2 | **Child switcher** | Picker / linked children | “Switch between children easily” |
| 3 | **Attendance** | Recent attendance list | “Track attendance without calling the office” |
| 4 | **Homework / Assignments** | Active homework cards | “Homework and assignments in one place” |
| 5 | **Exams / Marks** | Exam list or marks detail | “Exams and marks when published” |
| 6 | **Fees** | Fee summary | “Fee information from your school” |
| 7 | **Chats** | Chat list or chat room (fake names) | “Message school staff when enabled” |
| 8 | **Leave or Notices** | Leave form or notice board | “Apply leave & read school notices” |

**Optional extras:** Timetable, Profile with theme toggle, Emergency segment empty/alert list (sanitized).

### Asset tips
- Always use `assets/eklavya-logo.png` / `docs/play-store/assets/eklavya-logo.png` for store icon and feature-graphic brand mark (tree with G on navy)—do not substitute a generic book/graduation icon.
- Prefer light theme for store consistency; add one dark-theme shot only if it stays readable.
- Mask or invent names, phones, and fee amounts.
- Keep UI chrome (status bar) clean; use Indian English labels as in the app.

---

## Store listing checklist

- [ ] Title, short description, full description pasted  
- [ ] High-res icon uploaded from `docs/play-store/assets/ic_launcher_512.png`  
- [ ] Privacy policy URL live over HTTPS  
- [ ] Feature graphic + at least 2 phone screenshots  
- [ ] Education category selected  
- [ ] Contact email verified in Play Console  
- [ ] Data safety form completed (see `05-data-safety-play-console.md`)  
- [ ] Content rating questionnaire submitted  
- [ ] Target audience / Families policy reviewed if promoting to parents of children  

---

## Placeholders you must fill

| Placeholder | Purpose |
|-------------|---------|
| `[YOUR_ANDROID_PACKAGE_NAME]` | Application ID in Play Console |
| `[HOSTED_PRIVACY_POLICY_URL]` | Public privacy page (required by Play) |
| `[HOSTED_TERMS_URL]` | Public terms page |
| `[SCHOOL_OR_ORG_PHONE]` | Optional support phone |
| `[MARKETING_SITE]/eklavya` | Optional landing page |
| Legal entity / address on Play developer account | Use your real Gurukull / school org account details |
