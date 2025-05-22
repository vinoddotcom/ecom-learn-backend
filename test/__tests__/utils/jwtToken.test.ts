import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import sendToken from "../../../utils/jwtToken";

describe("JWT Token Utility", () => {
  // Create constant for test values
  const TEST_TOKEN = "test-jwt-token";
  const USER_ID = "user123";
  
  // Mock Express response and methods
  let res: any;
  let statusFn: any;
  let cookieFn: any;
  let jsonFn: any;
  
  // Mock user object
  let mockUser: any;
  
  beforeEach(() => {
    // Reset all mocks
    vi.resetAllMocks();
    
    // Create spy functions
    jsonFn = vi.fn();
    cookieFn = vi.fn(() => ({ json: jsonFn }));
    statusFn = vi.fn(() => ({ cookie: cookieFn }));
    
    // Create response object with chained methods
    res = {
      status: statusFn,
      cookie: cookieFn,
      json: jsonFn
    };
    
    // Mock user with working getJWTToken method
    mockUser = {
      _id: USER_ID,
      name: "Test User",
      email: "test@example.com",
      getJWTToken: vi.fn().mockReturnValue(TEST_TOKEN)
    };
    
    // Set environment variable
    vi.stubEnv('COOKIE_EXPIRE', '7');
  });
  
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("should call getJWTToken method on user", () => {
    sendToken(mockUser, 200, res);
    expect(mockUser.getJWTToken).toHaveBeenCalledTimes(1);
  });

  it("should set the status code provided in the parameters", () => {
    sendToken(mockUser, 201, res);
    expect(statusFn).toHaveBeenCalledWith(201);
  });

  it("should set a cookie with the token and correct options", () => {
    const dateSpy = vi.spyOn(Date, 'now').mockReturnValue(1000);
    
    sendToken(mockUser, 200, res);
    
    // Calculate expected expiry (7 days from now)
    const expectedExpiry = new Date(1000 + (7 * 24 * 60 * 60 * 1000));
    
    // Verify cookie was called with correct parameters
    expect(cookieFn).toHaveBeenCalledWith(
      "token", 
      TEST_TOKEN, 
      expect.objectContaining({
        expires: expectedExpiry,
        httpOnly: true
      })
    );
    
    dateSpy.mockRestore();
  });

  it("should fall back to 7 days if COOKIE_EXPIRE is not set", () => {
    vi.unstubAllEnvs(); // Remove all environment variables
    const dateSpy = vi.spyOn(Date, 'now').mockReturnValue(1000);
    
    sendToken(mockUser, 200, res);
    
    // Calculate expected expiry (7 days default)
    const expectedExpiry = new Date(1000 + (7 * 24 * 60 * 60 * 1000));
    
    expect(cookieFn).toHaveBeenCalledWith(
      "token",
      TEST_TOKEN,
      expect.objectContaining({
        expires: expectedExpiry
      })
    );
    
    dateSpy.mockRestore();
  });

  it("should return a JSON response with success flag, user data and token", () => {
    sendToken(mockUser, 200, res);
    
    expect(jsonFn).toHaveBeenCalledWith({
      success: true,
      user: mockUser,
      token: TEST_TOKEN
    });
  });

  it("should use the correct cookie expire value from env", () => {
    vi.unstubAllEnvs();
    vi.stubEnv('COOKIE_EXPIRE', '14');
    
    const dateSpy = vi.spyOn(Date, 'now').mockReturnValue(1000);
    
    sendToken(mockUser, 200, res);
    
    // Calculate expected expiry (14 days)
    const expectedExpiry = new Date(1000 + (14 * 24 * 60 * 60 * 1000));
    
    expect(cookieFn).toHaveBeenCalledWith(
      "token",
      TEST_TOKEN,
      expect.objectContaining({
        expires: expectedExpiry
      })
    );
    
    dateSpy.mockRestore();
  });
});