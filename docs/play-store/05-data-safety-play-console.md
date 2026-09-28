# Eklavya — Google Play Data Safety Form Answers

Aligned with the current **Eklavya-ant** React Native parent app (`AndroidManifest` declares **INTERNET** only; API `https://app.gurukull.in`). Update this sheet if you add SDKs, push notifications, payments, or device GPS.

Use these answers as a worksheet when filling **Play Console → App content → Data safety**.

---

## Overview questions

| Play Console question | Recommended answer | Notes |
|----------------------|--------------------|-------|
| Does your app collect or share any of the required user data types? | **Yes** | Account, student-related school data, messages, device ID |
| Is all of the user data collected by your app encrypted in transit? | **Yes** | HTTPS to `app.gurukull.in` |
| Do you provide a way for users to request that their data be deleted? | **Yes — outside the app / contact school** | See deletion section below; declare the path Play expects |

---

## Account deletion (Play policy)

**In-app account deletion:** Not implemented as a self-serve “delete my account” button in the current App.

**Declared path for parents:**

1. Contact the **school administrator** to deactivate the parent mobile login and unlink students.  
2. Optionally email **support@gurukull.in** for platform assistance.  
3. Uninstall the App / clear app data to remove on-device session, theme, and local device ID.

In Play Console, choose the option that matches **deletion by contacting the developer/school** (or “website URL” if you publish a deletion instructions page). Provide a URL or email that explains this process, for example:

- `[HOSTED_PRIVACY_POLICY_URL]#account-deletion`  
- or `support@gurukull.in`

---

## Data types checklist

For each type: **Collected?** / **Shared?** / **Ephemeral?** / **Required?** / **Purposes**.

“**Shared**” in Play’s sense generally means transfer to a third party. Here, data is sent to the **school’s Gurukull backend** (first-party platform for the school). Treat school/platform as the service backend—not advertising SDKs. If Play asks whether data is shared with third parties for advertising: **No**.

### Personal info

| Data type | Collected | Shared with other companies/orgs for their purposes | Purpose(s) | Required / optional |
|-----------|-----------|-----------------------------------------------------|------------|---------------------|
| Name | Yes (parent/student names from school) | No (school platform only) | App functionality, Account management | Required for service |
| Email address | Yes, if stored on parent profile by school | No | App functionality, Account management | Optional (school-dependent) |
| User IDs | Yes (parent/student IDs, auth subject) | No | App functionality, Account management | Required |
| Address | Only if school profile returns it | No | App functionality | Optional |
| Phone number | Yes (login mobile) | No | App functionality, Account management | Required |
| Other info | Child class/section and school labels | No | App functionality | Required for modules |

### Financial info

| Data type | Collected | Shared | Purpose | Notes |
|-----------|-----------|--------|---------|-------|
| User payment info | **No** in current RN app | — | — | Fees module is informational unless a payment SDK is added later |
| Purchase history | **No** (unless school fee history counts as financial) | No | App functionality | Declare **Other financial info** / fee records **Yes – collected** if fee dues/history are shown |

**Recommendation:** If fee amounts, dues, or payment status are displayed, declare **Financial info → Other financial info** as **Collected**, purpose **App functionality**, not shared for advertising, encrypted in transit.

### Location

| Data type | Collected | Shared | Purpose | Notes |
|-----------|-----------|--------|---------|-------|
| Approximate location | **No** from device | — | — | Manifest has no location permission |
| Precise location | **No** from device | — | — | Track location screen shows **school-provided transport** coordinates/status from API, not parent GPS |

If Play’s form only covers location **collected from the device**, answer **No**. If you later add Maps/GPS, revise this.

### Messages

| Data type | Collected | Shared | Purpose |
|-----------|-----------|--------|---------|
| Emails | No (unless emergency mail content is email-like school messages) | — | — |
| SMS or MMS | No | — | — |
| Other in-app messages | **Yes** (chat + feedback + school emergency mail) | No (school staff may read as part of service) | App functionality |

