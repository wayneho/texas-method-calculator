# texas-method-calculator

The Texas Method is a strength training program that manipulates the individual’s training variables (volume and intensity) to increase gains on a weekly basis. This app generates next week’s training numbers depending on the user’s difficulty in the previous week and graphs each week’s five rep max to show strength progression.

#Api

| URL                             | HTTP Verb     | Functionality                  |
| -------------                   |:-------------:| -----:                         |
|/register                        | POST          | Registering new user           |
|/login                           | POST          | Logging in                     |
|/logout                          | GET           | Logging out                    |
|/users/:username                 | GET           | Fetch current week number      |
|/users/:username                 | PUT           | Set current week number        |
|/users/:username                 | POST          | Create new week                |
|/users/:username/:weekNumber     | GET           | Fetch weekNumber data of user  |
|/users/:username/:weekNumber     | PUT           | Modify weekNumber data of user |
|/users/:username/:weekNumber     | DELETE        | Delete weekNumber data of user |
