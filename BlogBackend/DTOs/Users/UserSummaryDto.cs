namespace BlogBackend.DTOs.Users;

public class UserSummaryDto
{
    public string Id { get; set; } = string.Empty;

    public string Username { get; set; } = string.Empty;

    public string? DisplayName { get; set; }
}
