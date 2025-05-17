using AlgoLearnAPI.Data;
using AlgoLearnAPI.Models;
using System.Collections.Generic;
using System.Linq;

namespace AlgoLearnAPI.Services
{
    public class SuggestionService
    {
        private readonly AppDbContext _context;

        public SuggestionService(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// This method retrieves a list of problem suggestions associated with a specific topic.
        /// </summary>
        /// <param name="topicName">The name of the topic to retrieve suggestions for.</param>
        /// <returns>
        /// A list of <see cref="Suggestion"/> objects related to the given topic.
        /// Returns an empty list if the topic does not exist or has no suggestions.
        /// </returns>
        public List<Suggestion> GetSuggestionsByTopic(string topicName)
        {
            var topic = _context.Topics.SingleOrDefault(t => t.Name == topicName);
            if (topic == null)
                return new List<Suggestion>();

            return _context.Suggestions
                .Where(s => s.TopicId == topic.Id)
                .ToList();
        }

        /// <summary>
        /// This method adds a new problem suggestion under a specific topic.
        /// If the topic does not exist, it will be created first.
        /// </summary>
        /// <param name="topicName">The name of the topic to associate the suggestion with.</param>
        /// <param name="problemName">The name of the suggested problem.</param>
        /// <param name="problemLink">A link to the problem statement or solution.</param>
        public void AddSuggestion(string topicName, string problemName, string problemLink)
        {
            var topic = _context.Topics.SingleOrDefault(t => t.Name == topicName);
            if (topic == null)
            {
                topic = new Topic { Name = topicName };
                _context.Topics.Add(topic);
                _context.SaveChanges();
            }

            var newSuggestion = new Suggestion
            {
                ProblemName = problemName,
                ProblemLink = problemLink,
                TopicId = topic.Id
            };

            _context.Suggestions.Add(newSuggestion);
            _context.SaveChanges();
        }
    }
}
