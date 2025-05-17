using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AlgoLearnAPI.Models
{
    public class Topic
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        public bool IsHidden { get; set; } = false;
        public string Type { get; set; } = "Algorithm";
        public ICollection<SolvedProblem> SolvedProblems { get; set; }

    }
}
