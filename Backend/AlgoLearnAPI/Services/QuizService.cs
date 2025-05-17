using AlgoLearnAPI.Controllers;
using AlgoLearnAPI.Data;
using AlgoLearnAPI.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace AlgoLearnAPI.Services
{
    public class QuizService
    {
        private readonly AppDbContext _context;

        public QuizService(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Fetches quiz questions by topic name (based on Topics table).
        /// Splits question vs choices from a single QuestionText column.
        /// </summary>
        public List<QuizQuestionDto> GetQuizByTopic(string topic)
        {
            // 1) Find the quizId from the topic name
            var quizId = _context.Topics
                .Where(t => t.Name == topic)
                .Select(t => t.Id)
                .FirstOrDefault();

            if (quizId == 0)
                return new();

            // 2) Pull all questions for that quizId
            var rawQuestions = _context.QuizQuestions
                .Where(q => q.QuizId == quizId)
                .OrderBy(q => q.QuestionNumber)
                .AsEnumerable(); // switch to in-memory so we can parse

            // 3) Parse each question’s text into (QuestionOnly, Choices)
            var questions = rawQuestions
                .Select(q =>
                {
                    // parse question vs. choice lines
                    var (questionOnly, choiceLines) = ParseQuestionAndChoices(q.QuestionText);

                    return new QuizQuestionDto
                    {
                        Id = q.Id,
                        QuestionType = q.QuestionType,
                        // store the question portion only (no enumerations)
                        QuestionText = questionOnly,
                        // if "multiple", we list the enumerations as choices
                        Choices = q.QuestionType == "multiple"
                                  ? choiceLines.Select(RemoveNumbering).ToList()
                                  : null
                    };
                })
                .ToList();

            return questions;
        }

        /// <summary>
        /// Grades the quiz and returns result
        /// </summary>
        public QuizResultDto EvaluateSubmission(QuizSubmission submission)
        {
            var questionIds = submission.Answers.Select(a => a.QuestionId).ToList();

            var questions = _context.QuizQuestions
                .Where(q => questionIds.Contains(q.Id))
                .ToList();

            int correctCount = 0;
            var answerEntities = new List<QuizAnswer>();
            var wrongQuestions = new List<int>();

            foreach (var answer in submission.Answers)
            {
                var question = questions.FirstOrDefault(q => q.Id == answer.QuestionId);
                if (question == null) continue;

                string userAns = answer.Answer.Trim();
                string correctAns = question.CorrectAnswer.Trim();

                bool isCorrect = question.QuestionType switch
                {
                    "multiple" => userAns == correctAns,
                    "text" => string.Equals(userAns, correctAns, StringComparison.OrdinalIgnoreCase),
                    "regex" => Regex.IsMatch(userAns, correctAns, RegexOptions.IgnoreCase),
                    _ => false
                };

                if (isCorrect) correctCount++;
                else wrongQuestions.Add(answer.QuestionId);

                answerEntities.Add(new QuizAnswer
                {
                    QuizQuestionId = question.Id,
                    SelectedOption = userAns,
                    IsCorrect = isCorrect
                });
            }

            // Identify user from email
            var user = _context.Users.FirstOrDefault(u => u.Email == submission.UserEmail);
            if (user == null)
            {
                throw new Exception("User not found for email: " + submission.UserEmail);
            }

            // quizId from the topic name
            var quizId = _context.Topics
                .Where(t => t.Name == submission.Topic)
                .Select(t => t.Id)
                .FirstOrDefault();

            if (quizId == 0)
            {
                throw new Exception("Topic not found: " + submission.Topic);
            }

            // Save the overall quiz result
            var quizResult = new QuizResult
            {
                UserId = user.Id,
                QuizId = quizId,
                SubmittedAt = DateTime.UtcNow,
                CorrectCount = correctCount,
                TotalQuestions = submission.Answers.Count
            };

            _context.QuizResults.Add(quizResult);
            _context.SaveChanges(); // to get primary key

            // Save individual answers
            foreach (var ans in answerEntities)
            {
                ans.QuizResultId = quizResult.Id;
                _context.QuizAnswers.Add(ans);
            }

            _context.SaveChanges();

            // Return final result
            return new QuizResultDto
            {
                Total = submission.Answers.Count,
                Correct = correctCount,
                Wrong = submission.Answers.Count - correctCount,
                WrongQuestions = wrongQuestions,
                CanComplete = wrongQuestions.Count <= 1
            };
        }

        /// <summary>
        /// Splits a single text into two parts:
        /// 1) The main question (everything until we see a line like "1) ...")
        /// 2) The lines of choices
        /// </summary>
        private (string QuestionOnly, List<string> Choices) ParseQuestionAndChoices(string fullText)
        {
            // 1) Split by newline, remove empty lines
            var lines = fullText
                .Split('\n')
                .Select(l => l.Trim())
                .Where(l => !string.IsNullOrEmpty(l))
                .ToList();

            // 2) find the index of the first line that is like "1) Choice"
            int index = lines.FindIndex(l => Regex.IsMatch(l, @"^\d\)"));

            if (index == -1)
            {
                // No multiple choice lines found
                return (fullText, new List<string>());
            }

            // question lines = everything before that index
            var questionLines = lines.Take(index).ToList();
            var questionOnly = string.Join("\n", questionLines);

            // choice lines = from index to the end
            var choiceLines = lines.Skip(index).ToList();

            return (questionOnly, choiceLines);
        }

        /// <summary>
        /// Removes the "1) ", "2) " prefix if present
        /// E.g.: "1) O(n²)" => "O(n²)"
        /// </summary>
        private string RemoveNumbering(string line)
        {
            return Regex.Replace(line, @"^\d\)\s*", "");
        }
    }

    /// <summary>
    /// DTO returned to frontend
    /// </summary>
    public class QuizQuestionDto
    {
        public int Id { get; set; }
        public string QuestionText { get; set; }
        public string QuestionType { get; set; }
        public List<string>? Choices { get; set; }
    }

    public class QuizResultDto
    {
        public int Total { get; set; }
        public int Correct { get; set; }
        public int Wrong { get; set; }
        public List<int> WrongQuestions { get; set; }
        public bool CanComplete { get; set; }
    }
}
