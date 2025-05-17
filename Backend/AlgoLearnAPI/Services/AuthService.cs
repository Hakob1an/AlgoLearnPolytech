using AlgoLearnAPI.Data;
using AlgoLearnAPI.Models;
using System.Linq;
using System.Text.RegularExpressions;
using System.Security.Cryptography;
using Microsoft.Extensions.Configuration;

namespace AlgoLearnAPI.Services
{
    public class AuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public AuthService(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        /// <summary>
        /// This method is responsible for authenticating user.
        /// </summary>
        /// <param name="email">The email address of the user attempting to log in</param>
        /// <param name="password">The password that user prompted</param>
        /// <returns>
        /// Returns the authenticated user.
        /// </returns>
        /// <exception cref="UnauthorizedAccessException">
        /// Exception is thrown if user is not found, password is incorrect or email is not verified.
        /// </exception>
        public User? Login(string email, string password)
        {
            var user = _context.Users.SingleOrDefault(u => u.Email == email);

            if (user == null)
                throw new UnauthorizedAccessException("Գաղտնաբառը կամ օգտանունը սխալ է:");

            if (!BCrypt.Net.BCrypt.Verify(password, user.Password))
                throw new UnauthorizedAccessException("Գաղտնաբառը կամ օգտանունը սխալ է:");

            if (!user.IsVerified)
                throw new UnauthorizedAccessException("Please verify your email before logging in.");

            return user;
        }

        /// <summary>
        /// This method is responsible for registering new user.
        /// It generated and returns a 6-digit code for verification.
        /// Hashes the password that user prompted.
        /// Updated the Users table and adds a new user there.
        /// </summary>
        /// <param name="email">The email that user prompted.</param>
        /// <param name="password">The password that user prompted.</param>
        /// <param name="username">The username that user prompted</param>
        /// <returns>
        /// Returns null if email already is registered.
        /// Returns the verification code if email is new.
        /// </returns>
        /// <exception cref="ArgumentException"></exception>
        public string? Register(string email, string password, string username, string role)
        {
            if (_context.Users.Any(u => u.Email == email))
                return null;

            if (!IsValidPassword(password))
                throw new ArgumentException("Password must be at least 8 characters long, contain uppercase, lowercase, number, and a special character.");

            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);
            string verificationCode = GenerateVerificationToken();

            var user = new User
            {
                Email = email,
                Password = hashedPassword,
                Username = username,
                IsVerified = false,
                VerificationToken = verificationCode,
                VerificationTokenGeneratedAt = DateTime.UtcNow,
                Role = role
            };

            _context.Users.Add(user);
            _context.SaveChanges();

            Console.WriteLine($"✅ [DEBUG] Stored Verification Code for {email}: {verificationCode}");

            return verificationCode;
        }


        /// <summary>
        /// This method is responsible for email verification.
        /// </summary>
        /// <param name="email">The email user prompted before.</param>
        /// <param name="token">The verification token/code that was sent to user's email.</param>
        /// <returns>
        /// Returns false if user is not found, is already verified or verification codes does not match.
        /// Returns true and updates DB otherwise.
        /// </returns>
        public bool VerifyEmail(string email, string token)
        {
            var user = _context.Users.SingleOrDefault(u => u.Email == email);

            Console.WriteLine($"🔎 Checking verification for {email} - Stored Code: {user?.VerificationToken}, Entered Code: {token}");

            if (user == null)
            {
                Console.WriteLine("❌ User not found.");
                return false;
            }
            if (user.IsVerified)
            {
                Console.WriteLine("⚠️ User is already verified.");
                return false;
            }
            if (user.VerificationToken != token)
            {
                Console.WriteLine("❌ Verification code does not match.");
                return false;
            }

            if (user.VerificationTokenGeneratedAt == null ||
    (DateTime.UtcNow - user.VerificationTokenGeneratedAt.Value).TotalMinutes > 2)
            {
                Console.WriteLine("❌ Verification code expired.");
                return false;
            }


            user.IsVerified = true;
            user.VerificationToken = null;
            _context.SaveChanges();
            return true;
        }



        /// <summary>
        /// The method is responsible for password validation.
        /// It checks if password has at least one upper, one lower letters, one digit and one symbol
        /// and is at least 8 characters long.
        /// </summary>
        /// <param name="password">The password that user prompted.</param>
        /// <returns>
        /// Returns true if password is valid.
        /// Returns false otherwise.
        /// </returns>
        private bool IsValidPassword(string password)
        {
            return Regex.IsMatch(password, @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}:;.,<>?]).{8,}$");
        }

        /// <summary>
        /// This method is responsible for verification token generation.
        /// </summary>
        /// <returns>
        /// returns the generated 6-digit code/token.
        /// </returns>
        private string GenerateVerificationToken()
        {
            return new Random().Next(100000, 999999).ToString();
        }

        public bool DeleteUser(string email)
        {
            var user = _context.Users.SingleOrDefault(u => u.Email == email);
            if (user == null)
                return false;

            _context.Users.Remove(user);
            _context.SaveChanges();
            // EF automatically removes any related records
            return true;
        }

        public string? GenerateAndStoreResetCode(string email)
        {
            var user = _context.Users.SingleOrDefault(u => u.Email == email);
            if (user == null) return null;

            string resetCode = GenerateVerificationToken();
            user.VerificationToken = resetCode;
            _context.SaveChanges();

            Console.WriteLine($"[RESET CODE] For {email}: {resetCode}");
            return resetCode;
        }

        public bool ResetPasswordWithCode(string email, string code, string newPassword)
        {
            var user = _context.Users.SingleOrDefault(u => u.Email == email)
               ?? throw new ArgumentException("Օգտատերը չի գտնվել։");

            if (user.VerificationToken != code)
                throw new ArgumentException("Կոդը սխալ է կամ ժամկետն անցել է։");

            if (!IsValidPassword(newPassword))
                throw new ArgumentException("Գաղտնաբառը բավարար ուժեղ չէ։");

            if (BCrypt.Net.BCrypt.Verify(newPassword, user.Password))
                throw new ArgumentException("Նոր գաղտնաբառը չի կարող համընկնել հին գաղտնաբառի հետ։");

            user.Password = BCrypt.Net.BCrypt.HashPassword(newPassword);
            user.VerificationToken = null;
            _context.SaveChanges();
            return true;
        }

        public bool VerifyResetCode(string email, string code)
        {
            var user = _context.Users.SingleOrDefault(u => u.Email == email);
            if (user == null) return false;

            return user.VerificationToken == code;          // կարող ես ժամկետ էլ ստուգել, եթե պահես
        }

    }
}
