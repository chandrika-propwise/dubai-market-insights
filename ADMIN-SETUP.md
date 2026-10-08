# Enable your private Propwise workspace

The public dashboard works immediately. The Propwise workspace is hidden from public navigation and protected on the server. Until you complete the steps below, nobody can open the internal pages.

## 1. Create your Supabase project

1. Visit https://supabase.com and create or sign in to your account.
2. Create a new project. Choose a project name such as **Propwise Market Intelligence** and a strong database password. Keep the password in your password manager; you do not need to put it in the application.
3. Wait for the project to finish provisioning.
4. Find the **Project URL** in the project's Connect dialog or **Project Settings → Data API**.
5. Find the **publishable key** in **Project Settings → API Keys**. Copy the publishable key, not a secret key or service-role key.

Menu names can change; both values are project connection settings. You don't need an AI API key or a market-data database for the current interface.

## 2. Configure the app on your computer

1. Open the updated project folder in VS Code.
2. Find `.env.example` in the Explorer panel.
3. Create a new file named exactly `.env.local` in the same folder as `package.json`.
4. Add the following two lines, replacing the example values with your own project settings:

```dotenv
SUPABASE_URL=https://YOUR_PROJECT_REFERENCE.supabase.co
SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

Save the file. It is ignored by Git and should never be uploaded to GitHub. Never put your account password, database password, or a service-role key here. The app uses server-side password sign-in and session verification.

## 3. Create your administrator account

1. In Supabase, open **Authentication → Users**.
2. Choose **Add user → Create new user** (or the equivalent Create user action).
3. Enter your administrator email and a strong password. Confirm the email through the dashboard's confirmation option or the email confirmation flow.
4. Copy the UUID of the specific user you just created.
5. Open Supabase's **SQL Editor**, start a new query, and paste this query:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
  || '{"role":"admin"}'::jsonb
where id = 'PASTE_YOUR_ADMIN_USER_UUID_HERE'
returning id;
```

6. Replace `PASTE_YOUR_ADMIN_USER_UUID_HERE` with that user's actual UUID before running it. The result should contain exactly that one user ID. If no row is returned, recheck the UUID.

Only a trusted project administrator should run this SQL. Do not remove the `where` condition. The application does not let public visitors register or assign roles. User-editable profile metadata cannot grant admin access.

## 4. Start and review

If the app is already running, click its VS Code terminal and press **Control + C** once to stop it. Then run:

```sh
npm ci
npm run dev
```

Open these pages in your browser:

- **Public dashboard:** http://localhost:3000
- **Admin login:** http://localhost:3000/admin/login

Sign in using the administrator email and password from step 3. After successful verification, the Propwise workspace section appears inside the admin workspace. Its Market Data Manager page is still a placeholder; uploads and publishing have not been added.

To check privacy, open a private/incognito browser window and visit http://localhost:3000/internal/market-data. You should be redirected to the admin login page. A user without the server-assigned admin role must also be denied. Use **Sign out** in the admin navigation to end your session.

## Troubleshooting

- **“Admin sign-in is awaiting setup”:** check that `.env.local` is beside `package.json`, both variables have values, and you restarted the app after saving it.
- **“Unable to sign in”:** check the email/password and ensure the Supabase user exists and its email is confirmed.
- **“Available to authorized Propwise administrators only”:** verify the role assignment query was run for the same account you are signing in with.
- **Connection failure:** verify the project URL, publishable key, and Internet access to your Supabase project. In the cloud environment, configure the two environment variables in environment settings and allow your exact project hostname in network settings.

Don't paste passwords or private keys into chat. No public deployment has been performed; hosting can be prepared after you approve it.
