using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;

public class EmailService
{
    private readonly string _smtpServer;
    private readonly int _smtpPort;
    private readonly string _senderEmail;
    private readonly string _senderPassword;

    public EmailService(IConfiguration config)
    {
        _smtpServer = config["EmailSettings:SMTPServer"];
        _smtpPort = int.Parse(config["EmailSettings:SMTPPort"]);
        _senderEmail = config["EmailSettings:SenderEmail"];
        _senderPassword = config["EmailSettings:SenderPassword"];
    }

    /// <summary>
    /// This method is responsible for sending email for verification.
    /// </summary>
    /// <param name="to">The email which user prompted and which must receive the code</param>
    /// <param name="subject">the description of email</param>
    /// <param name="body">The content of email</param>
    public void SendEmail(string to, string subject, string body)
    {
        using (var client = new SmtpClient(_smtpServer, _smtpPort))
        {
            client.Credentials = new NetworkCredential(_senderEmail, _senderPassword);
            client.EnableSsl = true;

            var mailMessage = new MailMessage
            {
                From = new MailAddress(_senderEmail),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };
            mailMessage.To.Add(to);

            client.Send(mailMessage);
        }
    }
}
