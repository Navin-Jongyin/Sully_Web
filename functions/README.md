# Interview booking email

When a document is created in the booking Firebase project's `bookings`
collection, `sendInterviewBookingConfirmation` sends a confirmation to the
applicant and BCCs the admin inbox.

## One-time setup

The sender must be a Gmail or Google Workspace account with 2-Step
Verification enabled. Create an App Password for that account, then set these
Firebase secrets from the repository root:

```sh
firebase functions:secrets:set BOOKING_EMAIL_USER --project booking
firebase functions:secrets:set BOOKING_EMAIL_APP_PASSWORD --project booking
firebase functions:secrets:set BOOKING_ADMIN_EMAIL --project booking
```

- `BOOKING_EMAIL_USER`: sender Gmail/Workspace address
- `BOOKING_EMAIL_APP_PASSWORD`: 16-character Google App Password
- `BOOKING_ADMIN_EMAIL`: inbox that receives the admin copy

Deploy to the separate interview-booking Firebase project:

```sh
npm --prefix functions run deploy
```

The booking Firebase project must be on the Blaze plan to deploy Cloud
Functions.
