import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendDoctorOnlineNotification(
  patientEmails: string[],
  doctorName: string,
  doctorSpeciality: string,
) {
  try {
    const { data, error } = await resend.emails.send({
      from: "MediConnect <notifications@byterate.nullsphere.live>",
      to: patientEmails,
      subject: `Dr. ${doctorName} is now online!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Doctor Available Now!</h2>
          <p>Good news! <strong>Dr. ${doctorName}</strong> (${doctorSpeciality}) is now online and available for consultation.</p>
          <p>You can now connect with them through our platform.</p>
          <div style="margin: 20px 0; padding: 15px; background-color: #f3f4f6; border-radius: 8px;">
            <p style="margin: 0;"><strong>Doctor:</strong> Dr. ${doctorName}</p>
            <p style="margin: 0;"><strong>Speciality:</strong> ${doctorSpeciality}</p>
            <p style="margin: 0;"><strong>Status:</strong> Online</p>
          </div>
          <p>Best regards,<br>MediConnect Team</p>
        </div>
      `,
    })

    if (error) {
      console.error("Email sending error:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Email service error:", error)
    return false
  }
}
