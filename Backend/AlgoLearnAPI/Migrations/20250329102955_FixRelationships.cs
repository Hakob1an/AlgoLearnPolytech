using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AlgoLearnAPI.Migrations
{
    /// <inheritdoc />
    public partial class FixRelationships : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Progresses_Users_UserId",
                table: "Progresses");

            migrationBuilder.AddForeignKey(
                name: "FK_Progresses_Users_UserId",
                table: "Progresses",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Progresses_Users_UserId",
                table: "Progresses");

            migrationBuilder.AddForeignKey(
                name: "FK_Progresses_Users_UserId",
                table: "Progresses",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");
        }
    }
}
