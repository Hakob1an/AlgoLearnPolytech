using Microsoft.AspNetCore.Mvc;
using AlgoLearnAPI.Services;
using AlgoLearnAPI.Data;
using System.Linq;

namespace AlgoLearnAPI.Controllers
{
    [ApiController]
    [Route("api/suggestions")]
    public class SuggestionController : ControllerBase
    {
        private readonly SuggestionService _suggestionService;
        private readonly AppDbContext _context;

        public SuggestionController(AppDbContext context)
        {
            _context = context;
            _suggestionService = new SuggestionService(context);
        }

        /// <summary>
        /// This endpoint retrieves problem suggestions according to a specific topic.
        /// Uses GetSuggestionsByTopic method from SuggestionService.
        /// </summary>
        /// <param name="topicName"></param>
        /// <returns>
        /// Returns 404 Not Found response if no suggestions are found.
        /// Returns 200 OK response if suggestions are found.
        /// </returns>
        [HttpGet("{topicName}")]
        public IActionResult GetSuggestions(string topicName)
        {
            var suggestions = _suggestionService.GetSuggestionsByTopic(topicName);
            if (suggestions.Count == 0)
                return NotFound(new { message = "No suggestions found for this topic." });

            return Ok(suggestions);
        }

        /// <summary>
        /// This endpoint is responsible for adding new suggestion to DB.
        /// Uses AddSuggestion method from SuggestionService.
        /// </summary>
        /// <param name="request">Request contains the corresponding topic's name, problem name and problem link</param>
        /// <returns>
        /// Returns 400 Bad Request response if one of the field is missing.
        /// Returns 200 OK response if problem is successfully added.
        /// </returns>
        [HttpPost("add")]
        public IActionResult AddSuggestion([FromBody] SuggestionRequest request)
        {
            if (string.IsNullOrEmpty(request.TopicName) ||
                string.IsNullOrEmpty(request.ProblemName) ||
                string.IsNullOrEmpty(request.ProblemLink))
            {
                return BadRequest(new { message = "All fields are required." });
            }

            _suggestionService.AddSuggestion(request.TopicName, request.ProblemName, request.ProblemLink);
            return Ok(new { message = "Problem suggestion added successfully!" });
        }
    }

    /// <summary>
    /// DTO for handling suggestion requests.
    /// </summary>
    public class SuggestionRequest
    {
        public string TopicName { get; set; }
        public string ProblemName { get; set; }
        public string ProblemLink { get; set; }
    }
}
