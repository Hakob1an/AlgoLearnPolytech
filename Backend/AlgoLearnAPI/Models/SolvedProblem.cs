namespace AlgoLearnAPI.Models
{
    public class SolvedProblem
    {
        public int Id { get; set; }

        public int UserId { get; set; }
        public User User { get; set; }

        public int SuggestionId { get; set; }
        public Suggestion Suggestion { get; set; }

        public string Difficulty { get; set; }
        public DateTime SolvedAt { get; set; } = DateTime.UtcNow;
    }
}
