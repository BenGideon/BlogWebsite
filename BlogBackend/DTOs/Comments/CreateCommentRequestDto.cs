using System.ComponentModel.DataAnnotations;

namespace BlogBackend.DTOs.Comments;

public class CreateCommentRequestDto
{
    [Required]
    public string PostId { get; set; } = string.Empty;

    [Required]
    public string AuthorId { get; set; } = string.Empty;

    [Required]
    public string Content { get; set; } = string.Empty;

    public string? ParentId { get; set; }
}
