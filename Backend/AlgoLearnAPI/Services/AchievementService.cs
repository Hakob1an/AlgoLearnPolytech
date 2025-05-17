using AlgoLearnAPI.Data;
using AlgoLearnAPI.Models;
using System.Collections.Generic;
using System.Linq;

namespace AlgoLearnAPI.Services
{
    public class AchievementService
    {
        private readonly AppDbContext _context;

        public AchievementService(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// This method retrieves the list of achievements earned by a specific user.
        /// </summary>
        /// <param name="userId">The unique identifier of user</param>
        /// <returns>
        /// Returns the list of achievements.
        /// </returns>
        public List<Achievement> GetUserAchievements(int userId)
        {
            return _context.UserAchievements
                .Where(ua => ua.UserId == userId)
                .Select(ua => ua.Achievement)
                .ToList();
        }

        /// <summary>
        /// This method is responsible for checking if user has achievements earned.
        /// </summary>
        /// <param name="userId">The unique identifier of user</param>
        /// <param name="achievementId">The unique identifier of achievement</param>
        /// <returns>
        /// Return true if user has at least one achievement, otherwise returns false.
        /// </returns>
        public bool HasAchievement(int userId, int achievementId)
        {
            return _context.UserAchievements
                .Any(ua => ua.UserId == userId && ua.AchievementId == achievementId);
        }

        /// <summary>
        /// This method is responsible for unlocking an achievement for user.
        /// </summary>
        /// <param name="userId">The unique identifier of user</param>
        /// <param name="achievementId">The unique identifier of achievement</param>
        /// <returns>
        /// Returns false if user already has the achievement.
        /// Returns true if achievement is successfully added and DB is updated.
        /// </returns>
        public bool UnlockAchievement(int userId, int achievementId)
        {
            if (HasAchievement(userId, achievementId)) return false; 

            var newAchievement = new UserAchievement
            {
                UserId = userId,
                AchievementId = achievementId
            };

            _context.UserAchievements.Add(newAchievement);
            _context.SaveChanges();
            return true;
        }
    }
}
