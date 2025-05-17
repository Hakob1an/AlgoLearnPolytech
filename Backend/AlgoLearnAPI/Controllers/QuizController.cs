using Microsoft.AspNetCore.Mvc;
using AlgoLearnAPI.Services;
using AlgoLearnAPI.Models;

namespace AlgoLearnAPI.Controllers
{
    [ApiController]
    [Route("api/quiz")]
    public class QuizController : ControllerBase
    {
        private readonly QuizService _quizService;

        public QuizController(QuizService quizService)
        {
            _quizService = quizService;
        }

        /// <summary>
        /// Gets all quiz questions for a given topic.
        /// </summary>
        /// <param name="topic">The topic name or slug</param>
        /// <returns>List of questions</returns>
        [HttpGet("{topic}")]
        public IActionResult GetQuiz(string topic)
        {
            var questions = _quizService.GetQuizByTopic(topic);
            if (questions == null || questions.Count == 0)
                return NotFound(new { message = "No quiz found for this topic." });

            return Ok(questions);
        }

        /// <summary>
        /// Submits the user's answers and returns feedback (correct/wrong, etc.)
        /// </summary>
        /// <param name="submission">List of answers by question ID</param>
        /// <returns>Graded result</returns>
        [HttpPost("submit")]
        public IActionResult SubmitQuiz([FromBody] QuizSubmission submission)
        {
            var result = _quizService.EvaluateSubmission(submission);

            return Ok(result);
        }
    }

    /// <summary>
    /// Submission format from frontend
    /// </summary>
    public class QuizSubmission
    {
        public string Topic { get; set; } = null!;
        public string UserEmail { get; set; } = null!;
        public List<UserAnswer> Answers { get; set; } = new();
    }

    public class UserAnswer
    {
        public int QuestionId { get; set; }
        public string Answer { get; set; } = null!;
    }

}
