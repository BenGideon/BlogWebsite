using BlogBackend.DTOs.Users;

namespace BlogBackend.Services;

public interface IUserService
{
    Task<List<UserResponseDto>> GetAllAsync();
    Task<UserResponseDto?> GetByIdAsync(string id);
    Task<UserResponseDto> CreateAsync(CreateUserRequestDto request);
    Task<UserResponseDto?> UpdateAsync(string id, UpdateUserRequestDto request);
    Task<bool> DeleteAsync(string id);
}
