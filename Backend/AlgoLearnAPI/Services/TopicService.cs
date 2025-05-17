using AlgoLearnAPI.Data;
using AlgoLearnAPI.Models;

namespace AlgoLearnAPI.Services
{
    public class TopicService
    {
        private readonly AppDbContext _context;

        public TopicService(AppDbContext context)
        {
            _context = context;
        }

        public IEnumerable<Topic> GetTopics(bool includeHidden = false)
        {
            if (includeHidden)
                return _context.Topics.ToList();
            else
                return _context.Topics.ToList();
        }

        public bool HideTopic(int id)
        {
            var topic = _context.Topics.FirstOrDefault(t => t.Id == id);
            if (topic == null) return false;

            topic.IsHidden = true;
            _context.SaveChanges();
            return true;
        }

        public bool UnhideTopic(int id)
        {
            var topic = _context.Topics.FirstOrDefault(t => t.Id == id);
            if (topic == null) return false;

            topic.IsHidden = false;
            _context.SaveChanges();
            return true;
        }
    }
}
