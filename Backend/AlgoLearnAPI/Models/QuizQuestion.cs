namespace AlgoLearnAPI.Models
{
    public class QuizQuestion
    {
        public int Id { get; set; }

        public int QuizId { get; set; }
        public Quiz Quiz { get; set; }   

        public string QuestionText { get; set; }
        public string QuestionType { get; set; }    
        public string CorrectAnswer { get; set; }   // e.g. "A", "True", etc.
        public int QuestionNumber { get; set; }
    }
}
