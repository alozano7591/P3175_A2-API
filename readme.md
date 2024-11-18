# PROG3175 Distributed Applications
## By Alfredo Lozano

This is the initial project setup for assignment 2 of this course.
The project goes over converting ASP.NET Core 8 API to Node.js with Express and SQLite Integration.

# Some pointers on getting a basic node api
These notes are made for myself so I don't forget what I did when I look back at this project later.

## Setup and checks
- Ensure that terminal is cmd and not powershell
- check that node installed `node --version`
- check that npm installed `npm --version`

## Initialize project
- Initialize node `npm init`
   - follow steps (defaults are fine)
- Install express `npm install express`


# End Points Documentation
- The base url for the api is: http://localhost:3000/api/

## GetAllTimesOfDay
- URL: http://localhost:3000/api/GetAllTimesOfDay

### Expected Response:
{
    "message": "success",
    "data": [
        {
            "timeOfDay": "afternoon"
        },
        {
            "timeOfDay": "evening"
        },
        {
            "timeOfDay": "morning"
        }
    ]
}

## GetSupportedLanguages
- URL: http://localhost:3000/api/GetSupportedLanguages

### Expected Response:
{
    "message": "success",
    "data": [
        {
            "language": "english"
        },
        {
            "language": "french"
        },
        {
            "language": "spanish"
        }
    ]
}

## greet
- URL: http://localhost:3000/api/greet

### Example Input:
{
    "timeOfDay" : "Morning",
    "language" : "english",
    "tone" : "casual"
}

### Example Response:
{
    "message": "success",
    "data": {
        "greetingMessage": "morning"
    }
}