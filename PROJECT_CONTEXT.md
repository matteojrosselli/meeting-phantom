# Project Context: Meeting Phantom Ultra

## What This App Does
AI assistant that joins Zoom meetings automatically, transcribes conversations in real-time, and sends email summaries with action items to meeting participants.

## Tech Stack
- Frontend: Next.js with TypeScript
- Database: Supabase (PostgreSQL)  
- Authentication: Clerk
- Meeting Integration: Zoom API + AssemblyAI
- Deployment: Vercel

## Key Decisions Made
- Start with Zoom only (not Teams/Meet)
- Basic transcription + summary only
- Single user scope (no team features)
- Email delivery for action items

## Current Focus
Running Spec Kit /plan phase to define exact MVP architecture

## Known Constraints
- 3-week MVP timeline
- Solo developer
- Bootstrap budget (free tiers preferred)
