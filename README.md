# Dojo Website 



---



**🥋 LOVABLE PROMPT — Raja Janak Academy Website**



---



Build a full-stack portfolio + management web app for **Raja Janak Academy**, a Karate academy affiliated with **Drona Martial Arts Academy** (which is affiliated with WKF, KIO, SAKF, IOC, and Commonwealth Games).



---



**🎨 Design & Branding**

- Color palette: Deep red, black, and gold

- Style: Professional martial arts / sports academy aesthetic

- Logo placeholder with academy name in bold

- Mobile responsive throughout



---



**📄 Public Pages (Navbar tabs)**



1. **Home** — Hero section with academy name, tagline, affiliation badges (WKF, KIO, SAKF, IOC, Commonwealth Games logos/text), and a call-to-action "Join Now" button



2. **What We Offer** — Cards showing: Beginner Karate, Advanced Kata, Kumite Training, Self-Defense, Kids Program, Fitness & Conditioning



3. **Timings & Fee Structure** — Table showing batch timings (Morning/Evening), age groups, and monthly/quarterly/annual fee tiers



4. **Achievements** — Trophy wall / grid layout with medals, championships, student highlights and year filters



5. **Gallery** — Responsive image grid with category filters (Tournaments, Training, Events, Belts)



6. **Location** — Embedded Google Map, address, phone, email, WhatsApp button



7. **Contact** — Contact form (Name, Phone, Email, Message) + social links



---



**🔐 Login System (in Navbar)**



Two roles: **Admin (Sensei)** and **Student**



**Admin Dashboard:**

- Create & manage student profiles

- Each student profile must include: Full Name, Belt Level (White → Black with all intermediate belts), Date of Birth, Date of Joining Dojo, Father's Name, Weight (kg), Contact Number, Achievements, Profile Photo

- Daily report entry per student: Attendance, Performance notes, Skills practiced, Sensei remarks

- Generate **weekly report** per student (auto-compiled from daily entries) and push it to the student's profile

- View all students in a searchable/filterable table

- Dashboard stats: Total students, belt distribution chart, attendance rate this week



**Student Profile Page (after login):**

- View own profile (read-only): personal details, belt, joining date, achievements

- View weekly reports pushed by Admin

- View attendance history

- Cannot edit own profile — only Admin can



**Auth:**

- Admin login with hardcoded or env-variable credentials initially

- Student accounts created only by Admin (no self-signup)

- Use Supabase for auth + database



---



**🗄️ Database (Supabase)**



Tables needed:

- `students` — all profile fields listed above + user_id

- `daily_reports` — student_id, date, attendance (present/absent), performance, remarks, sensei_id

- `weekly_reports` — student_id, week_start, week_end, summary, pushed_at

- `achievements` — student_id, title, date, description



---



**⚙️ Tech Stack**

- React + Tailwind CSS

- Supabase (auth + DB)

- Shadcn/ui components

- React Router for page navigation



---



 *"add belt color badges to student cards"*  *"make the weekly report a printable PDF which will be avaiable on student profiles . "* .

Footer : made by Aosmic Studio

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2993b9bf-2b59-4e2f-82a4-1816b3bd98ba).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
