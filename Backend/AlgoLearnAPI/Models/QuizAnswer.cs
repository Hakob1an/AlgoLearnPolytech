namespace AlgoLearnAPI.Models
{
    public class QuizAnswer
    {
        public int Id { get; set; }

        public int QuizResultId { get; set; }      // link to the user’s attempt
        public QuizResult QuizResult { get; set; }

        public int QuizQuestionId { get; set; }    // which question was answered
        public QuizQuestion QuizQuestion { get; set; }

        public string SelectedOption { get; set; } // e.g. "A", "B", "True", etc.
        public bool IsCorrect { get; set; }        // store correctness if computed
    }
}
