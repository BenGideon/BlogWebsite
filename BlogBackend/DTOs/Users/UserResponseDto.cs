namespace BlogBackend.DTOs.Users;

public class UserResponseDto
{
    public string Id { get; set; } = string.Empty;

    public string Username { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Role { get; set; } = string.Empty;

    public UserProfileDto Profile { get; set; } = new();

    public DateTime CreatedAt { get; set; }
}
