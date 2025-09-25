import { EmailTemplate, SummaryResult, ActionItem } from './types'

interface MeetingInfo {
  title: string
  date: Date
  duration?: number
  attendees: string[]
  zoomMeetingId?: string
}

interface EmailTemplateOptions {
  meeting: MeetingInfo
  summary: SummaryResult
  actionItems: ActionItem[]
  recipientName?: string
  senderName?: string
  includeTranscriptLink?: boolean
  transcriptUrl?: string
}

export class EmailTemplateService {
  generateMeetingSummaryEmail(options: EmailTemplateOptions): EmailTemplate {
    const { meeting, summary, actionItems, recipientName, senderName } = options

    const subject = `Meeting Summary: ${meeting.title}`
    const html = this.createHtmlTemplate(options)
    const text = this.createTextTemplate(options)

    return {
      subject,
      html,
      text,
    }
  }

  private createHtmlTemplate(options: EmailTemplateOptions): string {
    const { meeting, summary, actionItems, recipientName, senderName, includeTranscriptLink, transcriptUrl } = options

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short'
      })
    }

    const formatDuration = (seconds?: number) => {
      if (!seconds) return 'Duration not recorded'
      const minutes = Math.round(seconds / 60)
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`
    }

    const priorityColors = {
      high: '#ef4444',
      medium: '#f59e0b',
      low: '#10b981'
    }

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Meeting Summary</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #374151;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9fafb;
        }
        .container {
            background-color: #ffffff;
            border-radius: 12px;
            padding: 32px;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 32px;
            padding-bottom: 24px;
            border-bottom: 2px solid #e5e7eb;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 8px;
        }
        .meeting-title {
            font-size: 20px;
            font-weight: 600;
            color: #1f2937;
            margin: 16px 0 8px 0;
        }
        .meeting-meta {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 24px;
        }
        .section {
            margin-bottom: 28px;
        }
        .section-title {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid #e5e7eb;
        }
        .overview {
            font-size: 15px;
            line-height: 1.7;
            color: #4b5563;
            padding: 16px;
            background-color: #f3f4f6;
            border-radius: 8px;
        }
        .key-points, .decisions, .next-steps {
            list-style: none;
            padding: 0;
        }
        .key-points li, .decisions li, .next-steps li {
            margin-bottom: 8px;
            padding-left: 20px;
            position: relative;
        }
        .key-points li::before {
            content: "•";
            color: #3b82f6;
            font-weight: bold;
            position: absolute;
            left: 0;
        }
        .decisions li::before {
            content: "✓";
            color: #10b981;
            font-weight: bold;
            position: absolute;
            left: 0;
        }
        .next-steps li::before {
            content: "→";
            color: #f59e0b;
            font-weight: bold;
            position: absolute;
            left: 0;
        }
        .action-items {
            margin-top: 16px;
        }
        .action-item {
            background-color: #fff;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 12px;
        }
        .action-item-text {
            font-weight: 500;
            color: #1f2937;
            margin-bottom: 8px;
        }
        .action-item-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            font-size: 13px;
            color: #6b7280;
        }
        .priority-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            color: white;
        }
        .attendees {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        .attendee {
            background-color: #e5e7eb;
            color: #374151;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 13px;
        }
        .footer {
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 13px;
            color: #6b7280;
        }
        .transcript-link {
            display: inline-block;
            margin: 16px 0;
            padding: 12px 24px;
            background-color: #3b82f6;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
        }
        .transcript-link:hover {
            background-color: #2563eb;
        }
        @media (max-width: 480px) {
            body {
                padding: 12px;
            }
            .container {
                padding: 20px;
            }
            .meeting-title {
                font-size: 18px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">📝 Meeting Phantom Ultra</div>
            <div class="meeting-title">${meeting.title}</div>
            <div class="meeting-meta">
                ${formatDate(meeting.date)} • ${formatDuration(meeting.duration)}
            </div>
        </div>

        ${recipientName ? `<p>Hi ${recipientName},</p>` : ''}

        <p>Here's the AI-generated summary from your recent meeting${senderName ? ` (sent by ${senderName})` : ''}:</p>

        <div class="section">
            <h3 class="section-title">📋 Overview</h3>
            <div class="overview">${summary.overview}</div>
        </div>

        ${summary.keyPoints.length > 0 ? `
        <div class="section">
            <h3 class="section-title">🔑 Key Discussion Points</h3>
            <ul class="key-points">
                ${summary.keyPoints.map(point => `<li>${point}</li>`).join('')}
            </ul>
        </div>
        ` : ''}

        ${summary.decisions.length > 0 ? `
        <div class="section">
            <h3 class="section-title">✅ Decisions Made</h3>
            <ul class="decisions">
                ${summary.decisions.map(decision => `<li>${decision}</li>`).join('')}
            </ul>
        </div>
        ` : ''}

        ${summary.nextSteps.length > 0 ? `
        <div class="section">
            <h3 class="section-title">🎯 Next Steps</h3>
            <ul class="next-steps">
                ${summary.nextSteps.map(step => `<li>${step}</li>`).join('')}
            </ul>
        </div>
        ` : ''}

        ${actionItems.length > 0 ? `
        <div class="section">
            <h3 class="section-title">📌 Action Items</h3>
            <div class="action-items">
                ${actionItems.map(item => `
                <div class="action-item">
                    <div class="action-item-text">${item.text}</div>
                    <div class="action-item-meta">
                        ${item.assignee ? `<span><strong>Assigned to:</strong> ${item.assignee}</span>` : ''}
                        ${item.dueDate ? `<span><strong>Due:</strong> ${item.dueDate.toLocaleDateString()}</span>` : ''}
                        <span class="priority-badge" style="background-color: ${priorityColors[item.priority]}">${item.priority}</span>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        <div class="section">
            <h3 class="section-title">👥 Attendees</h3>
            <div class="attendees">
                ${meeting.attendees.map(attendee => `<span class="attendee">${attendee}</span>`).join('')}
            </div>
        </div>

        ${includeTranscriptLink && transcriptUrl ? `
        <div class="section" style="text-align: center;">
            <a href="${transcriptUrl}" class="transcript-link">View Full Transcript</a>
        </div>
        ` : ''}

        <div class="footer">
            <p>This summary was automatically generated by Meeting Phantom Ultra.<br>
            ${meeting.zoomMeetingId ? `Meeting ID: ${meeting.zoomMeetingId}` : ''}</p>
        </div>
    </div>
</body>
</html>`
  }

  private createTextTemplate(options: EmailTemplateOptions): string {
    const { meeting, summary, actionItems, recipientName, senderName } = options

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short'
      })
    }

    const formatDuration = (seconds?: number) => {
      if (!seconds) return 'Duration not recorded'
      const minutes = Math.round(seconds / 60)
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`
    }

    let text = `MEETING PHANTOM ULTRA - MEETING SUMMARY\n\n`
    text += `Meeting: ${meeting.title}\n`
    text += `Date: ${formatDate(meeting.date)}\n`
    text += `Duration: ${formatDuration(meeting.duration)}\n\n`

    if (recipientName) {
      text += `Hi ${recipientName},\n\n`
    }

    text += `Here's the AI-generated summary from your recent meeting${senderName ? ` (sent by ${senderName})` : ''}:\n\n`

    text += `OVERVIEW:\n${summary.overview}\n\n`

    if (summary.keyPoints.length > 0) {
      text += `KEY DISCUSSION POINTS:\n`
      summary.keyPoints.forEach(point => {
        text += `• ${point}\n`
      })
      text += `\n`
    }

    if (summary.decisions.length > 0) {
      text += `DECISIONS MADE:\n`
      summary.decisions.forEach(decision => {
        text += `✓ ${decision}\n`
      })
      text += `\n`
    }

    if (summary.nextSteps.length > 0) {
      text += `NEXT STEPS:\n`
      summary.nextSteps.forEach(step => {
        text += `→ ${step}\n`
      })
      text += `\n`
    }

    if (actionItems.length > 0) {
      text += `ACTION ITEMS:\n`
      actionItems.forEach((item, index) => {
        text += `${index + 1}. ${item.text}\n`
        if (item.assignee) text += `   Assigned to: ${item.assignee}\n`
        if (item.dueDate) text += `   Due: ${item.dueDate.toLocaleDateString()}\n`
        text += `   Priority: ${item.priority.toUpperCase()}\n\n`
      })
    }

    text += `ATTENDEES:\n`
    meeting.attendees.forEach(attendee => {
      text += `• ${attendee}\n`
    })

    text += `\n---\n`
    text += `This summary was automatically generated by Meeting Phantom Ultra.\n`
    if (meeting.zoomMeetingId) {
      text += `Meeting ID: ${meeting.zoomMeetingId}\n`
    }

    return text
  }
}