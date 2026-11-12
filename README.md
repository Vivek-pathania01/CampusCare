# CampusCare – Student Counselling Appointment Scheduler

CampusCare is a front-end CSE326 Internet Programming project that demonstrates a confidential-looking student counselling appointment workflow. It is built entirely with HTML, CSS, and browser JavaScript.

## Project structure

```
CampusCare/
├── index.html
├── login.html
├── counsellors.html
├── book.html
├── student-dashboard.html
├── counsellor-dashboard.html
├── profile.html
├── css/style.css
├── js/main.js
└── assets/images/
```

## Features

- Student and counsellor registration with role choice, validation, password confirmation, email-format checking, duplicate-email prevention, and password visibility controls.
- Role-based login, logout, session persistence during navigation, and protected pages.
- Auto-updating counsellor directory with search and specialisation filter.
- Student booking workflow with date validation, online/offline selection, unique appointment IDs, pending status, and occupied-slot prevention.
- Student dashboard showing only the logged-in student's appointments and status statistics. Active appointments can be cancelled.
- Counsellor dashboard showing only assigned requests. Counsellors can view details and approve or reject only pending appointments.
- Profile editing for both account types while preserving account ID, email, and role.
- Responsive professional interface using a shared CSS file and one shared JavaScript file.

## Technologies used

- HTML5 semantic structure, forms, tables, lists, links, and responsive metadata
- CSS3 layout, media queries, cards, hover states, colour styling, and responsive design
- JavaScript DOM manipulation, event handling, validation, arrays, objects, and browser storage

## How to run

Open `index.html` in a modern browser. For the most consistent local storage behavior, use a local development server such as VS Code Live Server; no server-side setup or package installation is required.

## Browser storage

The app stores three separate JSON collections in `localStorage`:

- `campusCareStudents`
- `campusCareCounsellors`
- `campusCareAppointments`

The active sign-in state is stored as `campusCareSession` in `sessionStorage`, so it lasts across page navigation in the current browser session. Data is not reset on page loads. If storage is empty or has malformed data, the application safely uses an empty collection.

On a fresh browser storage profile, three demo counsellors are added automatically to make the directory ready to explore. They never overwrite registered counsellors. Their demonstration password is `demo123`; their emails are visible on their directory cards.

## Student workflow

1. Create a Student account and log in.
2. Browse registered counsellors and select **Book Appointment**.
3. Submit a future-dated appointment request.
4. Review the request and its status in **My Dashboard**.
5. Cancel an active request if needed.

## Counsellor workflow

1. Create a Counsellor account (the profile then appears in the directory).
2. Log in and open the counsellor dashboard.
3. Review requests assigned only to that counsellor.
4. View details, then approve or reject pending requests.
5. The student sees the updated appointment status immediately after their dashboard refreshes.

## Important limitation

This is an academic front-end demonstration, not real authentication. Passwords and personal details are stored in browser storage and are not encrypted or safe for production use. A production system needs a backend, HTTPS, hashed passwords, secure server sessions, access control enforcement, database storage, auditing, and privacy/legal safeguards. CampusCare is also not an emergency service.

## CSE326 concepts used through Unit IV

The project uses the early web-programming scope: HTML page structure and semantic elements; hyperlinks, images-ready assets folder, lists and tables; CSS selectors, box model, colours, layout, responsiveness, and forms; JavaScript variables, functions, conditions, arrays, objects, form validation, DOM selection/manipulation, and event handlers. It also uses browser `localStorage` and `sessionStorage` for a small client-side demonstration of persistent data and session state.
