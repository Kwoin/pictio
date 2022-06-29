FROM nginx

EXPOSE 80
EXPOSE 443

COPY pictio.conf /etc/nginx/sites-available/pictio.conf
RUN ln -s /etc/nginx/sites-available/pictio.conf /etc/nginx/sites-enabled/pictio.conf
