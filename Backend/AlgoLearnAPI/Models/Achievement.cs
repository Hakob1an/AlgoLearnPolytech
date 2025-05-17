using System.ComponentModel.DataAnnotations;

namespace AlgoLearnAPI.Models
{
    public class Achievement
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        public string? Icon { get; set; }
    }
}
