using Microsoft.AspNetCore.Mvc;
using AlgoLearnAPI.Data;
using AlgoLearnAPI.Models;
using System.Linq;

namespace AlgoLearnAPI.Controllers
{
    [ApiController]
    [Route("api/problems")]
    public class ProblemController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProblemController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("{problemName}/unsolve")]
        public IActionResult UnmarkProblemAsSolved(string problemName, [FromBody] ProblemSolveRequest request)
        {
            var user = _context.Users.SingleOrDefault(u => u.Email == request.UserEmail);
            if (user == null)
                return NotFound(new { message = "User not found." });

            var suggestion = _context.Suggestions.FirstOrDefault(s => s.ProblemName == problemName);
            if (suggestion == null)
                return NotFound(new { message = "Problem not found in suggestions." });

            var solvedProblem = _context.SolvedProblems
                .SingleOrDefault(sp => sp.UserId == user.Id && sp.SuggestionId == suggestion.Id);

            if (solvedProblem == null)
                return Ok(new { message = "Problem is already not marked as solved." });

            _context.SolvedProblems.Remove(solvedProblem);
            _context.SaveChanges();

            return Ok(new { message = "Problem unmarked as solved." });
        }


        [HttpPost("{problemName}/solve")]
        public IActionResult MarkProblemAsSolved(string problemName, [FromBody] ProblemSolveRequest request)
        {
            var user = _context.Users.SingleOrDefault(u => u.Email == request.UserEmail);
            if (user == null)
                return NotFound(new { message = "User not found." });

            // ✅ Resolve SuggestionId using Problem Name
            var suggestion = _context.Suggestions.FirstOrDefault(s => s.ProblemName == problemName);
            if (suggestion == null)
                return NotFound(new { message = "Problem not found in suggestions." });

            bool alreadySolved = _context.SolvedProblems.Any(sp => sp.UserId == user.Id && sp.SuggestionId == suggestion.Id);
            if (alreadySolved)
                return Ok(new { message = "Problem already marked as solved." });

            _context.SolvedProblems.Add(new SolvedProblem
            {
                UserId = user.Id,
                SuggestionId = suggestion.Id,
                Difficulty = suggestion.Difficulty,
                SolvedAt = DateTime.UtcNow
            });

            _context.SaveChanges();

            return Ok(new { message = "Problem marked as solved." });
        }

    }

    public class ProblemSolveRequest
    {
        public string UserEmail { get; set; }
        public string ProblemName { get; set; }
    }
}
