import nodemailer from "nodemailer";
import validatedENV from "./processEnvironment";

type OptionsProps = {
  subject: string;
  text: string;
  email: string;
};

export const sendEmail = async (options: OptionsProps) => {
  // 1. Create a transporter
  const transporter = nodemailer.createTransport({
    host: validatedENV.EMAIL_HOST,
    auth: {
      user: validatedENV.EMAIL_USERNAME,
      pass: validatedENV.EMAIL_PASSWORD,
    },
  });

  // 2. Define email options
  const mailOptions = {
    form: "dngocson12@gmail.com",
    to: options.email,
    subject: options.subject,
    text: options.text,
  };

  // 3. Send email
  await transporter.sendMail(mailOptions);
};
