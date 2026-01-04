#🎯 MicroMuse – Micro-Commitment Creative Challenge Platform

MicroMuse is a web-based creative habit-building and productivity platform designed to help users develop and sustain daily creative passions through micro-commitments of just 10–15 minutes per day.
It supports creative domains like music, singing, dancing, writing, art, photography, fitness, public speaking, and many more.

The platform transforms creativity into a structured, trackable, AI-powered, and gamified journey using challenges, achievements, weekly goals, personal milestones, immersive visuals, and intelligent assistance.

---

##🚀 What This Project Does

-MicroMuse enables users to:
-Register and log in securely using email & password authentication
-Track daily, weekly, and long-term progress
-Maintain personal creative streaks
-Build custom personal challenges
-Monitor achievements and statistics in real time
-Edit and maintain a detailed user profile
-Ask questions and get instant help via an AI chatbot
-View and manage all creative works uploaded by the user
-Experience an enhanced interactive 3D animated background

---

##🧠 Core Concept – Micro-Commitment Model

-Instead of overwhelming users with large goals, MicroMuse follows a Micro-Commitment Model:
-Users invest only 10–15 minutes per day
-Focus is on consistency over intensity
-Small progress is recorded daily
-Habit formation is strengthened through streaks and challenges
-Motivation is driven by visual progress, AI feedback, and achievements
-This model aligns with proven behavioral habit-forming principles.

--- 

##🤖 AI-Powered Chatbot

-MicroMuse includes an integrated AI Chatbot designed to support users throughout their creative journey:
-Answers user questions instantly
-Explains platform features and workflows
-Helps users understand challenges and progress
-The chatbot acts as a smart assistant available at all times.

---

##📁 Creative Uploads & Personal Archive

###MicroMuse provides a dedicated section where users can view all their uploaded creative work:

-Centralized archive of user uploads
-Supports tracking progress over time
-Keeps creative history organized and accessible

---

##⚙️ How the System Works

###🔐 Authentication & User Onboarding

-Secure login and signup using Supabase Auth
-Encrypted session handling
-Hobby selection during onboarding
-User profile creation in database
-Initial stats, achievements, and challenges set to 0

###👤 Profile Management

-Users can:
-Edit name, username, and email
-Upload or change profile picture
-Update hobbies and preferences
-Manage personal settings securely
-All updates sync in real time with the database.

###🎯 Challenges System

MicroMuse supports three types of challenges:

###✅ Hobby-Based Challenges

-Visible only for selected hobbies
-Automatically personalized
-Progress increases only on user participation

###✅ Weekly Challenges

-Default value = 0 for all users
-Timer starts only when user clicks “Continue Today”
-Timer resumes from last saved time
-Tracks weekly consistency

###✅ Personal Challenges

-Fully user-created
-Custom title, category, duration, and daily goal
-Includes extended categories with “OTHERS” option
-Tracked independently

###🏆 Achievements & Progress Tracking

-All achievements start at 0
-No fake or prefilled data
-Progress updates only through real activity
-Dynamic real-time backend updates
-Visual representation of growth and streaks

###🔒 Data Storage & Security

-Supabase PostgreSQL database
-Row Level Security (RLS) enforced
-User-specific data isolation
-Encrypted authentication sessions
-Real-time synchronization

---

##🖥️ Technology Stack

###🎨 Frontend

-React + TypeScript
-Vite for fast bundling
-Tailwind CSS for modern UI
-Component-based architecture
-Fully responsive design

###🗄️ Backend

-Supabase Authentication
-PostgreSQL Database
-Real-time APIs
-Secure access policies

###🛠️ Developer Tools

-ESLint
-PostCSS
-TypeScript Configuration
-Environment-based setup

---

##🌍 Platform Compatibility

-Works on all modern web browsers
-Desktop and mobile responsive
-OS-independent
-Cloud deployable

--- 

##🎯 Use Cases

-Students building creative habits
-Musicians improving consistency
-Writers practicing daily
-Dancers tracking routines
-Fitness beginners staying consistent
-Public speakers practicing daily

---

##👥 SPOC (Single Point of Contact)

The SPOC is responsible for all technical coordination, development decisions, integrations, and official communication related to MicroMuse, ensuring structured workflow and accountability.

---

-✅ Key Features Summary

-Secure Authentication 🔐
-Personalized Challenges 🎯
-AI Chatbot Assistance 🤖
-Weekly Progress Tracking 📊
-Custom Personal Challenges 🧩
-Creative Upload Archive 📁
-Real-Time Data Sync ⚡
-Zero-Default Achievements System
-Chronological Time Resume ⏱️
-Enhanced 3D Visual Background 🌌
-Responsive Modern UI 📱
-Scalable Backend Architecture 🌐

--- 

##📜 License

Developed for educational, innovation, and hackathon purposes. License can be added as required.

---

##💡 Vision

MicroMuse aims to become a global digital companion for creative discipline, transforming small daily actions into life-changing creative mastery through structured micro-progress.
