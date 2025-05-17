using Microsoft.EntityFrameworkCore;
using AlgoLearnAPI.Models;

namespace AlgoLearnAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<UserCompletion> UserCompletions { get; set; }
        public DbSet<Progress> Progresses { get; set; }
        public DbSet<Suggestion> Suggestions { get; set; }
        public DbSet<Topic> Topics { get; set; }
        public DbSet<Achievement> Achievements { get; set; }
        public DbSet<UserAchievement> UserAchievements { get; set; }
        public DbSet<Quiz> Quizzes { get; set; }
        public DbSet<QuizQuestion> QuizQuestions { get; set; }
        public DbSet<QuizResult> QuizResults { get; set; }
        public DbSet<QuizAnswer> QuizAnswers { get; set; }
        public DbSet<Feedback> Feedbacks { get; set; }
        public DbSet<SolvedProblem> SolvedProblems { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<UserAchievement>()
                .HasOne(ua => ua.Achievement)
                .WithMany()
                .HasForeignKey(ua => ua.AchievementId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Suggestion>()
                .HasOne(s => s.Topic)
                .WithMany()
                .HasForeignKey(s => s.TopicId)
                .OnDelete(DeleteBehavior.Cascade);


            // For Progress -> Users
            modelBuilder.Entity<Progress>()
                .HasOne(p => p.User)
                .WithMany(u => u.Progresses)
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // For UserCompletions -> Users
            modelBuilder.Entity<UserCompletion>()
                .HasOne(uc => uc.User)
                .WithMany(u => u.UserCompletions)
                .HasForeignKey(uc => uc.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserAchievement>()
                .HasOne(ua => ua.User)
                .WithMany(u => u.UserAchievements)
                .HasForeignKey(ua => ua.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<User>()
            .HasMany(u => u.UserAchievements)
            .WithOne(ua => ua.User)
            .HasForeignKey(ua => ua.UserId)
            .OnDelete(DeleteBehavior.Cascade);


            modelBuilder.Entity<QuizAnswer>()
                .HasOne(a => a.QuizResult)
                .WithMany(r => r.QuizAnswers)
                .HasForeignKey(a => a.QuizResultId)
                .OnDelete(DeleteBehavior.Cascade);

            // QuizAnswer -> QuizQuestion (Restrict delete to avoid multiple cascade paths)
            modelBuilder.Entity<QuizAnswer>()
                .HasOne(a => a.QuizQuestion)
                .WithMany()
                .HasForeignKey(a => a.QuizQuestionId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<User>().ToTable("Users");
            modelBuilder.Entity<Progress>().ToTable("Progresses");
            modelBuilder.Entity<Achievement>().ToTable("Achievements");
            modelBuilder.Entity<UserAchievement>().ToTable("UserAchievements");
            modelBuilder.Entity<Topic>().ToTable("Topics");
            modelBuilder.Entity<Suggestion>().ToTable("Suggestions");
        }
        
    }
}
