using System.Collections.Generic;

namespace AlgoLearnAPI.Services
{
    public class LearningService
    {
        public List<string> GetAlgorithms()
        {
            return new List<string> { "Sorting", "Searching", "Graph Traversal" };
        }

        public List<string> GetDataStructures()
        {
            return new List<string> { "Array", "Linked List", "Stack", "Queue" };
        }
    }
}
