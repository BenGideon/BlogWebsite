using System.ComponentModel.DataAnnotations;

namespace BlogBackend.DTOs.Comments;

public class UpdateCommentRequestDto
{
    [Required]
    public string Content { get; set; } = string.Empty;
}
