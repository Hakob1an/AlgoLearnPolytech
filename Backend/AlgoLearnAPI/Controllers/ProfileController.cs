using Microsoft.AspNetCore.Mvc;
using AlgoLearnAPI.Services;

namespace AlgoLearnAPI.Controllers
{
    [ApiController]
    [Route("api/profile")]
    public class ProfileController : ControllerBase
    {
        private readonly ProfileService _profileService;

        public ProfileController(ProfileService profileService)
        {
            _profileService = profileService;
        }

        /// <summary>
        /// This endpoint is responsible for retrieving user's profile info.
        /// It includes username, email, the date account was created, progress, 
        /// achievements(if any).
        /// Uses GetProfile method in ProfileService.
        /// </summary>
        /// <param name="email"></param>
        /// <returns>
        /// Returns 404 Not Found response if user is not found.
        /// Returns 200 OK response if user is found.
        /// </returns>
        [HttpGet("{email}")]
        public IActionResult GetProfile(string email)
        {
            Console.WriteLine($"Controller received request for email: {email}");

            var profile = _profileService.GetProfile(email);
            if (profile == null)
            {
                return NotFound(new { message = "User not found." });
            }

            return Ok(profile);
        }

        /// <summary>
        /// This endpoint is responsible for updating the user's profile.
        /// It updates user's email, password and/or username.
        /// Uses UpdateProfile method in ProfileService.
        /// </summary>
        /// <param name="email"></param>
        /// <param name="model">Contains new email, password and/or username</param>
        /// <returns>
        /// Returns 404 Not Fount response if user is not found.
        /// Returns 200 OK respone if user is found and profile is successfully updated.
        /// </returns>
        [HttpPut("{email}")]
        public IActionResult UpdateProfile(string email, [FromBody] UpdateProfileRequest model)
        {
            var success = _profileService.UpdateProfile(email, model);

            if (!success)
            {
                return NotFound(new { message = "User not found or could not be updated." });
            }

            return Ok(new { message = "Profile updated successfully." });
        }
    }
}
