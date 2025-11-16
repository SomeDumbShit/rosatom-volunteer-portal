import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

export interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    })
    return { success: true }
  } catch (error) {
    console.error('Email sending error:', error)
    return { success: false, error }
  }
}

export function getEventReminderEmail(eventTitle: string, date: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0284c7;">Напоминание о мероприятии</h2>
      <p>Здравствуйте!</p>
      <p>Напоминаем, что завтра состоится мероприятие, на которое вы записались:</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0;">${eventTitle}</h3>
        <p style="margin: 0; color: #6b7280;">Дата: ${date}</p>
      </div>
      <p>До встречи!</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="color: #9ca3af; font-size: 12px;">
        Волонтерский Портал Росатома
      </p>
    </div>
  `
}

export function getParticipationApprovedEmail(eventTitle: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0284c7;">Ваша заявка одобрена!</h2>
      <p>Здравствуйте!</p>
      <p>Ваша заявка на участие в мероприятии была одобрена:</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0;">${eventTitle}</h3>
      </div>
      <p>Спасибо за вашу готовность помочь!</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="color: #9ca3af; font-size: 12px;">
        Волонтерский Портал Росатома
      </p>
    </div>
  `
}

export function getNGOApprovedEmail(ngoName: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0284c7;">Ваша организация одобрена!</h2>
      <p>Здравствуйте!</p>
      <p>Рады сообщить, что организация "${ngoName}" прошла модерацию и теперь доступна на портале.</p>
      <p>Теперь вы можете:</p>
      <ul>
        <li>Создавать мероприятия</li>
        <li>Управлять профилем организации</li>
        <li>Добавлять проекты</li>
        <li>Взаимодействовать с волонтерами</li>
      </ul>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; background-color: #0284c7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
        Перейти в личный кабинет
      </a>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="color: #9ca3af; font-size: 12px;">
        Волонтерский Портал Росатома
      </p>
    </div>
  `
}

export function getNewVolunteerEmail(volunteerName: string, eventTitle: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0284c7;">Новый волонтер записался на мероприятие</h2>
      <p>Здравствуйте!</p>
      <p>Волонтер ${volunteerName} записался на ваше мероприятие:</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0;">${eventTitle}</h3>
      </div>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/events" style="display: inline-block; background-color: #0284c7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
        Управление мероприятиями
      </a>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="color: #9ca3af; font-size: 12px;">
        Волонтерский Портал Росатома
      </p>
    </div>
  `
}
