# 📧 Contact Form Messages Guide

## 📍 Where Contact Messages Go

When someone submits the contact form on your website, messages are saved to your **Supabase database** in the `contacts` table.

---

## 👀 How to View Messages

### Method 1: Supabase Dashboard (Recommended)

1. **Go to Supabase** → Your project
2. Click **Table Editor** in the sidebar
3. Select **contacts** table
4. You'll see all messages with:
   - Name
   - Email
   - Message
   - Date submitted (created_at)

### Method 2: SQL Query

In Supabase **SQL Editor**, run:
```sql
SELECT * FROM contacts ORDER BY created_at DESC;
```

This shows all messages, newest first.

---

## 📱 Getting Email Notifications

Currently, messages are only saved to the database. To get email notifications when someone submits a form, you have a few options:

### Option A: Supabase Database Webhooks (Recommended)

1. Go to **Database** → **Webhooks** in Supabase
2. Create a new webhook
3. Trigger: `INSERT` on `contacts` table
4. Use a service like:
   - **Zapier** - Connect to Gmail/Email
   - **Make (Integromat)** - Send email notifications
   - **n8n** - Self-hosted automation

### Option B: Email Service (Requires Code)

Add an email service to your website:
- **SendGrid** (free tier: 100 emails/day)
- **Resend** (free tier: 100 emails/day)
- **AWS SES**

Would need to update the contact form code to send emails.

### Option C: Check Manually

Just check the Supabase dashboard daily/weekly to see new messages!

---

## 📊 Contact Messages Data Structure

Each message includes:
```
id: unique identifier
name: sender's name
email: sender's email (for replies)
message: the actual message
created_at: timestamp when submitted
```

---

## 💡 Quick Check Query

To see just recent messages:
```sql
SELECT name, email, message, created_at 
FROM contacts 
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

---

## 🔔 Email Notification Setup (If You Want It)

If you'd like me to add automatic email notifications to **adrienglaurios@gmail.com**, I can add that feature using a free email service. Just let me know!

It would:
- Send you an email when someone submits the form
- Include their name, email, and message
- Be completely automated

---

## 📝 Example Messages View

In Supabase Table Editor, you'll see something like:

| Name | Email | Message | Created At |
|------|-------|---------|------------|
| John Doe | john@example.com | When is the next tournament? | 2025-01-03 14:30 |
| Jane Smith | jane@email.com | How do I join GRIMS? | 2025-01-03 12:15 |

---

## 🆘 Troubleshooting

### Messages not appearing?

1. Check if `contacts` table exists:
   ```sql
   SELECT * FROM contacts LIMIT 1;
   ```

2. If table doesn't exist, run the setup SQL script again

3. Check browser console for errors when submitting form

### Want to export messages?

In Supabase Table Editor:
1. View the contacts table
2. Click the download icon
3. Export as CSV

---

## 🎯 Quick Actions

**View all messages:**
```sql
SELECT * FROM contacts ORDER BY created_at DESC;
```

**Count total messages:**
```sql
SELECT COUNT(*) FROM contacts;
```

**Delete old messages (optional):**
```sql
DELETE FROM contacts WHERE created_at < NOW() - INTERVAL '30 days';
```

---

**Note:** Messages are stored securely in Supabase. Only you (with admin access) can view them.

For automatic email notifications to **adrienglaurios@gmail.com**, let me know and I can add that feature! 📧
