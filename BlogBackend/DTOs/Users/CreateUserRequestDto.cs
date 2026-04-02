using System.ComponentModel.DataAnnotations;

namespace BlogBackend.DTOs.Users;

public class CreateUserRequestDto
{
    [Required]
    public string Username { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;

    public string Role { get; set; } = "user";

    public UserProfileDto Profile { get; set; } = new();
}
