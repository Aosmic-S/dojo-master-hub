---
name: Roll No + DOB login
description: Student login uses Roll No + DOB instead of email/password
type: feature
---
Students log in with a **Roll No.** (e.g. `BJKA001`) and **Date of Birth** (YYYY-MM-DD).

How it works under the hood:
- Synthetic email: `{rollno_lowercase}@students.bjka.local`
- Password: the DOB string (YYYY-MM-DD)
- Admin assigns/edits the Roll No in the Add/Edit Student modal.
- Editing roll calls the `update-student-roll` edge function, which updates the auth email via the admin API so the student can log in with the new roll.
- Backfilled existing students with `BJKA001`, `BJKA002`, ... in the migration.

Login page has a Student/Admin toggle. Admins still use email + password.
