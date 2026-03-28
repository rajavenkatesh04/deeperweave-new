export function buildDeletionEmail(displayName: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <title>Account Deleted</title>
    <style>
        /* Base Resets */
        body { margin: 0; padding: 0; min-width: 100%; width: 100% !important; height: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; background-color: #fafafa; }
        a { text-decoration: none; color: inherit; }
        img { border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; display: block; }
        table { border-collapse: separate; border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }

        /* Typography & Colors (Zinc Theme) */
        .body-bg { background-color: #fafafa; color: #18181b; }
        .card-bg { background-color: #ffffff; border: 1px solid #e4e4e7; }
        .info-box { background-color: #fafafa; border: 1px solid #f4f4f5; }
        .text-main { color: #18181b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        .text-sub { color: #71717a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        .button-primary { background-color: #18181b; color: #ffffff; border: 1px solid #18181b; }
        .footer-text { color: #a1a1aa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        
        /* Mobile Optimizations */
        @media screen and (max-width: 600px) {
            .container { width: 100% !important; padding: 20px 16px !important; }
            .card-padding { padding: 24px !important; }
        }

        /* Dark Mode Support */
        @media (prefers-color-scheme: dark) {
            .body-bg { background-color: #000000 !important; }
            .card-bg { background-color: #09090b !important; border: 1px solid #27272a !important; }
            .info-box { background-color: #18181b !important; border: 1px solid #27272a !important; }
            .text-main { color: #f4f4f5 !important; }
            .text-sub { color: #a1a1aa !important; }
            .button-primary { background-color: #ffffff !important; color: #09090b !important; border: 1px solid #ffffff !important; }
            .footer-text { color: #52525b !important; }
        }
    </style>
</head>
<body class="body-bg" style="margin: 0; padding: 0;">

    <table width="100%" border="0" cellspacing="0" cellpadding="0" class="body-bg" role="presentation">
        <tr>
            <td align="center" class="container" style="padding: 40px 20px;">
                
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 480px; width: 100%;">
                    
                    <tr>
                        <td align="center" style="padding-bottom: 32px;">
                            <table border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td valign="middle" style="padding-right: 12px;">
                                        <img src="https://jyjynjpznlvezjhnuwhi.supabase.co/storage/v1/object/public/website_assests/icon-512x512.png" 
                                             alt="Logo" 
                                             width="36" 
                                             height="36" 
                                             style="width: 36px; height: 36px; border-radius: 8px; display: block;">
                                    </td>
                                    <td valign="middle">
                                        <span class="text-main" style="font-size: 18px; font-weight: 700; letter-spacing: -0.02em;">Deeper Weave</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td class="card-bg card-padding" style="border-radius: 16px; padding: 40px; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                
                                <tr>
                                    <td align="left" style="padding-bottom: 16px;">
                                        <h1 class="text-main" style="margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.01em; line-height: 28px;">
                                            Your account has been deleted.
                                        </h1>
                                    </td>
                                </tr>

                                <tr>
                                    <td align="left" style="padding-bottom: 24px;">
                                        <p class="text-sub" style="margin: 0; font-size: 15px; line-height: 24px;">
                                            Hi ${displayName}, this is a confirmation that your DeeperWeave account and all associated data have been permanently removed from our servers.
                                        </p>
                                    </td>
                                </tr>

                                <tr>
                                    <td align="left" style="padding-bottom: 24px;">
                                        <table width="100%" border="0" cellspacing="0" cellpadding="0" class="info-box" style="border-radius: 12px;">
                                            <tr>
                                                <td style="padding: 20px 24px;">
                                                    <p class="text-sub" style="margin: 0 0 12px 0; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">
                                                        What was removed
                                                    </p>
                                                    <ul class="text-sub" style="margin: 0; padding: 0 0 0 16px; font-size: 14px; line-height: 2;">
                                                        <li>Your profile, username, and public page</li>
                                                        <li>All reviews, ratings, and comments</li>
                                                        <li>Lists, saved items, and profile sections</li>
                                                        <li>Followers, following, and connections</li>
                                                        <li>Uploaded photos and avatars</li>
                                                        <li>Subscription and payment history</li>
                                                    </ul>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                <tr>
                                    <td align="left" style="padding-bottom: 16px;">
                                        <p class="text-sub" style="margin: 0; font-size: 14px; line-height: 24px;">
                                            If you didn't request this deletion or believe this was a mistake, please contact us immediately at 
                                            <a href="mailto:support@deeperweave.com" class="text-main" style="font-weight: 600;">support@deeperweave.com</a>.
                                        </p>
                                    </td>
                                </tr>

                                <tr>
                                    <td align="left">
                                        <p class="text-sub" style="margin: 0; font-size: 14px; line-height: 24px;">
                                            Thank you for being part of our community. You're always welcome back.
                                        </p>
                                    </td>
                                </tr>

                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding-top: 32px;">
                            <p class="footer-text" style="margin: 0 0 8px 0; font-size: 12px; line-height: 1.5;">
                                This is an automated message. Please do not reply.
                            </p>
                            <p class="footer-text" style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 500;">
                                © 2026 Deeper Weave
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>

</body>
</html>`;
}