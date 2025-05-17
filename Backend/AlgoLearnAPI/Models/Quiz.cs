namespace AlgoLearnAPI.Models
{
    public class Quiz
    {
        public int Id { get; set; }

        public int TopicId { get; set; }
        public Topic Topic { get; set; }
        public string Title { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<QuizQuestion> Questions { get; set; }
    }
}
