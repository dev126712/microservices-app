FROM nginx:alpine
# Everything MUST be on one line
COPY . /usr/share/nginx/html/ 
# Copy the config
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
