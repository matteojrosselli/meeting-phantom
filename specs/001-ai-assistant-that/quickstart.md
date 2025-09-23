# Quickstart Guide: AI Meeting Assistant

## Overview
This quickstart validates the core user journey from signup to receiving meeting summaries via email.

## Prerequisites
- Test Zoom account with meeting scheduling capability
- Test Gmail account for email delivery
- Development environment setup (Node.js 18+, Supabase, Clerk)

## Core User Journey Test

### Step 1: User Signup and Authentication
**Action**: Test user registration and authentication flow
```bash
# Navigate to application
curl -X GET http://localhost:3000/

# Expected: Clerk authentication UI displayed
# User can sign up with email/password or OAuth
```

**Validation**:
- [ ] Clerk signup form renders correctly
- [ ] User can create account with valid email
- [ ] User is redirected to dashboard after signup
- [ ] User profile is created in Supabase database

### Step 2: Connect Zoom Account
**Action**: Test Zoom OAuth integration
```bash
# Initiate Zoom connection
curl -X POST http://localhost:3000/api/auth/zoom/connect \
  -H "Authorization: Bearer $CLERK_JWT" \
  -H "Content-Type: application/json"

# Expected: OAuth URL returned for Zoom authorization
```

**Validation**:
- [ ] OAuth URL generated correctly
- [ ] User redirected to Zoom authorization page
- [ ] OAuth callback handled successfully
- [ ] Zoom tokens stored securely in database
- [ ] User profile shows `zoomConnected: true`

### Step 3: Connect Gmail Account
**Action**: Test Gmail OAuth integration
```bash
# Initiate Gmail connection
curl -X POST http://localhost:3000/api/auth/gmail/connect \
  -H "Authorization: Bearer $CLERK_JWT" \
  -H "Content-Type: application/json"

# Expected: OAuth URL returned for Gmail authorization
```

**Validation**:
- [ ] OAuth URL generated correctly
- [ ] User redirected to Gmail authorization page
- [ ] OAuth callback handled successfully
- [ ] Gmail tokens stored securely in database
- [ ] User profile shows `gmailConnected: true`

### Step 4: Schedule Test Meeting
**Action**: Create a test meeting in Zoom
```bash
# Create meeting via Zoom API (simulated)
curl -X POST http://localhost:3000/api/meetings \
  -H "Authorization: Bearer $CLERK_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "zoomMeetingId": "12345678901",
    "title": "Test Meeting - AI Assistant",
    "scheduledStart": "2025-09-23T15:00:00Z",
    "meetingUrl": "https://zoom.us/j/12345678901",
    "participants": [
      {"name": "Test User", "email": "test@example.com"},
      {"name": "Test Participant", "email": "participant@example.com"}
    ]
  }'
```

**Validation**:
- [ ] Meeting created in database with status `scheduled`
- [ ] Meeting appears in user dashboard
- [ ] Meeting details stored correctly

### Step 5: Simulate Meeting Start
**Action**: Test bot joining meeting workflow
```bash
# Simulate Zoom webhook for meeting start
curl -X POST http://localhost:3000/api/webhooks/zoom \
  -H "x-zm-signature: $ZOOM_SIGNATURE" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "meeting.started",
    "payload": {
      "object": {
        "id": "12345678901",
        "start_time": "2025-09-23T15:00:00Z"
      }
    }
  }'
```

**Validation**:
- [ ] Webhook received and validated
- [ ] Meeting status updated to `in_progress`
- [ ] Bot joining process initiated
- [ ] AssemblyAI transcription started
- [ ] Real-time transcription data flowing

### Step 6: Simulate Meeting End
**Action**: Test meeting completion and processing
```bash
# Simulate Zoom webhook for meeting end
curl -X POST http://localhost:3000/api/webhooks/zoom \
  -H "x-zm-signature: $ZOOM_SIGNATURE" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "meeting.ended",
    "payload": {
      "object": {
        "id": "12345678901",
        "end_time": "2025-09-23T15:30:00Z"
      }
    }
  }'
```

**Validation**:
- [ ] Meeting status updated to `completed`
- [ ] Transcript finalized in database
- [ ] AI processing triggered for summary generation
- [ ] Action items extracted successfully
- [ ] Summary generated with key points and decisions

### Step 7: Verify Email Summary
**Action**: Check email delivery to participants
```bash
# Check email status
curl -X GET http://localhost:3000/api/meetings/12345678901 \
  -H "Authorization: Bearer $CLERK_JWT"
```

**Validation**:
- [ ] Email records created for all participants
- [ ] Gmail API called successfully
- [ ] Emails delivered to participant inboxes
- [ ] Email content includes:
  - [ ] Meeting title and date
  - [ ] Executive summary
  - [ ] Key discussion points
  - [ ] Action items with assignees
  - [ ] Next steps
