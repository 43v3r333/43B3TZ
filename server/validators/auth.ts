import { ValidationResult, ValidationError, validateEmail } from "./base";

export interface RegisterPayload {
  email: string;
  password: string;
  role?: "Admin" | "Analyst" | "Researcher" | "User" | "Guest" | "admin" | "trader";
}

export interface LoginPayload {
  email: string;
  password: string;
}

export class AuthValidator {
  public static validateRegister(body: any): ValidationResult<RegisterPayload> {
    const errors: ValidationError[] = [];

    if (!body) {
      return { success: false, errors: [{ field: "body", message: "Request body is required" }] };
    }

    if (!body.email) {
      errors.push({ field: "email", message: "Email is required" });
    } else if (!validateEmail(body.email)) {
      errors.push({ field: "email", message: "Invalid email format" });
    }

    if (!body.password) {
      errors.push({ field: "password", message: "Password is required" });
    } else if (body.password.length < 8) {
      errors.push({ field: "password", message: "Password must be at least 8 characters long" });
    }

    const validRoles = ["Admin", "Analyst", "Researcher", "User", "Guest", "admin", "trader"];
    if (body.role && !validRoles.includes(body.role)) {
      errors.push({ field: "role", message: `Invalid role selected. Must be one of: ${validRoles.join(", ")}` });
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return {
      success: true,
      data: {
        email: body.email.trim().toLowerCase(),
        password: body.password,
        role: body.role
      }
    };
  }

  public static validateLogin(body: any): ValidationResult<LoginPayload> {
    const errors: ValidationError[] = [];

    if (!body) {
      return { success: false, errors: [{ field: "body", message: "Request body is required" }] };
    }

    if (!body.email) {
      errors.push({ field: "email", message: "Email is required" });
    } else if (!validateEmail(body.email)) {
      errors.push({ field: "email", message: "Invalid email format" });
    }

    if (!body.password) {
      errors.push({ field: "password", message: "Password is required" });
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return {
      success: true,
      data: {
        email: body.email.trim().toLowerCase(),
        password: body.password
      }
    };
  }
}
