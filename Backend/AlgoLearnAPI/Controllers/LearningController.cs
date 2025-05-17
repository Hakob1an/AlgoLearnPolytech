using Microsoft.AspNetCore.Mvc;
using AlgoLearnAPI.Services;

namespace AlgoLearnAPI.Controllers
{
    [ApiController]
    [Route("api/learning")]
    public class LearningController : ControllerBase
    {
        private readonly LearningService _learningService;

        public LearningController()
        {
            _learningService = new LearningService();
        }

        /// <summary>
        /// This endpoint is for retrieving all available algorithms.
        /// </summary>
        /// <returns>
        /// Returns 200 OK response alongside with available algorithms.
        /// </returns>
        [HttpGet("algorithms")]
        public IActionResult GetAlgorithms()
        {
            return Ok(_learningService.GetAlgorithms());
        }

        /// <summary>
        /// This endpoint is for retrieving all available data structures.
        /// </summary>
        /// <returns>
        /// Returns 200 OK response alongside with available data structures.
        /// </returns>
        [HttpGet("datastructures")]
        public IActionResult GetDataStructures()
        {
            return Ok(_learningService.GetDataStructures());
        }
    }
}
