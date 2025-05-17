using Microsoft.AspNetCore.Mvc;
using AlgoLearnAPI.Data;
using AlgoLearnAPI.Models;
using AlgoLearnAPI.DTOs;
using System.Linq;

namespace AlgoLearnAPI.Controllers
{
    [ApiController]
    [Route("api/dashboard")]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;
        internal static readonly Dictionary<string, List<string>> problemSuggestions = new() { };

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// This endpoint is responsible for returning the dashboard data for specified user.
        /// That data includes user progress, last viewed item, suggestions.
        /// </summary>
        /// <param name="email"></param>
        /// <returns>
        /// Returns 400 Bad Request response if no email is specified.
        /// Returns 404 Not Found request if no user with specified email is found.
        /// Returns 200 OK request with the dashboard data if the user is found. 
        /// </returns>
        [HttpGet("{email}")]
        public IActionResult GetDashboardData(string email)
        {
            if (string.IsNullOrEmpty(email))
            {
                return BadRequest(new { message = "Email is required to fetch dashboard data." });
            }

            var user = _context.Users.SingleOrDefault(u => u.Email == email);
            if (user == null)
            {
                return NotFound(new { message = "Օգտագործողը չի գտնվել: Խնդրում ենք փորձել կրկին:" });
            }

            var completedTopics = _context.UserCompletions
                .Where(c => c.UserId == user.Id)
                .Select(c => c.TopicName)
                .ToList();

            int totalTopics = _context.Topics.Count();


            int completionPercentage = totalTopics > 0 ? (completedTopics.Count * 100) / totalTopics : 0;

            return Ok(new
            {
                username = user.Username,
                message = $"Welcome, {user.Username}!",
                progress = completionPercentage,
                lastViewedItem = completedTopics.LastOrDefault(),
                suggestions = completedTopics
            });
        }

        /// <summary>
        /// This endpoind handles users' progress saving.
        /// It retrieves th total count of topics from DB, then retrieves the topics
        /// that user completed, counts the progress and saves it.
        /// It also saves/updates the last viewed item.
        /// </summary>
        /// <param name="request">The save progress request that contains email and last viewed item</param>
        /// <returns>
        /// Returns 400 Bad Request response if email is empty.
        /// Returns 404 Not Found response if user is not found.
        /// Returns 200 OK response if user is found and updates DB.
        /// </returns>
        [HttpPost("saveProgress")]
        public IActionResult SaveProgress([FromBody] ProgressRequest request)
        {
            if (string.IsNullOrEmpty(request.Email))
            {
                return BadRequest(new { message = "Email is required to save progress." });
            }

            var user = _context.Users.SingleOrDefault(u => u.Email == request.Email);
            if (user == null)
            {
                return NotFound(new { message = "User not found in the database." });
            }

            int totalTopics = problemSuggestions.Keys.Count;
            if (totalTopics == 0)
            {
                return StatusCode(500, new { message = "No topics available for progress calculation." });
            }

            int completedTopics = _context.UserCompletions.Count(c => c.UserId == user.Id);
            int newProgress = (int)Math.Round((double)(completedTopics * 100) / totalTopics);

            var progress = _context.Progresses.SingleOrDefault(p => p.UserId == user.Id);
            if (progress == null)
            {
                progress = new Progress
                {
                    UserId = user.Id,
                    CompletionPercentage = newProgress, 
                    LastViewedItem = request.LastViewedItem
                };
                _context.Progresses.Add(progress);
            }
            else
            {
                progress.CompletionPercentage = newProgress; 
                progress.LastViewedItem = request.LastViewedItem;
                progress.LastUpdated = DateTime.UtcNow;
            }

            try
            {
                _context.SaveChanges();
                return Ok(new { message = "Progress saved successfully!", progress = newProgress });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Database error while saving progress.", error = ex.Message });
            }
        }

        /// <summary>
        /// This endpoint is responsible for retrieving the last viewed item.
        /// </summary>
        /// <param name="email"></param>
        /// <returns>
        /// Returns 404 Not Found response if user is not found.
        /// Returns 200 OK result with the name of user's last viewed item if any.
        /// </returns>
        [HttpGet("getLastViewedItem/{email}")]
        public IActionResult GetLastViewedItem(string email)
        {
            var user = _context.Users.FirstOrDefault(u => u.Email == email);
            if (user == null)
                return NotFound(new { message = "User not found" });

            var progress = _context.Progresses
                .Where(p => p.UserId == user.Id)
                .OrderByDescending(p => p.LastUpdated)
                .FirstOrDefault();

            if (progress == null || string.IsNullOrEmpty(progress.LastViewedItem))
                return Ok(new { lastViewedItem = "", lastViewedCategory = "" });

            string[] algorithmTopics = { "BubbleSort", "Dijkstra" };
            string category = algorithmTopics.Contains(progress.LastViewedItem) ? "Algorithm" : "DataStructure";

            return Ok(new
            {
                lastViewedItem = progress.LastViewedItem,
                lastViewedCategory = category
            });
        }

