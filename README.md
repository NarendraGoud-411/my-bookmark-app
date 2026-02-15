# 📑 MarkVault - Real-time Bookmark Manager

A professional, full-stack bookmarking application built with **Next.js 15** and **Supabase**. This project demonstrates secure OAuth authentication and real-time database synchronization.

## 🚀 Key Features

- **Google OAuth**: Secure login via Supabase Auth and Google Cloud.
- **Real-time Sync**: Uses PostgreSQL Replication to update the UI instantly when bookmarks are added or removed.
- **Row Level Security (RLS)**: Advanced database policies ensure users can only access their own data.
- **Clean UI/UX**: Built with a focus on usability using Tailwind CSS.

## 🛠️ Technical Stack

- **Framework**: Next.js 15 (App Router)
- **Database/Auth**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (useEffect, useState)

## 🔧 Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   npm install @supabase/supabase-js @supabase/ssr  for supabase setup

2. **Environment Variables**:
Create a .env.local and add:

NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key


3. **Database Setup**:

Enable the bookmarks table.

Set RLS Policy: auth.uid() = user_id.

Enable Real-time for the bookmarks table in the Supabase Dashboard.


**What I Learned** :

Loading States: Implemented a global loading spinner for better UX during session checks.

Subscription Lifecycle: Managing Supabase channels with useEffect cleanup to prevent memory leaks.

Error Handling: Added validation for URL inputs and database transaction feedback.


**Problems And Handling**

1. Connecting Database to Next.js :
The Problem: At first, my app could not "talk" to the database. I kept getting errors because the computer couldn't find my API keys.

The Solution: I learned that Next.js needs a special name for keys used on the frontend. I added NEXT_PUBLIC_ to the start of my variables in the .env.local file. After that, the connection worked perfectly.

2. Google Login Setup (The Handshake) :
The Problem: When I clicked "Login," it gave me an error saying "Redirect URI mismatch".

The Solution: I had to make sure three different websites had the exact same link: Google Cloud, Supabase, and my code. Once I updated the "Callback URL" in the Google settings to match Supabase, the login started working.

3. Fixing Code Crashes (JS Logic) : 
The Problem: The app would sometimes crash (go white) because it tried to load bookmarks before the user was even logged in.

The Solution: I added an "if" check in my code. I told the app: "Only fetch data if the user is logged in". I also added a loading spinner so the user knows the app is thinking.