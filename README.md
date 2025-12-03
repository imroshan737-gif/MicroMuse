#🎯 MicroMuse – Micro-Commitment Creative Challenge Platform

MicroMuse is a web-based creative habit-building and productivity platform designed to help users develop and sustain daily creative passions through micro-commitments of just 10–15 minutes per day. It supports creative domains like music, singing, dancing, writing, art, photography, fitness, public speaking, and many more.
The platform transforms creativity into a structured, trackable, and gamified journey using challenges, achievements, weekly goals, and personal milestones.

#🚀 What This Project Does

MicroMuse enables users to:

Register and log in securely using email & password authentication

Select multiple hobbies during onboarding

Receive personalized challenges based on selected hobbies

Track daily, weekly, and long-term progress

Maintain personal creative streaks

Build custom personal challenges

Monitor achievements and statistics in real time

Resume challenges from the exact time they left off

Edit and maintain a detailed user profile

View only relevant content tailored to their interests

The entire platform is optimized for consistency, motivation, and long-term personal growth through small daily actions.

#🧠 Core Concept – Micro-Commitment Model

Instead of overwhelming users with large goals, MicroMuse follows a Micro-Commitment Model:

Users invest only 10–15 minutes per day

Focus is on consistency over intensity

Small progress is recorded daily

Habit formation is strengthened through streaks and challenges

Motivation is driven by visual progress and achievements

This model is aligned with behavioral habit-forming principles.

#⚙️ How the System Works (Technical Flow)
##1️⃣ Authentication & User Onboarding

Users must log in or sign up before accessing the platform

Authentication is handled securely through Supabase Auth

During signup:

User selects preferred hobbies

Profile is created in the database

Initial achievements, stats, and challenges are assigned with default value = 0

##2️⃣ Profile Management

Users can:

Edit name, username, and email

Upload or change profile picture

Update hobbies and preferences

Manage personal settings securely

All changes are synced in real time with the Supabase database.

##3️⃣ Challenges System

There are three types of challenges:

✅ Hobby-Based Challenges

Visible only for hobbies selected by the user

Automatically personalized

Progress increases only when the user actively participates

✅ Weekly Challenges

Default value = 0 for all users

Timer starts only when the user presses “Continue Today”

Timer resumes from previous saved time

Tracks consistency across the week

✅ Personal Challenges

Fully user-created

User selects:

Title

Category (with extended options + “OTHERS”)

Duration

Daily goal

Progress tracked independently from system challenges

4️⃣ Achievements & Progress Tracking

All achievements start at 0 by default

Values increase only based on:

Record Stats

Progress

Achievements

No fake or prefilled values

Data is updated dynamically from the backend

5️⃣ Data Storage & Security

All data is securely stored in Supabase PostgreSQL

Authentication uses encrypted sessions 🔒

User-specific data isolation is enforced

Real-time synchronization ensures no data loss

#🖥️ Technology Stack
Frontend

React + TypeScript

Vite for fast bundling

Tailwind CSS for modern UI

Component-based architecture

Fully responsive design

Backend

Supabase

Authentication

PostgreSQL Database

Row Level Security

Real-time APIs

Dev Tools

ESLint

PostCSS

TypeScript Config

Environment-based configuration

#📂 Project Structure Overview

public/ → Static assets
src/components/ → Reusable UI components
src/pages/ → Application screens
src/hooks/ → Custom React hooks
src/integrations/ → Supabase client setup
src/store/ → Global state management
supabase/migrations/ → Database schema & migrations
.env → Environment secrets

#🧩 Where This Platform Works

Web Browsers (Chrome, Edge, Firefox, Brave)

Desktop and Mobile Responsive Views

Cloud-based deployment

Works on any OS with browser support

#🎯 Use Cases

Students building creative habits

Musicians improving consistency 🎵

Writers practicing daily ✍️

Dancers tracking routines 🩰

Fitness beginners staying consistent 🏋️

Public speakers practicing daily 🎤

#👥 SPOC (Single Point of Contact)

For this project, the SPOC is the designated authority responsible for all technical coordination, development decisions, and official communication related to MicroMuse. All queries, approvals, integrations, and troubleshooting are routed through the SPOC to ensure structured workflow and clear accountability.

#✅ Key Features Summary

Secure Authentication 🔐

Personalized Challenges 🎯

Weekly Progress Tracking 📊

Custom Personal Challenges 🧩

Real-Time Data Sync ⚡

Zero-default Achievements System

Chronological Time Resume System ⏱️

Responsive Modern UI 📱

Scalable Backend Architecture 🌐

#📜 License

This project is developed for educational, innovation, and hackathon purposes. Licensing can be added as per deployment needs.

#💡 Vision

MicroMuse aims to become a global digital companion for creative discipline, transforming small daily actions into life-changing creative mastery through structured micro-progress.