        /// <summary>
        /// This endpoint for marking a topic completed. 
        /// It first checks if it is already marked as completed in DB, 
        /// if not, then marks.
        /// </summary>
        /// <param name="request">This request conatins the user's email and topic name</param>
        /// <returns>
        /// Returns 400 Bad Request response if no email or topic name is entered.
        /// Returns 404 Nor Found response if user is not found.
        /// Returns 200 OK request if topic is successfully marked as completed.
        /// </returns>
        [HttpPost("complete")]
        public IActionResult MarkTopicCompleted([FromBody] CompletionRequest request)
        {
            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.TopicName))
            {
                return BadRequest(new { message = "Email and TopicName are required." });
            }

            var user = _context.Users.FirstOrDefault(u => u.Email == request.Email);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            var existingCompletion = _context.UserCompletions
                .FirstOrDefault(c => c.UserId == user.Id && c.TopicName == request.TopicName);

            if (existingCompletion == null)
            {
                _context.UserCompletions.Add(new UserCompletion
                {
                    UserId = user.Id,
                    TopicName = request.TopicName
                });

                _context.SaveChanges();
            }

            return Ok(new { message = "Topic marked as completed." });
        }

        /// <summary>
        /// This endpoint is responsible for retrieving the problem suggestions for
        /// user according to users completed topics/progress.
        /// It randomly selects 3 problems and returns it.
        /// </summary>
        /// <param name="email"></param>
        /// <returns>
        /// Returns 400 Bad Request response when email is missing.
        /// Returns 404 Not Found response when user is not found.
        /// Returns 200 OK response with suggestions if user is found and has progress, 
        /// if no progress or suggestions are available returns informative message.
        /// </returns>
        [HttpGet("suggestions/{email}")]
        public IActionResult GetProblemSuggestions(string email)
        {
            if (string.IsNullOrEmpty(email))
            {
                return BadRequest(new { message = "Email is required." });
            }

            var user = _context.Users.FirstOrDefault(u => u.Email == email);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            var completedTopics = _context.UserCompletions
                .Where(c => c.UserId == user.Id)
                .Select(c => c.TopicName)
                .ToList();

            if (!completedTopics.Any())
            {
                return Ok(new { message = "No completed topics. Start learning to get suggestions!" });
            }

            var suggestions = _context.Suggestions
                .Where(s => completedTopics.Contains(s.Topic.Name))
                .Select(s => new
                {
                    ProblemName = s.ProblemName,
                    ProblemLink = s.ProblemLink,
                    ProblemDifficulty = s.Difficulty
                })
                .ToList();

            if (!suggestions.Any())
            {
                return Ok(new { message = "No problem suggestions available for your completed topics." });
            }

            var selectedProblems = suggestions.OrderBy(_ => Guid.NewGuid()).Take(3).ToList();

            return Ok(selectedProblems);
        }

        /// <summary>
        /// This endpoint is responsible for retrieving user's completed topics.
        /// </summary>
        /// <param name="email"></param>
        /// <returns>
        /// Returns 400 Bad Request response if email is missing.
        /// Returns 404 Not Found response if user if not found.
        /// Returns 200 OK respone with topics that user completed when user is found.
        /// </returns>
        [HttpGet("completed/{email}")]
        public IActionResult GetCompletedTopics(string email)
        {
            if (string.IsNullOrEmpty(email))
            {
                return BadRequest(new { message = "Email is required." });
            }

            var user = _context.Users.FirstOrDefault(u => u.Email == email);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            var completedTopics = _context.UserCompletions
                .Where(c => c.UserId == user.Id)
                .Select(c => c.TopicName)
                .ToList();

            return Ok(completedTopics);
        }

        /// <summary>
        /// This endpoint is responsible for updating the user's last viewed item.
        /// </summary>
        /// <param name="request">Request contains user's email and the name of last viewed topic/item</param>
        /// <returns>
        /// Returns 400 Bad Request response if email and/or last viewed item is missing.
        /// Returns 404 Not Found response if user is not found.
        /// Returns 200 OK response if updated successfully.
        /// Returns 500 Server Error when any problems with DB occur.
        /// </returns>
        [HttpPost("updateLastViewed")]
        public IActionResult UpdateLastViewed([FromBody] LastViewedRequest request)
        {
            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.LastViewedItem))
            {
                return BadRequest(new { message = "Email and LastViewedItem are required." });
            }

            var user = _context.Users.SingleOrDefault(u => u.Email == request.Email);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            var progress = _context.Progresses.SingleOrDefault(p => p.UserId == user.Id);
            if (progress == null)
            {
                progress = new Progress
                {
                    UserId = user.Id,
                    CompletionPercentage = 0,
                    LastViewedItem = request.LastViewedItem,
                    LastUpdated = DateTime.UtcNow
                };
                _context.Progresses.Add(progress);
            }
            else
            {
                progress.LastViewedItem = request.LastViewedItem;
                progress.LastUpdated = DateTime.UtcNow;
            }

            try
            {
                _context.SaveChanges();
                return Ok(new { message = "Last viewed item updated successfully!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Database error while updating last viewed item.", error = ex.Message });
            }
        }

        /// <summary>
        /// DTO for last viewed item updates
        /// </summary>
        public class LastViewedRequest
        {
            public string Email { get; set; }
            public string LastViewedItem { get; set; }
        }

    }

    /// <summary>
    /// DTO for handling progress changes.
    /// </summary>
    public class ProgressRequest
    {
        public string Email { get; set; }
        public int CompletionPercentage { get; set; }
        public string LastViewedItem { get; set; }
    }
}
