$ErrorActionPreference = "Stop"
$BaseUrl = "http://127.0.0.1:5000"

Write-Host "--- 1. Testing Registration ---"
$RegisterBody = @{
    email    = "test@example.com"
    password = "password123"
    name     = "Test User"
} | ConvertTo-Json

try {
    $Response = Invoke-RestMethod -Uri "$BaseUrl/auth/register" -Method Post -Body $RegisterBody -ContentType "application/json"
    Write-Host "Registration Success: $($Response.msg)" -ForegroundColor Green
}
catch {
    Write-Host "Registration Failed: $_" -ForegroundColor Red
    # Continue if user already exists
}

Write-Host "`n--- 2. Testing Login ---"
$LoginBody = @{
    email    = "test@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $LoginResponse = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method Post -Body $LoginBody -ContentType "application/json"
    $Token = $LoginResponse.access_token
    Write-Host "Login Success. Token received." -ForegroundColor Green
}
catch {
    Write-Host "Login Failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n--- 3. Testing Protected Route (/me) ---"
$Headers = @{
    Authorization = "Bearer $Token"
}

try {
    $MeResponse = Invoke-RestMethod -Uri "$BaseUrl/auth/me" -Method Get -Headers $Headers
    Write-Host "Get /me Success: Hello, $($MeResponse.name)" -ForegroundColor Green
}
catch {
    Write-Host "Get /me Failed: $_" -ForegroundColor Red
}

Write-Host "`n--- 4. Testing Forgot Password ---"
$ForgotBody = @{
    email = "test@example.com"
} | ConvertTo-Json

try {
    $ForgotResponse = Invoke-RestMethod -Uri "$BaseUrl/auth/forgot-password" -Method Post -Body $ForgotBody -ContentType "application/json"
    Write-Host "Forgot Password Success: $($ForgotResponse.msg)" -ForegroundColor Green
}
catch {
    Write-Host "Forgot Password Failed: $_" -ForegroundColor Red
}

Write-Host "`n--- 5. Testing Reset Password ---"
$ResetBody = @{
    token    = "dummy-token"
    password = "newpassword123"
} | ConvertTo-Json

try {
    $ResetResponse = Invoke-RestMethod -Uri "$BaseUrl/auth/reset-password" -Method Post -Body $ResetBody -ContentType "application/json"
    Write-Host "Reset Password Success: $($ResetResponse.msg)" -ForegroundColor Green
}
catch {
    Write-Host "Reset Password Failed: $_" -ForegroundColor Red
}
