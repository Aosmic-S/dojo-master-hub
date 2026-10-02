# Academy Holidays, Attendance, and Senior Duty

## What will be added
- Add a Holiday option to the existing academy calendar. Saving a holiday will create a student announcement automatically and show the holiday clearly in the calendar and student profile.
- Add a dedicated Attendance section for the Sensei, separate from analytics, with a date picker and one-tap Present/Absent marking for every student.
- Add a Senior Duty section for the repeating Week 1–4 Monday, Tuesday, Thursday, and Friday junior-batch rota.
- Only students whose belt is Brown 1st Kyu can be assigned or take an open duty.
- On their duty day, the assigned senior can choose **Accept duty** or **Request a substitute**. Requesting a substitute immediately alerts the Sensei and opens the duty for another eligible senior to accept.
- Show pending and open duty alerts on the Sensei overview, including the senior's name and duty date.

## Experience by role
- **Sensei:** manages the rota, marks attendance, creates holidays, and sees substitute requests/open duties.
- **Brown 1st Kyu senior:** sees upcoming assigned duties and can accept or professionally request cover; can accept available open duties.
- **Other students:** see holiday announcements and holiday banners, without duty controls.

## Technical details
- Extend academy events with an event type and link holiday announcements to their calendar event.
- Add recurring duty-schedule and dated duty-response records with protected access rules.
- Use database validation so only Brown 1st Kyu students can be assigned to or claim senior duty.
- Keep existing calendar, announcements, reports, and analytics; no duplicate pages or replacement of working features.
