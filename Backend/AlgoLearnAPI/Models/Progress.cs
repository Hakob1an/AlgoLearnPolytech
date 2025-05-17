namespace AlgoLearnAPI.Models
{
    public class Progress
    {
        public int Id { get; set; }
        public int UserId { get; set; }

        public int CompletionPercentage { get; set; }
        public string? LastViewedItem { get; set; }
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

        public User User { get; set; }
    }
}