Declare **Other in-app messages** as collected.

### Photos and videos

| Data type | Collected | Notes |
|-----------|-----------|-------|
| Photos / videos | **Only if** avatars or attachments are downloaded/displayed from server | User is not prompted for gallery/camera in current RN build. If only viewing server URLs, you may still declare **Photos** as collected when profile images are fetched—use judgment; many apps declare only when user uploads. **Current build: no upload permission → typically do not declare on-device photo collection.** |

### Audio files

| Collected | **No** |

### Files and docs

| Collected | Possibly **Yes** if homework/notice attachments are downloaded | Purpose: App functionality | No advertising share |

### Calendar

| Collected | **No** device calendar access | School events are fetched from API (not writing to device calendar) |

### App activity

| Data type | Collected | Purpose |
|-----------|-----------|---------|
| App interactions | Minimal / not via analytics SDK | Prefer **No** unless you add analytics |
| In-app search history | No | — |
| Installed apps | No | — |
| Other user-generated content | Yes — leave remarks, feedback text, chat text | App functionality |
| Other actions | Leave applications, child selection | App functionality |

### Web browsing / Web site

| Collected | **No** general browsing history |

### App info and performance

| Data type | Collected | Purpose |
|-----------|-----------|---------|
| Crash logs | **No** dedicated SDK currently | If Android vitals only via Play: usually not “collected by app” |
| Diagnostics | Server may log API errors | Prefer declare only if you intentionally collect in-app |
| Other app performance | No | — |

### Device or other IDs

| Data type | Collected | Shared | Purpose |
|-----------|-----------|--------|---------|
| Device or other IDs | **Yes** — app-generated device ID in AsyncStorage, sent at login | No (to Gurukull backend only) | App functionality, Fraud prevention / security, Account management |

---

## Data handling summary (narrative for reviewers)

1. **Collected:** Parent account credentials and profile fields; app-generated device ID; selected child; student academic/fee/leave data; chat and emergency messages; feedback; theme preference.  
2. **Not collected from device sensors:** GPS, camera, mic, contacts (current RN manifest).  
3. **Encryption in transit:** Yes (HTTPS).  
4. **Encryption at rest:** Platform-dependent; on-device uses OS app storage; `allowBackup="false"`.  
5. **Users can request deletion:** Via school admin / support@gurukull.in; local data cleared on logout/uninstall.  
6. **Data shared for advertising / sale:** No.  
7. **Independent security review:** Optional — answer per your actual practice.

---

## Purposes legend (map to Play checkboxes)

Use these Play purpose labels where applicable:

- **App functionality** — core school modules, chat, leave, fees display  
- **Account management** — login, session, device binding, password change  
- **Fraud prevention, security, and compliance** — single-device login, token validation  
- **Analytics** — only if you add an analytics SDK (currently: avoid declaring)  
- **Developer communications** — only if you send promotional push unrelated to school (currently: no)  
- **Advertising or marketing** — **No**  
- **Personalization** — limited (selected child, theme); optional to declare under App functionality only  

---

## Families / children-related declarations

- Primary audience: **Parents (adults)**.  
- App may show **minors’ school data** to authorised parents.  
- Not a “designed for children” Play toy/game; follow **Families Policy** guidance for apps used by parents about children if you select related console options.  
- Do not target ads to children; this App has no ad SDK in the current build.

---

## When to revise this form

Update Data safety if you add any of:

- Firebase Cloud Messaging / push  
- Google Maps + `ACCESS_FINE_LOCATION`  
- Camera / file upload for homework  
- Payment SDK  
- Crashlytics / analytics  
- Social login  

Also reconcile if you publish the **native Android sibling** (`Eklavya` repo), which historically declared broader permissions (camera, storage, phone state, etc.)—that build needs its **own** Data safety answers.
