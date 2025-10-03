// Google Meet Integration Service
// This service handles creating Google Meet links and sending invitations

export interface LessonDetails {
  studentEmail: string;
  studentName: string;
  teacherName: string;
  date: string;
  time: string;
  duration: number; // in minutes
  subject: string;
}

export interface GoogleMeetInvitation {
  meetLink: string;
  joinUrl: string;
  meetingId: string;
  startTime: string;
  endTime: string;
}

/**
 * Generate a Google Meet link for a lesson
 * In a real implementation, this would integrate with Google Calendar API
 */
export const createGoogleMeetInvitation = async (lessonDetails: LessonDetails): Promise<GoogleMeetInvitation> => {
  // Generate a random meeting ID (in real app, this would come from Google Calendar API)
  const meetingId = generateMeetingId();
  const meetLink = `https://meet.google.com/${meetingId}`;
  
  // Calculate start and end times
  const startTime = new Date(`${lessonDetails.date}T${lessonDetails.time}`);
  const endTime = new Date(startTime.getTime() + lessonDetails.duration * 60000);
  
  const invitation: GoogleMeetInvitation = {
    meetLink,
    joinUrl: meetLink,
    meetingId,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString()
  };
  
  // In a real implementation, you would:
  // 1. Create a Google Calendar event
  // 2. Add Google Meet video conference to the event
  // 3. Send email invitations to student and teacher
  // 4. Store the meeting details in your database
  
  console.log('Google Meet invitation created:', invitation);
  
  return invitation;
};

/**
 * Send email invitation with Google Meet link
 * In a real implementation, this would use an email service like SendGrid, AWS SES, etc.
 */
export const sendGoogleMeetInvitation = async (
  lessonDetails: LessonDetails, 
  invitation: GoogleMeetInvitation
): Promise<boolean> => {
  try {
    const emailContent = generateEmailContent(lessonDetails, invitation);
    
    // Mock email sending - in real app, integrate with email service
    console.log('Sending email invitation:', {
      to: lessonDetails.studentEmail,
      subject: `Korean Lesson Booking Confirmation - ${lessonDetails.date}`,
      content: emailContent
    });
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true;
  } catch (error) {
    console.error('Failed to send Google Meet invitation:', error);
    return false;
  }
};

/**
 * Generate a random meeting ID for Google Meet
 */
function generateMeetingId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate email content for the invitation
 */
function generateEmailContent(lessonDetails: LessonDetails, invitation: GoogleMeetInvitation): string {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #a855f7;">Korean Lesson Booking Confirmation</h2>
          
          <p>Dear ${lessonDetails.studentName},</p>
          
          <p>Your Korean lesson has been successfully booked! Here are the details:</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #a855f7;">Lesson Details</h3>
            <p><strong>Date:</strong> ${lessonDetails.date}</p>
            <p><strong>Time:</strong> ${lessonDetails.time}</p>
            <p><strong>Duration:</strong> ${lessonDetails.duration} minutes</p>
            <p><strong>Teacher:</strong> ${lessonDetails.teacherName}</p>
            <p><strong>Subject:</strong> ${lessonDetails.subject}</p>
          </div>
          
          <div style="background-color: #e9d5ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #7c3aed;">Google Meet Link</h3>
            <p>Join your lesson using this link:</p>
            <p><a href="${invitation.meetLink}" style="color: #7c3aed; text-decoration: none; font-weight: bold;">${invitation.meetLink}</a></p>
            <p><small>Please join the meeting 5 minutes before your scheduled time.</small></p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p><strong>Important Notes:</strong></p>
            <ul>
              <li>Please ensure you have a stable internet connection</li>
              <li>Test your microphone and camera before the lesson</li>
              <li>Have your Korean learning materials ready</li>
              <li>If you need to reschedule, please contact us at least 24 hours in advance</li>
            </ul>
          </div>
          
          <p>We're excited to help you learn Korean! See you in the lesson.</p>
          
          <p>Best regards,<br>
          Hailey Kim<br>
          Korean Language Teacher</p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Get upcoming lessons for a student (mock data)
 */
export const getUpcomingLessons = async (studentId: string) => {
  // Mock data - in real app, fetch from Firebase
  return [
    {
      id: '1',
      date: '2024-01-15',
      time: '10:00 AM',
      teacher: 'Hailey Kim',
      meetLink: 'https://meet.google.com/abc-defg-hij',
      subject: 'Korean Conversation Practice'
    },
    {
      id: '2',
      date: '2024-01-17',
      time: '2:00 PM',
      teacher: 'Hailey Kim',
      meetLink: 'https://meet.google.com/xyz-1234-567',
      subject: 'Korean Grammar Review'
    }
  ];
};

