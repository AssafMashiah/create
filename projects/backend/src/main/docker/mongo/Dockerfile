FROM mongo:3.3

RUN apt-get update  && \
    apt-get install -y netcat

RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

ADD scripts /scripts

RUN chmod +x /scripts/*.sh
RUN touch /scripts/first-run.sh

# Command to run
ENTRYPOINT ["/scripts/setup.sh"]
#CMD [""]
CMD ["mongod"]

EXPOSE 27017
