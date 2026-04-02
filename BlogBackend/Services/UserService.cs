using BlogBackend.Data;
using BlogBackend.DTOs.Users;
using BlogBackend.Models;
using Microsoft.AspNetCore.Identity;
using MongoDB.Driver;

namespace BlogBackend.Services;

public class UserService : IUserService
{
    private readonly MongoDbContext _dbContext;
    private readonly IPasswordHasher<User> _passwordHasher;

    public UserService(MongoDbContext dbContext, IPasswordHasher<User> passwordHasher)
    {
        _dbContext = dbContext;
        _passwordHasher = passwordHasher;
    }

    public async Task<List<UserResponseDto>> GetAllAsync()
    {
        var users = await _dbContext.Users
            .Find(_ => true)
            .SortByDescending(user => user.CreatedAt)
            .ToListAsync();

        return users.Select(MapToResponse).ToList();
    }

    public async Task<UserResponseDto?> GetByIdAsync(string id)
    {
        var user = await _dbContext.Users
            .Find(user => user.Id == id)
            .FirstOrDefaultAsync();

        return user is null ? null : MapToResponse(user);
    }

    public async Task<UserResponseDto> CreateAsync(CreateUserRequestDto request)
    {
        var user = new User
        {
            Username = request.Username,
            Email = request.Email,
            Role = request.Role,
            Profile = MapProfile(request.Profile),
            CreatedAt = DateTime.UtcNow
        };

        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

        await _dbContext.Users.InsertOneAsync(user);

        return MapToResponse(user);
    }

    public async Task<UserResponseDto?> UpdateAsync(string id, UpdateUserRequestDto request)
    {
        var existingUser = await _dbContext.Users
            .Find(user => user.Id == id)
            .FirstOrDefaultAsync();

        if (existingUser is null)
        {
            return null;
        }

        existingUser.Username = request.Username;
        existingUser.Email = request.Email;
        existingUser.Role = request.Role;
        existingUser.Profile = MapProfile(request.Profile);

        await _dbContext.Users.ReplaceOneAsync(user => user.Id == id, existingUser);

        return MapToResponse(existingUser);
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _dbContext.Users.DeleteOneAsync(user => user.Id == id);
        return result.DeletedCount > 0;
    }

    private static UserProfile MapProfile(UserProfileDto profile)
    {
        return new UserProfile
        {
            FirstName = profile.FirstName,
            LastName = profile.LastName,
            Bio = profile.Bio
        };
    }

    private static UserResponseDto MapToResponse(User user)
    {
        return new UserResponseDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            Role = user.Role,
            CreatedAt = user.CreatedAt,
            Profile = new UserProfileDto
            {
                FirstName = user.Profile.FirstName,
                LastName = user.Profile.LastName,
                Bio = user.Profile.Bio
            }
        };
    }
}
