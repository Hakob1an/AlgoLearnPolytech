using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

public class AdminOnlyAttribute : Attribute, IAuthorizationFilter
{
    public void OnAuthorization(AuthorizationFilterContext context)
    {
        var isAdminHeader = context.HttpContext.Request.Headers["X-Is-Admin"].FirstOrDefault();

        if (string.IsNullOrEmpty(isAdminHeader) || isAdminHeader != "true")
        {
            context.Result = new UnauthorizedResult();
        }
    }
}


