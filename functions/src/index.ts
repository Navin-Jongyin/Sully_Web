import { initializeApp } from 'firebase-admin/app';
import { FieldValue } from 'firebase-admin/firestore';
import { defineSecret } from 'firebase-functions/params';
import { logger } from 'firebase-functions';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import nodemailer from 'nodemailer';

initializeApp();

const emailUser = defineSecret('BOOKING_EMAIL_USER');
const emailAppPassword = defineSecret('BOOKING_EMAIL_APP_PASSWORD');
const adminEmail = defineSecret('BOOKING_ADMIN_EMAIL');

interface BookingRecord {
  email?: string;
  name?: string;
  nickname?: string;
  phone?: string;
  date?: string;
  startTime?: string;
  timeLabel?: string;
  category?: string;
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function displayDate(isoDate: string): string {
  const parsed = new Date(`${isoDate}T00:00:00+07:00`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'full',
    timeZone: 'Asia/Bangkok',
  }).format(parsed);
}

export const sendInterviewBookingConfirmation = onDocumentCreated(
  {
    document: 'bookings/{bookingId}',
    region: 'asia-southeast1',
    secrets: [emailUser, emailAppPassword, adminEmail],
    retry: true,
  },
  async (event) => {
    const bookingSnapshot = event.data;
    if (!bookingSnapshot) return;

    const current = await bookingSnapshot.ref.get();
    if (current.get('emailNotification.sentAt')) return;

    const booking = bookingSnapshot.data() as BookingRecord;
    const applicantEmail = String(booking.email ?? '').trim();
    const senderEmail = emailUser.value().trim();
    const notificationEmail = adminEmail.value().trim();

    if (!applicantEmail || !senderEmail || !notificationEmail) {
      logger.error('Booking email is missing a recipient or sender', {
        bookingId: bookingSnapshot.id,
      });
      return;
    }

    const name = String(booking.name || booking.nickname || 'Applicant').trim();
    const date = displayDate(String(booking.date ?? ''));
    const time = String(booking.timeLabel || booking.startTime || '').trim();
    const category = String(booking.category || 'Interview').trim();
    const phone = String(booking.phone || '').trim();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: senderEmail,
        pass: emailAppPassword.value(),
      },
    });

    await transporter.sendMail({
      from: `"Sully Academy" <${senderEmail}>`,
      to: applicantEmail,
      bcc: notificationEmail,
      subject: `Interview booking confirmed — ${date}`,
      messageId: `<interview-booking-${bookingSnapshot.id}@sullyacademy.com>`,
      text: [
        `Hello ${name},`,
        '',
        'Your Sully Academy interview booking is confirmed.',
        '',
        `Date: ${date}`,
        `Time: ${time}`,
        `Category: ${category}`,
        phone ? `Phone: ${phone}` : '',
        '',
        'Please keep this email for your records. If you need to cancel, use the booking page at least 24 hours before your session.',
        '',
        'Sully Academy',
      ].filter(Boolean).join('\n'),
      html: `
        <div style="background:#f4f7fb;padding:32px 16px;font-family:Arial,sans-serif;color:#0b1526">
          <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e4e9f1;border-radius:18px;overflow:hidden">
            <div style="background:linear-gradient(135deg,#0b1424,#1d4ed8);padding:28px;color:#fff">
              <div style="font-size:13px;letter-spacing:.12em;text-transform:uppercase;opacity:.75">Sully Academy</div>
              <h1 style="font-size:24px;line-height:1.25;margin:8px 0 0">Interview booking confirmed</h1>
            </div>
            <div style="padding:28px">
              <p style="margin:0 0 20px">Hello ${escapeHtml(name)},</p>
              <p style="margin:0 0 22px;color:#5b6b81">Your interview session has been reserved successfully.</p>
              <div style="background:#f7f9fc;border:1px solid #e4e9f1;border-radius:12px;padding:18px">
                <p style="margin:0 0 10px"><strong>Date:</strong> ${escapeHtml(date)}</p>
                <p style="margin:0 0 10px"><strong>Time:</strong> ${escapeHtml(time)}</p>
                <p style="margin:0"><strong>Category:</strong> ${escapeHtml(category)}</p>
              </div>
              <p style="margin:22px 0 0;color:#5b6b81;font-size:14px;line-height:1.6">
                Keep this email for your records. To cancel, use the booking page at least 24 hours before your session.
              </p>
            </div>
          </div>
        </div>
      `,
    });

    await bookingSnapshot.ref.update({
      emailNotification: {
        sentAt: FieldValue.serverTimestamp(),
        applicant: applicantEmail,
        admin: notificationEmail,
      },
    });

    logger.info('Interview booking confirmation sent', {
      bookingId: bookingSnapshot.id,
      applicantEmail,
    });
  },
);
