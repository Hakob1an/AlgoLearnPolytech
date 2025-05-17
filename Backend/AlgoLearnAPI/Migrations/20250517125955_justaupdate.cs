using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AlgoLearnAPI.Migrations
{
    /// <inheritdoc />
    public partial class justaupdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SolvedProblems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    SuggestionId = table.Column<int>(type: "int", nullable: false),
                    Difficulty = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SolvedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TopicId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SolvedProblems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SolvedProblems_Suggestions_SuggestionId",
                        column: x => x.SuggestionId,
                        principalTable: "Suggestions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SolvedProblems_Topics_TopicId",
                        column: x => x.TopicId,
                        principalTable: "Topics",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_SolvedProblems_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SolvedProblems_SuggestionId",
                table: "SolvedProblems",
                column: "SuggestionId");

            migrationBuilder.CreateIndex(
                name: "IX_SolvedProblems_TopicId",
                table: "SolvedProblems",
                column: "TopicId");

            migrationBuilder.CreateIndex(
                name: "IX_SolvedProblems_UserId",
                table: "SolvedProblems",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SolvedProblems");
        }
    }
}
