@echo off
echo Testing local auth setup...
curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d "{\"full_name\":\"Test\",\"email\":\"test@@example.com\",\"password\":\"pass123\",\"role\":\"patient\"}"
echo.
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"test@@example.com\",\"password\":\"pass123\"}"
pause
