# API Gateway Service

## Overview

The **API Gateway** serves as a centralized entry point that routes requests to various backend services, such as the IAM service. It acts as an intermediary, handling authentication, error management, and forwarding requests to the appropriate services.

## Benefits of Using an API Gateway

Using an API Gateway in a microservices architecture provides several advantages:

1. **Centralized Authentication & Authorization** - Ensures consistent authentication and authorization across all service requests.
2. **Security Enforcement** - Acts as a security layer by restricting access and preventing unauthorized requests.
3. **Simplified Client Communication** - Clients interact with a single endpoint rather than multiple services.
4. **Rate Limiting & Throttling** - Helps manage traffic loads and prevent overuse of backend resources.
5. **Service Abstraction** - Hides the complexities of backend services from clients.
6. **Error Handling & Logging** - Provides a unified mechanism for error management and logging.
7. **Load Balancing & Resilience** - Ensures requests are efficiently distributed and improves system robustness.

## Routes

The API Gateway includes routes that proxy requests to backend services while applying necessary middleware for security and error handling.

## Controller Logic

The `GatewayController` class is responsible for proxying requests to the services. It ensures the target request URL is dynamically constructed based on incoming requests and includes essential error handling mechanisms.

### Key Features:

- **Request Forwarding:** Proxies API calls to the IAM service.
- **Error Handling:** Differentiates between various failure scenarios and provides meaningful error messages.
- **Timeout Handling:** Ensures service requests do not hang indefinitely.
- **Header Forwarding:** Maintains original request headers when forwarding.

## Installation & Setup

To set up the API Gateway locally:

1. **Clone the repository**:

   ```bash
   git clone git@github.com:dperkosan/gateway.git
   cd gateway
   ```

2. **Set up environment variables: Copy .env.example into .env**:

   ```bash
   cp .env.example .env
   ```

3. **Install javascript dependencies**:

   ```bash
   npm install
   ```

4. **Run the development server**:

   ```bash
   npm run dev
   ```

## Conclusion

The API Gateway simplifies communication between clients and backend services, providing security, efficiency, and reliability. It ensures that requests to the IAM service are properly authenticated, proxied, and error-handled.
