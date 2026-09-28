# Eklavya — Webpage / Landing Copy Structure

Suggested marketing and support pages for the Eklavya parent app. Host under your school or Gurukull site.

---

## Suggested URL paths

| Path | Purpose |
|------|---------|
| `/eklavya` | Product landing + download CTA |
| `/eklavya/privacy` | Privacy Policy (Play Store URL target) |
| `/eklavya/terms` | Terms of Service |
| `/eklavya/support` *(optional)* | FAQ + contact + account help |
| `/eklavya/delete-account` *(optional)* | Account / access deletion instructions for Play |

**Canonical platform:** `https://app.gurukull.in`  
**Support:** `support@gurukull.in`

Replace `[PLAY_STORE_URL]` and `[MARKETING_ORIGIN]` (e.g. `https://www.example-school.edu.in`) before publish.

---

## Meta tags

### `/eklavya`

| Tag | Content |
|-----|---------|
| **Title** | Eklavya — Parent App for Gurukull Schools |
| **Meta description** | Eklavya helps school parents track attendance, homework, exams, fees, leave, notices, and chat with staff—powered by Gurukull. |
| **OG title** | Eklavya Parent App |
| **OG description** | Stay connected to your child’s school life on your phone. |
| **Canonical** | `[MARKETING_ORIGIN]/eklavya` |

### `/eklavya/privacy`

| Tag | Content |
|-----|---------|
| **Title** | Privacy Policy — Eklavya Parent App |
| **Meta description** | How the Eklavya Gurukull parent app collects, uses, and protects parent and student school data. |

### `/eklavya/terms`

| Tag | Content |
|-----|---------|
| **Title** | Terms of Service — Eklavya Parent App |
| **Meta description** | Terms for using the Eklavya parent mobile app for Gurukull schools. |

---

## Landing page structure (`/eklavya`)

### 1. Hero (one composition)

- **Brand:** Eklavya — use the official icon [`assets/eklavya-icon.png`](assets/eklavya-icon.png) (tree with **G** on navy) as the hero-level brand mark, not only a tiny favicon  
- **Headline:** Stay close to your child’s school day  
- **Supporting line:** Attendance, homework, fees, leave, and school chat—on the Gurukull parent app.  
- **CTA group:**  
  - Primary: **Get it on Google Play** → `[PLAY_STORE_URL]`  
  - Secondary: **Open school portal** → `https://app.gurukull.in`  
- **Visual:** Full-bleed campus / parent-on-phone atmosphere (real school context), not a dashboard collage; keep the navy tree/G mark clearly visible in the first viewport  

Avoid stats strips, promo chips, and multi-card heroes.

### 2. Features (one job: what parents get)

Short intro: “Everything your school publishes for parents, in one place.”

Feature list (icons optional, not required):

1. **Child switcher** — Follow more than one student on the same login  
2. **Attendance & timetable** — See daily presence and class schedules  
3. **Homework & assignments** — Know what’s due without chasing notebooks  
4. **Exams & marks** — View published tests and results  
5. **Fees** — Check fee information shared by the school  
6. **Apply leave** — Submit leave requests from your phone  
7. **Notices & calendar** — School announcements and events  
8. **Chat & emergency mail** — Message staff when enabled; read admin alerts  
9. **Transport status** — Follow school-published trip updates when available  
10. **Light & dark theme** — Comfortable reading day or night  

### 3. How it works

1. **School registers your mobile** in Gurukull and shares login details.  
2. **Download Eklavya** and sign in with mobile number + password.  
3. **Select your child** and open the module you need.  
4. **Need help?** Contact the school office or support@gurukull.in.

### 4. Who it’s for

Parents and guardians of students in schools running on **Gurukull**. The app is not a public social network—access is limited to authorised parent accounts.

### 5. FAQ

**How do I get a login?**  
Your school registers your mobile number in Gurukull. Ask the school office if you cannot sign in.

**Is login by email?**  
No. Use the **mobile number** registered with the school, plus your password.

**Can I use two phones at once?**  
The app supports device-bound sessions. Signing in on another device may require logging out existing sessions.

**Does the app track my phone’s GPS?**  
The current Eklavya parent app does not request device location permission. Transport screens show location updates **published by the school** when a trip is active.

**How do I delete my account?**  
Ask your school administrator to deactivate your parent access. You can also email support@gurukull.in. Uninstalling the app removes data stored on your phone.

**Where is my child’s data stored?**  
On your school’s Gurukull platform. The school is the data controller for student records. See the Privacy Policy.

**Is there an iOS app?**  
State actual availability: `[YES_APP_STORE_URL or “Android first; iOS TBA”]`.

### 6. Download CTA (repeat)

- Headline: Ready to stay informed?  
- Button: Get Eklavya on Google Play  
- Text link: Already have access? Open https://app.gurukull.in  

### 7. Footer

- Privacy → `/eklavya/privacy`  
- Terms → `/eklavya/terms`  
- Support: support@gurukull.in  
- © Gurukull / Eklavya Parent App  

---

## Privacy page (`/eklavya/privacy`)

Publish the full content from `03-privacy-policy.md` (HTML or Markdown → page).  
Ensure the **exact HTTPS URL** is pasted into Play Console.

Optional anchor: `#account-deletion` with the deletion steps from Data safety docs.

---

## Terms page (`/eklavya/terms`)

Publish the full content from `04-terms-of-service.md`.

---

## Optional support blurb (short)

```
Eklavya support
Email: support@gurukull.in
School portal: https://app.gurukull.in

For attendance disputes, fee dues, or wrong child linkage, contact your school office first—the app displays what your school publishes on Gurukull.
```

---

## Webpage checklist

- [ ] `/eklavya` live with Play badge linking to store listing  
- [ ] `/eklavya/privacy` publicly reachable over HTTPS (no login wall)  
- [ ] `/eklavya/terms` publicly reachable  
- [ ] Meta title/description set  
- [ ] Contact email mailbox monitored  
- [ ] No real student PII in marketing screenshots  
