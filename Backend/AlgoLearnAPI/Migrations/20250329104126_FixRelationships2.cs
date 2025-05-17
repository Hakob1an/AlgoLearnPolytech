using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AlgoLearnAPI.Migrations
{
    /// <inheritdoc />
    public partial class FixRelationships2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "UserId1",
                table: "UserAchievements",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserAchievements_UserId1",
                table: "UserAchievements",
                column: "UserId1");

            migrationBuilder.AddForeignKey(
                name: "FK_UserAchievements_Users_UserId1",
                table: "UserAchievements",
                column: "UserId1",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserAchievements_Users_UserId1",
                table: "UserAchievements");

            migrationBuilder.DropIndex(
                name: "IX_UserAchievements_UserId1",
                table: "UserAchievements");

            migrationBuilder.DropColumn(
                name: "UserId1",
                table: "UserAchievements");
        }
    }
}
