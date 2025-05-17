using AlgoLearnAPI.Models;
using AlgoLearnAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace AlgoLearnAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TopicController : ControllerBase
    {
        private readonly TopicService _service;

        public TopicController(TopicService service)
        {
            _service = service;
        }

        [HttpGet]
        public IActionResult GetAll([FromQuery] string? type = null)
        {
            var allTopics = _service.GetTopics(); // առանց filter

            if (!string.IsNullOrWhiteSpace(type))
                allTopics = allTopics.Where(t => t.Type.Equals(type, StringComparison.OrdinalIgnoreCase)).ToList();

            return Ok(allTopics);
        }



        [HttpPost("{id}/hide")]
        public IActionResult Hide(int id)
        {
            if (!_service.HideTopic(id))
                return NotFound();
            return Ok();
        }

        [HttpPost("{id}/unhide")]
        public IActionResult Unhide(int id)
        {
            if (!_service.UnhideTopic(id))
                return NotFound();
            return Ok();
        }
    }
}
