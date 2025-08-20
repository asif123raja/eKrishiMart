import nodemailer from 'nodemailer';
import bcryptjs from 'bcryptjs';
import User from "@/models/userModel";
import { use } from 'react';

// Function to send email and handle user-related operations
export const sendEmail = async ({ email, emailType, userId }: { email: string, emailType: string, userId: string }) => {
    try {
        // Create a hashed token
        const hashedToken = await bcryptjs.hash(userId.toString(), 10);

        // create a user
        if( emailType === "VERIFY"){
            await User.findByIdAndUpdate(userId,
                {   verifyToken: hashedToken,
                    verifyTokenExpiry: Date.now() + 360000
                }
            )
        }else if( emailType === "RESET"){
            await User.findByIdAndUpdate(userId,
                {   forgotPasswordToken: hashedToken,
                    forgotPasswordTokenExpiry: Date.now() + 360000
                }
            )
        }

        var transport = nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
              user: "265360d8c85745",
              pass: "1da7366aa7bfeb"
              //TODO add these credentials to .env file
            }
          });

          const mailOptions ={
            from: 'asifulameen044@gmail.com',
            to: email,
            subject: emailType === "VERIFY" ? "verify your email" : "Reset your password",
            html: `<p>Click <a href="${process.env.DOMAIN}/verifyemail?token=${hashedToken}">here</a> to ${emailType === "VERIFY" ? "verify your email":"reset your password"}
            or copy and paste the link below in your browser. <br> ${process.env.DOMAIN}/verifyemail? token=${hashedToken}
            </p>`
          }

          const mailresponse = await transport.sendMail(mailOptions);
          return mailresponse;

    } catch (error:any) {
        throw new Error(error.message);
    }
}


 