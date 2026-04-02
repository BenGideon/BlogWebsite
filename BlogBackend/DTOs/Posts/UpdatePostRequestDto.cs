using System.ComponentModel.DataAnnotations;

namespace BlogBackend.DTOs.Posts;

public class UpdatePostRequestDto
{
    [Required]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Content { get; set; } = string.Empty;

    [Required]
    public string AuthorId { get; set; } = string.Empty;

    public string? FeaturedImage { get; set; }
}
