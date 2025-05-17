using Microsoft.AspNetCore.Mvc;
using AlgoLearnAPI.Services;
using AlgoLearnAPI.Data;
using System.Linq;

namespace AlgoLearnAPI.Controllers
{
    [ApiController]
    [Route("api/achievements")]
    public class AchievementController : ControllerBase
    {
        private readonly AchievementService _achievementService;
        private readonly AppDbContext _context;

        public AchievementController(AppDbContext context)
        {
            _context = context;
            _achievementService = new AchievementService(context);
        }

        // ✅ Get Achievements for a User
        [HttpGet("{email}")]
        public IActionResult GetUserAchievements(string email)
        {
            var user = _context.Users.SingleOrDefault(u => u.Email == email);
            if (user == null)
                return NotFound(new { message = "User not found." });

            var achievements = _achievementService.GetUserAchievements(user.Id);
            return Ok(achievements);
        }

        // ✅ Unlock an Achievement for a User
        [HttpPost("unlock")]
        public IActionResult UnlockAchievement([FromBody] UnlockAchievementRequest request)
        {
            var user = _context.Users.SingleOrDefault(u => u.Email == request.Email);
            if (user == null)
                return NotFound(new { message = "User not found." });

            bool unlocked = _achievementService.UnlockAchievement(user.Id, request.AchievementId);
            if (!unlocked)
                return BadRequest(new { message = "Achievement already unlocked or does not exist." });

            return Ok(new { message = "Achievement unlocked successfully!" });
        }
    }

    public class UnlockAchievementRequest
    {
        public string Email { get; set; }
        public int AchievementId { get; set; }
    }
}
