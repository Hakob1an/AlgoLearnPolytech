using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AlgoLearnAPI.Models
{
    public class Suggestion
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string ProblemName { get; set; } = string.Empty;

        [Required]
        public string ProblemLink { get; set; } = string.Empty;

        [Required]
        public int TopicId { get; set; }

        [ForeignKey("TopicId")]
        public Topic Topic { get; set; } = null!;

        public string Difficulty { get; set; }
    }
}
