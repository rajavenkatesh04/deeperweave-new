export function buildWelcomeEmail(displayName: string, username: string): string {
    const profileUrl = `https://deeperweave.com/profile/${username}`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <title>Welcome to DeeperWeave</title>
    <style>
        body { margin: 0; padding: 0; min-width: 100%; width: 100% !important; height: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; background-color: #fafafa; }
        a { text-decoration: none; color: inherit; }
        img { border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; display: block; }
        table { border-collapse: separate; border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }

        .body-bg { background-color: #fafafa; color: #18181b; }
        .card-bg { background-color: #ffffff; border: 1px solid #e4e4e7; }
        .info-box { background-color: #fafafa; border: 1px solid #f4f4f5; }
        .highlight-box { background-color: #fefce8; border: 1px solid #fef08a; }
        .text-main { color: #18181b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        .text-sub { color: #71717a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        .text-amber { color: #b45309; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        .button-primary { background-color: #18181b; color: #ffffff !important; border: 1px solid #18181b; }
        .footer-text { color: #a1a1aa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        .divider { border: none; border-top: 1px solid #f4f4f5; }

        @media screen and (max-width: 600px) {
            .container { width: 100% !important; padding: 20px 16px !important; }
            .card-padding { padding: 28px 20px !important; }
        }

        @media (prefers-color-scheme: dark) {
            .body-bg { background-color: #000000 !important; }
            .card-bg { background-color: #09090b !important; border: 1px solid #27272a !important; }
            .info-box { background-color: #18181b !important; border: 1px solid #27272a !important; }
            .highlight-box { background-color: #1c1a0a !important; border: 1px solid #3d3510 !important; }
            .text-main { color: #f4f4f5 !important; }
            .text-sub { color: #a1a1aa !important; }
            .text-amber { color: #fbbf24 !important; }
            .button-primary { background-color: #ffffff !important; color: #09090b !important; border: 1px solid #ffffff !important; }
            .footer-text { color: #52525b !important; }
            .divider { border-top: 1px solid #27272a !important; }
        }
    </style>
</head>
<body class="body-bg" style="margin: 0; padding: 0;">

    <table width="100%" border="0" cellspacing="0" cellpadding="0" class="body-bg" role="presentation">
        <tr>
            <td align="center" class="container" style="padding: 40px 20px;">

                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 480px; width: 100%;">

                    <!-- Logo Header -->
                    <tr>
                        <td align="center" style="padding-bottom: 32px;">
                            <table border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td valign="middle" style="padding-right: 12px;">
                                        <img src="https://jyjynjpznlvezjhnuwhi.supabase.co/storage/v1/object/public/website_assests/icon-512x512.png"
                                             alt="DeeperWeave"
                                             width="36"
                                             height="36"
                                             style="width: 36px; height: 36px; border-radius: 8px; display: block;">
                                    </td>
                                    <td valign="middle">
                                        <span class="text-main" style="font-size: 18px; font-weight: 700; letter-spacing: -0.02em;">DeeperWeave</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Main Card -->
                    <tr>
                        <td class="card-bg card-padding" style="border-radius: 16px; padding: 40px; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">

                                <!-- Greeting -->
                                <tr>
                                    <td align="left" style="padding-bottom: 8px;">
                                        <p class="text-sub" style="margin: 0; font-size: 13px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;">
                                            Welcome aboard
                                        </p>
                                    </td>
                                </tr>

                                <tr>
                                    <td align="left" style="padding-bottom: 16px;">
                                        <h1 class="text-main" style="margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.02em; line-height: 30px;">
                                            Hey ${displayName}, you're in.
                                        </h1>
                                    </td>
                                </tr>

                                <tr>
                                    <td align="left" style="padding-bottom: 28px;">
                                        <p class="text-sub" style="margin: 0; font-size: 15px; line-height: 24px;">
                                            Your DeeperWeave profile is live. We're genuinely glad you're here — this is a community built for people who take film and TV seriously.
                                        </p>
                                    </td>
                                </tr>

                                <!-- Trial highlight box -->
                                <tr>
                                    <td align="left" style="padding-bottom: 24px;">
                                        <table width="100%" border="0" cellspacing="0" cellpadding="0" class="highlight-box" style="border-radius: 12px;">
                                            <tr>
                                                <td style="padding: 20px 24px;">
                                                    <p class="text-amber" style="margin: 0 0 6px 0; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">
                                                        30-Day Auteur Trial — Active
                                                    </p>
                                                    <p class="text-sub" style="margin: 0; font-size: 14px; line-height: 22px;">
                                                        As a welcome gift, your account is on the <strong class="text-amber">Auteur Plan</strong> for the next 30 days. No credit card, no strings.
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                <!-- What's included -->
                                <tr>
                                    <td align="left" style="padding-bottom: 24px;">
                                        <table width="100%" border="0" cellspacing="0" cellpadding="0" class="info-box" style="border-radius: 12px;">
                                            <tr>
                                                <td style="padding: 20px 24px;">
                                                    <p class="text-sub" style="margin: 0 0 14px 0; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">
                                                        What you can do now
                                                    </p>
                                                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                        <tr>
                                                            <td style="padding-bottom: 10px;">
                                                                <table border="0" cellspacing="0" cellpadding="0">
                                                                    <tr>
                                                                        <td style="padding-right: 10px; vertical-align: top; padding-top: 2px;">
                                                                            <div style="width: 6px; height: 6px; border-radius: 50%; background-color: #18181b; margin-top: 5px;"></div>
                                                                        </td>
                                                                        <td><span class="text-sub" style="font-size: 14px; line-height: 20px;">Log and rate any movie or TV show</span></td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style="padding-bottom: 10px;">
                                                                <table border="0" cellspacing="0" cellpadding="0">
                                                                    <tr>
                                                                        <td style="padding-right: 10px; vertical-align: top; padding-top: 2px;">
                                                                            <div style="width: 6px; height: 6px; border-radius: 50%; background-color: #18181b; margin-top: 5px;"></div>
                                                                        </td>
                                                                        <td><span class="text-sub" style="font-size: 14px; line-height: 20px;">Build custom profile sections &amp; curated lists</span></td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style="padding-bottom: 10px;">
                                                                <table border="0" cellspacing="0" cellpadding="0">
                                                                    <tr>
                                                                        <td style="padding-right: 10px; vertical-align: top; padding-top: 2px;">
                                                                            <div style="width: 6px; height: 6px; border-radius: 50%; background-color: #18181b; margin-top: 5px;"></div>
                                                                        </td>
                                                                        <td><span class="text-sub" style="font-size: 14px; line-height: 20px;">Follow others and discover new perspectives</span></td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                <table border="0" cellspacing="0" cellpadding="0">
                                                                    <tr>
                                                                        <td style="padding-right: 10px; vertical-align: top; padding-top: 2px;">
                                                                            <div style="width: 6px; height: 6px; border-radius: 50%; background-color: #18181b; margin-top: 5px;"></div>
                                                                        </td>
                                                                        <td><span class="text-sub" style="font-size: 14px; line-height: 20px;">Write rich reviews with spoiler tags &amp; rewatch notes</span></td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                <!-- CTA Button -->
                                <tr>
                                    <td align="left" style="padding-bottom: 28px;">
                                        <table border="0" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td class="button-primary" style="border-radius: 8px;">
                                                    <a href="${profileUrl}" class="button-primary" style="display: inline-block; padding: 12px 28px; font-size: 14px; font-weight: 600; letter-spacing: 0.01em; color: #ffffff; text-decoration: none; border-radius: 8px;">
                                                        Go to your profile →
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                <!-- Divider -->
                                <tr>
                                    <td style="padding-bottom: 24px;">
                                        <hr class="divider" style="margin: 0;" />
                                    </td>
                                </tr>

                                <!-- A note from the team -->
                                <tr>
                                    <td align="left" style="padding-bottom: 8px;">
                                        <p class="text-sub" style="margin: 0; font-size: 13px; line-height: 22px;">
                                            A note from the team: we built DeeperWeave because we wanted a place that takes cinema seriously — not an algorithm, not a feed, just a home for your taste. Your profile is yours.
                                        </p>
                                    </td>
                                </tr>

                                <tr>
                                    <td align="left">
                                        <p class="text-sub" style="margin: 0; font-size: 13px; line-height: 22px;">
                                            If you ever have feedback or run into anything, reply to this email or reach us at
                                            <a href="mailto:support@deeperweave.com" class="text-main" style="font-weight: 600; text-decoration: underline;">support@deeperweave.com</a>.
                                        </p>
                                    </td>
                                </tr>

                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="padding-top: 32px;">
                            <p class="footer-text" style="margin: 0 0 8px 0; font-size: 12px; line-height: 1.5;">
                                You received this because you created a DeeperWeave account.
                            </p>
                            <p class="footer-text" style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 500;">
                                © 2026 DeeperWeave
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
