// import nodemailer from 'nodemailer';
// import Seller from '@/models/sellerModel';
// import crypto from 'crypto';

// // ✅ 1. Define an interface for the function's props to avoid 'any'
// interface SendEmailProps {
//   email: string;
//   emailType: "VERIFY" | "RESET";
//   userId: string;
//   token?: string; // Optional, only used for password reset
// }

// export const sendEmail = async ({ email, emailType, userId, token }: SendEmailProps) => {
//     try {
//         let emailToken: string;
//         let subject: string;
//         let pageLink: string;
//         let body: string;

//         if (emailType === "VERIFY") {
//             // Generate verification token and update seller record
//             emailToken = crypto.randomBytes(32).toString("hex");
//             await Seller.findByIdAndUpdate(userId, {
//                 verifyToken: emailToken,
//                 verifyTokenExpiry: Date.now() + 3600000 // 1 hour from now
//             });
            
//             subject = "Verify your email for eKrishiMart";
//             pageLink = "/seller/verifyemail";
//             body = `<p>Click <a href="${process.env.DOMAIN}${pageLink}?token=${emailToken}">here</a> to verify your email or copy and paste the link below in your browser. <br> ${process.env.DOMAIN}${pageLink}?token=${emailToken}</p>`;
//         } 
//         else if (emailType === "RESET") {
//             // Use the provided token (already hashed and saved in API route)
//             emailToken = token;
//             subject = "Reset your password for eKrishiMart";
//             pageLink = "/reset-password";
//             body = `<p>Click <a href="${process.env.DOMAIN}${pageLink}?token=${emailToken}">here</a> to reset your password or copy and paste the link below in your browser. <br> ${process.env.DOMAIN}${pageLink}?token=${emailToken}</p>`;
//         }
//         else {
//             throw new Error("Invalid email type");
//         }

//         const transport = nodemailer.createTransport({
//             host: process.env.MAILTRAP_HOST,
//             port: 2525,
//             auth: {
//                 user: process.env.MAILTRAP_USER,
//                 pass: process.env.MAILTRAP_PASS
//             }
//         });

//         const mailOptions = {
//             from: 'noreply@KrishakMart.com',
//             to: email,
//             subject: subject,
//             html: body
//         };

//         const mailresponse = await transport.sendMail(mailOptions);
//         return mailresponse;

//     } catch (error: unknown) {
//         if (error instanceof Error) {
//             throw new Error(error.message);
//         }
//         throw new Error("An unknown error occurred while sending the email.");
//     }
// }
import nodemailer from 'nodemailer';
import Seller from '@/models/sellerModel';
import crypto from 'crypto';

// ✅ 1. Define an interface for the function's props to avoid 'any'
interface SendEmailProps {
  email: string;
  emailType: "VERIFY" | "RESET";
  userId?: string; // Make optional since it's not needed for RESET
  token?: string; // Optional, only used for password reset
}

export const sendEmail = async ({ email, emailType, userId, token }: SendEmailProps) => {
    try {
        let emailToken: string;
        let subject: string;
        let pageLink: string;
        let body: string;

        if (emailType === "VERIFY") {
            // Check if userId is provided for VERIFY
            if (!userId) {
                throw new Error("User ID is required for verification emails");
            }
            
            // Generate verification token and update seller record
            emailToken = crypto.randomBytes(32).toString("hex");
            await Seller.findByIdAndUpdate(userId, {
                verifyToken: emailToken,
                verifyTokenExpiry: Date.now() + 3600000 // 1 hour from now
            });
            
            subject = "Verify your email for eKrishiMart";
            pageLink = "/seller/verifyemail";
            body = `<p>Click <a href="${process.env.DOMAIN}${pageLink}?token=${emailToken}">here</a> to verify your email or copy and paste the link below in your browser. <br> ${process.env.DOMAIN}${pageLink}?token=${emailToken}</p>`;
        } 
        else if (emailType === "RESET") {
            // Check if token is provided for RESET
            if (!token) {
                throw new Error("Token is required for password reset emails");
            }
            
            // Use the provided token (already hashed and saved in API route)
            emailToken = token;
            subject = "Reset your password for eKrishiMart";
            pageLink = "/reset-password";
            body = `<p>Click <a href="${process.env.DOMAIN}${pageLink}?token=${emailToken}">here</a> to reset your password or copy and paste the link below in your browser. <br> ${process.env.DOMAIN}${pageLink}?token=${emailToken}</p>`;
        }
        else {
            throw new Error("Invalid email type");
        }

        const transport = nodemailer.createTransport({
            host: process.env.MAILTRAP_HOST,
            port: 2525,
            auth: {
                user: process.env.MAILTRAP_USER,
                pass: process.env.MAILTRAP_PASS
            }
        });

        const mailOptions = {
            from: 'noreply@KrishakMart.com',
            to: email,
            subject: subject,
            html: body
        };

        const mailresponse = await transport.sendMail(mailOptions);
        return mailresponse;

    } catch (error: unknown) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("An unknown error occurred while sending the email.");
    }
}