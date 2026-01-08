namespace FastService.McpServer.Tools
{
    public static class ToolHelpers
    {
        public static object CreateSuccessResponse(object data)
        {
            return new
            {
                success = true,
                data
            };
        }

        public static object CreateErrorResponse(string message, string? code = null)
        {
            return new
            {
                success = false,
                error = new
                {
                    message,
                    code
                }
            };
        }

        public static object CreateEmptyResponse(string message)
        {
            return new
            {
                success = true,
                message,
                data = Array.Empty<object>()
            };
        }
    }
}
