FROM postgres
RUN mkdir -p /docker-entrypoint-initdb.d
ADD init.sql /docker-entrypoint-initdb.d/init.sql
RUN localedef -i fr_FR -c -f UTF-8 -A /usr/share/locale/locale.alias fr_FR.UTF-8

ENV LANG fr_FR.utf8
ENV POSTGRES_DB pictio
