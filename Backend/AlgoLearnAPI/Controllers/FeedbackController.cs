using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using AlgoLearnAPI.Data;
using AlgoLearnAPI.Models;

namespace AlgoLearnAPI.Controllers
{
    /// <summary>
    /// Կառավարում է «Հետադարձ կապ» ֆորման․ նամակ ուղարկում և բազայում պահպանում
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]   // ⇒  /api/feedback
    public class FeedbackController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly EmailService _emailService;
        private readonly ILogger<FeedbackController> _log;

        public FeedbackController(
            AppDbContext context,
            EmailService emailService,
            ILogger<FeedbackController> log)
        {
            _context = context;
            _emailService = emailService;
            _log = log;
        }

        /// <summary>
        /// Օգտատերը ուղարկում է նամակ
        /// </summary>
        [HttpPost]
        public IActionResult Send([FromBody] FeedbackDto dto)
        {
            // Վավերացում
            if (string.IsNullOrWhiteSpace(dto.Subject) ||
                string.IsNullOrWhiteSpace(dto.Message))
            {
                return BadRequest(new
                {
                    message = "Թեման և հաղորդագրությունը պարտադիր են։"
                });
            }

            // Ստեղծում ենք feedback record
            var feedback = new Feedback
            {
                Name = dto.Name,
                Email = dto.Email,
                Subject = dto.Subject,
                Message = dto.Message,
                CreatedAt = DateTime.UtcNow
            };

            try
            {
                // 1) Պահպանում ենք բազայում
                _context.Feedbacks.Add(feedback);
                _context.SaveChanges();

                // 2) Ուղարկում ենք նամակ
                var htmlBody = $@"
                    <h3>Նոր հետադարձ կապ</h3>
                    <p><b>Անուն:</b> {dto.Name ?? "(չլցված)"}</p>
                    <p><b>Էլ. փոստ:</b> {dto.Email ?? "(չլցված)"}</p>
                    <p><b>Թեմա:</b> {dto.Subject}</p>
                    <p><b>Հաղորդագրություն:</b><br>{dto.Message.Replace("\n", "<br>")}</p>";

                _emailService.SendEmail(
                    to: "support@algolearn.com",  // կամ config-ից
                    subject: $"[AlgoLearn] {dto.Subject}",
                    body: htmlBody);

                return Ok(new
                {
                    message = "Շնորհակալություն, ձեր հաղորդագրությունը ստացվել է։"
                });
            }
            catch (Exception ex)
            {
                _log.LogError(ex, "Feedback e-mail failed to send.");
                return StatusCode(500, new
                {
                    message = "Սխալ տեղի ունեցավ․ խնդրում ենք փորձել ավելի ուշ։"
                });
            }
        }

        /// <summary>
        /// Վերադարձնում է բոլոր ստացված նամակները ադմինի համար
        /// </summary>
        [HttpGet("all")]
        public IActionResult GetAll()
        {
            var list = _context.Feedbacks
                .OrderByDescending(f => f.CreatedAt)
                .ToList();

            return Ok(list);
        }

        /// <summary>
        /// Ուղարկում է պատասխան օգտատիրոջ նամակին
        /// </summary>
        [HttpPost("reply")]
        public IActionResult SendReply([FromBody] ReplyDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Message))
            {
                return BadRequest(new { message = "Էլ․ փոստը և պատասխանը պարտադիր են։" });
            }

            try
            {
                var subject = "[AlgoLearn] Ձեր հարցմանը պատասխան";
                var body = $@"
            <p>Բարև Ձեզ,</p>
            <p>{dto.Message.Replace("\n", "<br>")}</p>
            <p>Հարգանքով՝ AlgoLearn-ի թիմ:</p>";

                _emailService.SendEmail(dto.Email, subject, body);

                return Ok(new { message = "Պատասխանը հաջողությամբ ուղարկվեց։" });
            }
            catch (Exception ex)
            {
                _log.LogError(ex, "Failed to send reply to user.");
                return StatusCode(500, new { message = "Պատասխանի ուղարկման ժամանակ սխալ տեղի ունեցավ։" });
            }
        }

        /// <summary>
        /// DTO for replying to feedback
        /// </summary>
        public record ReplyDto
        {
            public string Email { get; init; } = "";
            public string Message { get; init; } = "";
        }


        /// <summary>
        /// DTO՝ բեռնվում է JSON-ից
        /// </summary>
        public record FeedbackDto
        {
            public string? Name { get; init; }
            public string? Email { get; init; }
            public string Subject { get; init; } = "";
            public string Message { get; init; } = "";
        }
    }
}
