# Book My Ticket

Your goal is to build a simplified Book My Ticket platform where:

- Users can register
- Users can login
- Only authenticated users can access protected endpoints
- Logged-in users can book seats for a movie

For now, you can assume mock movie data and focus mainly on authentication and seat booking logic. Frontend is optional.

## Rules & Guidelines

- Starter source code must be used as the base
- Do not remove or break existing endpoints
- Add authentication layer on top of the current system
- Implement register and login functionality
- Protect booking related endpoints using auth middleware
- Only logged-in users should be allowed to book seats
- Prevent duplicate seat bookings
- Associate bookings with logged-in users
- Keep movie data mocked for now

## FAQ

**Q: What authentication method should we use?**  
You should implement token-based authentication. JWT is recommended.

**Q: Can we modify existing endpoints?**  
You should not remove or break existing endpoints. You are expected to extend the project cleanly by adding authentication and protected flows.

**Q: Can we add new endpoints if required?**  
Yes. You can add new endpoints for authentication and booking features as needed.

**Q: Do we need to connect real movie db?**  
No. You can use mock movie data for this assignment.

**Q: What booking functionality is expected?**  
Authenticated users should be able to:
- view available seats
- book seats
- avoid duplicate bookings
- associate bookings with their user account

