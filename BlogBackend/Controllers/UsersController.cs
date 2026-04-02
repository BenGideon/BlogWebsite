using BlogBackend.DTOs.Users;
using BlogBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BlogBackend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [Authorize(Roles = "admin")]
    [HttpGet]
    public async Task<ActionResult<List<UserResponseDto>>> GetUsers()
    {
        var users = await _userService.GetAllAsync();
        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserResponseDto>> GetUserById(string id)
    {
        if (!CanAccessUser(id))
        {
            return Forbid();
        }

        var user = await _userService.GetByIdAsync(id);

        if (user is null)
        {
            return NotFound();
        }

        return Ok(user);
    }

    [Authorize(Roles = "admin")]
    [HttpPost]
    public async Task<ActionResult<UserResponseDto>> CreateUser(CreateUserRequestDto request)
    {
        var user = await _userService.CreateAsync(request);
        return CreatedAtAction(nameof(GetUserById), new { id = user.Id }, user);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<UserResponseDto>> UpdateUser(string id, UpdateUserRequestDto request)
    {
        if (!CanAccessUser(id))
        {
            return Forbid();
        }

        var updatedUser = await _userService.UpdateAsync(id, request);

        if (updatedUser is null)
        {
            return NotFound();
        }

        return Ok(updatedUser);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        if (!CanAccessUser(id))
        {
            return Forbid();
        }

        var deleted = await _userService.DeleteAsync(id);

        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }

    private bool CanAccessUser(string userId)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        return currentUserId is not null &&
               (currentUserId == userId || User.IsInRole("admin"));
    }
}