- [ ] Email status shows `sent`

### Step 8: Dashboard Verification
**Action**: Test user dashboard functionality
```bash
# Get user's meeting history
curl -X GET http://localhost:3000/api/meetings?limit=10 \
  -H "Authorization: Bearer $CLERK_JWT"
```

**Validation**:
- [ ] Meeting appears in dashboard
- [ ] Meeting details accessible via UI
- [ ] Transcript viewable
- [ ] Summary and action items displayed
- [ ] User can toggle meeting exclusion settings

## Edge Case Testing

### Meeting Exclusion
**Test**: User excludes a meeting from AI processing
```bash
# Exclude meeting
curl -X PATCH http://localhost:3000/api/meetings/12345678901 \
  -H "Authorization: Bearer $CLERK_JWT" \
  -H "Content-Type: application/json" \
  -d '{"isExcluded": true}'
```

**Validation**:
- [ ] Meeting marked as excluded
- [ ] Bot does not join excluded meetings
- [ ] Status remains `scheduled` or changes to `skipped`

### Failed Transcription
**Test**: Handle transcription service failure
```bash
# Simulate AssemblyAI failure
# (Mock API response with error status)
```

**Validation**:
- [ ] Error handled gracefully
- [ ] Meeting status updated to `failed`
- [ ] User notified via email about failure
- [ ] No summary generated for failed transcription

### Email Delivery Failure
**Test**: Handle Gmail API failure
```bash
# Simulate Gmail API error
# (Mock API response with error status)
```

**Validation**:
- [ ] Email retry mechanism activated
- [ ] Email status shows `failed` after max retries
- [ ] Error details logged for debugging
- [ ] User notified of delivery issues

## Performance Testing

### Response Time Validation
**Test**: API response times under load
```bash
# Test API endpoints with timing
time curl -X GET http://localhost:3000/api/meetings \
  -H "Authorization: Bearer $CLERK_JWT"
```

**Validation**:
- [ ] GET /api/meetings responds < 200ms
- [ ] POST /api/meetings responds < 500ms
- [ ] Meeting details load < 300ms
- [ ] Dashboard loads < 1000ms

### Concurrent Meeting Handling
**Test**: Multiple simultaneous meetings
```bash
# Create multiple test meetings
# Start them concurrently via webhooks
```

**Validation**:
- [ ] Multiple meetings processed simultaneously
- [ ] No race conditions in database
- [ ] AssemblyAI API limits respected
- [ ] All meetings complete successfully

## Data Retention Testing

### Cleanup Validation
**Test**: 30-day data retention policy
```bash
# Create old test meeting (simulate old timestamp)
# Run cleanup function
```

**Validation**:
- [ ] Meetings older than 30 days deleted
- [ ] Associated transcripts/summaries removed
- [ ] User accounts and preferences preserved
- [ ] Cleanup runs without errors

## Security Testing

### Authentication Validation
**Test**: Protected endpoints security
```bash
# Test without authorization header
curl -X GET http://localhost:3000/api/meetings

# Expected: 401 Unauthorized
```

**Validation**:
- [ ] Unauthorized requests rejected
- [ ] JWT validation working correctly
- [ ] User can only access own meetings
- [ ] OAuth tokens encrypted at rest

## Success Criteria
All tests above must pass for quickstart validation to be complete:

- [ ] **Core Journey**: User can sign up, connect accounts, and receive meeting summaries
- [ ] **Integration**: Zoom and Gmail APIs working correctly
- [ ] **Processing**: Transcription and AI summarization functional
- [ ] **Performance**: API responses meet constitutional requirements (<200ms)
- [ ] **Security**: Authentication and authorization properly implemented
- [ ] **Reliability**: Error handling and edge cases covered
- [ ] **Data Management**: Retention policy working correctly

## Environment Setup Notes

### Required Environment Variables
```env
# Clerk Authentication
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...

# Supabase Database
SUPABASE_URL=https://...supabase.co
SUPABASE_ANON_KEY=eyJ...
DATABASE_URL=postgresql://...

# Zoom Integration
ZOOM_CLIENT_ID=...
ZOOM_CLIENT_SECRET=...
ZOOM_WEBHOOK_SECRET=...

# AssemblyAI
ASSEMBLYAI_API_KEY=...

# Gmail Integration
GMAIL_CLIENT_ID=...
GMAIL_CLIENT_SECRET=...

# OpenAI (for summarization)
OPENAI_API_KEY=sk-...
```

### Test Data Setup
Create test accounts and meetings that can be used repeatedly for validation without affecting production data.