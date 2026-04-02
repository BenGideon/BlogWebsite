using BlogBackend.DTOs.Posts;

namespace BlogBackend.Services;

public interface IPostService
{
    Task<List<PostResponseDto>> GetAllAsync();
    Task<PostResponseDto?> GetByIdAsync(string id);
    Task<PostResponseDto> CreateAsync(CreatePostRequestDto request, string authorId);
    Task<PostResponseDto?> UpdateAsync(string id, UpdatePostRequestDto request);
    Task<bool> DeleteAsync(string id);
}
