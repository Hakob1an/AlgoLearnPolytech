using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AlgoLearnAPI.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSuggestionsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Difficulty",
                table: "Suggestions",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Difficulty",
                table: "Suggestions");
        }
    }
}
