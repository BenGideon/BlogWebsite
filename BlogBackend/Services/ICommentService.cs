using BlogBackend.DTOs.Comments;

namespace BlogBackend.Services;

public interface ICommentService
{
    Task<List<CommentResponseDto>> GetAllAsync();
    Task<CommentResponseDto?> GetByIdAsync(string id);
    Task<CommentResponseDto> CreateAsync(CreateCommentRequestDto request);
    Task<CommentResponseDto?> UpdateAsync(string id, UpdateCommentRequestDto request);
    Task<bool> DeleteAsync(string id);
}
