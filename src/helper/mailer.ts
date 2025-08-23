// import nodemailer from 'nodemailer';
// import bcryptjs from 'bcryptjs';
// import User from "@/models/userModel";
// import { use } from 'react';

// // Function to send email and handle user-related operations
// export const sendEmail = async ({ email, emailType, userId }: { email: string, emailType: string, userId: string }) => {
//     try {
//         // Create a hashed token
//         const hashedToken = await bcryptjs.hash(userId.toString(), 10);

//         // create a user
//         if( emailType === "VERIFY"){
//             await User.findByIdAndUpdate(userId,
//                 {   verifyToken: hashedToken,
//                     verifyTokenExpiry: Date.now() + 360000
//                 }
//             )
//         }else if( emailType === "RESET"){
//             await User.findByIdAndUpdate(userId,
//                 {   forgotPasswordToken: hashedToken,
//                     forgotPasswordTokenExpiry: Date.now() + 360000
//                 }
//             )
//         }

//         var transport = nodemailer.createTransport({
//             host: "sandbox.smtp.mailtrap.io",
//             port: 2525,
//             auth: {
//               user: "265360d8c85745",
//               pass: "1da7366aa7bfeb"
//               //TODO add these credentials to .env file
//             }
//           });

//           const mailOptions ={
//             from: 'asifulameen044@gmail.com',
//             to: email,
//             subject: emailType === "VERIFY" ? "verify your email" : "Reset your password",
//             html: `<p>Click <a href="${process.env.DOMAIN}/verifyemail?token=${hashedToken}">here</a> to ${emailType === "VERIFY" ? "verify your email":"reset your password"}
//             or copy and paste the link below in your browser. <br> ${process.env.DOMAIN}/verifyemail? token=${hashedToken}
//             </p>`
//           }

//           const mailresponse = await transport.sendMail(mailOptions);
//           return mailresponse;

//     } catch (error:any) {
//         throw new Error(error.message);
//     }
// }

// import nodemailer from 'nodemailer';
// import Seller from '@/models/sellerModel'; // Assuming you'll need to update the Seller
// import bcryptjs from 'bcryptjs';

// export const sendEmail = async ({ email, emailType, userId }: any) => {
//     try {
//         // 1. Generate a unique, hashed token
//         const hashedToken = await bcryptjs.hash(userId.toString(), 10);

//         // 2. Find the user and set the token and expiry date
//         if (emailType === "VERIFY") {
//             await Seller.findByIdAndUpdate(userId, {
//                 verifyToken: hashedToken,
//                 verifyTokenExpiry: Date.now() + 3600000 // 1 hour from now
//             });
//         } 
//         // Note: You can add logic for "RESET" password here later if needed
        

//         // 3. Configure email transport (using environment variables is crucial)
//         const transport = nodemailer.createTransport({
//             host: process.env.MAILTRAP_HOST,
//             port: 2525,
//             auth: {
//                 user: process.env.MAILTRAP_USER,
//                 pass: process.env.MAILTRAP_PASS
//             }
//         });

//         // 4. Construct the email content
//         const verificationLink = `${process.env.DOMAIN}/verifyemail?token=${hashedToken}`;
        
//         const mailOptions = {
//             from: 'noreply@yourcompany.com',
//             to: email,
//             subject: emailType === "VERIFY" ? "Verify your email" : "Reset your password",
//             html: `<p>Click <a href="${verificationLink}">here</a> to ${emailType === "VERIFY" ? "verify your email" : "reset your password"} or copy and paste the link below in your browser. <br> ${verificationLink}</p>`
//         };

//         // 5. Send the email
//         const mailresponse = await transport.sendMail(mailOptions);
//         return mailresponse;

//     } catch (error: any) {
//         throw new Error(error.message);
//     }
// }

 import nodemailer from 'nodemailer';
import Seller from '@/models/sellerModel';
import crypto from 'crypto'; // <-- 1. Import the crypto module

export const sendEmail = async ({ email, emailType, userId }: any) => {
    try {
        // --- 2. REPLACE THE TOKEN GENERATION LOGIC ---
        // OLD WAY: const hashedToken = await bcryptjs.hash(userId.toString(), 10);
        // NEW, SAFER WAY:
        const token = crypto.randomBytes(32).toString("hex");
        // This creates a secure, random 64-character URL-safe string

        if (emailType === "VERIFY") {
            await Seller.findByIdAndUpdate(userId, {
                verifyToken: token, // <-- 3. Use the new token here
                verifyTokenExpiry: Date.now() + 3600000 // 1 hour from now
            });
        } 
        
        // ... (your nodemailer transport setup remains the same)
        const transport = nodemailer.createTransport({
            host: process.env.MAILTRAP_HOST,
            port: 2525,
            auth: {
                user: process.env.MAILTRAP_USER,
                pass: process.env.MAILTRAP_PASS
            }
        });

        // Use the new, clean token in the link
        const verificationLink = `${process.env.DOMAIN}/seller/verifyemail?token=${token}`;
        
        const mailOptions = {
            from: 'noreply@yourcompany.com',
            to: email,
            subject: "Verify your email for eKrishiMart",
            html: `<p>Click <a href="${verificationLink}">here</a> to verify your email or copy and paste the link below in your browser. <br> ${verificationLink}</p>`
        };

        const mailresponse = await transport.sendMail(mailOptions);
        return mailresponse;

    } catch (error: any) {
        throw new Error(error.message);
    }
}