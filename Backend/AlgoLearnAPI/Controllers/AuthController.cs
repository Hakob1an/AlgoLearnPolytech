using Microsoft.AspNetCore.Mvc;
using AlgoLearnAPI.Services;
using AlgoLearnAPI.Models;
using AlgoLearnAPI.Data;
using Microsoft.Extensions.Configuration;

namespace AlgoLearnAPI.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;
        private readonly EmailService _emailService;
        private readonly IConfiguration _config;

        public AuthController(AppDbContext context, IConfiguration config)
        {
            _authService = new AuthService(context, config);
            _emailService = new EmailService(config);
            _config = config;
        }

        /// <summary>
        /// This endpoint handles user login. 
        /// It allows only verified users to log in.
        /// </summary>
        /// <param name="request"> The login request containing email and password</param>
        /// <returns>
        /// Returns a 200 OK response with a welcome message if authentication is successful.
        /// Returns a 401 Unauthorized response if credentials are incorrect or the account is not verified.
        /// Returns a 500 Internal Server Error if an unexpected issue occurs.
        /// </returns>
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            try
            {
                var user = _authService.Login(request.Email, request.Password);
                return Ok(new { message = $"Ողջույն, {user.Username}!", role = user.Role});
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred. Please try again later." });
            }
        }

        /// <summary>
        /// This endpoint handles user registration.
        /// It generates a verification code and sends it to users' email.
        /// </summary>
        /// <param name="request">The registration request containing email, password and username</param>
        /// <returns>
        /// Returns a 200 OK response if registration is successful, and a verification code is sent.
        /// Returns a 400 Bad Request response if the email is already registered or the password is invalid.
        /// Returns a 500 Internal Server Error if an unexpected issue occurs.
        /// </returns>
        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterRequest request)
        {
            try
            {
                var verificationCode = _authService.Register(request.Email, request.Password, request.Username, request.Role);

                if (verificationCode == null)
                    return BadRequest(new { message = "Էլ. փոստը արդեն գրանցված է:" });

                string subject = "Ձեր AlgoLearn-ի հաստատման կոդը";
                string body = $"<h2>Բարև, {request.Username},</h2>"
                            + $"<p>Ձեր հաստատման կոդն է՝ <strong>{verificationCode}</strong></p>"
                            + "<p>Խնդրում ենք մուտքագրել այս կոդը հաստատման էջում՝ Ձեր հաշիվը ակտիվացնելու համար։</p>";


                Console.WriteLine($"📧 [DEBUG] Sending Email to: {request.Email}, Code: {verificationCode}"); // ✅ Debugging

                _emailService.SendEmail(request.Email, subject, body);

                return Ok(new { message = "Հաստատման կոդն ուղարկվել է ձեր էլեկտրոնային հասցեին։ Խնդրում ենք մուտքագրել այն՝ ձեր հաշվի վավերացման համար։" , role = request.Role});
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred. Please try again later." });
            }
        }

        /// <summary>
        /// This endpoint verifies the 6-digit code that user enters
        /// </summary>
        /// <param name="request">The verification request that contains user email and verfication code</param>
        /// <returns>
        /// Returns a 400 Bad Request response if the verification code is invalid or expired.
        /// Returns a 200 Ok response if verification code is valid and user is successfully registered.
        /// </returns>
        [HttpPost("verify-code")]
        public IActionResult VerifyCode([FromBody] VerifyCodeRequest request)
        {
            bool verified = _authService.VerifyEmail(request.Email, request.Code);

            if (!verified)
                return BadRequest(new { message = "Սխալ կամ ժամկետանց հաստատման կոդ:" });

            return Ok(new { message = "Email successfully verified. You can now log in." });
        }

        /// <summary>
        /// This endpoint handles user account deletion.
        /// </summary>
        /// <param name="request">Contains the email of the user to delete</param>
        /// <returns>
        /// Returns a 200 OK response if account deletion succeeds,
        /// 404 Not Found if user does not exist,
        /// or 500 Internal Server Error if something unexpected happens.
        /// </returns>
        [HttpDelete("delete-account")]
        public IActionResult DeleteAccount([FromBody] DeleteAccountRequest request)
        {
            try
            {
                bool success = _authService.DeleteUser(request.Email);
                if (!success)
                    return NotFound(new { message = "User not found." });

                return Ok(new { message = "Account deleted successfully." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] DeleteAccount: {ex.Message}");
                // Log the actual exception in production
                return StatusCode(500, new { message = "An error occurred while deleting the account." });
            }
        }

        [HttpPost("forgot-password")]
        public IActionResult ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            string code = _authService.GenerateAndStoreResetCode(request.Email);

            if (code == null)
                return NotFound(new { message = "Օգտատերը չի գտնվել։" });

            string subject = "Գաղտնաբառի վերականգնման կոդ";
            string body = $"<p>Ողջույն,</p><p>Ձեր գաղտնաբառի վերականգնման կոդն է՝ <strong>{code}</strong></p><p>Խնդրում ենք մուտքագրել այս կոդը ձեր գաղտնաբառը փոխելու համար։</p>";

            _emailService.SendEmail(request.Email, subject, body);
            return Ok(new { message = "Վերականգնման կոդը ուղարկվել է ձեր էլ. հասցեին։" });
        }

        [HttpPost("reset-password")]
        public IActionResult ResetPassword([FromBody] ResetPasswordRequest req)
        {
            try
            {
                _authService.ResetPasswordWithCode(req.Email, req.Code, req.NewPassword);
                return Ok(new { message = "Գաղտնաբառը հաջողությամբ փոխվեց։" });
            }
            catch (ArgumentException ex)
            {
                // ex.Message already contains the specific reason
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "Սերվերի սխալ։" });
            }
        }

        [HttpPost("verify-reset-code")]
        public IActionResult VerifyResetCode([FromBody] VerifyCodeRequest request)
        {
            bool ok = _authService.VerifyResetCode(request.Email, request.Code);

            if (!ok)
                return BadRequest(new { message = "Կոդը սխալ է կամ ժամկետն անցել է։" });

            return Ok(new { message = "Կոդը հաստատվեց, կարող եք փոխել գաղտնաբառը։" });
        }

        [HttpPost("resend-code")]
        public IActionResult ResendVerificationCode([FromBody] ForgotPasswordRequest request)
        {
            var newCode = _authService.GenerateAndStoreResetCode(request.Email);

            if (newCode == null)
                return NotFound(new { message = "Օգտատերը չի գտնվել կամ արդեն հաստատված է։" });

            string subject = "Նոր հաստատման կոդ";
            string body = $"<p>Ողջույն,</p><p>Ձեր նոր հաստատման կոդն է՝ <strong>{newCode}</strong></p>";

            _emailService.SendEmail(request.Email, subject, body);
            return Ok(new { message = "Նոր հաստատման կոդը ուղարկվել է ձեր էլ. հասցեին։" });
        }



        public class ForgotPasswordRequest
        {
            public string Email { get; set; }
        }

        public class ResetPasswordRequest
        {
            public string Email { get; set; }
            public string Code { get; set; }
            public string NewPassword { get; set; }
        }


    }

    /// <summary>
    /// Request models
    /// </summary>
    public class LoginRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class RegisterRequest
    {
        public string Username { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string Role { get; set; } = "User";
    }

    public class VerifyCodeRequest
    {
        public string Email { get; set; }
        public string Code { get; set; }
    }


    public class DeleteAccountRequest
    {
        public string Email { get; set; }
    }

}
