# Dojo Master Hub Premium Redesign

## Direction
- Preserve every existing page, workflow, role, and database structure.
- Apply the selected **Crimson Dojo** palette, **Bebas Neue + Barlow** typography, and **command-grid** layout.
- Keep the experience dark, disciplined, modern Goju-Ryu, and restrained—never Kyokushin-styled, game-like, or overloaded.

## Build plan
1. **Foundation and motion**
   - Replace the current visual tokens with a cohesive near-black, deep-crimson, antique-gold, and soft-white system.
   - Standardize spacing, compact radii, borders, shadows, buttons, fields, tables, dialogs, tooltips, skeletons, empty states, and success feedback.
   - Add subtle route transitions, reusable scroll reveals, count-up metrics, animated progress fills, press states, and reduced-motion behavior.

2. **Navigation and mobile shell**
   - Refine the public navigation and create role-aware student/Sensei navigation without changing routes.
   - Add a touch-friendly mobile bottom bar for primary authenticated areas, keeping secondary destinations accessible without crowding.
   - Reflow tables, filters, dialogs, cards, and forms for narrow screens and safe touch targets.

3. **Student command center**
   - Recompose the existing student overview into a premium command grid highlighting belt, attendance, goals, streak, upcoming events, achievements, and recent activity from existing data.
   - Improve metric hierarchy, first-load number animation, progress visualization, and loading/empty states.
   - Retain the existing student tabs and actions while making navigation clearer on desktop and mobile.

4. **Training experience**
   - Redesign the belt roadmap so completed, current, selected, and upcoming belts are immediately distinguishable.
   - Polish the technique library filters, technique cards, typography, category progress, and detail presentation.
   - Improve the existing journal, goals, heatmap, leaderboard, badges, and event views without adding a separate training system.

5. **Events, achievements, and feedback**
   - Present events in polished timeline/card layouts with clear date and status treatments.
   - Add restrained badge and achievement entrance/unlock motion without changing unlock logic.
   - Unify notification and toast styling with clear icons, hierarchy, and subtle success motion.

6. **Sensei command center**
   - Polish the existing dashboard tabs, overview metrics, student management, attendance analytics, events, messages, fees, achievements, gallery, timings, announcements, settings, forms, and dialogs.
   - Keep bulk resync, format controls, report generation, account management, and all existing actions unchanged.
   - Convert dense tables into usable mobile card rows while preserving desktop scanning efficiency.

7. **Public pages and final validation**
   - Carry the same visual system across the homepage and all public pages while preserving their content.
   - Correct the outdated affiliation label still visible in the footer to match the existing Okinawa Goju-Ryu wording.
   - Verify logged-out, student, and Sensei experiences at desktop and 360px mobile widths; check transitions, overflow, dialogs, empty/loading states, and current build/runtime signals.

## Technical notes
- Frontend presentation changes only; no migrations or backend architecture changes.
- Existing React Router routes, authentication, data queries, PDF reports, fees, messages, events, and management actions remain intact.
- The current project already has reusable reveal/count-up utilities and responsive UI primitives; these will be consolidated rather than duplicated.
- No AI Sensei, no invented metrics or content, and no new training feature unless an existing Training Mode is found during implementation.
