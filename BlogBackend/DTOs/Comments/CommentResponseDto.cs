using BlogBackend.DTOs.Users;

namespace BlogBackend.DTOs.Comments;

public class CommentResponseDto
{
    public string Id { get; set; } = string.Empty;

    public string PostId { get; set; } = string.Empty;

    public string AuthorId { get; set; } = string.Empty;

    public UserSummaryDto? Author { get; set; }

    public string Content { get; set; } = string.Empty;

    public string? ParentId { get; set; }

    public DateTime CreatedAt { get; set; }
}
