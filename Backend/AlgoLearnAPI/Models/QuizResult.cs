namespace AlgoLearnAPI.Models
{
    public class QuizResult
    {
        public int Id { get; set; }

        public int UserId { get; set; }     
        public User User { get; set; }   

        public int QuizId { get; set; }
        public Quiz Quiz { get; set; }

        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

        public int? CorrectCount { get; set; }
        public int? TotalQuestions { get; set; }

        public ICollection<QuizAnswer> QuizAnswers { get; set; }
    }
}
