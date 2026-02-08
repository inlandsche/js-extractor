# Stage 1: Build
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Build the project (outputs to /dist)
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create the subdirectory for the subpath
RUN mkdir -p /usr/share/nginx/html/jstool

# Copy build artifacts to the subdirectory
COPY --from=build /app/dist /usr/share/nginx/html/jstool

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
