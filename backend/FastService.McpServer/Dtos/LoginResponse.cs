namespace FastService.McpServer.Dtos;

public record LoginResponse(int UserId, string Login, string Email, string Nombre, string Apellido);
