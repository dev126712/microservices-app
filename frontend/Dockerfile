FROM nginx:alpine

# Install curl for health check support

COPY . /usr/share/nginx/html/ 
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Add healthcheck for Nginx itself


EXPOSE 80